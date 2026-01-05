'use client';
import { useState, useEffect, useRef } from 'react';
import { Bell } from 'lucide-react'; 
import { useAuth } from '@/hooks/useAuth'; 
// import { API_ENDPOINTS } from '@/constants/api-endpoints';


export default function NotificationBell() {
  const { user } = useAuth(); // ✅ User data seedha Context se liya (No LocalStorage needed for user)
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const fetchNotis = async () => {
    // Agar user load nahi hua ya login nahi hai, to return ho jao
    if (!user || !user._id) {
        // Fallback: Agar context me id na ho (rare case), to id dhundo
        // user.id ya user._id dono check kar rahe hain
        return;
    }

    const userId = user._id || user.id;
    
    // Token hum localStorage se utha lenge (Kyunki Login ne 'accessToken' save kiya tha)
    const token = localStorage.getItem('accessToken') || localStorage.getItem('token');

    try {
      const res = await fetch(`/api/notifications/web-notifications?userId=${userId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (data.success) {
        setNotifications(data.data.notifications);
        setUnreadCount(data.data.unreadCount);
      }
    } catch (err) {
      console.error("Notification Fetch Error:", err);
    }
  };

  // ✅ Dependency Array me 'user' daal diya
  // Jaise hi Login complete hoga aur 'user' milega, ye fetch karega
  useEffect(() => {
    if (user) {
      fetchNotis();
      
      // Polling: Har 15 second me refresh
      const interval = setInterval(fetchNotis, 15000);
      return () => clearInterval(interval);
    }
  }, [user]); // <-- Jab user change hoga tab chalega

  // Click outside logic
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      {/* 🔔 Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-md hover:bg-gray-100 transition-colors focus:outline-none"
      >
        <Bell className="h-5 w-5 text-gray-600" />
        
        {/* Red Badge */}
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500 border border-white"></span>
          </span>
        )}
      </button>

      {/* 📜 Dropdown List */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white border border-gray-200 rounded-lg shadow-xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
          
          <div className="p-3 bg-gray-50 border-b flex justify-between items-center">
            <h3 className="font-semibold text-sm text-gray-700">Notifications</h3>
            <button className="text-xs text-blue-600 hover:underline" onClick={fetchNotis}>Refresh</button>
          </div>

          <div className="max-h-[350px] overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-gray-500 text-sm flex flex-col items-center">
                <Bell className="h-8 w-8 text-gray-300 mb-2" />
                No new notifications
              </div>
            ) : (
              notifications.map((n) => (
                <div key={n._id} className={`p-3 border-b hover:bg-gray-50 transition-colors cursor-pointer ${!n.isRead ? 'bg-blue-50/50' : ''}`}>
                  <div className="flex justify-between items-start mb-1">
                    <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium uppercase tracking-wider 
                      ${n.type === 'announcement' ? 'bg-purple-100 text-purple-700' : 
                        n.type === 'fee_reminder' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}`}>
                      {n.type?.replace('_', ' ') || 'General'}
                    </span>
                    <span className="text-[10px] text-gray-400">
                      {new Date(n.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <h4 className="text-sm font-medium text-gray-800 leading-tight mb-1">{n.title}</h4>
                  <p className="text-xs text-gray-500 line-clamp-2">{n.message}</p>
                </div>
              ))
            )}
          </div>
          
          <div className="p-2 border-t bg-gray-50 text-center">
            <button className="text-xs font-medium text-blue-600 hover:text-blue-800 transition">
              View All History
            </button>
          </div>
        </div>
      )}
    </div>
  );
}