import React, { useContext, useState } from 'react';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet';
import { Coins, Star, Zap, Crown, Shield, Heart, X } from 'lucide-react';
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

  const coinPackages = [
    {
      id: 1,
      name: "Starter Pack",
      coins: 50,
      price: '$4.99',
      popular: false,
      bonus: 0,
      icon: Coins,
      color: 'from-yellow-400 to-yellow-600',
      description: "Perfect for trying out premium features"
    },
    {
      id: 2,
      name: "Popular Choice",
      coins: 100,
      price: '$9.99',
      popular: true,
      bonus: 10,
      icon: Star,
      color: 'from-pink-400 to-pink-600',
      description: "Most popular package with bonus coins"
    },
    {
      id: 3,
      name: "Premium Pack",
      coins: 250,
      price: '$19.99',
      popular: false,
      bonus: 50,
      icon: Crown,
      color: 'from-purple-400 to-purple-600',
      description: "Great value for active users"
    },
    {
      id: 4,
      name: "Ultimate Pack",
      coins: 500,
      price: '$34.99',
      popular: false,
      bonus: 100,
      icon: Zap,
      color: 'from-blue-400 to-blue-600',
      description: "Maximum value for serious daters"
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
        <title>💰 Buy Coins - FlirtDuo</title>
        <meta name="description" content="Purchase coins to unlock premium features on FlirtDuo. Boost your profile, send messages, and get more matches with our coin packages." />
      </Helmet>

      <Header />
      <MobileHeader />
      
      <main className="container mx-auto px-4 py-8 pt-20 lg:pt-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="text-center mb-12">
            <div className="flex items-center justify-center space-x-3 mb-4">
              <div className="w-12 h-12 bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center">
                <Coins className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent">
                💰 Buy Coins
              </h1>
            </div>
            <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto">
              Unlock premium features, boost your profile, and increase your chances of finding the perfect match
            </p>
            
            <div className="mt-8">
              <Card className="inline-block border-0 shadow-lg bg-gradient-to-r from-pink-400 to-purple-600">
                <CardContent className="p-4 md:p-6">
                  <div className="flex items-center space-x-3 text-white">
                    <Coins className="w-6 h-6 md:w-8 md:h-8" />
                    <div>
                      <div className="text-sm opacity-90">Current Balance</div>
                      <div className="text-xl md:text-2xl font-bold">{coins} Coins</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-12">
            {coinPackages.map((pkg, index) => {
              const IconComponent = pkg.icon;
              return (
                <motion.div
                  key={pkg.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  whileHover={{ y: -8, scale: 1.02 }}
                  className="relative"
                >
                  {pkg.popular && (
                    <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 z-10 bg-gradient-to-r from-pink-500 to-purple-600 text-white">
                      Most Popular
                    </Badge>
                  )}
                  
                  <Card className={`h-full border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-white to-pink-50 ${pkg.popular ? 'ring-2 ring-pink-500' : ''}`}>
                    <CardHeader className="text-center pb-4">
                      <div className={`w-14 h-14 md:w-16 md:h-16 bg-gradient-to-r ${pkg.color} rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg`}>
                        <IconComponent className="w-6 h-6 md:w-8 md:h-8 text-white" />
                      </div>
                      <CardTitle className="text-xl md:text-2xl font-bold text-gray-900">
                        {pkg.coins} Coins
                      </CardTitle>
                      <p className="text-sm text-gray-600 font-medium">{pkg.name}</p>
                      {pkg.bonus > 0 && (
                        <Badge variant="secondary" className="bg-green-100 text-green-700 border border-green-200">
                          +{pkg.bonus} Bonus
                        </Badge>
                      )}
                    </CardHeader>
                    
                    <CardContent className="text-center space-y-4">
                      <div className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-gray-700 to-gray-900 bg-clip-text text-transparent">
                        {pkg.price}
                      </div>
                      
                      <p className="text-xs md:text-sm text-gray-500 min-h-[2.5rem] flex items-center justify-center">
                        {pkg.description}
                      </p>
                      
                      <motion.div
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <Button
                          onClick={() => handlePurchaseClick(pkg)}
                          className={`w-full bg-gradient-to-r ${pkg.color} hover:opacity-90 text-white font-semibold shadow-lg`}
                          size="lg"
                        >
                          Purchase
                        </Button>
                      </motion.div>
                      
                      <div className="text-xs text-gray-500">
                        {pkg.bonus > 0 ? `Total: ${pkg.coins + pkg.bonus} coins` : `${pkg.coins} coins`}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-purple-50">
              <CardHeader>
                <CardTitle className="text-xl md:text-2xl font-bold text-gray-900 text-center flex items-center justify-center space-x-2">
                  <Heart className="w-6 h-6 text-pink-500" />
                  <span>What Can You Do With Coins?</span>
                </CardTitle>
              </CardHeader>
              
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center space-y-3">
                    <div className="w-12 h-12 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center mx-auto shadow-lg">
                      <Zap className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="font-semibold text-gray-900">Boost Profile</h3>
                    <p className="text-gray-600 text-sm">Get featured at the top for 24 hours and triple your views</p>
                    <Badge variant="outline" className="border-yellow-300 text-yellow-700">50 Coins</Badge>
                  </div>
                  
                  <div className="text-center space-y-3">
                    <div className="w-12 h-12 bg-gradient-to-r from-purple-400 to-pink-500 rounded-full flex items-center justify-center mx-auto shadow-lg">
                      <Heart className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="font-semibold text-gray-900">Send Winks</h3>
                    <p className="text-gray-600 text-sm">Catch someone's attention with a special wink notification</p>
                    <Badge variant="outline" className="border-purple-300 text-purple-700">2 Coins</Badge>
                  </div>
                  
                  <div className="text-center space-y-3">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-400 to-green-500 rounded-full flex items-center justify-center mx-auto shadow-lg">
                      <Shield className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="font-semibold text-gray-900">Send Messages</h3>
                    <p className="text-gray-600 text-sm">Start conversations and connect with your matches</p>
                    <Badge variant="outline" className="border-blue-300 text-blue-700">5 Coins</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="mt-8 text-center"
          >
            <div className="flex items-center justify-center space-x-2 text-gray-600">
              <Shield className="w-5 h-5" />
              <span className="text-sm">Secure checkout powered by industry-leading encryption</span>
            </div>
          </motion.div>
        </motion.div>
      </main>

      <Dialog open={showPurchaseModal} onOpenChange={setShowPurchaseModal}>
        <DialogContent className="w-[95vw] max-w-md bg-gradient-to-br from-pink-50 via-white to-purple-50 border-0 shadow-2xl">
          <button
            onClick={() => setShowPurchaseModal(false)}
            className="absolute right-4 top-4 z-50 w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4 text-gray-600" />
          </button>

          <DialogHeader>
            <DialogTitle className="text-center text-xl font-bold text-gray-900 pr-8">
              {selectedPackage?.name} Details
            </DialogTitle>
          </DialogHeader>

          {selectedPackage && (
            <div className="space-y-6 px-2">
              <div className="text-center">
                <div className={`w-20 h-20 bg-gradient-to-r ${selectedPackage.color} rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg`}>
                  <selectedPackage.icon className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">{selectedPackage.coins} Coins</h3>
                {selectedPackage.bonus > 0 && (
                  <Badge className="bg-green-100 text-green-700 border border-green-200 mb-2">
                    +{selectedPackage.bonus} Bonus Coins
                  </Badge>
                )}
                <p className="text-gray-600 text-sm">{selectedPackage.description}</p>
              </div>

              <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl p-6 border border-yellow-200">
                <div className="text-center space-y-2">
                  <div className="text-3xl font-bold text-gray-900">{selectedPackage.price}</div>
                  <div className="text-sm text-gray-600">
                    Total: {selectedPackage.coins + selectedPackage.bonus} coins
                  </div>
                  {selectedPackage.bonus > 0 && (
                    <div className="text-xs text-green-600 font-medium">
                      Includes {selectedPackage.bonus} bonus coins!
                    </div>
                  )}
                </div>
              </div>

              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button
                  onClick={handleBuyNow}
                  className={`w-full bg-gradient-to-r ${selectedPackage.color} hover:opacity-90 text-white font-bold py-4 text-lg shadow-lg`}
                >
                  Buy Now
                </Button>
              </motion.div>

              <div className="text-center text-xs text-gray-500">
                <div className="flex items-center justify-center space-x-1">
                  <Shield className="w-3 h-3" />
                  <span>Secure payment processing</span>
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