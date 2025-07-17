import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useMenu } from '../context/MenuContext';
import { format, subDays, startOfWeek, endOfWeek } from 'date-fns';
import DashboardLayout from '../components/layout/DashboardLayout';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import ReactECharts from 'echarts-for-react';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';
import UserRoleManagement from '../components/admin/UserRoleManagement';
import AdvancedAnalytics from '../components/admin/AdvancedAnalytics';

const { FiUsers, FiDollarSign, FiTrendingUp, FiDownload, FiCalendar, FiPieChart, FiActivity, FiUserCheck } = FiIcons;

const AdminDashboard = () => {
  const { user } = useAuth();
  const { getAllReservations } = useMenu();
  const [selectedPeriod, setSelectedPeriod] = useState('week');
  const [activeTab, setActiveTab] = useState('overview');

  const allReservations = getAllReservations();
  const today = new Date();
  const todayReservations = allReservations.filter(r => r.date === format(today, 'yyyy-MM-dd'));
  const weekReservations = allReservations.filter(r => {
    const reservationDate = new Date(r.date);
    return reservationDate >= startOfWeek(today) && reservationDate <= endOfWeek(today);
  });

  // Generate sample data for charts
  const generateChartData = () => {
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = subDays(today, 6 - i);
      const dayReservations = allReservations.filter(r => r.date === format(date, 'yyyy-MM-dd'));
      return {
        date: format(date, 'MMM dd'),
        reservations: dayReservations.length,
        revenue: dayReservations.reduce((sum, r) => sum + r.totalAmount, 0)
      };
    });
    return last7Days;
  };

  const chartData = generateChartData();

  const stats = [
    {
      title: 'Total Reservations',
      value: allReservations.length,
      change: '+12%',
      icon: FiUsers,
      color: 'text-blue-600'
    },
    {
      title: 'Today\'s Revenue',
      value: `৳${todayReservations.reduce((sum, r) => sum + r.totalAmount, 0)}`,
      change: '+8%',
      icon: FiDollarSign,
      color: 'text-green-600'
    },
    {
      title: 'Weekly Revenue',
      value: `৳${weekReservations.reduce((sum, r) => sum + r.totalAmount, 0)}`,
      change: '+15%',
      icon: FiTrendingUp,
      color: 'text-purple-600'
    },
    {
      title: 'Average Order',
      value: `৳${Math.round(allReservations.reduce((sum, r) => sum + r.totalAmount, 0) / allReservations.length) || 0}`,
      change: '+5%',
      icon: FiPieChart,
      color: 'text-orange-600'
    }
  ];

  const reservationChartOption = {
    title: {
      text: 'Daily Reservations',
      left: 'center'
    },
    tooltip: {
      trigger: 'axis'
    },
    xAxis: {
      type: 'category',
      data: chartData.map(d => d.date)
    },
    yAxis: {
      type: 'value'
    },
    series: [
      {
        data: chartData.map(d => d.reservations),
        type: 'line',
        smooth: true,
        itemStyle: {
          color: '#0ea5e9'
        }
      }
    ]
  };

  const revenueChartOption = {
    title: {
      text: 'Daily Revenue',
      left: 'center'
    },
    tooltip: {
      trigger: 'axis',
      formatter: '{b}: ৳{c}'
    },
    xAxis: {
      type: 'category',
      data: chartData.map(d => d.date)
    },
    yAxis: {
      type: 'value'
    },
    series: [
      {
        data: chartData.map(d => d.revenue),
        type: 'bar',
        itemStyle: {
          color: '#10b981'
        }
      }
    ]
  };

  const exportReport = () => {
    const csvContent = [
      ['Date', 'Time', 'Employee', 'Items', 'Guests', 'Total', 'Status'],
      ...allReservations.map(r => [
        r.date,
        r.time,
        r.userName,
        r.items.map(i => `${i.name} x${i.quantity}`).join('; '),
        r.guestCount,
        r.totalAmount,
        r.status
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `admin_report_${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'userManagement':
        return <UserRoleManagement />;
      case 'advancedAnalytics':
        return <AdvancedAnalytics />;
      default:
        return (
          <div className="space-y-6">
            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {stats.map((stat, index) => (
                <motion.div
                  key={stat.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="p-6">
                    <div className="flex items-center justify-between mb-2">
                      <SafeIcon icon={stat.icon} className={`w-8 h-8 ${stat.color}`} />
                      <span className="text-sm text-green-600 font-medium">{stat.change}</span>
                    </div>
                    <p className="text-sm text-gray-600 mb-1">{stat.title}</p>
                    <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  </Card>
                </motion.div>
              ))}
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="p-6">
                <ReactECharts option={reservationChartOption} style={{ height: '300px' }} />
              </Card>
              <Card className="p-6">
                <ReactECharts option={revenueChartOption} style={{ height: '300px' }} />
              </Card>
            </div>

            {/* Recent Activity & User Management */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold text-gray-900">Recent Reservations</h2>
                  <Button variant="outline" onClick={exportReport}>
                    <SafeIcon icon={FiDownload} className="w-4 h-4 mr-2" />
                    Export
                  </Button>
                </div>
                
                <div className="space-y-3">
                  {allReservations.slice(0, 8).map((reservation) => (
                    <div key={reservation.id} className="p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-gray-900">{reservation.userName}</span>
                        <span className="text-sm font-medium text-buft-600">
                          ৳{reservation.totalAmount}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">
                          {reservation.items.length} items
                          {reservation.guestCount > 0 && ` + ${reservation.guestCount} guests`}
                        </span>
                        <span className="text-xs text-gray-500">
                          {reservation.date} {reservation.time}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              <Card className="p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">System Overview</h2>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                    <div>
                      <h3 className="font-medium text-gray-900">Active Users</h3>
                      <p className="text-sm text-gray-600">Registered employees</p>
                    </div>
                    <span className="text-2xl font-bold text-blue-600">150</span>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <div>
                      <h3 className="font-medium text-gray-900">Staff Members</h3>
                      <p className="text-sm text-gray-600">Canteen staff</p>
                    </div>
                    <span className="text-2xl font-bold text-green-600">5</span>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                    <div>
                      <h3 className="font-medium text-gray-900">Menu Items</h3>
                      <p className="text-sm text-gray-600">Available today</p>
                    </div>
                    <span className="text-2xl font-bold text-purple-600">12</span>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                    <div>
                      <h3 className="font-medium text-gray-900">Guest Meals</h3>
                      <p className="text-sm text-gray-600">This week</p>
                    </div>
                    <span className="text-2xl font-bold text-orange-600">
                      {weekReservations.reduce((sum, r) => sum + r.guestCount, 0)}
                    </span>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        );
    }
  };

  return (
    <DashboardLayout title="Admin Dashboard" user={user}>
      {/* Navigation Tabs */}
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px space-x-8">
            <button
              onClick={() => setActiveTab('overview')}
              className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center ${
                activeTab === 'overview'
                  ? 'border-buft-500 text-buft-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <SafeIcon icon={FiActivity} className="w-5 h-5 mr-2" />
              Dashboard Overview
            </button>
            <button
              onClick={() => setActiveTab('userManagement')}
              className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center ${
                activeTab === 'userManagement'
                  ? 'border-buft-500 text-buft-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <SafeIcon icon={FiUserCheck} className="w-5 h-5 mr-2" />
              User Role Management
            </button>
            <button
              onClick={() => setActiveTab('advancedAnalytics')}
              className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center ${
                activeTab === 'advancedAnalytics'
                  ? 'border-buft-500 text-buft-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <SafeIcon icon={FiPieChart} className="w-5 h-5 mr-2" />
              Advanced Analytics
            </button>
          </nav>
        </div>
      </div>

      {/* Tab Content */}
      {renderTabContent()}
    </DashboardLayout>
  );
};

export default AdminDashboard;