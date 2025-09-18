// affiliateData.js - Mock data for affiliate management system

export const affiliatesData = [
  {
    id: "1",
    name: "John Doe",
    email: "john@demo.com",
    joinDate: "2024-01-15",
    status: "active",
    totalCampaigns: 2,
    conversionRate: 13.2,
    campaigns: [
      {
        id: 1,
        name: "TikTok Campaign",
        trackingCode: "abcd1234",
        clicks: 320,
        signups: 45,
        revenue: 1250.50,
        conversionRate: 14.1,
        createdAt: "2024-01-20",
        status: "active"
      },
      {
        id: 2,
        name: "Instagram Ads",
        trackingCode: "xyz789",
        clicks: 210,
        signups: 28,
        revenue: 890.75,
        conversionRate: 13.3,
        createdAt: "2024-02-01",
        status: "active"
      }
    ]
  },
  {
    id: "2",
    name: "Sarah Smith",
    email: "sarah@demo.com",
    joinDate: "2024-02-10",
    status: "active",
    totalCampaigns: 1,
    conversionRate: 15.8,
    campaigns: [
      {
        id: 1,
        name: "YouTube Influencer",
        trackingCode: "sarah001",
        clicks: 1890,
        signups: 89,
        revenue: 2120.25,
        conversionRate: 15.8,
        createdAt: "2024-02-15",
        status: "active"
      }
    ]
  },
  {
    id: "3",
    name: "Mike Johnson",
    email: "mike@demo.com",
    joinDate: "2023-12-05",
    status: "inactive",
    totalCampaigns: 5,
    conversionRate: 11.4,
    campaigns: [
      {
        id: 1,
        name: "Facebook Ads",
        trackingCode: "mike001",
        clicks: 2160,
        signups: 134,
        revenue: 3225.75,
        conversionRate: 12.1,
        createdAt: "2023-12-10",
        status: "paused"
      },
      {
        id: 2,
        name: "Twitter Campaign",
        trackingCode: "mike002",
        clicks: 1890,
        signups: 98,
        revenue: 1890.50,
        conversionRate: 10.9,
        createdAt: "2024-01-05",
        status: "active"
      },
      {
        id: 3,
        name: "LinkedIn Outreach",
        trackingCode: "mike003",
        clicks: 270,
        signups: 35,
        revenue: 1334.50,
        conversionRate: 12.9,
        createdAt: "2024-01-20",
        status: "active"
      },
      {
        id: 4,
        name: "Reddit Marketing",
        trackingCode: "mike004",
        clicks: 540,
        signups: 67,
        revenue: 1876.25,
        conversionRate: 12.4,
        createdAt: "2024-02-05",
        status: "active"
      },
      {
        id: 5,
        name: "Email Campaign",
        trackingCode: "mike005",
        clicks: 145,
        signups: 18,
        revenue: 432.75,
        conversionRate: 12.4,
        createdAt: "2024-02-20",
        status: "active"
      }
    ]
  },
  {
    id: "4",
    name: "Emma Wilson",
    email: "emma@demo.com",
    joinDate: "2024-03-01",
    status: "active",
    totalCampaigns: 3,
    conversionRate: 16.2,
    campaigns: [
      {
        id: 1,
        name: "Pinterest Ads",
        trackingCode: "emma001",
        clicks: 850,
        signups: 142,
        revenue: 3680.50,
        conversionRate: 16.7,
        createdAt: "2024-03-05",
        status: "active"
      },
      {
        id: 2,
        name: "Snapchat Stories",
        trackingCode: "emma002",
        clicks: 620,
        signups: 95,
        revenue: 2340.75,
        conversionRate: 15.3,
        createdAt: "2024-03-12",
        status: "active"
      },
      {
        id: 3,
        name: "Blog Sponsorship",
        trackingCode: "emma003",
        clicks: 340,
        signups: 58,
        revenue: 1450.00,
        conversionRate: 17.1,
        createdAt: "2024-03-18",
        status: "active"
      }
    ]
  },
  {
    id: "5",
    name: "David Chen",
    email: "david@demo.com",
    joinDate: "2024-01-20",
    status: "active",
    totalCampaigns: 2,
    conversionRate: 14.5,
    campaigns: [
      {
        id: 1,
        name: "Google Ads",
        trackingCode: "david001",
        clicks: 1250,
        signups: 185,
        revenue: 4620.00,
        conversionRate: 14.8,
        createdAt: "2024-01-25",
        status: "active"
      },
      {
        id: 2,
        name: "Bing Ads",
        trackingCode: "david002",
        clicks: 780,
        signups: 110,
        revenue: 2750.50,
        conversionRate: 14.1,
        createdAt: "2024-02-10",
        status: "active"
      }
    ]
  }
];

// Helper functions for working with the data
export const getAffiliateById = (id) => {
  return affiliatesData.find(affiliate => affiliate.id === id);
};

export const getAllAffiliates = () => {
  return affiliatesData.map(affiliate => ({
    id: affiliate.id,
    name: affiliate.name,
    email: affiliate.email,
    campaigns: affiliate.campaigns.length,
    clicks: affiliate.campaigns.reduce((total, campaign) => total + campaign.clicks, 0),
    signups: affiliate.campaigns.reduce((total, campaign) => total + campaign.signups, 0),
    revenue: affiliate.campaigns.reduce((total, campaign) => total + campaign.revenue, 0),
    status: affiliate.status
  }));
};

export const getTotalStats = () => {
  const allAffiliates = getAllAffiliates();
  return {
    totalAffiliates: allAffiliates.length,
    totalCampaigns: allAffiliates.reduce((total, affiliate) => total + affiliate.campaigns, 0),
    totalClicks: allAffiliates.reduce((total, affiliate) => total + affiliate.clicks, 0),
    totalSignups: allAffiliates.reduce((total, affiliate) => total + affiliate.signups, 0),
    totalRevenue: allAffiliates.reduce((total, affiliate) => total + affiliate.revenue, 0)
  };
};

export const addNewAffiliate = (affiliateData) => {
  const newId = (Math.max(...affiliatesData.map(a => parseInt(a.id))) + 1).toString();
  const newAffiliate = {
    id: newId,
    name: affiliateData.name,
    email: affiliateData.email,
    joinDate: new Date().toISOString().split('T')[0],
    status: "active",
    totalCampaigns: 0,
    conversionRate: 0,
    campaigns: []
  };
  
  affiliatesData.push(newAffiliate);
  return newAffiliate;
};

export const addCampaignToAffiliate = (affiliateId, campaignName) => {
  const affiliate = getAffiliateById(affiliateId);
  if (!affiliate) return null;

  const newCampaign = {
    id: affiliate.campaigns.length + 1,
    name: campaignName,
    trackingCode: Math.random().toString(36).substring(2, 10),
    clicks: 0,
    signups: 0,
    revenue: 0,
    conversionRate: 0,
    createdAt: new Date().toISOString().split('T')[0],
    status: "active"
  };

  affiliate.campaigns.push(newCampaign);
  affiliate.totalCampaigns = affiliate.campaigns.length;
  
  return newCampaign;
};

export const deleteCampaignFromAffiliate = (affiliateId, campaignId) => {
  const affiliate = getAffiliateById(affiliateId);
  if (!affiliate) return false;

  const initialLength = affiliate.campaigns.length;
  affiliate.campaigns = affiliate.campaigns.filter(campaign => campaign.id !== campaignId);
  affiliate.totalCampaigns = affiliate.campaigns.length;
  
  return affiliate.campaigns.length < initialLength;
};