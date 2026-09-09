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
