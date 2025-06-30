import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sparkles, Heart, Eye, TrendingUp, Coins, Star, X } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import AuthContext from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';

const BoostModal = ({ open, onOpenChange }) => {
  const { coins, updateCoins } = useContext(AuthContext);
  const { toast } = useToast();
  const navigate = useNavigate();

  const boostCost = 50;

  const handleBoost = () => {
    if (coins >= boostCost) {
      updateCoins(coins - boostCost);
      onOpenChange(false);
      toast({
        title: "Your profile is now boosted! ✨",
        description: "You're featured at the top for 24 hours!",
      });
    } else {
      toast({
        title: "Insufficient Coins",
        description: `You need ${boostCost} coins to boost. Buy more now!`,
        variant: "destructive",
        action: (
          <Button 
            size="sm" 
            onClick={() => {
              onOpenChange(false);
              navigate('/coins');
            }}
            className="bg-yellow-500 hover:bg-yellow-600 text-white"
          >
            Buy Coins
          </Button>
        )
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] max-w-md sm:max-w-lg lg:max-w-xl bg-gradient-to-br from-pink-50 via-white to-purple-50 border-0 shadow-2xl max-h-[90vh] overflow-y-auto">
        <button
          onClick={() => onOpenChange(false)}
          className="absolute right-4 top-4 z-50 w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
        >
          <X className="w-4 h-4 text-gray-600" />
        </button>

        <DialogHeader className="pt-2">
          <DialogTitle className="flex items-center justify-center space-x-2 text-center text-xl sm:text-2xl">
            <Sparkles className="w-6 h-6 sm:w-7 sm:h-7 text-pink-500" />
            <span className="bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent font-bold">
              Boost Your Profile & Get Noticed
            </span>
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 sm:space-y-6 px-2">
          <div className="text-center">
            <div className="relative w-20 h-20 sm:w-24 sm:h-24 mx-auto mb-4">
              <div className="absolute inset-0 bg-gradient-to-r from-pink-400 via-purple-500 to-pink-500 rounded-full animate-pulse"></div>
              <div className="relative w-full h-full bg-gradient-to-r from-pink-500 to-purple-600 rounded-full flex items-center justify-center">
                <Heart className="w-10 h-10 sm:w-12 sm:h-12 text-white animate-pulse" />
              </div>
              <div className="absolute -top-2 -right-2 w-6 h-6 sm:w-8 sm:h-8 bg-yellow-400 rounded-full flex items-center justify-center">
                <Star className="w-3 h-3 sm:w-5 sm:h-5 text-white" />
              </div>
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">Stand out and attract more meaningful connections</h3>
            <p className="text-gray-600 text-sm">Get premium visibility and find your perfect match faster!</p>
          </div>

          <div className="space-y-3">
            <motion.div 
              whileHover={{ scale: 1.02 }}
              className="flex items-center space-x-3 sm:space-x-4 p-3 sm:p-4 bg-gradient-to-r from-pink-100 to-purple-100 rounded-xl border border-pink-200"
            >
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                <Heart className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <div className="min-w-0">
                <span className="font-semibold text-gray-900 text-sm sm:text-base">💘 Be seen first by everyone</span>
                <p className="text-xs sm:text-sm text-gray-600">Your profile appears at the top of all searches</p>
              </div>
            </motion.div>
            
            <motion.div 
              whileHover={{ scale: 1.02 }}
              className="flex items-center space-x-3 sm:space-x-4 p-3 sm:p-4 bg-gradient-to-r from-orange-100 to-pink-100 rounded-xl border border-orange-200"
            >
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-orange-500 to-pink-500 rounded-full flex items-center justify-center flex-shrink-0">
                <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <div className="min-w-0">
                <span className="font-semibold text-gray-900 text-sm sm:text-base">🔥 Appear at the top for 24 hours</span>
                <p className="text-xs sm:text-sm text-gray-600">Maximum exposure during peak activity times</p>
              </div>
            </motion.div>
            
            <motion.div 
              whileHover={{ scale: 1.02 }}
              className="flex items-center space-x-3 sm:space-x-4 p-3 sm:p-4 bg-gradient-to-r from-purple-100 to-blue-100 rounded-xl border border-purple-200"
            >
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                <Eye className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <div className="min-w-0">
                <span className="font-semibold text-gray-900 text-sm sm:text-base">💎 Triple your profile views and matches</span>
                <p className="text-xs sm:text-sm text-gray-600">Get 3x more likes, winks, and messages</p>
              </div>
            </motion.div>
          </div>

          <div className="text-center space-y-3 p-4 sm:p-6 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl border border-yellow-200">
            <div className="flex items-center justify-center space-x-3">
              <Coins className="w-6 h-6 sm:w-8 sm:h-8 text-yellow-500" />
              <span className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent">
                {boostCost} Coins
              </span>
            </div>
            <div className="text-sm font-medium text-gray-700">24 hours of premium visibility</div>
            <div className="text-xs text-gray-600">Your current balance: {coins} coins</div>
          </div>

          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Button 
              onClick={handleBoost}
              className="w-full bg-gradient-to-r from-pink-500 via-purple-500 to-pink-600 hover:from-pink-600 hover:via-purple-600 hover:to-pink-700 text-white font-bold py-3 sm:py-4 text-base sm:text-lg shadow-lg"
              disabled={coins < boostCost}
            >
              {coins >= boostCost ? (
                <>
                  <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                  Boost My Profile – {boostCost} Coins
                </>
              ) : (
                'Insufficient Coins'
              )}
            </Button>
          </motion.div>

          {coins < boostCost && (
            <div className="text-center pb-2">
              <p className="text-sm text-gray-600 mb-3">
                You need {boostCost - coins} more coins to boost your profile
              </p>
              <Button 
                variant="outline" 
                onClick={() => {
                  onOpenChange(false);
                  navigate('/coins');
                }}
                className="border-2 border-pink-300 text-pink-600 hover:bg-pink-50 font-semibold"
              >
                <Coins className="w-4 h-4 mr-2" />
                Buy More Coins
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BoostModal;