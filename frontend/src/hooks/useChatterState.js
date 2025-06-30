import { useState, useEffect, useContext, useCallback, useMemo } from 'react';
import AuthContext from '@/contexts/AuthContext.js';
import { useToast } from '@/components/ui/use-toast.js';
import axios from 'axios';
import { lockChat, unlockChat, checkLockStatus } from '../api/chatLock';

const girlProfilesData = [
  { id: 'girl001', name: 'Emma Wilson', avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face' },
  { id: 'girl002', name: 'Sofia Rodriguez', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face' },
  { id: 'girl003', name: 'Isabella Martinez', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=face' },
  { id: 'girl004', name: 'Olivia Chen', avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&h=150&fit=crop&crop=face' }
];

const allUsersData = [
  { id: 'user001', name: 'Alex Johnson', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face' },
  { id: 'user002', name: 'Ben Miller', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face' },
  { id: 'user003', name: 'Chris Davis', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face' },
  { id: 'user004', name: 'David Wilson', avatar: 'https://images.unsplash.com/photo-1519345182560-3f2917c472ef?w=150&h=150&fit=crop&crop=face' }
];

const now = Date.now();
const initialConversations = [
  { id: 1, participants: { user: allUsersData[0], girl: girlProfilesData[0] }, lastMessage: 'Hey! How was your day? 😊', timestamp: '2 min ago', unread: 2, online: true, lastActivity: now - 120000, hasWinked: true, messages: [{ id: 1, text: 'Hi there!', senderId: 'girl001', timestamp: '10:30 AM' }, { id: 2, text: 'Hey! How was your day? 😊', senderId: 'user001', timestamp: '10:32 AM' }], locked_by: null, lock_time: null },
  { id: 2, participants: { user: allUsersData[1], girl: girlProfilesData[1] }, lastMessage: 'Would love to grab coffee!', timestamp: '1 hour ago', unread: 0, online: false, lastActivity: now - 3600000, hasWinked: false, messages: [{ id: 3, text: 'Would love to grab coffee!', senderId: 'user002', timestamp: '9:30 AM' }], locked_by: null, lock_time: null },
  { id: 3, participants: { user: allUsersData[2], girl: girlProfilesData[0] }, lastMessage: 'You look amazing!', timestamp: '3 hours ago', unread: 1, online: true, lastActivity: now - 10800000, hasWinked: true, messages: [{ id: 4, text: 'You look amazing!', senderId: 'user003', timestamp: '7:30 AM' }], locked_by: 'other.chatter@flirtduo.com', lock_time: now - 60000 },
];

const initialWinks = [
  { id: 'wink001', user: allUsersData[3], girl: girlProfilesData[2], timestamp: '5 min ago' },
  { id: 'wink002', user: allUsersData[0], girl: girlProfilesData[0], timestamp: '1 hour ago' },
];

const LOCK_DURATION = 5 * 60 * 1000; // 5 minutes

export const useChatterState = () => {
  const { user } = useContext(AuthContext);
  const { toast } = useToast();
  const [girlProfiles] = useState(girlProfilesData);
  const [allUsers] = useState(allUsersData);
  const [activeGirl, setActiveGirl] = useState(girlProfilesData[0]);
  // const [conversations, setConversations] = useState(initialConversations);
  const [winks] = useState(initialWinks);
  const [selectedChatId, setSelectedChatId] = useState(null);
  const [message, setMessage] = useState('');
  const [activeView, setActiveView] = useState('conversations');

  const [conversations, setConversations] = useState([]);
const [selectedChat, setSelectedChat] = useState(null);



const [isLockedByYou, setIsLockedByYou] = useState(false);
const [isLockedByOther, setIsLockedByOther] = useState(false);
const [lockHolderName, setLockHolderName] = useState('');

const [lockedChatId, setLockedChatId] = useState(null);




useEffect(() => {
  const fetchConversations = async () => {
    try {
      const token = localStorage.getItem('token'); // or from context
      const res = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/chatter/conversations`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      console.log("data GOT----------------")
      console.log(res.data);
      setConversations(res.data.conversations);
    } catch (err) {
      console.error('Failed to load conversations:', err);
      toast({ variant: 'destructive', title: 'Failed to Load Chats', description: 'Try refreshing the page.' });
    }
  };

  fetchConversations();
}, []);



















  const sortedConversations = useMemo(() => {
    return [...conversations].sort((a, b) => b.lastActivity - a.lastActivity);
  }, [conversations]);

  // const selectedChat = useMemo(() => {
  //   return conversations.find(c => c.id === selectedChatId);
  // }, [conversations, selectedChatId]);

  // const isLockedByOther = useMemo(() => {
  //   if (!selectedChat || !selectedChat.locked_by) return false;
  //   return selectedChat.locked_by !== user.email;
  // }, [selectedChat, user.email]);

  // const isLockedByYou = useMemo(() => {
  //   if (!selectedChat || !selectedChat.locked_by) return false;
  //   return selectedChat.locked_by === user.email;
  // }, [selectedChat, user.email]);

  // const lockHolderName = useMemo(() => {
  //   if (!isLockedByOther || !selectedChat) return '';
  //   // In a real app, you'd look up the chatter's name.
  //   return selectedChat.locked_by.split('@')[0];
  // }, [isLockedByOther, selectedChat]);

  const lockConversation = useCallback((chatId, chatterId) => {
    setConversations(prev => prev.map(c => 
      c.id === chatId ? { ...c, locked_by: chatterId, lock_time: Date.now() } : c
    ));
  }, []);

  const unlockConversation = useCallback((chatId) => {
    setConversations(prev => prev.map(c => 
      c.id === chatId ? { ...c, locked_by: null, lock_time: null } : c
    ));
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      conversations.forEach(c => {
        if (c.locked_by && c.lock_time && (now - c.lock_time > LOCK_DURATION)) {
          unlockConversation(c.id);
          toast({ title: 'Chat Unlocked', description: `Conversation with ${c.participants.user.name} is now available.` });
        }
      });
    }, 30000); // Check every 30 seconds
    return () => clearInterval(interval);
  }, [conversations, unlockConversation, toast]);

  // const handleSelectChat = useCallback((chat) => {
  //   const now = Date.now();
  //   const isLockExpired = chat.lock_time && (now - chat.lock_time > LOCK_DURATION);

  //   if (!chat.locked_by || isLockExpired) {
  //     lockConversation(chat.id, user.email);
  //     setActiveGirl(chat.participants.girl);
  //     setSelectedChatId(chat.id);
  //     toast({ title: 'Chat Locked', description: `You have locked the conversation with ${chat.participants.user.name}.` });
  //   } else if (chat.locked_by === user.email) {
  //     // It's already locked by me, just open it and refresh lock
  //     lockConversation(chat.id, user.email);
  //     setActiveGirl(chat.participants.girl);
  //     setSelectedChatId(chat.id);
  //   } else {
  //     // Locked by someone else
  //     setSelectedChatId(chat.id);
  //     setActiveGirl(chat.participants.girl);
  //     toast({ variant: 'destructive', title: 'Chat is Locked', description: `This chat is currently handled by another team member.` });
  //   }
  // }, [user.email, lockConversation, toast]);






  useEffect(() => {
  let interval;

  if (selectedChat) {
    interval = setInterval(async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get(
          `${import.meta.env.VITE_API_BASE_URL}/chatter/conversations/${selectedChat.conversation_id}/messages`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        const updatedMessages = res.data.map(msg => ({
          id: msg.id,
          senderId: msg.sender_id,
          text: msg.content,
          timestamp: formatTime(msg.sent_at),
        }));

        setSelectedChat(prev => ({
          ...prev,
          messages: updatedMessages,
        }));
      } catch (err) {
        console.error("Polling failed", err);
      }
    }, 3000); // every 3 seconds
  }

  return () => clearInterval(interval); // clean up
}, [selectedChat?.conversation_id]);










const handleSelectChat = async (conversation) => {
  try {
    const token = localStorage.getItem('token');
    const currentUserId = JSON.parse(localStorage.getItem('userId'));

    // 🔓 Unlock previous chat (if switching to a different one)
    if (lockedChatId && lockedChatId !== conversation.conversation_id) {
      await unlockChat(lockedChatId, token);
      console.log("Unlocked chat:", lockedChatId);
    }

    // 📨 Load messages
    const res = await axios.get(
      `${import.meta.env.VITE_API_BASE_URL}/chatter/conversations/${conversation.conversation_id}/messages`,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    const messages = res.data;

    const selectedChatData = {
      ...conversation,
      participants: {
        user: { id: conversation.user_id, name: conversation.user_name },
        girl: { id: conversation.girl_id, name: conversation.girl_name },
      },
      messages: messages.map(msg => ({
        id: msg.id,
        senderId: msg.sender_id,
        senderName: msg.sender_name,
        senderImage: msg.sender_image,
        text: msg.content,
        timestamp: formatTime(msg.sent_at),
      })),
    };

    setSelectedChat(selectedChatData);

    // 🔒 Lock this conversation
    await lockChat(conversation.conversation_id, token);
    setLockedChatId(conversation.conversation_id);
    console.log("Locked chat:", conversation.conversation_id);

    // ✅ Check lock status
    const lockData = await checkLockStatus(conversation.conversation_id, token);

    if (lockData.locked_by === currentUserId) {
      setIsLockedByYou(true);
      setIsLockedByOther(false);
    } else if (lockData.locked_by) {
      setIsLockedByOther(true);
      setIsLockedByYou(false);
      setLockHolderName(lockData.lock_holder_name || 'Another chatter');
    } else {
      setIsLockedByOther(false);
      setIsLockedByYou(false);
    }

  } catch (err) {
    console.error("Failed to load messages or lock chat", err);
    toast({ title: "Error", description: "Could not open or lock the chat." });
  }
};



const handleBackToInbox = async () => {
  const token = localStorage.getItem('token');
  try {
    if (selectedChat) {
      await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/chatter-lock/unlock/${selectedChat.conversation_id}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
    }

    setSelectedChat(null);
    setIsLockedByYou(false);
    setIsLockedByOther(false);
    setLockHolderName('');
  } catch (err) {
    console.error("Failed to unlock conversation", err);
    toast({ title: "Error", description: "Failed to release lock." });
  }
};



  const handleSendMessage = async (socket) => {
  if (!message.trim() || !selectedChat) return;

  const token = localStorage.getItem('token');
  const conversationId = selectedChat.conversation_id;
  const girlId = selectedChat.girl_id;

  try {
    const res = await axios.post(
      `${import.meta.env.VITE_API_BASE_URL}/chatter/conversations/chatter/${conversationId}/messages`,
      { content: message, girlId },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    const newMsg = res.data.message;

    const formattedMessage = {
      id: newMsg.id,
      senderId: newMsg.sender_id,
      text: newMsg.content,
      timestamp: formatTime(newMsg.sent_at),
    };

    // Append to chat immediately
    setSelectedChat((prev) => ({
      ...prev,
      messages: [...prev.messages, formattedMessage],
    }));

    // Emit real-time update
    if (socket) {
      socket.emit("newMessage", {
        conversation_id: conversationId,
        ...newMsg
      });
    } else {
      console.warn("Socket is undefined when trying to emit message");
    }

    setMessage('');
  } catch (err) {
    console.error('Send message error:', err);
    toast({ title: 'Error', description: 'Failed to send message.' });
  }
};





  const handleStartNewChat = useCallback((selectedUserId, newChatMessage) => {
    if (!selectedUserId || !newChatMessage.trim()) return;
    const userToChat = allUsers.find(u => u.id === selectedUserId);
    const newConversation = {
      id: Date.now(),
      participants: { user: userToChat, girl: activeGirl },
      lastMessage: newChatMessage,
      timestamp: 'now',
      unread: 0,
      online: Math.random() > 0.5,
      lastActivity: Date.now(),
      hasWinked: false,
      messages: [{ id: Date.now(), text: newChatMessage, senderId: activeGirl.id, timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }],
      locked_by: user.email,
      lock_time: Date.now(),
    };
    setConversations(prev => [newConversation, ...prev]);
    setSelectedChatId(newConversation.id);
    toast({ title: 'New Chat Started!', description: `Started conversation as ${activeGirl.name} with ${userToChat.name}.` });
  }, [activeGirl, allUsers, user.email, toast]);

  const handleWinkResponse = useCallback((wink) => {
    const newConversation = {
      id: Date.now(),
      participants: { user: wink.user, girl: wink.girl },
      lastMessage: "Thanks for the wink! 😊",
      timestamp: 'now',
      unread: 0,
      online: true,
      lastActivity: Date.now(),
      hasWinked: true,
      messages: [{ id: Date.now(), text: "Thanks for the wink! 😊", senderId: wink.girl.id, timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }],
      locked_by: user.email,
      lock_time: Date.now(),
    };
    setConversations(prev => [newConversation, ...prev]);
    setActiveView('conversations');
    setSelectedChatId(newConversation.id);
    setActiveGirl(wink.girl);
    toast({ title: 'Wink Response Sent!', description: `You responded as ${wink.girl.name} to ${wink.user.name}'s wink.` });
  }, [user.email, toast]);

  const formatTime = useCallback((timestamp) => {
    if (timestamp === 'now') return 'now';
    if (timestamp.includes('min ago') || timestamp.includes('hour ago')) return timestamp;
    return timestamp;
  }, []);

  return {
    user,
    girlProfiles,
    allUsers,
    activeGirl,
    setActiveGirl,
    conversations: sortedConversations,
    winks,
    selectedChat,
    message,
    setMessage,
    activeView,
    setActiveView,
    handleSelectChat,
    handleSendMessage,
    handleStartNewChat,
    handleWinkResponse,
    formatTime,
    isLockedByOther,
    isLockedByYou,
    lockHolderName,
    setSelectedChatId,
    handleBackToInbox,
    lockedChatId,
  };
};