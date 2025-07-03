import React, { useState ,useEffect} from 'react';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet';
import { Save, Mail, Lock, HelpCircle, FileText, Shield, MessageSquare, Building } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Header from '@/components/Header';
import MobileHeader from '@/components/MobileHeader';
import { useToast } from '@/components/ui/use-toast';

const BASE_URL = import.meta.env.VITE_API_BASE_URL;
    const authToken = localStorage.getItem('token');


const Settings = () => {
  const { toast } = useToast();
const [emailData, setEmailData] = useState({
  currentEmail: '',
  newEmail: '',
  isEditing: false
});
  
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    isEditing: false
  });

  useEffect(() => {
  const fetchEmail = async () => {
    try {
      const res = await fetch(`${BASE_URL}/users/settings`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });

      const data = await res.json();
      setEmailData((prev) => ({
        ...prev,
        currentEmail: data.email || '',
      }));
    } catch (err) {
      console.error("Failed to load user email", err);
      toast({
        title: "Error",
        description: "Failed to load current email",
        variant: "destructive",
      });
    }
  };

  
    fetchEmail();
  
}, []);




const handleEmailUpdate = async (e) => {
  e.preventDefault();
  const email=emailData.newEmail;
  if (!email) {
      toast({
        title: "Please enter a new email address",
        variant: "destructive"
      });
      return;
    }
  try {
    const res = await fetch(`${BASE_URL}/users/settings/update-email`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify({ email }),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Failed to update email");

    toast({ title: "Success", description: "Email updated successfully" });
    setEmailData({
  currentEmail: emailData.newEmail,
  newEmail: '',
  isEditing: false
});
  } catch (err) {
    toast({ title: "Error", description: err.message, variant: "destructive" });
  }
};



const handlePasswordUpdate = async (e) => {
  e.preventDefault();
  if (passwordData.newPassword !== passwordData.confirmPassword) {
    toast({ title: "Error", description: "Passwords do not match", variant: "destructive" });
    return;
  }
  const currentPassword=passwordData.currentPassword;
  const newPassword=passwordData.newPassword;

  try {
    const res = await fetch(`${BASE_URL}/users/settings/update-password`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify({
        currentPassword,
        newPassword
      }),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Failed to update password");

    toast({ title: "Success", description: "Password updated successfully" });
   setPasswordData({
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
      isEditing: false
    });
  } catch (err) {
    toast({ title: "Error", description: err.message, variant: "destructive" });
  }
};





  const handleEmailSave = () => {
    if (!emailData.newEmail) {
      toast({
        title: "Please enter a new email address",
        variant: "destructive"
      });
      return;
    }
    
    setEmailData(prev => ({
      ...prev,
      currentEmail: prev.newEmail,
      newEmail: '',
      isEditing: false
    }));
    
    toast({
      title: "Email updated successfully! ✨",
      description: "Your email address has been changed.",
    });
  };

  const handlePasswordSave = () => {
    if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
      toast({
        title: "Please fill in all password fields",
        variant: "destructive"
      });
      return;
    }
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast({
        title: "Passwords don't match",
        description: "Please make sure your new passwords match.",
        variant: "destructive"
      });
      return;
    }
    
    setPasswordData({
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
      isEditing: false
    });
    
    toast({
      title: "Password updated successfully! 🔒",
      description: "Your password has been changed.",
    });
  };

  const handleLinkClick = (linkName) => {
    toast({
      title: "🚧 This feature isn't implemented yet—but don't worry! You can request it in your next prompt! 🚀",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50">
      <Helmet>
        <title>Settings - Liebenly</title>
        <meta name="description" content="Manage your FlirtDuo account settings, privacy preferences, and access help resources." />
      </Helmet>

      <Header />
      <MobileHeader />
      
      <main className="container mx-auto px-4 py-6 lg:py-8 pt-20 lg:pt-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="max-w-4xl mx-auto">
            <div className="mb-8">
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">Settings</h1>
              <p className="text-lg text-gray-600">Manage your account and preferences</p>
            </div>

            <div className="space-y-8">
              <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-pink-50">
                <CardHeader>
                  <CardTitle className="text-2xl font-bold text-gray-900 flex items-center">
                    <Lock className="w-6 h-6 mr-3 text-pink-500" />
                    Account Settings
                  </CardTitle>
                </CardHeader>
                
                <CardContent className="space-y-8">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                        <Mail className="w-5 h-5 mr-2 text-blue-500" />
                        Email Address
                      </h3>
                      {!emailData.isEditing && (
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => setEmailData(prev => ({ ...prev, isEditing: true }))}
                        >
                          Change Email
                        </Button>
                      )}
                    </div>
                    
                    {emailData.isEditing ? (
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="currentEmail">Current Email</Label>
                          <Input
                            id="currentEmail"
                            value={emailData.currentEmail}
                            disabled
                            className="bg-gray-100"
                          />
                        </div>
                        <div>
                          <Label htmlFor="newEmail">New Email</Label>
                          <Input
                            id="newEmail"
                            type="email"
                            value={emailData.newEmail}
                            onChange={(e) => setEmailData(prev => ({ ...prev, newEmail: e.target.value }))}
                            placeholder="Enter your new email address"
                          />
                        </div>
                        <div className="flex space-x-2">
                          <Button 
                            onClick={handleEmailUpdate}
                            className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white"
                          >
                            <Save className="w-4 h-4 mr-2" />
                            Save
                          </Button>
                          <Button 
                            variant="outline"
                            onClick={() => setEmailData(prev => ({ ...prev, isEditing: false, newEmail: '' }))}
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="p-3 bg-gray-50 rounded-md">
                        {emailData.currentEmail}
                      </div>
                    )}
                  </div>

                  <div className="border-t border-gray-200 pt-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                          <Lock className="w-5 h-5 mr-2 text-red-500" />
                          Password
                        </h3>
                        {!passwordData.isEditing && (
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => setPasswordData(prev => ({ ...prev, isEditing: true }))}
                          >
                            Change Password
                          </Button>
                        )}
                      </div>
                      
                      {passwordData.isEditing ? (
                        <div className="space-y-4">
                          <div>
                            <Label htmlFor="currentPassword">Current Password</Label>
                            <Input
                              id="currentPassword"
                              type="password"
                              value={passwordData.currentPassword}
                              onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
                              placeholder="Enter your current password"
                            />
                          </div>
                          <div>
                            <Label htmlFor="newPassword">New Password</Label>
                            <Input
                              id="newPassword"
                              type="password"
                              value={passwordData.newPassword}
                              onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                              placeholder="Enter your new password"
                            />
                          </div>
                          <div>
                            <Label htmlFor="confirmPassword">Confirm New Password</Label>
                            <Input
                              id="confirmPassword"
                              type="password"
                              value={passwordData.confirmPassword}
                              onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                              placeholder="Confirm your new password"
                            />
                          </div>
                          <div className="flex space-x-2">
                            <Button 
                              onClick={handlePasswordUpdate}
                              className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white"
                            >
                              <Save className="w-4 h-4 mr-2" />
                              Save
                            </Button>
                            <Button 
                              variant="outline"
                              onClick={() => setPasswordData({
                                currentPassword: '',
                                newPassword: '',
                                confirmPassword: '',
                                isEditing: false
                              })}
                            >
                              Cancel
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="p-3 bg-gray-50 rounded-md">
                          ••••••••••••
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                >
                  <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-blue-50 h-full">
                    <CardHeader>
                      <CardTitle className="text-xl font-bold text-gray-900 flex items-center">
                        <HelpCircle className="w-6 h-6 mr-3 text-blue-500" />
                        Help & Support
                      </CardTitle>
                    </CardHeader>
                    
                    <CardContent className="space-y-4">
                      <Button
                        variant="ghost"
                        className="w-full justify-start text-left h-auto p-4 hover:bg-blue-50"
                        onClick={() => handleLinkClick('FAQ')}
                      >
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-gradient-to-r from-blue-400 to-blue-500 rounded-full flex items-center justify-center">
                            <HelpCircle className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <div className="font-semibold text-gray-900">FAQ</div>
                            <div className="text-sm text-gray-600">Frequently asked questions</div>
                          </div>
                        </div>
                      </Button>

                      <Button
                        variant="ghost"
                        className="w-full justify-start text-left h-auto p-4 hover:bg-blue-50"
                        onClick={() => handleLinkClick('Business Inquiries')}
                      >
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-gradient-to-r from-purple-400 to-purple-500 rounded-full flex items-center justify-center">
                            <Building className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <div className="font-semibold text-gray-900">Business Inquiries</div>
                            <div className="text-sm text-gray-600">Partnership and business questions</div>
                          </div>
                        </div>
                      </Button>

                      <Button
                        variant="ghost"
                        className="w-full justify-start text-left h-auto p-4 hover:bg-blue-50"
                        onClick={() => handleLinkClick('Contact & Support')}
                      >
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-gradient-to-r from-green-400 to-green-500 rounded-full flex items-center justify-center">
                            <MessageSquare className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <div className="font-semibold text-gray-900">Contact & Support</div>
                            <div className="text-sm text-gray-600">Get help from our support team</div>
                          </div>
                        </div>
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 0.3 }}
                >
                  <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-purple-50 h-full">
                    <CardHeader>
                      <CardTitle className="text-xl font-bold text-gray-900 flex items-center">
                        <Shield className="w-6 h-6 mr-3 text-purple-500" />
                        Legal
                      </CardTitle>
                    </CardHeader>
                    
                    <CardContent className="space-y-4">
                      <Button
                        variant="ghost"
                        className="w-full justify-start text-left h-auto p-4 hover:bg-purple-50"
                        onClick={() => handleLinkClick('Imprint')}
                      >
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-gradient-to-r from-gray-400 to-gray-500 rounded-full flex items-center justify-center">
                            <Building className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <div className="font-semibold text-gray-900">Imprint</div>
                            <div className="text-sm text-gray-600">Company information and details</div>
                          </div>
                        </div>
                      </Button>

                      <Button
                        variant="ghost"
                        className="w-full justify-start text-left h-auto p-4 hover:bg-purple-50"
                        onClick={() => handleLinkClick('Data Protection')}
                      >
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-gradient-to-r from-red-400 to-red-500 rounded-full flex items-center justify-center">
                            <Shield className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <div className="font-semibold text-gray-900">Data Protection</div>
                            <div className="text-sm text-gray-600">Privacy policy and data handling</div>
                          </div>
                        </div>
                      </Button>

                      <Button
                        variant="ghost"
                        className="w-full justify-start text-left h-auto p-4 hover:bg-purple-50"
                        onClick={() => handleLinkClick('Terms and Conditions')}
                      >
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-full flex items-center justify-center">
                            <FileText className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <div className="font-semibold text-gray-900">Terms and Conditions</div>
                            <div className="text-sm text-gray-600">Terms of service and usage</div>
                          </div>
                        </div>
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              </div> */}
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  );
};

export default Settings;