import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Card from '../components/ui/Card';
import GoogleAuth from '../components/GoogleAuth';
import { toast } from '../components/ui/Toaster';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';

const { FiMail, FiLock, FiArrowLeft } = FiIcons;

const LoginPage = () => {
  const [loginMethod, setLoginMethod] = useState('google');
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleGoogleSuccess = (user) => {
    // Redirect based on role
    switch (user.role) {
      case 'admin':
        navigate('/admin-dashboard');
        break;
      case 'staff':
        navigate('/staff-dashboard');
        break;
      case 'employee':
        navigate('/employee-dashboard');
        break;
      default:
        navigate('/');
    }
  };

  const handleGoogleError = (error) => {
    console.error('Google login error:', error);
  };

  const handleManualLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const user = await login(formData.email, formData.password, false);
      toast.success('Login successful!');
      navigate('/admin-dashboard');
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-buft-50 to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <Link
            to="/"
            className="inline-flex items-center text-buft-600 hover:text-buft-700 mb-6"
          >
            <SafeIcon icon={FiArrowLeft} className="w-4 h-4 mr-2" />
            Back to Home
          </Link>
          <div className="w-16 h-16 bg-buft-600 rounded-xl flex items-center justify-center mx-auto mb-4">
            <span className="text-white font-bold text-2xl">B</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Welcome Back</h1>
          <p className="text-gray-600">Sign in to your BUFT Canteen account</p>
        </motion.div>

        <Card className="p-8">
          <div className="flex mb-6">
            <button
              onClick={() => setLoginMethod('google')}
              className={`flex-1 py-2 px-4 text-sm font-medium rounded-l-lg border ${
                loginMethod === 'google'
                  ? 'bg-buft-600 text-white border-buft-600'
                  : 'bg-gray-50 text-gray-700 border-gray-300 hover:bg-gray-100'
              }`}
            >
              Google Sign-In
            </button>
            <button
              onClick={() => setLoginMethod('manual')}
              className={`flex-1 py-2 px-4 text-sm font-medium rounded-r-lg border-t border-r border-b ${
                loginMethod === 'manual'
                  ? 'bg-buft-600 text-white border-buft-600'
                  : 'bg-gray-50 text-gray-700 border-gray-300 hover:bg-gray-100'
              }`}
            >
              Admin Login
            </button>
          </div>

          {loginMethod === 'google' ? (
            <div className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800">
                  <strong>Note:</strong> Only BUFT email addresses (@buft.edu.bd) are allowed.
                </p>
              </div>
              <GoogleAuth onSuccess={handleGoogleSuccess} onError={handleGoogleError} />
            </div>
          ) : (
            <form onSubmit={handleManualLogin} className="space-y-4">
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-sm text-yellow-800 mb-2">
                  <strong>Admin Access:</strong> Use one of these accounts:
                </p>
                <div className="text-xs text-yellow-700 space-y-1">
                  <div>• admin@buft.edu.bd / admin123</div>
                  <div>• notification@buft.edu.bd / Buft@09876</div>
                </div>
              </div>
              <Input
                label="Email"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="Enter admin email"
                required
              />
              <Input
                label="Password"
                type="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="Enter your password"
                required
              />
              <Button
                type="submit"
                loading={loading}
                className="w-full"
                size="lg"
              >
                <SafeIcon icon={FiLock} className="w-5 h-5 mr-2" />
                Sign In
              </Button>
            </form>
          )}

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Need help? Contact{' '}
              <a
                href="mailto:support@buft.edu.bd"
                className="text-buft-600 hover:text-buft-700"
              >
                support@buft.edu.bd
              </a>
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default LoginPage;