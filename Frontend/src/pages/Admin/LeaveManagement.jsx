// frontend/src/pages/Admin/LeaveManagement.jsx
import { useState, useEffect, useMemo } from 'react';
import SidebarLayout from '../../components/common/SidebarLayout';
import { SkeletonCardList } from '../../components/common/SkeletonLoader';
import api from '../../services/api';

const ADMIN_REMARK_TEMPLATES = [
  'Official institutional exemption granted. Attendance percentage protected.',
  'Medical leave approved with standard institutional record waiver.',
  'Academic competition representation approved by Dean of Academics.',
  'Application declined due to non-compliance with institutional minimum attendance criteria.'
];

const LeaveManagement = () => {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filterRole, setFilterRole] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [toast, setToast] = useState(null);

  // Modal review state
  const [selectedLeave, setSelectedLeave] = useState(null);
  const [reviewStatus, setReviewStatus] = useState('approved');
  const [reviewerNotes, setReviewerNotes] = useState('');
  const [reviewing, setReviewing] = useState(false);

  // Delete modal state
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const showToast = (message, isError = false) => {
    setToast({ message, isError });
    setTimeout(() => setToast(null), 4500);
  };

  const fetchLeaves = async (isManual = false) => {
    if (isManual) setRefreshing(true);
    else setLoading(true);

    try {
      const res = await api.get('/leaves/all');
      if (res.data?.success) {
        setLeaves(res.data.leaves || []);
        if (isManual) showToast('Campus leave database synchronized.');
      }
    } catch (err) {
      console.warn('Failed to fetch all leaves:', err);
      const msg = err.parsedMessage || err.response?.data?.message || 'Failed to fetch leaves';
      if (isManual) showToast(msg, true);
    } finally {
      setLoading(false);
      if (isManual) setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchLeaves();
  }, []);

  const handleQuickDecision = async (leaveId, status) => {
    try {
      const res = await api.patch(`/leaves/${leaveId}/status`, {
        status,
        reviewerNotes: status === 'approved' ? 'Approved by Department Administration.' : 'Declined by Department Administration.'
      });
      if (res.data?.success) {
        showToast(`Leave request marked as ${status}!`);
        fetchLeaves();
      }
    } catch (err) {
      const msg = err.parsedMessage || err.response?.data?.message || 'Failed to update leave';
      showToast(msg, true);
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!selectedLeave) return;

    setReviewing(true);
    try {
      const res = await api.patch(`/leaves/${selectedLeave.id}/status`, {
        status: reviewStatus,
        reviewerNotes: reviewerNotes.trim()
      });

      if (res.data?.success) {
        showToast(`Leave application marked as ${reviewStatus}!`);
        setSelectedLeave(null);
        setReviewerNotes('');
        fetchLeaves();
      }
    } catch (err) {
      const msg = err.parsedMessage || err.response?.data?.message || 'Failed to update leave status';
      showToast(msg, true);
    } finally {
      setReviewing(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const res = await api.delete(`/leaves/${deleteTarget.id}`);
      if (res.data?.success) {
        showToast('Leave record purged from institutional archives.');
        setDeleteTarget(null);
        fetchLeaves();
      }
    } catch (err) {
      const msg = err.parsedMessage || err.response?.data?.message || 'Failed to delete record';
      showToast(msg, true);
    } finally {
      setDeleting(false);
    }
  };

  const filteredLeaves = useMemo(() => {
    return leaves.filter((l) => {
      const matchesRole = filterRole === 'all' || l.userRole === filterRole;
      const matchesStatus = filterStatus === 'all' || l.status === filterStatus;
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        (l.userName || '').toLowerCase().includes(q) ||
        (l.userEmail || '').toLowerCase().includes(q) ||
        (l.reason || '').toLowerCase().includes(q) ||
        (l.leaveType || '').toLowerCase().includes(q);

      return matchesRole && matchesStatus && matchesSearch;
    });
  }, [leaves, filterRole, filterStatus, searchQuery]);

  const totalPending = leaves.filter((l) => l.status === 'pending').length;
  const totalApproved = leaves.filter((l) => l.status === 'approved').length;
  const totalRejected = leaves.filter((l) => l.status === 'rejected').length;

  return (
    <SidebarLayout>
      <div className="space-y-6">
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
                Institutional Governance
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                · Campus Leave Approvals Console
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-2 font-display">
              Campus Leave Approvals & Exemption Audit
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-1 max-w-xl leading-relaxed">
              Centrally audit, evaluate, and approve leave requests across faculty members and enrolled students with official exemption tracking.
            </p>
          </div>

          <div className="flex items-center gap-2.5 self-stretch sm:self-auto justify-end">
            <button
              onClick={() => fetchLeaves(true)}
              disabled={refreshing}
              className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-900/90 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-bold rounded-xl border border-slate-200 dark:border-slate-800 transition flex items-center gap-2 shadow-xs"
              title="Refresh database records"
            >
              <span className={refreshing ? 'animate-spin' : ''}>🔄</span>
              <span>{refreshing ? 'Syncing...' : 'Sync Database'}</span>
            </button>
          </div>
        </div>

        {/* KPI Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <div
            onClick={() => setFilterStatus('all')}
            className={`glass-panel glass-panel-hover p-5 rounded-2xl space-y-1 cursor-pointer transition ${
              filterStatus === 'all' ? 'border-brand ring-1 ring-brand' : ''
            }`}
          >
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 font-display">
              Total Applications
            </span>
            <div className="text-3xl font-black text-slate-900 dark:text-white font-display">
              {leaves.length}
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">Across all departments</p>
          </div>

          <div
            onClick={() => setFilterStatus('pending')}
            className={`glass-panel glass-panel-hover p-5 rounded-2xl space-y-1 cursor-pointer transition ${
              filterStatus === 'pending' ? 'border-amber-400 ring-1 ring-amber-400' : ''
            }`}
          >
            <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 font-display">
              <span>Pending Review</span>
              {totalPending > 0 && <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />}
            </div>
            <div className="text-3xl font-black text-amber-600 dark:text-amber-400 font-display">
              {totalPending}
            </div>
            <p className="text-[11px] text-amber-700/80 dark:text-amber-300/80">Awaiting administrative action</p>
          </div>

          <div
            onClick={() => setFilterStatus('approved')}
            className={`glass-panel glass-panel-hover p-5 rounded-2xl space-y-1 cursor-pointer transition ${
              filterStatus === 'approved' ? 'border-emerald-400 ring-1 ring-emerald-400' : ''
            }`}
          >
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 font-display">
              Approved Leaves
            </span>
            <div className="text-3xl font-black text-emerald-600 dark:text-emerald-400 font-display">
              {totalApproved}
            </div>
            <p className="text-[11px] text-emerald-700/80 dark:text-emerald-400/80">Officially excused</p>
          </div>

          <div
            onClick={() => setFilterStatus('rejected')}
            className={`glass-panel glass-panel-hover p-5 rounded-2xl space-y-1 cursor-pointer transition ${
              filterStatus === 'rejected' ? 'border-rose-400 ring-1 ring-rose-400' : ''
            }`}
          >
            <span className="text-[10px] font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400 font-display">
              Rejected Requests
            </span>
            <div className="text-3xl font-black text-rose-600 dark:text-rose-400 font-display">
              {totalRejected}
            </div>
            <p className="text-[11px] text-rose-700/80 dark:text-rose-400/80">Declined applications</p>
          </div>
        </div>

        {/* Search & Filters */}
        <div className="glass-panel p-4 sm:p-5 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-3 shadow-md">
          <div className="relative w-full md:w-80">
            <input
              type="text"
              placeholder="Search applicant name, email, or reason..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-7 py-2.5 bg-white dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-brand transition font-medium"
            />
            <span className="absolute left-3.5 top-3 text-xs text-slate-400">🔍</span>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-2.5 text-xs text-slate-400 hover:text-slate-600 dark:hover:text-white"
              >
                ✕
              </button>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
            {/* Role Filter */}
            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              className="px-3.5 py-2 bg-white dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-700 dark:text-slate-300 focus:outline-none focus:border-brand transition font-semibold"
            >
              <option value="all">All Roles</option>
              <option value="student">Students Only</option>
              <option value="teacher">Teachers Only</option>
            </select>

            {/* Status Filter */}
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3.5 py-2 bg-white dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-700 dark:text-slate-300 focus:outline-none focus:border-brand transition font-semibold"
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending Review</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </div>

        {/* Leave Requests Grid */}
        {loading ? (
          <SkeletonCardList count={4} cols={2} />
        ) : filteredLeaves.length === 0 ? (
          <div className="glass-panel p-16 rounded-3xl text-center space-y-3">
            <span className="text-5xl">📋</span>
            <h3 className="text-base font-bold text-slate-900 dark:text-white font-display">
              No leave requests match your criteria
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Try clearing your search query or selecting all statuses and roles.
            </p>
            {(searchQuery || filterStatus !== 'all' || filterRole !== 'all') && (
              <button
                onClick={() => {
                  setFilterStatus('all');
                  setFilterRole('all');
                  setSearchQuery('');
                }}
                className="mt-2 px-4 py-2 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold rounded-xl transition"
              >
                Reset All Filters
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredLeaves.map((leave) => {
              const isTeacher = leave.userRole === 'teacher';
              const isApproved = leave.status === 'approved';
              const isRejected = leave.status === 'rejected';
              const isPending = leave.status === 'pending';

              return (
                <div
                  key={leave.id}
                  className="glass-panel glass-panel-hover p-5 sm:p-6 rounded-3xl flex flex-col justify-between space-y-4 shadow-md"
                >
                  <div className="space-y-3">
                    {/* Applicant & Status Header */}
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-10 h-10 rounded-xl font-black text-xs flex items-center justify-center text-white shadow-brand ${
                            isTeacher
                              ? 'bg-linear-to-br from-indigo-600 to-purple-600'
                              : 'bg-linear-to-br from-rose-600 to-amber-600'
                          }`}
                        >
                          {leave.userName?.charAt(0).toUpperCase() || 'U'}
                        </div>
                        <div>
                          <h3 className="text-sm font-bold text-slate-900 dark:text-white leading-tight font-display">
                            {leave.userName}
                          </h3>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <span
                              className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${
                                isTeacher
                                  ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-500/20'
                                  : 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20'
                              }`}
                            >
                              {leave.userRole}
                            </span>
                            <span className="text-[11px] text-slate-500 dark:text-slate-400">{leave.userEmail}</span>
                          </div>
                        </div>
                      </div>

                      <span
                        className={`px-3 py-1 text-xs font-extrabold rounded-full border shrink-0 shadow-xs uppercase tracking-wider ${
                          isApproved
                            ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/30'
                            : isRejected
                            ? 'bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/30'
                            : 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/30 animate-pulse'
                        }`}
                      >
                        {leave.status}
                      </span>
                    </div>

                    {/* Category & Period */}
                    <div className="text-xs text-indigo-700 dark:text-indigo-300 font-semibold bg-slate-100 dark:bg-slate-900/60 p-3 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                      <span className="capitalize font-bold font-display">{leave.leaveType} Leave</span>
                      <span className="text-slate-700 dark:text-slate-300">
                        {leave.startDate} → {leave.endDate} ({leave.totalDays} Day{leave.totalDays > 1 ? 's' : ''})
                      </span>
                    </div>

                    {/* Reason */}
                    <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-950/60 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800/80">
                      "{leave.reason}"
                    </p>

                    {/* Review comments */}
                    {leave.reviewedBy && (
                      <div className="text-[11px] text-slate-600 dark:text-slate-400 bg-white/60 dark:bg-slate-900/50 p-3 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-0.5">
                        <span className="font-semibold text-slate-800 dark:text-slate-300 block">
                          Reviewed by <strong className="text-slate-900 dark:text-white">{leave.reviewedBy}</strong>{' '}
                          {leave.reviewedAt ? `on ${new Date(leave.reviewedAt).toLocaleDateString()}` : ''}
                        </span>
                        {leave.reviewerNotes && <p className="italic">"{leave.reviewerNotes}"</p>}
                      </div>
                    )}
                  </div>

                  {/* Actions Bar */}
                  <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between flex-wrap gap-2">
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                      Applied: {new Date(leave.createdAt).toLocaleDateString()}
                    </span>

                    <div className="flex items-center gap-2">
                      {isPending && (
                        <>
                          <button
                            onClick={() => handleQuickDecision(leave.id, 'approved')}
                            className="py-1.5 px-3 bg-emerald-600/10 hover:bg-emerald-600/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 text-xs font-bold rounded-xl transition"
                            title="Quick Approve"
                          >
                            ✓ Approve
                          </button>
                          <button
                            onClick={() => handleQuickDecision(leave.id, 'rejected')}
                            className="py-1.5 px-3 bg-rose-600/10 hover:bg-rose-600/20 text-rose-700 dark:text-rose-300 border border-rose-500/30 text-xs font-bold rounded-xl transition"
                            title="Quick Reject"
                          >
                            ✕ Reject
                          </button>
                        </>
                      )}

                      <button
                        onClick={() => {
                          setSelectedLeave(leave);
                          setReviewStatus(leave.status === 'pending' ? 'approved' : leave.status);
                          setReviewerNotes(leave.reviewerNotes || '');
                        }}
                        className="py-1.5 px-3.5 btn-premium text-white text-xs font-bold shadow-xs"
                      >
                        {leave.status === 'pending' ? 'Take Decision →' : 'Edit Status'}
                      </button>

                      <button
                        onClick={() => setDeleteTarget(leave)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 rounded-lg transition"
                        title="Delete / Archive Record"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Delete / Purge Modal */}
        {deleteTarget && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in">
            <div className="glass-panel p-6 rounded-3xl border border-slate-200 dark:border-slate-800 max-w-md w-full space-y-4 shadow-2xl bg-white dark:bg-slate-900">
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
                <h3 className="text-base font-bold text-slate-900 dark:text-white font-display">
                  Delete Leave Record?
                </h3>
                <button
                  onClick={() => setDeleteTarget(null)}
                  className="p-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-800 dark:hover:text-white"
                >
                  ✕
                </button>
              </div>

              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                Are you sure you want to permanently delete this leave application for{' '}
                <strong>{deleteTarget.userName}</strong> ({deleteTarget.userRole}) covering{' '}
                <strong>{deleteTarget.startDate}</strong> to <strong>{deleteTarget.endDate}</strong>?
                This record will be permanently purged from the database.
              </p>

              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setDeleteTarget(null)}
                  disabled={deleting}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleDeleteConfirm}
                  disabled={deleting}
                  className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl shadow-lg transition flex items-center gap-2"
                >
                  {deleting ? 'Deleting...' : 'Yes, Delete Record'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Evaluation Modal */}
        {selectedLeave && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
            <div className="glass-panel p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-slate-200 dark:border-slate-800 max-w-md w-full max-h-[90vh] overflow-y-auto space-y-4 shadow-2xl bg-white dark:bg-slate-900">
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
                <h3 className="text-base font-bold text-slate-900 dark:text-white font-display">
                  Administrative Leave Review
                </h3>
                <button
                  onClick={() => setSelectedLeave(null)}
                  className="p-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-800 dark:hover:text-white"
                >
                  ✕
                </button>
              </div>

              <div className="text-xs space-y-1 bg-slate-50 dark:bg-slate-950/60 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300">
                <p><strong>Applicant:</strong> {selectedLeave.userName} ({selectedLeave.userRole})</p>
                <p><strong>Email:</strong> {selectedLeave.userEmail}</p>
                <p><strong>Period:</strong> {selectedLeave.startDate} to {selectedLeave.endDate} ({selectedLeave.totalDays} Days)</p>
                <p><strong>Category:</strong> <span className="capitalize">{selectedLeave.leaveType} Leave</span></p>
                <p><strong>Reason:</strong> {selectedLeave.reason}</p>
              </div>

              <form onSubmit={handleReviewSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider font-display">
                    Official Decision
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
                      ✓ Grant / Approve
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
                      ✕ Decline / Reject
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider font-display">
                      Administrative Remarks
                    </label>
                    <span className="text-[10px] text-slate-400">Templates</span>
                  </div>

                  <div className="flex flex-wrap gap-1 mb-1">
                    {ADMIN_REMARK_TEMPLATES.map((tmpl, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setReviewerNotes(tmpl)}
                        className="text-[10px] px-2 py-0.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-md transition text-left truncate max-w-[220px]"
                        title={tmpl}
                      >
                        + {tmpl}
                      </button>
                    ))}
                  </div>

                  <textarea
                    rows={3}
                    placeholder="Enter official remarks, conditions, or waiver references..."
                    value={reviewerNotes}
                    onChange={(e) => setReviewerNotes(e.target.value)}
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
                    {reviewing ? 'Saving...' : 'Save Official Decision'}
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

export default LeaveManagement;
