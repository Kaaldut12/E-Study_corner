// frontend/src/components/common/AttendanceWidget.jsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';

const AttendanceWidget = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    todayStatus: null,
    todayRecord: null,
    currentStreak: 0,
    totalPresent: 0,
    attendancePercentage: 95,
    recentLogs: []
  });
  const [loading, setLoading] = useState(true);
  const [checkingIn, setCheckingIn] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState('');

  const role = user?.role || 'student';
  const leaveRoute = role === 'teacher' ? '/teacher/leave' : '/student/leave';

  const fetchAttendance = async () => {
    try {
      const res = await api.get('/attendance/status');
      if (res.data.success && res.data.stats) {
        setStats(res.data.stats);
      }
    } catch (err) {
      console.warn('Failed to load attendance status:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendance();
  }, []);

  const handleCheckIn = async () => {
    setCheckingIn(true);
    setFeedbackMsg('');
    try {
      const res = await api.post('/attendance/check-in', {
        notes: 'Dashboard daily check-in'
      });
      if (res.data.success) {
        setStats(res.data.stats);
        setFeedbackMsg(res.data.message || 'Marked Present for Today!');
        setTimeout(() => setFeedbackMsg(''), 4000);
      }
    } catch (err) {
      setFeedbackMsg(err.response?.data?.message || 'Error checking in. Please try again.');
      setTimeout(() => setFeedbackMsg(''), 4000);
    } finally {
      setCheckingIn(false);
    }
  };

  const todayFormatted = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  const isCheckedInToday = stats.todayStatus === 'present';

  return (
    <>
      <div className="glass-panel p-5 sm:p-6 rounded-3xl border border-slate-800 relative overflow-hidden bg-gradient-to-br from-slate-900/90 via-slate-900/70 to-indigo-950/20 shadow-xl">
        {/* Decorative ambient background */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl -z-10 pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          {/* Left Column: Date & Attendance Status */}
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-400 bg-indigo-500/10 px-2.5 py-0.5 rounded-full border border-indigo-500/20">
                Daily Attendance
              </span>
              <span className="text-xs text-slate-400 font-medium">
                📅 {todayFormatted}
              </span>
            </div>

            <div className="flex items-center gap-3">
              {isCheckedInToday ? (
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-emerald-400 animate-ping"></span>
                  <h2 className="text-lg sm:text-xl font-black text-white flex items-center gap-2">
                    <span className="text-emerald-400">✓ Present Today</span>
                    <span className="text-xs text-slate-400 font-normal">
                      (Checked in at {stats.todayRecord?.checkInTime || '09:00 AM'})
                    </span>
                  </h2>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse"></span>
                  <h2 className="text-lg sm:text-xl font-black text-white">
                    Attendance Not Marked Yet
                  </h2>
                </div>
              )}
            </div>

            <p className="text-xs text-slate-400 max-w-lg">
              {isCheckedInToday
                ? 'Your attendance has been recorded for today. Great job keeping your streak active!'
                : 'Click the button below to confirm your presence for today and keep your academic streak alive.'}
            </p>

            {feedbackMsg && (
              <div className="text-xs font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-xl inline-block">
                {feedbackMsg}
              </div>
            )}
          </div>

          {/* Right Column: Actions & Quick Stats */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            {/* Streak & Rate Badges */}
            <div className="flex items-center gap-2 bg-slate-950/60 p-2.5 rounded-2xl border border-slate-800 shrink-0">
              <div className="px-3 py-1 bg-amber-500/10 rounded-xl border border-amber-500/20 text-center">
                <span className="text-[10px] text-slate-400 block font-semibold uppercase">Streak</span>
                <span className="text-sm font-black text-amber-400 flex items-center justify-center gap-1">
                  🔥 {stats.currentStreak || 1}d
                </span>
              </div>
              <div className="px-3 py-1 bg-emerald-500/10 rounded-xl border border-emerald-500/20 text-center">
                <span className="text-[10px] text-slate-400 block font-semibold uppercase">Rate</span>
                <span className="text-sm font-black text-emerald-400">
                  {stats.attendancePercentage}%
                </span>
              </div>
            </div>

            {/* Check-In Action Button */}
            {!isCheckedInToday ? (
              <button
                onClick={handleCheckIn}
                disabled={checkingIn || loading}
                className="py-3 px-5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-black rounded-2xl shadow-lg shadow-emerald-600/30 hover:scale-[1.02] active:scale-[0.98] transition flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {checkingIn ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Recording Check-in...</span>
                  </>
                ) : (
                  <>
                    <span>✓</span>
                    <span>Mark Present for Today</span>
                  </>
                )}
              </button>
            ) : (
              <div className="py-2.5 px-4 bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 text-xs font-bold rounded-2xl flex items-center justify-center gap-2">
                <span>✓</span>
                <span>Marked for Today</span>
              </div>
            )}

            {/* History & Leave Links */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowHistoryModal(true)}
                className="py-2.5 px-3 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-750 text-xs font-semibold rounded-2xl transition"
                title="View previous attendance logs"
              >
                📜 Logs
              </button>
              <Link
                to={leaveRoute}
                className="py-2.5 px-3.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 hover:text-rose-200 border border-rose-500/25 text-xs font-bold rounded-2xl transition flex items-center gap-1.5 whitespace-nowrap"
              >
                <span>Apply for Leave →</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Attendance History Modal */}
      {showHistoryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="glass-panel p-6 rounded-3xl border border-slate-800 max-w-lg w-full space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400">Records Archive</span>
                <h3 className="text-lg font-black text-white">Recent Attendance Logs</h3>
              </div>
              <button
                onClick={() => setShowHistoryModal(false)}
                className="p-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white transition"
              >
                ✕
              </button>
            </div>

            <div className="max-h-80 overflow-y-auto space-y-2.5 pr-1">
              {stats.recentLogs && stats.recentLogs.length > 0 ? (
                stats.recentLogs.map((log) => (
                  <div
                    key={log.id || log.date}
                    className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center justify-between text-xs"
                  >
                    <div className="space-y-0.5">
                      <span className="font-bold text-white block">
                        {new Date(log.date + 'T00:00:00').toLocaleDateString('en-US', {
                          weekday: 'short',
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </span>
                      <span className="text-[11px] text-slate-400">
                        Punched at: <strong className="text-slate-200">{log.checkInTime || '09:00 AM'}</strong>
                      </span>
                    </div>

                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        log.status === 'present'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                      }`}
                    >
                      {log.status === 'present' ? '✓ Present' : log.status}
                    </span>
                  </div>
                ))
              ) : (
                <div className="py-8 text-center text-slate-400 text-xs">
                  No attendance records logged yet. Check in today to start your archive!
                </div>
              )}
            </div>

            <div className="border-t border-slate-800 pt-3 flex items-center justify-between text-xs">
              <span className="text-slate-400">
                Monthly Attendance: <strong className="text-emerald-400">{stats.attendancePercentage}%</strong>
              </span>
              <button
                onClick={() => setShowHistoryModal(false)}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AttendanceWidget;
