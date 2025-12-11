'use client';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useApi } from '@/hooks/useApi';
import { API_ENDPOINTS } from '@/constants/api-endpoints';
import { Plus, Search, Edit, Trash2, Eye, UserCog, Mail, Phone, MapPin, CheckCircle, XCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function AdministratorsPage() {
  const [admins, setAdmins] = useState([]);
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingAdmin, setEditingAdmin] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    role: 'branch_admin',
    branchId: '',
    permissions: [],
    isActive: true,
  });

  const { execute } = useApi();

  useEffect(() => {
    loadAdmins();
    loadBranches();
  }, []);

  const loadAdmins = async () => {
    try {
      setLoading(true);
      const response = await execute({ url: '/super-admin/users?role=branch_admin,super_admin' });
      
      if (response?.success) {
        setAdmins(response.data.users || []);
      }
    } catch (error) {
      console.error('Failed to load administrators:', error);
      toast.error('Failed to load administrators');
    } finally {
      setLoading(false);
    }
  };

  const loadBranches = async () => {
    try {
      const response = await execute({ url: '/super-admin/branches' });
      
      if (response?.success) {
        setBranches(response.data.branches || []);
      }
    } catch (error) {
      console.error('Failed to load branches:', error);
    }
  };

  const handleAddNew = () => {
    setEditingAdmin(null);
    setFormData({
      fullName: '',
      email: '',
      phone: '',
      password: '',
      role: 'branch_admin',
      branchId: '',
      permissions: [],
      isActive: true,
    });
    setShowModal(true);
  };

  const handleEdit = (admin) => {
    setEditingAdmin(admin);
    setFormData({
      fullName: admin.fullName || '',
      email: admin.email || '',
      phone: admin.phone || '',
      password: '', // Leave empty for edit
      role: admin.role || 'branch_admin',
      branchId: admin.branchId?._id || admin.branchId || '',
      permissions: admin.permissions || [],
      isActive: admin.isActive !== false,
    });
    setShowModal(true);
  };

  const handleDelete = async (adminId) => {
    if (!confirm('Are you sure you want to delete this administrator?')) return;
    
    try {
      const response = await execute({
        url: `/super-admin/users/${adminId}`,
        method: 'DELETE',
      });
      
      if (response?.success) {
        toast.success('Administrator deleted successfully');
        loadAdmins();
      }
    } catch (error) {
      toast.error('Failed to delete administrator');
      console.error(error);
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    
    // Validation for new user
    if (!editingAdmin && !formData.password) {
      toast.error('Password is required for new administrator');
      return;
    }

    if (!editingAdmin && formData.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    
    try {
      setSubmitting(true);
      
      const url = editingAdmin
        ? `/super-admin/users/${editingAdmin._id}`
        : '/super-admin/users';
      
      const method = editingAdmin ? 'PUT' : 'POST';
      
      // Build request body
      const body = {
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        role: formData.role,
        branchId: formData.role === 'branch_admin' ? formData.branchId : null,
        permissions: formData.permissions,
        isActive: formData.isActive,
      };

      // Only include password if it's provided
      if (formData.password) {
        body.password = formData.password;
      }
      
      const response = await execute({ url, method, body });
      
      if (response?.success) {
        toast.success(editingAdmin ? 'Administrator updated successfully' : 'Administrator created successfully');
        setShowModal(false);
        loadAdmins();
      } else {
        toast.error(response?.message || 'Failed to save administrator');
      }
    } catch (error) {
      console.error('Form submission failed:', error);
      toast.error('Failed to save administrator. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredAdmins = admins.filter(admin =>
    admin.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    admin.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    admin.phone?.includes(searchTerm)
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            Administrators Management
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage system and branch administrators
          </p>
        </div>
        <Button onClick={handleAddNew} className="bg-blue-600 hover:bg-blue-700">
          <Plus className="h-4 w-4 mr-2" />
          Add Administrator
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Admins</p>
                <p className="text-2xl font-bold text-gray-900">{admins.length}</p>
              </div>
              <UserCog className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active</p>
                <p className="text-2xl font-bold text-green-600">
                  {admins.filter(a => a.isActive).length}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Inactive</p>
                <p className="text-2xl font-bold text-red-600">
                  {admins.filter(a => !a.isActive).length}
                </p>
              </div>
              <XCircle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Super Admins</p>
                <p className="text-2xl font-bold text-purple-600">
                  {admins.filter(a => a.role === 'super_admin').length}
                </p>
              </div>
              <UserCog className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center space-x-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                type="text"
                placeholder="Search by name, email, or phone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Administrators Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Administrators ({filteredAdmins.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b dark:border-gray-700">
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Name</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Contact</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Role</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Branch</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Status</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Last Login</th>
                  <th className="text-right py-3 px-4 font-medium text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredAdmins.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="text-center py-8 text-gray-500">
                      No administrators found
                    </td>
                  </tr>
                ) : (
                  filteredAdmins.map((admin) => (
                    <tr key={admin._id} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800">
                      <td className="py-3 px-4">
                        <div className="flex items-center">
                          <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                            <UserCog className="h-5 w-5 text-blue-600" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{admin.fullName}</p>
                            <p className="text-sm text-gray-500">ID: {admin._id.slice(-6)}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-gray-600">
                        <div className="space-y-1">
                          <div className="flex items-center text-sm">
                            <Mail className="h-3 w-3 mr-2" />
                            {admin.email}
                          </div>
                          {admin.phone && (
                            <div className="flex items-center text-sm">
                              <Phone className="h-3 w-3 mr-2" />
                              {admin.phone}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          admin.role === 'super_admin'
                            ? 'bg-purple-100 text-purple-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}>
                          {admin.role === 'super_admin' ? 'Super Admin' : 'Branch Admin'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-gray-600">
                        {admin.branchId?.name || admin.role === 'super_admin' ? 'All Branches' : 'Not Assigned'}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          admin.isActive
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {admin.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-600">
                        {admin.lastLogin ? new Date(admin.lastLogin).toLocaleDateString() : 'Never'}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center justify-end space-x-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleEdit(admin)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDelete(admin._id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 rounded-t-lg">
              <h2 className="text-xl font-bold text-gray-900">
                {editingAdmin ? 'Edit Administrator' : 'Add New Administrator'}
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                {editingAdmin ? 'Update administrator information' : 'Create a new administrator account'}
              </p>
            </div>

            {/* Modal Content */}
            <div className="px-6 py-4">
              <form onSubmit={handleFormSubmit} className="space-y-5">
                {/* Personal Information Section */}
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">
                    Personal Information
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Full Name <span className="text-red-500">*</span>
                      </label>
                      <Input
                        type="text"
                        value={formData.fullName}
                        onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                        placeholder="Enter full name"
                        className="bg-white border-gray-300 text-gray-900"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email Address <span className="text-red-500">*</span>
                      </label>
                      <Input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="admin@example.com"
                        className="bg-white border-gray-300 text-gray-900"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number
                    </label>
                    <Input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="+92 300 1234567"
                      className="bg-white border-gray-300 text-gray-900"
                    />
                  </div>

                  {!editingAdmin && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Password <span className="text-red-500">*</span>
                      </label>
                      <Input
                        type="password"
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        placeholder="Minimum 6 characters"
                        className="bg-white border-gray-300 text-gray-900"
                        required={!editingAdmin}
                        minLength={6}
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Password must be at least 6 characters long
                      </p>
                    </div>
                  )}

                  {editingAdmin && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        New Password (Optional)
                      </label>
                      <Input
                        type="password"
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        placeholder="Leave empty to keep current password"
                        className="bg-white border-gray-300 text-gray-900"
                        minLength={6}
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Only fill this if you want to change the password
                      </p>
                    </div>
                  )}
                </div>

                {/* Account Configuration Section */}
                <div className="space-y-4 pt-4 border-t border-gray-200">
                  <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">
                    Account Configuration
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Role <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={formData.role}
                        onChange={(e) => setFormData({ ...formData, role: e.target.value, branchId: e.target.value === 'super_admin' ? '' : formData.branchId })}
                        className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        required
                      >
                        <option value="branch_admin">Branch Admin</option>
                        <option value="super_admin">Super Admin</option>
                      </select>
                    </div>
                    
                    {formData.role === 'branch_admin' && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Branch Assignment <span className="text-red-500">*</span>
                        </label>
                        <select
                          value={formData.branchId}
                          onChange={(e) => setFormData({ ...formData, branchId: e.target.value })}
                          className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          required={formData.role === 'branch_admin'}
                        >
                          <option value="">Select Branch</option>
                          {branches.map((branch) => (
                            <option key={branch._id} value={branch._id}>
                              {branch.name} - {branch.address?.city || 'N/A'}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}
                  </div>

                  {formData.role === 'super_admin' && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <p className="text-sm text-blue-800">
                        <strong className="font-semibold">Super Admin</strong> will have access to all branches and system-wide settings.
                      </p>
                    </div>
                  )}
                </div>

                {/* Account Status Section */}
                <div className="space-y-3 pt-4 border-t border-gray-200">
                  <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">
                    Account Status
                  </h3>
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                    <label className="flex items-center space-x-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.isActive}
                        onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <div>
                        <span className="text-sm font-medium text-gray-900">Active Account</span>
                        <p className="text-xs text-gray-500">Account will be immediately accessible</p>
                      </div>
                    </label>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowModal(false)}
                    disabled={submitting}
                    className="px-6 bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={submitting}
                    className="px-6 bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    {submitting ? (
                      <span className="flex items-center">
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Saving...
                      </span>
                    ) : (
                      editingAdmin ? 'Update Administrator' : 'Create Administrator'
                    )}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
