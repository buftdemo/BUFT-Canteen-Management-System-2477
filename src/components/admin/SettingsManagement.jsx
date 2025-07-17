import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Card from '../ui/Card';
import Button from '../ui/Button';
import Input from '../ui/Input';
import { toast } from '../ui/Toaster';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../../common/SafeIcon';
import { generateSettings } from '../../utils/mockData';

const { 
  FiSave, FiRefreshCw, FiGlobe, FiClock, FiInfo, FiBell, 
  FiLock, FiDatabase, FiSliders, FiMail, FiAlertTriangle 
} = FiIcons;

const SettingsManagement = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('general');
  const [settings, setSettings] = useState({});
  const [formData, setFormData] = useState({});

  useEffect(() => {
    // Fetch settings from API or database
    const fetchSettings = async () => {
      try {
        // In a real implementation, this would be an API call
        const data = generateSettings();
        setSettings(data);
        setFormData(data);
      } catch (error) {
        toast.error('Failed to fetch settings');
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, []);

  const handleInputChange = (section, field, value) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  const handleNestedInputChange = (section, nestedSection, field, value) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [nestedSection]: {
          ...prev[section][nestedSection],
          [field]: value
        }
      }
    }));
  };

  const handleSaveSettings = async () => {
    setSaving(true);
    try {
      // In a real implementation, this would be an API call
      // Simulating API call with timeout
      await new Promise(resolve => setTimeout(resolve, 800));
      
      setSettings(formData);
      toast.success('Settings saved successfully');
    } catch (error) {
      toast.error('Failed to save settings');
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  const handleResetSettings = () => {
    setFormData(settings);
    toast.info('Settings reset to last saved values');
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
          <h2 className="text-xl font-semibold text-gray-900 mb-1">System Settings</h2>
          <p className="text-sm text-gray-600">Configure the canteen management system</p>
        </div>
        
        <div className="flex items-center gap-3">
          <Button onClick={handleResetSettings} variant="outline">
            <SafeIcon icon={FiRefreshCw} className="w-4 h-4 mr-2" />
            Reset
          </Button>
          
          <Button onClick={handleSaveSettings} loading={saving}>
            <SafeIcon icon={FiSave} className="w-4 h-4 mr-2" />
            Save Changes
          </Button>
        </div>
      </div>
      
      <div className="flex flex-col md:flex-row gap-6">
        <div className="w-full md:w-64 bg-white rounded-lg shadow-sm border border-gray-200">
          <nav className="p-4 space-y-1">
            <button
              className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                activeTab === 'general' 
                  ? 'bg-buft-100 text-buft-700' 
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
              onClick={() => setActiveTab('general')}
            >
              <SafeIcon icon={FiGlobe} className="w-5 h-5 mr-3" />
              General Settings
            </button>
            
            <button
              className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                activeTab === 'notifications' 
                  ? 'bg-buft-100 text-buft-700' 
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
              onClick={() => setActiveTab('notifications')}
            >
              <SafeIcon icon={FiBell} className="w-5 h-5 mr-3" />
              Notifications
            </button>
            
            <button
              className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                activeTab === 'security' 
                  ? 'bg-buft-100 text-buft-700' 
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
              onClick={() => setActiveTab('security')}
            >
              <SafeIcon icon={FiLock} className="w-5 h-5 mr-3" />
              Security Settings
            </button>
            
            <button
              className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                activeTab === 'database' 
                  ? 'bg-buft-100 text-buft-700' 
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
              onClick={() => setActiveTab('database')}
            >
              <SafeIcon icon={FiDatabase} className="w-5 h-5 mr-3" />
              Database Settings
            </button>
            
            <button
              className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                activeTab === 'advanced' 
                  ? 'bg-buft-100 text-buft-700' 
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
              onClick={() => setActiveTab('advanced')}
            >
              <SafeIcon icon={FiSliders} className="w-5 h-5 mr-3" />
              Advanced Settings
            </button>
            
            <button
              className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                activeTab === 'integrations' 
                  ? 'bg-buft-100 text-buft-700' 
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
              onClick={() => setActiveTab('integrations')}
            >
              <SafeIcon icon={FiMail} className="w-5 h-5 mr-3" />
              Integrations
            </button>
          </nav>
        </div>
        
        <div className="flex-1">
          <Card className="p-6">
            {activeTab === 'general' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-6"
              >
                <h3 className="text-lg font-medium text-gray-900 mb-4">General Settings</h3>
                
                <div className="space-y-4">
                  <Input
                    label="Site Name"
                    value={formData.general?.siteName || ''}
                    onChange={(e) => handleInputChange('general', 'siteName', e.target.value)}
                    placeholder="Enter site name"
                  />
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Timezone
                    </label>
                    <select
                      value={formData.general?.timezone || ''}
                      onChange={(e) => handleInputChange('general', 'timezone', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-buft-500"
                    >
                      <option value="Asia/Dhaka">Asia/Dhaka</option>
                      <option value="UTC">UTC</option>
                      <option value="America/New_York">America/New_York</option>
                      <option value="Europe/London">Europe/London</option>
                      <option value="Asia/Tokyo">Asia/Tokyo</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Site Description
                    </label>
                    <textarea
                      value={formData.general?.siteDescription || ''}
                      onChange={(e) => handleInputChange('general', 'siteDescription', e.target.value)}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-buft-500"
                      placeholder="Enter site description"
                    />
                  </div>
                </div>
              </motion.div>
            )}
            
            {activeTab === 'notifications' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-6"
              >
                <h3 className="text-lg font-medium text-gray-900 mb-4">Notification Settings</h3>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">Email Notifications</h4>
                      <p className="text-xs text-gray-500">Send email notifications for reservations and updates</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        className="sr-only peer"
                        checked={formData.notifications?.enableEmail || false}
                        onChange={(e) => handleInputChange('notifications', 'enableEmail', e.target.checked)}
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-buft-600"></div>
                    </label>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">Push Notifications</h4>
                      <p className="text-xs text-gray-500">Send browser push notifications for important updates</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        className="sr-only peer"
                        checked={formData.notifications?.enablePush || false}
                        onChange={(e) => handleInputChange('notifications', 'enablePush', e.target.checked)}
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-buft-600"></div>
                    </label>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">Notification Sound</h4>
                      <p className="text-xs text-gray-500">Play sound when notifications are received</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        className="sr-only peer"
                        checked={formData.notifications?.enableSound || false}
                        onChange={(e) => handleInputChange('notifications', 'enableSound', e.target.checked)}
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-buft-600"></div>
                    </label>
                  </div>
                </div>
              </motion.div>
            )}
            
            {activeTab === 'security' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-6"
              >
                <h3 className="text-lg font-medium text-gray-900 mb-4">Security Settings</h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Session Timeout (minutes)
                    </label>
                    <Input
                      type="number"
                      value={formData.security?.sessionTimeout || ''}
                      onChange={(e) => handleInputChange('security', 'sessionTimeout', parseInt(e.target.value))}
                      min={5}
                      max={120}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Time in minutes before an inactive session expires
                    </p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Maximum Login Attempts
                    </label>
                    <Input
                      type="number"
                      value={formData.security?.maxLoginAttempts || ''}
                      onChange={(e) => handleInputChange('security', 'maxLoginAttempts', parseInt(e.target.value))}
                      min={3}
                      max={10}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Number of failed login attempts before account lockout
                    </p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Password Minimum Length
                    </label>
                    <Input
                      type="number"
                      value={formData.security?.passwordMinLength || ''}
                      onChange={(e) => handleInputChange('security', 'passwordMinLength', parseInt(e.target.value))}
                      min={6}
                      max={16}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Minimum required length for user passwords
                    </p>
                  </div>
                </div>
              </motion.div>
            )}
            
            {activeTab === 'database' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-6"
              >
                <h3 className="text-lg font-medium text-gray-900 mb-4">Database Settings</h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Backup Frequency
                    </label>
                    <select
                      value={formData.database?.backupFrequency || ''}
                      onChange={(e) => handleInputChange('database', 'backupFrequency', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-buft-500"
                    >
                      <option value="hourly">Hourly</option>
                      <option value="daily">Daily</option>
                      <option value="weekly">Weekly</option>
                      <option value="monthly">Monthly</option>
                    </select>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">Auto Cleanup</h4>
                      <p className="text-xs text-gray-500">Automatically clean up old logs and temporary files</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        className="sr-only peer"
                        checked={formData.database?.autoCleanup || false}
                        onChange={(e) => handleInputChange('database', 'autoCleanup', e.target.checked)}
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-buft-600"></div>
                    </label>
                  </div>
                  
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="text-sm font-medium text-gray-900 mb-3">Database Connection</h4>
                    <div className="space-y-3">
                      <Input
                        label="Host"
                        value={formData.database?.connectionConfig?.host || ''}
                        onChange={(e) => handleNestedInputChange('database', 'connectionConfig', 'host', e.target.value)}
                        placeholder="localhost"
                      />
                      
                      <Input
                        label="Port"
                        type="number"
                        value={formData.database?.connectionConfig?.port || ''}
                        onChange={(e) => handleNestedInputChange('database', 'connectionConfig', 'port', parseInt(e.target.value))}
                        placeholder="3306"
                      />
                      
                      <Input
                        label="Database Name"
                        value={formData.database?.connectionConfig?.database || ''}
                        onChange={(e) => handleNestedInputChange('database', 'connectionConfig', 'database', e.target.value)}
                        placeholder="buft_canteen"
                      />
                      
                      <Input
                        label="Username"
                        value={formData.database?.connectionConfig?.user || ''}
                        onChange={(e) => handleNestedInputChange('database', 'connectionConfig', 'user', e.target.value)}
                        placeholder="database_user"
                      />
                      
                      <Input
                        label="Password"
                        type="password"
                        value={formData.database?.connectionConfig?.password || ''}
                        onChange={(e) => handleNestedInputChange('database', 'connectionConfig', 'password', e.target.value)}
                        placeholder="••••••••"
                      />
                    </div>
                    
                    <div className="mt-4 flex justify-end">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => toast.info('Connection test feature not implemented in demo')}
                      >
                        Test Connection
                      </Button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
            
            {activeTab === 'advanced' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-6"
              >
                <h3 className="text-lg font-medium text-gray-900 mb-4">Advanced Settings</h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      API Rate Limit (requests/minute)
                    </label>
                    <Input
                      type="number"
                      value={formData.advanced?.apiRateLimit || ''}
                      onChange={(e) => handleInputChange('advanced', 'apiRateLimit', parseInt(e.target.value))}
                      min={10}
                      max={1000}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Maximum number of API requests allowed per minute
                    </p>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">Debug Mode</h4>
                      <p className="text-xs text-gray-500">Enable detailed error messages and logging</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        className="sr-only peer"
                        checked={formData.advanced?.debugMode || false}
                        onChange={(e) => handleInputChange('advanced', 'debugMode', e.target.checked)}
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-buft-600"></div>
                    </label>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">Maintenance Mode</h4>
                      <p className="text-xs text-gray-500">Put the system in maintenance mode (users will see a maintenance page)</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        className="sr-only peer"
                        checked={formData.advanced?.maintenanceMode || false}
                        onChange={(e) => handleInputChange('advanced', 'maintenanceMode', e.target.checked)}
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-buft-600"></div>
                    </label>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">Enable Cache</h4>
                      <p className="text-xs text-gray-500">Cache database queries and API responses for better performance</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        className="sr-only peer"
                        checked={formData.advanced?.enableCache || false}
                        onChange={(e) => handleInputChange('advanced', 'enableCache', e.target.checked)}
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-buft-600"></div>
                    </label>
                  </div>
                </div>
              </motion.div>
            )}
            
            {activeTab === 'integrations' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-6"
              >
                <h3 className="text-lg font-medium text-gray-900 mb-4">Integration Settings</h3>
                
                <div className="space-y-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="text-sm font-medium text-gray-900 mb-3">Email Service Configuration</h4>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Provider
                        </label>
                        <select
                          value={formData.integrations?.emailService?.provider || ''}
                          onChange={(e) => handleNestedInputChange('integrations', 'emailService', 'provider', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-buft-500"
                        >
                          <option value="SMTP">SMTP</option>
                          <option value="Sendgrid">Sendgrid</option>
                          <option value="Mailgun">Mailgun</option>
                          <option value="AWS SES">AWS SES</option>
                        </select>
                      </div>
                      
                      <Input
                        label="SMTP Host"
                        value={formData.integrations?.emailService?.host || ''}
                        onChange={(e) => handleNestedInputChange('integrations', 'emailService', 'host', e.target.value)}
                        placeholder="smtp.example.com"
                      />
                      
                      <Input
                        label="SMTP Port"
                        type="number"
                        value={formData.integrations?.emailService?.port || ''}
                        onChange={(e) => handleNestedInputChange('integrations', 'emailService', 'port', parseInt(e.target.value))}
                        placeholder="587"
                      />
                      
                      <Input
                        label="Username"
                        value={formData.integrations?.emailService?.username || ''}
                        onChange={(e) => handleNestedInputChange('integrations', 'emailService', 'username', e.target.value)}
                        placeholder="username"
                      />
                      
                      <Input
                        label="Password"
                        type="password"
                        value={formData.integrations?.emailService?.password || ''}
                        onChange={(e) => handleNestedInputChange('integrations', 'emailService', 'password', e.target.value)}
                        placeholder="••••••••"
                      />
                    </div>
                    
                    <div className="mt-4 flex justify-end">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => toast.info('Test email feature not implemented in demo')}
                      >
                        Send Test Email
                      </Button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};

export default SettingsManagement;