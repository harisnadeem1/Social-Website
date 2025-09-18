import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Helmet } from 'react-helmet';

import Header from '@/components/Header';
import MobileHeader from '@/components/MobileHeader';
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Plus,
  Trash2,
  Copy,
  ArrowLeft,
  TrendingUp,
  Users,
  DollarSign,
  Eye,
  ExternalLink,
  Calendar,
  BarChart3,
  Link2,
  CheckCircle,
  AlertCircle
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";

// Import the data functions
import { getAffiliateById, addCampaignToAffiliate, deleteCampaignFromAffiliate } from "../data/affiliateData";
import axios from "axios";

const AffiliateDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { toast } = useToast();

  const [affiliate, setAffiliate] = useState(null);
  const [links, setLinks] = useState([]);
  const [newLink, setNewLink] = useState({ name: "" });
  const [isCreating, setIsCreating] = useState(false);
  const [loading, setLoading] = useState(true);

  const [totals, setTotals] = useState({
    totalClicks: 0,
    totalSignups: 0,
    totalRevenue: 0,
    conversionRate: 0
  });


  useEffect(() => {
    const loadAffiliate = async () => {
      setLoading(true);
      try {
        const { data } = await axios.get(
          `${import.meta.env.VITE_API_BASE_URL}/affiliates/${id}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        setAffiliate(data.affiliate);
        setLinks(data.campaigns || []);
        setTotals(data.totals || {});  // ✅ Add this line
      } catch (error) {
        toast({
          title: "Affiliate not found",
          description: error.response?.data?.message || "The requested affiliate could not be found.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    if (id) loadAffiliate();
  }, [id, toast]);


  const handleCreateLink = async () => {
    if (!newLink.name.trim()) {
      toast({
        title: "Campaign name required",
        description: "Please enter a name for the campaign.",
        variant: "destructive"
      });
      return;
    }

    setIsCreating(true);

    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Add campaign using the helper function
      const newCampaign = addCampaignToAffiliate(id, newLink.name);

      if (newCampaign) {
        // Update local state
        setLinks(prev => [...prev, newCampaign]);
        setNewLink({ name: "" });

        toast({
          title: "Campaign created successfully",
          description: `New tracking link generated: ${newCampaign.trackingCode}`
        });
      } else {
        throw new Error("Failed to create campaign");
      }
    } catch (error) {
      toast({
        title: "Error creating campaign",
        description: "There was an error creating the campaign.",
        variant: "destructive"
      });
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeleteLink = (linkId) => {
    const success = deleteCampaignFromAffiliate(id, linkId);

    if (success) {
      setLinks(prev => prev.filter(link => link.id !== linkId));
      toast({
        title: "Campaign deleted",
        description: "The campaign and its tracking link have been removed."
      });
    } else {
      toast({
        title: "Error deleting campaign",
        description: "There was an error deleting the campaign.",
        variant: "destructive"
      });
    }
  };

  const handleCopyLink = (trackingCode) => {
    const siteUrl = import.meta.env.VITE_SITE_URL;  // Get from .env
    const fullUrl = `${siteUrl}/${trackingCode}`;

    navigator.clipboard.writeText(fullUrl);
    toast({
      title: "Link copied!",
      description: "Tracking URL copied to clipboard"
    });
  };

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading affiliate details...</p>
        </div>
      </div>
    );
  }

  // Show error state if affiliate not found
  if (!affiliate) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="mx-auto h-12 w-12 text-red-500" />
          <p className="mt-4 text-gray-900 text-lg font-medium">Affiliate not found</p>
          <p className="text-gray-600">The requested affiliate could not be found.</p>
          <Button onClick={() => navigate('/admin')} className="mt-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Admin
          </Button>
        </div>
      </div>
    );
  }

  // // Calculate totals
  // const totalClicks = links.reduce((acc, l) => acc + l.clicks, 0);
  // const totalSignups = links.reduce((acc, l) => acc + l.signups, 0);
  // const totalRevenue = links.reduce((acc, l) => acc + Number(l.revenue || 0), 0);
  // const overallConversionRate = totalClicks > 0 ? ((totalSignups / totalClicks) * 100).toFixed(1) : 0;

  const StatCard = ({ title, value, icon: Icon, color, subtitle, trend }) => (
    <Card className="border-0 shadow-md bg-white hover:shadow-lg transition-shadow duration-200">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
            {subtitle && (
              <p className="text-xs text-gray-500 mt-1">{subtitle}</p>
            )}
            {trend && (
              <div className="flex items-center mt-2">
                <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
                <span className="text-xs text-green-500 font-medium">+{trend}%</span>
                <span className="text-xs text-gray-500 ml-1">vs last month</span>
              </div>
            )}
          </div>
          <div className={`p-3 rounded-full ${color}`}>
            <Icon className="h-6 w-6 text-white" />
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <Helmet>
        <title>Affiliate Details - Liebenly</title>
        <meta name="description" content="Administrator control panel for Liebenly." />
      </Helmet>

      <Header />
      <MobileHeader />
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        {/* Header */}
        <div className="mb-6">
          <Button
            variant="outline"
            onClick={() => {
              navigate(-1);
              // Wait for navigation to finish before scrolling
              setTimeout(() => {
                window.scrollTo({ top: document.body.scrollHeight });
              }, 100); // small delay so page has time to render
            }}
            className="mb-4 hover:bg-gray-50"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Affiliates
          </Button>


          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center space-x-4">
              <Avatar className="h-16 w-16">
                <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-500 text-white text-xl font-bold">
                  {affiliate.full_name.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{affiliate.full_name}</h1>
                <p className="text-gray-600">{affiliate.email}</p>

              </div>
            </div>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard
            title="Total Clicks"
            value={totals.totalClicks?.toLocaleString() || 0}
            icon={Eye}
            color="bg-gradient-to-r from-blue-500 to-blue-600"
            subtitle="All-time clicks"
          />
          <StatCard
            title="Total Signups"
            value={totals.totalSignups?.toLocaleString() || 0}
            icon={Users}
            color="bg-gradient-to-r from-green-500 to-green-600"
            subtitle="Converted users"
          />
          <StatCard
            title="Total Revenue"
            value={`$${totals.totalRevenue?.toLocaleString() || 0}`}
            icon={DollarSign}
            color="bg-gradient-to-r from-purple-500 to-purple-600"
            subtitle="Generated revenue"
          />
          <StatCard
            title="Conversion Rate"
            value={`${totals.conversionRate || 0}%`}
            icon={TrendingUp}
            color="bg-gradient-to-r from-orange-500 to-orange-600"
            subtitle="Click to signup"
          />

        </div>

        {/* Campaign Management */}
        <Card className="border-0 shadow-lg bg-white">
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <CardTitle className="text-xl font-bold text-gray-900 flex items-center">
                  <Link2 className="w-5 h-5 mr-2 text-blue-500" />
                  Campaign Management
                </CardTitle>
                <CardDescription className="text-gray-600">
                  Track performance and manage referral links for this affiliate
                </CardDescription>
              </div>

              {/* Create new campaign */}
              {/* <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                <Input
                  placeholder="Enter campaign name..."
                  value={newLink.name}
                  onChange={(e) => setNewLink({ name: e.target.value })}
                  className="sm:w-64"
                  onKeyPress={(e) => e.key === 'Enter' && handleCreateLink()}
                />
                <Button 
                  onClick={handleCreateLink}
                  disabled={isCreating || !newLink.name.trim()}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
                >
                  {isCreating ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Creating...
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4 mr-2" />
                      Create Campaign
                    </>
                  )}
                </Button>
              </div> */}
            </div>
          </CardHeader>

          <CardContent>
            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Campaign</TableHead>
                    <TableHead>Tracking URL</TableHead>
                    <TableHead>Clicks</TableHead>
                    <TableHead>Signups</TableHead>
                    <TableHead>Revenue</TableHead>
                    <TableHead>Conv. Rate</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {links.map((link) => (
                    <TableRow key={link.id} className="hover:bg-gray-50/50">
                      <TableCell>
                        <div>
                          <p className="font-medium text-gray-900">{link.name}</p>

                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">
                            {link.trackingCode}
                          </span>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleCopyLink(link.trackingCode)}
                            className="h-6 w-6 p-0"
                          >
                            <Copy className="w-3 h-3" />
                          </Button>
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">{link.clicks.toLocaleString()}</TableCell>
                      <TableCell className="font-medium text-green-600">{link.signups}</TableCell>
                      <TableCell className="font-medium text-purple-600">
                        ${link.revenue.toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="font-medium">
                          {link.conversionRate}%
                        </Badge>
                      </TableCell>

                      <TableCell className="text-right">
                        <div className="flex items-center justify-end space-x-1">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => window.open(`${import.meta.env.VITE_SITE_URL}/${link.trackingCode}`, '_blank')}

                            className="hover:bg-blue-50 hover:border-blue-200"
                          >
                            <ExternalLink className="w-3 h-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleCopyLink(link.trackingCode)}
                            className="hover:bg-green-50 hover:border-green-200"
                          >
                            <Copy className="w-3 h-3" />
                          </Button>
                          {/* <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDeleteLink(link.id)}
                            className="hover:bg-red-50 hover:border-red-200 text-red-600"
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button> */}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Mobile Cards */}
            <div className="md:hidden space-y-4">
              {links.map((link) => (
                <Card key={link.id} className="border border-gray-200">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-medium text-gray-900">{link.name}</h3>
                      {/* <Badge 
                        variant="default"
                        className="bg-green-100 text-green-800 border-green-200 text-xs"
                      >
                        {link.status}
                      </Badge> */}
                    </div>

                    <div className="grid grid-cols-2 gap-3 mb-4 text-sm">
                      <div>
                        <p className="text-gray-500">Clicks</p>
                        <p className="font-semibold">{link.clicks.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Signups</p>
                        <p className="font-semibold text-green-600">{link.signups}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Revenue</p>
                        <p className="font-semibold text-purple-600">${link.revenue.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Conv. Rate</p>
                        <p className="font-semibold">{link.conversionRate}%</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">
                          {link.trackingCode}
                        </span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleCopyLink(link.trackingCode)}
                          className="text-xs"
                        >
                          <Copy className="w-3 h-3 mr-1" />
                          Copy
                        </Button>
                        {/* <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDeleteLink(link.id)}
                          className="text-xs text-red-600 hover:bg-red-50"
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button> */}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Empty State */}
            {links.length === 0 && (
              <div className="text-center py-12">
                <Link2 className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-4 text-lg font-medium text-gray-900">No campaigns yet</h3>
                <p className="mt-2 text-gray-500">Create your first tracking campaign to get started.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AffiliateDetail;