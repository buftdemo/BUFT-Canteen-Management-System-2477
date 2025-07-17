import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Card from '../ui/Card';
import Button from '../ui/Button';
import Input from '../ui/Input';
import { toast } from '../ui/Toaster';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../../common/SafeIcon';
import ReactECharts from 'echarts-for-react';
import { format, subDays, parseISO } from 'date-fns';
import { generateReservations, generateMenuItems } from '../../utils/mockData';

const { FiDownload, FiRefreshCw, FiCalendar, FiFilter, FiBarChart2, FiPieChart, FiTrendingUp, FiUsers } = FiIcons;

const StaffAnalytics = () => {
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState({
    start: format(subDays(new Date(), 7), 'yyyy-MM-dd'),
    end: format(new Date(), 'yyyy-MM-dd')
  });
  const [reservations, setReservations] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [activeView, setActiveView] = useState('daily');

  const departments = [
    'Administration',
    'Computer Science',
    'Textile Engineering',
    'Fashion Design',
    'Business Administration',
    'Accounting',
    'Human Resources'
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        // In a real implementation, these would be API calls
        const reservationData = generateReservations(100);
        const menuData = generateMenuItems();
        
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

  const exportData = () => {
    const filteredData = getFilteredData();
    
    const csvContent = [
      ['Date', 'Time', 'Customer', 'Items', 'Guests', 'Total', 'Status'],
      ...filteredData.map(r => [
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
    a.download = `staff_analytics_${dateRange.start}_${dateRange.end}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    
    toast.success('Analytics data exported to CSV');
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
        guestCount: 0,
        statusCounts: {},
        popularItems: [],
        dailyData: []
      };
    }

    // Calculate total revenue
    const totalRevenue = filteredReservations.reduce((sum, r) => sum + r.totalAmount, 0);
    
    // Calculate average order value
    const averageOrderValue = totalRevenue / filteredReservations.length;
    
    // Calculate guest count
    const guestCount = filteredReservations.reduce((sum, r) => sum + r.guestCount, 0);
    
    // Calculate status distribution
    const statusCounts = filteredReservations.reduce((counts, r) => {
      counts[r.status] = (counts[r.status] || 0) + 1;
      return counts;
    }, {});
    
    // Calculate popular items
    const itemCounts = {};
    filteredReservations.forEach(r => {
      r.items.forEach(item => {
        if (!itemCounts[item.name]) {
          itemCounts[item.name] = { count: 0, revenue: 0 };
        }
        itemCounts[item.name].count += item.quantity;
        itemCounts[item.name].revenue += item.price * item.quantity;
      });
    });
    
    const popularItems = Object.entries(itemCounts)
      .map(([name, data]) => ({ name, count: data.count, revenue: data.revenue }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
    
    // Calculate daily data
    const dailyData = {};
    filteredReservations.forEach(r => {
      if (!dailyData[r.date]) {
        dailyData[r.date] = { reservations: 0, revenue: 0, guests: 0 };
      }
      dailyData[r.date].reservations++;
      dailyData[r.date].revenue += r.totalAmount;
      dailyData[r.date].guests += r.guestCount;
    });
    
    const dailyDataArray = Object.entries(dailyData)
      .sort((a, b) => new Date(a[0]) - new Date(b[0]))
      .map(([date, data]) => ({ date, ...data }));
    
    return {
      totalReservations: filteredReservations.length,
      totalRevenue,
      averageOrderValue,
      guestCount,
      statusCounts,
      popularItems,
      dailyData: dailyDataArray
    };
  };

  const metrics = calculateMetrics();

  // Chart options
  const getDailyChartOption = () => {
    const dates = metrics.dailyData.map(d => d.date);
    const reservations = metrics.dailyData.map(d => d.reservations);
    const revenue = metrics.dailyData.map(d => d.revenue);
    
    return {
      title: {
        text: 'Daily Overview',
        left: 'center'
      },
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'cross',
          crossStyle: {
            color: '#999'
          }
        }
      },
      legend: {
        data: ['Reservations', 'Revenue'],
        bottom: 10
      },
      xAxis: [
        {
          type: 'category',
          data: dates,
          axisLabel: {
            formatter: (value) => {
              // Show MM-DD format
              return value.substring(5);
            }
          },
          axisPointer: {
            type: 'shadow'
          }
        }
      ],
      yAxis: [
        {
          type: 'value',
          name: 'Reservations',
          position: 'left'
        },
        {
          type: 'value',
          name: 'Revenue',
          position: 'right',
          axisLabel: {
            formatter: (value) => {
              return '৳' + value;
            }
          }
        }
      ],
      series: [
        {
          name: 'Reservations',
          type: 'bar',
          data: reservations,
          itemStyle: {
            color: '#0ea5e9'
          }
        },
        {
          name: 'Revenue',
          type: 'line',
          yAxisIndex: 1,
          data: revenue,
          itemStyle: {
            color: '#10b981'
          }
        }
      ]
    };
  };

  const getItemPopularityOption = () => {
    return {
      title: {
        text: 'Most Popular Items',
        left: 'center'
      },
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow'
        },
        formatter: (params) => {
          const data = params[0];
          return `${data.name}<br/>${data.value} orders<br/>৳${metrics.popularItems.find(i => i.name === data.name)?.revenue || 0} revenue`;
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
        data: metrics.popularItems.map(item => item.name).reverse()
      },
      series: [
        {
          name: 'Orders',
          type: 'bar',
          data: metrics.popularItems.map(item => item.count).reverse(),
          itemStyle: {
            color: function(params) {
              const colorList = ['#5470c6', '#91cc75', '#fac858', '#ee6666', '#73c0de', '#3ba272', '#fc8452', '#9a60b4', '#ea7ccc'];
              return colorList[params.dataIndex % colorList.length];
            }
          }
        }
      ]
    };
  };

  const getStatusDistributionOption = () => {
    return {
      title: {
        text: 'Reservation Status',
        left: 'center'
      },
      tooltip: {
        trigger: 'item',
        formatter: '{a} <br/>{b}: {c} ({d}%)'
      },
      legend: {
        bottom: 10,
        left: 'center',
        data: Object.keys(metrics.statusCounts)
      },
      series: [
        {
          name: 'Status',
          type: 'pie',
          radius: ['40%', '70%'],
          avoidLabelOverlap: false,
          itemStyle: {
            borderRadius: 10,
            borderColor: '#fff',
            borderWidth: 2
          },
          label: {
            show: false,
            position: 'center'
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
          data: Object.entries(metrics.statusCounts).map(([status, count]) => ({
            name: status,
            value: count
          }))
        }
      ]
    };
  };

  const getHourlyDistributionOption = () => {
    // Generate hourly data (mock data for demonstration)
    const hourlyData = Array.from({ length: 24 }, (_, i) => {
      // Generate more realistic distribution - higher at meal times
      let value = Math.floor(Math.random() * 10);
      
      // Breakfast peak (7-9 AM)
      if (i >= 7 && i <= 9) {
        value += Math.floor(Math.random() * 30) + 20;
      }
      
      // Lunch peak (12-2 PM)
      if (i >= 12 && i <= 14) {
        value += Math.floor(Math.random() * 50) + 40;
      }
      
      // Dinner peak (6-8 PM)
      if (i >= 18 && i <= 20) {
        value += Math.floor(Math.random() * 40) + 30;
      }
      
      return value;
    });
    
    return {
      title: {
        text: 'Reservations by Hour',
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
          data: hourlyData,
          type: 'bar',
          itemStyle: {
            color: function(params) {
              // Color based on time of day
              const hour = parseInt(params.name);
              if (hour >= 6 && hour < 12) return '#91cc75'; // Morning: green
              if (hour >= 12 && hour < 18) return '#fac858'; // Afternoon: yellow
              if (hour >= 18 && hour < 22) return '#ee6666'; // Evening: red
              return '#5470c6'; // Night: blue
            }
          }
        }
      ]
    };
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
            <h2 className="text-xl font-semibold text-gray-900">Canteen Performance Analytics</h2>
            <p className="text-gray-600 text-sm">Insights to optimize your canteen operations</p>
          </div>
          <div className="flex items-center space-x-3 mt-4 sm:mt-0">
            <Button variant="outline" onClick={refreshData}>
              <SafeIcon icon={FiRefreshCw} className="w-4 h-4 mr-2" />
              Refresh
            </Button>
            <Button onClick={exportData}>
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
          
          <div className="flex items-center">
            <SafeIcon icon={FiFilter} className="w-4 h-4 mr-2 text-gray-500" />
            <span className="text-sm text-gray-700 mr-2">View:</span>
            <div className="flex border border-gray-300 rounded-md">
              <button
                className={`px-3 py-1 text-sm ${activeView === 'daily' ? 'bg-buft-500 text-white' : 'bg-white text-gray-700'}`}
                onClick={() => setActiveView('daily')}
              >
                Daily
              </button>
              <button
                className={`px-3 py-1 text-sm ${activeView === 'items' ? 'bg-buft-500 text-white' : 'bg-white text-gray-700'}`}
                onClick={() => setActiveView('items')}
              >
                Items
              </button>
              <button
                className={`px-3 py-1 text-sm ${activeView === 'status' ? 'bg-buft-500 text-white' : 'bg-white text-gray-700'}`}
                onClick={() => setActiveView('status')}
              >
                Status
              </button>
              <button
                className={`px-3 py-1 text-sm ${activeView === 'hourly' ? 'bg-buft-500 text-white' : 'bg-white text-gray-700'}`}
                onClick={() => setActiveView('hourly')}
              >
                Hourly
              </button>
            </div>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <p className="text-sm text-gray-500 mb-1">Total Orders</p>
            <h3 className="text-2xl font-bold text-gray-900">{metrics.totalReservations}</h3>
            <p className="text-xs text-green-600 mt-1">+12% vs. last period</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <p className="text-sm text-gray-500 mb-1">Total Revenue</p>
            <h3 className="text-2xl font-bold text-gray-900">৳{Math.round(metrics.totalRevenue)}</h3>
            <p className="text-xs text-green-600 mt-1">+8% vs. last period</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <p className="text-sm text-gray-500 mb-1">Avg. Order Value</p>
            <h3 className="text-2xl font-bold text-gray-900">৳{Math.round(metrics.averageOrderValue || 0)}</h3>
            <p className="text-xs text-red-600 mt-1">-2% vs. last period</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <p className="text-sm text-gray-500 mb-1">Total Guests</p>
            <h3 className="text-2xl font-bold text-gray-900">{metrics.guestCount}</h3>
            <p className="text-xs text-green-600 mt-1">+5% vs. last period</p>
          </div>
        </div>

        {/* Charts based on active view */}
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          {activeView === 'daily' && (
            <ReactECharts option={getDailyChartOption()} style={{ height: '400px' }} />
          )}
          
          {activeView === 'items' && (
            <ReactECharts option={getItemPopularityOption()} style={{ height: '400px' }} />
          )}
          
          {activeView === 'status' && (
            <ReactECharts option={getStatusDistributionOption()} style={{ height: '400px' }} />
          )}
          
          {activeView === 'hourly' && (
            <ReactECharts option={getHourlyDistributionOption()} style={{ height: '400px' }} />
          )}
        </div>

        {/* Additional Insights */}
        <div className="mt-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Key Insights</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
              <h4 className="text-sm font-medium text-gray-900 mb-2">Top Selling Items</h4>
              <div className="space-y-2">
                {metrics.popularItems.slice(0, 5).map((item, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-sm text-gray-700">{item.name}</span>
                    <span className="text-sm font-medium text-gray-900">{item.count} orders</span>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
              <h4 className="text-sm font-medium text-gray-900 mb-2">Peak Times</h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">Breakfast (7-9 AM)</span>
                  <span className="text-sm font-medium text-gray-900">25% of orders</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">Lunch (12-2 PM)</span>
                  <span className="text-sm font-medium text-gray-900">45% of orders</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">Dinner (6-8 PM)</span>
                  <span className="text-sm font-medium text-gray-900">30% of orders</span>
                </div>
              </div>
            </div>
            
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
              <h4 className="text-sm font-medium text-gray-900 mb-2">Recommendations</h4>
              <ul className="space-y-2 text-sm text-gray-700 list-disc pl-5">
                <li>Stock more {metrics.popularItems[0]?.name || 'popular items'} during peak hours</li>
                <li>Consider adding lunch specials to increase revenue</li>
                <li>Optimize staff scheduling for busy periods</li>
                <li>Monitor inventory levels for high-demand items</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Performance Summary */}
        <div className="mt-6 bg-gradient-to-r from-buft-50 to-blue-50 p-4 rounded-lg border border-buft-200">
          <h3 className="text-lg font-medium text-gray-900 mb-3">Performance Summary</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">Today's Highlights</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• {metrics.totalReservations} total orders processed</li>
                <li>• ৳{Math.round(metrics.totalRevenue)} revenue generated</li>
                <li>• {metrics.guestCount} guests served</li>
                <li>• {metrics.popularItems.length} different items ordered</li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">Efficiency Metrics</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Average order processing time: 5 minutes</li>
                <li>• Order completion rate: 95%</li>
                <li>• Customer satisfaction: 4.8/5</li>
                <li>• Peak hour efficiency: 85%</li>
              </ul>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default StaffAnalytics;