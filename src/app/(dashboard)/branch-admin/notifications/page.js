'use client';

import { useState } from 'react';
// Agar aapne koi Layout component alag se nahi lagaya to ye page dashboard k andar render hoga

const NOTIFICATION_TYPES = [
  { value: 'announcement', label: '📢 Announcement' },
  { value: 'general', label: 'ℹ️ General' },
  { value: 'assignment', label: '📝 Assignment' },
  { value: 'fee_reminder', label: '💰 Fee Reminder' },
  { value: 'exam', label: '🎓 Exam Update' },
  { value: 'result', label: '📊 Result Declared' },
  { value: 'event', label: '🎉 Event' },
  { value: 'leave', label: '✈️ Leave Status' },
];

export default function SendNotificationPage() {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState({ type: '', message: '' });

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    message: '',
    type: 'announcement',
    targetRole: 'student',
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus({ type: '', message: '' });

    try {
      // ✅ API Route jo humne banaya tha
      const response = await fetch('/api/notification/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        setStatus({ type: 'success', message: `✅ Sent successfully to ${data.message || 'users'}` });
        // Form Reset
        setFormData({
          title: '',
          message: '',
          type: 'announcement',
          targetRole: 'student',
        });
      } else {
        setStatus({ type: 'error', message: `❌ Error: ${data.message || 'Failed to send'}` });
      }
    } catch (error) {
      console.error(error);
      setStatus({ type: 'error', message: '❌ Server Connection Error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-sm border border-gray-200 m-4 max-w-4xl mx-auto">
      
      {/* Header */}
      <div className="mb-6 border-b pb-4">
        <h1 className="text-2xl font-bold text-gray-800">Create Notification</h1>
        <p className="text-sm text-gray-500 mt-1">
          Send push notifications to mobile app users.
        </p>
      </div>

      {/* Status Alert */}
      {status.message && (
        <div className={`p-4 mb-6 rounded-md text-sm font-medium ${
          status.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'
        }`}>
          {status.message}
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Target Audience */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Send To</label>
            <select
              name="targetRole"
              value={formData.targetRole}
              onChange={handleChange}
              className="w-full p-2.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
            >
              <option value="student">Students</option>
              <option value="parent">Parents</option>
              <option value="teacher">Teachers</option>
              <option value="staff">Staff</option>
            </select>
          </div>

          {/* Notification Type */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Type</label>
            <select
              name="type"
              value={formData.type}
              onChange={handleChange}
              className="w-full p-2.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
            >
              {NOTIFICATION_TYPES.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Title */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Title</label>
          <input
            type="text"
            name="title"
            required
            placeholder="e.g. Winter Vacation Announcement"
            value={formData.title}
            onChange={handleChange}
            className="w-full p-2.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
          />
        </div>

        {/* Message */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Message</label>
          <textarea
            name="message"
            required
            rows="5"
            placeholder="Type your detailed notification message here..."
            value={formData.message}
            onChange={handleChange}
            className="w-full p-2.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition resize-none"
          ></textarea>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end pt-4">
          <button
            type="submit"
            disabled={loading}
            className={`px-6 py-2.5 text-white text-sm font-medium rounded-md shadow-sm transition-all
              ${loading ? 'bg-indigo-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700 hover:shadow'}
            `}
          >
            {loading ? 'Sending...' : 'Send Notification'}
          </button>
        </div>
      </form>
    </div>
  );
}