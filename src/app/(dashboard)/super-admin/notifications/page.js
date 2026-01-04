'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

// Notification Types List
const NOTIFICATION_TYPES = [
  { value: 'announcement', label: '📢 Announcement' },
  { value: 'general', label: 'ℹ️ General' },
  { value: 'fee_reminder', label: '💰 Fee Reminder' },
  { value: 'exam', label: '🎓 Exam Update' },
  { value: 'result', label: '📊 Result Declared' },
  { value: 'event', label: '🎉 Event' },
  { value: 'holiday', label: '🏖️ Holiday' },
];

export default function CreateNotification() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [branches, setBranches] = useState([]); // Branches list store karne ke liye
  const [status, setStatus] = useState({ type: '', message: '' });

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    message: '',
    type: 'announcement',
    targetRole: 'student',
    targetBranch: 'all', // Default: Sabko bhejo
  });

  // 1. Page Load hote hi Branches fetch karo
  useEffect(() => {
    const fetchBranches = async () => {
      try {
        // Humne jo API banayi thi dropdown ke liye
        const res = await fetch('/api/branches?type=dropdown');
        const data = await res.json();
        if (data.success) {
          setBranches(data.branches);
        }
      } catch (error) {
        console.error('Failed to fetch branches:', error);
      }
    };
    fetchBranches();
  }, []);

  // Handle Input Change
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handle Submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus({ type: '', message: '' });

    try {
      const response = await fetch('/api/notification/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        setStatus({ type: 'success', message: `✅ Success! ${data.message}` });
        // Form Reset
        setFormData({
          title: '',
          message: '',
          type: 'announcement',
          targetRole: 'student',
          targetBranch: 'all',
        });
      } else {
        setStatus({ type: 'error', message: `❌ Error: ${data.message || 'Failed to send'}` });
      }
    } catch (error) {
      console.error(error);
      setStatus({ type: 'error', message: '❌ Server Error. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      
      {/* Page Header */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-6">
        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          📢 Create Broadcast Notification
        </h1>
        <p className="text-gray-500 mt-1 text-sm">
          Super Admins can send push notifications to specific branches or the entire school network.
        </p>
      </div>

      {/* Status Message */}
      {status.message && (
        <div className={`p-4 mb-6 rounded-lg text-sm font-medium animate-fade-in ${
          status.type === 'success' 
            ? 'bg-green-50 text-green-700 border border-green-200' 
            : 'bg-red-50 text-red-700 border border-red-200'
        }`}>
          {status.message}
        </div>
      )}

      {/* Main Form */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
        <div className="p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* ROW 1: Target Audience & Branch */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              
              {/* Target Branch Selector (Most Important for Super Admin) */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Select Branch <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <select
                    name="targetBranch"
                    value={formData.targetBranch}
                    onChange={handleChange}
                    className="w-full p-3 pl-4 border border-gray-300 rounded-lg bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all cursor-pointer appearance-none"
                  >
                    <option value="all" className="font-bold text-blue-600">🌍 All Branches (Global)</option>
                    <option disabled>──────────────</option>
                    {branches.length > 0 ? (
                      branches.map((branch) => (
                        <option key={branch._id} value={branch._id}>
                          🏢 {branch.name} ({branch.code})
                        </option>
                      ))
                    ) : (
                      <option disabled>Loading branches...</option>
                    )}
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                    <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                  </div>
                </div>
                <p className="text-xs text-gray-400 mt-2">
                  Choose 'All Branches' to send to everyone in the system.
                </p>
              </div>

              {/* Target Role Selector */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Recipient Role <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <select
                    name="targetRole"
                    value={formData.targetRole}
                    onChange={handleChange}
                    className="w-full p-3 pl-4 border border-gray-300 rounded-lg bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all cursor-pointer appearance-none"
                  >
                    <option value="student">👨‍🎓 Students</option>
                    <option value="parent">👨‍👩‍👦 Parents</option>
                    <option value="teacher">👩‍🏫 Teachers</option>
                    <option value="staff">💼 Staff</option>
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                     <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                  </div>
                </div>
              </div>
            </div>

            <hr className="border-gray-100" />

            {/* ROW 2: Type & Title */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* Type */}
              <div className="md:col-span-1">
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Notification Type
                </label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  {NOTIFICATION_TYPES.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Title */}
              <div className="md:col-span-2">
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Title / Subject <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="title"
                  required
                  placeholder="e.g. Winter Vacation Announcement"
                  value={formData.title}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none placeholder-gray-400"
                />
              </div>
            </div>

            {/* Message Area */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Message Body <span className="text-red-500">*</span>
              </label>
              <textarea
                name="message"
                required
                rows="5"
                placeholder="Type the full details of the notification here..."
                value={formData.message}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none resize-none placeholder-gray-400"
              ></textarea>
              <div className="flex justify-between mt-2 text-xs text-gray-400">
                 <span>This message will appear in the app and as a push notification.</span>
                 <span>{formData.message.length} characters</span>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-4 flex items-center justify-end gap-4">
              <button
                type="button"
                onClick={() => router.back()} // Or reset form
                className="px-6 py-3 text-sm font-medium text-gray-600 hover:text-gray-800 transition"
              >
                Cancel
              </button>
              
              <button
                type="submit"
                disabled={loading}
                className={`flex items-center gap-2 px-8 py-3 text-white text-sm font-bold rounded-lg shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5
                  ${loading ? 'bg-blue-400 cursor-not-allowed' : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700'}
                `}
              >
                {loading ? (
                  <>
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Sending...
                  </>
                ) : (
                  <>
                    🚀 Send Notification
                  </>
                )}
              </button>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
}