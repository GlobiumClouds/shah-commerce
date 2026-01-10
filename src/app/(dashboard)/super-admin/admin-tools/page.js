'use client';
import React, { useState, useEffect } from 'react';
import { useApi } from '@/hooks/useApi';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import Dropdown from '@/components/ui/dropdown';
import FullPageLoader from '@/components/ui/full-page-loader';
import Modal from '@/components/ui/modal';
import {
  Users,
  Building2,
  Settings,
  Bell,
  UserPlus,
  Edit,
  Trash2,
  Plus,
  Search,
  Filter,
  Download,
  Upload,
  Shield,
  Database,
  Mail,
  MessageSquare,
  AlertTriangle,
  CheckCircle,
  XCircle,
  RefreshCw
} from 'lucide-react';

export default function SuperAdminTools() {
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(false);
  const [systemData, setSystemData] = useState(null);
  const [users, setUsers] = useState([]);
  const [branches, setBranches] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('');
  const [selectedItem, setSelectedItem] = useState(null);
  const [formData, setFormData] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const { execute } = useApi();

  useEffect(() => {
    loadSystemOverview();
  }, []);

  const loadSystemOverview = async () => {
    try {
      setLoading(true);
      const response = await execute({
        method: 'GET',
        url: '/api/super-admin?action=system-overview'
      });

      if (response.success) {
        setSystemData(response.data);
      }
    } catch (error) {
      console.error('Failed to load system overview:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadUsers = async () => {
    try {
      setLoading(true);
      const response = await execute({
        method: 'GET',
        url: '/api/super-admin?action=user-management'
      });

      if (response.success) {
        setUsers(response.data.users);
      }
    } catch (error) {
      console.error('Failed to load users:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadBranches = async () => {
    try {
      setLoading(true);
      const response = await execute({
        method: 'GET',
        url: '/api/super-admin?action=branch-management'
      });

      if (response.success) {
        setBranches(response.data.branches);
      }
    } catch (error) {
      console.error('Failed to load branches:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    switch (tab) {
      case 'users':
        loadUsers();
        break;
      case 'branches':
        loadBranches();
        break;
      case 'settings':
        // Load settings if needed
        break;
      default:
        break;
    }
  };

  const openModal = (type, item = null) => {
    setModalType(type);
    setSelectedItem(item);
    setFormData(item || {});
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setModalType('');
    setSelectedItem(null);
    setFormData({});
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      let url = '/api/super-admin';
      let method = 'POST';

      const params = new URLSearchParams();

      switch (modalType) {
        case 'create-user':
          params.append('action', 'create-user');
          break;
        case 'update-user':
          params.append('action', 'update-user');
          method = 'PUT';
          break;
        case 'delete-user':
          params.append('action', 'delete-user');
          method = 'DELETE';
          break;
        case 'create-branch':
          params.append('action', 'create-branch');
          break;
        case 'update-branch':
          params.append('action', 'update-branch');
          method = 'PUT';
          break;
        case 'delete-branch':
          params.append('action', 'delete-branch');
          method = 'DELETE';
          break;
        case 'send-notification':
          params.append('action', 'send-notification');
          break;
        default:
          return;
      }

      url += `?${params.toString()}`;

      const response = await execute({
        method,
        url,
        data: formData
      });

      if (response.success) {
        closeModal();
        // Refresh data based on current tab
        if (activeTab === 'users') loadUsers();
        if (activeTab === 'branches') loadBranches();
        if (activeTab === 'overview') loadSystemOverview();
      }
    } catch (error) {
      console.error('Operation failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === 'all' || user.role === filterRole;
    return matchesSearch && matchesRole;
  });

  const tabs = [
    { id: 'overview', label: 'System Overview', icon: Database },
    { id: 'users', label: 'User Management', icon: Users },
    { id: 'branches', label: 'Branch Management', icon: Building2 },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'settings', label: 'System Settings', icon: Settings }
  ];

  if (loading && !systemData) {
    return <FullPageLoader message="Loading admin tools..." />;
  }

  return (
    <div className="p-4 md:p-6 space-y-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
      {/* Header */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 pt-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-gray-100">
            Super Admin Tools
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1 text-sm md:text-base">
            Comprehensive system management and administration tools
          </p>
        </div>

        <div className="flex gap-3">
          <Button onClick={loadSystemOverview} variant="outline">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-gray-200 dark:border-gray-700">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <div className="space-y-6">
        {activeTab === 'overview' && systemData && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Users Overview */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Users className="w-5 h-5 text-blue-500" />
                  Users
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Total</span>
                    <span className="font-bold">{systemData.users.total}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Students</span>
                    <span>{systemData.users.students}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Teachers</span>
                    <span>{systemData.users.teachers}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Parents</span>
                    <span>{systemData.users.parents}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Branches Overview */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-green-500" />
                  Branches
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Total</span>
                    <span className="font-bold">{systemData.branches.total}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Active</span>
                    <span className="text-green-600">{systemData.branches.active}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Inactive</span>
                    <span className="text-red-600">{systemData.branches.inactive}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Academic Overview */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Shield className="w-5 h-5 text-purple-500" />
                  Academic
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Classes</span>
                    <span className="font-bold">{systemData.academic.classes}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Events</span>
                    <span>{systemData.academic.events}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Fee Templates</span>
                    <span>{systemData.academic.feeTemplates}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* System Overview */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Settings className="w-5 h-5 text-orange-500" />
                  System
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Expenses</span>
                    <span className="font-bold">{systemData.system.expenses}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Notifications</span>
                    <span>{systemData.system.notifications}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Fee Vouchers</span>
                    <span>{systemData.academic.feeVouchers}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === 'users' && (
          <div className="space-y-6">
            {/* User Management Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <Input
                    placeholder="Search users..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 w-64"
                  />
                </div>
                <Dropdown
                  value={filterRole}
                  onChange={(e) => setFilterRole(e.target.value)}
                  options={[
                    { value: 'all', label: 'All Roles' },
                    { value: 'student', label: 'Students' },
                    { value: 'teacher', label: 'Teachers' },
                    { value: 'parent', label: 'Parents' },
                    { value: 'branch-admin', label: 'Branch Admins' },
                    { value: 'super-admin', label: 'Super Admins' }
                  ]}
                  className="w-40"
                />
              </div>
              <Button onClick={() => openModal('create-user')} className="whitespace-nowrap">
                <UserPlus className="w-4 h-4 mr-2" />
                Add User
              </Button>
            </div>

            {/* Users Table */}
            <Card>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 dark:bg-gray-800">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Branch</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                      {filteredUsers.map((user) => (
                        <tr key={user._id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                              {user.firstName} {user.lastName}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {user.email}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                              {user.role}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {user.branchProfile?.branchId?.name || 'N/A'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                              user.status === 'active'
                                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                            }`}>
                              {user.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex items-center gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => openModal('update-user', user)}
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => openModal('delete-user', user)}
                                className="text-red-600 hover:text-red-700"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === 'branches' && (
          <div className="space-y-6">
            {/* Branch Management Header */}
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Branch Management</h2>
              <Button onClick={() => openModal('create-branch')}>
                <Plus className="w-4 h-4 mr-2" />
                Add Branch
              </Button>
            </div>

            {/* Branches Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {branches.map((branch) => (
                <Card key={branch._id}>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>{branch.name}</span>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        branch.status === 'active'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {branch.status}
                      </span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Code:</span>
                        <span className="font-medium">{branch.code}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Location:</span>
                        <span>{branch.location?.city || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Admin:</span>
                        <span className="text-sm">{branch.adminId?.firstName} {branch.adminId?.lastName}</span>
                      </div>
                    </div>
                    <div className="flex gap-2 mt-4">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => openModal('update-branch', branch)}
                        className="flex-1"
                      >
                        <Edit className="w-4 h-4 mr-1" />
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => openModal('delete-branch', branch)}
                        className="flex-1 text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4 mr-1" />
                        Delete
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'notifications' && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Send System Notification</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Title</label>
                  <Input
                    placeholder="Notification title"
                    value={formData.title || ''}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Message</label>
                  <Textarea
                    placeholder="Notification message"
                    value={formData.message || ''}
                    onChange={(e) => setFormData({...formData, message: e.target.value})}
                    rows={4}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Target Audience</label>
                  <Dropdown
                    value={formData.targetType || 'all'}
                    onChange={(e) => setFormData({...formData, targetType: e.target.value})}
                    options={[
                      { value: 'all', label: 'All Users' },
                      { value: 'students', label: 'Students Only' },
                      { value: 'teachers', label: 'Teachers Only' },
                      { value: 'parents', label: 'Parents Only' },
                      { value: 'branch-admins', label: 'Branch Admins Only' }
                    ]}
                  />
                </div>
                <Button onClick={() => openModal('send-notification')} className="w-full">
                  <Mail className="w-4 h-4 mr-2" />
                  Send Notification
                </Button>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>System Settings</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 dark:text-gray-400">
                  System settings management will be implemented here.
                </p>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <Modal
          isOpen={showModal}
          onClose={closeModal}
          title={
            modalType === 'create-user' ? 'Create New User' :
            modalType === 'update-user' ? 'Update User' :
            modalType === 'delete-user' ? 'Delete User' :
            modalType === 'create-branch' ? 'Create New Branch' :
            modalType === 'update-branch' ? 'Update Branch' :
            modalType === 'delete-branch' ? 'Delete Branch' :
            modalType === 'send-notification' ? 'Send Notification' :
            'Confirm Action'
          }
        >
          <div className="space-y-4">
            {modalType === 'delete-user' && (
              <p>Are you sure you want to delete user "{selectedItem?.firstName} {selectedItem?.lastName}"? This action cannot be undone.</p>
            )}

            {modalType === 'delete-branch' && (
              <p>Are you sure you want to delete branch "{selectedItem?.name}"? This action cannot be undone.</p>
            )}

            {(modalType === 'create-user' || modalType === 'update-user') && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">First Name</label>
                  <Input
                    value={formData.firstName || ''}
                    onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Last Name</label>
                  <Input
                    value={formData.lastName || ''}
                    onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium mb-2">Email</label>
                  <Input
                    type="email"
                    value={formData.email || ''}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                  />
                </div>
                {modalType === 'create-user' && (
                  <div className="col-span-2">
                    <label className="block text-sm font-medium mb-2">Password</label>
                    <Input
                      type="password"
                      value={formData.password || ''}
                      onChange={(e) => setFormData({...formData, password: e.target.value})}
                    />
                  </div>
                )}
                <div>
                  <label className="block text-sm font-medium mb-2">Role</label>
                  <Dropdown
                    value={formData.role || ''}
                    onChange={(e) => setFormData({...formData, role: e.target.value})}
                    options={[
                      { value: 'student', label: 'Student' },
                      { value: 'teacher', label: 'Teacher' },
                      { value: 'parent', label: 'Parent' },
                      { value: 'branch-admin', label: 'Branch Admin' },
                      { value: 'super-admin', label: 'Super Admin' }
                    ]}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Phone</label>
                  <Input
                    value={formData.phone || ''}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  />
                </div>
              </div>
            )}

            {(modalType === 'create-branch' || modalType === 'update-branch') && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Branch Name</label>
                  <Input
                    value={formData.name || ''}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Branch Code</label>
                  <Input
                    value={formData.code || ''}
                    onChange={(e) => setFormData({...formData, code: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Admin Email</label>
                  <Input
                    type="email"
                    value={formData.adminEmail || ''}
                    onChange={(e) => setFormData({...formData, adminEmail: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Contact Number</label>
                  <Input
                    value={formData.contactNumber || ''}
                    onChange={(e) => setFormData({...formData, contactNumber: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Address</label>
                  <Textarea
                    value={formData.address || ''}
                    onChange={(e) => setFormData({...formData, address: e.target.value})}
                    rows={3}
                  />
                </div>
              </div>
            )}

            {modalType === 'send-notification' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Title</label>
                  <Input
                    value={formData.title || ''}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Message</label>
                  <Textarea
                    value={formData.message || ''}
                    onChange={(e) => setFormData({...formData, message: e.target.value})}
                    rows={4}
                  />
                </div>
              </div>
            )}

            <div className="flex justify-end gap-3 pt-4">
              <Button variant="outline" onClick={closeModal}>
                Cancel
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={loading}
                className={modalType.includes('delete') ? 'bg-red-600 hover:bg-red-700' : ''}
              >
                {loading ? (
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                ) : modalType.includes('delete') ? (
                  'Delete'
                ) : modalType.includes('create') ? (
                  'Create'
                ) : modalType.includes('update') ? (
                  'Update'
                ) : (
                  'Send'
                )}
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
