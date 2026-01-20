'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import apiClient from '@/lib/api-client';
import { API_ENDPOINTS } from '@/constants/api-endpoints';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Input from '@/components/ui/input';
import Textarea from '@/components/ui/textarea';
import Dropdown from '@/components/ui/dropdown';
import MultiSelectDropdown from '@/components/ui/multi-select';
import ButtonLoader from '@/components/ui/button-loader';
import { Bell, Users, Type, Building2, Megaphone, History, Clock, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

// Notification Types
const NOTIFICATION_TYPES = [
  { value: 'announcement', label: '📢 Announcement' },
  { value: 'general', label: 'ℹ️ General' },
  { value: 'assignment', label: '📝 Assignment' },
  { value: 'fee_reminder', label: '💰 Fee Reminder' },
  { value: 'event', label: '🎉 Event' },
  { value: 'holiday', label: '🏖️ Holiday' },
  { value: 'exam', label: '🎓 Exam Update' },
  { value: 'result', label: '📊 Result Declared' },
];

const TARGET_ROLES = [
  { value: 'all', label: '🌐 All (Everyone)' },
  { value: 'branch_admin', label: '🔑 Branch Admins' },
  { value: 'student', label: '👨‍🎓 Students' },
  { value: 'parent', label: '👨‍👩‍👦 Parents' },
  { value: 'teacher', label: '👩‍🏫 Teachers' },
  { value: 'staff', label: '💼 Staff' },
];

export default function SuperAdminNotification() {
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [branchesLoading, setBranchesLoading] = useState(true);
  const [usersLoading, setUsersLoading] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(true);

  // Branches State
  const [branches, setBranches] = useState([]);

  // Specific Targeting State
  const [isSpecificTargeting, setIsSpecificTargeting] = useState(false);
  const [availableUsers, setAvailableUsers] = useState([]);
  const [selectedUserIds, setSelectedUserIds] = useState([]);

  // History State
  const [history, setHistory] = useState([]);

  const [formData, setFormData] = useState({
    title: '',
    message: '',
    type: 'announcement',
    targetRole: 'all',
    targetBranch: 'all',
  });

  // Fetch Branches on mount
  useEffect(() => {
    fetchBranches();
    fetchHistory();
  }, []);

  // Fetch Users when role/branch changes or specific targeting is toggled
  useEffect(() => {
    if (isSpecificTargeting) {
      fetchUsers();
    }
  }, [isSpecificTargeting, formData.targetRole, formData.targetBranch]);

  const fetchBranches = async () => {
    try {
      const response = await apiClient.get(API_ENDPOINTS.SUPER_ADMIN.BRANCHES.LIST);
      if (response.success) {
        setBranches(response.data.branches || response.data || []);
      }
    } catch (error) {
      console.error('Failed to fetch branches:', error);
      toast.error('Failed to load branches');
    } finally {
      setBranchesLoading(false);
    }
  };

  const fetchUsers = async () => {
    setUsersLoading(true);
    try {
      const params = {
        role: formData.targetRole,
        branchId: formData.targetBranch,
        format: 'dropdown'
      };
      console.log('🔍 Fetching users with params:', params);
      console.log('📍 Endpoint:', API_ENDPOINTS.SUPER_ADMIN.USERS.LIST);

      const response = await apiClient.get(API_ENDPOINTS.SUPER_ADMIN.USERS.LIST, params);
      console.log('✅ Users response:', response);

      if (response.success) {
        setAvailableUsers(response.data);
      } else {
        console.error('❌ Failed response:', response);
        setAvailableUsers([]);
      }
    } catch (error) {
      console.error('Failed to fetch users:', error);
      toast.error(`Failed to load users: ${error.message || 'Network error'}`);
      setAvailableUsers([]);
    } finally {
      setUsersLoading(false);
    }
  };

  const fetchHistory = async () => {
    try {
      if (!API_ENDPOINTS.NOTIFICATIONS?.HISTORY) {
        setHistoryLoading(false);
        return;
      }

      const response = await apiClient.get(API_ENDPOINTS.NOTIFICATIONS.HISTORY);
      if (response.success && response.data) {
        const notifications = Array.isArray(response.data)
          ? response.data
          : (response.data.notifications || []);
        setHistory(notifications);
      } else {
        setHistory([]);
      }
    } catch (error) {
      console.error('Failed to fetch history:', error);
      setHistory([]);
    } finally {
      setHistoryLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    // Reset selection if role or branch changes
    if (e.target.name === 'targetRole' || e.target.name === 'targetBranch') {
      setSelectedUserIds([]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        ...formData,
        targetUserIds: isSpecificTargeting ? selectedUserIds : undefined,
      };

      if (isSpecificTargeting && selectedUserIds.length === 0) {
        toast.error('Please select at least one user');
        setLoading(false);
        return;
      }

      const response = await apiClient.post(API_ENDPOINTS.NOTIFICATIONS.SEND, payload);

      if (response.success) {
        let targetDesc = '';

        if (isSpecificTargeting) {
          targetDesc = `${selectedUserIds.length} specific users`;
        } else if (formData.targetRole === 'all') {
          targetDesc = formData.targetBranch === 'all'
            ? 'everyone (all roles, all branches)'
            : `everyone in ${branches.find(b => b._id === formData.targetBranch)?.name || 'selected branch'}`;
        } else if (formData.targetRole === 'branch_admin') {
          targetDesc = formData.targetBranch === 'all'
            ? 'all branch admins'
            : `branch admin of ${branches.find(b => b._id === formData.targetBranch)?.name || 'selected branch'}`;
        } else {
          targetDesc = formData.targetBranch === 'all'
            ? `all ${formData.targetRole}s (all branches)`
            : `${formData.targetRole}s in ${branches.find(b => b._id === formData.targetBranch)?.name || 'selected branch'}`;
        }

        toast.success(`✅ Notification sent to ${targetDesc}!`);
        setFormData({
          ...formData,
          title: '',
          message: '',
        });
        setSelectedUserIds([]);
        setIsSpecificTargeting(false);
        fetchHistory();
      } else {
        toast.error(`❌ Error: ${response.message || 'Failed to send'}`);
      }
    } catch (error) {
      console.error(error);
      toast.error('❌ Server Error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-8">

      {/* Send Notification Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
              <Bell className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <CardTitle>Super Admin Notification Center</CardTitle>
              <CardDescription>
                Send announcements and alerts to specific branches or all schools in the network.
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

              {/* Target Branch */}
              <div className="space-y-3">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                  Target Branch
                </label>
                <Dropdown
                  name="targetBranch"
                  value={formData.targetBranch}
                  onChange={handleChange}
                  options={[
                    { value: 'all', label: '🌍 All Branches (Global)' },
                    ...branches.map(b => ({ value: b._id, label: `🏢 ${b.name} (${b.code})` }))
                  ]}
                  icon={Building2}
                  placeholder={branchesLoading ? "Loading branches..." : "Select Branch"}
                  disabled={branchesLoading}
                />
              </div>

              {/* Target Role */}
              <div className="space-y-3">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                  Send To
                </label>
                <Dropdown
                  name="targetRole"
                  value={formData.targetRole}
                  onChange={handleChange}
                  options={TARGET_ROLES}
                  icon={Users}
                  placeholder="Select Role"
                />

                {/* Specific Targeting Toggle */}
                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="specificTarget"
                    checked={isSpecificTargeting}
                    onChange={(e) => setIsSpecificTargeting(e.target.checked)}
                    className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                  />
                  <label htmlFor="specificTarget" className="text-sm text-gray-600 dark:text-gray-400 cursor-pointer select-none">
                    Select specific people only
                  </label>
                </div>
              </div>
            </div>

            {/* Multi Select for Specific Users */}
            {isSpecificTargeting && (
              <div className="animate-in fade-in slide-in-from-top-2 duration-200">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1.5">
                  Select Recipients ({availableUsers.length} available)
                </label>
                <MultiSelectDropdown
                  options={availableUsers}
                  value={selectedUserIds}
                  onChange={(e) => setSelectedUserIds(e.target.value)}
                  placeholder={usersLoading ? "Loading users..." : "Search and select users..."}
                  disabled={usersLoading}
                />
                {usersLoading && <p className="text-xs text-muted-foreground mt-1">Fetching users...</p>}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Notification Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1.5">
                  Type
                </label>
                <Dropdown
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  options={NOTIFICATION_TYPES}
                  icon={Megaphone}
                  placeholder="Select Type"
                />
              </div>

              {/* Title */}
              <div className="md:col-span-2">
                <Input
                  label="Subject / Title"
                  type="text"
                  name="title"
                  required
                  placeholder="e.g. Important School Announcement"
                  value={formData.title}
                  onChange={handleChange}
                  icon={Type}
                />
              </div>
            </div>

            {/* Message */}
            <Textarea
              label="Message Content"
              name="message"
              required
              rows={5}
              placeholder="Type your message here..."
              value={formData.message}
              onChange={handleChange}
            />

            <div className="pt-4 flex justify-end gap-3 border-t dark:border-gray-800">
              <Button type="button" variant="outline" onClick={() => router.back()}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? <ButtonLoader /> : (
                  <>
                    <Bell className="w-4 h-4 mr-2" />
                    {isSpecificTargeting
                      ? `Send to ${selectedUserIds.length} Users`
                      : formData.targetRole === 'all'
                        ? (formData.targetBranch === 'all'
                          ? 'Broadcast to Everyone (All Branches)'
                          : 'Send to Everyone in Branch')
                        : formData.targetRole === 'branch_admin'
                          ? (formData.targetBranch === 'all'
                            ? 'Send to All Branch Admins'
                            : 'Send to Branch Admin')
                          : (formData.targetBranch === 'all'
                            ? `Broadcast to All ${formData.targetRole}s`
                            : `Send to ${formData.targetRole}s in Branch`)}
                  </>
                )}
              </Button>
            </div>

          </form>
        </CardContent>
      </Card>

      {/* History Section */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold flex items-center gap-2 text-gray-800 dark:text-gray-200">
          <History className="w-5 h-5" />
          Recent Campaigns
        </h3>

        {historyLoading ? (
          <div className="text-center py-8 text-gray-500">Loading history...</div>
        ) : !Array.isArray(history) || history.length === 0 ? (
          <div className="text-center py-8 text-gray-500 bg-gray-50 dark:bg-gray-800 rounded-lg">
            No notifications sent recently.
          </div>
        ) : (
          <div className="grid gap-4">
            {history.map((item, index) => (
              <Card key={index} className="overflow-hidden hover:shadow-md transition-shadow">
                <div className="p-4 flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-700 capitalize`}>
                        {item.type || 'general'}
                      </span>
                      <span className="text-xs text-gray-500 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {new Date(item.createdAt).toLocaleString()}
                      </span>
                    </div>
                    <h4 className="font-semibold text-gray-900 dark:text-white">{item.title}</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-1">{item.message}</p>
                  </div>

                  <div className="flex items-center gap-6 text-sm text-gray-500">
                    <div className="text-right">
                      <p className="text-xs uppercase tracking-wider font-semibold">Recipients</p>
                      <p className="font-medium text-gray-900 dark:text-gray-100">{item.recipientCount || 0} Users</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs uppercase tracking-wider font-semibold">Status</p>
                      <div className="flex items-center justify-end gap-1 text-green-600">
                        <CheckCircle className="w-4 h-4" />
                        <span className="font-medium">Sent</span>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
