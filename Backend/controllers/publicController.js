// backend/controllers/publicController.js
import { dataStore } from '../src/services/dataStore.js';

export const getPublicNotifications = async (req, res) => {
  try {
    const notifications = await dataStore.getNotifications();
    return res.status(200).json({
      success: true,
      notifications
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const saveEnquiry = async (req, res) => {
  try {
    const { Name, EmailId, MobileNo, Message } = req.body;
    if (!Name || !EmailId || !Message) {
      return res.status(400).json({
        success: false,
        message: 'Name, EmailId, and Message are required fields.'
      });
    }

    const enquiry = await dataStore.createEnquiry({
      name: Name,
      email: EmailId,
      mobileNo: MobileNo || '',
      message: Message
    });

    return res.status(201).json({
      success: true,
      message: 'Enquiry saved successfully.',
      enquiry
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
