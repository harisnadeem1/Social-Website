import React from 'react';
import { motion } from 'framer-motion';
import { Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';

const ConversationList = ({ conversations, onSelectChat, formatTime }) => {


  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">Messages</h2>
          {/* <Button variant="ghost" size="sm">
            <Search className="w-4 h-4" />
          </Button> */}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {conversations.map((conversation) => (
          <motion.div
                     whileHover={{ scale: 1.01 }} // Optional small scale effect
                     className="p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors duration-200"
                     onClick={() => onSelectChat(conversation)}
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
                  <h3 className={`font-medium text-gray-900 truncate ${conversation.unread > 0 ? 'font-semibold' : ''}`}>
                    {conversation.name}
                  </h3>
                  <span className="text-xs text-gray-500 ml-2">
                    {formatTime(conversation.timestamp)}
                  </span>
                </div>
                <div className="flex items-center justify-between mt-1">
                  <p className={`text-sm text-gray-600 truncate ${conversation.unread > 0 ? 'font-medium' : ''}`}>
                    {conversation.lastMessage}
                  </p>
                  {conversation.unread > 0 && (
                    <Badge className="bg-pink-500 text-white text-xs ml-2">
                      {conversation.unread}
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default ConversationList;