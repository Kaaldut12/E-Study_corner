// frontend/src/components/common/NotificationMarquee.jsx
import { useEffect, useState } from 'react';
import axios from 'axios';

const NotificationMarquee = () => {
  const [notifications, setNotifications] = useState([]);
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const res = await axios.get(`${API_URL}/public/notifications`);
        if (res.data.success) {
          setNotifications(res.data.notifications);
        }
      } catch (err) {
        console.warn('Marquee notifications fetch offline fallback:', err);
        setNotifications([
          { id: '1', notiMessage: '📢 Welcome to E-Study Corner (Smart Learning Pathashala) - Government Polytechnic Aurai session 2024!' },
          { id: '2', notiMessage: '📝 Major Project submissions for CS/IT Diploma are now active.' },
          { id: '3', notiMessage: '📚 100+ Free Course Notes and Study Materials uploaded for Computer Science & Engineering.' }
        ]);
      }
    };

    fetchNotifications();
  }, [API_URL]);

  if (notifications.length === 0) return null;

  return (
    <div className="bg-slate-900 border-b border-indigo-500/20 py-2 px-4 flex items-center text-xs font-medium text-slate-200 overflow-hidden select-none">
      <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-rose-500/20 text-rose-400 font-bold tracking-wider uppercase text-[10px] shrink-0 mr-3 border border-rose-500/30">
        <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping"></span>
        Notice
      </div>

      <div className="overflow-hidden w-full whitespace-nowrap relative">
        <div className="inline-block animate-marquee hover:pause whitespace-nowrap">
          {notifications.map((n, idx) => (
            <span key={n.id || idx} className="inline-flex items-center gap-2 mr-10 text-slate-300">
              <span className="text-indigo-400 font-semibold">•</span>
              <span>{n.notiMessage}</span>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default NotificationMarquee;
