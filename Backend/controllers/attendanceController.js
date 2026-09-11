// backend/controllers/attendanceController.js
import { dataStore } from '../src/services/dataStore.js';

export const checkInAttendance = async (req, res) => {
  try {
    const userId = req.user.id;
    const userName = req.user.name;
    const userRole = req.user.role;
    const { notes } = req.body || {};

    const record = await dataStore.markAttendance({
      userId,
      userName,
      userRole,
      notes: notes || 'Daily dashboard check-in'
    });

    const stats = await dataStore.getUserAttendanceStats(userId);

    return res.status(200).json({
      success: true,
      alreadyMarked: record.alreadyMarked,
      message: record.alreadyMarked
        ? `Attendance already recorded for today (${record.checkInTime}).`
        : `Successfully checked in as Present at ${record.checkInTime}!`,
      attendance: record,
      stats
    });
  } catch (error) {
    console.error('checkInAttendance error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getAttendanceStatus = async (req, res) => {
  try {
    const userId = req.user.id;
    const stats = await dataStore.getUserAttendanceStats(userId);

    return res.status(200).json({
      success: true,
      stats
    });
  } catch (error) {
    console.error('getAttendanceStatus error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getAllAttendance = async (req, res) => {
  try {
    const { date, role } = req.query;
    const records = await dataStore.getAllAttendanceRecords(date, role);

    return res.status(200).json({
      success: true,
      records
    });
  } catch (error) {
    console.error('getAllAttendance error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const markStudentAttendance = async (req, res) => {
  try {
    const { studentId, date, status, notes } = req.body;
    const markedBy = req.user.name || req.user.role;

    if (!studentId) {
      return res.status(400).json({ success: false, message: 'Student ID is required.' });
    }

    const record = await dataStore.markStudentAttendanceOverride({
      studentId,
      date,
      status: status || 'present',
      notes,
      markedBy
    });

    if (!record) {
      return res.status(404).json({ success: false, message: 'Student not found.' });
    }

    const stats = await dataStore.getUserAttendanceStats(studentId);

    return res.status(200).json({
      success: true,
      message: `Student attendance has been recorded as ${status || 'present'}.`,
      record,
      stats
    });
  } catch (error) {
    console.error('markStudentAttendance error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getStudentAttendance = async (req, res) => {
  try {
    const { studentId } = req.params;
    const stats = await dataStore.getUserAttendanceStats(studentId);
    return res.status(200).json({ success: true, stats });
  } catch (error) {
    console.error('getStudentAttendance error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getRosterAttendance = async (req, res) => {
  try {
    const targetDate = req.query.date || new Date().toISOString().split('T')[0];
    const { course, role } = req.query;

    const allUsers = await dataStore.getUsers();
    let targetUsers = allUsers.filter(u => u.role === (role || 'student'));
    if (course && course !== 'all') {
      targetUsers = targetUsers.filter(u => u.course === course);
    }

    const attendanceRecords = await dataStore.getAllAttendanceRecords(targetDate, role || 'student');
    const recordsByUserId = new Map(attendanceRecords.map(r => [r.userId, r]));

    // Check approved leaves for this target date
    const leaves = await dataStore.getAllLeaves({ status: 'approved', role: role || 'student' });
    const onLeaveMap = new Map();
    for (const l of leaves) {
      if (targetDate >= l.startDate && targetDate <= l.endDate) {
        onLeaveMap.set(l.userId, l);
      }
    }

    const roster = targetUsers.map(u => {
      const att = recordsByUserId.get(u.id);
      let status = 'unmarked';
      let checkInTime = null;
      let notes = '';

      if (att) {
        status = att.status;
        checkInTime = att.checkInTime;
        notes = att.notes || '';
      } else if (onLeaveMap.has(u.id)) {
        const lv = onLeaveMap.get(u.id);
        status = 'on_leave';
        checkInTime = 'Official Exemption';
        notes = `Approved ${lv.leaveType} leave: "${lv.reason}"`;
      }

      return {
        id: u.id,
        name: u.name,
        email: u.email,
        role: u.role,
        course: u.course || 'Computer Science & Engineering',
        courseYear: u.courseYear || '1st Year',
        status,
        checkInTime,
        notes
      };
    });

    return res.status(200).json({
      success: true,
      date: targetDate,
      totalCount: roster.length,
      presentCount: roster.filter(r => r.status === 'present').length,
      lateCount: roster.filter(r => r.status === 'late').length,
      onLeaveCount: roster.filter(r => r.status === 'on_leave').length,
      absentCount: roster.filter(r => r.status === 'absent').length,
      unmarkedCount: roster.filter(r => r.status === 'unmarked').length,
      roster
    });
  } catch (error) {
    console.error('getRosterAttendance error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const markBatchAttendance = async (req, res) => {
  try {
    const { records, date } = req.body;
    const markedBy = req.user.name || req.user.role;

    if (!Array.isArray(records) || records.length === 0) {
      return res.status(400).json({ success: false, message: 'Records array is required.' });
    }

    const results = [];
    for (const item of records) {
      const rec = await dataStore.markStudentAttendanceOverride({
        studentId: item.studentId,
        date: date || item.date,
        status: item.status || 'present',
        notes: item.notes,
        markedBy
      });
      if (rec) results.push(rec);
    }

    return res.status(200).json({
      success: true,
      message: `Batch attendance successfully updated for ${results.length} student(s).`,
      count: results.length
    });
  } catch (error) {
    console.error('markBatchAttendance error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

