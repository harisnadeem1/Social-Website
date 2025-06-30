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

const LOCK_DURATION = 5 * 60 * 1000; // 5 minutes

export const useChatterState = () => {
  const { user } = useContext(AuthContext);
  const { toast } = useToast();
  const [girlProfiles] = useState(girlProfilesData);
  const [allUsers] = useState(allUsersData);
  const [activeGirl, setActiveGirl] = useState(girlProfilesData[0]);
  const [selectedChatId, setSelectedChatId] = useState(null);
  const [message, setMessage] = useState('');
  const [activeView, setActiveView] = useState('conversations');
  const [conversations, setConversations] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [isLockedByYou, setIsLockedByYou] = useState(false);
  const [isLockedByOther, setIsLockedByOther] = useState(false);
  const [lockHolderName, setLockHolderName] = useState('');
  const [lockedChatId, setLockedChatId] = useState(null);

  // Function to fetch all conversations with messages and format last message
  const fetchAllConversations = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/chatter/conversations`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.data.conversations) {
        const conversationsWithMessages = await Promise.all(
          res.data.conversations.map(async (conv) => {
            // Fetch messages for each conversation
            const messagesRes = await axios.get(
              `${import.meta.env.VITE_API_BASE_URL}/chatter/conversations/${conv.conversation_id}/messages`,
              { headers: { Authorization: `Bearer ${token}` } }
            );

            const messages = Array.isArray(messagesRes.data)
              ? messagesRes.data.map((msg) => ({
                  id: msg.id,
                  text: msg.content,
                  senderId: msg.sender_id,
                  timestamp: formatTime(msg.sent_at),
                  status: 'delivered',
                }))
              : [];

            // Format last message with proper prefix
            const lastMsg = messages[messages.length - 1];
            let formattedLastMessage = 'Tap to continue...';
            if (lastMsg) {
              // For chatter: show "You:" if message was sent by the girl (chatter), no prefix if sent by user
              formattedLastMessage = lastMsg.senderId === conv.girl_id 
                ? `You: ${lastMsg.text}` 
                : lastMsg.text;
            }

            return {
              conversation_id: conv.conversation_id,
              user_id: conv.user_id,
              girl_id: conv.girl_id,
              user_name: conv.user_name,
              girl_name: conv.girl_name,
              user_image: conv.user_image,
              girl_image: conv.girl_image,
              last_message: formattedLastMessage,
              last_message_time: conv.last_message_time,
              locked_by: conv.locked_by,
              messages: messages,
              participants: {
                user: { id: conv.user_id, name: conv.user_name },
                girl: { id: conv.girl_id, name: conv.girl_name }
              },
              lastActivity: new Date(conv.last_message_time).getTime(),
            };
          })
        );

        setConversations(conversationsWithMessages);
        console.log('Chatter conversation list reloaded');
      }
    } catch (err) {
      console.error('Failed to fetch chatter conversations:', err);
      toast({
        title: "Error",
        description: "Failed to reload conversation list. Please try again.",
        variant: "destructive"
      });
    }
  }, [toast]);

  // Function to fetch messages for a specific conversation
  const fetchMessagesForConversation = useCallback(async (conversationId) => {
    try {
      const token = localStorage.getItem('token');
      const messagesRes = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/chatter/conversations/${conversationId}/messages`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const messages = Array.isArray(messagesRes.data)
        ? messagesRes.data.map((msg) => ({
            id: msg.id,
            text: msg.content,
            senderId: msg.sender_id,
            timestamp: formatTime(msg.sent_at),
            status: 'delivered',
          }))
        : [];

      // Update the specific conversation with new messages
      setConversations(prevConvs =>
        prevConvs.map(conv => {
          if (conv.conversation_id === conversationId) {
            // Format last message with proper prefix
            const lastMsg = messages[messages.length - 1];
            let formattedLastMessage = 'Tap to continue...';
            if (lastMsg) {
              // For chatter: show "You:" if message was sent by the girl (chatter), no prefix if sent by user
              formattedLastMessage = lastMsg.senderId === conv.girl_id 
                ? `You: ${lastMsg.text}` 
                : lastMsg.text;
            }

            return {
              ...conv,
              messages: messages,
              last_message: formattedLastMessage,
            };
          }
          return conv;
        })
      );

      console.log(`Chatter messages reloaded for conversation ${conversationId}`);
    } catch (err) {
      console.error(`Failed to fetch chatter messages for conversation ${conversationId}:`, err);
      toast({
        title: "Error",
        description: "Failed to load messages. Please try again.",
        variant: "destructive"
      });
    }
  }, [toast]);

  const sortedConversations = useMemo(() => {
    return [...conversations].sort((a, b) => b.lastActivity - a.lastActivity);
  }, [conversations]);

  const lockConversation = useCallback((chatId, chatterId) => {
    setConversations(prev => prev.map(c => 
      c.conversation_id === chatId ? { ...c, locked_by: chatterId, lock_time: Date.now() } : c
    ));
  }, []);

  const unlockConversation = useCallback((chatId) => {
    setConversations(prev => prev.map(c => 
      c.conversation_id === chatId ? { ...c, locked_by: null, lock_time: null } : c
    ));
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      conversations.forEach(c => {
        if (c.locked_by && c.lock_time && (now - c.lock_time > LOCK_DURATION)) {
          unlockConversation(c.conversation_id);
          toast({ title: 'Chat Unlocked', description: `Conversation with ${c.user_name} is now available.` });
        }
      });
    }, 30000); // Check every 30 seconds
    return () => clearInterval(interval);
  }, [conversations, unlockConversation, toast]);

  // Initial fetch of conversations
  useEffect(() => {
    fetchAllConversations();
  }, [fetchAllConversations]);

  // Updated handleSelectChat function with reload functionality
  const handleSelectChat = useCallback(async (conversation) => {
    try {
      const token = localStorage.getItem('token');
      const currentUserId = JSON.parse(localStorage.getItem('userId'));

      // 🔓 Unlock previous chat (if switching to a different one)
      if (lockedChatId && lockedChatId !== conversation.conversation_id) {
        await unlockChat(lockedChatId, token);
        console.log("Unlocked chat:", lockedChatId);
      }

      // Reload all conversations first
      await fetchAllConversations();

      // 📨 Load messages for the selected conversation
      await fetchMessagesForConversation(conversation.conversation_id);

      // Get the updated conversation data
      const messagesRes = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/chatter/conversations/${conversation.conversation_id}/messages`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const messages = messagesRes.data;

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
  }, [lockedChatId, fetchAllConversations, fetchMessagesForConversation, toast]);

  // Reload messages and conversation list whenever selectedChatId changes
  useEffect(() => {
    if (selectedChatId) {
      // Reload the conversation list first
      fetchAllConversations().then(() => {
        // Then reload messages for the selected chat
        fetchMessagesForConversation(selectedChatId);
      });
    }
  }, [selectedChatId, fetchMessagesForConversation, fetchAllConversations]);

  // Your existing polling logic - keeping it as is
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

  const handleBackToInbox = async () => {
    const token = localStorage.getItem('token');
    try {
      if (selectedChat) {
        await unlockChat(selectedChat.conversation_id, token);
      }

      setSelectedChat(null);
      setIsLockedByYou(false);
      setIsLockedByOther(false);
      setLockHolderName('');
      setLockedChatId(null);
    } catch (err) {
      console.error("Failed to unlock conversation", err);
      toast({ title: "Error", description: "Failed to release lock." });
    }
  };

  // Updated handleSendMessage to format the last message correctly
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

      setMessage('');

      // Update conversations with the new message
      setConversations(prevConvs =>
        prevConvs.map(conv => {
          if (conv.conversation_id === selectedChat.conversation_id) {
            return {
              ...conv,
              messages: [...conv.messages, formattedMessage],
              // For chatter sending message: show "You: message"
              last_message: `You: ${formattedMessage.text}`,
              last_message_time: newMsg.sent_at,
              lastActivity: Date.now()
            };
          }
          return conv;
        }).sort((a, b) => b.lastActivity - a.lastActivity)
      );

      // Update selected chat
      setSelectedChat(prev => ({
        ...prev,
        messages: [...prev.messages, formattedMessage]
      }));

      // Emit real-time update (keeping your existing socket logic)
      if (socket) {
        socket.emit("newMessage", {
          conversation_id: conversationId,
          ...newMsg
        });
      } else {
        console.warn("Socket is undefined when trying to emit message");
      }

    } catch (err) {
      console.error('Send message error:', err);
      toast({ title: 'Error', description: 'Failed to send message.' });
    }
  };

  const handleStartNewChat = useCallback((selectedUserId, newChatMessage) => {
    if (!selectedUserId || !newChatMessage.trim()) return;
    const userToChat = allUsers.find(u => u.id === selectedUserId);
    const newConversation = {
      conversation_id: Date.now(),
      user_id: userToChat.id,
      girl_id: activeGirl.id,
      user_name: userToChat.name,
      girl_name: activeGirl.name,
      user_image: userToChat.avatar,
      girl_image: activeGirl.avatar,
      last_message: `You: ${newChatMessage}`,
      last_message_time: new Date().toISOString(),
      locked_by: user.email,
      messages: [{ 
        id: Date.now(), 
        text: newChatMessage, 
        senderId: activeGirl.id, 
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
      }],
      participants: { user: userToChat, girl: activeGirl },
      lastActivity: Date.now(),
    };
    setConversations(prev => [newConversation, ...prev]);
    setSelectedChatId(newConversation.conversation_id);
    toast({ title: 'New Chat Started!', description: `Started conversation as ${activeGirl.name} with ${userToChat.name}.` });
  }, [activeGirl, allUsers, user.email, toast]);

  const handleWinkResponse = useCallback((wink) => {
    const newConversation = {
      conversation_id: Date.now(),
      user_id: wink.user.id,
      girl_id: wink.girl.id,
      user_name: wink.user.name,
      girl_name: wink.girl.name,
      user_image: wink.user.avatar,
      girl_image: wink.girl.avatar,
      last_message: "You: Thanks for the wink! 😊",
      last_message_time: new Date().toISOString(),
      locked_by: user.email,
      messages: [{ 
        id: Date.now(), 
        text: "Thanks for the wink! 😊", 
        senderId: wink.girl.id, 
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
      }],
      participants: { user: wink.user, girl: wink.girl },
      lastActivity: Date.now(),
    };
    setConversations(prev => [newConversation, ...prev]);
    setActiveView('conversations');
    setSelectedChatId(newConversation.conversation_id);
    setActiveGirl(wink.girl);
    toast({ title: 'Wink Response Sent!', description: `You responded as ${wink.girl.name} to ${wink.user.name}'s wink.` });
  }, [user.email, toast]);

  const formatTime = useCallback((timestamp) => {
    if (timestamp === 'now') return 'now';
    if (timestamp.includes('min ago') || timestamp.includes('hour ago')) return timestamp;
    if (timestamp === 'Yesterday') return timestamp;
    return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }, []);

  return {
    user,
    girlProfiles,
    allUsers,
    activeGirl,
    setActiveGirl,
    conversations: sortedConversations,
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
    fetchAllConversations, // Export for potential use in dashboard
  };
};