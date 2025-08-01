import React from 'react';
import { motion } from 'framer-motion';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar.jsx';
import { Badge } from '@/components/ui/badge.jsx';
import { Lock, MessageSquare, ArrowRight } from 'lucide-react';
import { formatTime } from '../../utils/formatters';

const ChatterConversationList = ({
  conversations,
  onSelectChat,
  currentChatterId,
  activeGirl,
}) => {
  
  // Function to check if conversation has new messages from the user (not from current chatter/girl)
  const hasNewMessages = (conversation) => {
    if (!conversation.messages || conversation.messages.length === 0) return false;
    
    const lastMessage = conversation.messages[conversation.messages.length - 1];
    // Check if the last message was sent by the user (not by the girl/chatter)
    // Show "New" if user sent the last message (needs chatter response)
    return lastMessage.senderId === conversation.user_id;
  };

  if (conversations.length === 0) {
    return (
      <div className="p-4 text-center text-gray-500">
        <MessageSquare className="w-12 h-12 mx-auto mb-2 text-gray-300" />
        <p>No conversations found.</p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto">
      {conversations.map((conversation) => {
        const isLockedByOther = conversation.locked_by && conversation.locked_by !== currentChatterId;
        const showNewMessagesBadge = hasNewMessages(conversation);

        return (
          <motion.div
            key={conversation.conversation_id || conversation.id}
            whileHover={{ scale: 1.01 }} // Optional small scale effect
            className="p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors duration-200"
            onClick={() => onSelectChat(conversation)}
          >
            <div className="flex items-center space-x-3">
              <div className="relative">
                <Avatar className="w-12 h-12">
                  <AvatarImage src={conversation.user_image || conversation.girl_image} />
                  <AvatarFallback>
                    {(conversation.user_name || conversation.girl_name)?.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <div className="flex flex-col text-sm font-medium text-gray-900 truncate">
                    <div className="flex items-center justify-between">
                      <span className={`truncate ${showNewMessagesBadge ? 'font-semibold' : ''}`}>
                        {conversation.user_name}
                      </span>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs text-gray-500">{formatTime(conversation.last_message_time)}</span>
                        {showNewMessagesBadge && (
                          <Badge className="bg-pink-500 text-white text-xs px-2 py-1">
                            New
                          </Badge>
                        )}
                      </div>
                    </div>
                    <span className="text-sm text-gray-600 truncate">{conversation.girl_name}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between mt-1">
                  <p className={`text-sm text-gray-600 truncate ${showNewMessagesBadge ? 'font-medium' : ''}`}>
                    {conversation.last_message}
                  </p>
                  <div className="flex items-center space-x-2">
                    {isLockedByOther && <Lock className="w-3 h-3 text-red-500" />}
                    {/* If unread count exists in future */}
                    {/* {conversation.unread > 0 && (
                      <Badge className="bg-red-500 text-white text-xs">{conversation.unread}</Badge>
                    )} */}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
};

export default ChatterConversationList;