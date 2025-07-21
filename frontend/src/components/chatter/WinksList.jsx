import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar.jsx';
import { Button } from '@/components/ui/button.jsx';
import { Heart } from 'lucide-react';

const WinksList = ({ winks,  onWinkResponse }) => {
  const [selectedWink, setSelectedWink] = React.useState(null);
const [customMessage, setCustomMessage] = React.useState('');

  if (winks.length === 0) {
    return (
      <div className="p-4 text-center text-gray-500">
        <Heart className="w-12 h-12 mx-auto mb-2 text-gray-300" />
        <p>No recent winks.</p>
      </div>
    );
  }
  const handleWinkResponse = (wink) => {
    onWinkResponse(wink);
  };


  return (
    <div className="flex-1 overflow-y-auto">
      <AnimatePresence>
      {winks.map((wink) => {
        const fallback = wink.user_name?.[0]?.toUpperCase() || 'U';

        return (
          <motion.div
        key={wink.id}
        className="p-4 border-b border-gray-100"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, height: 0, margin: 0, padding: 0 }}
        transition={{ duration: 0.3 }}
      >
            <div className="flex items-center space-x-3">
              <Avatar className="w-12 h-12">
                <AvatarImage src={wink.user_image} />
                <AvatarFallback>{fallback}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium text-gray-900">{wink.user_name}</h3>
                  <span className="text-xs text-gray-500">
                    {new Date(wink.created_at).toLocaleString()}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mb-2">
                  Winked at {wink.girl_name}
                </p>
                <Button
  size="sm"
  className="bg-pink-500 hover:bg-pink-600 text-white"
  onClick={() => setSelectedWink(wink)}
>
  <Heart className="w-4 h-4 mr-1" />
  Respond
</Button>

              </div>
            </div>
          </motion.div>
        );
      })}
      </AnimatePresence>
      {selectedWink && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 px-4">
    <div className="bg-white rounded-lg max-w-md w-full p-6 relative">
      <button
        onClick={() => {
          setSelectedWink(null);
          setCustomMessage('');
        }}
        className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
      >
        ✕
      </button>
      <h2 className="text-lg font-semibold mb-2 text-center">Send a message to {selectedWink.user_name}</h2>
      <textarea
        value={customMessage}
        onChange={(e) => setCustomMessage(e.target.value)}
        placeholder="Write your custom message here..."
        className="w-full border border-gray-300 rounded-md p-2 h-24 resize-none mb-4"
      />
      <Button
        className="w-full bg-pink-500 hover:bg-pink-600 text-white"
        onClick={async () => {
          await onWinkResponse(selectedWink, customMessage);
          setSelectedWink(null);
          setCustomMessage('');
        }}
        disabled={!customMessage.trim()}
      >
        Send Message
      </Button>
    </div>
  </div>
)}

    </div>
  );
};

export default WinksList;
