// frontend/src/pages/Student/ApplyLeave.jsx
import { useState, useEffect, useMemo } from 'react';
import SidebarLayout from '../../components/common/SidebarLayout';
import { SkeletonCardList } from '../../components/common/SkeletonLoader';
import api from '../../services/api';

const LEAVE_CATEGORIES = [
  {
    id: 'sick',
    label: 'Medical / Sick Leave',
    icon: '🩺',
    desc: 'Illness, recovery, hospital visits or doctor consultation'
  },
  {
    id: 'academic',
    label: 'Academic / Competition',
    icon: '🎓',
    desc: 'Hackathons, conferences, research workshops or Olympiads'
  },
  {
    id: 'casual',
    label: 'Casual / Personal',
    icon: '🏠',
    desc: 'Family function, travel, or personal commitments'
  },
  {
    id: 'emergency',
    label: 'Family Emergency',
    icon: '⚠️',
    desc: 'Urgent family situation or unforeseen circumstances'
  }
];

const REASON_TEMPLATES = [
  'Viral fever and doctor-prescribed bed rest.',
  'Participating in inter-college hackathon competition.',
  'Attending urgent family commitment out of station.',
  'Hospital consultation and diagnostic appointments.'
];

const getTodayString = () => new Date().toISOString().split('T')[0];

const addDaysToDate = (baseDateStr, daysToAdd) => {
  const d = new Date(baseDateStr || Date.now());
  d.setDate(d.getDate() + daysToAdd);
  return d.toISOString().split('T')[0];
};

const ApplyLeave = () => {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Form states
  const todayStr = getTodayString();
  const [leaveType, setLeaveType] = useState('sick');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reason, setReason] = useState('');

  // Filter & Search states
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Withdraw modal state
  const [withdrawTarget, setWithdrawTarget] = useState(null);
  const [withdrawing, setWithdrawing] = useState(false);

  // Notification Toast
  const [toast, setToast] = useState(null);

  const showToast = (message, isError = false) => {
    setToast({ message, isError });
    setTimeout(() => setToast(null), 4500);
  };

  const fetchLeaves = async (isManual = false) => {
    if (isManual) setRefreshing(true);
    try {
      const res = await api.get('/leaves/my-leaves');
      if (res.data?.success) {
        setLeaves(res.data.leaves || []);
        if (isManual) showToast('Leave records synchronized with server.');
      }
    } catch (err) {
      const msg = err.parsedMessage || err.response?.data?.message || 'Failed to retrieve leaves from server';
      console.warn('Failed to load leaves:', err);
      if (isManual) showToast(msg, true);
    } finally {
      setLoading(false);
      if (isManual) setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchLeaves();
  }, []);

  // Compute total days between start and end date
  const calculateDays = (startStr, endStr) => {
    if (!startStr || !endStr) return 1;
    const start = new Date(startStr);
    const end = new Date(endStr);
    const diffTime = end - start;
    if (diffTime < 0) return 0;
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  };

  const totalDays = calculateDays(startDate, endDate);

  // Quick preset handlers
  const handleApplyPreset = (days) => {
    const today = getTodayString();
    if (days === 1) {
      setStartDate(today);
      setEndDate(today);
    } else if (days === 'tomorrow') {
      const tomorrow = addDaysToDate(today, 1);
      setStartDate(tomorrow);
      setEndDate(tomorrow);
    } else {
      setStartDate(today);
      setEndDate(addDaysToDate(today, days - 1));
    }
  };

  const handleStartDateChange = (val) => {
    setStartDate(val);
    // If end date is empty or prior to start date, auto-sync end date
    if (!endDate || new Date(endDate) < new Date(val)) {
      setEndDate(val);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!startDate || !endDate || !reason.trim()) {
      showToast('Please fill in all required fields.', true);
      return;
    }

    if (totalDays <= 0) {
      showToast('End date cannot be prior to start date.', true);
      return;
    }

    setSubmitting(true);
    try {
      const res = await api.post('/leaves/apply', {
        leaveType,
        startDate,
        endDate,
        totalDays,
        reason: reason.trim()
      });

      if (res.data?.success) {
        showToast(res.data.message || 'Leave application submitted successfully for review!');
        setReason('');
        setStartDate('');
        setEndDate('');
        fetchLeaves();
      }
    } catch (err) {
      const msg = err.parsedMessage || err.response?.data?.message || 'Failed to submit leave request';
      showToast(msg, true);
    } finally {
      setSubmitting(false);
    }
  };

  const handleWithdrawConfirm = async () => {
    if (!withdrawTarget) return;
    setWithdrawing(true);
    try {
      const res = await api.delete(`/leaves/${withdrawTarget.id}`);
      if (res.data?.success) {
        showToast('Leave application withdrawn successfully.');
        setWithdrawTarget(null);
        fetchLeaves();
      }
    } catch (err) {
      const msg = err.parsedMessage || err.response?.data?.message || 'Could not withdraw leave request';
      showToast(msg, true);
    } finally {
      setWithdrawing(false);
    }
  };

  // Metrics
  const totalCount = leaves.length;
  const pendingCount = leaves.filter((l) => l.status === 'pending').length;
  const approvedCount = leaves.filter((l) => l.status === 'approved').length;
  const rejectedCount = leaves.filter((l) => l.status === 'rejected').length;

  // Filtered leaves
  const filteredLeaves = useMemo(() => {
    return leaves.filter((item) => {
      const matchesStatus = filterStatus === 'all' || item.status === filterStatus;
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        (item.reason || '').toLowerCase().includes(q) ||
        (item.leaveType || '').toLowerCase().includes(q) ||
        (item.startDate || '').includes(q) ||
        (item.endDate || '').includes(q) ||
        (item.reviewedBy || '').toLowerCase().includes(q);
      return matchesStatus && matchesSearch;
    });
  }, [leaves, filterStatus, searchQuery]);

  return (
    <SidebarLayout>
      <div className="space-y-6 max-w-6xl mx-auto">
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
        <div className="glass-panel glass-card-accent p-4 sm:p-6 lg:p-8 rounded-2xl sm:rounded-3xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shadow-2xl">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-3 py-1 rounded-full bg-brand-subtle text-indigo-600 dark:text-indigo-400 border border-brand text-[11px] font-extrabold uppercase tracking-widest font-display">
                Academic Exemption Portal
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                · Direct Institutional Synchronization
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-2 font-display">
              Student Leave Application & Records
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-1 max-w-xl leading-relaxed">
              Submit planned absences, medical exemptions, and competitions to faculty for institutional attendance credits.
            </p>
          </div>

          <div className="flex items-center gap-2.5 self-stretch sm:self-auto justify-end">
            <button
              onClick={() => fetchLeaves(true)}
              disabled={refreshing}
              className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-900/90 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-bold rounded-xl border border-slate-200 dark:border-slate-800 transition flex items-center gap-2 shadow-xs"
              title="Refresh leave applications from database"
            >
              <span className={refreshing ? 'animate-spin' : ''}>🔄</span>
              <span>{refreshing ? 'Syncing...' : 'Sync Status'}</span>
            </button>
          </div>
        </div>

        {/* KPI Metrics Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
          <div
            onClick={() => setFilterStatus('all')}
            className={`glass-panel p-4 sm:p-5 rounded-2xl cursor-pointer transition-all ${
              filterStatus === 'all'
                ? 'border-brand ring-2 ring-brand/30 translate-y-[-2px]'
                : 'hover:border-slate-300 dark:hover:border-slate-700'
            }`}
          >
            <div className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider font-display">
              Total Applications
            </div>
            <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-1 font-display">
              {totalCount}
            </div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Submitted history</div>
          </div>

          <div
            onClick={() => setFilterStatus('pending')}
            className={`glass-panel p-4 sm:p-5 rounded-2xl cursor-pointer transition-all ${
              filterStatus === 'pending'
                ? 'border-amber-400 ring-2 ring-amber-400/30 translate-y-[-2px]'
                : 'hover:border-slate-300 dark:hover:border-slate-700'
            }`}
          >
            <div className="flex items-center justify-between text-[10px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider font-display">
              <span>Under Review</span>
              {pendingCount > 0 && <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />}
            </div>
            <div className="text-2xl sm:text-3xl font-black text-amber-600 dark:text-amber-400 mt-1 font-display">
              {pendingCount}
            </div>
            <div className="text-[11px] text-amber-700/80 dark:text-amber-300/80 mt-0.5">Awaiting decision</div>
          </div>

          <div
            onClick={() => setFilterStatus('approved')}
            className={`glass-panel p-4 sm:p-5 rounded-2xl cursor-pointer transition-all ${
              filterStatus === 'approved'
                ? 'border-emerald-400 ring-2 ring-emerald-400/30 translate-y-[-2px]'
                : 'hover:border-slate-300 dark:hover:border-slate-700'
            }`}
          >
            <div className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider font-display">
              Approved Grants
            </div>
            <div className="text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400 mt-1 font-display">
              {approvedCount}
            </div>
            <div className="text-[11px] text-emerald-700/80 dark:text-emerald-400/80 mt-0.5">Officially excused</div>
          </div>

          <div
            onClick={() => setFilterStatus('rejected')}
            className={`glass-panel p-4 sm:p-5 rounded-2xl cursor-pointer transition-all ${
              filterStatus === 'rejected'
                ? 'border-rose-400 ring-2 ring-rose-400/30 translate-y-[-2px]'
                : 'hover:border-slate-300 dark:hover:border-slate-700'
            }`}
          >
            <div className="text-[10px] font-bold text-rose-600 dark:text-rose-400 uppercase tracking-wider font-display">
              Declined
            </div>
            <div className="text-2xl sm:text-3xl font-black text-rose-600 dark:text-rose-400 mt-1 font-display">
              {rejectedCount}
            </div>
            <div className="text-[11px] text-rose-700/80 dark:text-rose-400/80 mt-0.5">Not approved</div>
          </div>
        </div>

        {/* Main Content Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Apply For Leave Form (5 cols on lg) */}
          <div className="lg:col-span-5 glass-panel p-4 sm:p-6 rounded-2xl sm:rounded-3xl space-y-5 shadow-xl">
            <div className="border-b border-slate-200/90 dark:border-slate-800/80 pb-3">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-indigo-600 dark:text-indigo-400 font-display">
                New Application
              </span>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white font-display">
                Request Leave of Absence
              </h2>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Category Cards Selector */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider font-display">
                  1. Leave Category
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {LEAVE_CATEGORIES.map((cat) => {
                    const isSelected = leaveType === cat.id;
                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => setLeaveType(cat.id)}
                        className={`p-3 rounded-xl border text-left transition-all flex flex-col justify-between ${
                          isSelected
                            ? 'bg-brand-subtle border-brand ring-1 ring-brand shadow-xs'
                            : 'bg-white/60 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{cat.icon}</span>
                          <span
                            className={`text-xs font-bold font-display ${
                              isSelected
                                ? 'text-indigo-600 dark:text-indigo-300'
                                : 'text-slate-800 dark:text-slate-200'
                            }`}
                          >
                            {cat.label}
                          </span>
                        </div>
                        <span className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 leading-tight line-clamp-2">
                          {cat.desc}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Quick Presets */}
              <div className="space-y-1.5 pt-1">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider font-display">
                    2. Duration Presets
                  </label>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400">Quick autofill</span>
                </div>
                <div className="flex flex-wrap items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleApplyPreset(1)}
                    className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-[11px] font-semibold rounded-lg transition"
                  >
                    Today (1d)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleApplyPreset('tomorrow')}
                    className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-[11px] font-semibold rounded-lg transition"
                  >
                    Tomorrow (1d)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleApplyPreset(3)}
                    className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-[11px] font-semibold rounded-lg transition"
                  >
                    3 Days
                  </button>
                  <button
                    type="button"
                    onClick={() => handleApplyPreset(5)}
                    className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-[11px] font-semibold rounded-lg transition"
                  >
                    5 Days (Week)
                  </button>
                </div>
              </div>

              {/* Start Date & End Date */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider font-display">
                    From Date
                  </label>
                  <input
                    type="date"
                    required
                    min={todayStr}
                    value={startDate}
                    onChange={(e) => handleStartDateChange(e.target.value)}
                    className="w-full px-3 py-2.5 bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-slate-200 focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand transition font-medium"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider font-display">
                    To Date
                  </label>
                  <input
                    type="date"
                    required
                    min={startDate || todayStr}
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full px-3 py-2.5 bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-slate-200 focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand transition font-medium"
                  />
                </div>
              </div>

              {/* Duration Indicator */}
              {startDate && endDate && (
                <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 text-xs flex items-center justify-between">
                  <span className="text-slate-600 dark:text-slate-400 font-medium">Calculated Duration:</span>
                  <span
                    className={`font-black font-display ${
                      totalDays > 0 ? 'text-indigo-600 dark:text-indigo-400' : 'text-rose-500'
                    }`}
                  >
                    {totalDays > 0 ? `${totalDays} Day(s)` : 'Invalid date range'}
                  </span>
                </div>
              )}

              {/* Reason For Absence */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider font-display">
                    3. Reason For Absence
                  </label>
                  <span className="text-[10px] text-slate-400 font-mono">{reason.length} chars</span>
                </div>

                <div className="flex flex-wrap gap-1.5 mb-1.5">
                  {REASON_TEMPLATES.map((tmpl, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setReason(tmpl)}
                      className="text-[10px] px-2 py-0.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800/80 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-md transition text-left truncate max-w-[200px]"
                      title={tmpl}
                    >
                      + {tmpl}
                    </button>
                  ))}
                </div>

                <textarea
                  rows={3}
                  required
                  placeholder="Provide concrete details for teacher evaluation and official records..."
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full px-4 py-3 bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand resize-none transition leading-relaxed"
                />
              </div>

              <button
                type="submit"
                disabled={submitting || totalDays <= 0}
                className="w-full py-3.5 btn-premium text-white text-xs font-extrabold shadow-brand tracking-wide flex items-center justify-center gap-2 mt-2 disabled:opacity-60"
              >
                {submitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Submitting to Faculty...</span>
                  </>
                ) : (
                  <span>Submit Leave Request →</span>
                )}
              </button>
            </form>
          </div>

          {/* Leave History List (7 cols on lg) */}
          <div className="lg:col-span-7 space-y-4">
            {/* Header with Search & Filter Bar */}
            <div className="glass-panel p-4 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3 shadow-md">
              <div className="relative w-full sm:w-64">
                <input
                  type="text"
                  placeholder="Search reason or dates..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-7 py-2 bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-brand transition font-medium"
                />
                <span className="absolute left-3 top-2.5 text-slate-400 text-xs">🔍</span>
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2.5 top-2 text-xs text-slate-400 hover:text-slate-600 dark:hover:text-white"
                  >
                    ✕
                  </button>
                )}
              </div>

              {/* Status Filter Tabs */}
              <div className="flex items-center gap-1 overflow-x-auto w-full sm:w-auto p-1 bg-slate-100 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 rounded-xl">
                {['all', 'pending', 'approved', 'rejected'].map((st) => (
                  <button
                    key={st}
                    onClick={() => setFilterStatus(st)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize transition ${
                      filterStatus === st
                        ? 'bg-brand text-white shadow-xs'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>

            {/* List Body */}
            {loading ? (
              <SkeletonCardList count={3} cols={1} />
            ) : filteredLeaves.length === 0 ? (
              <div className="glass-panel p-8 sm:p-12 rounded-2xl sm:rounded-3xl text-center space-y-3">
                <span className="text-5xl">📋</span>
                <h3 className="text-base font-bold text-slate-900 dark:text-white font-display">
                  {searchQuery || filterStatus !== 'all'
                    ? 'No matching leave applications'
                    : 'No leave applications submitted yet'}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                  {searchQuery || filterStatus !== 'all'
                    ? 'Try clearing your search query or selecting a different status filter.'
                    : 'Use the form on the left to submit a planned or medical absence request.'}
                </p>
                {(searchQuery || filterStatus !== 'all') && (
                  <button
                    onClick={() => {
                      setFilterStatus('all');
                      setSearchQuery('');
                    }}
                    className="mt-2 px-4 py-2 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold rounded-xl transition"
                  >
                    Reset Filters
                  </button>
                )}
              </div>
            ) : (
              <div className="space-y-3.5">
                {filteredLeaves.map((leave) => {
                  const isApproved = leave.status === 'approved';
                  const isRejected = leave.status === 'rejected';
                  const isPending = leave.status === 'pending';

                  return (
                    <div
                      key={leave.id}
                      className="glass-panel glass-panel-hover p-4 sm:p-6 rounded-2xl sm:rounded-3xl space-y-3.5 shadow-md transition-all"
                    >
                      {/* Header Row: Category, Duration, and Status */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 border-b border-slate-200/80 dark:border-slate-800/80 pb-3">
                        <div className="flex items-center gap-2.5 flex-wrap">
                          <span className="text-xs font-bold uppercase tracking-wider bg-brand-subtle px-3 py-1 rounded-xl border border-brand text-indigo-700 dark:text-indigo-300 font-display">
                            {leave.leaveType} leave
                          </span>
                          <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                            {leave.totalDays} Day{leave.totalDays > 1 ? 's' : ''} ({leave.startDate} to {leave.endDate})
                          </span>
                        </div>

                        <div className="flex items-center gap-2 self-start sm:self-auto">
                          <span
                            className={`px-3 py-1 text-xs font-extrabold rounded-full border inline-flex items-center gap-1.5 shadow-xs uppercase tracking-wider ${
                              isApproved
                                ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/30'
                                : isRejected
                                ? 'bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/30'
                                : 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/30 animate-pulse'
                            }`}
                          >
                            <span>{isApproved ? '✓' : isRejected ? '✕' : '⏳'}</span>
                            <span className="capitalize">{leave.status}</span>
                          </span>

                          {/* Withdraw Button for pending requests */}
                          {isPending && (
                            <button
                              onClick={() => setWithdrawTarget(leave)}
                              className="px-2.5 py-1 text-[11px] font-bold text-rose-600 hover:text-rose-700 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 rounded-lg transition"
                              title="Withdraw this pending request"
                            >
                              Withdraw
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Reason Description */}
                      <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-950/60 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800/80">
                        "{leave.reason}"
                      </p>

                      {/* Reviewer Feedback (if evaluated) */}
                      {leave.reviewedBy && (
                        <div className="p-3.5 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/20 border border-indigo-200 dark:border-indigo-500/20 text-xs text-slate-700 dark:text-slate-300 space-y-1">
                          <div className="flex items-center justify-between text-[11px] text-indigo-700 dark:text-indigo-400 font-bold">
                            <span>Evaluated by: {leave.reviewedBy}</span>
                            <span>{leave.reviewedAt ? new Date(leave.reviewedAt).toLocaleDateString() : ''}</span>
                          </div>
                          {leave.reviewerNotes && (
                            <p className="italic text-slate-600 dark:text-slate-300">"{leave.reviewerNotes}"</p>
                          )}
                        </div>
                      )}

                      {/* Footer Info */}
                      <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 pt-1">
                        <span>Submitted on {new Date(leave.createdAt).toLocaleDateString()}</span>
                        <span className="font-mono text-[10px] text-slate-400">ID: {leave.id}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Withdraw Confirmation Modal */}
        {withdrawTarget && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in">
            <div className="glass-panel p-6 rounded-3xl border border-slate-200 dark:border-slate-800 max-w-md w-full space-y-4 shadow-2xl bg-white dark:bg-slate-900">
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
                <h3 className="text-base font-bold text-slate-900 dark:text-white font-display">
                  Withdraw Leave Application?
                </h3>
                <button
                  onClick={() => setWithdrawTarget(null)}
                  className="p-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-800 dark:hover:text-white"
                >
                  ✕
                </button>
              </div>

              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                Are you sure you want to withdraw this pending <strong>{withdrawTarget.leaveType} leave</strong> request for{' '}
                <strong>{withdrawTarget.startDate}</strong> to <strong>{withdrawTarget.endDate}</strong> ({withdrawTarget.totalDays} day{withdrawTarget.totalDays > 1 ? 's' : ''})?
                This action will remove it from faculty review queues.
              </p>

              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setWithdrawTarget(null)}
                  disabled={withdrawing}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleWithdrawConfirm}
                  disabled={withdrawing}
                  className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl shadow-lg transition flex items-center gap-2"
                >
                  {withdrawing ? 'Withdrawing...' : 'Yes, Withdraw Application'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </SidebarLayout>
  );
};

export default ApplyLeave;
