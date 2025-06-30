import React, { useRef, useEffect, useContext, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Send, Smile, MoreVertical, Phone, Video, Loader2 } from 'lucide-react';
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

  console.log("selected chat")
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
      <div className="p-4 border-b border-gray-200 bg-white">
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
                <DropdownMenuItem onClick={() => navigate(`/profile/${selectedChat.girlId}`)}>
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

      <div className="p-4 border-t border-gray-200 bg-white">
        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="sm" onClick={() => setShowEmojiPicker(prev => !prev)}>
            <Smile className="w-5 h-5 text-gray-500" />
          </Button>
          <Input
            value={message}
            onChange={handleInputChange}
            onKeyPress={handleKeyPress}
            placeholder={isChatter ? `Replying as ${selectedChat.participants.girl.name}...` : "Each message costs 5 coins..."}
            className="flex-1 border-gray-300 rounded-full"
            disabled={isLoadingMessages}
          />

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
          <Button
            onClick={onSendMessage}
            disabled={!message.trim() || isLoadingMessages}
            className="bg-pink-500 hover:bg-pink-600 text-white rounded-full p-2"
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