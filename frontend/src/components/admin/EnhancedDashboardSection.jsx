import React, { useState } from 'react';
import { 
  Users, MessageSquare, Heart, UserCheck, DollarSign, Coins, 
  TrendingUp, Calendar, Activity, Gift, Target, BarChart3,
  ArrowUpRight, ArrowDownRight, ChevronDown
} from 'lucide-react';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, Legend, ResponsiveContainer, Area, AreaChart, PieChart, Pie, Cell
} from 'recharts';

// Clean StatCard component
const StatCard = ({ title, value, icon: Icon, color, subtitle, trend }) => (
  <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow duration-200">
    <div className="flex items-center justify-between">
      <div className="flex-1">
        <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
        {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
      </div>
      <div className={`p-3 rounded-lg bg-gray-50 ${color}`}>
        <Icon className="h-6 w-6" />
      </div>
    </div>
    {trend !== undefined && (
      <div className="mt-3 flex items-center">
        {trend > 0 ? (
          <ArrowUpRight className="h-4 w-4 text-green-500" />
        ) : (
          <ArrowDownRight className="h-4 w-4 text-red-500" />
        )}
        <span className={`text-sm ml-1 font-medium ${trend > 0 ? 'text-green-500' : 'text-red-500'}`}>
          {Math.abs(trend)}%
        </span>
        <span className="text-xs text-gray-500 ml-2">vs last period</span>
      </div>
    )}
  </div>
);

// Modern Chart Card component
const ChartCard = ({ title, children, height = "h-80", controls }) => (
  <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow duration-200">
    <div className="flex items-center justify-between mb-6">
      <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
      {controls}
    </div>
    <div className={height}>
      {children}
    </div>
  </div>
);

// Period selector component
const PeriodSelector = ({ value, onChange, options }) => (
  <div className="relative">
    <select 
      value={value} 
      onChange={(e) => onChange(e.target.value)}
      className="appearance-none bg-white border border-gray-200 rounded-lg px-4 py-2 pr-8 text-sm font-medium text-gray-700 hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
    >
      {options.map(option => (
        <option key={option.value} value={option.value}>{option.label}</option>
      ))}
    </select>
    <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
  </div>
);

// Top Buyers Table component
const TopBuyersTable = ({ buyers }) => (
  <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow duration-200">
    <h3 className="text-lg font-semibold text-gray-900 mb-6">Top Coin Buyers</h3>
    {buyers && buyers.length > 0 ? (
      <div className="overflow-hidden">
        <table className="min-w-full">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="text-left py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
              <th className="text-left py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Total Spent</th>
              <th className="text-left py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Purchases</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {buyers.map((buyer, index) => (
              <tr key={buyer.id} className="hover:bg-gray-50 transition-colors duration-150">
                <td className="py-4">
                  <div className="flex items-center">
                    <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-medium text-sm mr-3">
                      {index + 1}
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {buyer.full_name || 'Unknown User'}
                      </div>
                      <div className="text-xs text-gray-500">{buyer.email}</div>
                    </div>
                  </div>
                </td>
                <td className="py-4">
                  <span className="text-sm font-semibold text-gray-900">
                    ${Number(buyer.total_spent).toLocaleString()}
                  </span>
                </td>
                <td className="py-4">
                  <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-700">
                    {buyer.purchase_count} purchases
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    ) : (
      <div className="text-center py-8 text-gray-500">
        <DollarSign className="h-12 w-12 mx-auto mb-4 text-gray-300" />
        <p>No purchases yet</p>
      </div>
    )}
  </div>
);

// Custom Tooltip for charts
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-200">
        <p className="font-medium text-gray-900 text-sm mb-1">{label}</p>
        {payload.map((entry, index) => (
          <p key={index} style={{ color: entry.color }} className="text-sm">
            {entry.name}: {entry.name.includes('Revenue') || entry.name.includes('$') ? `$${entry.value}` : entry.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

// Main Dashboard Component
const EnhancedDashboardSection = ({ stats }) => {
  const [signupPeriod, setSignupPeriod] = useState('7days');
  const [revenuePeriod, setRevenuePeriod] = useState('7days');

  // Get data for different periods
  const getSignupData = (period) => {
    if (!stats.dailySignups || !stats.dailySignups[period]) return [];
    return stats.dailySignups[period];
  };

  const getRevenueData = (period) => {
    if (!stats.revenueChart || !stats.revenueChart[period]) return [];
    return stats.revenueChart[period];
  };

  if (!stats) {
    return (
      <div className="flex justify-center items-center h-64 bg-white rounded-xl">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
            <p className="text-gray-600">Monitor your platform's performance and user activity</p>
          </div>
          
        </div>
      </div>

      {/* Key Performance Indicators */}
      <section>
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Key Performance Indicators</h2>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <StatCard 
            title="Total Revenue" 
            value={`$${Number(stats.total_revenue).toLocaleString()}`} 
            icon={DollarSign} 
            color="text-green-600"
          />
          <StatCard 
            title="Active Users Today" 
            value={stats.daily_active_users?.toLocaleString() || '0'} 
            icon={Activity} 
            color="text-blue-600"
            subtitle="Users active today"
          />
          <StatCard 
            title="Conversion Rate" 
            value={`${stats.conversion_rate || 0}%`} 
            icon={Target} 
            color="text-purple-600"
          />
          <StatCard 
            title="Today's Revenue" 
            value={`$${Number(stats.today_revenue || 0).toLocaleString()}`} 
            icon={TrendingUp} 
            color="text-orange-600"
          />
        </div>
      </section>

      {/* Revenue Analytics */}
      <section>
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Revenue Analytics</h2>
        <div className="grid gap-6 lg:grid-cols-3">
          <StatCard 
            title="Daily Revenue" 
            value={`$${Number(stats.today_revenue || 0).toLocaleString()}`} 
            icon={Calendar} 
            color="text-green-600"
            subtitle="Today's earnings"
          />
          <StatCard 
            title="Weekly Revenue" 
            value={`$${Number(stats.weekly_revenue || 0).toLocaleString()}`} 
            icon={TrendingUp} 
            color="text-blue-600"
            subtitle="Last 7 days"
          />
          <StatCard 
            title="Monthly Revenue" 
            value={`$${Number(stats.monthly_revenue || 0).toLocaleString()}`} 
            icon={BarChart3} 
            color="text-purple-600"
            subtitle="Last 30 days"
          />
        </div>
      </section>

      {/* Charts Section - 2x2 Grid on Desktop */}
      <div className="grid gap-8 lg:grid-cols-2">
        
        {/* Daily Signups Chart */}
        {stats.dailySignups && stats.dailySignups['7days'] && stats.dailySignups['7days'].length > 0 && (
          <ChartCard 
            title="User Signups" 
            height="h-80"
            controls={
              <PeriodSelector
                value={signupPeriod}
                onChange={setSignupPeriod}
                options={[
                  { value: '7days', label: 'Last 7 Days' },
                  { value: '30days', label: 'Last 30 Days' },
                  { value: '90days', label: 'Last 3 Months' }
                ]}
              />
            }
          >
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={getSignupData(signupPeriod)}>
                <defs>
                  <linearGradient id="colorSignups" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.05}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
                <XAxis 
                  dataKey="date" 
                  stroke="#6B7280"
                  fontSize={12}
                  tickFormatter={(value) => new Date(value).toLocaleDateString('en', { month: 'short', day: 'numeric' })}
                />
                <YAxis stroke="#6B7280" fontSize={12} />
                <Tooltip content={<CustomTooltip />} />
                <Area 
                  type="monotone" 
                  dataKey="users" 
                  stroke="#3B82F6" 
                  strokeWidth={2}
                  fillOpacity={1} 
                  fill="url(#colorSignups)" 
                  name="New Users"
                />
              </AreaChart>
            </ResponsiveContainer>
          </ChartCard>
        )}

        {/* Chat Activity Chart */}
        {stats.chatActivity && stats.chatActivity.length > 0 && (
          <ChartCard title="Chat Activity Overview" height="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.chatActivity} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
                <XAxis 
                  dataKey="date" 
                  stroke="#6B7280"
                  fontSize={12}
                  tickFormatter={(value) => new Date(value).toLocaleDateString('en', { month: 'short', day: 'numeric' })}
                />
                <YAxis stroke="#6B7280" fontSize={12} />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Bar 
                  dataKey="chats" 
                  fill="#8B5CF6" 
                  name="New Chats"
                  radius={[2, 2, 0, 0]}
                />
                <Bar 
                  dataKey="messages" 
                  fill="#06B6D4" 
                  name="Messages Sent"
                  radius={[2, 2, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        )}
      </div>

      {/* Revenue Chart - Full Width */}
      {stats.revenueChart && stats.revenueChart['7days'] && stats.revenueChart['7days'].length > 0 && (
        <ChartCard 
          title="Revenue Trend" 
          height="h-80"
          controls={
            <PeriodSelector
              value={revenuePeriod}
              onChange={setRevenuePeriod}
              options={[
                { value: '7days', label: 'Last 7 Days' },
                { value: '30days', label: 'Last 30 Days' },
                { value: '90days', label: 'Last 3 Months' }
              ]}
            />
          }
        >
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={getRevenueData(revenuePeriod)}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
              <XAxis 
                dataKey="date" 
                stroke="#6B7280"
                fontSize={12}
                tickFormatter={(value) => new Date(value).toLocaleDateString('en', { month: 'short', day: 'numeric' })}
              />
              <YAxis stroke="#6B7280" fontSize={12} />
              <Tooltip content={<CustomTooltip />} />
              <Line 
                type="monotone" 
                dataKey="revenue" 
                stroke="#10B981" 
                strokeWidth={3}
                dot={{ fill: '#10B981', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: '#10B981', strokeWidth: 2 }}
                name="Revenue ($)"
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>
      )}

      {/* Platform Overview */}
      <section>
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Platform Overview</h2>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          <StatCard title="Total Users" value={stats.total_users} icon={Users} color="text-blue-600" />
          <StatCard title="Total Chatters" value={stats.total_chatters} icon={MessageSquare} color="text-green-600" />
          <StatCard title="Total Girls" value={stats.girls} icon={Heart} color="text-pink-600" />
          <StatCard title="Total Admins" value={stats.total_admins} icon={UserCheck} color="text-purple-600" />
          <StatCard title="ARPU" value={`$${stats.average_revenue_per_user || 0}`} icon={Target} color="text-orange-600" />
          <StatCard title="Coins Purchased" value={Number(stats.coins_purchased).toLocaleString()} icon={Coins} color="text-yellow-600" />
        </div>
      </section>

      {/* Today's Activity */}
      <section>
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Today's Activity</h2>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <StatCard 
            title="New Signups" 
            value={stats.today_signups || 0} 
            icon={Users} 
            color="text-blue-600"
            subtitle="New registrations today"
          />
          <StatCard 
            title="Active Users" 
            value={stats.daily_active_users || 0} 
            icon={Activity} 
            color="text-green-600"
            subtitle="Users who chatted"
          />
          <StatCard 
            title="New Chats" 
            value={stats.today_chats || 0} 
            icon={MessageSquare} 
            color="text-purple-600"
            subtitle="Conversations started"
          />
          <StatCard 
            title="Messages Sent" 
            value={stats.total_messages_today || 0} 
            icon={MessageSquare} 
            color="text-orange-600"
            subtitle="Total messages today"
          />
        </div>
      </section>

      {/* User Engagement */}
      <div className="grid gap-8 lg:grid-cols-2">
        
        {/* User Distribution Pie Chart */}
        {stats.userEngagement && stats.userEngagement.length > 0 && (
          <ChartCard title="User Distribution" height="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stats.userEngagement}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {stats.userEngagement.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </ChartCard>
        )}

        {/* Additional metrics */}
        <div className="space-y-6">
          <StatCard 
            title="Weekly Active Users" 
            value={stats.weekly_active_users || 0} 
            icon={Activity} 
            color="text-blue-600"
            subtitle="Active in last 7 days"
          />
          <StatCard 
            title="Paying Users" 
            value={stats.paying_users || 0} 
            icon={DollarSign} 
            color="text-green-600"
            subtitle="Users who made purchases"
          />
          <StatCard 
            title="Active Conversations" 
            value={stats.active_conversations_today || 0} 
            icon={MessageSquare} 
            color="text-purple-600"
            subtitle="Conversations today"
          />
        </div>
      </div>

      {/* Gift Activity (if applicable) */}
      {(stats.gifts_sent_today > 0 || stats.gift_coins_spent_today > 0) && (
        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Gift Activity</h2>
          <div className="grid gap-6 md:grid-cols-3">
            <StatCard 
              title="Gifts Sent Today" 
              value={stats.gifts_sent_today || 0} 
              icon={Gift} 
              color="text-pink-600"
              subtitle="Virtual gifts exchanged"
            />
            <StatCard 
              title="Gift Coins Spent" 
              value={Number(stats.gift_coins_spent_today || 0).toLocaleString()} 
              icon={Coins} 
              color="text-orange-600"
              subtitle="Coins spent on gifts"
            />
          </div>
        </section>
      )}

      {/* Top Buyers Table */}
      <TopBuyersTable buyers={stats.top_buyers} />

    </div>
  );
};

export default EnhancedDashboardSection;