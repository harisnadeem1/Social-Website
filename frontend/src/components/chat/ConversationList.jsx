import { React, useState } from 'react';
import { Search, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { motion, AnimatePresence } from 'framer-motion';

const ConversationList = ({ conversations, onSelectChat, isLoading = false, currentUserId }) => {
  const [searchTerm, setSearchTerm] = useState('');

  // Helper function to get the latest message timestamp from a conversation
  const getLatestMessageTime = (conversation) => {
    if (!conversation.messages || conversation.messages.length === 0) {
      return conversation.lastActivity || 0;
    }
    
    const lastMessage = conversation.messages[conversation.messages.length - 1];
    // Handle both raw timestamps and sent_at dates
    return lastMessage.sent_at || lastMessage.rawTimestamp || conversation.lastActivity || 0;
  };

  // Filter out conversations that don't have any messages
  const conversationsWithMessages = conversations.filter(conversation => {
    // Check if conversation has messages array and it's not empty
    return conversation.messages && conversation.messages.length > 0;
  });

  // Sort conversations by the actual latest message timestamp
  const sortedConversations = [...conversationsWithMessages].sort((a, b) => {
    const timeA = getLatestMessageTime(a);
    const timeB = getLatestMessageTime(b);
    return timeB - timeA;
  });

  const filteredConversations = sortedConversations.filter((conversation) =>
    conversation.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    const now = new Date();

    const isToday = date.toDateString() === now.toDateString();

    if (isToday) {
      // Show only time like 10:30 PM
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else {
      // Show date + time like Jun 29, 10:30 PM
      const datePart = date.toLocaleDateString([], { month: 'short', day: 'numeric' });
      const timePart = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      return `${datePart}, ${timePart}`;
    }
  };

  // Function to check if conversation has new messages from other person
  const hasNewMessages = (conversation) => {
    if (!conversation.messages || conversation.messages.length === 0) return false;

    const lastMessage = conversation.messages[conversation.messages.length - 1];
    // Check if the last message was sent by someone other than current user
    return lastMessage.senderId !== currentUserId;
  };

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b border-gray-200 bg-white sticky top-16 z-40">
        <div className="flex justify-center items-center">
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            Messages
            {isLoading && (
              <Loader2 className="w-5 h-5 animate-spin text-pink-500" />
            )}
          </h2>
        </div>
      </div>

      <div className="mb-2 px-2">
        <input
          type="text"
          placeholder="Search..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-3 py-2 text-sm border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={isLoading}
        />
      </div>

      <div className="flex-1 overflow-y-auto">
        <AnimatePresence>
          {filteredConversations.map((conversation, index) => {
            const showNewMessagesBadge = hasNewMessages(conversation);
            const latestMessageTime = getLatestMessageTime(conversation);

            return (
              <motion.div
                key={conversation.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                transition={{ duration: 0.2 }}
                whileHover={{ scale: 1.01 }}
                className="p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors duration-200"
                onClick={() => !isLoading && onSelectChat(conversation)}
              >
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <Avatar className="w-12 h-12">
                      <AvatarImage src={conversation.avatar} alt={conversation.name} />
                      <AvatarFallback>
                        {conversation.name?.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    {conversation.online && (
                      <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className={`font-medium text-gray-900 truncate ${showNewMessagesBadge ? 'font-semibold' : ''}`}>
                        {conversation.name}
                      </h3>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs text-gray-500">
                          {formatTime(latestMessageTime)}
                        </span>
                        {showNewMessagesBadge && (
                          <Badge className="bg-pink-500 text-white text-xs px-2 py-1">
                            New
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center justify-between mt-1">
                      <p className={`text-sm text-gray-600 truncate ${showNewMessagesBadge ? 'font-medium' : ''}`}>
                        {conversation.lastMessage === 'You: null'
                          ? '🎁 You sent a gift'
                          : conversation.lastMessage}
                      </p>
                      {conversation.unread > 0 && (
                        <Badge className="bg-red-500 text-white text-xs ml-2">
                          {conversation.unread}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {!isLoading && filteredConversations.length === 0 && (
          <div className="flex items-center justify-center py-8">
            <div className="text-center">
              <p className="text-gray-500 text-sm">
                {searchTerm ? 'No conversations found' : 'No conversations yet'}
              </p>
              {searchTerm && (
                <p className="text-gray-400 text-xs mt-1">
                  Try searching with different keywords
                </p>
              )}
              {!searchTerm && conversationsWithMessages.length === 0 && conversations.length > 0 && (
                <p className="text-gray-400 text-xs mt-1">
                  Start messaging to see conversations here
                </p>
              )}
            </div>
          </div>
        )}

       
      </div>
    </div>
  );
};

export default ConversationList;