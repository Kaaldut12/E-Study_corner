// frontend/src/pages/Admin/LeaveManagement.jsx
import { useState, useEffect } from 'react';
import SidebarLayout from '../../components/common/SidebarLayout';
import api from '../../services/api';

const LeaveManagement = () => {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterRole, setFilterRole] = useState('all'); // 'all' | 'student' | 'teacher'
  const [filterStatus, setFilterStatus] = useState('all'); // 'all' | 'pending' | 'approved' | 'rejected'
  const [searchQuery, setSearchQuery] = useState('');
  const [toast, setToast] = useState(null);

  // Modal review state
  const [selectedLeave, setSelectedLeave] = useState(null);
  const [reviewStatus, setReviewStatus] = useState('approved');
  const [reviewerNotes, setReviewerNotes] = useState('');
  const [reviewing, setReviewing] = useState(false);

  const showToast = (message, isError = false) => {
    setToast({ message, isError });
    setTimeout(() => setToast(null), 4000);
  };

  const fetchLeaves = async () => {
    try {
      const res = await api.get('/leaves/all');
      if (res.data.success) {
        setLeaves(res.data.leaves || []);
      }
    } catch (err) {
      console.warn('Failed to fetch all leaves:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaves();
  }, []);

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!selectedLeave) return;

    setReviewing(true);
    try {
      const res = await api.patch(`/leaves/${selectedLeave.id}/status`, {
        status: reviewStatus,
        reviewerNotes: reviewerNotes.trim()
      });

      if (res.data.success) {
        showToast(`Leave application marked as ${reviewStatus}!`);
        setSelectedLeave(null);
        setReviewerNotes('');
        fetchLeaves();
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to update leave status', true);
    } finally {
      setReviewing(false);
    }
  };

  const filteredLeaves = leaves.filter((l) => {
    const matchesRole = filterRole === 'all' || l.userRole === filterRole;
    const matchesStatus = filterStatus === 'all' || l.status === filterStatus;
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      (l.userName || '').toLowerCase().includes(q) ||
      (l.userEmail || '').toLowerCase().includes(q) ||
      (l.reason || '').toLowerCase().includes(q);

    return matchesRole && matchesStatus && matchesSearch;
  });

  const totalPending = leaves.filter((l) => l.status === 'pending').length;
  const totalApproved = leaves.filter((l) => l.status === 'approved').length;
  const totalRejected = leaves.filter((l) => l.status === 'rejected').length;

  return (
    <SidebarLayout>
      <div className="space-y-6">
        {/* Toast Alert */}
        {toast && (
          <div
            className={`fixed top-5 right-5 z-50 px-5 py-3 rounded-2xl text-xs font-bold shadow-2xl transition-all ${
              toast.isError
                ? 'bg-rose-600 text-white border border-rose-400 shadow-rose-900/40'
                : 'bg-emerald-600 text-white border border-emerald-400 shadow-emerald-900/40'
            }`}
          >
            {toast.isError ? '⚠️ ' : '✓ '}
            {toast.message}
          </div>
        )}

        {/* Header */}
        <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-rose-400">Institutional Governance</span>
            <h1 className="text-2xl sm:text-3xl font-black text-white mt-1">Campus Leave Approvals</h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Centrally review and audit leave applications across faculty members and enrolled students.
            </p>
          </div>
        </div>

        {/* KPI Metrics */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Applications</span>
            <div className="text-2xl font-black text-white">{leaves.length}</div>
            <p className="text-[10px] text-slate-500">Across all departments</p>
          </div>

          <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400">Pending Review</span>
            <div className="text-2xl font-black text-amber-400">{totalPending}</div>
            <p className="text-[10px] text-slate-500">Awaiting administrative action</p>
          </div>

          <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">Approved Leaves</span>
            <div className="text-2xl font-black text-emerald-400">{totalApproved}</div>
            <p className="text-[10px] text-slate-500">Active and archived grants</p>
          </div>

          <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-rose-400">Rejected Requests</span>
            <div className="text-2xl font-black text-rose-400">{totalRejected}</div>
            <p className="text-[10px] text-slate-500">Declined applications</p>
          </div>
        </div>

        {/* Search & Filters */}
        <div className="glass-panel p-4 rounded-2xl border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-3">
          <div className="relative w-full md:w-80">
            <input
              type="text"
              placeholder="Search applicant name, email, or reason..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-900 border border-slate-750 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
            <span className="absolute left-3 top-2.5 text-xs text-slate-500">🔍</span>
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            {/* Role Filter */}
            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              className="px-3 py-1.5 bg-slate-900 border border-slate-750 rounded-xl text-xs text-slate-300 focus:outline-none focus:border-indigo-500"
            >
              <option value="all">All Roles</option>
              <option value="student">Students</option>
              <option value="teacher">Teachers</option>
            </select>

            {/* Status Filter */}
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-1.5 bg-slate-900 border border-slate-750 rounded-xl text-xs text-slate-300 focus:outline-none focus:border-indigo-500"
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </div>

        {/* Leave Requests Grid */}
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-9 h-9 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : filteredLeaves.length === 0 ? (
          <div className="glass-panel p-16 rounded-3xl border border-slate-800 text-center space-y-3">
            <span className="text-4xl">📋</span>
            <h3 className="text-base font-bold text-white">No leave requests match your filters</h3>
            <p className="text-xs text-slate-400">Try clearing your search query or selecting all statuses.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredLeaves.map((leave) => {
              const isTeacher = leave.userRole === 'teacher';
              const isApproved = leave.status === 'approved';
              const isRejected = leave.status === 'rejected';

              return (
                <div
                  key={leave.id}
                  className="glass-panel p-5 rounded-3xl border border-slate-800 flex flex-col justify-between space-y-4 hover:border-slate-700 transition"
                >
                  <div className="space-y-3">
                    {/* Applicant & Status Header */}
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-10 h-10 rounded-xl font-black text-xs flex items-center justify-center text-white shadow ${
                            isTeacher
                              ? 'bg-gradient-to-br from-indigo-600 to-purple-600'
                              : 'bg-gradient-to-br from-rose-600 to-amber-600'
                          }`}
                        >
                          {leave.userName?.charAt(0).toUpperCase() || 'U'}
                        </div>
                        <div>
                          <h3 className="text-sm font-bold text-white leading-tight">{leave.userName}</h3>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <span
                              className={`text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.2 rounded ${
                                isTeacher
                                  ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
                                  : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                              }`}
                            >
                              {leave.userRole}
                            </span>
                            <span className="text-[11px] text-slate-400">{leave.userEmail}</span>
                          </div>
                        </div>
                      </div>

                      <span
                        className={`px-2.5 py-1 text-xs font-bold rounded-full border shrink-0 ${
                          isApproved
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                            : isRejected
                            ? 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                            : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                        }`}
                      >
                        {leave.status}
                      </span>
                    </div>

                    {/* Category & Period */}
                    <div className="text-xs text-indigo-300 font-semibold bg-slate-900/60 p-2.5 rounded-xl border border-slate-800 flex items-center justify-between">
                      <span className="capitalize">{leave.leaveType} Leave</span>
                      <span>
                        {leave.startDate} → {leave.endDate} ({leave.totalDays} Day{leave.totalDays > 1 ? 's' : ''})
                      </span>
                    </div>

                    {/* Reason */}
                    <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/40 p-3 rounded-xl border border-slate-800/60">
                      "{leave.reason}"
                    </p>

                    {/* Review comments */}
                    {leave.reviewedBy && (
                      <div className="text-[11px] text-slate-400 bg-slate-900/40 p-2.5 rounded-xl border border-slate-800 space-y-0.5">
                        <span className="font-semibold text-slate-300 block">
                          Reviewed by {leave.reviewedBy} on {new Date(leave.reviewedAt).toLocaleDateString()}
                        </span>
                        {leave.reviewerNotes && <p className="italic">"{leave.reviewerNotes}"</p>}
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
                    <span className="text-[10px] text-slate-500">
                      Applied: {new Date(leave.createdAt).toLocaleDateString()}
                    </span>
                    <button
                      onClick={() => {
                        setSelectedLeave(leave);
                        setReviewStatus(leave.status === 'pending' ? 'approved' : leave.status);
                        setReviewerNotes(leave.reviewerNotes || '');
                      }}
                      className="py-1.5 px-4 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl shadow transition"
                    >
                      {leave.status === 'pending' ? 'Take Decision →' : 'Update Status'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Modal */}
        {selectedLeave && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
            <div className="glass-panel p-6 rounded-3xl border border-slate-800 max-w-md w-full space-y-4 shadow-2xl">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="text-base font-bold text-white">Administrative Leave Review</h3>
                <button
                  onClick={() => setSelectedLeave(null)}
                  className="p-1 rounded-lg bg-slate-900 text-slate-400 hover:text-white"
                >
                  ✕
                </button>
              </div>

              <div className="text-xs space-y-1 bg-slate-950/50 p-3 rounded-xl border border-slate-800">
                <p><strong>Applicant:</strong> {selectedLeave.userName} ({selectedLeave.userRole})</p>
                <p><strong>Period:</strong> {selectedLeave.startDate} to {selectedLeave.endDate} ({selectedLeave.totalDays} Days)</p>
                <p><strong>Reason:</strong> {selectedLeave.reason}</p>
              </div>

              <form onSubmit={handleReviewSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">Official Decision</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setReviewStatus('approved')}
                      className={`py-2 text-xs font-bold rounded-xl border transition ${
                        reviewStatus === 'approved'
                          ? 'bg-emerald-600 text-white border-emerald-500 shadow-md'
                          : 'bg-slate-900 text-slate-400 border-slate-800'
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
                          : 'bg-slate-900 text-slate-400 border-slate-800'
                      }`}
                    >
                      ✕ Decline / Reject
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">Administrative Remarks</label>
                  <textarea
                    rows={3}
                    placeholder="Enter official remarks or conditions..."
                    value={reviewerNotes}
                    onChange={(e) => setReviewerNotes(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-750 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-indigo-500 resize-none"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setSelectedLeave(null)}
                    className="px-4 py-2 bg-slate-900 text-slate-300 hover:text-white text-xs font-semibold rounded-xl"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={reviewing}
                    className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl shadow transition"
                  >
                    {reviewing ? 'Saving...' : 'Save Decision'}
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
