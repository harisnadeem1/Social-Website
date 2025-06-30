import React, { useContext, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Coins, Zap, Heart, Eye, MessageCircle, ChevronDown, ChevronUp, BarChart3 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import AuthContext from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';

const Sidebar = ({ onBoostClick }) => {
  const { coins } = useContext(AuthContext);
  const { toast } = useToast();
  const [showStats, setShowStats] = useState(false);

  const handleQuickAction = (action) => {
    toast({
      title: "🚧 This feature isn't implemented yet—but don't worry! You can request it in your next prompt! 🚀",
    });
  };

  const QuickActionsCard = () => (
    <Card className="border-0 shadow-lg bg-white">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold text-gray-900">
          Quick Actions
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <Button
          onClick={onBoostClick}
          className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white rounded-full"
        >
          <Zap className="w-4 h-4 mr-2" />
          Boost Profile
        </Button>
        <Link to="/coins" className="block">
          <Button
            variant="outline"
            className="w-full border-yellow-300 text-yellow-700 hover:bg-yellow-50 rounded-full"
          >
            <Coins className="w-4 h-4 mr-2" />
            Buy Coins
          </Button>
        </Link>
        {/* <Button
          variant="outline"
          onClick={() => handleQuickAction('likes')}
          className="w-full border-red-300 text-red-700 hover:bg-red-50 rounded-full"
        >
          <Heart className="w-4 h-4 mr-2" />
          View Likes
        </Button> */}
         <Link to="/chat" className="block">
        <Button
          variant="outline"
          onClick={() => handleQuickAction('messages')}
          className="w-full border-green-300 text-green-700 hover:bg-green-50 rounded-full"
        >
          <MessageCircle className="w-4 h-4 mr-2" />
          Messages
        </Button>
        </Link>
      </CardContent>
    </Card>
  );

  return (
    <aside className="w-full lg:w-80 lg:shrink-0">
      <div className="hidden">
        <Button
          variant="outline"
          onClick={() => setShowStats(!showStats)}
          className="w-full flex items-center justify-between"
        >
          <div className="flex items-center space-x-2">
            <BarChart3 className="w-4 h-4" />
            <span>View Stats</span>
          </div>
          {showStats ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </Button>

        <AnimatePresence>
          {showStats && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
              <Card className="border-0 shadow-lg bg-gradient-to-br from-pink-50 to-purple-50">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg font-semibold text-gray-900">
                    Your Stats
                  </CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-white/60 rounded-lg">
                    <div className="flex items-center justify-center mb-1"><Coins className="w-4 h-4 text-yellow-500 mr-1" /><span className="text-sm font-medium">Coins</span></div>
                    <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">{coins}</Badge>
                  </div>
                  <div className="text-center p-3 bg-white/60 rounded-lg">
                    <div className="flex items-center justify-center mb-1"><Heart className="w-4 h-4 text-red-500 mr-1" /><span className="text-sm font-medium">Likes</span></div>
                    <Badge variant="secondary" className="bg-red-100 text-red-800">5</Badge>
                  </div>
                  <div className="text-center p-3 bg-white/60 rounded-lg">
                    <div className="flex items-center justify-center mb-1"><Eye className="w-4 h-4 text-blue-500 mr-1" /><span className="text-sm font-medium">Views</span></div>
                    <Badge variant="secondary" className="bg-blue-100 text-blue-800">23</Badge>
                  </div>
                  <div className="text-center p-3 bg-white/60 rounded-lg">
                    <div className="flex items-center justify-center mb-1"><MessageCircle className="w-4 h-4 text-green-500 mr-1" /><span className="text-sm font-medium">Messages</span></div>
                    <Badge variant="secondary" className="bg-green-100 text-green-800">8</Badge>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
        <QuickActionsCard />
      </div>

      <div className="hidden lg:block sticky top-24">
        <div className="space-y-6">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }}>
            <Card className="border-0 shadow-lg bg-gradient-to-br from-pink-50 to-purple-50">
              <CardHeader className="pb-3"><CardTitle className="text-lg font-semibold text-gray-900">Your Stats</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between"><div className="flex items-center space-x-2"><Coins className="w-5 h-5 text-yellow-500" /><span className="font-medium">Coins</span></div><Badge variant="secondary" className="bg-yellow-100 text-yellow-800">{coins}</Badge></div>
                <div className="flex items-center justify-between"><div className="flex items-center space-x-2"><Zap className="w-5 h-5 text-orange-500" /><span className="font-medium">Boosted</span></div><Badge variant="secondary" className="bg-orange-100 text-orange-800">No</Badge></div>
                <div className="flex items-center justify-between"><div className="flex items-center space-x-2"><Heart className="w-5 h-5 text-red-500" /><span className="font-medium">New Likes</span></div><Badge variant="secondary" className="bg-red-100 text-red-800">5</Badge></div>
                <div className="flex items-center justify-between"><div className="flex items-center space-x-2"><Eye className="w-5 h-5 text-blue-500" /><span className="font-medium">Profile Views</span></div><Badge variant="secondary" className="bg-blue-100 text-blue-800">23</Badge></div>
                <div className="flex items-center justify-between"><div className="flex items-center space-x-2"><MessageCircle className="w-5 h-5 text-green-500" /><span className="font-medium">Messages</span></div><Badge variant="secondary" className="bg-green-100 text-green-800">8</Badge></div>
              </CardContent>
            </Card>
          </motion.div>
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6, delay: 0.1 }}>
            <QuickActionsCard />
          </motion.div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;