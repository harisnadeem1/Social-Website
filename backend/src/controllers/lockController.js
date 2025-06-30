const db = require('../config/db');

// import {lockConversation,unlockConversation,getLockStatus} from '../models/conversationModel';
const lockModel = require("../models/conversationModel");

const lockChat = async (req, res) => {
  const { id } = req.params;
  const chatterId = req.user.id;

  try {
    const result = await lockModel.lockConversation(id, chatterId);
    if (!result) return res.status(409).json({ message: 'Chat is already locked by another chatter' });
    res.json({ message: 'Chat locked', conversation: result });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error locking chat' });
  }
};

const unlockChat = async (req, res) => {
  const { id } = req.params;
  const chatterId = req.user.id;

  try {
    const result = await lockModel.unlockConversation(id, chatterId);
    if (!result) return res.status(403).json({ message: 'You cannot unlock this chat' });
    res.json({ message: 'Chat unlocked', conversation: result });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error unlocking chat' });
  }
};

const checkLock = async (req, res) => {
  try {
    const conversationId = req.params.id;
    const result = await lockModel.getLockStatus(conversationId);
    return res.status(result.status).json(result.data);
  } catch (err) {
    console.error('Error checking lock status:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

module.exports = {
 checkLock, unlockChat,lockChat
};
