import { React, useState } from 'react';
import { Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { motion, AnimatePresence } from 'framer-motion';
const ConversationList = ({ conversations, onSelectChat }) => {
  const [searchTerm, setSearchTerm] = useState('');

const sortedConversations = [...conversations].sort(
  (a, b) => b.lastActivity - a.lastActivity
);

const filteredConversations = sortedConversations.filter((conversation) =>
  conversation.name.toLowerCase().includes(searchTerm.toLowerCase())
);

  console.log(conversations);
  console.log("===========Conv");



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

      <div className="mb-2 px-2">
        <input
          type="text"
          placeholder="Search..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-3 py-2 text-sm border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="flex-1 overflow-y-auto">
        <AnimatePresence>
        {filteredConversations.map((conversation, index) => (

          <motion.div key={conversation.id}
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 10 }}
        transition={{ duration: 0.2 }}
        whileHover={{ scale: 1.01 }}
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
                    {formatTime(conversation.lastActivity)}
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
        )
        )}</AnimatePresence>
      </div>
    </div>
  );
};

export default ConversationList;