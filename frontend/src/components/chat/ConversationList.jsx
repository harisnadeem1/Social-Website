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
    return lastMessage.sent_at || lastMessage.rawTimestamp || conversation.lastActivity || 0;
  };

  // Filter out conversations that don't have any messages
  const conversationsWithMessages = conversations.filter(conversation => {
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
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else {
      const datePart = date.toLocaleDateString([], { month: 'short', day: 'numeric' });
      const timePart = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      return `${datePart}, ${timePart}`;
    }
  };

  // Function to check if conversation has new messages from other person
  const hasNewMessages = (conversation) => {
    if (!conversation.messages || conversation.messages.length === 0) return false;

    const lastMessage = conversation.messages[conversation.messages.length - 1];
    return lastMessage.senderId !== currentUserId;
  };

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Header - Hidden on mobile, visible on desktop */}
      <div className="hidden sm:block px-6 py-4 border-b sticky top-16 z-40 bg-white">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">
            Messages
          </h2>
          {isLoading && (
            <Loader2 className="w-5 h-5 animate-spin text-pink-500" />
          )}
        </div>
      </div>

      {/* Search Bar */}
      <div className="px-4 sm:px-6 py-3 sm:py-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search conversations..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all"
            disabled={isLoading}
          />
          {/* Show loader on mobile in search bar area */}
          {isLoading && (
            <Loader2 className="sm:hidden absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin text-pink-500" />
          )}
        </div>
      </div>

      {/* Conversations List */}
      <div className="flex-1 overflow-y-auto">
        <AnimatePresence>
          {filteredConversations.map((conversation, index) => {
            const showNewMessagesBadge = hasNewMessages(conversation);
            const latestMessageTime = getLatestMessageTime(conversation);

            return (
              <motion.div
                key={conversation.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="px-4 sm:px-6 py-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 active:bg-gray-100 transition-colors"
                onClick={() => !isLoading && onSelectChat(conversation)}
              >
                <div className="flex items-start gap-3">
                  {/* Avatar */}
                  <div className="relative flex-shrink-0">
                    <Avatar className="w-14 h-14 sm:w-12 sm:h-12">
                      <AvatarImage src={conversation.avatar} alt={conversation.name} />
                      <AvatarFallback className="bg-gradient-to-br from-pink-400 to-purple-500 text-white font-medium">
                        {conversation.name?.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    {conversation.online && (
                      <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 border-2 border-white rounded-full"></div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <h3 className={`text-sm sm:text-base truncate ${showNewMessagesBadge ? 'font-semibold text-gray-900' : 'font-medium text-gray-800'}`}>
                          {conversation.name}
                        </h3>
                        {conversation.is_verified && (
                          <img
                            src="/bluetick/verified.png"
                            alt="Verified"
                            className="w-4 h-4 flex-shrink-0"
                            title="Verified Profile"
                            onError={(e) => {
                              e.target.style.display = 'none';
                            }}
                          />
                        )}
                      </div>
                      <span className="text-xs text-gray-500 flex-shrink-0">
                        {formatTime(latestMessageTime)}
                      </span>
                    </div>

                    <div className="flex items-center justify-between gap-2">
                      <p className={`text-sm truncate ${showNewMessagesBadge ? 'font-medium text-gray-700' : 'text-gray-500'}`}>
                        {conversation.lastMessage === 'You: null'
                          ? '🎁 You sent a gift'
                          : conversation.lastMessage}
                      </p>
                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        {showNewMessagesBadge && (
                          <Badge className="bg-pink-500 hover:bg-pink-500 text-white text-xs px-2 py-0.5 rounded-full">
                            New
                          </Badge>
                        )}
                        {conversation.unread > 0 && (
                          <Badge className="bg-red-500 hover:bg-red-500 text-white text-xs px-2 py-0.5 rounded-full min-w-[20px] flex items-center justify-center">
                            {conversation.unread}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {/* Empty State */}
        {!isLoading && filteredConversations.length === 0 && (
          <div className="flex items-center justify-center py-12 px-4">
            <div className="text-center max-w-xs">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-gray-900 font-medium mb-1">
                {searchTerm ? 'No conversations found' : 'No messages yet'}
              </p>
              <p className="text-sm text-gray-500">
                {searchTerm 
                  ? 'Try searching with different keywords' 
                  : conversationsWithMessages.length === 0 && conversations.length > 0
                    ? 'Start messaging to see conversations here'
                    : 'Your conversations will appear here'}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ConversationList;