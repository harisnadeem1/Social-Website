const {fetchUserConversations} = require('../models/conversationModel');

exports.getMyConversations = async (req, res) => {
  try {
    const userId = req.user.id;
    const conversations = await fetchUserConversations(userId);
    res.status(200).json({ conversations });
  } catch (error) {
    console.error('[UserConversations]', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
