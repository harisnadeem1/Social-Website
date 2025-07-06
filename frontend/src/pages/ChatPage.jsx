import React, { useState, useEffect, useContext, useCallback, useMemo, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import Header from '@/components/Header';
import MobileHeader from '@/components/MobileHeader';
import ConversationList from '@/components/chat/ConversationList';
import ChatWindow from '@/components/chat/ChatWindow';
import AuthContext from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { io } from 'socket.io-client';

const now = Date.now();

const ChatPage = () => {
  const [searchParams] = useSearchParams();
  const { user, coins, updateCoins } = useContext(AuthContext);
  const { toast } = useToast();
  const [selectedChatId, setSelectedChatId] = useState(null);
  const [message, setMessage] = useState('');
  const [showInbox, setShowInbox] = useState(true);
  const [isTyping, setIsTyping] = useState(false);
  const [conversations, setConversations] = useState([]);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [isLoadingConversations, setIsLoadingConversations] = useState(false);
  const hasHandledSearchParams = useRef(false);

  // ✅ Use ref to store socket instance
  const socketRef = useRef(null);

  // ✅ Create socket connection once and clean up properly
  useEffect(() => {
    // Create socket connection
    const socket = io(import.meta.env.VITE_SOCKET_URL, {
      withCredentials: true,
    });

    socketRef.current = socket;

    // Connection handlers
    socket.on("connect", () => {
    });

    socket.on("disconnect", () => {
    });

    // Cleanup function
    return () => {
      socket.off("connect");
      socket.off("disconnect");
      socket.disconnect();
      socketRef.current = null;
    };
  }, []); // Empty dependency array - runs once on mount

  // Join chat room when selectedChatId changes
  useEffect(() => {
    if (selectedChatId && socketRef.current) {
      socketRef.current.emit("join_chat", `chat-${selectedChatId}`);
    }
  }, [selectedChatId]);

  // Handle incoming messages
  useEffect(() => {
    if (!socketRef.current) return;

    const handleReceiveMessage = (incomingMessage) => {
      setConversations((prevConvs) =>
        prevConvs.map((conv) => {
          
          if (conv.id === selectedChatId) {
            if(conv.girlId === incomingMessage.senderId ){//&&  conv.receiverId === user?.id){
            const updatedMessages = [
              ...conv.messages,
              {
                id: incomingMessage.id,
                text: incomingMessage.text,
                senderId: incomingMessage.senderId,
                timestamp: new Date(incomingMessage.timestamp).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                }),
                status: 'delivered'
              }
            ];

            return {
              ...conv,
              messages: updatedMessages,
              // Incoming message from other person, don't add "You:" prefix
              lastMessage: incomingMessage.text,
              lastActivity: Date.now()
            };
          }
        }
          return conv;
        })
      );
    };

    socketRef.current.on("receive_message", handleReceiveMessage);

    return () => {
      if (socketRef.current) {
        socketRef.current.off("receive_message", handleReceiveMessage);
      }
    };
  }, [selectedChatId]);

  // Function to fetch all conversations
  const fetchAllConversations = useCallback(async () => {
    setIsLoadingConversations(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/users/me/conversations`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const data = await res.json();

      if (data.conversations) {
        const conversationsWithMessages = await Promise.all(
          data.conversations.map(async (conv) => {
            // Fetch messages for each conversation
            const messagesRes = await fetch(`${import.meta.env.VITE_API_BASE_URL}/messages/${conv.conversation_id}`, {
              headers: {
                Authorization: `Bearer ${token}`
              }
            });

            const messagesData = await messagesRes.json();
            const messages = Array.isArray(messagesData.messages)
              ? messagesData.messages.map((msg) => ({
                id: msg.id,
                text: msg.content,
                message_type: msg.message_type,
                gift_id: msg.gift_id,
                gift_name: msg.gift_name,
                gift_image_path: msg.gift_image_path,
                image_url: msg.image_url,
                senderId: msg.sender_id,
                timestamp: new Date(msg.sent_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                status: 'delivered',
              }))
              : [];

            // Format last message with "You:" prefix if sent by current user
            const lastMsg = messages[messages.length - 1];
            let formattedLastMessage = 'Tap to continue...';
            if (lastMsg) {
              formattedLastMessage = lastMsg.senderId === user?.id
                ? `You: ${lastMsg.text}`
                : lastMsg.text;
            }

            return {
              id: conv.conversation_id,
              girlId: conv.girl_id,
              name: conv.girl_name,
              avatar: conv.avatar || '/default-avatar.jpg',
              lastMessage: formattedLastMessage,
              timestamp: 'now',
              unread: 0,
              online: true,
              messages: messages,
              lastActivity: new Date(conv.last_activity).getTime(),
            };
          })
        );

        setConversations(conversationsWithMessages);
      }
    } catch (err) {
      console.error('Failed to fetch conversations:', err);
      toast({
        title: "Error",
        description: "Failed to reload conversation list. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoadingConversations(false);
    }
  }, [toast, user?.id]);

  // Function to fetch messages for a specific conversation
  const fetchMessagesForConversation = useCallback(async (conversationId) => {
    setIsLoadingMessages(true);
    try {
      const token = localStorage.getItem('token');
      const messagesRes = await fetch(`${import.meta.env.VITE_API_BASE_URL}/messages/${conversationId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      const messagesData = await messagesRes.json();
      const messages = Array.isArray(messagesData.messages)
        ? messagesData.messages.map((msg) => ({
          id: msg.id,
          text: msg.content,
          message_type: msg.message_type,
          gift_id: msg.gift_id,
          gift_name: msg.gift_name,
          gift_image_path: msg.gift_image_path,
          image_url: msg.image_url,
          senderId: msg.sender_id,
          timestamp: new Date(msg.sent_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          status: 'delivered',
        }))
        : [];

      // Update the specific conversation with new messages
      setConversations(prevConvs =>
        prevConvs.map(conv => {
          if (conv.id === conversationId) {
            // Format last message with "You:" prefix if sent by current user
            const lastMsg = messages[messages.length - 1];
            let formattedLastMessage = 'Tap to continue...';
            if (lastMsg) {
              formattedLastMessage = lastMsg.senderId === user?.id
                ? `You: ${lastMsg.text}`
                : lastMsg.text;
            }

            return {
              ...conv,
              messages: messages,
              lastMessage: formattedLastMessage,
            };
          }
          return conv;
        })
      );

      // console.log(`Messages reloaded for conversation ${conversationId}`);
    } catch (err) {
      console.error(`Failed to fetch messages for conversation ${conversationId}:`, err);
      toast({
        title: "Error",
        description: "Failed to load messages. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoadingMessages(false);
    }
  }, [toast, user?.id]);

  // Initial fetch of conversations
  useEffect(() => {
    fetchAllConversations();
  }, [fetchAllConversations]);

  // Handle URL parameters
  useEffect(() => {
    if (hasHandledSearchParams.current || conversations.length === 0) return;

    const userIdParam = searchParams.get('user');
    if (!userIdParam) return;

    const matched = conversations.find(c => String(c.girlId) === userIdParam);
    if (matched) {
      setSelectedChatId(matched.id);
      setShowInbox(false);
      hasHandledSearchParams.current = true;
    }
  }, [searchParams, conversations]);

  // Reload messages and conversation list whenever a chat is selected
  useEffect(() => {
    if (selectedChatId) {
      // Reload the conversation list first
      fetchAllConversations().then(() => {
        // Then reload messages for the selected chat
        fetchMessagesForConversation(selectedChatId);
      });
    }
  }, [selectedChatId, fetchMessagesForConversation, fetchAllConversations]);

  const selectedChat = useMemo(() =>
    conversations.find(c => c.id === selectedChatId),
    [conversations, selectedChatId]
  );

  const formatTime = useCallback((timestamp) => {
    if (timestamp === 'now') return 'now';
    if (timestamp.includes('min ago') || timestamp.includes('hour ago')) return timestamp;
    if (timestamp === 'Yesterday') return timestamp;
    return timestamp;
  }, []);

  const handleSelectChat = useCallback((chat) => {
    setSelectedChatId(chat.id);
    setShowInbox(false);
    // Messages will be automatically reloaded due to the useEffect above
  }, []);

  const handleBackToInbox = useCallback(() => {
    fetchAllConversations();
    setShowInbox(true);
    setSelectedChatId(null);
  }, []);

  const handleSendMessage = useCallback(async () => {
    if (!message.trim() || !selectedChatId || !user) return;

    const messageCost = 5;
    if (coins < messageCost) {
      toast({
        title: "Insufficient Coins",
        description: `You need ${messageCost} coins to send a message. Buy coins now!`,
        variant: "destructive",
        action: (
          <Button
            size="sm"
            onClick={() => window.location.href = '/coins'}
            className="bg-yellow-500 hover:bg-yellow-600 text-white"
          >
            Buy Coins
          </Button>
        )
      });
      return;
    }

    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/messages/${selectedChatId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ content: message.trim() })
      });

      if (!res.ok) throw new Error('Failed to send message');

      const responseData = await res.json();

      const newMessage = {
        id: responseData.message.id,
        text: responseData.message.content,
        senderId: user.id,
        timestamp: new Date(responseData.message.sent_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        status: 'sent'
      };

      updateCoins(coins - messageCost);
      setMessage('');

      setConversations(prevConvs =>
        prevConvs.map(conv => {
          if (conv.id === selectedChatId) {
            return {
              ...conv,
              messages: [...conv.messages, newMessage],
              lastMessage: `You: ${newMessage.text}`,
              timestamp: 'now',
              lastActivity: Date.now()
            };
          }
          return conv;
        }).sort((a, b) => b.lastActivity - a.lastActivity)
      );

      toast({
        title: "Message Sent! 💬",
        description: `Message sent! (${messageCost} coins used)`,
      });
    } catch (err) {
      console.error("Send message error:", err);
      toast({
        title: "Error",
        description: err.message || "Could not send message. Try again later.",
        variant: "destructive"
      });
    }
  }, [message, selectedChatId, coins, updateCoins, toast, user]);

  return (
    <div className="min-h-screen bg-white">
      <Helmet>
        <title>Messages - Liebenly</title>
        <meta name="description" content="Chat with your matches on Liebenly. Send messages, connect with singles, and build meaningful relationships." />
      </Helmet>

      <Header />
      <MobileHeader />

      <div className="h-[calc(100vh-4rem)] lg:h-[calc(100vh-5rem)]">
        <div className="h-full flex">
          <div className={`${showInbox ? 'block' : 'hidden'} lg:block w-full lg:w-80 border-r border-gray-200 bg-white`}>
            <ConversationList
              conversations={conversations}
              onSelectChat={handleSelectChat}
              isLoading={isLoadingConversations}
              currentUserId={user?.id}
            />
          </div>

          <div className={`${!showInbox ? 'block' : 'hidden'} lg:block flex-1`}>
            <ChatWindow
              selectedChat={selectedChat}
              message={message}
              setMessage={setMessage}
              isTyping={isTyping}
              onSendMessage={handleSendMessage}
              onBackToInbox={handleBackToInbox}
              currentUserId={user?.id}
              isChatter={user?.role === 'chatter'}
              isLoadingMessages={isLoadingMessages}
              setConversations={setConversations} // ✅ ADD THIS
              refreshConversations={fetchAllConversations}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatPage;