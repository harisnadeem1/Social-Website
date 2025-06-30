import React, { useRef, useEffect,useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Send, Smile, MoreVertical, Phone, Video, Lock } from 'lucide-react';
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


    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [selectedChat?.messages]);

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (!isLockedByOther) onSendMessage();
    }
  };

  useEffect(() => {
    if (!selectedChat || !newIncomingMessage) return;

    if (newIncomingMessage.conversation_id === selectedChat.conversation_id) {
      const formatted = {
        id: newIncomingMessage.id || Date.now(),
        senderId: newIncomingMessage.sender_id,
        text: newIncomingMessage.content,
        timestamp: formatTime(newIncomingMessage.sent_at),
      };

      setSelectedChat((prev) => ({
        ...prev,
        messages: [...prev.messages, formatted],
      }));
    }
  }, [newIncomingMessage]);

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

  return (
    <div className="h-full flex flex-col flex-1">
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
            <Button variant="ghost" size="sm"><Phone className="w-4 h-4" /></Button>
            <Button variant="ghost" size="sm"><Video className="w-4 h-4" /></Button>
            <Button variant="ghost" size="sm"><MoreVertical className="w-4 h-4" /></Button>
          </div>
        </div>
      </div>

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
          {selectedChat.messages.map((msg) => {
            const isGirlMessage = msg.senderId === selectedChat.participants.girl.id;
            return (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className={`flex ${isGirlMessage ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${isGirlMessage ? 'bg-pink-500 text-white rounded-br-md' : 'bg-white text-gray-900 rounded-bl-md shadow-sm'
                  }`}>
                  <p className="text-sm">{msg.text}</p>
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