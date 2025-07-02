import React, { useRef, useEffect, useContext, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Send, Smile, MoreVertical, Phone, Video, Loader2, Gift ,X} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import AuthContext from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import EmojiPicker from 'emoji-picker-react';

import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu';

import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

const ChatWindow = ({
  selectedChat,
  message,
  setMessage,
  isTyping,
  onSendMessage,
  onBackToInbox,
  currentUserId,
  isChatter = false,
  setConversations,
  isLoadingMessages = false
}) => {
  const { user, coins } = useContext(AuthContext);
  const { toast } = useToast();
  const messagesEndRef = useRef(null);

  const identity = currentUserId || user?.id;
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showGiftPopup, setShowGiftPopup] = useState(false);
  const [giftList, setGiftList] = useState([]);

  const inputBarRef = useRef(null);

  const navigate = useNavigate();

  const handleDeleteChat = async (chatId) => {
    try {
      await axios.delete(`${BASE_URL}/conversations/${chatId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      toast({
        title: "Chat deleted",
        description: "The conversation has been removed.",
      });
      onBackToInbox();
    } catch (err) {
      console.error("Failed to delete chat:", err);
      toast({
        title: "Error",
        description: "Could not delete chat.",
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    const fetchGifts = async () => {
      try {
        const res = await axios.get(`${BASE_URL}/gifts/catalog`);
        setGiftList(res.data); // should return [{id, name, image_path, coin_cost}, ...]
      } catch (err) {
        console.error("Failed to load gift catalog:", err);
      }
    };

    fetchGifts();
  }, []);

  useEffect(() => {
    const fetchProfileId = async () => {
      if (selectedChat?.userId) {
        const res = await fetch(`${BASE_URL}/profiles/user/${selectedChat.girlId}`);
        const data = await res.json();
        setSelectedChat(prev => ({
          ...prev,
          girlId: data.profileId
        }));
      }
    };

    fetchProfileId();
  }, [selectedChat?.girlId]);



  const handleShowProfile = async (userId) => {
    try {
      const token = localStorage.getItem("token");

      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/profile/user/${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (data?.profileId) {
        navigate(`/profile/${data.profileId}`);
      } else {
        toast({
          title: "Error",
          description: "Profile not found.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Failed to fetch profile ID", error);
      toast({
        title: "Error",
        description: "Something went wrong while fetching profile.",
        variant: "destructive",
      });
    }
  };


  console.log("========selected chat")
  console.log(selectedChat)

  useEffect(() => {
    scrollToBottom();
  }, [selectedChat?.messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSendMessage();
    }
  };

  const handleInputChange = (e) => {
    setMessage(e.target.value);
  };






  const handleSendGift = async (gift) => {
    try {
      const res = await axios.post(`${BASE_URL}/messages/send-gift`, {
        conversationId: selectedChat.id,
        receiverId: selectedChat.participants.girl.id, // or selectedChat.girlId
        giftId: gift.id,
      }, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`
        }
      });

      setShowGiftPopup(false);
      toast({ title: "Gift Sent 🎁", description: `You sent ${gift.name}!` });

      // Optionally add to local chat messages
      setConversations(prev => {
        return prev.map(convo => {
          if (convo.id === selectedChat.id) {
            return {
              ...convo,
              messages: [...convo.messages, res.data.message] // if backend returns message
            };
          }
          return convo;
        });
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error?.response?.data?.message || "Not enough coins or failed to send.",
        variant: "destructive"
      });
    }
  };







  if (!selectedChat) {
    return (
      <div className="h-full flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="text-gray-400 text-lg mb-2">Select a conversation</div>
          <div className="text-gray-500 text-sm">Choose a chat from the sidebar to start messaging</div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b border-gray-200 bg-white sticky top-16 z-40">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Button
              variant="ghost"
              size="sm"
              className="lg:hidden"
              onClick={onBackToInbox}
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>

            <Avatar className="w-10 h-10">
              <AvatarImage src={selectedChat.avatar} alt={selectedChat.name} />
              <AvatarFallback>{selectedChat.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
            </Avatar>

            <div>
              <h3 className="font-semibold text-gray-900 flex items-center">
                {selectedChat.name}
                {isLoadingMessages && (
                  <Loader2 className="w-4 h-4 ml-2 animate-spin text-gray-500" />
                )}
              </h3>
              <p className="text-sm text-gray-500">
                {isChatter ? `Replying as ${selectedChat.participants.girl.name}` : (selectedChat.online ? 'Active now' : `Last seen ${selectedChat.lastSeen || '1 hour ago'}`)}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">

                <DropdownMenuItem onClick={() => handleShowProfile(selectedChat.girlId)}>
                  View Profile
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => handleDeleteChat(selectedChat.id)}
                  className="text-red-500"
                >
                  Delete Chat
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
        {!isChatter && (
          <div className="text-center p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800">
              💰 Each message costs 5 coins • Your balance: {coins} coins
            </p>
          </div>
        )}

        {isLoadingMessages ? (
          <div className="flex items-center justify-center py-8">
            <div className="text-center">
              <Loader2 className="w-8 h-8 animate-spin mx-auto text-gray-400 mb-2" />
              <p className="text-sm text-gray-500">Loading messages...</p>
            </div>
          </div>
        ) : (
          <AnimatePresence>
            {selectedChat.messages.map((msg) => {
              const isMyMessage = msg.senderId === identity;
              return (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className={`flex ${isMyMessage ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${isMyMessage
                    ? 'bg-pink-500 text-white rounded-br-md'
                    : 'bg-white text-gray-900 rounded-bl-md shadow-sm'
                    }`}>
                    <p className="text-sm">{msg.text}</p>
                    <div className={`flex items-center justify-between mt-1 text-xs ${isMyMessage ? 'text-pink-100' : 'text-gray-500'
                      }`}>
                      <span>{msg.timestamp}</span>
                      {isMyMessage && (
                        <span className="ml-2">
                          {msg.status === 'sent' && '✓'}
                          {msg.status === 'delivered' && '✓✓'}
                          {msg.status === 'read' && <span className="text-pink-200">✓✓</span>}
                        </span>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        )}

        {isTyping && !isLoadingMessages && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-start"
          >
            <div className="bg-white text-gray-900 rounded-2xl rounded-bl-md shadow-sm px-4 py-2">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
            </div>
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <div ref={inputBarRef} className="p-4 border-t border-gray-200 bg-white sticky bottom-0 z-20">
       <div className="flex items-center space-x-2">
          {/* Emoji button - only on desktop */}
          <div className="hidden lg:flex">
            <Button variant="ghost" size="sm" onClick={() => setShowEmojiPicker(prev => !prev)}>
              <Smile className="w-5 h-5 text-gray-500" />
            </Button>
          </div>

          {/* Input container with gift button inside */}
          <div className="relative flex-1">
            <Input
              value={message}
              onChange={handleInputChange}
              onFocus={() => {
                // Delay allows iOS keyboard to slide up before scrolling
                setTimeout(() => {
                  inputBarRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                  scrollToBottom(); // Also helps for Android
                }, 400);
              }}
              onKeyPress={handleKeyPress}
              placeholder={
                isChatter
                  ? `Replying as ${selectedChat.participants.girl.name}...`
                  : "Each message costs 5 coins..."
              }
              className="border-gray-300 rounded-full text-base pr-12" // Added right padding for gift button
              disabled={isLoadingMessages}
            />
            
            {/* Gift button inside input - shows on both mobile and desktop */}
            <Button
              variant="ghost"
              size="sm"
              className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0 hover:bg-gray-100"
              onClick={() => {
                setShowGiftPopup(prev => !prev);
                setShowEmojiPicker(false); // close emoji if open
                if (document.activeElement instanceof HTMLElement) {
                  document.activeElement.blur(); // close keyboard on mobile
                }
              }}
            >
              <Gift className="w-5 h-5 text-pink-500" />
            </Button>
          </div>

          {/* Emoji picker */}
          {showEmojiPicker && (
            <div className="absolute bottom-20 z-10">
              <EmojiPicker
                onEmojiClick={(emojiData) => {
                  setMessage((prev) => prev + emojiData.emoji);
                  setShowEmojiPicker(false);
                }}
              />
            </div>
          )}

          {/* Gift popup */}
          <AnimatePresence>
            {showGiftPopup && (
              <>
                {/* Mobile Backdrop */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 bg-black/50 z-50 lg:hidden"
                  onClick={() => setShowGiftPopup(false)}
                />

                {/* Mobile Gift Modal */}
                <motion.div
                  initial={{ opacity: 0, y: '100%' }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: '100%' }}
                  transition={{ type: 'spring', damping: 25, stiffness: 500 }}
                  className="fixed bottom-20 left-4 right-4 bg-white rounded-3xl z-50 max-h-[45vh] overflow-y-auto lg:hidden shadow-2xl"
                >
                  <div className="p-3">
                    {/* Header with close button */}
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-base font-semibold text-gray-900">Send a Gift 🎁</h3>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0 hover:bg-gray-100"
                        onClick={() => setShowGiftPopup(false)}
                      >
                        <X className="w-4 h-4 text-gray-500" />
                      </Button>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-3">
                      {giftList.map(gift => (
                        <div
                          key={gift.id}
                          className="flex flex-col items-center justify-center cursor-pointer hover:scale-105 transition"
                          onClick={() => handleSendGift(gift)}
                        >
                          <img src={`/gifts/${gift.image_path}`} alt={gift.name} className="w-12 h-12 object-contain" />
                          <p className="text-xs mt-1 text-center">{gift.coin_cost} 💰</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>

                {/* Desktop Popup (Fixed near input) */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="absolute bottom-24 right-2 bg-white rounded-xl shadow-lg w-[300px] max-h-[400px] overflow-y-auto hidden lg:block z-40"
                >
                  <div className="p-4">
                    {/* Header with close button for desktop */}
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-base font-semibold text-gray-900">Send a Gift 🎁</h3>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0 hover:bg-gray-100"
                        onClick={() => setShowGiftPopup(false)}
                      >
                        <X className="w-4 h-4 text-gray-500" />
                      </Button>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-4">
                      {giftList.map(gift => (
                        <div
                          key={gift.id}
                          className="flex flex-col items-center justify-center cursor-pointer hover:scale-105 transition"
                          onClick={() => handleSendGift(gift)}
                        >
                          <img src={`/gifts/${gift.image_path}`} alt={gift.name} className="w-12 h-12 object-contain" />
                          <p className="text-xs mt-1 text-center">{gift.coin_cost} 💰</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>

          {/* Send button */}
          <Button
            onClick={onSendMessage}
            disabled={!message.trim() || isLoadingMessages}
            className="bg-pink-500 hover:bg-pink-600 text-white rounded-full px-3 py-0"
            title={isChatter ? "Send Reply" : "Costs 5 coins per message"}
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>

    </div>
  );
};

export default ChatWindow;