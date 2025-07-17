import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Card from '../ui/Card';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Modal from '../ui/Modal';
import { toast } from '../ui/Toaster';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../../common/SafeIcon';
import { generateEmployees, departments, designations } from '../../utils/mockData';

const { FiPlus, FiEdit, FiTrash2, FiSearch, FiFilter, FiDownload, FiUpload } = FiIcons;

const EmployeeManagement = () => {
  const [employees, setEmployees] = useState([]);
  const [filteredEmployees, setFilteredEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [currentEmployee, setCurrentEmployee] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [filterDepartment, setFilterDepartment] = useState('all');
  const [newEmployee, setNewEmployee] = useState({
    name: '',
    email: '',
    employeeId: '',
    department: '',
    designation: '',
    role: 'employee',
    profileUrl: ''
  });

  useEffect(() => {
    // Fetch employees from API or database
    const fetchEmployees = async () => {
      try {
        // In a real implementation, this would be an API call
        const data = generateEmployees(30);
        setEmployees(data);
        setFilteredEmployees(data);
      } catch (error) {
        toast.error('Failed to fetch employees');
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchEmployees();
  }, []);

  useEffect(() => {
    // Filter employees based on search term and filters
    const filtered = employees.filter(employee => {
      const matchesSearch = 
        employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        employee.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        employee.employeeId.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesRole = filterRole === 'all' || employee.role === filterRole;
      const matchesDepartment = filterDepartment === 'all' || employee.department === filterDepartment;
      
      return matchesSearch && matchesRole && matchesDepartment;
    });
    
    setFilteredEmployees(filtered);
  }, [searchTerm, filterRole, filterDepartment, employees]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewEmployee(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAddEmployee = () => {
    // Validate input
    if (!newEmployee.name || !newEmployee.email || !newEmployee.employeeId) {
      toast.error('Please fill in all required fields');
      return;
    }

    // Email validation
    if (!newEmployee.email.endsWith('@buft.edu.bd')) {
      toast.error('Email must be a valid BUFT email address');
      return;
    }

    // In a real implementation, this would be an API call
    const employee = {
      id: `EMP-${Date.now()}`,
      ...newEmployee,
      createdAt: new Date().toISOString()
    };

    setEmployees(prev => [...prev, employee]);
    toast.success('Employee added successfully');
    setShowAddModal(false);
    resetForm();
  };

  const handleEditEmployee = () => {
    if (!currentEmployee) return;

    // Validate input
    if (!newEmployee.name || !newEmployee.email || !newEmployee.employeeId) {
      toast.error('Please fill in all required fields');
      return;
    }

    // Email validation
    if (!newEmployee.email.endsWith('@buft.edu.bd')) {
      toast.error('Email must be a valid BUFT email address');
      return;
    }

    // In a real implementation, this would be an API call
    setEmployees(prev => 
      prev.map(emp => 
        emp.id === currentEmployee.id ? { ...emp, ...newEmployee } : emp
      )
    );

    toast.success('Employee updated successfully');
    setShowEditModal(false);
    resetForm();
  };

  const handleDeleteEmployee = () => {
    if (!currentEmployee) return;

    // In a real implementation, this would be an API call
    setEmployees(prev => prev.filter(emp => emp.id !== currentEmployee.id));
    toast.success('Employee deleted successfully');
    setShowDeleteModal(false);
    setCurrentEmployee(null);
  };

  const resetForm = () => {
    setNewEmployee({
      name: '',
      email: '',
      employeeId: '',
      department: '',
      designation: '',
      role: 'employee',
      profileUrl: ''
    });
    setCurrentEmployee(null);
  };

  const openEditModal = (employee) => {
    setCurrentEmployee(employee);
    setNewEmployee({
      name: employee.name,
      email: employee.email,
      employeeId: employee.employeeId,
      department: employee.department,
      designation: employee.designation,
      role: employee.role,
      profileUrl: employee.profileUrl || ''
    });
    setShowEditModal(true);
  };

  const openDeleteModal = (employee) => {
    setCurrentEmployee(employee);
    setShowDeleteModal(true);
  };

  const exportEmployees = () => {
    const csvContent = [
      ['Employee ID', 'Name', 'Email', 'Department', 'Designation', 'Role', 'Created At'],
      ...filteredEmployees.map(emp => [
        emp.employeeId,
        emp.name,
        emp.email,
        emp.department,
        emp.designation,
        emp.role,
        emp.createdAt
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `employees_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
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
        
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center">
            <label className="mr-2 text-sm text-gray-600">Role:</label>
            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-buft-500"
            >
              <option value="all">All Roles</option>
              <option value="admin">Admin</option>
              <option value="staff">Staff</option>
              <option value="employee">Employee</option>
            </select>
          </div>
          
          <div className="flex items-center">
            <label className="mr-2 text-sm text-gray-600">Department:</label>
            <select
              value={filterDepartment}
              onChange={(e) => setFilterDepartment(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-buft-500"
            >
              <option value="all">All Departments</option>
              {departments.map((dept, index) => (
                <option key={index} value={dept}>{dept}</option>
              ))}
            </select>
          </div>
          
          <Button onClick={() => setShowAddModal(true)}>
            <SafeIcon icon={FiPlus} className="w-4 h-4 mr-2" />
            Add Employee
          </Button>
          
          <Button variant="outline" onClick={exportEmployees}>
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
                  Department
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Designation
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredEmployees.map((employee) => (
                <motion.tr
                  key={employee.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-10 w-10 flex-shrink-0">
                        {employee.profileUrl ? (
                          <img
                            className="h-10 w-10 rounded-full object-cover"
                            src={employee.profileUrl}
                            alt={employee.name}
                          />
                        ) : (
                          <div className="h-10 w-10 rounded-full bg-buft-100 flex items-center justify-center">
                            <span className="text-buft-600 font-medium">
                              {employee.name.charAt(0)}
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{employee.name}</div>
                        <div className="text-sm text-gray-500">{employee.email}</div>
                        <div className="text-xs text-gray-400">{employee.employeeId}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {employee.department}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {employee.designation}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                      ${employee.role === 'admin' ? 'bg-purple-100 text-purple-800' : 
                        employee.role === 'staff' ? 'bg-green-100 text-green-800' : 
                        'bg-blue-100 text-blue-800'}`}
                    >
                      {employee.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <Button
                      variant="outline"
                      size="sm"
                      className="mr-2"
                      onClick={() => openEditModal(employee)}
                    >
                      <SafeIcon icon={FiEdit} className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => openDeleteModal(employee)}
                    >
                      <SafeIcon icon={FiTrash2} className="w-4 h-4" />
                    </Button>
                  </td>
                </motion.tr>
              ))}
              
              {filteredEmployees.length === 0 && (
                <tr>
                  <td colSpan="5" className="px-6 py-4 text-center text-gray-500">
                    No employees found matching your search criteria
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Add Employee Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => {
          setShowAddModal(false);
          resetForm();
        }}
        title="Add New Employee"
      >
        <div className="space-y-4">
          <Input
            label="Full Name *"
            name="name"
            value={newEmployee.name}
            onChange={handleInputChange}
            placeholder="Enter employee's full name"
            required
          />
          
          <Input
            label="Email *"
            name="email"
            type="email"
            value={newEmployee.email}
            onChange={handleInputChange}
            placeholder="Enter employee's BUFT email"
            required
          />
          
          <Input
            label="Employee ID *"
            name="employeeId"
            value={newEmployee.employeeId}
            onChange={handleInputChange}
            placeholder="Enter employee ID"
            required
          />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Department
              </label>
              <select
                name="department"
                value={newEmployee.department}
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
                Designation
              </label>
              <select
                name="designation"
                value={newEmployee.designation}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-buft-500"
              >
                <option value="">Select Designation</option>
                {designations.map((desig, index) => (
                  <option key={index} value={desig}>{desig}</option>
                ))}
              </select>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Role
            </label>
            <select
              name="role"
              value={newEmployee.role}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-buft-500"
            >
              <option value="employee">Employee</option>
              <option value="staff">Staff</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          
          <Input
            label="Profile Picture URL"
            name="profileUrl"
            value={newEmployee.profileUrl}
            onChange={handleInputChange}
            placeholder="Enter URL for profile picture"
          />
          
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
            <Button onClick={handleAddEmployee}>
              Add Employee
            </Button>
          </div>
        </div>
      </Modal>

      {/* Edit Employee Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          resetForm();
        }}
        title="Edit Employee"
      >
        <div className="space-y-4">
          <Input
            label="Full Name *"
            name="name"
            value={newEmployee.name}
            onChange={handleInputChange}
            placeholder="Enter employee's full name"
            required
          />
          
          <Input
            label="Email *"
            name="email"
            type="email"
            value={newEmployee.email}
            onChange={handleInputChange}
            placeholder="Enter employee's BUFT email"
            required
          />
          
          <Input
            label="Employee ID *"
            name="employeeId"
            value={newEmployee.employeeId}
            onChange={handleInputChange}
            placeholder="Enter employee ID"
            required
          />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Department
              </label>
              <select
                name="department"
                value={newEmployee.department}
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
                Designation
              </label>
              <select
                name="designation"
                value={newEmployee.designation}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-buft-500"
              >
                <option value="">Select Designation</option>
                {designations.map((desig, index) => (
                  <option key={index} value={desig}>{desig}</option>
                ))}
              </select>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Role
            </label>
            <select
              name="role"
              value={newEmployee.role}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-buft-500"
            >
              <option value="employee">Employee</option>
              <option value="staff">Staff</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          
          <Input
            label="Profile Picture URL"
            name="profileUrl"
            value={newEmployee.profileUrl}
            onChange={handleInputChange}
            placeholder="Enter URL for profile picture"
          />
          
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
            <Button onClick={handleEditEmployee}>
              Update Employee
            </Button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setCurrentEmployee(null);
        }}
        title="Delete Employee"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-gray-700">
            Are you sure you want to delete the employee{' '}
            <span className="font-semibold">{currentEmployee?.name}</span>?
            This action cannot be undone.
          </p>
          
          <div className="flex justify-end space-x-3 mt-6">
            <Button
              variant="outline"
              onClick={() => {
                setShowDeleteModal(false);
                setCurrentEmployee(null);
              }}
            >
              Cancel
            </Button>
            <Button variant="danger" onClick={handleDeleteEmployee}>
              Delete
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default EmployeeManagement;