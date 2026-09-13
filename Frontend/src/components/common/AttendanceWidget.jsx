import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, CheckCircle2, Flame, History, X, ArrowRight } from 'lucide-react';
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
  const isAdmin = role === 'admin' || role === 'superadmin';
  const leaveRoute = isAdmin ? '/admin/leaves' : role === 'teacher' ? '/teacher/leave' : '/student/leave';
  const attendanceRoute = isAdmin ? '/admin/attendance' : role === 'teacher' ? '/teacher/attendance' : '/student/attendance';

  const fetchAttendance = async () => {
    try {
      const res = await api.get('/attendance/status');
      if (res.data?.success && res.data.stats) {
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
      if (res.data?.success) {
        setStats(res.data.stats);
        setFeedbackMsg(res.data.message || 'Marked Present for Today!');
        setTimeout(() => setFeedbackMsg(''), 4000);
      }
    } catch (err) {
      const msg = err.parsedMessage || err.response?.data?.message || 'Error checking in. Please try again.';
      setFeedbackMsg(msg);
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
      <div className="glass-panel glass-card-accent p-6 sm:p-7 rounded-3xl relative overflow-hidden shadow-2xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          {/* Left Column: Date & Attendance Status */}
          <div className="space-y-2.5">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="text-[11px] font-extrabold uppercase tracking-widest text-indigo-600 dark:text-indigo-400 bg-brand-subtle px-3 py-1 rounded-full border border-brand font-display">
                Daily Attendance Check-In
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <span>{todayFormatted}</span>
              </span>
            </div>

            <div className="flex items-center gap-3">
              {isCheckedInToday ? (
                <div className="flex items-center gap-2.5">
                  <span className="relative flex h-3.5 w-3.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500" />
                  </span>
                  <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2 font-display">
                    <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                      <CheckCircle2 className="w-5 h-5" />
                      Present for Today
                    </span>
                    <span className="text-xs text-slate-500 dark:text-slate-400 font-normal font-sans">
                      (Checked in at {stats.todayRecord?.checkInTime || '09:00 AM'})
                    </span>
                  </h2>
                </div>
              ) : (
                <div className="flex items-center gap-2.5">
                  <span className="w-3 h-3 rounded-full bg-amber-400 animate-pulse" />
                  <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white font-display">
                    Attendance Not Marked Yet
                  </h2>
                </div>
              )}
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-400 max-w-lg leading-relaxed">
              {isCheckedInToday
                ? 'Your attendance has been recorded for today. Great job keeping your academic streak active!'
                : 'Click the button below to confirm your presence for today and keep your academic streak alive.'}
            </p>

            {feedbackMsg && (
              <div className="text-xs font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/30 px-3.5 py-1.5 rounded-xl inline-flex items-center gap-1.5 animate-fade-in shadow-xs">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>{feedbackMsg}</span>
              </div>
            )}
          </div>

          {/* Right Column: Actions & Quick Stats */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5">
            {/* Streak & Rate Badges */}
            <div className="flex items-center gap-2.5 bg-slate-100 dark:bg-slate-950/70 p-2.5 rounded-2xl border border-slate-200 dark:border-slate-800/80 shrink-0">
              <div className="px-3.5 py-1.5 bg-amber-50 dark:bg-amber-500/10 rounded-xl border border-amber-200 dark:border-amber-500/20 text-center">
                <span className="text-[10px] text-slate-500 dark:text-slate-400 block font-bold uppercase tracking-wider font-display">Streak</span>
                <span className="text-base font-black text-amber-600 dark:text-amber-400 flex items-center justify-center gap-1 font-display">
                  <Flame className="w-4 h-4 fill-amber-500 text-amber-500" />
                  <span>{stats.currentStreak || 1}d</span>
                </span>
              </div>
              <div className="px-3.5 py-1.5 bg-emerald-50 dark:bg-emerald-500/10 rounded-xl border border-emerald-200 dark:border-emerald-500/20 text-center">
                <span className="text-[10px] text-slate-500 dark:text-slate-400 block font-bold uppercase tracking-wider font-display">Rate</span>
                <span className="text-base font-black text-emerald-600 dark:text-emerald-400 font-display">
                  {stats.attendancePercentage}%
                </span>
              </div>
            </div>

            {/* Check-In Action Button */}
            {!isCheckedInToday ? (
              <button
                type="button"
                onClick={handleCheckIn}
                disabled={checkingIn || loading}
                className="py-3 px-5 btn-dashboard-emerald text-white text-xs font-black rounded-2xl flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
              >
                {checkingIn ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Recording Check-in...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Mark Present Today</span>
                  </>
                )}
              </button>
            ) : (
              <div className="attendance-status-badge py-3 px-5 text-xs font-bold rounded-2xl flex items-center justify-center gap-2 shadow-xs">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span>Marked for Today</span>
              </div>
            )}

            {/* History & Leave Links */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowHistoryModal(true)}
                className="theme-neutral-control py-3 px-3.5 text-xs font-bold rounded-2xl transition flex items-center gap-1.5 cursor-pointer"
                title="View previous attendance logs"
              >
                <History className="w-3.5 h-3.5 text-slate-400" />
                <span>Logs</span>
              </button>
              <Link
                to={leaveRoute}
                className="py-3 px-4 bg-rose-50 hover:bg-rose-100 dark:bg-rose-500/10 dark:hover:bg-rose-500/20 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-500/30 text-xs font-bold rounded-2xl transition flex items-center gap-1.5 whitespace-nowrap shadow-xs"
              >
                <span>{isAdmin ? 'Campus Leaves' : role === 'teacher' ? 'Faculty Leaves' : 'Apply for Leave'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Attendance History Modal */}
      {showHistoryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
          <div className="glass-panel p-6 sm:p-7 rounded-3xl border border-slate-200 dark:border-slate-800 max-w-lg w-full space-y-4 shadow-2xl bg-white dark:bg-slate-900">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800/80 pb-3">
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-indigo-600 dark:text-indigo-400 font-display">Records Archive</span>
                <h3 className="text-lg font-black text-slate-900 dark:text-white font-display">Recent Attendance Logs</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowHistoryModal(false)}
                className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="max-h-80 overflow-y-auto space-y-2.5 pr-1">
              {stats.recentLogs && stats.recentLogs.length > 0 ? (
                stats.recentLogs.map((log) => (
                  <div
                    key={log.id || log.date}
                    className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs"
                  >
                    <div className="space-y-0.5">
                      <span className="font-bold text-slate-900 dark:text-white block">
                        {new Date(log.date + 'T00:00:00').toLocaleDateString('en-US', {
                          weekday: 'short',
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </span>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400">
                        Punched at: <strong className="text-slate-800 dark:text-slate-200">{log.checkInTime || '09:00 AM'}</strong>
                      </span>
                    </div>

                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase inline-flex items-center gap-1 ${
                        log.status === 'present'
                          ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20'
                          : 'bg-rose-500/10 text-rose-700 dark:text-rose-400 border border-rose-500/20'
                      }`}
                    >
                      {log.status === 'present' && <CheckCircle2 className="w-3 h-3" />}
                      {log.status === 'present' ? 'Present' : log.status}
                    </span>
                  </div>
                ))
              ) : (
                <div className="py-8 text-center text-slate-500 dark:text-slate-400 text-xs">
                  No attendance records logged yet. Check in today to start your archive.
                </div>
              )}
            </div>

            <div className="border-t border-slate-200 dark:border-slate-800/80 pt-3 flex items-center justify-between gap-2 text-xs flex-wrap">
              <span className="text-slate-600 dark:text-slate-400">
                Monthly Attendance: <strong className="text-emerald-600 dark:text-emerald-400 font-bold">{stats.attendancePercentage}%</strong>
              </span>
              <div className="flex items-center gap-2">
                <Link
                  to={attendanceRoute}
                  onClick={() => setShowHistoryModal(false)}
                  className="px-4 py-2 bg-brand text-white hover:opacity-90 rounded-xl font-bold text-xs shadow-xs transition"
                >
                  Full Attendance Matrix →
                </Link>
                <button
                  type="button"
                  onClick={() => setShowHistoryModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-200 rounded-xl font-bold text-xs transition cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AttendanceWidget;
