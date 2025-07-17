import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import Card from '../ui/Card';
import Button from '../ui/Button';
import Input from '../ui/Input';
import { toast } from '../ui/Toaster';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../../common/SafeIcon';
import { format, subDays, startOfWeek, endOfWeek, startOfMonth, endOfMonth, parseISO } from 'date-fns';
import { generateReservations, generateEmployees } from '../../utils/mockData';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import ReactECharts from 'echarts-for-react';

const { FiDownload, FiCalendar, FiPrinter, FiRefreshCw, FiFilter } = FiIcons;

const ReportsManagement = () => {
  const [loading, setLoading] = useState(true);
  const [reportType, setReportType] = useState('daily');
  const [startDate, setStartDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [endDate, setEndDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [reservations, setReservations] = useState([]);
  const [filteredReservations, setFilteredReservations] = useState([]);
  const [reportData, setReportData] = useState({
    totalReservations: 0,
    totalRevenue: 0,
    avgOrderValue: 0,
    guestCount: 0,
    statusCounts: {},
    itemPopularity: []
  });
  
  const chartRef = useRef(null);
  
  useEffect(() => {
    // Fetch reservations from API or database
    const fetchReservations = async () => {
      try {
        // In a real implementation, this would be an API call
        const data = generateReservations(100);
        setReservations(data);
      } catch (error) {
        toast.error('Failed to fetch reservations');
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchReservations();
  }, []);
  
  useEffect(() => {
    // Update date range based on report type
    switch (reportType) {
      case 'daily':
        setStartDate(format(new Date(), 'yyyy-MM-dd'));
        setEndDate(format(new Date(), 'yyyy-MM-dd'));
        break;
      case 'weekly':
        setStartDate(format(startOfWeek(new Date()), 'yyyy-MM-dd'));
        setEndDate(format(endOfWeek(new Date()), 'yyyy-MM-dd'));
        break;
      case 'monthly':
        setStartDate(format(startOfMonth(new Date()), 'yyyy-MM-dd'));
        setEndDate(format(endOfMonth(new Date()), 'yyyy-MM-dd'));
        break;
      // 'custom' case does not change dates
    }
  }, [reportType]);
  
  useEffect(() => {
    // Filter reservations based on date range
    const filtered = reservations.filter(res => {
      const resDate = res.date;
      return resDate >= startDate && resDate <= endDate;
    });
    
    setFilteredReservations(filtered);
    
    // Calculate report metrics
    if (filtered.length > 0) {
      const totalRevenue = filtered.reduce((sum, res) => sum + res.totalAmount, 0);
      const avgOrderValue = totalRevenue / filtered.length;
      const guestCount = filtered.reduce((sum, res) => sum + res.guestCount, 0);
      
      // Count reservations by status
      const statusCounts = filtered.reduce((counts, res) => {
        counts[res.status] = (counts[res.status] || 0) + 1;
        return counts;
      }, {});
      
      // Calculate item popularity
      const itemCounts = {};
      filtered.forEach(res => {
        res.items.forEach(item => {
          if (!itemCounts[item.name]) {
            itemCounts[item.name] = { count: 0, revenue: 0 };
          }
          itemCounts[item.name].count += item.quantity;
          itemCounts[item.name].revenue += item.price * item.quantity;
        });
      });
      
      const itemPopularity = Object.entries(itemCounts).map(([name, data]) => ({
        name,
        count: data.count,
        revenue: data.revenue
      }));
      
      // Sort by count in descending order
      itemPopularity.sort((a, b) => b.count - a.count);
      
      setReportData({
        totalReservations: filtered.length,
        totalRevenue,
        avgOrderValue,
        guestCount,
        statusCounts,
        itemPopularity
      });
    } else {
      setReportData({
        totalReservations: 0,
        totalRevenue: 0,
        avgOrderValue: 0,
        guestCount: 0,
        statusCounts: {},
        itemPopularity: []
      });
    }
  }, [reservations, startDate, endDate]);
  
  const generatePDF = () => {
    const doc = new jsPDF();
    
    // Add title and report info
    doc.setFontSize(18);
    doc.text('BUFT Canteen Report', 105, 15, { align: 'center' });
    
    doc.setFontSize(12);
    doc.text(`Report Type: ${reportType.charAt(0).toUpperCase() + reportType.slice(1)}`, 14, 25);
    doc.text(`Date Range: ${startDate} to ${endDate}`, 14, 32);
    doc.text(`Generated on: ${format(new Date(), 'yyyy-MM-dd HH:mm')}`, 14, 39);
    
    // Add summary section
    doc.setFontSize(14);
    doc.text('Summary', 14, 50);
    
    doc.setFontSize(10);
    doc.text(`Total Reservations: ${reportData.totalReservations}`, 14, 58);
    doc.text(`Total Revenue: ৳${reportData.totalRevenue.toFixed(2)}`, 14, 65);
    doc.text(`Average Order Value: ৳${reportData.avgOrderValue.toFixed(2)}`, 14, 72);
    doc.text(`Guest Count: ${reportData.guestCount}`, 14, 79);
    
    // Add status breakdown
    doc.setFontSize(14);
    doc.text('Status Breakdown', 14, 90);
    
    const statusData = Object.entries(reportData.statusCounts).map(([status, count]) => [
      status.charAt(0).toUpperCase() + status.slice(1),
      count,
      ((count / reportData.totalReservations) * 100).toFixed(2) + '%'
    ]);
    
    doc.autoTable({
      startY: 95,
      head: [['Status', 'Count', 'Percentage']],
      body: statusData,
      theme: 'grid',
      headStyles: { fillColor: [2, 132, 199] }
    });
    
    // Add popular items
    doc.setFontSize(14);
    doc.text('Most Popular Items', 14, doc.lastAutoTable.finalY + 15);
    
    const itemData = reportData.itemPopularity.slice(0, 10).map((item, index) => [
      index + 1,
      item.name,
      item.count,
      `৳${item.revenue.toFixed(2)}`
    ]);
    
    doc.autoTable({
      startY: doc.lastAutoTable.finalY + 20,
      head: [['Rank', 'Item Name', 'Quantity Ordered', 'Revenue']],
      body: itemData,
      theme: 'grid',
      headStyles: { fillColor: [2, 132, 199] }
    });
    
    // Add reservation details
    doc.setFontSize(14);
    doc.text('Reservation Details', 14, doc.lastAutoTable.finalY + 15);
    
    const reservationData = filteredReservations.map(res => [
      res.date,
      res.time,
      res.userName,
      res.items.length,
      res.guestCount,
      `৳${res.totalAmount}`,
      res.status
    ]);
    
    doc.autoTable({
      startY: doc.lastAutoTable.finalY + 20,
      head: [['Date', 'Time', 'Employee', 'Items', 'Guests', 'Amount', 'Status']],
      body: reservationData,
      theme: 'grid',
      headStyles: { fillColor: [2, 132, 199] }
    });
    
    // Add footer
    const pageCount = doc.internal.getNumberOfPages();
    for(let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.text(
        `BUFT Canteen Management System - Page ${i} of ${pageCount}`,
        doc.internal.pageSize.width / 2,
        doc.internal.pageSize.height - 10,
        { align: 'center' }
      );
    }
    
    // Save the document
    doc.save(`BUFT_Canteen_Report_${startDate}_${endDate}.pdf`);
    toast.success('Report downloaded successfully');
  };
  
  const refreshData = () => {
    setLoading(true);
    // In a real implementation, this would refetch data from the API
    setTimeout(() => {
      toast.success('Report data refreshed');
      setLoading(false);
    }, 500);
  };
  
  // Chart options
  const statusChartOption = {
    tooltip: {
      trigger: 'item',
      formatter: '{a} <br/>{b}: {c} ({d}%)'
    },
    legend: {
      orient: 'vertical',
      right: 10,
      top: 'center',
      data: Object.keys(reportData.statusCounts).map(status => 
        status.charAt(0).toUpperCase() + status.slice(1)
      )
    },
    series: [
      {
        name: 'Reservation Status',
        type: 'pie',
        radius: ['50%', '70%'],
        avoidLabelOverlap: false,
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
        data: Object.entries(reportData.statusCounts).map(([status, count]) => ({
          name: status.charAt(0).toUpperCase() + status.slice(1),
          value: count
        }))
      }
    ]
  };
  
  const itemChartOption = {
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
      data: reportData.itemPopularity.slice(0, 10).map(item => item.name).reverse()
    },
    series: [
      {
        name: 'Orders',
        type: 'bar',
        data: reportData.itemPopularity.slice(0, 10).map(item => item.count).reverse(),
        itemStyle: {
          color: '#0ea5e9'
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
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-1">Generate Reports</h2>
          <p className="text-sm text-gray-600">View and export detailed reports for the canteen</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          <Button onClick={refreshData} variant="outline">
            <SafeIcon icon={FiRefreshCw} className="w-4 h-4 mr-2" />
            Refresh Data
          </Button>
          
          <Button onClick={generatePDF}>
            <SafeIcon icon={FiDownload} className="w-4 h-4 mr-2" />
            Download PDF
          </Button>
        </div>
      </div>
      
      <Card className="p-6">
        <div className="flex flex-col md:flex-row gap-6">
          <div className="w-full md:w-1/3">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Report Options</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Report Type
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button 
                    className={`px-4 py-2 text-sm font-medium rounded-md ${
                      reportType === 'daily' 
                        ? 'bg-buft-600 text-white' 
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                    onClick={() => setReportType('daily')}
                  >
                    Daily
                  </button>
                  <button 
                    className={`px-4 py-2 text-sm font-medium rounded-md ${
                      reportType === 'weekly' 
                        ? 'bg-buft-600 text-white' 
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                    onClick={() => setReportType('weekly')}
                  >
                    Weekly
                  </button>
                  <button 
                    className={`px-4 py-2 text-sm font-medium rounded-md ${
                      reportType === 'monthly' 
                        ? 'bg-buft-600 text-white' 
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                    onClick={() => setReportType('monthly')}
                  >
                    Monthly
                  </button>
                  <button 
                    className={`px-4 py-2 text-sm font-medium rounded-md ${
                      reportType === 'custom' 
                        ? 'bg-buft-600 text-white' 
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                    onClick={() => setReportType('custom')}
                  >
                    Custom
                  </button>
                </div>
              </div>
              
              {reportType === 'custom' && (
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Start Date
                    </label>
                    <Input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-full"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      End Date
                    </label>
                    <Input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="w-full"
                    />
                  </div>
                </div>
              )}
              
              <div className="pt-4">
                <h4 className="text-sm font-medium text-gray-700 mb-3">Report Summary</h4>
                <div className="space-y-2">
                  <div className="flex justify-between py-1 border-b border-gray-100">
                    <span className="text-sm text-gray-600">Date Range:</span>
                    <span className="text-sm font-medium">{startDate} to {endDate}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-gray-100">
                    <span className="text-sm text-gray-600">Total Reservations:</span>
                    <span className="text-sm font-medium">{reportData.totalReservations}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-gray-100">
                    <span className="text-sm text-gray-600">Total Revenue:</span>
                    <span className="text-sm font-medium">৳{reportData.totalRevenue.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-gray-100">
                    <span className="text-sm text-gray-600">Average Order:</span>
                    <span className="text-sm font-medium">
                      ৳{reportData.totalReservations > 0 ? reportData.avgOrderValue.toFixed(2) : '0.00'}
                    </span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-sm text-gray-600">Guest Count:</span>
                    <span className="text-sm font-medium">{reportData.guestCount}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="w-full md:w-2/3 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                <h4 className="text-sm font-medium text-gray-700 mb-3">Reservation Status</h4>
                {Object.keys(reportData.statusCounts).length > 0 ? (
                  <ReactECharts 
                    option={statusChartOption} 
                    style={{ height: '250px' }}
                    ref={chartRef}
                  />
                ) : (
                  <div className="flex items-center justify-center h-[250px] text-gray-500">
                    No data available
                  </div>
                )}
              </div>
              
              <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                <h4 className="text-sm font-medium text-gray-700 mb-3">Popular Items</h4>
                {reportData.itemPopularity.length > 0 ? (
                  <ReactECharts 
                    option={itemChartOption} 
                    style={{ height: '250px' }}
                  />
                ) : (
                  <div className="flex items-center justify-center h-[250px] text-gray-500">
                    No data available
                  </div>
                )}
              </div>
            </div>
            
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
              <h4 className="text-sm font-medium text-gray-700 mb-3">Reservation Details</h4>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                        Date
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                        Employee
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                        Items
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                        Guests
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                        Amount
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredReservations.slice(0, 10).map((res) => (
                      <tr key={res.id}>
                        <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                          {res.date} {res.time}
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap text-sm">
                          <div className="font-medium text-gray-900">{res.userName}</div>
                          <div className="text-xs text-gray-500">{res.userEmail}</div>
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                          {res.items.length} items
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                          {res.guestCount}
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900">
                          ৳{res.totalAmount}
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap text-sm">
                          <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full 
                            ${res.status === 'confirmed' ? 'bg-green-100 text-green-800' : 
                              res.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                              res.status === 'canceled' ? 'bg-red-100 text-red-800' : 
                              'bg-blue-100 text-blue-800'}`}
                          >
                            {res.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                    
                    {filteredReservations.length === 0 && (
                      <tr>
                        <td colSpan="6" className="px-4 py-2 text-center text-sm text-gray-500">
                          No reservations found for the selected date range
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
                
                {filteredReservations.length > 10 && (
                  <div className="mt-3 text-sm text-gray-500 text-right">
                    Showing 10 of {filteredReservations.length} reservations
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default ReportsManagement;