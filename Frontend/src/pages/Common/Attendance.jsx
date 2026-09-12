// frontend/src/pages/Common/Attendance.jsx
import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  CalendarCheck,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Flame,
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Filter,
  Search,
  Users,
  ShieldCheck,
  Check,
  X,
  RefreshCw,
  Award
} from 'lucide-react';
import SidebarLayout from '../../components/common/SidebarLayout';
import { SkeletonCardList } from '../../components/common/SkeletonLoader';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';

const DAYS_OF_WEEK = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const getTodayString = () => new Date().toISOString().split('T')[0];

const Attendance = () => {
  const { user } = useAuth();
  const role = user?.role || 'student';
  const isFacultyOrAdmin = role === 'teacher' || role === 'admin' || role === 'superadmin';

  // Active Tab for Teachers/Admins: 'roster' | 'personal'
  const [activeTab, setActiveTab] = useState(isFacultyOrAdmin ? 'roster' : 'personal');

  // Student/Personal State
  const [stats, setStats] = useState({
    todayStatus: null,
    todayRecord: null,
    currentStreak: 0,
    totalPresent: 0,
    totalOnLeave: 0,
    totalAbsent: 0,
    attendancePercentage: 90,
    recentLogs: [],
    allLogs: []
  });
  const [personalLoading, setPersonalLoading] = useState(true);
  const [checkingIn, setCheckingIn] = useState(false);
  const [checkInNotes, setCheckInNotes] = useState('');

  // Calendar Navigation State
  const [calendarDate, setCalendarDate] = useState(new Date());

  // Personal Filter & Search
  const [logFilter, setLogFilter] = useState('all');
  const [logSearch, setLogSearch] = useState('');

  // Roster Management State (Teachers & Admins)
  const [rosterDate, setRosterDate] = useState(getTodayString());
  const [rosterData, setRosterData] = useState({
    totalCount: 0,
    presentCount: 0,
    lateCount: 0,
    onLeaveCount: 0,
    absentCount: 0,
    unmarkedCount: 0,
    roster: []
  });
  const [rosterLoading, setRosterLoading] = useState(false);
  const [rosterSearch, setRosterSearch] = useState('');
  const [rosterFilter, setRosterFilter] = useState('all');
  const [batchUpdating, setBatchUpdating] = useState(false);

  // Global Toast
  const [toast, setToast] = useState(null);
  const showToast = (message, isError = false) => {
    setToast({ message, isError });
    setTimeout(() => setToast(null), 4500);
  };

  // 1. Fetch Personal Attendance Stats
  const fetchPersonalStats = async (silent = false) => {
    if (!silent) setPersonalLoading(true);
    try {
      const res = await api.get('/attendance/status');
      if (res.data?.success && res.data.stats) {
        setStats(res.data.stats);
      }
    } catch (err) {
      console.warn('Failed to load attendance status:', err);
      const msg = err.parsedMessage || err.response?.data?.message || 'Could not load attendance stats';
      if (!silent) showToast(msg, true);
    } finally {
      if (!silent) setPersonalLoading(false);
    }
  };

  // 2. Fetch Classroom Roster Attendance (Faculty/Admin)
  const fetchRosterAttendance = async (dateParam = rosterDate) => {
    setRosterLoading(true);
    try {
      const res = await api.get(`/attendance/roster?date=${dateParam}`);
      if (res.data?.success) {
        setRosterData(res.data);
      }
    } catch (err) {
      console.warn('Failed to load roster attendance:', err);
      const msg = err.parsedMessage || err.response?.data?.message || 'Could not load classroom attendance';
      showToast(msg, true);
    } finally {
      setRosterLoading(false);
    }
  };

  useEffect(() => {
    fetchPersonalStats();
    if (isFacultyOrAdmin) {
      fetchRosterAttendance(rosterDate);
    }
  }, []);

  // Handle Daily Self Check-in
  const handleCheckIn = async (e) => {
    e?.preventDefault();
    setCheckingIn(true);
    try {
      const res = await api.post('/attendance/check-in', {
        notes: checkInNotes.trim() || 'Daily Portal Punch-In'
      });
      if (res.data?.success) {
        showToast(res.data.message || 'Checked in successfully!');
        setCheckInNotes('');
        setStats(res.data.stats || stats);
        fetchPersonalStats(true);
      }
    } catch (err) {
      const msg = err.parsedMessage || err.response?.data?.message || 'Check-in failed. Please try again.';
      showToast(msg, true);
    } finally {
      setCheckingIn(false);
    }
  };

  // Handle Single Student Override (Teacher)
  const handleMarkStudent = async (studentId, status, studentName = 'Student') => {
    try {
      const res = await api.post('/attendance/mark-student', {
        studentId,
        date: rosterDate,
        status,
        notes: `Marked by ${user?.name || 'Faculty'}`
      });
      if (res.data?.success) {
        showToast(`${studentName} marked as ${status}!`);
        fetchRosterAttendance(rosterDate);
      }
    } catch (err) {
      const msg = err.parsedMessage || err.response?.data?.message || 'Failed to update student attendance';
      showToast(msg, true);
    }
  };

  // Mark All Unmarked as Present
  const handleMarkAllPresent = async () => {
    const unmarked = rosterData.roster.filter((s) => s.status === 'unmarked');
    if (unmarked.length === 0) {
      showToast('All students have already been marked for today.');
      return;
    }

    setBatchUpdating(true);
    try {
      const records = unmarked.map((s) => ({
        studentId: s.id,
        status: 'present',
        notes: 'Classroom roll-call (Batch Present)'
      }));

      const res = await api.post('/attendance/mark-batch', {
        date: rosterDate,
        records
      });

      if (res.data?.success) {
        showToast(`Marked ${res.data.count} student(s) as Present!`);
        fetchRosterAttendance(rosterDate);
      }
    } catch (err) {
      const msg = err.parsedMessage || err.response?.data?.message || 'Batch update failed';
      showToast(msg, true);
    } finally {
      setBatchUpdating(false);
    }
  };

  // Calendar Generation Logic
  const calendarDays = useMemo(() => {
    const year = calendarDate.getFullYear();
    const month = calendarDate.getMonth();

    const firstDayIndex = new Date(year, month, 1).getDay();
    const totalDaysInMonth = new Date(year, month + 1, 0).getDate();

    const recordsMap = new Map();
    (stats.allLogs || stats.recentLogs || []).forEach((log) => {
      recordsMap.set(log.date, log);
    });

    const days = [];
    // Padding for previous month days
    for (let i = 0; i < firstDayIndex; i++) {
      days.push({ empty: true, key: `pad_${i}` });
    }

    const todayStr = getTodayString();

    for (let day = 1; day <= totalDaysInMonth; day++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const record = recordsMap.get(dateStr);
      const isToday = dateStr === todayStr;
      const isFuture = dateStr > todayStr;

      days.push({
        empty: false,
        day,
        dateStr,
        record,
        status: record ? record.status : isFuture ? 'future' : 'unmarked',
        isToday,
        isFuture,
        key: dateStr
      });
    }

    return days;
  }, [calendarDate, stats]);

  // Filtered Personal Logs
  const filteredPersonalLogs = useMemo(() => {
    const logs = stats.allLogs || stats.recentLogs || [];
    return logs.filter((log) => {
      const matchesFilter = logFilter === 'all' || log.status === logFilter;
      const q = logSearch.toLowerCase().trim();
      const matchesSearch =
        !q ||
        (log.date || '').includes(q) ||
        (log.checkInTime || '').toLowerCase().includes(q) ||
        (log.notes || '').toLowerCase().includes(q);
      return matchesFilter && matchesSearch;
    });
  }, [stats, logFilter, logSearch]);

  // Filtered Classroom Roster
  const filteredRoster = useMemo(() => {
    return (rosterData.roster || []).filter((s) => {
      const matchesStatus = rosterFilter === 'all' || s.status === rosterFilter;
      const q = rosterSearch.toLowerCase().trim();
      const matchesSearch =
        !q ||
        (s.name || '').toLowerCase().includes(q) ||
        (s.email || '').toLowerCase().includes(q) ||
        (s.course || '').toLowerCase().includes(q);
      return matchesStatus && matchesSearch;
    });
  }, [rosterData, rosterFilter, rosterSearch]);

  const isCheckedInToday = stats.todayStatus === 'present';
  const isSafePercentage = stats.attendancePercentage >= 75;

  return (
    <SidebarLayout>
      <div className="space-y-6 max-w-7xl mx-auto">
        {/* Toast Alert */}
        {toast && (
          <div
            role="alert"
            className={`fixed top-5 right-5 z-50 px-5 py-3.5 rounded-2xl text-xs font-bold shadow-2xl transition-all animate-slide-up flex items-center gap-2 ${
              toast.isError
                ? 'bg-rose-600 text-white border border-rose-400 shadow-rose-900/40'
                : 'bg-emerald-600 text-white border border-emerald-400 shadow-emerald-900/40'
            }`}
          >
            <span>{toast.isError ? '⚠️' : '✓'}</span>
            <span>{toast.message}</span>
          </div>
        )}

        {/* Header Banner */}
        <div className="glass-panel glass-card-accent p-5 sm:p-7 lg:p-8 rounded-2xl sm:rounded-3xl flex flex-col md:flex-row justify-between items-start md:items-center gap-5 shadow-2xl">
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="px-3 py-1 rounded-full bg-brand-subtle text-indigo-700 dark:text-indigo-400 border border-brand text-[11px] font-extrabold uppercase tracking-widest font-display flex items-center gap-1.5">
                <CalendarCheck className="w-3.5 h-3.5" />
                Academic Attendance & Punches
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                · Institutional Record Gateway
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-2 font-display">
              {isFacultyOrAdmin && activeTab === 'roster'
                ? 'Classroom Roll Call & Student Attendance'
                : 'My Daily Attendance & Punch Records'}
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-1 max-w-xl leading-relaxed">
              {isFacultyOrAdmin && activeTab === 'roster'
                ? 'Conduct daily classroom roll calls, record student punch-ins, and manage official attendance exemptions.'
                : 'Record daily presence, monitor academic streak continuity, and maintain compliance with the 75% attendance criterion.'}
            </p>
          </div>

          <div className="flex items-center gap-3 self-stretch md:self-auto justify-between md:justify-end flex-wrap">
            {/* Tab Switcher for Teachers & Admins */}
            {isFacultyOrAdmin && (
              <div className="flex p-1.5 bg-slate-100 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 rounded-2xl shrink-0 shadow-inner">
                <button
                  onClick={() => setActiveTab('roster')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                    activeTab === 'roster'
                      ? 'bg-brand text-white shadow-brand ring-1 ring-white/20'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <Users className="w-3.5 h-3.5" />
                  <span>Class Roster</span>
                </button>
                <button
                  onClick={() => setActiveTab('personal')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                    activeTab === 'personal'
                      ? 'bg-brand text-white shadow-brand ring-1 ring-white/20'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <CalendarIcon className="w-3.5 h-3.5" />
                  <span>My Punches</span>
                </button>
              </div>
            )}

            <button
              onClick={() => {
                if (isFacultyOrAdmin && activeTab === 'roster') {
                  fetchRosterAttendance(rosterDate);
                } else {
                  fetchPersonalStats();
                }
                showToast('Attendance records refreshed.');
              }}
              className="px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-bold rounded-xl border border-slate-200 dark:border-slate-800 transition flex items-center gap-1.5 shadow-xs"
              title="Refresh attendance records"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Refresh</span>
            </button>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* VIEW 1: STUDENT / PERSONAL ATTENDANCE DASHBOARD                            */}
        {/* ========================================================================= */}
        {(!isFacultyOrAdmin || activeTab === 'personal') && (
          <div className="space-y-6">
            {/* KPI Cards Strip */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
              {/* Overall Percentage */}
              <div className="glass-panel p-5 rounded-2xl space-y-1.5 shadow-md">
                <div className="flex items-center justify-between text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider font-display">
                  <span>Attendance Rate</span>
                  <span
                    className={`px-2 py-0.5 rounded-md text-[9px] font-black ${
                      isSafePercentage
                        ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                        : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20'
                    }`}
                  >
                    {isSafePercentage ? 'Criteria Met (>75%)' : 'Action Required'}
                  </span>
                </div>
                <div
                  className={`text-3xl sm:text-4xl font-black font-display ${
                    isSafePercentage ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                  }`}
                >
                  {stats.attendancePercentage}%
                </div>
                {/* Progress bar */}
                <div className="w-full bg-slate-200 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden mt-1">
                  <div
                    className={`h-full transition-all duration-500 rounded-full ${
                      isSafePercentage ? 'bg-emerald-500' : 'bg-rose-500'
                    }`}
                    style={{ width: `${stats.attendancePercentage}%` }}
                  />
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">Monthly academic standing</div>
              </div>

              {/* Consecutive Streak */}
              <div className="glass-panel p-5 rounded-2xl space-y-1 shadow-md">
                <div className="flex items-center justify-between text-[10px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider font-display">
                  <span>Daily Streak</span>
                  <Flame className="w-4 h-4 text-amber-500" />
                </div>
                <div className="text-3xl sm:text-4xl font-black text-amber-600 dark:text-amber-400 font-display flex items-center gap-1.5">
                  🔥 {stats.currentStreak}d
                </div>
                <div className="text-[11px] text-amber-700/80 dark:text-amber-300/80">Consecutive present punches</div>
              </div>

              {/* Total Present Days */}
              <div className="glass-panel p-5 rounded-2xl space-y-1 shadow-md">
                <div className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider font-display">
                  Present Days
                </div>
                <div className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white font-display">
                  {stats.totalPresent}
                </div>
                <div className="text-[11px] text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Recorded sessions
                </div>
              </div>

              {/* Approved Leaves */}
              <div className="glass-panel p-5 rounded-2xl space-y-1 shadow-md">
                <div className="flex items-center justify-between text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider font-display">
                  <span>Excused Leaves</span>
                  <Award className="w-4 h-4 text-indigo-500" />
                </div>
                <div className="text-3xl sm:text-4xl font-black text-indigo-600 dark:text-indigo-400 font-display">
                  {stats.totalOnLeave || 0}d
                </div>
                <div className="text-[11px] text-indigo-700/80 dark:text-indigo-300/80">Approved exemptions</div>
              </div>
            </div>

            {/* Daily Punch Card & Exemption CTA */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
              {/* Daily Punch Card (7 cols) */}
              <div className="lg:col-span-7 glass-panel p-6 sm:p-7 rounded-3xl space-y-4 shadow-xl flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between border-b border-slate-200/80 dark:border-slate-800/80 pb-3">
                    <div>
                      <span className="text-[10px] font-extrabold uppercase tracking-widest text-indigo-600 dark:text-indigo-400 font-display">
                        Session Punch-In
                      </span>
                      <h2 className="text-lg font-bold text-slate-900 dark:text-white font-display">
                        Daily Attendance Status
                      </h2>
                    </div>

                    <span
                      className={`px-3 py-1 text-xs font-black uppercase tracking-wider rounded-full border shadow-xs ${
                        isCheckedInToday
                          ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/30'
                          : 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/30 animate-pulse'
                      }`}
                    >
                      {isCheckedInToday ? '✓ Present for Today' : '⚠️ Punch Pending'}
                    </span>
                  </div>

                  <div className="mt-4 space-y-2">
                    {isCheckedInToday ? (
                      <div className="p-4 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-500/30 text-xs text-slate-700 dark:text-slate-300 flex items-start gap-3">
                        <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                        <div className="space-y-1">
                          <strong className="text-emerald-800 dark:text-emerald-300 font-bold block text-sm">
                            Official Check-In Confirmed!
                          </strong>
                          <p>
                            Your attendance for today was recorded at{' '}
                            <strong>{stats.todayRecord?.checkInTime || '09:00 AM'}</strong>. Academic streak counter
                            has been incremented.
                          </p>
                        </div>
                      </div>
                    ) : (
                      <form onSubmit={handleCheckIn} className="space-y-3">
                        <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                          Confirm your presence for today's lecture sessions. One punch per day updates your institutional records.
                        </p>
                        <div className="flex flex-col sm:flex-row items-center gap-3">
                          <input
                            type="text"
                            placeholder="Optional check-in notes (e.g. Lab Session A, Online attendance)..."
                            value={checkInNotes}
                            onChange={(e) => setCheckInNotes(e.target.value)}
                            className="flex-1 w-full px-4 py-2.5 bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-brand transition"
                          />
                          <button
                            type="submit"
                            disabled={checkingIn}
                            className="w-full sm:w-auto px-6 py-2.5 btn-dashboard-emerald text-white text-xs font-black rounded-xl shadow-lg transition flex items-center justify-center gap-2 whitespace-nowrap disabled:opacity-60"
                          >
                            {checkingIn ? (
                              <>
                                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                <span>Recording...</span>
                              </>
                            ) : (
                              <>
                                <Clock className="w-3.5 h-3.5" />
                                <span>Mark Present Now</span>
                              </>
                            )}
                          </button>
                        </div>
                      </form>
                    )}
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-200/80 dark:border-slate-800/80 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                  <span>Campus Timezone: IST (UTC +5:30)</span>
                  <span>Minimum Standard: 75.0%</span>
                </div>
              </div>

              {/* Leave Exemption Prompt (5 cols) */}
              <div className="lg:col-span-5 glass-panel p-6 sm:p-7 rounded-3xl space-y-4 shadow-xl flex flex-col justify-between bg-linear-to-br from-indigo-50/50 to-purple-50/50 dark:from-indigo-950/20 dark:to-purple-950/20 border border-indigo-200/70 dark:border-indigo-500/20">
                <div className="space-y-2.5">
                  <div className="flex items-center gap-2">
                    <span className="p-2 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                      <ShieldCheck className="w-5 h-5" />
                    </span>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white font-display">
                      Need Absence Excused?
                    </h3>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    Medical absences, hospital visits, and academic competition representations can be officially excused
                    by faculty through the leave exemption portal.
                  </p>
                </div>

                <div className="pt-3">
                  <Link
                    to={role === 'teacher' ? '/teacher/leave' : '/student/leave'}
                    className="w-full py-3 px-4 btn-premium text-white text-xs font-bold rounded-xl shadow-brand flex items-center justify-center gap-2"
                  >
                    <span>Apply for Leave Exemption →</span>
                  </Link>
                </div>
              </div>
            </div>

            {/* Monthly Calendar View & Logs Split */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Monthly Interactive Calendar (6 cols) */}
              <div className="lg:col-span-6 glass-panel p-5 sm:p-6 rounded-3xl space-y-4 shadow-xl">
                {/* Calendar Header Controls */}
                <div className="flex items-center justify-between border-b border-slate-200/80 dark:border-slate-800/80 pb-3">
                  <div>
                    <span className="text-[10px] font-extrabold uppercase tracking-widest text-indigo-600 dark:text-indigo-400 font-display">
                      Monthly Visual Matrix
                    </span>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white font-display">
                      {MONTH_NAMES[calendarDate.getMonth()]} {calendarDate.getFullYear()}
                    </h3>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() =>
                        setCalendarDate(new Date(calendarDate.getFullYear(), calendarDate.getMonth() - 1, 1))
                      }
                      className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300 transition"
                      title="Previous Month"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setCalendarDate(new Date())}
                      className="px-2.5 py-1 text-xs font-bold rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 transition"
                    >
                      Today
                    </button>
                    <button
                      onClick={() =>
                        setCalendarDate(new Date(calendarDate.getFullYear(), calendarDate.getMonth() + 1, 1))
                      }
                      className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300 transition"
                      title="Next Month"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Day Header Row */}
                <div className="grid grid-cols-7 gap-1 text-center text-[11px] font-bold text-slate-400 font-display uppercase tracking-wider">
                  {DAYS_OF_WEEK.map((d) => (
                    <div key={d} className="py-1">
                      {d}
                    </div>
                  ))}
                </div>

                {/* Calendar Days Grid */}
                <div className="grid grid-cols-7 gap-1 sm:gap-1.5">
                  {calendarDays.map((d) => {
                    if (d.empty) {
                      return <div key={d.key} className="h-10 sm:h-12 rounded-xl" />;
                    }

                    const isPresent = d.status === 'present';
                    const isLate = d.status === 'late';
                    const isOnLeave = d.status === 'on_leave';
                    const isAbsent = d.status === 'absent';

                    return (
                      <div
                        key={d.key}
                        className={`h-10 sm:h-12 rounded-xl border flex flex-col items-center justify-between p-1 transition-all ${
                          d.isToday
                            ? 'ring-2 ring-brand border-brand font-black'
                            : 'border-slate-200/70 dark:border-slate-800/80'
                        } ${
                          isPresent
                            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-400'
                            : isLate
                            ? 'bg-amber-500/10 border-amber-500/30 text-amber-700 dark:text-amber-400'
                            : isOnLeave
                            ? 'bg-indigo-500/10 border-indigo-500/30 text-indigo-700 dark:text-indigo-400'
                            : isAbsent
                            ? 'bg-rose-500/10 border-rose-500/30 text-rose-700 dark:text-rose-400'
                            : d.isFuture
                            ? 'bg-slate-50/50 dark:bg-slate-900/30 text-slate-400 dark:text-slate-600'
                            : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400'
                        }`}
                        title={
                          d.record
                            ? `${d.dateStr}: ${d.record.status} (${d.record.checkInTime}) - ${d.record.notes || ''}`
                            : `${d.dateStr}: ${d.status}`
                        }
                      >
                        <span className="text-[11px] font-bold">{d.day}</span>
                        <span className="text-[10px] leading-none">
                          {isPresent && '✓'}
                          {isLate && '⏱️'}
                          {isOnLeave && '🏖️'}
                          {isAbsent && '✕'}
                        </span>
                      </div>
                    );
                  })}
                </div>

                {/* Calendar Legend */}
                <div className="pt-3 border-t border-slate-200 dark:border-slate-800/80 flex flex-wrap items-center justify-center gap-4 text-[11px] text-slate-600 dark:text-slate-400">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                    Present
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                    Late Punch
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
                    Excused Leave
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                    Absent
                  </span>
                </div>
              </div>

              {/* Attendance Log History (6 cols) */}
              <div className="lg:col-span-6 space-y-4">
                {/* Filter and Search Bar */}
                <div className="glass-panel p-4 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3 shadow-md">
                  <div className="relative w-full sm:w-56">
                    <input
                      type="text"
                      placeholder="Search date or note..."
                      value={logSearch}
                      onChange={(e) => setLogSearch(e.target.value)}
                      className="w-full pl-8 pr-6 py-2 bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:border-brand transition"
                    />
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                    {logSearch && (
                      <button
                        onClick={() => setLogSearch('')}
                        className="absolute right-2 top-2 text-xs text-slate-400 hover:text-white"
                      >
                        ✕
                      </button>
                    )}
                  </div>

                  <div className="flex items-center gap-1 overflow-x-auto w-full sm:w-auto p-1 bg-slate-100 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 rounded-xl">
                    {['all', 'present', 'on_leave', 'absent'].map((f) => (
                      <button
                        key={f}
                        onClick={() => setLogFilter(f)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-bold capitalize transition ${
                          logFilter === f
                            ? 'bg-brand text-white shadow-xs'
                            : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                        }`}
                      >
                        {f === 'on_leave' ? 'Leave' : f}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Logs List */}
                {personalLoading ? (
                  <SkeletonCardList count={3} cols={1} />
                ) : filteredPersonalLogs.length === 0 ? (
                  <div className="glass-panel p-10 rounded-3xl text-center space-y-2">
                    <span className="text-4xl">📜</span>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white font-display">
                      No attendance logs recorded
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Check in today using the punch button to start building your record!
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2.5 max-h-[460px] overflow-y-auto pr-1">
                    {filteredPersonalLogs.map((log) => {
                      const isPres = log.status === 'present';
                      const isLv = log.status === 'on_leave';
                      const isAbs = log.status === 'absent';

                      return (
                        <div
                          key={log.id || log.date}
                          className="glass-panel glass-panel-hover p-3.5 sm:p-4 rounded-2xl flex items-center justify-between gap-3 shadow-xs"
                        >
                          <div className="space-y-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-slate-900 dark:text-white font-display">
                                {new Date(log.date + 'T00:00:00').toLocaleDateString('en-US', {
                                  weekday: 'short',
                                  month: 'short',
                                  day: 'numeric',
                                  year: 'numeric'
                                })}
                              </span>
                              <span className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                                • {log.checkInTime || '09:00 AM'}
                              </span>
                            </div>
                            {log.notes && (
                              <p className="text-[11px] text-slate-600 dark:text-slate-400 truncate">
                                "{log.notes}"
                              </p>
                            )}
                          </div>

                          <span
                            className={`px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider shrink-0 border ${
                              isPres
                                ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/30'
                                : isLv
                                ? 'bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border-indigo-500/30'
                                : isAbs
                                ? 'bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/30'
                                : 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/30'
                            }`}
                          >
                            {isPres ? '✓ Present' : isLv ? '🏖️ Excused' : log.status}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* VIEW 2: CLASSROOM ROSTER & ROLL CALL (TEACHERS & ADMINS ONLY)              */}
        {/* ========================================================================= */}
        {isFacultyOrAdmin && activeTab === 'roster' && (
          <div className="space-y-6">
            {/* Roster KPI Summary Strip */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3.5">
              <div className="glass-panel p-4 rounded-2xl space-y-1 shadow-sm">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 font-display">
                  Enrolled Students
                </span>
                <div className="text-3xl font-black text-slate-900 dark:text-white font-display">
                  {rosterData.totalCount}
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">Class roster size</p>
              </div>

              <div className="glass-panel p-4 rounded-2xl space-y-1 shadow-sm">
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 font-display">
                  Present Today
                </span>
                <div className="text-3xl font-black text-emerald-600 dark:text-emerald-400 font-display">
                  {rosterData.presentCount}
                </div>
                <p className="text-[11px] text-emerald-700/80 dark:text-emerald-400/80">Punched in</p>
              </div>

              <div className="glass-panel p-4 rounded-2xl space-y-1 shadow-sm">
                <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 font-display">
                  Approved Leave
                </span>
                <div className="text-3xl font-black text-indigo-600 dark:text-indigo-400 font-display">
                  {rosterData.onLeaveCount}
                </div>
                <p className="text-[11px] text-indigo-700/80 dark:text-indigo-400/80">Excused exemption</p>
              </div>

              <div className="glass-panel p-4 rounded-2xl space-y-1 shadow-sm">
                <span className="text-[10px] font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400 font-display">
                  Absent
                </span>
                <div className="text-3xl font-black text-rose-600 dark:text-rose-400 font-display">
                  {rosterData.absentCount}
                </div>
                <p className="text-[11px] text-rose-700/80 dark:text-rose-400/80">Marked absent</p>
              </div>

              <div className="glass-panel p-4 rounded-2xl space-y-1 shadow-sm">
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 font-display">
                  Unmarked
                </span>
                <div className="text-3xl font-black text-amber-600 dark:text-amber-400 font-display">
                  {rosterData.unmarkedCount}
                </div>
                <p className="text-[11px] text-amber-700/80 dark:text-amber-400/80">Pending roll-call</p>
              </div>
            </div>

            {/* Date Picker, Search & Batch Roll Call Bar */}
            <div className="glass-panel p-4 sm:p-5 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4 shadow-md">
              <div className="flex items-center gap-3 w-full md:w-auto flex-wrap">
                {/* Target Date Input */}
                <div className="flex items-center gap-2">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 font-display uppercase tracking-wider">
                    Date:
                  </label>
                  <input
                    type="date"
                    value={rosterDate}
                    onChange={(e) => {
                      setRosterDate(e.target.value);
                      fetchRosterAttendance(e.target.value);
                    }}
                    className="px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold text-slate-900 dark:text-slate-200 focus:outline-none focus:border-brand"
                  />
                </div>

                {/* Search */}
                <div className="relative flex-1 sm:w-64">
                  <input
                    type="text"
                    placeholder="Search student name or email..."
                    value={rosterSearch}
                    onChange={(e) => setRosterSearch(e.target.value)}
                    className="w-full pl-8 pr-6 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:border-brand"
                  />
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                  {rosterSearch && (
                    <button
                      onClick={() => setRosterSearch('')}
                      className="absolute right-2 top-2 text-xs text-slate-400 hover:text-white"
                    >
                      ✕
                    </button>
                  )}
                </div>
              </div>

              {/* Action Buttons & Status Filters */}
              <div className="flex items-center gap-2.5 w-full md:w-auto justify-between md:justify-end flex-wrap">
                {/* Filter */}
                <select
                  value={rosterFilter}
                  onChange={(e) => setRosterFilter(e.target.value)}
                  className="px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 focus:outline-none focus:border-brand"
                >
                  <option value="all">All Students ({rosterData.totalCount})</option>
                  <option value="unmarked">Unmarked Only ({rosterData.unmarkedCount})</option>
                  <option value="present">Present ({rosterData.presentCount})</option>
                  <option value="on_leave">On Leave ({rosterData.onLeaveCount})</option>
                  <option value="absent">Absent ({rosterData.absentCount})</option>
                </select>

                {/* Batch Mark All Present */}
                <button
                  onClick={handleMarkAllPresent}
                  disabled={batchUpdating || rosterData.unmarkedCount === 0}
                  className="px-4 py-2 btn-dashboard-emerald text-white text-xs font-bold rounded-xl shadow-md transition flex items-center gap-1.5 disabled:opacity-50"
                  title="Mark all unmarked students as Present for selected date"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Mark Unmarked Present</span>
                </button>
              </div>
            </div>

            {/* Roster Students Table / Cards */}
            {rosterLoading ? (
              <SkeletonCardList count={4} cols={1} />
            ) : filteredRoster.length === 0 ? (
              <div className="glass-panel p-12 rounded-3xl text-center space-y-2">
                <span className="text-5xl">🎓</span>
                <h3 className="text-base font-bold text-slate-900 dark:text-white font-display">
                  No students found
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {rosterSearch || rosterFilter !== 'all'
                    ? 'Try clearing your search query or filter selection.'
                    : 'No enrolled students found in this course.'}
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredRoster.map((student) => {
                  const isPresent = student.status === 'present';
                  const isOnLeave = student.status === 'on_leave';
                  const isAbsent = student.status === 'absent';

                  return (
                    <div
                      key={student.id}
                      className="glass-panel glass-panel-hover p-4 sm:p-5 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm"
                    >
                      {/* Student Info */}
                      <div className="flex items-center gap-3.5">
                        <div className="w-10 h-10 rounded-xl bg-brand-subtle text-indigo-700 dark:text-indigo-300 border border-brand flex items-center justify-center font-bold text-sm shadow-inner shrink-0">
                          {student.name?.charAt(0).toUpperCase() || 'S'}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="text-sm font-bold text-slate-900 dark:text-white font-display">
                              {student.name}
                            </h4>
                            <span
                              className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider border ${
                                isPresent
                                  ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/30'
                                  : isOnLeave
                                  ? 'bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border-indigo-500/30'
                                  : isAbsent
                                  ? 'bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/30'
                                  : 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/30'
                              }`}
                            >
                              {student.status}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                            <span>{student.email}</span>
                            <span>•</span>
                            <span>{student.course}</span>
                            {student.checkInTime && (
                              <>
                                <span>•</span>
                                <span className="font-mono text-[11px] text-slate-600 dark:text-slate-300">
                                  Punch: {student.checkInTime}
                                </span>
                              </>
                            )}
                          </div>
                          {student.notes && (
                            <p className="text-[11px] text-slate-500 dark:text-slate-400 italic mt-0.5">
                              "{student.notes}"
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Quick Action Toggle Buttons */}
                      <div className="flex items-center gap-1.5 self-end sm:self-auto shrink-0">
                        <button
                          onClick={() => handleMarkStudent(student.id, 'present', student.name)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1 ${
                            isPresent
                              ? 'bg-emerald-600 text-white shadow-sm'
                              : 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20'
                          }`}
                          title="Mark Present"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Present</span>
                        </button>

                        <button
                          onClick={() => handleMarkStudent(student.id, 'absent', student.name)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1 ${
                            isAbsent
                              ? 'bg-rose-600 text-white shadow-sm'
                              : 'bg-rose-500/10 hover:bg-rose-500/20 text-rose-700 dark:text-rose-400 border border-rose-500/20'
                          }`}
                          title="Mark Absent"
                        >
                          <X className="w-3.5 h-3.5" />
                          <span>Absent</span>
                        </button>

                        <button
                          onClick={() => handleMarkStudent(student.id, 'on_leave', student.name)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1 ${
                            isOnLeave
                              ? 'bg-indigo-600 text-white shadow-sm'
                              : 'bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-700 dark:text-indigo-400 border border-indigo-500/20'
                          }`}
                          title="Mark On Leave (Excused)"
                        >
                          <span>🏖️ Leave</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </SidebarLayout>
  );
};

export default Attendance;
