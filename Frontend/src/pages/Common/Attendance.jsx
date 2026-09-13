// frontend/src/pages/Common/Attendance.jsx
import { useState, useEffect, useMemo, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  CalendarCheck,
  CheckCircle2,
  Clock,
  AlertCircle,
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Search,
  Users,
  Check,
  X,
  RefreshCw,
  RotateCcw,
  FileText,
  ArrowUpRight,
  UserCheck,
  UserX,
  CalendarOff
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
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [rosterSearch, setRosterSearch] = useState('');
  const [rosterFilter, setRosterFilter] = useState('all');
  const [batchUpdating, setBatchUpdating] = useState(false);

  // Global Toast Notification
  const [toast, setToast] = useState(null);
  const showToast = useCallback((message, isError = false) => {
    setToast({ message, isError });
    setTimeout(() => setToast(null), 3500);
  }, []);

  // 1. Fetch Personal Attendance Stats
  const fetchPersonalStats = useCallback(async (silent = false) => {
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
  }, [showToast]);

  // 2. Fetch Classroom Roster Attendance (Faculty/Admin)
  const fetchRosterAttendance = useCallback(async (dateParam = rosterDate, silent = false) => {
    if (!silent) setRosterLoading(true);
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
      if (!silent) setRosterLoading(false);
    }
  }, [rosterDate, showToast]);

  useEffect(() => {
    fetchPersonalStats();
    if (isFacultyOrAdmin) {
      fetchRosterAttendance(rosterDate);
    }
  }, [fetchPersonalStats, fetchRosterAttendance, isFacultyOrAdmin, rosterDate]);

  // Handle Manual Refresh
  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    try {
      if (isFacultyOrAdmin && activeTab === 'roster') {
        await fetchRosterAttendance(rosterDate, true);
      } else {
        await fetchPersonalStats(true);
      }
      showToast('Attendance updated');
    } finally {
      setIsRefreshing(false);
    }
  };

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

  // Handle Single Student Override / Cancel Attendance (Teacher)
  const handleMarkStudent = async (studentId, requestedStatus, studentName = 'Student') => {
    const currentStudent = rosterData.roster.find((s) => s.id === studentId);
    const targetStatus = (currentStudent?.status === requestedStatus || requestedStatus === 'unmarked') ? 'unmarked' : requestedStatus;

    // Optimistic update
    const prevRosterData = { ...rosterData };
    const updatedRoster = rosterData.roster.map((s) => {
      if (s.id === studentId) {
        return {
          ...s,
          status: targetStatus,
          checkInTime: targetStatus === 'unmarked' ? null : new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
        };
      }
      return s;
    });

    const presentCount = updatedRoster.filter((s) => s.status === 'present').length;
    const absentCount = updatedRoster.filter((s) => s.status === 'absent').length;
    const onLeaveCount = updatedRoster.filter((s) => s.status === 'on_leave').length;
    const unmarkedCount = updatedRoster.filter((s) => s.status === 'unmarked').length;

    setRosterData({
      ...rosterData,
      presentCount,
      absentCount,
      onLeaveCount,
      unmarkedCount,
      roster: updatedRoster
    });

    try {
      const res = await api.post('/attendance/mark-student', {
        studentId,
        date: rosterDate,
        status: targetStatus,
        notes: targetStatus === 'unmarked' ? 'Attendance mark cancelled' : `Marked by ${user?.name || 'Faculty'}`
      });
      if (res.data?.success) {
        showToast(targetStatus === 'unmarked' ? `${studentName} reset to unmarked` : `${studentName} marked as ${targetStatus}`);
        fetchRosterAttendance(rosterDate, true);
      }
    } catch (err) {
      setRosterData(prevRosterData);
      const msg = err.parsedMessage || err.response?.data?.message || 'Failed to update student attendance';
      showToast(msg, true);
    }
  };

  // Mark All Unmarked as Present
  const handleMarkAllPresent = async () => {
    const unmarked = rosterData.roster.filter((s) => s.status === 'unmarked');
    if (unmarked.length === 0) {
      showToast('All students already marked for this date');
      return;
    }

    const prevRosterData = { ...rosterData };
    const updatedRoster = rosterData.roster.map((s) => {
      if (s.status === 'unmarked') {
        return {
          ...s,
          status: 'present',
          checkInTime: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
        };
      }
      return s;
    });

    setRosterData({
      ...rosterData,
      presentCount: rosterData.presentCount + unmarked.length,
      unmarkedCount: 0,
      roster: updatedRoster
    });

    setBatchUpdating(true);
    try {
      const records = unmarked.map((s) => ({
        studentId: s.id,
        status: 'present',
        notes: 'Classroom roll-call'
      }));

      const res = await api.post('/attendance/mark-batch', {
        date: rosterDate,
        records
      });

      if (res.data?.success) {
        showToast(`Marked ${res.data.count} student(s) as Present`);
        fetchRosterAttendance(rosterDate, true);
      }
    } catch (err) {
      setRosterData(prevRosterData);
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
      <div className="space-y-6 max-w-6xl mx-auto">
        {/* Toast Alert */}
        {toast && (
          <div
            role="alert"
            className={`fixed top-6 right-6 z-50 px-4 py-2.5 rounded-xl text-xs font-semibold shadow-xl transition-all animate-fade-in flex items-center gap-2 ${
              toast.isError
                ? 'bg-rose-600 text-white border border-rose-500 shadow-rose-900/30'
                : 'bg-emerald-600 text-white border border-emerald-500 shadow-emerald-900/30'
            }`}
          >
            <span>{toast.isError ? '✕' : '✓'}</span>
            <span>{toast.message}</span>
          </div>
        )}

        {/* Clean Professional Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-1 border-b border-slate-200 dark:border-slate-800">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2.5">
              <CalendarCheck className="w-6 h-6 text-teal-500" />
              {isFacultyOrAdmin && activeTab === 'roster'
                ? 'Classroom Attendance'
                : 'Attendance Overview'}
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {isFacultyOrAdmin && activeTab === 'roster'
                ? 'Manage daily student roll-call and record presence.'
                : 'Track daily punches, consistency, and compliance with the 75% attendance policy.'}
            </p>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            {/* View Switcher for Teachers & Admins */}
            {isFacultyOrAdmin && (
              <div className="flex p-1 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl">
                <button
                  type="button"
                  onClick={() => setActiveTab('roster')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer ${
                    activeTab === 'roster'
                      ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs'
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <Users className="w-3.5 h-3.5" />
                  <span>Class Roster</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('personal')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer ${
                    activeTab === 'personal'
                      ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs'
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <CalendarIcon className="w-3.5 h-3.5" />
                  <span>My Record</span>
                </button>
              </div>
            )}

            {/* Leave Link */}
            <Link
              to={role === 'admin' || role === 'superadmin' ? '/admin/leaves' : role === 'teacher' ? '/teacher/leave' : '/student/leave'}
              className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-900 transition flex items-center gap-1.5"
            >
              <FileText className="w-3.5 h-3.5 text-slate-400" />
              <span>Leaves</span>
              <ArrowUpRight className="w-3 h-3 text-slate-400" />
            </Link>

            {/* Refresh */}
            <button
              type="button"
              onClick={handleManualRefresh}
              disabled={isRefreshing}
              className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-900 transition disabled:opacity-50 cursor-pointer"
              title="Refresh attendance records"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* VIEW 1: STUDENT / PERSONAL ATTENDANCE DASHBOARD                            */}
        {/* ========================================================================= */}
        {(!isFacultyOrAdmin || activeTab === 'personal') && (
          <div className="space-y-5">
            {/* KPI Summary Strip */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
              {/* Overall Percentage */}
              <div className="p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white/60 dark:bg-slate-900/60 shadow-xs space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">Attendance Rate</span>
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-md ${
                    isSafePercentage
                      ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                      : 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
                  }`}>
                    {isSafePercentage ? 'Good (≥75%)' : 'Low (<75%)'}
                  </span>
                </div>
                <div className={`text-2xl sm:text-3xl font-bold ${
                  isSafePercentage ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                }`}>
                  {stats.attendancePercentage}%
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden mt-1.5">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${isSafePercentage ? 'bg-emerald-500' : 'bg-rose-500'}`}
                    style={{ width: `${Math.min(stats.attendancePercentage, 100)}%` }}
                  />
                </div>
              </div>

              {/* Total Present Days */}
              <div className="p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white/60 dark:bg-slate-900/60 shadow-xs space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">Present Days</span>
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                </div>
                <div className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
                  {stats.totalPresent}
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">Sessions recorded</p>
              </div>

              {/* Daily Streak */}
              <div className="p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white/60 dark:bg-slate-900/60 shadow-xs space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">Current Streak</span>
                  <Clock className="w-4 h-4 text-amber-500" />
                </div>
                <div className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
                  {stats.currentStreak} <span className="text-sm font-medium text-slate-400">days</span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">Consecutive attendance</p>
              </div>

              {/* Approved Leaves */}
              <div className="p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white/60 dark:bg-slate-900/60 shadow-xs space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">Excused Leaves</span>
                  <CalendarOff className="w-4 h-4 text-indigo-500" />
                </div>
                <div className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
                  {stats.totalOnLeave || 0} <span className="text-sm font-medium text-slate-400">days</span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">Approved exemptions</p>
              </div>
            </div>

            {/* Daily Punch Card */}
            <div className="p-4 sm:p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white/60 dark:bg-slate-900/60 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                    isCheckedInToday
                      ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                      : 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                  }`}>
                    {isCheckedInToday ? <CheckCircle2 className="w-5 h-5" /> : <Clock className="w-5 h-5" />}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                        {isCheckedInToday ? 'Today\'s Attendance Recorded' : 'Daily Punch-In Required'}
                      </h2>
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                        isCheckedInToday
                          ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                          : 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                      }`}>
                        {isCheckedInToday ? 'Present' : 'Pending'}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      {isCheckedInToday
                        ? `Punched in at ${stats.todayRecord?.checkInTime || '09:00 AM'}. Your attendance is logged.`
                        : 'Record your presence for today to increment your streak and maintain compliance.'}
                    </p>
                  </div>
                </div>

                {!isCheckedInToday && (
                  <form onSubmit={handleCheckIn} className="flex items-center gap-2 w-full sm:w-auto">
                    <input
                      type="text"
                      placeholder="Optional note (e.g. Lab, Lecture)..."
                      value={checkInNotes}
                      onChange={(e) => setCheckInNotes(e.target.value)}
                      className="px-3 py-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:border-teal-500 flex-1 sm:w-56"
                    />
                    <button
                      type="submit"
                      disabled={checkingIn}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-xl shadow-xs transition disabled:opacity-50 flex items-center gap-1.5 whitespace-nowrap cursor-pointer"
                    >
                      {checkingIn ? (
                        <>
                          <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          <span>Punching...</span>
                        </>
                      ) : (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>Punch Present</span>
                        </>
                      )}
                    </button>
                  </form>
                )}
              </div>
            </div>

            {/* Monthly Calendar View & Logs Split */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
              {/* Monthly Interactive Calendar */}
              <div className="lg:col-span-6 p-4 sm:p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white/60 dark:bg-slate-900/60 shadow-xs space-y-3.5">
                {/* Calendar Header Controls */}
                <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800/80">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    {MONTH_NAMES[calendarDate.getMonth()]} {calendarDate.getFullYear()}
                  </h3>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => setCalendarDate(new Date(calendarDate.getFullYear(), calendarDate.getMonth() - 1, 1))}
                      className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 transition cursor-pointer"
                      title="Previous Month"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setCalendarDate(new Date())}
                      className="px-2 py-1 text-xs font-medium rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition cursor-pointer"
                    >
                      Today
                    </button>
                    <button
                      type="button"
                      onClick={() => setCalendarDate(new Date(calendarDate.getFullYear(), calendarDate.getMonth() + 1, 1))}
                      className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 transition cursor-pointer"
                      title="Next Month"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Day Header Row */}
                <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                  {DAYS_OF_WEEK.map((d) => (
                    <div key={d} className="py-0.5">{d}</div>
                  ))}
                </div>

                {/* Calendar Days Grid */}
                <div className="grid grid-cols-7 gap-1">
                  {calendarDays.map((d) => {
                    if (d.empty) {
                      return <div key={d.key} className="h-9 sm:h-10 rounded-lg" />;
                    }

                    const isPresent = d.status === 'present';
                    const isLate = d.status === 'late';
                    const isOnLeave = d.status === 'on_leave';
                    const isAbsent = d.status === 'absent';

                    return (
                      <div
                        key={d.key}
                        className={`h-9 sm:h-10 rounded-lg flex flex-col items-center justify-center relative transition-colors ${
                          d.isToday
                            ? 'bg-teal-500/10 border border-teal-500/40 text-teal-600 dark:text-teal-400 font-bold'
                            : 'hover:bg-slate-100 dark:hover:bg-slate-800/50 text-slate-700 dark:text-slate-300'
                        }`}
                        title={
                          d.record
                            ? `${d.dateStr}: ${d.record.status} (${d.record.checkInTime || 'Recorded'})`
                            : d.dateStr
                        }
                      >
                        <span className="text-xs">{d.day}</span>
                        {/* Status Dot */}
                        {!d.isFuture && (
                          <div className="flex items-center gap-0.5 mt-0.5">
                            {isPresent && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />}
                            {isLate && <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />}
                            {isOnLeave && <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />}
                            {isAbsent && <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Clean Calendar Legend */}
                <div className="pt-2.5 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-center gap-5 text-[11px] text-slate-500 dark:text-slate-400">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    Present
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-amber-500" />
                    Late
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-indigo-500" />
                    Leave
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-rose-500" />
                    Absent
                  </span>
                </div>
              </div>

              {/* Attendance Log History */}
              <div className="lg:col-span-6 p-4 sm:p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white/60 dark:bg-slate-900/60 shadow-xs space-y-3.5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    Attendance History
                  </h3>

                  <div className="flex items-center gap-2">
                    {/* Search */}
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="Search logs..."
                        value={logSearch}
                        onChange={(e) => setLogSearch(e.target.value)}
                        className="pl-7 pr-4 py-1 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-xs text-slate-900 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:border-teal-500 w-36 sm:w-44"
                      />
                      <Search className="w-3 h-3 text-slate-400 absolute left-2.5 top-2" />
                    </div>

                    {/* Filter Pills */}
                    <div className="flex p-0.5 bg-slate-100 dark:bg-slate-950 rounded-lg border border-slate-200 dark:border-slate-800 text-[11px]">
                      {['all', 'present', 'absent'].map((f) => (
                        <button
                          key={f}
                          type="button"
                          onClick={() => setLogFilter(f)}
                          className={`px-2 py-0.5 rounded capitalize font-medium transition cursor-pointer ${
                            logFilter === f
                              ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs'
                              : 'text-slate-500 dark:text-slate-400'
                          }`}
                        >
                          {f}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Logs List */}
                {personalLoading ? (
                  <SkeletonCardList count={3} cols={1} />
                ) : filteredPersonalLogs.length === 0 ? (
                  <div className="py-10 text-center space-y-1 text-slate-400">
                    <p className="text-xs">No attendance records found.</p>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                    {filteredPersonalLogs.map((log) => {
                      const isPres = log.status === 'present';
                      const isLv = log.status === 'on_leave';
                      const isAbs = log.status === 'absent';

                      return (
                        <div
                          key={log.id || log.date}
                          className="p-3 rounded-xl border border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-950/40 flex items-center justify-between gap-3 text-xs"
                        >
                          <div className="space-y-0.5 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-slate-900 dark:text-white">
                                {new Date(log.date + 'T00:00:00').toLocaleDateString('en-US', {
                                  weekday: 'short',
                                  month: 'short',
                                  day: 'numeric'
                                })}
                              </span>
                              <span className="text-[11px] text-slate-400 font-mono">
                                {log.checkInTime || '09:00 AM'}
                              </span>
                            </div>
                            {log.notes && (
                              <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                                {log.notes}
                              </p>
                            )}
                          </div>

                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold shrink-0 ${
                              isPres
                                ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                                : isLv
                                ? 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400'
                                : isAbs
                                ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
                                : 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                            }`}
                          >
                            {isPres ? 'Present' : isLv ? 'Leave' : log.status}
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
          <div className="space-y-5">
            {/* Roster KPI Summary Strip */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              <div className="p-3.5 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white/60 dark:bg-slate-900/60 shadow-xs">
                <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">Total Students</span>
                <div className="text-2xl font-bold text-slate-900 dark:text-white mt-0.5">
                  {rosterData.totalCount}
                </div>
              </div>

              <div className="p-3.5 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white/60 dark:bg-slate-900/60 shadow-xs">
                <span className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400">Present</span>
                <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">
                  {rosterData.presentCount}
                </div>
              </div>

              <div className="p-3.5 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white/60 dark:bg-slate-900/60 shadow-xs">
                <span className="text-[11px] font-medium text-indigo-600 dark:text-indigo-400">On Leave</span>
                <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400 mt-0.5">
                  {rosterData.onLeaveCount}
                </div>
              </div>

              <div className="p-3.5 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white/60 dark:bg-slate-900/60 shadow-xs">
                <span className="text-[11px] font-medium text-rose-600 dark:text-rose-400">Absent</span>
                <div className="text-2xl font-bold text-rose-600 dark:text-rose-400 mt-0.5">
                  {rosterData.absentCount}
                </div>
              </div>

              <div className="p-3.5 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white/60 dark:bg-slate-900/60 shadow-xs">
                <span className="text-[11px] font-medium text-amber-600 dark:text-amber-400">Unmarked</span>
                <div className="text-2xl font-bold text-amber-600 dark:text-amber-400 mt-0.5">
                  {rosterData.unmarkedCount}
                </div>
              </div>
            </div>

            {/* Date Picker, Search & Batch Roll Call Bar */}
            <div className="p-3.5 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white/60 dark:bg-slate-900/60 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-2.5 w-full md:w-auto flex-wrap">
                {/* Target Date Input */}
                <div className="flex items-center gap-1.5">
                  <span className="text-xs text-slate-500 font-medium">Date:</span>
                  <input
                    type="date"
                    value={rosterDate}
                    onChange={(e) => setRosterDate(e.target.value)}
                    className="px-2.5 py-1.5 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-xs font-medium text-slate-900 dark:text-slate-200 focus:outline-none focus:border-teal-500"
                  />
                </div>

                {/* Search */}
                <div className="relative flex-1 sm:w-60">
                  <input
                    type="text"
                    placeholder="Search student or email..."
                    value={rosterSearch}
                    onChange={(e) => setRosterSearch(e.target.value)}
                    className="w-full pl-7 pr-6 py-1.5 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-xs text-slate-900 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:border-teal-500"
                  />
                  <Search className="w-3 h-3 text-slate-400 absolute left-2.5 top-2.5" />
                  {rosterSearch && (
                    <button
                      type="button"
                      onClick={() => setRosterSearch('')}
                      className="absolute right-2 top-2 text-xs text-slate-400 hover:text-slate-600"
                    >
                      ✕
                    </button>
                  )}
                </div>
              </div>

              {/* Action Buttons & Status Filters */}
              <div className="flex items-center gap-2 w-full md:w-auto justify-between md:justify-end flex-wrap">
                {/* Reset Filters */}
                {(rosterFilter !== 'all' || rosterSearch) && (
                  <button
                    type="button"
                    onClick={() => {
                      setRosterFilter('all');
                      setRosterSearch('');
                    }}
                    className="px-2.5 py-1.5 text-xs rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 transition cursor-pointer"
                  >
                    Clear Filter
                  </button>
                )}

                {/* Filter Dropdown */}
                <select
                  value={rosterFilter}
                  onChange={(e) => setRosterFilter(e.target.value)}
                  className="px-2.5 py-1.5 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-xs font-medium text-slate-700 dark:text-slate-300 focus:outline-none focus:border-teal-500"
                >
                  <option value="all">All ({rosterData.totalCount})</option>
                  <option value="unmarked">Unmarked ({rosterData.unmarkedCount})</option>
                  <option value="present">Present ({rosterData.presentCount})</option>
                  <option value="on_leave">On Leave ({rosterData.onLeaveCount})</option>
                  <option value="absent">Absent ({rosterData.absentCount})</option>
                </select>

                {/* Batch Mark All Present */}
                <button
                  type="button"
                  onClick={handleMarkAllPresent}
                  disabled={batchUpdating || rosterData.unmarkedCount === 0}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-lg shadow-xs transition flex items-center gap-1.5 disabled:opacity-40 cursor-pointer"
                  title="Mark all unmarked students as Present"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Mark All Present</span>
                </button>
              </div>
            </div>

            {/* Roster Students List */}
            {rosterLoading ? (
              <SkeletonCardList count={4} cols={1} />
            ) : filteredRoster.length === 0 ? (
              <div className="p-12 text-center space-y-1 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/60 dark:bg-slate-900/60">
                <p className="text-xs font-medium text-slate-500">No students matching the current filter.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {filteredRoster.map((student) => {
                  const isPresent = student.status === 'present';
                  const isOnLeave = student.status === 'on_leave';
                  const isAbsent = student.status === 'absent';
                  const isMarked = student.status !== 'unmarked';

                  return (
                    <div
                      key={student.id}
                      className="p-3.5 rounded-xl border border-slate-200/70 dark:border-slate-800/80 bg-white/70 dark:bg-slate-900/70 hover:border-slate-300 dark:hover:border-slate-700 transition flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                    >
                      {/* Student Info */}
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center font-bold text-xs shrink-0">
                          {student.name?.charAt(0).toUpperCase() || 'S'}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-slate-900 dark:text-white">
                              {student.name}
                            </span>
                            <span
                              className={`px-2 py-0.2 rounded-full text-[10px] font-semibold ${
                                isPresent
                                  ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                                  : isOnLeave
                                  ? 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400'
                                  : isAbsent
                                  ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
                                  : 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                              }`}
                            >
                              {student.status}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                            <span>{student.email}</span>
                            {student.course && (
                              <>
                                <span>•</span>
                                <span>{student.course}</span>
                              </>
                            )}
                            {student.checkInTime && (
                              <>
                                <span>•</span>
                                <span className="font-mono">{student.checkInTime}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Quick Action Buttons */}
                      <div className="flex items-center gap-1.5 self-end sm:self-auto shrink-0">
                        {/* Present Button */}
                        <button
                          type="button"
                          onClick={() => handleMarkStudent(student.id, 'present', student.name)}
                          className={`px-2.5 py-1 rounded-lg font-medium text-xs transition flex items-center gap-1 cursor-pointer ${
                            isPresent
                              ? 'bg-emerald-600 text-white shadow-xs'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-emerald-500/10 hover:text-emerald-600'
                          }`}
                          title="Mark Present"
                        >
                          <Check className="w-3 h-3" />
                          <span>Present</span>
                        </button>

                        {/* Absent Button */}
                        <button
                          type="button"
                          onClick={() => handleMarkStudent(student.id, 'absent', student.name)}
                          className={`px-2.5 py-1 rounded-lg font-medium text-xs transition flex items-center gap-1 cursor-pointer ${
                            isAbsent
                              ? 'bg-rose-600 text-white shadow-xs'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-rose-500/10 hover:text-rose-600'
                          }`}
                          title="Mark Absent"
                        >
                          <X className="w-3 h-3" />
                          <span>Absent</span>
                        </button>

                        {/* Leave Button */}
                        <button
                          type="button"
                          onClick={() => handleMarkStudent(student.id, 'on_leave', student.name)}
                          className={`px-2.5 py-1 rounded-lg font-medium text-xs transition flex items-center gap-1 cursor-pointer ${
                            isOnLeave
                              ? 'bg-indigo-600 text-white shadow-xs'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-indigo-500/10 hover:text-indigo-600'
                          }`}
                          title="Mark Excused Leave"
                        >
                          <CalendarOff className="w-3 h-3" />
                          <span>Leave</span>
                        </button>

                        {/* Cancel / Reset to Unmarked Button */}
                        {isMarked && (
                          <button
                            type="button"
                            onClick={() => handleMarkStudent(student.id, 'unmarked', student.name)}
                            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                            title="Reset mark (Return to Unmarked)"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                          </button>
                        )}
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
