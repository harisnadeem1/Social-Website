import React, { useRef, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Send, Smile, MoreVertical, Phone, Video, Lock, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button.jsx';
import { Input } from '@/components/ui/input.jsx';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar.jsx';
import useSocket from '../../hooks/useSocket';
import EmojiPicker from 'emoji-picker-react';

const ChatterChatWindow = ({
  selectedChat,
  message,
  setMessage,
  isTyping,
  onSendMessage,
  isLockedByOther,
  isLockedByYou,
  lockHolderName,
  allUsers,
  onBackToInbox,
}) => {
  const messagesEndRef = useRef(null);
  const { socket, newIncomingMessage } = useSocket();
  const [showMenu, setShowMenu] = useState(false);
  const [showUserProfileModal, setShowUserProfileModal] = useState(false);
  const [showGirlProfileModal, setShowGirlProfileModal] = useState(false);
  const [userProfileData, setUserProfileData] = useState(null);
  const [girlProfileData, setGirlProfileData] = useState(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [currentConversationId, setCurrentConversationId] = useState(null);

  // Track current conversation to prevent message mixing
  useEffect(() => {
    if (selectedChat?.conversation_id !== currentConversationId) {
      setCurrentConversationId(selectedChat?.conversation_id);
      // Clear any previous state when switching conversations
      setShowMenu(false);
      setShowUserProfileModal(false);
      setShowGirlProfileModal(false);
      setUserProfileData(null);
      setGirlProfileData(null);
      setShowEmojiPicker(false);
    }
  }, [selectedChat?.conversation_id, currentConversationId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [selectedChat?.messages]);

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (!isLockedByOther) onSendMessage();
    }
  };

  // Enhanced message handling with strict validation
  useEffect(() => {
    if (!selectedChat || !newIncomingMessage || !currentConversationId) return;

    // Only process messages for the current conversation
    if (newIncomingMessage.conversation_id !== currentConversationId) {
      console.log(`Ignoring message for conversation ${newIncomingMessage.conversation_id}, current is ${currentConversationId}`);
      return;
    }

    // Validate sender belongs to this conversation
    const expectedUserIds = [selectedChat.user_id, selectedChat.girl_id];
    if (!expectedUserIds.includes(newIncomingMessage.sender_id)) {
      console.warn(`Rejecting message with invalid sender ${newIncomingMessage.sender_id} for conversation ${currentConversationId}`);
      return;
    }

    const formatted = {
      id: newIncomingMessage.id || Date.now(),
      senderId: newIncomingMessage.sender_id,
      text: newIncomingMessage.content,
      message_type: newIncomingMessage.message_type || 'text',
      gift_id: newIncomingMessage.gift_id,
      gift_name: newIncomingMessage.gift_name,
      gift_image_path: newIncomingMessage.gift_image_path,
      image_url: newIncomingMessage.image_url,
      timestamp: formatTime(newIncomingMessage.sent_at),
      conversation_id: currentConversationId,
    };

    // Only add if message doesn't already exist and belongs to current conversation
    setSelectedChat((prev) => {
      if (!prev || prev.conversation_id !== currentConversationId) {
        return prev;
      }

      const messageExists = prev.messages.some(msg => msg.id === formatted.id);
      if (messageExists) {
        console.log(`Message ${formatted.id} already exists, skipping`);
        return prev;
      }

      console.log(`Adding new message ${formatted.id} to conversation ${currentConversationId}`);
      return {
        ...prev,
        messages: [...prev.messages, formatted],
      };
    });
  }, [newIncomingMessage, selectedChat, currentConversationId]);

  const formatTime = (timestamp) => {
    if (timestamp === 'now') return 'now';
    if (timestamp && (timestamp.includes('min ago') || timestamp.includes('hour ago'))) return timestamp;
    if (timestamp === 'Yesterday') return timestamp;
    return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (!selectedChat) {
    return (
      <div className="h-full flex-1 items-center justify-center bg-gray-50 hidden lg:flex">
        <div className="text-center">
          <div className="text-gray-400 text-lg mb-2">Select a conversation</div>
          <div className="text-gray-500 text-sm">Choose a chat from the sidebar to start engaging.</div>
        </div>
      </div>
    );
  }

  const userProfile = allUsers.find(u => u.id === selectedChat.participants.user.id);
  console.log('Current selectedChat:', selectedChat);

  const fetchProfileData = async (userId, setProfileFn) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/chatter/getProfilebyUserid/${userId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) throw new Error('Failed to fetch profile');

      const data = await response.json();
      setProfileFn(data);
    } catch (error) {
      console.error('Profile fetch error:', error.message);
    }
  };

  // Validate messages belong to current conversation
  const validMessages = selectedChat.messages?.filter(msg => {
    const expectedUserIds = [selectedChat.user_id, selectedChat.girl_id];
    const isValidSender = expectedUserIds.includes(msg.senderId);
    const hasConversationId = !msg.conversation_id || msg.conversation_id === selectedChat.conversation_id;
    
    if (!isValidSender) {
      console.warn(`Filtering out message ${msg.id} with invalid sender ${msg.senderId}`);
      return false;
    }
    
    if (!hasConversationId) {
      console.warn(`Filtering out message ${msg.id} from wrong conversation`);
      return false;
    }
    
    return true;
  }) || [];

  // Remove duplicate messages by ID
  const uniqueMessages = validMessages.filter((msg, index, arr) => 
    arr.findIndex(m => m.id === msg.id) === index
  );

  return (
    <div className="h-full flex flex-col flex-1">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 bg-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Button variant="ghost" size="sm" className="lg:hidden" onClick={onBackToInbox}>
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <Avatar className="w-10 h-10">
              <AvatarImage src={userProfile?.avatar} />
              <AvatarFallback>{selectedChat.participants.user.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-semibold text-gray-900">{selectedChat.participants.user.name}</h3>
              <p className="text-sm text-gray-500">
                Replying as {selectedChat.participants.girl.name}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <div className="relative">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowMenu(!showMenu)}
              >
                <MoreVertical className="w-4 h-4" />
              </Button>

              {showMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white border rounded-lg shadow-lg z-30">
                  <button
                    onClick={() => {
                      fetchProfileData(selectedChat.user_id, setUserProfileData);
                      setShowUserProfileModal(true);
                      setShowMenu(false);
                    }}
                    className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100"
                  >
                    User Profile
                  </button>

                  <button
                    onClick={() => {
                      fetchProfileData(selectedChat.girl_id, setGirlProfileData);
                      setShowGirlProfileModal(true);
                      setShowMenu(false);
                    }}
                    className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100"
                  >
                    Girl Profile
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
        {isLockedByOther ? (
          <div className="text-center p-3 bg-red-50 border border-red-200 rounded-lg flex items-center justify-center space-x-2">
            <Lock className="w-4 h-4 text-red-800" />
            <p className="text-sm text-red-800">
              This chat is locked by <strong>{lockHolderName}</strong>.
            </p>
          </div>
        ) : isLockedByYou && (
          <div className="text-center p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-center justify-center space-x-2">
            <Lock className="w-4 h-4 text-blue-800" />
            <p className="text-sm text-blue-800">
              You have locked this conversation.
            </p>
          </div>
        )}

        <AnimatePresence>
          {uniqueMessages.map((msg) => {
            const isGirlMessage = msg.senderId === selectedChat.participants.girl.id;
            return (
              <motion.div
                key={`${msg.id}-${selectedChat.conversation_id}`} // Ensure unique keys per conversation
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className={`flex ${isGirlMessage ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${isGirlMessage ? 'bg-pink-500 text-white rounded-br-md' : 'bg-white text-gray-900 rounded-bl-md shadow-sm'
                  }`}>
                  {msg.message_type === 'gift' ? (
                    <div className="flex flex-col items-center justify-center text-center">
                      <img
                        src={`/gifts/${msg.gift_image_path}`}
                        alt={msg.gift_name || 'Gift'}
                        className="w-16 h-16 object-contain mb-1"
                      />
                      <p className="text-xs font-medium">{msg.gift_name || 'Gift 🎁'}</p>
                    </div>
                  ) : msg.message_type === 'image' ? (
                    msg.status === 'uploading' ? (
                      <div className="w-48 h-48 bg-gray-200 flex items-center justify-center rounded-md">
                        <Loader2 className="animate-spin text-gray-500 w-6 h-6" />
                      </div>
                    ) : (
                      <img
                        src={msg.image_url}
                        alt="Sent Image"
                        className="w-48 h-auto rounded-md object-cover"
                      />
                    )
                  ) : (
                    <p className="text-sm">{msg.text}</p>
                  )}
                  <div className={`flex items-center justify-end mt-1 text-xs ${isGirlMessage ? 'text-pink-100' : 'text-gray-500'
                    }`}>
                    <span>{msg.timestamp}</span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 border-t border-gray-200 bg-white">
        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="sm" onClick={() => setShowEmojiPicker(prev => !prev)}>
            <Smile className="w-5 h-5 text-gray-500" />
          </Button>
          <Input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey && message.trim() && !isLockedByOther) {
                e.preventDefault();
                onSendMessage(socket);
              }
            }}
            placeholder={isLockedByOther ? "Chat is locked" : `Replying as ${selectedChat.participants.girl.name}...`}
            className="flex-1 border-gray-300 rounded-full"
            disabled={isLockedByOther}
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

          {/* Profile Modals */}
          {showUserProfileModal && userProfileData && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 px-4">
              <div className="bg-white rounded-lg max-w-md w-full p-6 relative">
                <button
                  className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
                  onClick={() => setShowUserProfileModal(false)}
                >
                  ✕
                </button>
                <div className="text-center">
                  <Avatar className="mx-auto w-20 h-20 mb-4">
                    <AvatarImage src={userProfileData.profile_image_url} />
                    <AvatarFallback>
                      {userProfileData.full_name?.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <h2 className="text-xl font-semibold">{userProfileData.full_name}</h2>
                  <p className="text-gray-500 text-sm mb-1">Age: {userProfileData.age}</p>
                  <p className="text-gray-500 text-sm mb-1">City: {userProfileData.city}</p>
                  <p className="text-gray-500 text-sm mb-1">Height: {userProfileData.height}</p>
                  <p className="text-gray-500 text-sm mb-1">Bio: {userProfileData.bio || "No bio available."}</p>
                  <p className="text-gray-500 text-sm mb-1">Interests: {userProfileData.interests || "Not mentioned."}</p>
                </div>
              </div>
            </div>
          )}

          {showGirlProfileModal && girlProfileData && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 px-4">
              <div className="bg-white rounded-lg max-w-md w-full p-6 relative">
                <button
                  className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
                  onClick={() => setShowGirlProfileModal(false)}
                >
                  ✕
                </button>
                <div className="text-center">
                  <Avatar className="mx-auto w-20 h-20 mb-4">
                    <AvatarImage src={girlProfileData.profile_image_url} />
                    <AvatarFallback>
                      {girlProfileData.full_name?.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <h2 className="text-xl font-semibold">{girlProfileData.full_name}</h2>
                  <p className="text-gray-500 text-sm mb-1">Age: {girlProfileData.age}</p>
                  <p className="text-gray-500 text-sm mb-1">City: {girlProfileData.city}</p>
                  <p className="text-gray-500 text-sm mb-1">Height: {girlProfileData.height}</p>
                  <p className="text-gray-500 text-sm mb-1">Bio: {girlProfileData.bio || "No bio available."}</p>
                  <p className="text-gray-500 text-sm mb-1">Interests: {girlProfileData.interests || "Not mentioned."}</p>
                </div>
              </div>
            </div>
          )}

          <Button
            onClick={() => onSendMessage(socket)}
            disabled={!message.trim() || isLockedByOther}
            className="bg-pink-500 hover:bg-pink-600 text-white rounded-full p-2"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ChatterChatWindow;