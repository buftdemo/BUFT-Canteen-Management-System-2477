import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Card from '../ui/Card';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Modal from '../ui/Modal';
import { toast } from '../ui/Toaster';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../../common/SafeIcon';
import { format, parseISO } from 'date-fns';
import { generateReservations } from '../../utils/mockData';

const { FiSearch, FiFilter, FiDownload, FiEye, FiCheck, FiX, FiClock } = FiIcons;

const ReservationsManagement = () => {
  const [reservations, setReservations] = useState([]);
  const [filteredReservations, setFilteredReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterDate, setFilterDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [currentReservation, setCurrentReservation] = useState(null);

  useEffect(() => {
    // Fetch reservations from API or database
    const fetchReservations = async () => {
      try {
        // In a real implementation, this would be an API call
        const data = generateReservations(50);
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
    // Filter reservations based on search term, status, and date
    const filtered = reservations.filter(reservation => {
      const matchesSearch = 
        reservation.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        reservation.userEmail.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = filterStatus === 'all' || reservation.status === filterStatus;
      const matchesDate = reservation.date === filterDate;
      
      return matchesSearch && matchesStatus && matchesDate;
    });
    
    setFilteredReservations(filtered);
  }, [searchTerm, filterStatus, filterDate, reservations]);

  const handleUpdateStatus = (id, status) => {
    // In a real implementation, this would be an API call
    setReservations(prev => 
      prev.map(res => 
        res.id === id ? { ...res, status } : res
      )
    );
    
    toast.success(`Reservation status updated to ${status}`);
    setShowDetailsModal(false);
  };

  const viewDetails = (reservation) => {
    setCurrentReservation(reservation);
    setShowDetailsModal(true);
  };

  const exportReservations = () => {
    const csvContent = [
      ['Date', 'Time', 'Employee', 'Email', 'Items', 'Guests', 'Total', 'Status'],
      ...filteredReservations.map(res => [
        res.date,
        res.time,
        res.userName,
        res.userEmail,
        res.items.map(i => `${i.name} x${i.quantity}`).join('; '),
        res.guestCount,
        res.totalAmount,
        res.status
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `reservations_${filterDate}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'canceled':
        return 'bg-red-100 text-red-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'confirmed':
        return FiCheck;
      case 'pending':
        return FiClock;
      case 'canceled':
        return FiX;
      case 'completed':
        return FiCheck;
      default:
        return FiClock;
    }
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
        <div className="flex-1 w-full md:max-w-md">
          <div className="relative">
            <Input
              type="text"
              placeholder="Search by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pr-10"
            />
            <SafeIcon
              icon={FiSearch}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
            />
          </div>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center">
            <label className="mr-2 text-sm text-gray-600">Date:</label>
            <Input
              type="date"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
              className="px-3 py-2"
            />
          </div>
          
          <div className="flex items-center">
            <label className="mr-2 text-sm text-gray-600">Status:</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-buft-500"
            >
              <option value="all">All Statuses</option>
              <option value="confirmed">Confirmed</option>
              <option value="pending">Pending</option>
              <option value="canceled">Canceled</option>
              <option value="completed">Completed</option>
            </select>
          </div>
          
          <Button variant="outline" onClick={exportReservations}>
            <SafeIcon icon={FiDownload} className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      <Card>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Employee
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Time
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Items
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Guests
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredReservations.map((reservation) => (
                <motion.tr
                  key={reservation.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="text-sm font-medium text-gray-900">{reservation.userName}</div>
                    </div>
                    <div className="text-xs text-gray-500">{reservation.userEmail}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {reservation.time}
                    {reservation.isPastCutoff && (
                      <span className="ml-2 text-xs text-red-500">(After 10 AM)</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {reservation.items.length} items
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {reservation.guestCount}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    ৳{reservation.totalAmount}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(reservation.status)}`}>
                      <SafeIcon icon={getStatusIcon(reservation.status)} className="w-3 h-3 mr-1" />
                      {reservation.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => viewDetails(reservation)}
                    >
                      <SafeIcon icon={FiEye} className="w-4 h-4" />
                    </Button>
                  </td>
                </motion.tr>
              ))}
              
              {filteredReservations.length === 0 && (
                <tr>
                  <td colSpan="7" className="px-6 py-4 text-center text-gray-500">
                    No reservations found for the selected date and filters
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Reservation Details Modal */}
      <Modal
        isOpen={showDetailsModal}
        onClose={() => setShowDetailsModal(false)}
        title="Reservation Details"
      >
        {currentReservation && (
          <div className="space-y-6">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{currentReservation.userName}</h3>
                <p className="text-sm text-gray-500">{currentReservation.userEmail}</p>
              </div>
              <span className={`px-3 py-1 text-sm font-semibold rounded-full ${getStatusBadgeClass(currentReservation.status)}`}>
                {currentReservation.status}
              </span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Reservation Details</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Date:</span>
                    <span className="font-medium">{currentReservation.date}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Time:</span>
                    <span className="font-medium">{currentReservation.time}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Type:</span>
                    <span className="font-medium capitalize">{currentReservation.type.replace('_', ' ')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Guests:</span>
                    <span className="font-medium">{currentReservation.guestCount}</span>
                  </div>
                  {currentReservation.guestNames && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Guest Names:</span>
                      <span className="font-medium">{currentReservation.guestNames}</span>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Order Summary</h4>
                <div className="space-y-3">
                  {currentReservation.items.map((item, index) => (
                    <div key={index} className="flex justify-between text-sm">
                      <span>{item.name} x{item.quantity}</span>
                      <span>৳{item.price * item.quantity}</span>
                    </div>
                  ))}
                  {currentReservation.guestCount > 0 && (
                    <div className="flex justify-between text-sm">
                      <span>Guest meals ({currentReservation.guestCount} guests)</span>
                      <span>৳{currentReservation.items.reduce((sum, item) => sum + (item.price * currentReservation.guestCount), 0)}</span>
                    </div>
                  )}
                  <div className="border-t pt-2 flex justify-between font-medium">
                    <span>Total</span>
                    <span>৳{currentReservation.totalAmount}</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="border-t pt-4">
              <h4 className="text-sm font-medium text-gray-700 mb-3">Update Status</h4>
              <div className="flex flex-wrap gap-2">
                <Button 
                  size="sm"
                  variant={currentReservation.status === 'confirmed' ? 'primary' : 'outline'}
                  onClick={() => handleUpdateStatus(currentReservation.id, 'confirmed')}
                  disabled={currentReservation.status === 'confirmed'}
                >
                  <SafeIcon icon={FiCheck} className="w-4 h-4 mr-1" />
                  Confirm
                </Button>
                
                <Button 
                  size="sm"
                  variant={currentReservation.status === 'pending' ? 'primary' : 'outline'}
                  onClick={() => handleUpdateStatus(currentReservation.id, 'pending')}
                  disabled={currentReservation.status === 'pending'}
                >
                  <SafeIcon icon={FiClock} className="w-4 h-4 mr-1" />
                  Pending
                </Button>
                
                <Button 
                  size="sm"
                  variant={currentReservation.status === 'canceled' ? 'danger' : 'outline'}
                  onClick={() => handleUpdateStatus(currentReservation.id, 'canceled')}
                  disabled={currentReservation.status === 'canceled'}
                >
                  <SafeIcon icon={FiX} className="w-4 h-4 mr-1" />
                  Cancel
                </Button>
                
                <Button 
                  size="sm"
                  variant={currentReservation.status === 'completed' ? 'success' : 'outline'}
                  onClick={() => handleUpdateStatus(currentReservation.id, 'completed')}
                  disabled={currentReservation.status === 'completed'}
                >
                  <SafeIcon icon={FiCheck} className="w-4 h-4 mr-1" />
                  Complete
                </Button>
              </div>
            </div>
            
            <div className="flex justify-end">
              <Button onClick={() => setShowDetailsModal(false)}>
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default ReservationsManagement;