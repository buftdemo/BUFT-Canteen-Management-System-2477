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
import StaffAnalytics from '../components/staff/StaffAnalytics';

const { FiEdit, FiPlus, FiTrash2, FiUsers, FiDollarSign, FiClock, FiDownload, FiActivity, FiPieChart } = FiIcons;

const StaffDashboard = () => {
  const { user } = useAuth();
  const { todayMenu, updateMenu, getAllReservations } = useMenu();
  const [showMenuModal, setShowMenuModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [menuItems, setMenuItems] = useState(todayMenu.items);
  const [newItem, setNewItem] = useState({
    name: '',
    price: '',
    category: 'Main Course',
    available: true
  });
  const [activeTab, setActiveTab] = useState('overview');

  const allReservations = getAllReservations();
  const todayReservations = allReservations.filter(r => r.date === format(new Date(), 'yyyy-MM-dd'));

  const handleAddItem = () => {
    if (!newItem.name || !newItem.price) {
      toast.error('Please fill in all required fields');
      return;
    }

    const item = {
      id: Date.now(),
      name: newItem.name,
      price: parseInt(newItem.price),
      category: newItem.category,
      available: newItem.available
    };

    setMenuItems(prev => [...prev, item]);
    setNewItem({ name: '', price: '', category: 'Main Course', available: true });
    toast.success('Item added successfully!');
  };

  const handleEditItem = (item) => {
    setEditingItem(item);
    setNewItem({
      name: item.name,
      price: item.price.toString(),
      category: item.category,
      available: item.available
    });
  };

  const handleUpdateItem = () => {
    if (!newItem.name || !newItem.price) {
      toast.error('Please fill in all required fields');
      return;
    }

    setMenuItems(prev =>
      prev.map(item =>
        item.id === editingItem.id
          ? {
              ...item,
              name: newItem.name,
              price: parseInt(newItem.price),
              category: newItem.category,
              available: newItem.available
            }
          : item
      )
    );

    setEditingItem(null);
    setNewItem({ name: '', price: '', category: 'Main Course', available: true });
    toast.success('Item updated successfully!');
  };

  const handleDeleteItem = (itemId) => {
    setMenuItems(prev => prev.filter(item => item.id !== itemId));
    toast.success('Item deleted successfully!');
  };

  const handleSaveMenu = () => {
    const updatedMenu = {
      ...todayMenu,
      items: menuItems
    };
    updateMenu(updatedMenu);
    setShowMenuModal(false);
    toast.success('Menu updated successfully!');
  };

  const exportReservations = () => {
    const csvContent = [
      ['Date', 'Time', 'Employee', 'Items', 'Guests', 'Total', 'Status'],
      ...todayReservations.map(r => [
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
    a.download = `reservations_${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const stats = [
    {
      title: 'Today\'s Reservations',
      value: todayReservations.length,
      icon: FiUsers,
      color: 'text-blue-600'
    },
    {
      title: 'Total Revenue',
      value: `৳${todayReservations.reduce((sum, r) => sum + r.totalAmount, 0)}`,
      icon: FiDollarSign,
      color: 'text-green-600'
    },
    {
      title: 'Menu Items',
      value: menuItems.length,
      icon: FiClock,
      color: 'text-purple-600'
    }
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'analytics':
        return <StaffAnalytics />;
      default:
        return (
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

            {/* Menu Management & Reservations */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold text-gray-900">Today's Menu</h2>
                  <Button onClick={() => setShowMenuModal(true)}>
                    <SafeIcon icon={FiEdit} className="w-4 h-4 mr-2" />
                    Edit Menu
                  </Button>
                </div>
                
                <div className="space-y-3">
                  {menuItems.map((item) => (
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
              </Card>

              <Card className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold text-gray-900">Today's Reservations</h2>
                  <Button variant="outline" onClick={exportReservations}>
                    <SafeIcon icon={FiDownload} className="w-4 h-4 mr-2" />
                    Export
                  </Button>
                </div>
                
                <div className="space-y-3">
                  {todayReservations.slice(0, 5).map((reservation) => (
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
                        <span className="text-xs text-gray-500">{reservation.time}</span>
                      </div>
                    </div>
                  ))}
                  
                  {todayReservations.length === 0 && (
                    <p className="text-center text-gray-500 py-8">
                      No reservations yet today.
                    </p>
                  )}
                </div>
              </Card>
            </div>
          </div>
        );
    }
  };

  return (
    <DashboardLayout title="Staff Dashboard" user={user}>
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
              onClick={() => setActiveTab('analytics')}
              className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center ${
                activeTab === 'analytics'
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

      {/* Menu Management Modal */}
      <Modal
        isOpen={showMenuModal}
        onClose={() => setShowMenuModal(false)}
        title="Manage Menu"
        size="xl"
      >
        <div className="space-y-6">
          {/* Add/Edit Item Form */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold text-gray-900 mb-3">
              {editingItem ? 'Edit Item' : 'Add New Item'}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Item Name"
                value={newItem.name}
                onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                placeholder="Enter item name"
              />
              <Input
                label="Price (৳)"
                type="number"
                value={newItem.price}
                onChange={(e) => setNewItem({ ...newItem, price: e.target.value })}
                placeholder="Enter price"
              />
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category
                </label>
                <select
                  value={newItem.category}
                  onChange={(e) => setNewItem({ ...newItem, category: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-buft-500"
                >
                  <option value="Main Course">Main Course</option>
                  <option value="Side Dish">Side Dish</option>
                  <option value="Beverage">Beverage</option>
                  <option value="Dessert">Dessert</option>
                </select>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="available"
                  checked={newItem.available}
                  onChange={(e) => setNewItem({ ...newItem, available: e.target.checked })}
                  className="w-4 h-4 text-buft-600 border-gray-300 rounded focus:ring-buft-500"
                />
                <label htmlFor="available" className="text-sm text-gray-700">
                  Available
                </label>
              </div>
            </div>
            <div className="flex space-x-3 mt-4">
              {editingItem ? (
                <>
                  <Button onClick={handleUpdateItem}>Update Item</Button>
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setEditingItem(null);
                      setNewItem({ name: '', price: '', category: 'Main Course', available: true });
                    }}
                  >
                    Cancel
                  </Button>
                </>
              ) : (
                <Button onClick={handleAddItem}>
                  <SafeIcon icon={FiPlus} className="w-4 h-4 mr-2" />
                  Add Item
                </Button>
              )}
            </div>
          </div>

          {/* Current Menu Items */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-3">Current Menu Items</h3>
            <div className="space-y-2">
              {menuItems.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-3 bg-white border rounded-lg">
                  <div>
                    <h4 className="font-medium text-gray-900">{item.name}</h4>
                    <p className="text-sm text-gray-500">{item.category} • ৳{item.price}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      item.available ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {item.available ? 'Available' : 'Sold Out'}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditItem(item)}
                    >
                      <SafeIcon icon={FiEdit} className="w-3 h-3" />
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => handleDeleteItem(item.id)}
                    >
                      <SafeIcon icon={FiTrash2} className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex space-x-3">
            <Button
              variant="outline"
              onClick={() => setShowMenuModal(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button onClick={handleSaveMenu} className="flex-1">
              Save Menu
            </Button>
          </div>
        </div>
      </Modal>
    </DashboardLayout>
  );
};

export default StaffDashboard;