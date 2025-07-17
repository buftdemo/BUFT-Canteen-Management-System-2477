import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useMenu } from '../context/MenuContext';
import { format } from 'date-fns';
import DashboardLayout from '../components/layout/DashboardLayout';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import Input from '../components/ui/Input';
import { toast } from '../components/ui/Toaster';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';

const { FiPlus, FiUsers, FiClock, FiCheck, FiCalendar } = FiIcons;

const EmployeeDashboard = () => {
  const { user } = useAuth();
  const { todayMenu, addReservation, getReservationsByUser } = useMenu();
  const [showReservationModal, setShowReservationModal] = useState(false);
  const [selectedItems, setSelectedItems] = useState([]);
  const [guestCount, setGuestCount] = useState(0);
  const [guestNames, setGuestNames] = useState('');
  const [loading, setLoading] = useState(false);

  const userReservations = getReservationsByUser(user.email);

  const handleItemSelect = (item) => {
    setSelectedItems(prev => {
      const exists = prev.find(i => i.id === item.id);
      if (exists) {
        return prev.filter(i => i.id !== item.id);
      }
      return [...prev, { ...item, quantity: 1 }];
    });
  };

  const updateQuantity = (itemId, quantity) => {
    setSelectedItems(prev =>
      prev.map(item =>
        item.id === itemId ? { ...item, quantity: Math.max(1, quantity) } : item
      )
    );
  };

  const calculateTotal = () => {
    const itemsTotal = selectedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const guestTotal = selectedItems.reduce((sum, item) => sum + (item.price * guestCount), 0);
    return itemsTotal + guestTotal;
  };

  const handleReservation = async () => {
    if (selectedItems.length === 0) {
      toast.error('Please select at least one item');
      return;
    }

    setLoading(true);
    try {
      const reservation = {
        userEmail: user.email,
        userName: user.name,
        items: selectedItems,
        guestCount,
        guestNames: guestNames.trim() || null,
        totalAmount: calculateTotal(),
        type: guestCount > 0 ? 'with_guests' : 'personal'
      };

      addReservation(reservation);
      toast.success('Reservation confirmed successfully!');
      setShowReservationModal(false);
      setSelectedItems([]);
      setGuestCount(0);
      setGuestNames('');
    } catch (error) {
      toast.error('Failed to make reservation');
    } finally {
      setLoading(false);
    }
  };

  const stats = [
    {
      title: 'Total Reservations',
      value: userReservations.length,
      icon: FiCalendar,
      color: 'text-blue-600'
    },
    {
      title: 'This Month',
      value: userReservations.filter(r => 
        format(new Date(r.date), 'MM-yyyy') === format(new Date(), 'MM-yyyy')
      ).length,
      icon: FiCheck,
      color: 'text-green-600'
    },
    {
      title: 'With Guests',
      value: userReservations.filter(r => r.guestCount > 0).length,
      icon: FiUsers,
      color: 'text-purple-600'
    }
  ];

  return (
    <DashboardLayout title="Employee Dashboard" user={user}>
      <div className="space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">{stat.title}</p>
                    <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  </div>
                  <SafeIcon icon={stat.icon} className={`w-8 h-8 ${stat.color}`} />
                </div>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Today's Menu & Quick Reserve */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Today's Menu</h2>
              <div className="flex items-center text-sm text-gray-500">
                <SafeIcon icon={FiClock} className="w-4 h-4 mr-1" />
                {format(new Date(), 'MMM dd, yyyy')}
              </div>
            </div>
            
            <div className="space-y-3">
              {todayMenu.items.slice(0, 4).map((item) => (
                <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <h3 className="font-medium text-gray-900">{item.name}</h3>
                    <p className="text-sm text-gray-500">{item.category}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-buft-600">৳{item.price}</p>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      item.available ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {item.available ? 'Available' : 'Sold Out'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
            
            <Button
              onClick={() => setShowReservationModal(true)}
              className="w-full mt-4"
            >
              <SafeIcon icon={FiPlus} className="w-4 h-4 mr-2" />
              Make Reservation
            </Button>
          </Card>

          {/* Recent Reservations */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Reservations</h2>
            
            <div className="space-y-3">
              {userReservations.slice(0, 5).map((reservation) => (
                <div key={reservation.id} className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-500">
                      {format(new Date(reservation.date), 'MMM dd, yyyy')} at {reservation.time}
                    </span>
                    <span className="text-sm font-medium text-buft-600">
                      ৳{reservation.totalAmount}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-700">
                      {reservation.items.length} items
                      {reservation.guestCount > 0 && ` + ${reservation.guestCount} guests`}
                    </span>
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                      {reservation.status}
                    </span>
                  </div>
                </div>
              ))}
              
              {userReservations.length === 0 && (
                <p className="text-center text-gray-500 py-8">
                  No reservations yet. Make your first reservation!
                </p>
              )}
            </div>
          </Card>
        </div>
      </div>

      {/* Reservation Modal */}
      <Modal
        isOpen={showReservationModal}
        onClose={() => setShowReservationModal(false)}
        title="Make Reservation"
        size="lg"
      >
        <div className="space-y-6">
          {/* Menu Items */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Select Items</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {todayMenu.items.map((item) => (
                <div
                  key={item.id}
                  className={`p-3 border rounded-lg cursor-pointer transition-all ${
                    selectedItems.find(i => i.id === item.id)
                      ? 'border-buft-500 bg-buft-50'
                      : 'border-gray-200 hover:border-gray-300'
                  } ${!item.available ? 'opacity-50 cursor-not-allowed' : ''}`}
                  onClick={() => item.available && handleItemSelect(item)}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-gray-900">{item.name}</h4>
                      <p className="text-sm text-gray-500">{item.category}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-buft-600">৳{item.price}</p>
                      {selectedItems.find(i => i.id === item.id) && (
                        <div className="flex items-center mt-1">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              const selected = selectedItems.find(i => i.id === item.id);
                              updateQuantity(item.id, selected.quantity - 1);
                            }}
                            className="w-6 h-6 text-xs bg-gray-200 rounded-full hover:bg-gray-300"
                          >
                            -
                          </button>
                          <span className="mx-2 text-sm">
                            {selectedItems.find(i => i.id === item.id)?.quantity || 0}
                          </span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              const selected = selectedItems.find(i => i.id === item.id);
                              updateQuantity(item.id, selected.quantity + 1);
                            }}
                            className="w-6 h-6 text-xs bg-gray-200 rounded-full hover:bg-gray-300"
                          >
                            +
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Guest Information */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Guest Information</h3>
            <div className="space-y-4">
              <Input
                label="Number of Guests"
                type="number"
                value={guestCount}
                onChange={(e) => setGuestCount(Math.max(0, parseInt(e.target.value) || 0))}
                min="0"
                placeholder="0"
              />
              
              {guestCount > 0 && (
                <Input
                  label="Guest Names (Optional)"
                  value={guestNames}
                  onChange={(e) => setGuestNames(e.target.value)}
                  placeholder="Enter guest names separated by commas"
                />
              )}
            </div>
          </div>

          {/* Order Summary */}
          {selectedItems.length > 0 && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold text-gray-900 mb-3">Order Summary</h3>
              <div className="space-y-2">
                {selectedItems.map((item) => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span>{item.name} x{item.quantity}</span>
                    <span>৳{item.price * item.quantity}</span>
                  </div>
                ))}
                {guestCount > 0 && (
                  <div className="flex justify-between text-sm">
                    <span>Guest meals ({guestCount} guests)</span>
                    <span>৳{selectedItems.reduce((sum, item) => sum + (item.price * guestCount), 0)}</span>
                  </div>
                )}
                <div className="border-t pt-2 flex justify-between font-semibold">
                  <span>Total</span>
                  <span>৳{calculateTotal()}</span>
                </div>
              </div>
            </div>
          )}

          <div className="flex space-x-3">
            <Button
              variant="outline"
              onClick={() => setShowReservationModal(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleReservation}
              loading={loading}
              className="flex-1"
              disabled={selectedItems.length === 0}
            >
              Confirm Reservation
            </Button>
          </div>
        </div>
      </Modal>
    </DashboardLayout>
  );
};

export default EmployeeDashboard;