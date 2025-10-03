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

export const useChatterState = () => {
  const { user } = useContext(AuthContext);
  const { toast } = useToast();
  
  const [girlProfiles] = useState(girlProfilesData);
  const [allUsers] = useState(allUsersData);
  const [activeGirl, setActiveGirl] = useState(girlProfilesData[0]);
  const [selectedChatId, setSelectedChatId] = useState(null);
  const [message, setMessage] = useState('');
  const [activeView, setActiveView] = useState('chats');
  const [conversations, setConversations] = useState([]);
  const [winks, setWinks] = useState([]);
  const [likes, setLikes] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [isLockedByYou, setIsLockedByYou] = useState(false);
  const [isLockedByOther, setIsLockedByOther] = useState(false);
  const [lockHolderName, setLockHolderName] = useState('');
  const [lockedChatId, setLockedChatId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const formatTime = useCallback((timestamp) => {
    if (timestamp === 'now') return 'now';
    if (timestamp && (timestamp.includes('min ago') || timestamp.includes('hour ago'))) return timestamp;
    if (timestamp === 'Yesterday') return timestamp;
    return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }, []);

  // ✅ KEY CHANGE: Fetch all data in parallel on initial load
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setIsLoading(true);
        const token = localStorage.getItem('token');
        const baseURL = import.meta.env.VITE_API_BASE_URL;

        // Fetch conversations, winks, and likes IN PARALLEL
        const [conversationsRes, winksRes, likesRes] = await Promise.all([
          axios.get(`${baseURL}/chatter/conversations`, {
            headers: { Authorization: `Bearer ${token}` }
          }),
          axios.get(`${baseURL}/chatter/winks`, {
            headers: { Authorization: `Bearer ${token}` }
          }),
          axios.get(`${baseURL}/chatter/likes/get`, {
            headers: { Authorization: `Bearer ${token}` }
          })
        ]);

        // ✅ KEY CHANGE: Don't fetch messages initially, only conversation metadata
        const formattedConversations = (conversationsRes.data.conversations || []).map(conv => ({
          conversation_id: conv.conversation_id,
          user_id: conv.user_id,
          girl_id: conv.girl_id,
          user_name: conv.user_name,
          girl_name: conv.girl_name,
          user_image: conv.user_image,
          girl_image: conv.girl_image,
          last_message: conv.last_message || 'Tap to continue...',
          last_message_time: conv.last_message_time,
          locked_by: conv.locked_by,
          messages: [], // Empty initially
          participants: {
            user: { id: conv.user_id, name: conv.user_name },
            girl: { id: conv.girl_id, name: conv.girl_name }
          },
          lastActivity: new Date(conv.last_message_time).getTime(),
        }));

        setConversations(formattedConversations);
        setWinks(winksRes.data || []);
        setLikes(likesRes.data || []);
      } catch (error) {
        console.error('Failed to fetch initial data:', error);
        toast({
          title: "Error loading data",
          description: "Please refresh the page",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchInitialData();
  }, [toast]);

  const sortedConversations = useMemo(() => {
    return [...conversations].sort((a, b) => b.lastActivity - a.lastActivity);
  }, [conversations]);

  // ✅ KEY CHANGE: Only fetch messages when a chat is selected
  const handleSelectChat = useCallback(async (conversation) => {
    try {
      const token = localStorage.getItem('token');
      const currentUserId = JSON.parse(localStorage.getItem('userId'));

      setSelectedChat(null); // Clear current chat

      // Unlock previous chat
      if (lockedChatId && lockedChatId !== conversation.conversation_id) {
        await unlockChat(lockedChatId, token);
        setLockedChatId(null);
      }

      // Fetch messages only now
      const messagesRes = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/chatter/conversations/${conversation.conversation_id}/messages`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const messages = (messagesRes.data || []).map(msg => ({
        id: msg.id,
        senderId: msg.sender_id,
        text: msg.content,
        message_type: msg.message_type,
        gift_id: msg.gift_id,
        gift_name: msg.gift_name,
        gift_image_path: msg.gift_image_path,
        image_url: msg.image_url,
        timestamp: formatTime(msg.sent_at),
        conversation_id: conversation.conversation_id,
      }));

      const selectedChatData = {
        ...conversation,
        messages,
        participants: {
          user: { id: conversation.user_id, name: conversation.user_name },
          girl: { id: conversation.girl_id, name: conversation.girl_name },
        },
      };

      setSelectedChat(selectedChatData);
      setSelectedChatId(conversation.conversation_id);

      // Lock chat
      await lockChat(conversation.conversation_id, token);
      setLockedChatId(conversation.conversation_id);

      // Check lock status
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
      console.error("Failed to load chat", err);
      toast({ title: "Error", description: "Could not open chat." });
    }
  }, [lockedChatId, toast, formatTime]);

  // Poll for new messages only in selected chat
  useEffect(() => {
    if (!selectedChat?.conversation_id) return;

    const interval = setInterval(async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get(
          `${import.meta.env.VITE_API_BASE_URL}/chatter/conversations/${selectedChat.conversation_id}/messages`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        const messages = (res.data || []).map(msg => ({
          id: msg.id,
          senderId: msg.sender_id,
          text: msg.content,
          message_type: msg.message_type,
          gift_id: msg.gift_id,
          gift_name: msg.gift_name,
          gift_image_path: msg.gift_image_path,
          image_url: msg.image_url,
          timestamp: formatTime(msg.sent_at),
          conversation_id: selectedChat.conversation_id,
        }));

        setSelectedChat(prev => ({
          ...prev,
          messages
        }));

      } catch (err) {
        console.error("Message polling failed", err);
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [selectedChat?.conversation_id, formatTime]);

  const handleSendMessage = async () => {
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
        message_type: newMsg.message_type || 'text',
        timestamp: formatTime(newMsg.sent_at),
        conversation_id: conversationId,
      };

      setMessage('');

      setSelectedChat(prev => ({
        ...prev,
        messages: [...prev.messages, formattedMessage]
      }));

      setConversations(prev =>
        prev.map(conv =>
          conv.conversation_id === conversationId
            ? {
                ...conv,
                last_message: `You: ${formattedMessage.text}`,
                last_message_time: newMsg.sent_at,
                lastActivity: Date.now()
              }
            : conv
        )
      );

    } catch (err) {
      console.error('Send message error:', err);
      toast({ title: 'Error', description: 'Failed to send message.' });
    }
  };

  const handleBackToInbox = async () => {
    const token = localStorage.getItem('token');
    
    try {
      if (lockedChatId) {
        await unlockChat(lockedChatId, token);
      }
      setSelectedChat(null);
      setSelectedChatId(null);
      setIsLockedByYou(false);
      setIsLockedByOther(false);
      setLockHolderName('');
      setLockedChatId(null);
    } catch (err) {
      console.error("Failed to unlock conversation", err);
    }
  };

  const handleWinkResponse = useCallback(async (wink, customMessage) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/winks/respond/${wink.id}`,
        { message: customMessage },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setWinks(prev => prev.filter(w => w.id !== wink.id));
      toast({ title: 'Response sent!' });
    } catch (err) {
      console.error(err);
      toast({ title: 'Error', description: 'Failed to respond.' });
    }
  }, [toast]);

  const handleStartNewChat = useCallback(() => {
    // Implement if needed
  }, []);

  return {
    user,
    girlProfiles,
    allUsers,
    activeGirl,
    setActiveGirl,
    conversations: sortedConversations,
    winks,
    likes,
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
    isLoading,
  };
};