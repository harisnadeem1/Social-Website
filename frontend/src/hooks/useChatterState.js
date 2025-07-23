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

// Enhanced deduplication function for user-girl pairs
const deduplicateConversationsByUserGirl = (conversations) => {
  const userGirlMap = new Map();
  
  conversations.forEach(conv => {
    const key = `${conv.user_id}-${conv.girl_id}`;
    
    if (!userGirlMap.has(key)) {
      userGirlMap.set(key, conv);
    } else {
      const existing = userGirlMap.get(key);
      
      // Keep the conversation with:
      // 1. More recent lastActivity
      // 2. More messages
      // 3. More recent last_message_time
      const shouldReplace = 
        (conv.lastActivity || 0) > (existing.lastActivity || 0) ||
        (conv.messages?.length || 0) > (existing.messages?.length || 0) ||
        new Date(conv.last_message_time || 0) > new Date(existing.last_message_time || 0);
      
      if (shouldReplace) {
        // Merge messages from both conversations to avoid losing data
        const mergedMessages = [
          ...(existing.messages || []),
          ...(conv.messages || [])
        ];
        
        // Remove duplicate messages by ID
        const uniqueMessages = mergedMessages.filter((msg, index, arr) => 
          arr.findIndex(m => m.id === msg.id) === index
        );
        
        // Sort messages by timestamp
        uniqueMessages.sort((a, b) => {
          const timeA = new Date(a.timestamp || 0);
          const timeB = new Date(b.timestamp || 0);
          return timeA - timeB;
        });
        
        userGirlMap.set(key, {
          ...conv,
          messages: uniqueMessages,
          // Use the most recent last message
          last_message: uniqueMessages.length > 0 ? 
            (uniqueMessages[uniqueMessages.length - 1].senderId === conv.girl_id ? 
              `You: ${uniqueMessages[uniqueMessages.length - 1].text}` : 
              uniqueMessages[uniqueMessages.length - 1].text) : 
            conv.last_message
        });
      }
    }
  });
  
  return Array.from(userGirlMap.values());
};

// Debug function to identify duplicates
const findDuplicateUserGirlPairs = (conversations) => {
  const pairs = {};
  const duplicates = [];
  
  conversations.forEach((conv, index) => {
    const key = `${conv.user_id}-${conv.girl_id}`;
    if (pairs[key]) {
      duplicates.push({
        key,
        conversations: [pairs[key], { ...conv, index }],
        userGirl: `${conv.user_name} & ${conv.girl_name}`
      });
    } else {
      pairs[key] = { ...conv, index };
    }
  });
  
  return duplicates;
};

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

  // Format time function - moved up for use in other functions
  const formatTime = useCallback((timestamp) => {
    if (timestamp === 'now') return 'now';
    if (timestamp && (timestamp.includes('min ago') || timestamp.includes('hour ago'))) return timestamp;
    if (timestamp === 'Yesterday') return timestamp;
    return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }, []);

  // Function to fetch all conversations with messages and format last message
  const fetchAllConversations = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/chatter/conversations`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.data.conversations) {
        console.log('Raw conversations from API:', res.data.conversations.length);
        
        // Check for duplicates before processing
        const duplicates = findDuplicateUserGirlPairs(res.data.conversations);
        if (duplicates.length > 0) {
          console.warn('Found duplicate user-girl pairs before processing:', duplicates);
        }

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
                  message_type: msg.message_type,
                  gift_id: msg.gift_id,
                  gift_name: msg.gift_name,
                  gift_image_path: msg.gift_image_path,
                  image_url: msg.image_url,
                  senderId: msg.sender_id,
                  timestamp: formatTime(msg.sent_at),
                  status: 'delivered',
                }))
              : [];

            // Format last message with proper prefix
            const lastMsg = messages[messages.length - 1];
            let formattedLastMessage = 'Tap to continue...';
            if (lastMsg) {
              let messageText = '';
              if (lastMsg.message_type === 'gift') {
                messageText = `🎁 ${lastMsg.gift_name || 'Gift'}`;
              } else if (lastMsg.message_type === 'image') {
                messageText = '📷 Image';
              } else {
                messageText = lastMsg.text;
              }
              
              // For chatter: show "You:" if message was sent by the girl (chatter), no prefix if sent by user
              formattedLastMessage = lastMsg.senderId === conv.girl_id 
                ? `You: ${messageText}` 
                : messageText;
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

        // Deduplicate by user-girl pairs
        const uniqueConversations = deduplicateConversationsByUserGirl(conversationsWithMessages);
        
        console.log('Conversations after deduplication:', uniqueConversations.length);
        console.log('Removed duplicates:', conversationsWithMessages.length - uniqueConversations.length);
        
        setConversations(uniqueConversations);
      }
    } catch (err) {
      console.error('Failed to fetch chatter conversations:', err);
      toast({
        title: "Error",
        description: "Failed to reload conversation list. Please try again.",
        variant: "destructive"
      });
    }
  }, [toast, formatTime]);

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
            message_type: msg.message_type,
            gift_id: msg.gift_id,
            gift_name: msg.gift_name,
            gift_image_path: msg.gift_image_path,
            image_url: msg.image_url,
            senderId: msg.sender_id,
            timestamp: formatTime(msg.sent_at),
            status: 'delivered',
          }))
        : [];

      // Update the specific conversation with new messages and deduplicate
      setConversations(prevConvs => {
        const updatedConvs = prevConvs.map(conv => {
          if (conv.conversation_id === conversationId) {
            // Format last message with proper prefix
            const lastMsg = messages[messages.length - 1];
            let formattedLastMessage = 'Tap to continue...';
            if (lastMsg) {
              let messageText = '';
              if (lastMsg.message_type === 'gift') {
                messageText = `🎁 ${lastMsg.gift_name || 'Gift'}`;
              } else if (lastMsg.message_type === 'image') {
                messageText = '📷 Image';
              } else {
                messageText = lastMsg.text;
              }
              
              // For chatter: show "You:" if message was sent by the girl (chatter), no prefix if sent by user
              formattedLastMessage = lastMsg.senderId === conv.girl_id 
                ? `You: ${messageText}` 
                : messageText;
            }

            return {
              ...conv,
              messages: messages,
              last_message: formattedLastMessage,
              lastActivity: messages.length > 0 ? new Date(messages[messages.length - 1].timestamp).getTime() : conv.lastActivity,
            };
          }
          return conv;
        });
        
        // Apply deduplication after update
        return deduplicateConversationsByUserGirl(updatedConvs);
      });

    } catch (err) {
      console.error(`Failed to fetch chatter messages for conversation ${conversationId}:`, err);
      toast({
        title: "Error",
        description: "Failed to load messages. Please try again.",
        variant: "destructive"
      });
    }
  }, [toast, formatTime]);

  // Update the sortedConversations memoization to include deduplication
  const sortedConversations = useMemo(() => {
    const uniqueConversations = deduplicateConversationsByUserGirl(conversations);
    return uniqueConversations.sort((a, b) => b.lastActivity - a.lastActivity);
  }, [conversations]);

  const lockConversation = useCallback((chatId, chatterId) => {
    setConversations(prev => {
      const updatedConvs = prev.map(c => 
        c.conversation_id === chatId ? { ...c, locked_by: chatterId, lock_time: Date.now() } : c
      );
      return deduplicateConversationsByUserGirl(updatedConvs);
    });
  }, []);

  const unlockConversation = useCallback((chatId) => {
    setConversations(prev => {
      const updatedConvs = prev.map(c => 
        c.conversation_id === chatId ? { ...c, locked_by: null, lock_time: null } : c
      );
      return deduplicateConversationsByUserGirl(updatedConvs);
    });
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

  // Debug effect to monitor duplicates
  useEffect(() => {
    const duplicates = findDuplicateUserGirlPairs(conversations);
    if (duplicates.length > 0) {
      console.warn('Current duplicate user-girl pairs in state:', duplicates);
    }
  }, [conversations]);

  // Updated handleSelectChat function with reload functionality
  const handleSelectChat = useCallback(async (conversation) => {
    try {
      const token = localStorage.getItem('token');
      const currentUserId = JSON.parse(localStorage.getItem('userId'));

      // 🔓 Unlock previous chat (if switching to a different one)
      if (lockedChatId && lockedChatId !== conversation.conversation_id) {
        await unlockChat(lockedChatId, token);
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
          message_type: msg.message_type,
          gift_id: msg.gift_id,
          gift_name: msg.gift_name,
          gift_image_path: msg.gift_image_path,
          image_url: msg.image_url,
          timestamp: formatTime(msg.sent_at),
        })),
      };

      setSelectedChat(selectedChatData);

      // 🔒 Lock this conversation
      await lockChat(conversation.conversation_id, token);
      setLockedChatId(conversation.conversation_id);

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
  }, [lockedChatId, fetchAllConversations, fetchMessagesForConversation, toast, formatTime]);

  // Enhanced useEffect for real-time updates with smart fetching
  useEffect(() => {
    if (selectedChatId) {
      // Always fetch messages for the selected conversation to get latest updates
      fetchMessagesForConversation(selectedChatId);
      
      // Set up a periodic refresh for the conversation list to catch new conversations
      // This is less aggressive than fetching on every selection
      const conversationRefreshInterval = setInterval(() => {
        fetchAllConversations();
      }, 15000); // Every 15 seconds
      
      return () => clearInterval(conversationRefreshInterval);
    }
  }, [selectedChatId, fetchMessagesForConversation, fetchAllConversations]);

  // Alternative: If you want immediate conversation list refresh on chat selection
  // but want to prevent race conditions, you can use this instead:
  /*
  useEffect(() => {
    if (selectedChatId) {
      // Fetch conversation list first, then messages
      const refreshData = async () => {
        await fetchAllConversations();
        await fetchMessagesForConversation(selectedChatId);
      };
      
      refreshData();
    }
  }, [selectedChatId, fetchMessagesForConversation, fetchAllConversations]);
  */
  
  // Enhanced polling logic with deduplication
  useEffect(() => {
    let messageInterval;
    let conversationInterval;

    if (selectedChat) {
      // Poll for new messages in the selected chat every 3 seconds
      messageInterval = setInterval(async () => {
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
            message_type: msg.message_type,
            gift_id: msg.gift_id,
            gift_name: msg.gift_name,
            gift_image_path: msg.gift_image_path,
            image_url: msg.image_url,
            timestamp: formatTime(msg.sent_at),
          }));

          setSelectedChat(prev => ({
            ...prev,
            messages: updatedMessages,
          }));

          // Also update the conversation in the list with latest message
          setConversations(prevConvs => {
            const updatedConvs = prevConvs.map(conv => {
              if (conv.conversation_id === selectedChat.conversation_id) {
                const lastMsg = updatedMessages[updatedMessages.length - 1];
                const formattedLastMessage = lastMsg 
                  ? (lastMsg.senderId === conv.girl_id ? `You: ${lastMsg.text}` : lastMsg.text)
                  : conv.last_message;
                
                return {
                  ...conv,
                  messages: updatedMessages,
                  last_message: formattedLastMessage,
                  lastActivity: Date.now()
                };
              }
              return conv;
            });
            
            // Apply deduplication and sort
            const uniqueConvs = deduplicateConversationsByUserGirl(updatedConvs);
            return uniqueConvs.sort((a, b) => b.lastActivity - a.lastActivity);
          });

        } catch (err) {
          console.error("Message polling failed", err);
        }
      }, 3000);

      // Poll for new conversations every 30 seconds (less frequent)
      conversationInterval = setInterval(() => {
        fetchAllConversations();
      }, 30000);
    }

    return () => {
      clearInterval(messageInterval);
      clearInterval(conversationInterval);
    };
  }, [selectedChat?.conversation_id, formatTime]);

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

  // Updated handleSendMessage to prevent duplicates
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
        message_type: newMsg.message_type || 'text',
        gift_id: newMsg.gift_id,
        gift_name: newMsg.gift_name,
        gift_image_path: newMsg.gift_image_path,
        image_url: newMsg.image_url,
        timestamp: formatTime(newMsg.sent_at),
      };

      setMessage('');

      // Update conversations with the new message and deduplicate
      setConversations(prevConvs => {
        const updatedConvs = prevConvs.map(conv => {
          if (conv.conversation_id === selectedChat.conversation_id) {
            // Check if message already exists to prevent duplicates
            const messageExists = conv.messages.some(msg => msg.id === formattedMessage.id);
            const updatedMessages = messageExists 
              ? conv.messages 
              : [...conv.messages, formattedMessage];

            return {
              ...conv,
              messages: updatedMessages,
              // For chatter sending message: show "You: message"
              last_message: `You: ${formattedMessage.text}`,
              last_message_time: newMsg.sent_at,
              lastActivity: Date.now()
            };
          }
          return conv;
        });

        // Deduplicate and sort
        const uniqueConvs = deduplicateConversationsByUserGirl(updatedConvs);
        return uniqueConvs.sort((a, b) => b.lastActivity - a.lastActivity);
      });

      // Update selected chat (also check for duplicate messages)
      setSelectedChat(prev => {
        const messageExists = prev.messages.some(msg => msg.id === formattedMessage.id);
        return {
          ...prev,
          messages: messageExists ? prev.messages : [...prev.messages, formattedMessage]
        };
      });

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
    
    setConversations(prev => {
      const updatedConvs = [newConversation, ...prev];
      return deduplicateConversationsByUserGirl(updatedConvs);
    });
    
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
    
    setConversations(prev => {
      const updatedConvs = [newConversation, ...prev];
      return deduplicateConversationsByUserGirl(updatedConvs);
    });
    
    setActiveView('conversations');
    setSelectedChatId(newConversation.conversation_id);
    setActiveGirl(wink.girl);
    toast({ title: 'Wink Response Sent!', description: `You responded as ${wink.girl.name} to ${wink.user.name}'s wink.` });
  }, [user.email, toast]);

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