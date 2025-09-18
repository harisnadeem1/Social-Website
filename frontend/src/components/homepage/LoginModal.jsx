import React, { useState, useContext } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import AuthContext from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { GoogleLogin } from "@react-oauth/google";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

const LoginModal = ({ open, onOpenChange, onSwitchToSignup }) => {
  const { login, updateCoins } = useContext(AuthContext);
  const { toast } = useToast();
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLoginSuccess = (data) => {
    const { token, user } = data;

    // Save to localStorage
    localStorage.setItem('token', token);
    localStorage.setItem('userId', user.id);

    login({
      id: user.id,
      name: user.full_name,
      email: user.email,
      role: user.role,
      avatar: user.profile?.profile_image_url || null,
    });

    toast({
      title: `Welcome back, ${user.full_name}! 💕`,
      description: user.role === 'admin' ? 'Admin access granted!' : 'Let\'s find your perfect match!',
    });

    // Clear form
    setEmail('');
    setPassword('');
    onOpenChange(false);

    // Conditional navigation
    if(user.role === "admin"){
      navigate("/admin");
    } 
    else if (user.role === "chatter") {
      navigate("/chatter-dashboard");
    }
    else if (user.role === "affiliate") {
      navigate("/affiliate-dashboard");
    }
    else if (!user.profile) {
      navigate("/create-profile", {
        state: {
          userId: user.id,
          userData: user
        }
      });
    }
    else {
      navigate("/dashboard");
    }
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const res = await axios.post(`${BASE_URL}/auth/login`, { email, password });
      handleLoginSuccess(res.data);
    } catch (err) {
      console.error(err);
      toast({
        title: "Login Failed",
        description: err.response?.data?.error || "Invalid credentials",
        variant: "destructive",
      });
    }

    setIsLoading(false);
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      // Step 1: Register or fetch existing user
      const res = await axios.post(`${BASE_URL}/auth/google`, {
        credential: credentialResponse.credential,
      });

      const { email, password, isNewUser } = res.data;

      // Step 2: Login with generated password
      const loginRes = await axios.post(`${BASE_URL}/auth/login`, {
        email,
        password,
      });

      // Step 3: Pass skipProfile based on isNewUser
      handleLoginSuccess(loginRes.data, !isNewUser);
    } catch (error) {
      console.error(error);
      toast({ title: "Google signup/login failed", variant: "destructive" });
    }
  };

  const handleFacebookResponse = async (response) => {
    try {
      const resLogin = await axios.post(`${BASE_URL}/auth/facebook-login`, {
        accessToken: response.accessToken,
      });

      handleLoginSuccess(resLogin.data);
    } catch (error) {
      toast({
        title: "Facebook login failed",
        description: error.response?.data?.error || "Something went wrong",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center text-2xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
            Welcome Back
          </DialogTitle>
        </DialogHeader>

        {/* Social Login Buttons */}
        <div className="flex flex-col gap-3 mb-4">
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={() => toast({ title: "Google Login Failed", variant: "destructive" })}
          />
          {/* <FacebookLogin
            appId={import.meta.env.VITE_FACEBOOK_APP_ID}
            autoLoad={false}
            fields="name,email,picture"
            callback={handleFacebookResponse}
            render={(renderProps) => (
              <Button onClick={renderProps.onClick} className="bg-blue-600 text-white w-full">
                Continue with Facebook
              </Button>
            )}
          /> */}
        </div>

        {/* Divider */}
        <div className="flex items-center gap-4 my-4">
          <div className="flex-1 h-px bg-gray-300"></div>
          <span className="text-sm text-gray-500">or</span>
          <div className="flex-1 h-px bg-gray-300"></div>
        </div>

        <form onSubmit={handleLoginSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">Email</label>
            <Input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">Password</label>
            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full pr-10 text-base"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700"
          >
            {isLoading ? 'Signing In...' : 'Sign In'}
          </Button>

          <div className="text-center">
            <button
              type="button"
              onClick={onSwitchToSignup}
              className="text-sm text-pink-600 hover:text-pink-700 transition-colors"
            >
              Don't have an account? Sign up
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default LoginModal;