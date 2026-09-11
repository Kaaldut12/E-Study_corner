// frontend/src/pages/Teacher/TeacherLeaves.jsx
import { useState, useEffect, useMemo } from 'react';
import SidebarLayout from '../../components/common/SidebarLayout';
import { SkeletonCardList } from '../../components/common/SkeletonLoader';
import api from '../../services/api';

const LEAVE_TYPES = [
  { id: 'casual', label: 'Casual / Personal Leave', icon: '🏠', desc: 'Personal commitments or urgent domestic work' },
  { id: 'sick', label: 'Medical / Sick Leave', icon: '🩺', desc: 'Illness, surgery recovery, or doctor consultations' },
  { id: 'academic', label: 'Faculty Training / Research', icon: '🎓', desc: 'Conferences, workshops, or academic publishing' },
  { id: 'vacation', label: 'Official Vacation / Recess', icon: '🏖️', desc: 'Semester breaks or institutional recess' }
];

const NOTE_TEMPLATES = [
  'Approved. Please coordinate with peer faculty for lecture coverage.',
  'Approved. Please submit coursework assignments online.',
  'Approved for medical recovery. Get well soon.',
  'Declined due to scheduled department examinations.'
];

const getTodayString = () => new Date().toISOString().split('T')[0];

const addDaysToDate = (baseDateStr, daysToAdd) => {
  const d = new Date(baseDateStr || Date.now());
  d.setDate(d.getDate() + daysToAdd);
  return d.toISOString().split('T')[0];
};

const TeacherLeaves = () => {
  const [activeTab, setActiveTab] = useState('faculty');
  const [myLeaves, setMyLeaves] = useState([]);
  const [studentLeaves, setStudentLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState(null);

  // Review modal state
  const [selectedLeave, setSelectedLeave] = useState(null);
  const [reviewStatus, setReviewStatus] = useState('approved');
  const [reviewNotes, setReviewNotes] = useState('');
  const [reviewing, setReviewing] = useState(false);

  // Withdraw state for teacher's own leave
  const [withdrawTarget, setWithdrawTarget] = useState(null);
  const [withdrawing, setWithdrawing] = useState(false);

  // Student filter & search states
  const [studentFilterStatus, setStudentFilterStatus] = useState('all');
  const [studentSearchQuery, setStudentSearchQuery] = useState('');

  // Faculty form states
  const todayStr = getTodayString();
  const [leaveType, setLeaveType] = useState('casual');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reason, setReason] = useState('');

  const showToast = (message, isError = false) => {
    setToast({ message, isError });
    setTimeout(() => setToast(null), 4500);
  };

  const handleQuickStatus = async (leaveId, nextStatus) => {
    try {
      const res = await api.patch(`/leaves/${leaveId}/status`, {
        status: nextStatus,
        reviewerNotes: nextStatus === 'approved' ? 'Approved by faculty.' : 'Application declined by faculty.'
      });
      if (res.data?.success) {
        showToast(`Leave request ${nextStatus} successfully!`);
        fetchData();
      }
    } catch (err) {
      const msg = err.parsedMessage || err.response?.data?.message || 'Failed to update leave';
      showToast(msg, true);
    }
  };

  const fetchData = async (isManual = false) => {
    if (isManual) setRefreshing(true);
    else setLoading(true);

    try {
      const [myRes, allRes] = await Promise.all([
        api.get('/leaves/my-leaves'),
        api.get('/leaves/all?role=student')
      ]);

      if (myRes.data?.success) {
        setMyLeaves(myRes.data.leaves || []);
      }
      if (allRes.data?.success) {
        setStudentLeaves(allRes.data.leaves || []);
      }
      if (isManual) showToast('Faculty & student leaves synchronized with server.');
    } catch (err) {
      console.warn('Error fetching leaves:', err);
      const msg = err.parsedMessage || err.response?.data?.message || 'Failed to fetch leaves';
      if (isManual) showToast(msg, true);
    } finally {
      setLoading(false);
      if (isManual) setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const calculateDays = (startStr, endStr) => {
    if (!startStr || !endStr) return 1;
    const diff = new Date(endStr) - new Date(startStr);
    if (diff < 0) return 0;
    return Math.ceil(diff / (1000 * 60 * 60 * 24)) + 1;
  };

  const totalDays = calculateDays(startDate, endDate);

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
    if (!endDate || new Date(endDate) < new Date(val)) {
      setEndDate(val);
    }
  };

  const handleApply = async (e) => {
    e.preventDefault();
    if (!startDate || !endDate || !reason.trim()) {
      showToast('Please fill in all fields.', true);
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
        showToast('Faculty leave request submitted successfully!');
        setReason('');
        setStartDate('');
        setEndDate('');
        fetchData();
      }
    } catch (err) {
      const msg = err.parsedMessage || err.response?.data?.message || 'Error submitting leave';
      showToast(msg, true);
    } finally {
      setSubmitting(false);
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!selectedLeave) return;

    setReviewing(true);
    try {
      const res = await api.patch(`/leaves/${selectedLeave.id}/status`, {
        status: reviewStatus,
        reviewerNotes: reviewNotes.trim()
      });

      if (res.data?.success) {
        showToast(`Leave request marked as ${reviewStatus} successfully!`);
        setSelectedLeave(null);
        setReviewNotes('');
        fetchData();
      }
    } catch (err) {
      const msg = err.parsedMessage || err.response?.data?.message || 'Failed to update leave';
      showToast(msg, true);
    } finally {
      setReviewing(false);
    }
  };

  const handleWithdrawConfirm = async () => {
    if (!withdrawTarget) return;
    setWithdrawing(true);
    try {
      const res = await api.delete(`/leaves/${withdrawTarget.id}`);
      if (res.data?.success) {
        showToast('Faculty leave application withdrawn.');
        setWithdrawTarget(null);
        fetchData();
      }
    } catch (err) {
      const msg = err.parsedMessage || err.response?.data?.message || 'Could not withdraw leave';
      showToast(msg, true);
    } finally {
      setWithdrawing(false);
    }
  };

  const pendingStudentLeaves = studentLeaves.filter((l) => l.status === 'pending');

  const filteredStudentLeaves = useMemo(() => {
    return studentLeaves.filter((l) => {
      const matchesStatus = studentFilterStatus === 'all' || l.status === studentFilterStatus;
      const q = studentSearchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        (l.userName || '').toLowerCase().includes(q) ||
        (l.userEmail || '').toLowerCase().includes(q) ||
        (l.reason || '').toLowerCase().includes(q) ||
        (l.leaveType || '').toLowerCase().includes(q);
      return matchesStatus && matchesSearch;
    });
  }, [studentLeaves, studentFilterStatus, studentSearchQuery]);

  const approvedStudentCount = studentLeaves.filter((l) => l.status === 'approved').length;
  const rejectedStudentCount = studentLeaves.filter((l) => l.status === 'rejected').length;

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

        {/* Header */}
        <div className="glass-panel glass-card-accent p-4 sm:p-6 lg:p-8 rounded-2xl sm:rounded-3xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-5 shadow-2xl">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-3 py-1 rounded-full bg-brand-subtle text-indigo-600 dark:text-indigo-400 border border-brand text-[11px] font-extrabold uppercase tracking-widest font-display">
                Faculty Governance
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                · Leave Management Hub
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-2 font-display">
              Faculty Leave & Student Review Console
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-1 max-w-xl leading-relaxed">
              Submit personal faculty leaves for administrative approval and evaluate attendance exemption requests from enrolled students.
            </p>
          </div>

          <div className="flex items-center gap-3 self-stretch sm:self-auto justify-between sm:justify-end flex-wrap">
            {/* Tab Switcher */}
            <div className="flex p-1.5 bg-slate-100 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 rounded-2xl shrink-0 shadow-inner">
              <button
                onClick={() => setActiveTab('faculty')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  activeTab === 'faculty'
                    ? 'bg-brand text-white shadow-brand ring-1 ring-white/20'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                My Faculty Leaves
              </button>
              <button
                onClick={() => setActiveTab('students')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                  activeTab === 'students'
                    ? 'bg-brand text-white shadow-brand ring-1 ring-white/20'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <span>Student Requests</span>
                {pendingStudentLeaves.length > 0 && (
                  <span className="px-2 py-0.5 bg-rose-500 text-white rounded-full text-[10px] font-black animate-pulse">
                    {pendingStudentLeaves.length}
                  </span>
                )}
              </button>
            </div>

            {/* Sync Button */}
            <button
              onClick={() => fetchData(true)}
              disabled={refreshing}
              className="p-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-xl border border-slate-200 dark:border-slate-800 transition shadow-xs"
              title="Sync latest data"
            >
              <span className={refreshing ? 'inline-block animate-spin' : ''}>🔄</span>
            </button>
          </div>
        </div>

        {/* Tab 1: Faculty Leave */}
        {activeTab === 'faculty' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Form (5 cols on lg) */}
            <div className="lg:col-span-5 glass-panel p-4 sm:p-6 rounded-2xl sm:rounded-3xl space-y-5 shadow-xl">
              <div className="border-b border-slate-200/80 dark:border-slate-800/80 pb-3">
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-indigo-600 dark:text-indigo-400 font-display">
                  Faculty Request
                </span>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white font-display">
                  Apply for Faculty Leave
                </h2>
              </div>

              <form onSubmit={handleApply} className="space-y-4">
                {/* Category Selection */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider font-display">
                    Leave Category
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {LEAVE_TYPES.map((t) => {
                      const isSelected = leaveType === t.id;
                      return (
                        <button
                          key={t.id}
                          type="button"
                          onClick={() => setLeaveType(t.id)}
                          className={`p-3 rounded-xl border text-left transition flex flex-col justify-between ${
                            isSelected
                              ? 'bg-brand-subtle border-brand ring-1 ring-brand shadow-xs'
                              : 'bg-white/60 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <span className="text-lg">{t.icon}</span>
                            <span
                              className={`text-xs font-bold font-display ${
                                isSelected ? 'text-indigo-600 dark:text-indigo-300' : 'text-slate-800 dark:text-slate-200'
                              }`}
                            >
                              {t.label}
                            </span>
                          </div>
                          <span className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                            {t.desc}
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
                      Duration Presets
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

                {/* Dates */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider font-display">
                      Start Date
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
                      End Date
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

                {startDate && endDate && (
                  <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 text-xs flex items-center justify-between">
                    <span className="text-slate-600 dark:text-slate-400 font-medium">Duration:</span>
                    <span
                      className={`font-black font-display ${
                        totalDays > 0 ? 'text-indigo-600 dark:text-indigo-400' : 'text-rose-500'
                      }`}
                    >
                      {totalDays > 0 ? `${totalDays} Day(s)` : 'Invalid dates'}
                    </span>
                  </div>
                )}

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider font-display">
                    Reason & Lecture Coverage Notes
                  </label>
                  <textarea
                    rows={4}
                    required
                    placeholder="Details for Dean/Admin approval and lecture substitution arrangements..."
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
                  {submitting ? 'Submitting to Administration...' : 'Submit Faculty Leave →'}
                </button>
              </form>
            </div>

            {/* My Faculty Leaves List (7 cols on lg) */}
            <div className="lg:col-span-7 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-bold text-slate-900 dark:text-white font-display">
                  My Submitted Leaves ({myLeaves.length})
                </h2>
              </div>

              {loading ? (
                <SkeletonCardList count={3} cols={1} />
              ) : myLeaves.length === 0 ? (
                <div className="glass-panel p-10 sm:p-12 rounded-3xl text-center space-y-2">
                  <span className="text-5xl">🏖️</span>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white font-display">
                    No faculty leaves recorded
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    You have no active or archived faculty leaves. Fill out the application form whenever taking time off.
                  </p>
                </div>
              ) : (
                <div className="space-y-3.5">
                  {myLeaves.map((leave) => {
                    const isApproved = leave.status === 'approved';
                    const isRejected = leave.status === 'rejected';
                    const isPending = leave.status === 'pending';

                    return (
                      <div
                        key={leave.id}
                        className="glass-panel glass-panel-hover p-4 sm:p-6 rounded-2xl sm:rounded-3xl space-y-3 shadow-md"
                      >
                        <div className="flex items-center justify-between flex-wrap gap-2">
                          <span className="text-xs font-bold uppercase tracking-wider bg-brand-subtle px-3 py-1 rounded-xl border border-brand text-indigo-700 dark:text-indigo-300 font-display">
                            {leave.leaveType} • {leave.totalDays} Day(s) ({leave.startDate} to {leave.endDate})
                          </span>

                          <div className="flex items-center gap-2">
                            <span
                              className={`px-3 py-1 text-xs font-extrabold rounded-full border shadow-xs uppercase tracking-wider ${
                                isApproved
                                  ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/30'
                                  : isRejected
                                  ? 'bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/30'
                                  : 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/30 animate-pulse'
                              }`}
                            >
                              {leave.status}
                            </span>

                            {isPending && (
                              <button
                                onClick={() => setWithdrawTarget(leave)}
                                className="px-2.5 py-1 text-[11px] font-bold text-rose-600 hover:text-rose-700 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 rounded-lg transition"
                              >
                                Withdraw
                              </button>
                            )}
                          </div>
                        </div>

                        <p className="text-xs text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-950/60 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800/80 leading-relaxed">
                          "{leave.reason}"
                        </p>

                        {leave.reviewedBy && (
                          <div className="text-xs text-slate-600 dark:text-slate-400 italic bg-indigo-50/70 dark:bg-indigo-950/20 p-3 rounded-xl border border-indigo-200 dark:border-indigo-500/20">
                            Reviewed by <strong className="text-slate-900 dark:text-slate-200">{leave.reviewedBy}</strong>: "{leave.reviewerNotes || 'Approved'}"
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab 2: Review Student Requests */}
        {activeTab === 'students' && (
          <div className="space-y-5">
            {/* Metrics Header */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
              <div
                onClick={() => setStudentFilterStatus('all')}
                className={`glass-panel p-4 rounded-2xl cursor-pointer transition ${
                  studentFilterStatus === 'all' ? 'border-brand ring-1 ring-brand' : ''
                }`}
              >
                <div className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider font-display">
                  Total Inquiries
                </div>
                <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-1 font-display">
                  {studentLeaves.length}
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">All student requests</div>
              </div>

              <div
                onClick={() => setStudentFilterStatus('pending')}
                className={`glass-panel p-4 rounded-2xl cursor-pointer transition ${
                  studentFilterStatus === 'pending' ? 'border-amber-400 ring-1 ring-amber-400' : ''
                }`}
              >
                <div className="flex items-center justify-between text-[10px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider font-display">
                  <span>Awaiting Review</span>
                  {pendingStudentLeaves.length > 0 && <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />}
                </div>
                <div className="text-2xl sm:text-3xl font-black text-amber-600 dark:text-amber-400 mt-1 font-display">
                  {pendingStudentLeaves.length}
                </div>
                <div className="text-[11px] text-amber-700/80 dark:text-amber-300/80 mt-0.5">Action needed</div>
              </div>

              <div
                onClick={() => setStudentFilterStatus('approved')}
                className={`glass-panel p-4 rounded-2xl cursor-pointer transition ${
                  studentFilterStatus === 'approved' ? 'border-emerald-400 ring-1 ring-emerald-400' : ''
                }`}
              >
                <div className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider font-display">
                  Approved Grants
                </div>
                <div className="text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400 mt-1 font-display">
                  {approvedStudentCount}
                </div>
                <div className="text-[11px] text-emerald-700/80 dark:text-emerald-400/80 mt-0.5">Excused absences</div>
              </div>

              <div
                onClick={() => setStudentFilterStatus('rejected')}
                className={`glass-panel p-4 rounded-2xl cursor-pointer transition ${
                  studentFilterStatus === 'rejected' ? 'border-rose-400 ring-1 ring-rose-400' : ''
                }`}
              >
                <div className="text-[10px] font-bold text-rose-600 dark:text-rose-400 uppercase tracking-wider font-display">
                  Declined
                </div>
                <div className="text-2xl sm:text-3xl font-black text-rose-600 dark:text-rose-400 mt-1 font-display">
                  {rejectedStudentCount}
                </div>
                <div className="text-[11px] text-rose-700/80 dark:text-rose-400/80 mt-0.5">Rejected applications</div>
              </div>
            </div>

            {/* Search & Filter Bar */}
            <div className="glass-panel p-4 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3 shadow-md">
              <div className="relative w-full sm:w-80">
                <input
                  type="text"
                  placeholder="Search student name, email, or reason..."
                  value={studentSearchQuery}
                  onChange={(e) => setStudentSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-7 py-2.5 bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-brand transition font-medium"
                />
                <span className="absolute left-3 top-3 text-slate-400 text-xs">🔍</span>
                {studentSearchQuery && (
                  <button
                    onClick={() => setStudentSearchQuery('')}
                    className="absolute right-3 top-2.5 text-xs text-slate-400 hover:text-slate-600 dark:hover:text-white"
                  >
                    ✕
                  </button>
                )}
              </div>

              <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto p-1 bg-slate-100 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 rounded-xl">
                {['all', 'pending', 'approved', 'rejected'].map((st) => (
                  <button
                    key={st}
                    onClick={() => setStudentFilterStatus(st)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize transition ${
                      studentFilterStatus === st
                        ? 'bg-brand text-white shadow-xs'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>

            {/* Student Leaves List */}
            {loading ? (
              <SkeletonCardList count={4} cols={2} />
            ) : filteredStudentLeaves.length === 0 ? (
              <div className="glass-panel p-12 rounded-3xl text-center space-y-2">
                <span className="text-5xl">🎓</span>
                <h3 className="text-base font-bold text-slate-900 dark:text-white font-display">
                  No student leave requests found
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {studentSearchQuery || studentFilterStatus !== 'all'
                    ? 'No requests match the current filter or search query.'
                    : 'All student leave requests are up to date.'}
                </p>
                {(studentSearchQuery || studentFilterStatus !== 'all') && (
                  <button
                    onClick={() => {
                      setStudentFilterStatus('all');
                      setStudentSearchQuery('');
                    }}
                    className="mt-2 px-4 py-2 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold rounded-xl transition"
                  >
                    Reset Filters
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredStudentLeaves.map((sub) => (
                  <div
                    key={sub.id}
                    className="glass-panel glass-panel-hover p-5 sm:p-6 rounded-3xl space-y-4 flex flex-col justify-between shadow-md"
                  >
                    <div className="space-y-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-brand-subtle text-indigo-700 dark:text-indigo-300 border border-brand flex items-center justify-center font-bold text-sm shadow-inner">
                            {(sub.userName || 'S').charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <h3 className="text-sm font-bold text-slate-900 dark:text-white font-display">
                              {sub.userName}
                            </h3>
                            <span className="text-xs text-slate-500 dark:text-slate-400">{sub.userEmail}</span>
                          </div>
                        </div>
                        <span
                          className={`px-3 py-1 text-[11px] font-extrabold uppercase tracking-wider rounded-full border shadow-xs ${
                            sub.status === 'approved'
                              ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/30'
                              : sub.status === 'rejected'
                              ? 'bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/30'
                              : 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/30 animate-pulse'
                          }`}
                        >
                          {sub.status}
                        </span>
                      </div>

                      <div className="p-2.5 bg-slate-100 dark:bg-slate-950/60 rounded-xl border border-slate-200 dark:border-slate-800/80 flex items-center justify-between text-xs">
                        <span className="font-bold text-indigo-700 dark:text-indigo-300 uppercase tracking-wider font-display">
                          {sub.leaveType} Leave
                        </span>
                        <span className="font-mono text-slate-700 dark:text-slate-300">
                          {sub.startDate} → {sub.endDate} ({sub.totalDays} Day{sub.totalDays > 1 ? 's' : ''})
                        </span>
                      </div>

                      <p className="text-xs text-slate-700 dark:text-slate-300 bg-white/70 dark:bg-slate-900/70 p-3 rounded-xl border border-slate-200 dark:border-slate-800 leading-relaxed">
                        "{sub.reason}"
                      </p>

                      {sub.reviewedBy && (
                        <div className="text-[11px] text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-950/40 p-2.5 rounded-lg border border-slate-200 dark:border-slate-800/60">
                          Reviewed by <strong className="text-slate-800 dark:text-slate-200">{sub.reviewedBy}</strong>: "{sub.reviewerNotes || 'Reviewed'}"
                        </div>
                      )}
                    </div>

                    <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-2 flex-wrap">
                      <span className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                        Applied {new Date(sub.createdAt).toLocaleDateString()}
                      </span>

                      <div className="flex items-center gap-2">
                        {sub.status === 'pending' && (
                          <>
                            <button
                              onClick={() => handleQuickStatus(sub.id, 'approved')}
                              className="py-1.5 px-3 bg-emerald-600/10 hover:bg-emerald-600/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 text-xs font-bold rounded-xl transition"
                              title="Quick Approve"
                            >
                              ✓ Approve
                            </button>
                            <button
                              onClick={() => handleQuickStatus(sub.id, 'rejected')}
                              className="py-1.5 px-3 bg-rose-600/10 hover:bg-rose-600/20 text-rose-700 dark:text-rose-300 border border-rose-500/30 text-xs font-bold rounded-xl transition"
                              title="Quick Reject"
                            >
                              ✕ Reject
                            </button>
                          </>
                        )}
                        <button
                          onClick={() => {
                            setSelectedLeave(sub);
                            setReviewStatus(sub.status === 'pending' ? 'approved' : sub.status);
                            setReviewNotes(sub.reviewerNotes || '');
                          }}
                          className="py-1.5 px-3.5 btn-premium text-white text-xs font-bold shadow-xs"
                        >
                          {sub.status === 'pending' ? 'Evaluate...' : 'Edit Decision'}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Withdraw Confirmation Modal (for teacher's own leave) */}
        {withdrawTarget && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in">
            <div className="glass-panel p-6 rounded-3xl border border-slate-200 dark:border-slate-800 max-w-md w-full space-y-4 shadow-2xl bg-white dark:bg-slate-900">
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
                <h3 className="text-base font-bold text-slate-900 dark:text-white font-display">
                  Withdraw Faculty Leave?
                </h3>
                <button
                  onClick={() => setWithdrawTarget(null)}
                  className="p-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-800 dark:hover:text-white"
                >
                  ✕
                </button>
              </div>

              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                Are you sure you want to withdraw your pending <strong>{withdrawTarget.leaveType} leave</strong> request for{' '}
                <strong>{withdrawTarget.startDate}</strong> to <strong>{withdrawTarget.endDate}</strong> ({withdrawTarget.totalDays} day{withdrawTarget.totalDays > 1 ? 's' : ''})?
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

        {/* Evaluation Modal */}
        {selectedLeave && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
            <div className="glass-panel p-5 sm:p-6 rounded-2xl sm:rounded-3xl border border-slate-200 dark:border-slate-800 max-w-md w-full max-h-[90vh] overflow-y-auto space-y-4 shadow-2xl bg-white dark:bg-slate-900">
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
                <h3 className="text-base font-bold text-slate-900 dark:text-white font-display">
                  Evaluate Student Leave
                </h3>
                <button
                  onClick={() => setSelectedLeave(null)}
                  className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-800 dark:hover:text-white"
                >
                  ✕
                </button>
              </div>

              <div className="text-xs space-y-1.5 bg-slate-50 dark:bg-slate-950/60 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300">
                <p><strong>Student:</strong> {selectedLeave.userName} ({selectedLeave.userEmail})</p>
                <p><strong>Period:</strong> {selectedLeave.startDate} to {selectedLeave.endDate} ({selectedLeave.totalDays} Days)</p>
                <p><strong>Category:</strong> <span className="capitalize">{selectedLeave.leaveType} Leave</span></p>
                <p><strong>Reason:</strong> "{selectedLeave.reason}"</p>
              </div>

              <form onSubmit={handleReviewSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider font-display">
                    Decision
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setReviewStatus('approved')}
                      className={`py-2 text-xs font-bold rounded-xl border transition ${
                        reviewStatus === 'approved'
                          ? 'bg-emerald-600 text-white border-emerald-500 shadow-md'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700'
                      }`}
                    >
                      ✓ Approve
                    </button>
                    <button
                      type="button"
                      onClick={() => setReviewStatus('rejected')}
                      className={`py-2 text-xs font-bold rounded-xl border transition ${
                        reviewStatus === 'rejected'
                          ? 'bg-rose-600 text-white border-rose-500 shadow-md'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700'
                      }`}
                    >
                      ✕ Reject
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider font-display">
                      Faculty Remarks / Feedback
                    </label>
                    <span className="text-[10px] text-slate-400">Templates</span>
                  </div>

                  <div className="flex flex-wrap gap-1 mb-1">
                    {NOTE_TEMPLATES.map((t, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setReviewNotes(t)}
                        className="text-[10px] px-2 py-0.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-md transition text-left truncate max-w-[220px]"
                        title={t}
                      >
                        + {t}
                      </button>
                    ))}
                  </div>

                  <textarea
                    rows={3}
                    placeholder="e.g. Approved. Please coordinate with classmates for lecture notes."
                    value={reviewNotes}
                    onChange={(e) => setReviewNotes(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-slate-200 focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand resize-none transition"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setSelectedLeave(null)}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold rounded-xl transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={reviewing}
                    className="px-5 py-2 btn-premium text-white text-xs font-bold rounded-xl shadow-brand"
                  >
                    {reviewing ? 'Saving...' : 'Confirm Decision'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </SidebarLayout>
  );
};

export default TeacherLeaves;
