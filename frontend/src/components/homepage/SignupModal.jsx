import React, { useState, useContext } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import AuthContext from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { GoogleLogin } from "@react-oauth/google";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

const SignupModal = ({ open, onOpenChange, onSwitchToLogin }) => {
  const { login } = useContext(AuthContext);
  const { toast } = useToast();
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [form, setForm] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: "" });
  };

  const validate = () => {
    const newErrors = {};
    if (!/\S+@\S+\.\S+/.test(form.email)) newErrors.email = "Enter a valid email";
    if (form.password.length < 8) newErrors.password = "Password must be at least 8 characters";
    return newErrors;
  };

  const handleSignupSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length) {
      setErrors(validationErrors);
      return;
    }
    setIsLoading(true);
    try {
       const referral_slug = localStorage.getItem("referral_slug") || null;
      await axios.post(`${BASE_URL}/auth/register`, {
        email: form.email,
        password: form.password,
        role: "user",
        referral_slug: referral_slug,
        
      });

      const res1 = await axios.post(`${BASE_URL}/auth/login`, {
        email: form.email,
        password: form.password,
      });

      handleLoginSuccess(res1.data);
    } catch (err) {
      toast({
        title: "Signup failed",
        description: err.response?.data?.error || "Something went wrong",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoginSuccess = (data, skipProfile = false) => {
    const { token, user } = data;
    localStorage.setItem("token", token);
    localStorage.setItem("userId", user.id);

    login({
      id: user.id,
      name: user.full_name,
      email: user.email,
      role: user.role,
      avatar: user.profile?.profile_image_url || null,
    });

    toast({
      title: "Welcome to Liebenly! 💕",
      description: skipProfile
        ? "Welcome back!"
        : "Let's complete your profile.",
    });

    onOpenChange(false);

    if (skipProfile) {
      navigate("/dashboard");
    } else {
      navigate("/create-profile", { state: { userId: user.id, userData: user } });
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    const referral_slug = localStorage.getItem("referral_slug") || null;
    try {
      // Step 1: Register or fetch existing user
      const res = await axios.post(`${BASE_URL}/auth/google`, {
        credential: credentialResponse.credential,
        referral_slug: referral_slug,
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
    const res = await axios.post(`${BASE_URL}/auth/facebook`, {
      accessToken: response.accessToken,
    });

    const { email, password, isNewUser } = res.data;

    const loginRes = await axios.post(`${BASE_URL}/auth/login`, { email, password });
    handleLoginSuccess(loginRes.data, !isNewUser);
  } catch (error) {
    toast({
      title: "Facebook signup/login failed",
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
            Join Liebenly
          </DialogTitle>
        </DialogHeader>

        {/* Social Signup Buttons */}
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

        <form onSubmit={handleSignupSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">Email</label>
            <Input name="email" type="email" placeholder="Enter your email" value={form.email} onChange={handleChange} required />
            {errors.email && <p className="text-sm text-red-600 mt-1">{errors.email}</p>}
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">Password</label>
            <div className="relative">
              <Input
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder="Create a password"
                value={form.password}
                onChange={handleChange}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {errors.password && <p className="text-sm text-red-600 mt-1">{errors.password}</p>}
          </div>

          <Button type="submit" disabled={isLoading} className="w-full bg-gradient-to-r from-pink-500 to-purple-600">
            {isLoading ? "Creating Account..." : "Create Account"}
          </Button>

          <div className="text-center">
            <button type="button" onClick={onSwitchToLogin} className="text-sm text-pink-600">
              Already have an account? Sign in
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default SignupModal;
