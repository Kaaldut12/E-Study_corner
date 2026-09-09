// frontend/src/pages/Student/NotificationsFeed.jsx
import { useState, useEffect } from 'react';
import SidebarLayout from '../../components/common/SidebarLayout';
import { useAuth } from '../../contexts/AuthContext';

const NotificationsFeed = () => {
  const { apiUrl } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`${apiUrl}/student/notifications`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        if (data.success) {
          setNotifications(data.notifications);
        }
      } catch (err) {
        console.warn('Error fetching notifications:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, [apiUrl]);

  return (
    <SidebarLayout>
      <div className="space-y-6 max-w-4xl mx-auto">
        {/* Header Banner */}
        <div className="glass-panel p-6 rounded-3xl border border-slate-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-rose-400">Academics & Feed</span>
            <h1 className="text-2xl font-black text-white">Notice Board & Campus Notifications</h1>
            <p className="text-xs text-slate-400 mt-1">
              Official announcements, examination schedules, workshop alerts, and project deadlines.
            </p>
          </div>
        </div>

        {/* Notifications Feed */}
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 border-4 border-rose-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : notifications.length === 0 ? (
          <div className="glass-panel p-12 rounded-3xl border border-slate-800 text-center space-y-3">
            <div className="text-4xl">📢</div>
            <h3 className="text-lg font-bold text-white">No notifications at this time</h3>
            <p className="text-xs text-slate-400">New campus announcements published by administrators will appear here.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {notifications.map((noti) => (
              <div key={noti.id || noti._id} className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-3 relative group hover:border-slate-700 transition">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping"></span>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-rose-400">Official Notice</span>
                  </div>
                  <span className="text-[10px] text-slate-500">
                    {new Date(noti.notiDt || noti.createdAt).toLocaleDateString()}
                  </span>
                </div>

                <p className="text-sm text-white font-medium leading-relaxed">
                  {noti.notiMessage}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </SidebarLayout>
  );
};

export default NotificationsFeed;
