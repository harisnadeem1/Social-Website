// controllers/chatterController.js
const ChatterModel = require('../models/chatterModel');

const getActiveConversations = async (req, res) => {
  try {
    const chatterId = req.user.id; // pulled from JWT middleware
    const conversations = await ChatterModel.getAllActiveConversations(chatterId);

    res.status(200).json({ conversations });
  } catch (error) {
    console.error('Error fetching conversations:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const getMessagesForConversation = async (req, res) => {
  const conversationId = req.params.id;

  console.log(conversationId);

  try {
    const messages = await ChatterModel.getMessagesByConversationId(conversationId);
    res.json(messages);
  } catch (err) {
    console.error('Error fetching messages:', err);
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
};


const sendMessageAsGirl = async (req, res) => {
  const conversationId = req.params.id;
  const { girlId, content } = req.body;

  try {
    // Save message via model
    const message = await ChatterModel.sendMessageFromGirl(conversationId, girlId, content);

    // ✅ Emit real-time update to the room
   if (global.io) {
      global.io.to(`chat-${conversationId}`).emit("receive_message", {
        id: message.id,
        text: message.content,
        senderId: girlId,
        timestamp: message.sent_at,
      });
    }

    res.status(201).json({ message });
  } catch (err) {
    console.error('Error sending message:', err);
    res.status(500).json({ error: 'Failed to send message' });
  }
};




const getWinks = async (req, res) => {
  try {
    const winks = await ChatterModel.getAllWinks();
    res.json(winks);
  } catch (err) {
    console.error("Failed to fetch winks:", err);
    res.status(500).json({ error: "Failed to fetch winks" });
  }
};


module.exports = {getActiveConversations,getMessagesForConversation, sendMessageAsGirl,getWinks}
