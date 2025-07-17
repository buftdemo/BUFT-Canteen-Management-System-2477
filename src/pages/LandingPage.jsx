import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useMenu } from '../context/MenuContext';
import { useAuth } from '../context/AuthContext';
import { format } from 'date-fns';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';

const { FiClock, FiMapPin, FiPhone, FiMail, FiUser, FiLogOut } = FiIcons;

const LandingPage = () => {
  const { todayMenu } = useMenu();
  const { user, logout } = useAuth();

  const getDashboardLink = () => {
    if (!user) return '/login';
    switch (user.role) {
      case 'admin': return '/admin-dashboard';
      case 'staff': return '/staff-dashboard';
      case 'employee': return '/employee-dashboard';
      default: return '/login';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-buft-50 to-blue-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-buft-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">B</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">BUFT Canteen</h1>
                <p className="text-sm text-gray-500">Management System</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              {user ? (
                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-2">
                    <SafeIcon icon={FiUser} className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-700">{user.name}</span>
                    <span className="text-xs bg-buft-100 text-buft-700 px-2 py-1 rounded-full">
                      {user.role}
                    </span>
                  </div>
                  <Link to={getDashboardLink()}>
                    <Button size="sm">Dashboard</Button>
                  </Link>
                  <Button variant="outline" size="sm" onClick={logout}>
                    <SafeIcon icon={FiLogOut} className="w-4 h-4 mr-1" />
                    Logout
                  </Button>
                </div>
              ) : (
                <Link to="/login">
                  <Button>Login</Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6">
              Welcome to <span className="text-buft-600">BUFT Canteen</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Delicious meals, easy reservations, and a seamless dining experience 
              for the BUFT community.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/login">
                <Button size="lg" className="w-full sm:w-auto">
                  Make a Reservation
                </Button>
              </Link>
              <a href="#menu" className="scroll-smooth">
                <Button variant="outline" size="lg" className="w-full sm:w-auto">
                  View Today's Menu
                </Button>
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Today's Menu */}
      <section id="menu" className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Today's Menu</h2>
            <p className="text-gray-600 mb-2">
              {format(new Date(), 'EEEE, MMMM do, yyyy')}
            </p>
            <div className="flex items-center justify-center text-green-600">
              <SafeIcon icon={FiClock} className="w-4 h-4 mr-2" />
              <span className="text-sm">Live updates from kitchen</span>
            </div>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {todayMenu.items.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Card hover className="p-6">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="text-lg font-semibold text-gray-900">{item.name}</h3>
                    <span className="text-2xl font-bold text-buft-600">৳{item.price}</span>
                  </div>
                  <p className="text-sm text-gray-500 mb-4">{item.category}</p>
                  <div className="flex items-center justify-between">
                    <span className={`text-sm px-2 py-1 rounded-full ${
                      item.available 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-red-100 text-red-700'
                    }`}>
                      {item.available ? 'Available' : 'Sold Out'}
                    </span>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Info */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Canteen Information</h2>
            <p className="text-gray-600">Get in touch with us for any queries</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="p-6 text-center">
              <SafeIcon icon={FiClock} className="w-8 h-8 text-buft-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Operating Hours</h3>
              <p className="text-gray-600">Monday - Friday</p>
              <p className="text-gray-600">8:00 AM - 4:00 PM</p>
            </Card>

            <Card className="p-6 text-center">
              <SafeIcon icon={FiMapPin} className="w-8 h-8 text-buft-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Location</h3>
              <p className="text-gray-600">BUFT Campus</p>
              <p className="text-gray-600">Ground Floor, Main Building</p>
            </Card>

            <Card className="p-6 text-center">
              <SafeIcon icon={FiPhone} className="w-8 h-8 text-buft-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Contact</h3>
              <p className="text-gray-600">+880 1234-567890</p>
              <p className="text-gray-600">canteen@buft.edu.bd</p>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-3 mb-4 md:mb-0">
              <div className="w-8 h-8 bg-buft-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold">B</span>
              </div>
              <span className="text-lg font-semibold">BUFT Canteen Management</span>
            </div>
            <p className="text-gray-400 text-sm">
              © 2024 BUFT. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;