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

// Enhanced message validation
const validateMessage = (message, conversationId, expectedUserIds) => {
  if (!message || !message.id || !message.senderId) {
    console.warn('Invalid message structure:', message);
    return false;
  }
  
  // Ensure message belongs to expected participants
  if (!expectedUserIds.includes(message.senderId)) {
    console.warn(`Message ${message.id} has invalid sender ${message.senderId} for conversation ${conversationId}. Expected: ${expectedUserIds.join(', ')}`);
    return false;
  }
  
  return true;
};

// Enhanced deduplication with better validation
const deduplicateMessages = (messages, conversationId, expectedUserIds) => {
  if (!Array.isArray(messages)) return [];
  
  const messageMap = new Map();
  const validMessages = [];
  
  messages.forEach(msg => {
    if (validateMessage(msg, conversationId, expectedUserIds)) {
      if (!messageMap.has(msg.id)) {
        messageMap.set(msg.id, msg);
        validMessages.push(msg);
      }
    }
  });
  
  // Sort by timestamp to maintain order
  return validMessages.sort((a, b) => {
    const timeA = new Date(a.timestamp || a.sent_at || 0);
    const timeB = new Date(b.timestamp || b.sent_at || 0);
    return timeA - timeB;
  });
};

// Enhanced deduplication function for user-girl pairs
const deduplicateConversationsByUserGirl = (conversations) => {
  const userGirlMap = new Map();
  
  conversations.forEach(conv => {
    const key = `${conv.user_id}-${conv.girl_id}`;
    
    if (!userGirlMap.has(key)) {
      userGirlMap.set(key, conv);
    } else {
      const existing = userGirlMap.get(key);
      
      // Keep the conversation with more recent activity
      const shouldReplace = 
        (conv.lastActivity || 0) > (existing.lastActivity || 0) ||
        (conv.messages?.length || 0) > (existing.messages?.length || 0) ||
        new Date(conv.last_message_time || 0) > new Date(existing.last_message_time || 0);
      
      if (shouldReplace) {
        // Merge messages safely with validation
        const expectedUserIds = [conv.user_id, conv.girl_id];
        const mergedMessages = [
          ...(existing.messages || []),
          ...(conv.messages || [])
        ];
        
        const uniqueMessages = deduplicateMessages(mergedMessages, conv.conversation_id, expectedUserIds);
        
        userGirlMap.set(key, {
          ...conv,
          messages: uniqueMessages,
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
  const [isLoading, setIsLoading] = useState(false);

  // Format time function
  const formatTime = useCallback((timestamp) => {
    if (timestamp === 'now') return 'now';
    if (timestamp && (timestamp.includes('min ago') || timestamp.includes('hour ago'))) return timestamp;
    if (timestamp === 'Yesterday') return timestamp;
    return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }, []);

  // Enhanced fetch conversations with better error handling
  const fetchAllConversations = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/chatter/conversations`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.data.conversations) {
        console.log('Raw conversations from API:', res.data.conversations.length);
        
        const conversationsWithMessages = await Promise.all(
          res.data.conversations.map(async (conv) => {
            try {
              // Fetch messages for each conversation with proper validation
              const messagesRes = await axios.get(
                `${import.meta.env.VITE_API_BASE_URL}/chatter/conversations/${conv.conversation_id}/messages`,
                { headers: { Authorization: `Bearer ${token}` } }
              );

              const expectedUserIds = [conv.user_id, conv.girl_id];
              const rawMessages = Array.isArray(messagesRes.data) ? messagesRes.data : [];
              
              // Validate and format messages
              const messages = rawMessages
                .filter(msg => {
                  // Strict validation: message must belong to this conversation's participants
                  const isValidSender = expectedUserIds.includes(msg.sender_id);
                  if (!isValidSender) {
                    console.warn(`Filtering out invalid message ${msg.id} with sender ${msg.sender_id} for conversation ${conv.conversation_id}`);
                  }
                  return isValidSender;
                })
                .map((msg) => ({
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
                  conversation_id: conv.conversation_id, // Add for extra validation
                }));

              // Deduplicate messages for this specific conversation
              const uniqueMessages = deduplicateMessages(messages, conv.conversation_id, expectedUserIds);

              // Format last message with proper prefix
              const lastMsg = uniqueMessages[uniqueMessages.length - 1];
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
                messages: uniqueMessages,
                participants: {
                  user: { id: conv.user_id, name: conv.user_name },
                  girl: { id: conv.girl_id, name: conv.girl_name }
                },
                lastActivity: new Date(conv.last_message_time).getTime(),
              };
            } catch (err) {
              console.error(`Failed to fetch messages for conversation ${conv.conversation_id}:`, err);
              // Return conversation without messages rather than failing completely
              return {
                conversation_id: conv.conversation_id,
                user_id: conv.user_id,
                girl_id: conv.girl_id,
                user_name: conv.user_name,
                girl_name: conv.girl_name,
                user_image: conv.user_image,
                girl_image: conv.girl_image,
                last_message: 'Tap to continue...',
                last_message_time: conv.last_message_time,
                locked_by: conv.locked_by,
                messages: [],
                participants: {
                  user: { id: conv.user_id, name: conv.user_name },
                  girl: { id: conv.girl_id, name: conv.girl_name }
                },
                lastActivity: new Date(conv.last_message_time).getTime(),
              };
            }
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

  // Enhanced message fetching with strict validation
  const fetchMessagesForConversation = useCallback(async (conversationId) => {
    if (!conversationId) return;
    
    try {
      const token = localStorage.getItem('token');
      const messagesRes = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/chatter/conversations/${conversationId}/messages`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const rawMessages = Array.isArray(messagesRes.data) ? messagesRes.data : [];
      
      // Get expected user IDs from current conversations
      const conversation = conversations.find(c => c.conversation_id === conversationId);
      if (!conversation) {
        console.warn(`No conversation found for ID ${conversationId}`);
        return;
      }
      
      const expectedUserIds = [conversation.user_id, conversation.girl_id];
      
      // Validate and format messages with strict filtering
      const messages = rawMessages
        .filter(msg => {
          const isValidSender = expectedUserIds.includes(msg.sender_id);
          const hasValidStructure = msg.id && msg.sender_id && msg.content;
          
          if (!isValidSender) {
            console.warn(`Filtering message ${msg.id}: sender ${msg.sender_id} not in expected users [${expectedUserIds.join(', ')}]`);
          }
          if (!hasValidStructure) {
            console.warn(`Filtering message: invalid structure`, msg);
          }
          
          return isValidSender && hasValidStructure;
        })
        .map((msg) => ({
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
          conversation_id: conversationId, // Add for validation
        }));

      // Deduplicate messages
      const uniqueMessages = deduplicateMessages(messages, conversationId, expectedUserIds);

      // Update the specific conversation with new messages
      setConversations(prevConvs => {
        const updatedConvs = prevConvs.map(conv => {
          if (conv.conversation_id === conversationId) {
            // Format last message with proper prefix
            const lastMsg = uniqueMessages[uniqueMessages.length - 1];
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
              
              formattedLastMessage = lastMsg.senderId === conv.girl_id 
                ? `You: ${messageText}` 
                : messageText;
            }

            return {
              ...conv,
              messages: uniqueMessages,
              last_message: formattedLastMessage,
              lastActivity: uniqueMessages.length > 0 ? 
                new Date(uniqueMessages[uniqueMessages.length - 1].timestamp).getTime() : 
                conv.lastActivity,
            };
          }
          return conv;
        });
        
        return deduplicateConversationsByUserGirl(updatedConvs);
      });

    } catch (err) {
      console.error(`Failed to fetch messages for conversation ${conversationId}:`, err);
      toast({
        title: "Error",
        description: "Failed to load messages. Please try again.",
        variant: "destructive"
      });
    }
  }, [toast, formatTime, conversations]);

  // Memoized sorted conversations
  const sortedConversations = useMemo(() => {
    const uniqueConversations = deduplicateConversationsByUserGirl(conversations);
    return uniqueConversations.sort((a, b) => b.lastActivity - a.lastActivity);
  }, [conversations]);

  // Clear intervals and abort controllers when switching chats
  const clearAllPolling = useCallback(() => {
    // Clear any existing intervals (we'll track them in refs if needed)
    // This is handled by the useEffect cleanup functions
  }, []);

  // Enhanced handleSelectChat with race condition prevention
  const handleSelectChat = useCallback(async (conversation) => {
    if (isLoading) {
      console.log('Already loading, skipping chat selection');
      return;
    }
    
    setIsLoading(true);
    clearAllPolling();
    
    try {
      const token = localStorage.getItem('token');
      const currentUserId = JSON.parse(localStorage.getItem('userId'));

      // Clear current selection first to prevent mixing
      setSelectedChat(null);

      // Unlock previous chat if switching to a different one
      if (lockedChatId && lockedChatId !== conversation.conversation_id) {
        await unlockChat(lockedChatId, token);
        setLockedChatId(null);
      }

      // Fetch fresh messages for the selected conversation only
      const messagesRes = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/chatter/conversations/${conversation.conversation_id}/messages`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const expectedUserIds = [conversation.user_id, conversation.girl_id];
      const rawMessages = Array.isArray(messagesRes.data) ? messagesRes.data : [];
      
      // Strict validation for this specific conversation
      const validatedMessages = rawMessages
        .filter(msg => {
          const isValid = expectedUserIds.includes(msg.sender_id) && msg.id && msg.content;
          if (!isValid) {
            console.warn(`Rejecting message ${msg.id} for conversation ${conversation.conversation_id}`);
          }
          return isValid;
        })
        .map(msg => ({
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
          conversation_id: conversation.conversation_id, // Extra validation field
        }));

      // Deduplicate messages
      const uniqueMessages = deduplicateMessages(validatedMessages, conversation.conversation_id, expectedUserIds);

      const selectedChatData = {
        ...conversation,
        participants: {
          user: { id: conversation.user_id, name: conversation.user_name },
          girl: { id: conversation.girl_id, name: conversation.girl_name },
        },
        messages: uniqueMessages,
      };

      // Set selected chat with validated data
      setSelectedChat(selectedChatData);
      setSelectedChatId(conversation.conversation_id);

      // Lock this conversation
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
      console.error("Failed to load messages or lock chat", err);
      toast({ title: "Error", description: "Could not open or lock the chat." });
      setSelectedChat(null);
      setSelectedChatId(null);
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, lockedChatId, toast, formatTime, clearAllPolling]);

  // Initial fetch of conversations
  useEffect(() => {
    fetchAllConversations();
  }, [fetchAllConversations]);

  // Enhanced polling with better isolation
  useEffect(() => {
    let messageInterval;
    let conversationInterval;

    if (selectedChat && selectedChat.conversation_id) {
      const conversationId = selectedChat.conversation_id;
      const expectedUserIds = [selectedChat.user_id, selectedChat.girl_id];
      
      // Poll for new messages in the selected chat every 3 seconds
      messageInterval = setInterval(async () => {
        try {
          const token = localStorage.getItem('token');
          const res = await axios.get(
            `${import.meta.env.VITE_API_BASE_URL}/chatter/conversations/${conversationId}/messages`,
            { headers: { Authorization: `Bearer ${token}` } }
          );

          const rawMessages = Array.isArray(res.data) ? res.data : [];
          
          // Validate messages belong to this conversation
          const validatedMessages = rawMessages
            .filter(msg => expectedUserIds.includes(msg.sender_id) && msg.id)
            .map(msg => ({
              id: msg.id,
              senderId: msg.sender_id,
              text: msg.content,
              message_type: msg.message_type,
              gift_id: msg.gift_id,
              gift_name: msg.gift_name,
              gift_image_path: msg.gift_image_path,
              image_url: msg.image_url,
              timestamp: formatTime(msg.sent_at),
              conversation_id: conversationId,
            }));

          const uniqueMessages = deduplicateMessages(validatedMessages, conversationId, expectedUserIds);

          // Only update if this is still the selected chat (prevent race conditions)
          setSelectedChat(prev => {
            if (!prev || prev.conversation_id !== conversationId) {
              return prev; // Don't update if conversation changed
            }
            
            return {
              ...prev,
              messages: uniqueMessages,
            };
          });

          // Update conversation list
          setConversations(prevConvs => {
            const updatedConvs = prevConvs.map(conv => {
              if (conv.conversation_id === conversationId) {
                const lastMsg = uniqueMessages[uniqueMessages.length - 1];
                const formattedLastMessage = lastMsg 
                  ? (lastMsg.senderId === conv.girl_id ? `You: ${lastMsg.text}` : lastMsg.text)
                  : conv.last_message;
                
                return {
                  ...conv,
                  messages: uniqueMessages,
                  last_message: formattedLastMessage,
                  lastActivity: Date.now()
                };
              }
              return conv;
            });
            
            return deduplicateConversationsByUserGirl(updatedConvs);
          });

        } catch (err) {
          console.error("Message polling failed", err);
        }
      }, 3000);

      // Poll for new conversations every 30 seconds
      conversationInterval = setInterval(() => {
        fetchAllConversations();
      }, 30000);
    }

    return () => {
      if (messageInterval) clearInterval(messageInterval);
      if (conversationInterval) clearInterval(conversationInterval);
    };
  }, [selectedChat?.conversation_id, formatTime, fetchAllConversations]);

  // Enhanced handleSendMessage with better validation
  const handleSendMessage = async (socket) => {
    if (!message.trim() || !selectedChat || isLoading) return;

    const token = localStorage.getItem('token');
    const conversationId = selectedChat.conversation_id;
    const girlId = selectedChat.girl_id;
    const expectedUserIds = [selectedChat.user_id, selectedChat.girl_id];

    try {
      const res = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/chatter/conversations/chatter/${conversationId}/messages`,
        { content: message, girlId },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const newMsg = res.data.message;

      // Validate the new message
      if (!expectedUserIds.includes(newMsg.sender_id)) {
        console.error('Invalid sender in new message:', newMsg);
        return;
      }

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
        conversation_id: conversationId,
      };

      setMessage('');

      // Update selected chat immediately
      setSelectedChat(prev => {
        if (!prev || prev.conversation_id !== conversationId) {
          return prev;
        }
        
        // Check if message already exists
        const messageExists = prev.messages.some(msg => msg.id === formattedMessage.id);
        if (messageExists) {
          return prev;
        }
        
        return {
          ...prev,
          messages: [...prev.messages, formattedMessage]
        };
      });

      // Update conversations list
      setConversations(prevConvs => {
        const updatedConvs = prevConvs.map(conv => {
          if (conv.conversation_id === conversationId) {
            const messageExists = conv.messages?.some(msg => msg.id === formattedMessage.id);
            const updatedMessages = messageExists 
              ? conv.messages 
              : [...(conv.messages || []), formattedMessage];

            return {
              ...conv,
              messages: updatedMessages,
              last_message: `You: ${formattedMessage.text}`,
              last_message_time: newMsg.sent_at,
              lastActivity: Date.now()
            };
          }
          return conv;
        });

        return deduplicateConversationsByUserGirl(updatedConvs);
      });

      // Emit socket event
      if (socket) {
        socket.emit("newMessage", {
          conversation_id: conversationId,
          ...newMsg
        });
      }

    } catch (err) {
      console.error('Send message error:', err);
      toast({ title: 'Error', description: 'Failed to send message.' });
    }
  };

  const handleBackToInbox = async () => {
    clearAllPolling();
    const token = localStorage.getItem('token');
    
    try {
      if (selectedChat && lockedChatId) {
        await unlockChat(selectedChat.conversation_id, token);
      }

      setSelectedChat(null);
      setSelectedChatId(null);
      setIsLockedByYou(false);
      setIsLockedByOther(false);
      setLockHolderName('');
      setLockedChatId(null);
    } catch (err) {
      console.error("Failed to unlock conversation", err);
      toast({ title: "Error", description: "Failed to release lock." });
    }
  };

  // Other handlers remain the same but with enhanced validation...
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
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        conversation_id: Date.now(),
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
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        conversation_id: Date.now(),
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
    fetchAllConversations,
    isLoading,
  };
};