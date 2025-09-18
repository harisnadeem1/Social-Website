import React, { useState, useEffect } from "react";
import axios from "axios";
import {
    Card, CardContent, CardHeader, CardTitle, CardDescription
} from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Plus, Eye, Trash2, TrendingUp, Users, Link2, DollarSign, Search, RefreshCw } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";

const AffiliatesManagement = () => {
    const navigate = useNavigate();
    const { toast } = useToast();

    const [affiliates, setAffiliates] = useState([]);
    const [newAffiliate, setNewAffiliate] = useState({ name: "", email: "", password: "" });
    const [openCreateModal, setOpenCreateModal] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [loading, setLoading] = useState(true);
    const [deleteAffiliateId, setDeleteAffiliateId] = useState(null);
const [deleteLoading, setDeleteLoading] = useState(false);
    const [totalStats, setTotalStats] = useState({
        totalAffiliates: 0,
        totalCampaigns: 0,
        totalClicks: 0,
        totalSignups: 0,
        totalRevenue: 0,
    });

    // ✅ Fetch affiliates from backend
    const fetchAffiliates = async () => {
        try {
            const { data } = await axios.get(
                `${import.meta.env.VITE_API_BASE_URL}/affiliates`,
                { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
            );

            setAffiliates(data);

            // ✅ Calculate totals correctly
            setTotalStats({
                totalAffiliates: data.length,
                totalCampaigns: data.reduce((sum, a) => sum + Number(a.campaigns || 0), 0),
                totalClicks: data.reduce((sum, a) => sum + Number(a.clicks || 0), 0),
                totalSignups: data.reduce((sum, a) => sum + Number(a.signups || 0), 0),
                totalRevenue: data.reduce((sum, a) => sum + Number(a.revenue || 0), 0),
            });
        } catch (error) {
            toast({ title: "Error fetching affiliates", description: error.message, variant: "destructive" });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAffiliates();
    }, []);

    // ✅ Create new affiliate
    const handleCreateAffiliate = async () => {
        if (!newAffiliate.name || !newAffiliate.email || !newAffiliate.password) {
            toast({
                title: "Missing information",
                description: "Please fill in all fields.",
                variant: "destructive",
            });
            return;
        }

        try {
            const { data: createdAffiliate } = await axios.post(
                `${import.meta.env.VITE_API_BASE_URL}/affiliates`,
                newAffiliate,
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("token")}`,
                    },
                }
            );
            setAffiliates((prev) => [createdAffiliate, ...prev]);
            setNewAffiliate({ name: "", email: "", password: "" });
            setOpenCreateModal(false);

            toast({
                title: "Affiliate created successfully",
                description: `${createdAffiliate.full_name || createdAffiliate.name} has been added.`,
            });
        } catch (error) {
            toast({
                title: "Error creating affiliate",
                description: error.response?.data?.message || "There was an error.",
                variant: "destructive",
            });
        }
    };

    // ✅ Delete affiliate
   const handleDeleteAffiliate = async (id) => {
  try {
    await axios.delete(`${import.meta.env.VITE_API_BASE_URL}/affiliates/${id}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    });

    setAffiliates((prev) => prev.filter((a) => a.id !== id));
  } catch (error) {
    toast({
      title: "Error deleting affiliate",
      description: error.response?.data?.message || "There was an error.",
      variant: "destructive",
    });
    throw error;
  }
};


    // ✅ Search filter
    const filteredAffiliates = affiliates.filter(
        (affiliate) =>
            (affiliate.full_name || affiliate.name || "")
                .toLowerCase()
                .includes(searchTerm.toLowerCase()) ||
            (affiliate.email || "").toLowerCase().includes(searchTerm.toLowerCase())
    );

    // ✅ Totals (use aggregated stats)
    // const totalStats = {
    //     totalAffiliates: affiliates.length,
    //     totalCampaigns: affiliates.reduce((sum, a) => sum + Number(a.campaigns || 0), 0),
    //     totalClicks: affiliates.reduce((sum, a) => sum + Number(a.clicks || 0), 0),
    //     totalRevenue: affiliates.reduce((sum, a) => sum + Number(a.revenue || 0), 0),
    // };

    const StatCard = ({ title, value, icon: Icon, color, subtitle }) => (
        <Card className="border-0 shadow-md bg-white hover:shadow-lg transition-shadow duration-200">
            <CardContent className="p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-gray-600">{title}</p>
                        <p className="text-2xl font-bold text-gray-900">{value}</p>
                        {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
                    </div>
                    <div className={`p-3 rounded-full ${color}`}>
                        <Icon className="h-6 w-6 text-white" />
                    </div>
                </div>
            </CardContent>
        </Card>
    );

    return (
        <section id="affiliates-management" className="py-8 space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">🔗 Affiliate Marketing</h2>
                    <p className="text-gray-600 mt-1">
                        Manage affiliates and track campaign performance
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    {/* Refresh Button */}
                    <Button
                        variant="outline"
                        onClick={fetchAffiliates}
                        disabled={loading}
                        className="flex items-center gap-2 border-blue-500 text-blue-600 hover:bg-blue-50 transition-all"
                    >
                        <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
                        {loading ? "Refreshing..." : "Refresh"}
                    </Button>

                    <Dialog open={openCreateModal} onOpenChange={setOpenCreateModal}>
                        <DialogTrigger asChild>
                            <Button className="bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg">
                                <Plus className="w-4 h-4 mr-2" /> Create Affiliate
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-md">
                            <DialogHeader>
                                <DialogTitle className="text-xl font-bold text-gray-900">
                                    Create New Affiliate
                                </DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4 mt-6">
                                <div>
                                    <Label>Full Name</Label>
                                    <Input
                                        value={newAffiliate.name}
                                        onChange={(e) =>
                                            setNewAffiliate({ ...newAffiliate, name: e.target.value })
                                        }
                                        placeholder="Enter full name"
                                    />
                                </div>
                                <div>
                                    <Label>Email Address</Label>
                                    <Input
                                        type="email"
                                        value={newAffiliate.email}
                                        onChange={(e) =>
                                            setNewAffiliate({ ...newAffiliate, email: e.target.value })
                                        }
                                        placeholder="Enter email address"
                                    />
                                </div>
                                <div>
                                    <Label>Password</Label>
                                    <Input
                                        type="password"
                                        value={newAffiliate.password}
                                        onChange={(e) =>
                                            setNewAffiliate({ ...newAffiliate, password: e.target.value })
                                        }
                                        placeholder="Create password"
                                    />
                                </div>
                                <Button
                                    className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white py-2.5 mt-6"
                                    onClick={handleCreateAffiliate}
                                >
                                    Create Affiliate Account
                                </Button>
                            </div>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                    title="Total Affiliates"
                    value={totalStats.totalAffiliates}
                    icon={Users}
                    color="bg-gradient-to-r from-blue-500 to-blue-600"
                    subtitle="Active marketers"
                />
                <StatCard
                    title="Total Campaigns"
                    value={totalStats.totalCampaigns}
                    icon={Link2}
                    color="bg-gradient-to-r from-purple-500 to-purple-600"
                    subtitle="Active tracking links"
                />
                <StatCard
                    title="Total Clicks"
                    value={totalStats.totalClicks.toLocaleString()}
                    icon={TrendingUp}
                    color="bg-gradient-to-r from-green-500 to-green-600"
                    subtitle="Link clicks"
                />
                <StatCard
                    title="Total Revenue"
                    value={`$${totalStats.totalRevenue.toLocaleString()}`}
                    icon={DollarSign}
                    color="bg-gradient-to-r from-orange-500 to-orange-600"
                    subtitle="Generated revenue"
                />
            </div>

            {/* Table */}
            <Card className="border-0 shadow-lg bg-white">
                <CardHeader className="pb-4">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div>
                            <CardTitle className="text-xl font-bold text-gray-900">
                                Affiliate Performance
                            </CardTitle>
                            <CardDescription className="text-gray-600">
                                Track individual affiliate metrics and manage accounts
                            </CardDescription>
                        </div>
                        <div className="relative max-w-sm">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <Input
                                placeholder="Search affiliates..."
                                className="pl-10"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>
                </CardHeader>

                <CardContent>
                    {loading ? (
                        <div className="text-center py-12">Loading affiliates...</div>
                    ) : (
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Affiliate</TableHead>
                                        <TableHead className="hidden sm:table-cell">Campaigns</TableHead>
                                        <TableHead className="hidden md:table-cell">Clicks</TableHead>
                                        <TableHead className="hidden lg:table-cell">Signups</TableHead>
                                        <TableHead className="hidden xl:table-cell">Revenue</TableHead>

                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredAffiliates.map((affiliate) => (
                                        <TableRow key={affiliate.id}>
                                            <TableCell>
                                                <div className="flex items-center space-x-3">
                                                    <Avatar className="h-10 w-10">
                                                        <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold">
                                                            {(affiliate.full_name || affiliate.name || "NA")
                                                                .split(" ")
                                                                .map((n) => n[0])
                                                                .join("")}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    <div>
                                                        <p className="font-medium text-gray-900">
                                                            {affiliate.full_name || affiliate.name}
                                                        </p>
                                                        <p className="text-sm text-gray-500">{affiliate.email}</p>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell className="hidden sm:table-cell">
                                                {affiliate.campaigns}
                                            </TableCell>
                                            <TableCell className="hidden md:table-cell">
                                                {affiliate.clicks}
                                            </TableCell>
                                            <TableCell className="hidden lg:table-cell">
                                                {affiliate.signups}
                                            </TableCell>
                                            <TableCell className="hidden xl:table-cell">
                                                ${affiliate.revenue}
                                            </TableCell>

                                            <TableCell className="text-right space-x-2">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() =>
                                                        navigate(`/admin/affiliates/${affiliate.id}`)
                                                    }
                                                >
                                                    <Eye className="w-4 h-4 mr-1" />
                                                </Button>
                                                <Button
  variant="outline"
  size="sm"
  className="text-red-600 hover:bg-red-50"
  onClick={() => setDeleteAffiliateId(affiliate.id)}
>
  <Trash2 className="w-4 h-4 mr-1" />
</Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </CardContent>
            </Card>
            <Dialog open={!!deleteAffiliateId} onOpenChange={() => setDeleteAffiliateId(null)}>
  <DialogContent className="max-w-sm w-full">
    <DialogHeader>
      <DialogTitle className="text-lg font-semibold text-gray-900">Confirm Delete</DialogTitle>
    </DialogHeader>
    <p className="text-gray-600 text-sm mt-2">
      Are you sure you want to delete this affiliate? This action cannot be undone.
    </p>
    <div className="flex justify-end gap-3 mt-6">
      <Button
        variant="outline"
        onClick={() => setDeleteAffiliateId(null)}
        className="border-gray-300 text-gray-700 hover:bg-gray-50"
      >
        Cancel
      </Button>
      <Button
        className="bg-red-600 hover:bg-red-700 text-white"
        disabled={deleteLoading}
        onClick={async () => {
          setDeleteLoading(true);
          try {
            await handleDeleteAffiliate(deleteAffiliateId);
            toast({ title: "Affiliate deleted successfully" });
          } catch {
            toast({ title: "Error deleting affiliate", variant: "destructive" });
          } finally {
            setDeleteLoading(false);
            setDeleteAffiliateId(null);
          }
        }}
      >
        {deleteLoading ? "Deleting..." : "Delete"}
      </Button>
    </div>
  </DialogContent>
</Dialog>

        </section>
    );
};

export default AffiliatesManagement;
