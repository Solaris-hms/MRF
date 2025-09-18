import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, TrendingDown, DollarSign, Truck, Recycle, Package, Users, Calendar, Download, Filter } from 'lucide-react';

const Dashboard = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('month');

  // Sample data
  const revenueData = [
    { month: 'Jan', revenue: 45000, exports: 12000, processing: 33000 },
    { month: 'Feb', revenue: 52000, exports: 15000, processing: 37000 },
    { month: 'Mar', revenue: 48000, exports: 14000, processing: 34000 },
    { month: 'Apr', revenue: 61000, exports: 18000, processing: 43000 },
    { month: 'May', revenue: 55000, exports: 16000, processing: 39000 },
    { month: 'Jun', revenue: 67000, exports: 21000, processing: 46000 },
  ];

  const wasteTypeData = [
    { name: 'Organic', value: 35, color: '#10b981' },
    { name: 'Plastic', value: 25, color: '#3b82f6' },
    { name: 'Paper', value: 20, color: '#8b5cf6' },
    { name: 'Metal', value: 12, color: '#f59e0b' },
    { name: 'Glass', value: 8, color: '#ef4444' },
  ];

  const exportTrends = [
    { month: 'Jan', volume: 320 },
    { month: 'Feb', volume: 380 },
    { month: 'Mar', volume: 350 },
    { month: 'Apr', volume: 420 },
    { month: 'May', volume: 390 },
    { month: 'Jun', volume: 480 },
  ];

  const StatCard = ({ title, value, change, icon: Icon, trend }) => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow duration-200">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-gray-50 rounded-lg">
            <Icon className="h-6 w-6 text-gray-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
          </div>
        </div>
        <div className={`flex items-center space-x-1 text-sm ${trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
          {trend === 'up' ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
          <span className="font-medium">{change}</span>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Waste Processing Dashboard</h1>
            <p className="text-gray-600">Monitor revenue, exports, and processing metrics</p>
          </div>
          <div className="flex items-center space-x-3 mt-4 md:mt-0">
            <select 
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
            >
              <option value="week">Last Week</option>
              <option value="month">Last Month</option>
              <option value="quarter">Last Quarter</option>
              <option value="year">Last Year</option>
            </select>
            <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200">
              <Download className="h-4 w-4" />
              <span>Export</span>
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Revenue"
            value="$328K"
            change="+12.5%"
            icon={DollarSign}
            trend="up"
          />
          <StatCard
            title="Export Volume"
            value="2,340 tons"
            change="+8.2%"
            icon={Truck}
            trend="up"
          />
          <StatCard
            title="Processing Rate"
            value="94.5%"
            change="+2.1%"
            icon={Recycle}
            trend="up"
          />
          <StatCard
            title="Active Clients"
            value="156"
            change="-1.2%"
            icon={Users}
            trend="down"
          />
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Revenue Chart */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Revenue Breakdown</h3>
              <div className="flex space-x-2">
                <span className="inline-flex items-center px-2 py-1 rounded text-xs bg-blue-100 text-blue-800">
                  Processing
                </span>
                <span className="inline-flex items-center px-2 py-1 rounded text-xs bg-green-100 text-green-800">
                  Exports
                </span>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis dataKey="month" tick={{ fill: '#6b7280' }} />
                <YAxis tick={{ fill: '#6b7280' }} />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }}
                />
                <Bar dataKey="processing" fill="#3b82f6" radius={[2, 2, 0, 0]} />
                <Bar dataKey="exports" fill="#10b981" radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Waste Type Distribution */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Waste Type Distribution</h3>
            <div className="flex flex-col md:flex-row items-center">
              <ResponsiveContainer width="60%" height={200}>
                <PieChart>
                  <Pie
                    data={wasteTypeData}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={80}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {wasteTypeData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex-1 space-y-2">
                {wasteTypeData.map((item, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div 
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: item.color }}
                      ></div>
                      <span className="text-sm text-gray-600">{item.name}</span>
                    </div>
                    <span className="text-sm font-medium text-gray-900">{item.value}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Export Trends and Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Export Trends */}
          <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Export Volume Trends</h3>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={exportTrends}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis dataKey="month" tick={{ fill: '#6b7280' }} />
                <YAxis tick={{ fill: '#6b7280' }} />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="volume" 
                  stroke="#8b5cf6" 
                  strokeWidth={3}
                  dot={{ fill: '#8b5cf6', strokeWidth: 2, r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Recent Activity</h3>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Package className="h-4 w-4 text-green-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">Export shipment completed</p>
                  <p className="text-xs text-gray-500">450 tons to Europe</p>
                  <p className="text-xs text-gray-400">2 hours ago</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Recycle className="h-4 w-4 text-blue-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">Processing batch finished</p>
                  <p className="text-xs text-gray-500">Organic waste - 280 tons</p>
                  <p className="text-xs text-gray-400">4 hours ago</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <Calendar className="h-4 w-4 text-yellow-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">Scheduled maintenance</p>
                  <p className="text-xs text-gray-500">Line 2 - Tomorrow 9 AM</p>
                  <p className="text-xs text-gray-400">6 hours ago</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Users className="h-4 w-4 text-purple-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">New client onboarded</p>
                  <p className="text-xs text-gray-500">GreenTech Industries</p>
                  <p className="text-xs text-gray-400">1 day ago</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;