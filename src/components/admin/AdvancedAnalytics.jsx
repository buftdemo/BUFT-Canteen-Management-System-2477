import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Card from '../ui/Card';
import Button from '../ui/Button';
import Input from '../ui/Input';
import { toast } from '../ui/Toaster';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../../common/SafeIcon';
import ReactECharts from 'echarts-for-react';
import { format, subDays, startOfMonth, endOfMonth } from 'date-fns';
import { generateAnalyticsData, generateReservations, generateMenuItems } from '../../utils/mockData';

const { FiDownload, FiRefreshCw, FiCalendar, FiFilter, FiBarChart2, FiPieChart, FiTrendingUp } = FiIcons;

const AdvancedAnalytics = () => {
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState({
    start: format(startOfMonth(new Date()), 'yyyy-MM-dd'),
    end: format(endOfMonth(new Date()), 'yyyy-MM-dd')
  });
  const [analyticsData, setAnalyticsData] = useState(null);
  const [activeTab, setActiveTab] = useState('sales');
  const [reservations, setReservations] = useState([]);
  const [menuItems, setMenuItems] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // In a real implementation, these would be API calls
        const analytics = generateAnalyticsData();
        const reservationData = generateReservations(200);
        const menuData = generateMenuItems();
        
        setAnalyticsData(analytics);
        setReservations(reservationData);
        setMenuItems(menuData);
      } catch (error) {
        toast.error('Failed to fetch analytics data');
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleDateChange = (field, value) => {
    setDateRange(prev => ({ ...prev, [field]: value }));
  };

  const refreshData = () => {
    setLoading(true);
    // In a real implementation, this would refetch data from the API
    setTimeout(() => {
      toast.success('Analytics data refreshed');
      setLoading(false);
    }, 800);
  };

  const exportData = (format = 'csv') => {
    if (format === 'csv') {
      const csvContent = [
        ['Date', 'Reservations', 'Revenue', 'Average Order Value'],
        ...analyticsData.reservationCounts.map((day, index) => [
          day.date,
          day.count,
          `৳${Math.round(day.count * analyticsData.averageOrderValue)}`,
          `৳${analyticsData.averageOrderValue}`
        ])
      ].map(row => row.join(',')).join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `analytics_${dateRange.start}_${dateRange.end}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
      
      toast.success('Analytics data exported to CSV');
    } else {
      toast.info('PDF export functionality not implemented in demo');
    }
  };

  // Generate filtered data based on date range
  const getFilteredData = () => {
    return reservations.filter(r => {
      return r.date >= dateRange.start && r.date <= dateRange.end;
    });
  };

  const filteredReservations = getFilteredData();

  // Calculate metrics
  const calculateMetrics = () => {
    if (filteredReservations.length === 0) {
      return {
        totalReservations: 0,
        totalRevenue: 0,
        averageOrderValue: 0,
        peakHour: '-',
        topSellingItem: '-',
        statusDistribution: {},
        departmentDistribution: {},
        dailyRevenue: []
      };
    }

    // Calculate total revenue
    const totalRevenue = filteredReservations.reduce((sum, r) => sum + r.totalAmount, 0);
    
    // Calculate average order value
    const averageOrderValue = totalRevenue / filteredReservations.length;
    
    // Calculate peak hour
    const hourCounts = {};
    filteredReservations.forEach(r => {
      const hour = r.time.split(':')[0];
      hourCounts[hour] = (hourCounts[hour] || 0) + 1;
    });
    const peakHour = Object.entries(hourCounts).sort((a, b) => b[1] - a[1])[0][0];
    
    // Calculate top selling item
    const itemCounts = {};
    filteredReservations.forEach(r => {
      r.items.forEach(item => {
        itemCounts[item.name] = (itemCounts[item.name] || 0) + item.quantity;
      });
    });
    const topSellingItem = Object.entries(itemCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || '-';
    
    // Calculate status distribution
    const statusDistribution = {};
    filteredReservations.forEach(r => {
      statusDistribution[r.status] = (statusDistribution[r.status] || 0) + 1;
    });
    
    // Calculate department distribution (based on user department)
    const departmentDistribution = {};
    filteredReservations.forEach(r => {
      // Assuming each reservation has user information with department
      // In a real implementation, you would join this data
      const department = r.department || 'Unknown';
      departmentDistribution[department] = (departmentDistribution[department] || 0) + 1;
    });
    
    // Calculate daily revenue
    const dailyRevenue = {};
    filteredReservations.forEach(r => {
      dailyRevenue[r.date] = (dailyRevenue[r.date] || 0) + r.totalAmount;
    });
    
    const dailyRevenueArray = Object.entries(dailyRevenue)
      .sort((a, b) => new Date(a[0]) - new Date(b[0]))
      .map(([date, amount]) => ({ date, amount }));
    
    return {
      totalReservations: filteredReservations.length,
      totalRevenue,
      averageOrderValue,
      peakHour: `${peakHour}:00`,
      topSellingItem,
      statusDistribution,
      departmentDistribution,
      dailyRevenue: dailyRevenueArray
    };
  };

  const metrics = calculateMetrics();

  // Chart options
  const salesTrendOption = {
    title: {
      text: 'Revenue Trend',
      left: 'center'
    },
    tooltip: {
      trigger: 'axis',
      formatter: '{b}: ৳{c}'
    },
    xAxis: {
      type: 'category',
      data: metrics.dailyRevenue.map(d => d.date),
      axisLabel: {
        formatter: (value) => {
          return value.substring(5); // Show only MM-DD
        }
      }
    },
    yAxis: {
      type: 'value',
      axisLabel: {
        formatter: (value) => {
          return '৳' + value;
        }
      }
    },
    series: [
      {
        data: metrics.dailyRevenue.map(d => d.amount),
        type: 'line',
        smooth: true,
        areaStyle: {
          opacity: 0.3
        },
        itemStyle: {
          color: '#0ea5e9'
        }
      }
    ]
  };

  const statusDistributionOption = {
    title: {
      text: 'Reservation Status Distribution',
      left: 'center'
    },
    tooltip: {
      trigger: 'item',
      formatter: '{a} <br/>{b}: {c} ({d}%)'
    },
    legend: {
      orient: 'vertical',
      right: 10,
      top: 'center'
    },
    series: [
      {
        name: 'Reservation Status',
        type: 'pie',
        radius: ['40%', '70%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 10,
          borderColor: '#fff',
          borderWidth: 2
        },
        label: {
          show: false
        },
        emphasis: {
          label: {
            show: true,
            fontSize: '18',
            fontWeight: 'bold'
          }
        },
        labelLine: {
          show: false
        },
        data: Object.entries(metrics.statusDistribution).map(([status, count]) => ({
          name: status,
          value: count
        }))
      }
    ]
  };

  const itemPopularityOption = {
    title: {
      text: 'Most Popular Menu Items',
      left: 'center'
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      }
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'value'
    },
    yAxis: {
      type: 'category',
      data: analyticsData?.menuItemPopularity.slice(0, 10).map(item => item.name).reverse() || []
    },
    series: [
      {
        name: 'Orders',
        type: 'bar',
        data: analyticsData?.menuItemPopularity.slice(0, 10).map(item => item.orders).reverse() || [],
        itemStyle: {
          color: function(params) {
            const colorList = ['#5470c6', '#91cc75', '#fac858', '#ee6666', '#73c0de', '#3ba272', '#fc8452', '#9a60b4', '#ea7ccc'];
            return colorList[params.dataIndex % colorList.length];
          }
        }
      }
    ]
  };

  const departmentDistributionOption = {
    title: {
      text: 'Reservations by Department',
      left: 'center'
    },
    tooltip: {
      trigger: 'item',
      formatter: '{a} <br/>{b}: {c} ({d}%)'
    },
    legend: {
      orient: 'vertical',
      right: 10,
      top: 'center'
    },
    series: [
      {
        name: 'Department',
        type: 'pie',
        radius: '70%',
        data: Object.entries(metrics.departmentDistribution).map(([dept, count]) => ({
          name: dept,
          value: count
        })),
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)'
          }
        }
      }
    ]
  };

  const hourlyDistributionOption = {
    title: {
      text: 'Reservations by Hour of Day',
      left: 'center'
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      }
    },
    xAxis: {
      type: 'category',
      data: Array.from({ length: 24 }, (_, i) => `${i}:00`)
    },
    yAxis: {
      type: 'value'
    },
    series: [
      {
        data: Array.from({ length: 24 }, (_, i) => {
          // Generate random data for demo purposes
          // In a real implementation, this would be calculated from the reservations
          return Math.floor(Math.random() * 50) + (i > 8 && i < 14 ? 50 : 10);
        }),
        type: 'bar',
        itemStyle: {
          color: function(params) {
            // Higher values get darker colors
            const value = params.value;
            const maxValue = 100;
            const minColor = [3, 169, 244, 0.3]; // Light blue
            const maxColor = [3, 169, 244, 1]; // Dark blue
            
            const percent = Math.min(value / maxValue, 1);
            const color = minColor.map((c, i) => {
              if (i === 3) return minColor[3] + percent * (maxColor[3] - minColor[3]);
              return c;
            });
            
            return `rgba(${color.join(',')})`;
          }
        }
      }
    ]
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-buft-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Advanced Analytics</h2>
            <p className="text-gray-600 text-sm">In-depth analysis of canteen operations and performance</p>
          </div>
          <div className="flex items-center space-x-3 mt-4 sm:mt-0">
            <Button variant="outline" onClick={refreshData}>
              <SafeIcon icon={FiRefreshCw} className="w-4 h-4 mr-2" />
              Refresh
            </Button>
            <Button onClick={() => exportData('csv')}>
              <SafeIcon icon={FiDownload} className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-4 mb-6">
          <div className="flex items-center">
            <SafeIcon icon={FiCalendar} className="w-4 h-4 mr-2 text-gray-500" />
            <span className="text-sm text-gray-700 mr-2">Date Range:</span>
            <Input
              type="date"
              value={dateRange.start}
              onChange={(e) => handleDateChange('start', e.target.value)}
              className="w-40"
            />
            <span className="mx-2">to</span>
            <Input
              type="date"
              value={dateRange.end}
              onChange={(e) => handleDateChange('end', e.target.value)}
              className="w-40"
            />
          </div>
        </div>

        {/* Analytics Tabs */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px space-x-8">
              <button
                onClick={() => setActiveTab('sales')}
                className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center ${
                  activeTab === 'sales'
                    ? 'border-buft-500 text-buft-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <SafeIcon icon={FiBarChart2} className="w-5 h-5 mr-2" />
                Sales Analytics
              </button>
              <button
                onClick={() => setActiveTab('menu')}
                className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center ${
                  activeTab === 'menu'
                    ? 'border-buft-500 text-buft-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <SafeIcon icon={FiPieChart} className="w-5 h-5 mr-2" />
                Menu Analytics
              </button>
              <button
                onClick={() => setActiveTab('user')}
                className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center ${
                  activeTab === 'user'
                    ? 'border-buft-500 text-buft-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <SafeIcon icon={FiUsers} className="w-5 h-5 mr-2" />
                User Analytics
              </button>
              <button
                onClick={() => setActiveTab('trends')}
                className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center ${
                  activeTab === 'trends'
                    ? 'border-buft-500 text-buft-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <SafeIcon icon={FiTrendingUp} className="w-5 h-5 mr-2" />
                Trends
              </button>
            </nav>
          </div>
        </div>

        {/* Key Metrics Summary */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <p className="text-sm text-gray-500 mb-1">Total Reservations</p>
            <h3 className="text-2xl font-bold text-gray-900">{metrics.totalReservations}</h3>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <p className="text-sm text-gray-500 mb-1">Total Revenue</p>
            <h3 className="text-2xl font-bold text-gray-900">৳{Math.round(metrics.totalRevenue)}</h3>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <p className="text-sm text-gray-500 mb-1">Avg. Order Value</p>
            <h3 className="text-2xl font-bold text-gray-900">৳{Math.round(metrics.averageOrderValue || 0)}</h3>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <p className="text-sm text-gray-500 mb-1">Peak Hour</p>
            <h3 className="text-2xl font-bold text-gray-900">{metrics.peakHour}</h3>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'sales' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                <ReactECharts option={salesTrendOption} style={{ height: '350px' }} />
              </div>
              <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                <ReactECharts option={statusDistributionOption} style={{ height: '350px' }} />
              </div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
              <ReactECharts option={hourlyDistributionOption} style={{ height: '350px' }} />
            </div>
          </div>
        )}

        {activeTab === 'menu' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                <ReactECharts option={itemPopularityOption} style={{ height: '400px' }} />
              </div>
              <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Menu Item Performance</h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Item Name</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Orders</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Revenue</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Popularity</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {menuItems.slice(0, 10).map((item) => (
                        <tr key={item.id}>
                          <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">{item.name}</td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{item.category}</td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{Math.floor(item.popularity * Math.random())}</td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">৳{item.price * Math.floor(item.popularity * Math.random())}</td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <div className="w-full bg-gray-200 rounded-full h-2.5">
                              <div className="bg-buft-500 h-2.5 rounded-full" style={{ width: `${item.popularity}%` }}></div>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'user' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                <ReactECharts option={departmentDistributionOption} style={{ height: '400px' }} />
              </div>
              <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                <h3 className="text-lg font-medium text-gray-900 mb-4">User Activity</h3>
                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Most Active Users</h4>
                    <div className="space-y-2">
                      {Array.from({ length: 5 }, (_, i) => ({
                        name: `Employee ${i + 1}`,
                        department: departments[Math.floor(Math.random() * departments.length)],
                        reservations: Math.floor(Math.random() * 30) + 10,
                        amount: Math.floor(Math.random() * 5000) + 1000
                      })).map((user, index) => (
                        <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                          <div>
                            <p className="text-sm font-medium text-gray-900">{user.name}</p>
                            <p className="text-xs text-gray-500">{user.department}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-medium text-gray-900">{user.reservations} reservations</p>
                            <p className="text-xs text-gray-500">৳{user.amount} spent</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">New Users (Last 30 Days)</h4>
                    <div className="flex items-center justify-center">
                      <div className="w-32 h-32 rounded-full border-8 border-buft-500 flex items-center justify-center">
                        <div className="text-center">
                          <p className="text-3xl font-bold text-gray-900">12</p>
                          <p className="text-xs text-gray-500">new users</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'trends' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Reservation Trends</h3>
                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Growth Rate</h4>
                    <div className="flex items-center">
                      <div className="w-full bg-gray-200 rounded-full h-2.5 mr-2">
                        <div className="bg-green-500 h-2.5 rounded-full" style={{ width: '75%' }}></div>
                      </div>
                      <span className="text-sm font-medium text-green-600">+15%</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Compared to previous period</p>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Forecast (Next 30 Days)</h4>
                    <div className="flex items-center">
                      <div className="w-full bg-gray-200 rounded-full h-2.5 mr-2">
                        <div className="bg-blue-500 h-2.5 rounded-full" style={{ width: '82%' }}></div>
                      </div>
                      <span className="text-sm font-medium text-blue-600">+23%</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Based on historical data</p>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Seasonal Patterns</h4>
                    <div className="flex flex-wrap gap-2">
                      <span className="px-2 py-1 bg-buft-100 text-buft-800 text-xs rounded-full">Higher on Mondays</span>
                      <span className="px-2 py-1 bg-buft-100 text-buft-800 text-xs rounded-full">Peak at lunch time</span>
                      <span className="px-2 py-1 bg-buft-100 text-buft-800 text-xs rounded-full">Lower on holidays</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Menu Trends</h3>
                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Rising Items</h4>
                    <div className="space-y-2">
                      {['Chicken Biryani', 'Beef Curry', 'Mango Juice'].map((item, index) => (
                        <div key={index} className="flex items-center justify-between">
                          <span className="text-sm text-gray-900">{item}</span>
                          <span className="text-sm font-medium text-green-600">+{Math.floor(Math.random() * 40) + 20}%</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Declining Items</h4>
                    <div className="space-y-2">
                      {['Fish Fry', 'Rice', 'Tea'].map((item, index) => (
                        <div key={index} className="flex items-center justify-between">
                          <span className="text-sm text-gray-900">{item}</span>
                          <span className="text-sm font-medium text-red-600">-{Math.floor(Math.random() * 20) + 5}%</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Recommended Actions</h4>
                    <ul className="list-disc pl-5 text-sm text-gray-700 space-y-1">
                      <li>Promote Chicken Biryani during peak hours</li>
                      <li>Consider price adjustment for Fish Fry</li>
                      <li>Add new beverage options</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Predictive Analytics</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Expected Revenue (Next Month)</h4>
                  <p className="text-2xl font-bold text-gray-900">৳{Math.floor(Math.random() * 50000) + 100000}</p>
                  <div className="mt-2">
                    <span className="text-xs font-medium text-green-600">+12% vs. current month</span>
                  </div>
                </div>

                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Projected Orders (Next Month)</h4>
                  <p className="text-2xl font-bold text-gray-900">{Math.floor(Math.random() * 500) + 1000}</p>
                  <div className="mt-2">
                    <span className="text-xs font-medium text-blue-600">+8% vs. current month</span>
                  </div>
                </div>

                <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Inventory Forecast</h4>
                  <p className="text-2xl font-bold text-gray-900">3 items</p>
                  <div className="mt-2">
                    <span className="text-xs font-medium text-purple-600">may need restocking soon</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};

export default AdvancedAnalytics;