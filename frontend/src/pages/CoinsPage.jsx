import React, { useContext, useState } from 'react';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet';
import { Coins, Star, Zap, Crown, Shield, Heart, X, Gift, Award, Clock, Users, MessageCircle, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import Header from '@/components/Header';
import MobileHeader from '@/components/MobileHeader';
import AuthContext from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';

const CoinsPage = () => {
  const { coins } = useContext(AuthContext);
  const { toast } = useToast();
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const TOTAL_TIME = 30 * 60; // 30 minutes in seconds

  const [timeLeft, setTimeLeft] = useState(() => {
    const savedStart = localStorage.getItem('countdown_start_time');
    const now = Math.floor(Date.now() / 1000);

    if (savedStart) {
      const elapsed = now - parseInt(savedStart, 10);
      const remaining = TOTAL_TIME - elapsed;
      if (remaining > 0) {
        return remaining;
      } else {
        // More than 30 min passed → restart timer
        localStorage.setItem('countdown_start_time', now.toString());
        return TOTAL_TIME;
      }
    } else {
      // No start time found → initialize
      localStorage.setItem('countdown_start_time', now.toString());
      return TOTAL_TIME;
    }
  });

  React.useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev > 1) {
          return prev - 1;
        } else {
          // When timer ends, restart for 30 minutes
          const now = Math.floor(Date.now() / 1000);
          localStorage.setItem('countdown_start_time', now.toString());
          return TOTAL_TIME;
        }
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Helper function to format price with Courier New dollar sign
  const formatPrice = (price) => {
    return (
      <>
        {price.slice(1)}
      </>
    );
  };

  const coinPackages = [
    {
      id: 1,
      name: "Starter Romance",
      coins: 50,
      price: '$4.99',
      originalPrice: '$7.99',
      popular: false,
      bonus: 10,
      icon: Heart,
      color: 'from-pink-500 to-rose-600',
      description: "Perfect for new connections",
      savings: "37% OFF TODAY",
      dealTag: "FIRST TIME DEAL",
      freeGifts: [
        "Welcome Chat Badge",
        "3 Free Winks",
        "Priority Support"
      ]
    },
    {
      id: 2,
      name: "Love Seeker",
      coins: 120,
      price: '$9.99',
      originalPrice: '$15.99',
      popular: true,
      bonus: 30,
      icon: Star,
      color: 'from-purple-500 to-pink-600',
      description: "Most popular for active daters",
      savings: "45% OFF TODAY",
      dealTag: "BEST VALUE",
      freeGifts: [
        "Golden VIP Chat Badge",
        "10 Free Winks",
        "Priority Support",
        "Profile Spotlight"
      ]
    },
    {
      id: 3,
      name: "Cupid's Choice",
      coins: 300,
      price: '$19.99',
      originalPrice: '$29.99',
      popular: false,
      bonus: 80,
      icon: Crown,
      color: 'from-yellow-500 to-orange-600',
      description: "For serious relationship seekers",
      savings: "50% OFF TODAY",
      dealTag: "PREMIUM DEAL",
      freeGifts: [
        "Platinum VIP Badge",
        "25 Free Winks",
        "Profile Spotlight",
        "Exclusive Chat Themes",
        "Read Receipts"
      ]
    },
    {
      id: 4,
      name: "Soulmate Seeker",
      coins: 600,
      price: '$34.99',
      originalPrice: '$59.99',
      popular: false,
      bonus: 200,
      icon: Zap,
      color: 'from-indigo-500 to-purple-700',
      description: "Ultimate package for love champions",
      savings: "60% OFF TODAY",
      dealTag: "ULTIMATE DEAL",
      freeGifts: [
        "Diamond VIP Badge",
        "50 Free Winks",
        "Weekly Profile Spotlight",
        "Premium Chat Themes",
        "Exclusive Emojis",
        "VIP Customer Support"
      ]
    }
  ];

  const handlePurchaseClick = (packageData) => {
    setSelectedPackage(packageData);
    setShowPurchaseModal(true);
  };

  const handleBuyNow = () => {
    setShowPurchaseModal(false);
    toast({
      title: "Payment system not configured yet",
      description: "Please check back soon. We're working on integrating secure payment options! 💳",
      variant: "destructive"
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50">
      <Helmet>
        <title>💰 Buy Coins - Liebenly</title>
        <meta name="description" content="Purchase coins to unlock premium features on Liebenly. Boost your profile, send messages, and get more matches with our coin packages." />
      </Helmet>

      <Header />
      <MobileHeader />

      <main className="container mx-auto px-4 py-8 pt-5 lg:pt-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-6xl mx-auto"
        >
          {/* Clean Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center bg-gradient-to-r from-red-500 to-pink-600 text-white px-4 py-2 rounded-full text-sm font-bold mb-6 shadow-lg">
              <Clock className="w-4 h-4 mr-2" />
              FLASH SALE ENDS IN: {formatTime(timeLeft)}
            </div>

            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
              Get More Coins
            </h1>

            <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-8">
              Find your perfect match faster with premium features and exclusive bonuses
            </p>

            {/* Clean Social Proof */}
            {/* <div className="flex items-center justify-center space-x-8 mb-8">
              <div className="flex items-center space-x-2">
                <Users className="w-5 h-5 text-green-600" />
                <span className="text-sm font-medium text-gray-700">127K+ Happy Couples</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                  ))}
                </div>
                <span className="text-sm font-medium text-gray-700">4.9/5 Rating</span>
              </div>
            </div> */}
          </div>

          {/* Left-Aligned Card Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
            {coinPackages.map((pkg, index) => {
              const IconComponent = pkg.icon;
              return (
                <motion.div
                  key={pkg.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="relative"
                >
                  <Card className={`relative overflow-hidden border-0 shadow-xl hover:shadow-2xl transition-all duration-300 bg-white ${pkg.popular ? 'ring-2 ring-pink-500' : ''}`}>
                    {/* Popular Badge */}
                    {pkg.popular && (
                      <div className="absolute top-2 right-2 z-10">
                        <Badge className={`bg-gradient-to-r ${pkg.color} text-white font-bold px-3 py-1`}>
                          Most Popular
                        </Badge>
                      </div>
                    )}


                    <CardContent className="p-8 px-4">
                      {/* Package Name */}
                      <div className="flex items-center mb-4">
                        <div className={`w-12 h-12 bg-gradient-to-r ${pkg.color} rounded-full flex items-center justify-center mr-4 shadow-lg`}>
                          <IconComponent className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h3 className="text-2xl font-bold text-gray-900">{pkg.name}</h3>
                          <p className="text-gray-600 font-bold">{pkg.description}</p>
                        </div>
                      </div>

                      {/* Coins Quantity */}
                      <div className="mb-6">
                        <div className="flex items-center text-3xl font-bold text-gray-900 mb-1">
                          <Coins className="w-8 h-8 text-yellow-500 mr-2" />
                          {pkg.coins + pkg.bonus} Coins
                        </div>
                        <div className="text-sm text-gray-600 font-bold">
                          {pkg.coins} coins + {pkg.bonus} bonus coins
                        </div>
                      </div>

                      {/* Free Gifts List */}
                      <div className="mb-6">
                        <div className="flex items-center mb-3">
                          <Gift className="w-4 h-4 text-pink-600 mr-2" />
                          <span className="font-bold text-pink-600 text-sm">FREE GIFTS</span>
                        </div>
                        <div className="space-y-1">
                          {pkg.freeGifts.map((gift, i) => (
                            <div key={i} className="flex items-center">
                              <div className="w-4 h-4 bg-pink-600 rounded-full flex items-center justify-center mr-2 flex-shrink-0">
                                <Check className="w-2.5 h-2.5 text-white" />
                              </div>
                              <span className="text-base text-gray-900 font-bold">{gift}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Liebenly Deal Days */}
                      <div className="mb-4">
                        <div className="bg-gradient-to-r from-pink-50 to-purple-50 rounded-lg p-3 border border-pink-200">
                          <div className="font-bold text-pink-600 text-base mb-1">LIEBENLY DEAL DAYS</div>
                          <div className="text-xs text-pink-400 font-bold">Limited time exclusive offer</div>
                        </div>
                      </div>

                      {/* Price with Discount */}
                      <div className="mb-2">
                        <div className="flex items-center space-x-3 mb-2">
                          <span className="text-3xl font-bold text-gray-900">${formatPrice(pkg.price)}</span>
                          <span className="text-lg text-gray-400 line-through font-bold">${formatPrice(pkg.originalPrice)}</span>
                          <div className="bg-pink-600 text-white font-black px-3 py-2 text-sm rounded-sm shadow-lg">
                            {pkg.savings}
                          </div>
                        </div>
                      </div>

                      {/* Cost per Coin */}
                      <div className="mb-4">
                        <div className="text-pink-600 text-sm font-bold">
                          <span style={{ fontWeight: 'bold' }}>$</span>
                          {(parseFloat(pkg.price.slice(1)) / (pkg.coins + pkg.bonus)).toFixed(2)} per coin
                        </div>
                      </div>

                      {/* Get Started Button */}
                      <motion.div
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="mb-5"
                      >
                        <Button
                          onClick={() => handlePurchaseClick(pkg)}
                          className={`w-full bg-gradient-to-r ${pkg.color} hover:opacity-90 text-white font-bold py-7 px-8 text-lg shadow-lg rounded-xl transition-all duration-300`}
                        >
                          GET STARTED →
                        </Button>
                      </motion.div>

                      {/* Small Benefits List */}
                      <div className="text-xxs text-gray-400">
                        <div className="flex items-center">
                          <Check className="w-3 h-3 text-gray-400 mr-2" />
                          <span className="leading-none">$29 Refill in 30 Days</span>
                        </div>
                        <div className="flex items-center -mt-[2px]">
                          <Check className="w-3 h-3 text-gray-400 mr-2" />
                          <span className="leading-none">Adjust Refills or Cancel Anytime</span>
                        </div>
                        <div className="flex items-center -mt-[2px]">
                          <Check className="w-3 h-3 text-gray-400 mr-2" />
                          <span className="leading-none">Stay Active and Keep Messaging</span>
                        </div>
                      </div>

                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>

          {/* Clean Features Section */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mb-16"
          >
            <Card className="border-0 shadow-xl bg-white">
              <CardHeader className="text-center pb-8">
                <CardTitle className="text-3xl font-bold text-gray-900 mb-4">
                  Why Choose Premium?
                </CardTitle>
                <p className="text-gray-600 max-w-2xl mx-auto">
                  Unlock powerful features that help you find meaningful connections faster
                </p>
              </CardHeader>

              <CardContent className="px-8 pb-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                      <Zap className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Profile Boost</h3>
                    <p className="text-gray-600 mb-4">Get 10x more profile views and matches with our spotlight feature</p>
                    <Badge className="bg-yellow-100 text-yellow-800 border-yellow-300">5 Coins per boost</Badge>
                  </div>

                  <div className="text-center">
                    <div className="w-16 h-16 bg-gradient-to-r from-purple-400 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                      <MessageCircle className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Premium Messages</h3>
                    <p className="text-gray-600 mb-4">Send unlimited messages with priority delivery and read receipts</p>
                    <Badge className="bg-purple-100 text-purple-800 border-purple-300">5 Coins per message</Badge>
                  </div>

                  <div className="text-center">
                    <div className="w-16 h-16 bg-gradient-to-r from-pink-400 to-rose-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                      <Heart className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Super Winks</h3>
                    <p className="text-gray-600 mb-4">Send special winks that get 5x more responses than regular likes</p>
                    <Badge className="bg-pink-100 text-pink-800 border-pink-300">2 Coins per wink</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Clean Guarantee Section */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
          >
            <Card className="border-0 shadow-xl bg-gradient-to-r from-blue-600 to-purple-700 text-white">
              <CardContent className="px-8 py-12 text-center">
                <div className="flex items-center justify-center mb-6">
                  <Shield className="w-12 h-12 mr-4" />
                  <h3 className="text-3xl font-bold">30-Day Love Guarantee</h3>
                </div>
                <p className="text-xl opacity-90 mb-8 max-w-2xl mx-auto">
                  Not finding the connections you're looking for? We'll refund your coins with no questions asked.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-2xl mx-auto">
                  <div className="flex items-center justify-center">
                    <Check className="w-6 h-6 mr-2" />
                    <span className="text-lg">Money Back Guarantee</span>
                  </div>
                  <div className="flex items-center justify-center">
                    <Check className="w-6 h-6 mr-2" />
                    <span className="text-lg">Instant Delivery</span>
                  </div>
                  <div className="flex items-center justify-center">
                    <Check className="w-6 h-6 mr-2" />
                    <span className="text-lg">24/7 Support</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      </main>

      {/* Simple Clean Purchase Modal */}
      <Dialog open={showPurchaseModal} onOpenChange={setShowPurchaseModal}>
        <DialogContent className="w-[95vw] max-w-md bg-white border-0 shadow-2xl max-h-[90vh] overflow-y-auto rounded-2xl">
          <button
            onClick={() => setShowPurchaseModal(false)}
            className="absolute right-4 top-4 z-50 w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>

          {selectedPackage && (
            <div className="p-6">
              {/* Header */}
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  {selectedPackage.name}
                </h2>
                <p className="text-gray-600">{selectedPackage.description}</p>
              </div>

              {/* Coin Amount */}
              <div className="text-center mb-6">
                <div className="text-4xl font-bold text-gray-900 mb-2">
                  {selectedPackage.coins + selectedPackage.bonus} Coins
                </div>
                <div className="bg-pink-600 text-white font-black px-4 py-2 rounded-sm inline-block text-sm shadow-lg">
                  {selectedPackage.savings}
                </div>
              </div>

              {/* Free Gifts */}
              <div className="bg-green-50 rounded-xl p-4 mb-6 border border-green-200">
                <div className="flex items-center mb-3">
                  <Gift className="w-4 h-4 text-green-600 mr-2" />
                  <span className="font-bold text-green-800 text-sm">FREE GIFTS</span>
                </div>
                <div className="space-y-1">
                  {selectedPackage.freeGifts.map((gift, i) => (
                    <div key={i} className="flex items-center">
                      <Check className="w-3 h-3 text-green-600 mr-2" />
                      <span className="text-sm text-green-700">{gift}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Pricing */}
              <div className="text-center mb-6">
                <div className="flex items-center justify-center space-x-2 mb-2">
                  <span className="text-3xl font-bold text-gray-900">{formatPrice(selectedPackage.price)}</span>
                  <span className="text-lg text-gray-500 line-through">{formatPrice(selectedPackage.originalPrice)}</span>
                </div>
                <div className="text-sm text-gray-600">
                  <span style={{ fontFamily: 'Courier New, monospace', fontWeight: 'bold', fontStyle: 'normal' }}>$</span>
                  {(parseFloat(selectedPackage.price.slice(1)) / (selectedPackage.coins + selectedPackage.bonus)).toFixed(2)} per coin
                </div>
              </div>

              {/* Purchase Button */}
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="mb-4"
              >
                <Button
                  onClick={handleBuyNow}
                  className={`w-full bg-gradient-to-r ${selectedPackage.color} hover:opacity-90 text-white font-bold py-4 text-lg shadow-lg rounded-xl`}
                >
                  Get Started →
                </Button>
              </motion.div>

              {/* Trust Indicators */}
              <div className="flex items-center justify-center space-x-4 text-xs text-gray-600">
                <div className="flex items-center">
                  <Shield className="w-3 h-3 mr-1" />
                  <span>30-Day Refund</span>
                </div>
                <div className="flex items-center">
                  <Clock className="w-3 h-3 mr-1" />
                  <span>Instant Delivery</span>
                </div>
                <div className="flex items-center">
                  <Heart className="w-3 h-3 mr-1" />
                  <span>SSL Secured</span>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CoinsPage;