import React, { useState, useEffect, useCallback, useRef } from "react";
import axios from "axios";
import {
  Card, CardContent, CardHeader, CardTitle, CardDescription
} from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertTriangle } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Plus,
  Trash2,
  Copy,
  TrendingUp,
  Users,
  DollarSign,
  Eye,
  ExternalLink,
  Link2,
  BarChart3,
  RefreshCw,
  Target,
  CheckCircle2
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { motion } from "framer-motion";

const AffiliateDashboard = () => {
  const { toast } = useToast();

  const [affiliate, setAffiliate] = useState(null);
  // const [campaigns, setCampaigns] = useState([]);
  const campaignNameRef = useRef(null);
  const [isCreating, setIsCreating] = useState(false);
  const [loading, setLoading] = useState(true);

  const [campaignType, setCampaignType] = useState("home");
  const [girls, setGirls] = useState([]);
  const [selectedGirl, setSelectedGirl] = useState("");

  const [deleteCampaignId, setDeleteCampaignId] = useState(null);
  const [deleting, setDeleting] = useState(false);


  const [campaigns, setCampaigns] = useState([]);
  const [totalClicks, setTotalClicks] = useState(0);
  const [totalSignups, setTotalSignups] = useState(0);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [totalUniqueBuyers, setTotalUniqueBuyers] = useState(0);

  // Load affiliate dashboard from backend
  const fetchDashboard = useCallback(async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/affiliate/dashboard`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      setAffiliate(data.affiliate);
      setCampaigns(data.campaigns || []);
      setTotalClicks(data.total_clicks || 0);
      setTotalSignups(data.total_signups || 0);
      setTotalRevenue(data.total_revenue || 0);
      setTotalUniqueBuyers(data.total_unique_buyers || 0);
    } catch (error) {
      toast({
        title: "Error loading dashboard",
        description: error.response?.data?.error || "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  useEffect(() => {
    const fetchGirls = async () => {
      try {
        const { data } = await axios.get(
          `${import.meta.env.VITE_API_BASE_URL}/affiliate/featured-girls`,
          {
            headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
          }
        );
        setGirls(data);
      } catch (err) {
        console.error("Failed to load featured girls:", err);
      }
    };
    fetchGirls();
  }, []);

  // Create campaign
  const handleCreateCampaign = async () => {
    const campaignName = campaignNameRef.current?.value.trim();

    if (!campaignName) {
      toast({
        title: "Campaign name required",
        description: "Please enter a name for your campaign.",
        variant: "destructive",
      });
      return;
    }

    if (campaignType === "girl" && !selectedGirl) {
      toast({
        title: "Select a girl",
        description: "Please choose a featured girl for this campaign.",
        variant: "destructive",
      });
      return;
    }

    setIsCreating(true);
    try {
      const { data } = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/affiliate/campaigns`,
        {
          name: campaignName,
          type: campaignType,
          girl_id: campaignType === "girl" ? selectedGirl : null,
        },
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );

      setCampaigns((prev) => [{ ...data, clicks: 0, signups: 0, revenue: 0, unique_buyers: 0 }, ...prev]);

      // clear the input manually
      if (campaignNameRef.current) campaignNameRef.current.value = "";

      setCampaignType("home");
      setSelectedGirl("");

      toast({
        title: "Campaign created successfully!",
        description: `Your new tracking link: liebenly.com/${data.link_slug}`,
      });
    } catch (error) {
      toast({
        title: "Error creating campaign",
        description: error.response?.data?.error || "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
    }
  };

  // Delete campaign
  const handleDeleteCampaign = async (campaignId) => {
    try {
      await axios.delete(
        `${import.meta.env.VITE_API_BASE_URL}/affiliate/campaigns/${campaignId}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      setCampaigns((prev) => prev.filter((c) => c.id !== campaignId));
      toast({
        title: "Campaign deleted",
        description: "Your campaign has been removed successfully.",
      });
    } catch (error) {
      toast({
        title: "Error deleting campaign",
        description: error.response?.data?.error || "Please try again later.",
        variant: "destructive",
      });
    }
  };

  // Copy referral link
  const handleCopyLink = (linkSlug) => {
    const fullUrl = linkSlug.startsWith("http")
      ? linkSlug
      : `${import.meta.env.VITE_SITE_URL}/${linkSlug}`;

    navigator.clipboard.writeText(fullUrl);
    toast({
      title: "Link copied!",
      description: "Share this link to start earning commissions.",
    });
  };


  // Refresh dashboard
  const refreshData = () => {
    fetchDashboard();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (!affiliate) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-900 text-lg font-medium">
            Unable to load dashboard
          </p>
          <p className="text-gray-600">Please try refreshing the page.</p>
        </div>
      </div>
    );
  }

  // Calculate totals
  // const totalClicks = campaigns.reduce((acc, c) => acc + (c.clicks || 0), 0);
  // const totalSignups = campaigns.reduce((acc, c) => acc + (c.signups || 0), 0);
  // const totalRevenue = campaigns.reduce((acc, c) => acc + (c.revenue || 0), 0);
  const overallConversionRate =
    totalClicks > 0 ? ((totalSignups / totalClicks) * 100).toFixed(1) : 0;

  const earningsPerClick = totalClicks > 0 ? (totalRevenue / totalClicks).toFixed(2) : 0;
  const earningsPerSignup = totalSignups > 0 ? (totalRevenue / totalSignups).toFixed(2) : 0;
  // const totalUniqueBuyers = campaigns.reduce((acc, c) => acc + (c.unique_buyers || 0), 0);

  // Clean Stat Card component (removed trends)
  const StatCard = ({
    title,
    value,
    icon: Icon,
    color,
    subtitle
  }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="border-0 shadow-lg bg-white hover:shadow-xl transition-shadow duration-300">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-600">{title}</p>
              <p className="text-2xl font-bold text-gray-900">{value}</p>
              {subtitle && (
                <p className="text-xs text-gray-500 mt-1">{subtitle}</p>
              )}
            </div>
            <div className={`p-3 rounded-full ${color}`}>
              <Icon className="h-6 w-6 text-white" />
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        {/* Header - Cleaned */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex items-center space-x-4">
              <Avatar className="h-16 w-16">
                <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-500 text-white text-xl font-bold">
                  {affiliate.full_name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  Welcome back, {affiliate.full_name.split(" ")[0]}!
                </h1>
                <p className="text-gray-600">Your affiliate dashboard</p>
                <div className="flex items-center mt-2 space-x-3">
                  <span className="text-sm text-gray-500">
                    Member since{" "}
                    {new Date(affiliate.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <Button
                variant="outline"
                onClick={refreshData}
                className="flex items-center space-x-2"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Refresh</span>
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Stats - Cleaned (removed trends) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Clicks"
            value={totalClicks.toLocaleString()}
            icon={Eye}
            color="bg-gradient-to-r from-blue-500 to-blue-600"
            subtitle="Link visits"
          />
          <StatCard
            title="Total Signups"
            value={totalSignups.toLocaleString()}
            icon={Users}
            color="bg-gradient-to-r from-green-500 to-green-600"
            subtitle="Conversions"
          />
          <StatCard
            title="Earnings"
            value={`$${totalRevenue.toLocaleString()}`}
            icon={DollarSign}
            color="bg-gradient-to-r from-purple-500 to-purple-600"
            subtitle="Spent on coins"
          />
          <StatCard
            title="Conversion Rate"
            value={`${overallConversionRate}%`}
            icon={Target}
            color="bg-gradient-to-r from-orange-500 to-orange-600"
            subtitle="Click to signup"
          />
          <StatCard
            title="Unique Buyers"
            value={totalUniqueBuyers.toLocaleString()}
            icon={Users}
            color="bg-gradient-to-r from-pink-500 to-pink-600"
            subtitle="Total paying users"
          />
          <StatCard
            title="Earnings per Click"
            value={`$${earningsPerClick}`}
            icon={DollarSign}
            color="bg-gradient-to-r from-teal-500 to-teal-600"
            subtitle="Average revenue per click"
          />
          <StatCard
            title="Earnings per Signup (LTV)"
            value={`$${earningsPerSignup}`}
            icon={TrendingUp}
            color="bg-gradient-to-r from-indigo-500 to-indigo-600"
            subtitle="Avg lifetime value per signup"
          />
        </div>

        {/* Your Campaigns Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mb-8"
        >
          <Card className="border-0 shadow-lg bg-white">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-gray-900 flex items-center">
                <BarChart3 className="w-5 h-5 mr-2 text-blue-500" />
                Your Campaigns
              </CardTitle>
              <CardDescription className="text-gray-600">
                Track and manage your referral campaigns performance
              </CardDescription>
            </CardHeader>

            <CardContent>
              {/* Campaigns Table */}
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Campaign Name</TableHead>
                      <TableHead>Tracking Link</TableHead>
                      <TableHead>Clicks</TableHead>
                      <TableHead>Signups</TableHead>
                      <TableHead>Earnings</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {campaigns.map((campaign) => (
                      <TableRow key={campaign.id} className="hover:bg-gray-50/50">
                        <TableCell>
                          <p className="font-medium text-gray-900">
                            {campaign.name}
                          </p>
                          <p className="text-xs text-gray-500">
                            Created{" "}
                            {new Date(campaign.created_at).toLocaleDateString()}
                          </p>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <code className="text-sm bg-gray-100 px-2 py-1 rounded font-mono">
                              {campaign.link_slug}
                            </code>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleCopyLink(campaign.link_slug)}
                              className="h-6 w-6 p-0"
                            >
                              <Copy className="w-3 h-3" />
                            </Button>
                          </div>
                        </TableCell>
                        <TableCell className="font-medium">{campaign.clicks || 0}</TableCell>
                        <TableCell className="text-green-600 font-medium">
                          {campaign.signups || 0}
                        </TableCell>
                        <TableCell className="text-purple-600 font-medium">
                          ${campaign.revenue || 0}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end space-x-1">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() =>
                                window.open(`${import.meta.env.VITE_SITE_URL}/${campaign.link_slug}`, "_blank")
                              }

                              className="hover:bg-blue-50"
                            >
                              <ExternalLink className="w-3 h-3" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleCopyLink(campaign.link_slug)}
                              className="hover:bg-green-50"
                            >
                              <Copy className="w-3 h-3" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setDeleteCampaignId(campaign.id)}
                              className="text-red-600 hover:bg-red-50"
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>

                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {campaigns.length === 0 && (
                <div className="text-center py-12">
                  <Link2 className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-4 text-lg font-medium text-gray-900">
                    No campaigns yet
                  </h3>
                  <p className="mt-2 text-gray-500 max-w-sm mx-auto">
                    Create your first campaign to start earning commissions.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Create New Campaign Section - Separated */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <Card className="border-0 shadow-lg bg-white">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-gray-900 flex items-center">
                <Plus className="w-5 h-5 mr-2 text-green-500" />
                Create New Campaign
              </CardTitle>
              <CardDescription className="text-gray-600">
                Set up a new referral campaign to track your marketing efforts
              </CardDescription>
            </CardHeader>

            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Left Column */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Campaign Name
                    </label>
                    <Input
                      ref={campaignNameRef}
                      placeholder="e.g., TikTok September Campaign"
                      onKeyDown={(e) => e.key === "Enter" && handleCreateCampaign()}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Campaign Type
                    </label>
                    <select
                      value={campaignType}
                      onChange={(e) => setCampaignType(e.target.value)}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="home">Home Page Campaign</option>
                      <option value="girl">Featured Girl Campaign</option>
                    </select>
                  </div>
                </div>

                {/* Right Column - Featured Girls Selection */}
                {campaignType === "girl" && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Select Featured Girl
                    </label>
                    <div className="grid grid-cols-2 gap-3 max-h-48 overflow-y-auto border rounded-lg p-3 bg-white">
                      {girls.map((girl) => (
                        <div
                          key={girl.id}
                          onClick={() => setSelectedGirl(girl.id)}
                          className={`cursor-pointer p-3 rounded-lg border-2 transition-all ${selectedGirl === girl.id
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                            }`}
                        >
                          <div className="flex flex-col items-center space-y-2">
                            <Avatar className="h-12 w-12">
                              <AvatarImage
                                src={girl.profile_image_url}
                                alt={girl.name}
                              />
                              <AvatarFallback className="bg-gradient-to-r from-pink-400 to-purple-400 text-white">
                                {girl.name.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            <div className="text-center">
                              <p className="text-sm font-medium text-gray-900 truncate">
                                @{girl.username}
                              </p>
                              <p className="text-xs text-gray-500 truncate">
                                {girl.name}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-6 flex justify-end">
                <Button
                  onClick={handleCreateCampaign}
                  disabled={isCreating}   // only disabled while creating
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8"
                >
                  {isCreating ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Creating Campaign...
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4 mr-2" />
                      Create Campaign
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
      <Dialog open={!!deleteCampaignId} onOpenChange={() => setDeleteCampaignId(null)}>
        <DialogContent className="max-w-sm w-full">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-lg font-semibold text-gray-900">
              <AlertTriangle className="w-5 h-5 text-red-500" />
              Confirm Deletion
            </DialogTitle>
          </DialogHeader>
          <p className="text-gray-600 text-sm mt-2">
            Are you sure you want to delete this campaign? This action cannot be undone.
          </p>
          <div className="flex justify-end gap-3 mt-6">
            <Button
              variant="outline"
              onClick={() => setDeleteCampaignId(null)}
              className="border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </Button>
            <Button
              className="bg-red-600 hover:bg-red-700 text-white"
              disabled={deleting}
              onClick={async () => {
                setDeleting(true);
                try {
                  await handleDeleteCampaign(deleteCampaignId);
                  toast({ title: "Campaign deleted", description: "The campaign has been removed." });
                } finally {
                  setDeleting(false);
                  setDeleteCampaignId(null);
                }
              }}
            >
              {deleting ? "Deleting..." : "Delete"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

    </div>
  );
};

export default AffiliateDashboard;