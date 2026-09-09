// frontend/src/components/common/NotificationMarquee.jsx
import { useEffect, useState } from 'react';
import axios from 'axios';

const NotificationMarquee = () => {
  const [notifications, setNotifications] = useState([]);
  const [isPaused, setIsPaused] = useState(false);
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
          { id: '1', notiMessage: '📢 Welcome to E-Study Corner (Smart Learning Pathashala) - Academic Session 2024-25!' },
          { id: '2', notiMessage: '📝 Major Project & Semester submissions are now active for all student departments.' },
          { id: '3', notiMessage: '📚 100+ Free Course Notes and Study Materials uploaded for all engineering & degree streams.' }
        ]);
      }
    };

    fetchNotifications();
  }, [API_URL]);

  if (notifications.length === 0) return null;

  return (
    <div className="bg-slate-900/90 border-b border-indigo-500/20 py-2 px-4 flex items-center text-xs font-medium text-slate-200 overflow-hidden select-none">
      {/* Notice Tag + Pause/Resume Accessible Control */}
      <div className="flex items-center gap-2 shrink-0 mr-4">
        <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-rose-500/20 text-rose-400 font-bold tracking-wider uppercase text-[10px] border border-rose-500/30">
          <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping"></span>
          Notice
        </div>
        <button
          type="button"
          onClick={() => setIsPaused(!isPaused)}
          className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-800 text-slate-300 hover:text-white border border-slate-700 transition flex items-center gap-1"
          title={isPaused ? 'Resume scrolling' : 'Pause scrolling to read'}
          aria-label={isPaused ? 'Resume notice scrolling' : 'Pause notice scrolling'}
        >
          <span>{isPaused ? '▶️ Resume' : '⏸️ Pause'}</span>
        </button>
      </div>

      {/* Slow, Comfortable Scrolling Ticker with Hover Pause */}
      <div
        className="overflow-hidden w-full whitespace-nowrap relative cursor-default"
        title="Hover to pause notice"
      >
        <div className={`inline-block animate-marquee whitespace-nowrap ${isPaused ? 'paused' : ''}`}>
          {[...notifications, ...notifications].map((n, idx) => (
            <span key={`${n.id || 'noti'}-${idx}`} className="inline-flex items-center gap-2 mr-16 text-slate-300 text-xs">
              <span className="text-indigo-400 font-bold">•</span>
              <span className="hover:text-white transition-colors">{n.notiMessage}</span>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default NotificationMarquee;
