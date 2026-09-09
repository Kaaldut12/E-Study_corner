// backend/controllers/leaveController.js
import { dataStore } from '../src/services/dataStore.js';

export const applyForLeave = async (req, res) => {
  try {
    const userId = req.user.id;
    const userName = req.user.name;
    const userEmail = req.user.email;
    const userRole = req.user.role;
    const { leaveType, startDate, endDate, totalDays, reason } = req.body;

    if (!startDate || !endDate || !reason) {
      return res.status(400).json({
        success: false,
        message: 'Start date, end date, and reason are required.'
      });
    }

    const leave = await dataStore.applyLeave({
      userId,
      userName,
      userEmail,
      userRole,
      leaveType: leaveType || 'casual',
      startDate,
      endDate,
      totalDays: Number(totalDays) || 1,
      reason: reason.trim()
    });

    return res.status(201).json({
      success: true,
      message: 'Leave application submitted successfully. Awaiting administrative review.',
      leave
    });
  } catch (error) {
    console.error('applyForLeave error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getMyLeaves = async (req, res) => {
  try {
    const userId = req.user.id;
    const leaves = await dataStore.getUserLeaves(userId);

    return res.status(200).json({
      success: true,
      leaves
    });
  } catch (error) {
    console.error('getMyLeaves error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getAllLeaves = async (req, res) => {
  try {
    const { status, role } = req.query;
    const leaves = await dataStore.getAllLeaves({ status, role });

    return res.status(200).json({
      success: true,
      leaves
    });
  } catch (error) {
    console.error('getAllLeaves error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const updateLeaveStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, reviewerNotes } = req.body;
    const reviewerName = req.user.name || 'Admin Evaluator';

    if (!['approved', 'rejected', 'pending'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Status must be approved, rejected, or pending.'
      });
    }

    const updated = await dataStore.updateLeaveStatus(id, status, reviewerName, reviewerNotes);
    if (!updated) {
      return res.status(404).json({
        success: false,
        message: 'Leave application not found.'
      });
    }

    return res.status(200).json({
      success: true,
      message: `Leave application status has been updated to ${status}.`,
      leave: updated
    });
  } catch (error) {
    console.error('updateLeaveStatus error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};
