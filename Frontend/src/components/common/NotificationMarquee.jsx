import { useEffect, useState } from 'react';
import publicService from '../../services/publicService';

const NotificationMarquee = () => {
  const [notifications, setNotifications] = useState([]);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const res = await publicService.getNotifications();
        if (res.success) {
          setNotifications(res.notifications || []);
        }
      } catch (err) {
        console.warn('Marquee notifications fetch error:', err);
      }
    };

    fetchNotifications();
  }, []);

  if (notifications.length === 0) return null;

  return (
    <div className="notice-marquee bg-slate-900/90 border-b border-indigo-500/20 py-2 px-4 flex items-center text-xs font-medium text-slate-200 overflow-hidden select-none">
      {/* Notice Tag + Pause/Resume Accessible Control */}
      <div className="flex items-center gap-2 shrink-0 mr-4">
        <div className="notice-marquee__label flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-rose-500/20 text-rose-400 font-bold tracking-wider uppercase text-[10px] border border-rose-500/30">
          <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping"></span>
          Notice
        </div>
        <button
          type="button"
          onClick={() => setIsPaused(!isPaused)}
          className="notice-marquee__pause px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-800 text-slate-300 hover:text-white border border-slate-700 transition flex items-center gap-1"
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
            <span key={`${n.id || 'noti'}-${idx}`} className="notice-marquee__item inline-flex items-center gap-2 mr-16 text-slate-300 text-xs">
              <span className="notice-marquee__dot text-indigo-400 font-bold">•</span>
              <span className="hover:text-white transition-colors">{n.notiMessage}</span>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default NotificationMarquee;
