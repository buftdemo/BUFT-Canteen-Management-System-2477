import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Card from '../ui/Card';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Modal from '../ui/Modal';
import { toast } from '../ui/Toaster';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../../common/SafeIcon';
import { generateEmployees } from '../../utils/mockData';

const { FiUserPlus, FiUsers, FiUserCheck, FiUserX, FiSearch, FiFilter, FiRefreshCw, FiShield, FiEdit, FiTrash2, FiCheck } = FiIcons;

const UserRoleManagement = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showPermissionsModal, setShowPermissionsModal] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    role: 'employee',
    status: 'active',
    department: '',
    permissions: {
      canManageUsers: false,
      canManageMenu: false,
      canViewReports: true,
      canApproveReservations: false,
      canDeleteData: false
    }
  });

  const departments = [
    'Administration',
    'Computer Science',
    'Textile Engineering',
    'Fashion Design',
    'Business Administration',
    'Accounting',
    'Human Resources'
  ];

  const roles = [
    { value: 'admin', label: 'Administrator', color: 'bg-purple-100 text-purple-800' },
    { value: 'staff', label: 'Canteen Staff', color: 'bg-green-100 text-green-800' },
    { value: 'employee', label: 'Employee', color: 'bg-blue-100 text-blue-800' }
  ];

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        // In a real implementation, this would be an API call
        const data = generateEmployees(20).map(emp => ({
          ...emp,
          status: Math.random() > 0.1 ? 'active' : 'inactive',
          lastLogin: new Date(Date.now() - Math.floor(Math.random() * 30) * 86400000).toISOString(),
          permissions: {
            canManageUsers: emp.role === 'admin',
            canManageMenu: emp.role === 'admin' || emp.role === 'staff',
            canViewReports: true,
            canApproveReservations: emp.role === 'admin' || emp.role === 'staff',
            canDeleteData: emp.role === 'admin'
          }
        }));
        setUsers(data);
        setFilteredUsers(data);
      } catch (error) {
        toast.error('Failed to fetch users');
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  useEffect(() => {
    // Filter users based on search term and role filter
    const filtered = users.filter(user => {
      const matchesSearch = 
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.employeeId?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesRole = filterRole === 'all' || user.role === filterRole;
      
      return matchesSearch && matchesRole;
    });
    
    setFilteredUsers(filtered);
  }, [searchTerm, filterRole, users]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewUser(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePermissionChange = (permission) => {
    setNewUser(prev => ({
      ...prev,
      permissions: {
        ...prev.permissions,
        [permission]: !prev.permissions[permission]
      }
    }));
  };

  const handleAddUser = () => {
    if (!newUser.name || !newUser.email) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (!newUser.email.endsWith('@buft.edu.bd')) {
      toast.error('Email must be a valid BUFT email address');
      return;
    }

    const user = {
      id: `USER-${Date.now()}`,
      employeeId: `EMP-${Date.now().toString().slice(-4)}`,
      ...newUser,
      createdAt: new Date().toISOString(),
      lastLogin: null,
      profileUrl: null
    };

    setUsers(prev => [...prev, user]);
    toast.success('User added successfully');
    setShowAddModal(false);
    resetForm();
  };

  const handleEditUser = () => {
    if (!currentUser) return;

    if (!newUser.name || !newUser.email) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (!newUser.email.endsWith('@buft.edu.bd')) {
      toast.error('Email must be a valid BUFT email address');
      return;
    }

    setUsers(prev => 
      prev.map(user => 
        user.id === currentUser.id ? { ...user, ...newUser } : user
      )
    );

    toast.success('User updated successfully');
    setShowEditModal(false);
    resetForm();
  };

  const handleDeleteUser = () => {
    if (!currentUser) return;

    setUsers(prev => prev.filter(user => user.id !== currentUser.id));
    toast.success('User deleted successfully');
    setShowDeleteModal(false);
    setCurrentUser(null);
  };

  const handleUpdatePermissions = () => {
    if (!currentUser) return;

    setUsers(prev => 
      prev.map(user => 
        user.id === currentUser.id 
          ? { ...user, permissions: newUser.permissions } 
          : user
      )
    );

    toast.success('Permissions updated successfully');
    setShowPermissionsModal(false);
    resetForm();
  };

  const handleUpdateStatus = (user, status) => {
    setUsers(prev => 
      prev.map(u => 
        u.id === user.id ? { ...u, status } : u
      )
    );

    toast.success(`User status updated to ${status}`);
  };

  const resetForm = () => {
    setNewUser({
      name: '',
      email: '',
      role: 'employee',
      status: 'active',
      department: '',
      permissions: {
        canManageUsers: false,
        canManageMenu: false,
        canViewReports: true,
        canApproveReservations: false,
        canDeleteData: false
      }
    });
    setCurrentUser(null);
  };

  const openEditModal = (user) => {
    setCurrentUser(user);
    setNewUser({
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status,
      department: user.department || '',
      permissions: { ...user.permissions }
    });
    setShowEditModal(true);
  };

  const openDeleteModal = (user) => {
    setCurrentUser(user);
    setShowDeleteModal(true);
  };

  const openPermissionsModal = (user) => {
    setCurrentUser(user);
    setNewUser(prev => ({
      ...prev,
      permissions: { ...user.permissions }
    }));
    setShowPermissionsModal(true);
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
            <h2 className="text-xl font-semibold text-gray-900">User Role Management</h2>
            <p className="text-gray-600 text-sm">Manage user roles, permissions, and access control</p>
          </div>
          <Button onClick={() => setShowAddModal(true)} className="mt-3 sm:mt-0">
            <SafeIcon icon={FiUserPlus} className="w-4 h-4 mr-2" />
            Add New User
          </Button>
        </div>

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div className="flex-1 w-full sm:max-w-md">
            <div className="relative">
              <Input
                type="text"
                placeholder="Search by name, email, or ID..."
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
          
          <div className="flex items-center">
            <label className="mr-2 text-sm text-gray-600">Role:</label>
            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-buft-500"
            >
              <option value="all">All Roles</option>
              <option value="admin">Administrators</option>
              <option value="staff">Staff</option>
              <option value="employee">Employees</option>
            </select>
          </div>
          
          <Button variant="outline" onClick={() => {setLoading(true); setTimeout(() => setLoading(false), 500)}}>
            <SafeIcon icon={FiRefreshCw} className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Department
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Last Login
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredUsers.map((user) => (
                <motion.tr
                  key={user.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-10 w-10 flex-shrink-0">
                        {user.profileUrl ? (
                          <img
                            className="h-10 w-10 rounded-full object-cover"
                            src={user.profileUrl}
                            alt={user.name}
                          />
                        ) : (
                          <div className="h-10 w-10 rounded-full bg-buft-100 flex items-center justify-center">
                            <span className="text-buft-600 font-medium">
                              {user.name.charAt(0)}
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{user.name}</div>
                        <div className="text-sm text-gray-500">{user.email}</div>
                        <div className="text-xs text-gray-400">{user.employeeId}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                      ${user.role === 'admin' ? 'bg-purple-100 text-purple-800' : 
                        user.role === 'staff' ? 'bg-green-100 text-green-800' : 
                        'bg-blue-100 text-blue-800'}`}
                    >
                      {user.role === 'admin' ? 'Administrator' : 
                       user.role === 'staff' ? 'Canteen Staff' : 'Employee'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {user.department || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                      ${user.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}
                    >
                      {user.status}
                    </span>
                    <div className="mt-1">
                      <button 
                        className={`text-xs ${user.status === 'active' ? 'text-red-600 hover:text-red-800' : 'text-green-600 hover:text-green-800'}`}
                        onClick={() => handleUpdateStatus(user, user.status === 'active' ? 'inactive' : 'active')}
                      >
                        {user.status === 'active' ? 'Deactivate' : 'Activate'}
                      </button>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'Never'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        title="Manage Permissions"
                        onClick={() => openPermissionsModal(user)}
                      >
                        <SafeIcon icon={FiShield} className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        title="Edit User"
                        onClick={() => openEditModal(user)}
                      >
                        <SafeIcon icon={FiEdit} className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="danger"
                        size="sm"
                        title="Delete User"
                        onClick={() => openDeleteModal(user)}
                      >
                        <SafeIcon icon={FiTrash2} className="w-4 h-4" />
                      </Button>
                    </div>
                  </td>
                </motion.tr>
              ))}
              
              {filteredUsers.length === 0 && (
                <tr>
                  <td colSpan="6" className="px-6 py-4 text-center text-gray-500">
                    No users found matching your search criteria
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Add User Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => {
          setShowAddModal(false);
          resetForm();
        }}
        title="Add New User"
      >
        <div className="space-y-4">
          <Input
            label="Full Name *"
            name="name"
            value={newUser.name}
            onChange={handleInputChange}
            placeholder="Enter user's full name"
            required
          />
          
          <Input
            label="Email *"
            name="email"
            type="email"
            value={newUser.email}
            onChange={handleInputChange}
            placeholder="Enter user's BUFT email"
            required
          />
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Role *
            </label>
            <select
              name="role"
              value={newUser.role}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-buft-500"
            >
              <option value="employee">Employee</option>
              <option value="staff">Canteen Staff</option>
              <option value="admin">Administrator</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Department
            </label>
            <select
              name="department"
              value={newUser.department}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-buft-500"
            >
              <option value="">Select Department</option>
              {departments.map((dept, index) => (
                <option key={index} value={dept}>{dept}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              name="status"
              value={newUser.status}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-buft-500"
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
          
          <div className="border-t pt-4 mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Permissions
            </label>
            
            <div className="space-y-2">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="canManageUsers"
                  checked={newUser.permissions.canManageUsers}
                  onChange={() => handlePermissionChange('canManageUsers')}
                  className="h-4 w-4 text-buft-600 focus:ring-buft-500 border-gray-300 rounded"
                />
                <label htmlFor="canManageUsers" className="ml-2 text-sm text-gray-700">
                  Can manage users
                </label>
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="canManageMenu"
                  checked={newUser.permissions.canManageMenu}
                  onChange={() => handlePermissionChange('canManageMenu')}
                  className="h-4 w-4 text-buft-600 focus:ring-buft-500 border-gray-300 rounded"
                />
                <label htmlFor="canManageMenu" className="ml-2 text-sm text-gray-700">
                  Can manage menu
                </label>
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="canViewReports"
                  checked={newUser.permissions.canViewReports}
                  onChange={() => handlePermissionChange('canViewReports')}
                  className="h-4 w-4 text-buft-600 focus:ring-buft-500 border-gray-300 rounded"
                />
                <label htmlFor="canViewReports" className="ml-2 text-sm text-gray-700">
                  Can view reports
                </label>
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="canApproveReservations"
                  checked={newUser.permissions.canApproveReservations}
                  onChange={() => handlePermissionChange('canApproveReservations')}
                  className="h-4 w-4 text-buft-600 focus:ring-buft-500 border-gray-300 rounded"
                />
                <label htmlFor="canApproveReservations" className="ml-2 text-sm text-gray-700">
                  Can approve reservations
                </label>
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="canDeleteData"
                  checked={newUser.permissions.canDeleteData}
                  onChange={() => handlePermissionChange('canDeleteData')}
                  className="h-4 w-4 text-buft-600 focus:ring-buft-500 border-gray-300 rounded"
                />
                <label htmlFor="canDeleteData" className="ml-2 text-sm text-gray-700">
                  Can delete data
                </label>
              </div>
            </div>
          </div>
          
          <div className="flex justify-end space-x-3 mt-6">
            <Button
              variant="outline"
              onClick={() => {
                setShowAddModal(false);
                resetForm();
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleAddUser}>
              Add User
            </Button>
          </div>
        </div>
      </Modal>

      {/* Edit User Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          resetForm();
        }}
        title="Edit User"
      >
        <div className="space-y-4">
          <Input
            label="Full Name *"
            name="name"
            value={newUser.name}
            onChange={handleInputChange}
            placeholder="Enter user's full name"
            required
          />
          
          <Input
            label="Email *"
            name="email"
            type="email"
            value={newUser.email}
            onChange={handleInputChange}
            placeholder="Enter user's BUFT email"
            required
          />
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Role *
            </label>
            <select
              name="role"
              value={newUser.role}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-buft-500"
            >
              <option value="employee">Employee</option>
              <option value="staff">Canteen Staff</option>
              <option value="admin">Administrator</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Department
            </label>
            <select
              name="department"
              value={newUser.department}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-buft-500"
            >
              <option value="">Select Department</option>
              {departments.map((dept, index) => (
                <option key={index} value={dept}>{dept}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              name="status"
              value={newUser.status}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-buft-500"
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
          
          <div className="flex justify-end space-x-3 mt-6">
            <Button
              variant="outline"
              onClick={() => {
                setShowEditModal(false);
                resetForm();
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleEditUser}>
              Update User
            </Button>
          </div>
        </div>
      </Modal>

      {/* Delete User Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setCurrentUser(null);
        }}
        title="Delete User"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-gray-700">
            Are you sure you want to delete the user{' '}
            <span className="font-semibold">{currentUser?.name}</span>?
            This action cannot be undone.
          </p>
          
          <div className="flex justify-end space-x-3 mt-6">
            <Button
              variant="outline"
              onClick={() => {
                setShowDeleteModal(false);
                setCurrentUser(null);
              }}
            >
              Cancel
            </Button>
            <Button variant="danger" onClick={handleDeleteUser}>
              Delete
            </Button>
          </div>
        </div>
      </Modal>

      {/* Permissions Modal */}
      <Modal
        isOpen={showPermissionsModal}
        onClose={() => {
          setShowPermissionsModal(false);
          resetForm();
        }}
        title={`Manage Permissions: ${currentUser?.name}`}
        size="md"
      >
        <div className="space-y-6">
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center mb-4">
              <div className="h-10 w-10 flex-shrink-0">
                {currentUser?.profileUrl ? (
                  <img
                    className="h-10 w-10 rounded-full object-cover"
                    src={currentUser.profileUrl}
                    alt={currentUser?.name}
                  />
                ) : (
                  <div className="h-10 w-10 rounded-full bg-buft-100 flex items-center justify-center">
                    <span className="text-buft-600 font-medium">
                      {currentUser?.name.charAt(0)}
                    </span>
                  </div>
                )}
              </div>
              <div className="ml-4">
                <div className="text-sm font-medium text-gray-900">{currentUser?.name}</div>
                <div className="text-sm text-gray-500">{currentUser?.email}</div>
                <span className={`mt-1 px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                  ${currentUser?.role === 'admin' ? 'bg-purple-100 text-purple-800' : 
                    currentUser?.role === 'staff' ? 'bg-green-100 text-green-800' : 
                    'bg-blue-100 text-blue-800'}`}
                >
                  {currentUser?.role === 'admin' ? 'Administrator' : 
                   currentUser?.role === 'staff' ? 'Canteen Staff' : 'Employee'}
                </span>
              </div>
            </div>
          </div>
          
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-3">User Permissions</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between bg-white p-3 rounded-lg border border-gray-200">
                <div>
                  <h4 className="text-sm font-medium text-gray-900">Manage Users</h4>
                  <p className="text-xs text-gray-500">Can add, edit, and delete users</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={newUser.permissions.canManageUsers}
                    onChange={() => handlePermissionChange('canManageUsers')}
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-buft-600"></div>
                </label>
              </div>
              
              <div className="flex items-center justify-between bg-white p-3 rounded-lg border border-gray-200">
                <div>
                  <h4 className="text-sm font-medium text-gray-900">Manage Menu</h4>
                  <p className="text-xs text-gray-500">Can add, edit, and delete menu items</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={newUser.permissions.canManageMenu}
                    onChange={() => handlePermissionChange('canManageMenu')}
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-buft-600"></div>
                </label>
              </div>
              
              <div className="flex items-center justify-between bg-white p-3 rounded-lg border border-gray-200">
                <div>
                  <h4 className="text-sm font-medium text-gray-900">View Reports</h4>
                  <p className="text-xs text-gray-500">Can view system reports and analytics</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={newUser.permissions.canViewReports}
                    onChange={() => handlePermissionChange('canViewReports')}
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-buft-600"></div>
                </label>
              </div>
              
              <div className="flex items-center justify-between bg-white p-3 rounded-lg border border-gray-200">
                <div>
                  <h4 className="text-sm font-medium text-gray-900">Approve Reservations</h4>
                  <p className="text-xs text-gray-500">Can approve or reject reservations</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={newUser.permissions.canApproveReservations}
                    onChange={() => handlePermissionChange('canApproveReservations')}
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-buft-600"></div>
                </label>
              </div>
              
              <div className="flex items-center justify-between bg-white p-3 rounded-lg border border-gray-200">
                <div>
                  <h4 className="text-sm font-medium text-gray-900">Delete Data</h4>
                  <p className="text-xs text-gray-500">Can permanently delete system data</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={newUser.permissions.canDeleteData}
                    onChange={() => handlePermissionChange('canDeleteData')}
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-buft-600"></div>
                </label>
              </div>
            </div>
          </div>
          
          <div className="flex justify-end space-x-3 pt-4 border-t">
            <Button
              variant="outline"
              onClick={() => {
                setShowPermissionsModal(false);
                resetForm();
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleUpdatePermissions}>
              <SafeIcon icon={FiCheck} className="w-4 h-4 mr-2" />
              Save Permissions
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default UserRoleManagement;