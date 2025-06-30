import React, { useState, useEffect, useContext, useCallback, useMemo,useRef } from 'react';
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
  // const [conversations, setConversations] = useState(initialConversationsData);
  const [selectedChatId, setSelectedChatId] = useState(null);
  const [message, setMessage] = useState('');
  const [showInbox, setShowInbox] = useState(true);
  const [isTyping, setIsTyping] = useState(false);


  

  const [conversations, setConversations] = useState([]);
  const hasHandledSearchParams = useRef(false);



// ########################################


const socket = io(import.meta.env.VITE_SOCKET_URL, {
  withCredentials: true,
  // transports: ['websocket', 'polling'] // fallback to polling first
});




useEffect(() => {
  console.log("====================")
  console.log(selectedChatId);
  if (selectedChatId) {
    console.log("in join chat")
    socket.emit("join_chat", `chat-${selectedChatId}`);
  }
}, [selectedChatId]);




useEffect(() => {
  socket.on("connect", () => {
    console.log("✅ Socket connected to server with ID:", socket.id);
  });

  socket.on("disconnect", () => {
    console.log("❌ Socket disconnected");
  });

  return () => {
    socket.off("connect");
    socket.off("disconnect");
  };
}, []);




useEffect(() => {
  socket.on("receive_message", (incomingMessage) => {
    setConversations((prevConvs) =>
      prevConvs.map((conv) => {
        if (conv.id === selectedChatId) {
          return {
            ...conv,
            messages: [
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
            ],
          };
        }
        return conv;
      })
    );
  });

  return () => {
    socket.off("receive_message");
  };
}, [selectedChatId]);








// #########################################


useEffect(() => {
  const fetchConversations = async () => {
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
                  senderId: msg.sender_id,
                  timestamp: new Date(msg.sent_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                  status: 'delivered',
                }))
              : [];

            return {
              id: conv.conversation_id,
              girlId: conv.girl_id,
              name: conv.girl_name,
              avatar: conv.avatar || '/default-avatar.jpg',
              lastMessage: messages[messages.length - 1]?.text || 'Tap to continue...',
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
    }
  };

  fetchConversations();
}, []);



useEffect(() => {
  if (hasHandledSearchParams.current || conversations.length === 0) return;

  const userIdParam = searchParams.get('user');
  if (!userIdParam) return;

  const matched = conversations.find(c => String(c.girlId) === userIdParam);
  if (matched) {
    setSelectedChatId(matched.id);
    setShowInbox(false);
    hasHandledSearchParams.current = true; // ✅ prevent future re-runs
  }
}, [searchParams, conversations]);




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
  }, []);

  const handleBackToInbox = useCallback(() => {
    setShowInbox(true);
    setSelectedChatId(null);
  }, []);

  // const handleSendMessage = useCallback(() => {
  //   if (!message.trim() || !selectedChatId || !user) return;

  //   const messageCost = 5;

  //   if (coins < messageCost) {
  //     toast({
  //       title: "Insufficient Coins",
  //       description: `You need ${messageCost} coins to send a message. Buy coins now!`,
  //       variant: "destructive",
  //       action: (
  //         <Button 
  //           size="sm" 
  //           onClick={() => window.location.href = '/coins'}
  //           className="bg-yellow-500 hover:bg-yellow-600 text-white"
  //         >
  //           Buy Coins
  //         </Button>
  //       )
  //     });
  //     return;
  //   }

  //   updateCoins(coins - messageCost);
  //   toast({
  //     title: "Message Sent! 💬",
  //     description: `Message sent! (${messageCost} coins used)`,
  //   });

  //   const newMessage = {
  //     id: Date.now(),
  //     text: message,
  //     senderId: user.id,
  //     timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  //     status: 'sent'
  //   };

  //   setConversations(prevConvs => 
  //     prevConvs.map(conv => {
  //       if (conv.id === selectedChatId) {
  //         return {
  //           ...conv,
  //           messages: [...conv.messages, newMessage],
  //           lastMessage: `You: ${message}`,
  //           timestamp: 'now',
  //           lastActivity: Date.now()
  //         };
  //       }
  //       return conv;
  //     }).sort((a, b) => b.lastActivity - a.lastActivity)
  //   );

  //   setMessage('');

  //   setTimeout(() => {
  //     setIsTyping(true);
  //     setTimeout(() => {
  //       setIsTyping(false);
  //       const replyMessage = {
  //         id: Date.now() + 1,
  //         text: 'Thanks for your message! 😊',
  //         senderId: 'girl001', // This would be dynamic in a real app
  //         timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  //         status: 'delivered'
  //       };
        
  //       setConversations(prevConvs => 
  //         prevConvs.map(conv => {
  //           if (conv.id === selectedChatId) {
  //             return {
  //               ...conv,
  //               messages: [...conv.messages, replyMessage],
  //               lastMessage: replyMessage.text,
  //               timestamp: 'now',
  //               lastActivity: Date.now()
  //             };
  //           }
  //           return conv;
  //         }).sort((a, b) => b.lastActivity - a.lastActivity)
  //       );
  //     }, 2000);
  //   }, 1000);
  // }, [message, selectedChatId, coins, updateCoins, toast, user]);





  const handleSendMessage = useCallback(async () => {
  if (!message.trim() || !selectedChatId || !user) return;
  console.log(message);

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

    const responseData = await res.json(); // assuming API returns new message

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
        <title>Messages - FlirtDuo</title>
        <meta name="description" content="Chat with your matches on FlirtDuo. Send messages, connect with singles, and build meaningful relationships." />
      </Helmet>

      <Header />
      <MobileHeader />

      <div className="h-[calc(100vh-4rem)] lg:h-[calc(100vh-5rem)]">
        <div className="h-full flex">
          <div className={`${showInbox ? 'block' : 'hidden'} lg:block w-full lg:w-80 border-r border-gray-200 bg-white`}>
            <ConversationList 
              conversations={conversations}
              onSelectChat={handleSelectChat}
              formatTime={formatTime}
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
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatPage;