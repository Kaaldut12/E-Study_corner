// frontend/src/pages/Teacher/TeacherLeaves.jsx
import { useState, useEffect } from 'react';
import SidebarLayout from '../../components/common/SidebarLayout';
import { SkeletonCardList } from '../../components/common/SkeletonLoader';
import api from '../../services/api';

const LEAVE_TYPES = [
  { id: 'casual', label: 'Casual / Personal Leave', icon: '🏠' },
  { id: 'sick', label: 'Medical / Sick Leave', icon: '🩺' },
  { id: 'academic', label: 'Faculty Training / Conference / Research', icon: '🎓' },
  { id: 'vacation', label: 'Official Vacation / Break', icon: '🏖️' }
];

const TeacherLeaves = () => {
  const [activeTab, setActiveTab] = useState('faculty');
  const [myLeaves, setMyLeaves] = useState([]);
  const [studentLeaves, setStudentLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState(null);

  // Review modal state
  const [selectedLeave, setSelectedLeave] = useState(null);
  const [reviewStatus, setReviewStatus] = useState('approved');
  const [reviewNotes, setReviewNotes] = useState('');
  const [reviewing, setReviewing] = useState(false);

  // Student filter & search states
  const [studentFilterStatus, setStudentFilterStatus] = useState('all');
  const [studentSearchQuery, setStudentSearchQuery] = useState('');

  // Faculty form states
  const [leaveType, setLeaveType] = useState('casual');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reason, setReason] = useState('');

  const showToast = (message, isError = false) => {
    setToast({ message, isError });
    setTimeout(() => setToast(null), 4000);
  };

  const handleQuickStatus = async (leaveId, nextStatus) => {
    try {
      const res = await api.patch(`/leaves/${leaveId}/status`, {
        status: nextStatus,
        reviewerNotes: nextStatus === 'approved' ? 'Approved by faculty.' : 'Application declined by faculty.'
      });
      if (res.data.success) {
        showToast(`Leave request ${nextStatus} successfully!`);
        fetchData();
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to update leave', true);
    }
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const [myRes, allRes] = await Promise.all([
        api.get('/leaves/my-leaves'),
        api.get('/leaves/all?role=student')
      ]);

      if (myRes.data.success) {
        setMyLeaves(myRes.data.leaves || []);
      }
      if (allRes.data.success) {
        setStudentLeaves(allRes.data.leaves || []);
      }
    } catch (err) {
      console.warn('Error fetching leaves:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const calculateDays = () => {
    if (!startDate || !endDate) return 1;
    const diff = new Date(endDate) - new Date(startDate);
    if (diff < 0) return 0;
    return Math.ceil(diff / (1000 * 60 * 60 * 24)) + 1;
  };

  const totalDays = calculateDays();

  const handleApply = async (e) => {
    e.preventDefault();
    if (!startDate || !endDate || !reason.trim()) {
      showToast('Please fill in all fields.', true);
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
      if (res.data.success) {
        showToast('Faculty leave request submitted!');
        setReason('');
        setStartDate('');
        setEndDate('');
        fetchData();
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Error submitting leave', true);
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

      if (res.data.success) {
        showToast(`Leave request ${reviewStatus} successfully!`);
        setSelectedLeave(null);
        setReviewNotes('');
        fetchData();
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to update leave', true);
    } finally {
      setReviewing(false);
    }
  };

  const pendingStudentLeaves = studentLeaves.filter((l) => l.status === 'pending');

  return (
    <SidebarLayout>
      <div className="space-y-6 max-w-5xl mx-auto">
        {/* Toast Alert */}
        {toast && (
          <div
            className={`fixed top-5 right-5 z-50 px-5 py-3.5 rounded-2xl text-xs font-bold shadow-2xl transition-all animate-slide-up ${
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
        <div className="glass-panel glass-card-accent p-6 sm:p-8 rounded-3xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-5 shadow-2xl">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-brand-subtle text-indigo-400 border border-brand text-[11px] font-extrabold uppercase tracking-widest font-display">
                Faculty Operations
              </span>
              <span className="text-xs text-slate-400">· Leave Management Hub</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white mt-2 font-display">Leave Management Hub</h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl leading-relaxed">
              Apply for personal faculty leaves and review attendance exemption requests from your enrolled students.
            </p>
          </div>

          {/* Tab Switcher */}
          <div className="flex p-1.5 bg-slate-950/80 border border-slate-800 rounded-2xl shrink-0 shadow-inner">
            <button
              onClick={() => setActiveTab('faculty')}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'faculty'
                  ? 'bg-brand text-white shadow-brand ring-1 ring-white/20'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              My Faculty Leaves
            </button>
            <button
              onClick={() => setActiveTab('students')}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                activeTab === 'students'
                  ? 'bg-brand text-white shadow-brand ring-1 ring-white/20'
                  : 'text-slate-400 hover:text-white'
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
        </div>

        {/* Tab 1: Faculty Leave */}
        {activeTab === 'faculty' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Form */}
            <div className="glass-panel p-6 sm:p-7 rounded-3xl space-y-5 shadow-2xl">
              <div className="border-b border-slate-800/80 pb-3">
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-indigo-400 font-display">Application</span>
                <h2 className="text-lg font-bold text-white font-display">Apply for Faculty Leave</h2>
              </div>

              <form onSubmit={handleApply} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300 uppercase tracking-wider font-display">Category</label>
                  <select
                    value={leaveType}
                    onChange={(e) => setLeaveType(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-900/90 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand transition"
                  >
                    {LEAVE_TYPES.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.icon} {t.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-300 uppercase tracking-wider font-display">Start Date</label>
                    <input
                      type="date"
                      required
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-full px-3 py-2.5 bg-slate-900/90 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand transition"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-300 uppercase tracking-wider font-display">End Date</label>
                    <input
                      type="date"
                      required
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="w-full px-3 py-2.5 bg-slate-900/90 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand transition"
                    />
                  </div>
                </div>

                {startDate && endDate && (
                  <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 text-xs flex items-center justify-between">
                    <span className="text-slate-400">Duration:</span>
                    <span className="font-bold text-indigo-400 font-display">{totalDays} Day(s)</span>
                  </div>
                )}

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300 uppercase tracking-wider font-display">Reason</label>
                  <textarea
                    rows={4}
                    required
                    placeholder="Details for Dean/Admin approval..."
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-900/90 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand resize-none transition leading-relaxed"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3.5 btn-premium text-white text-xs font-extrabold shadow-brand tracking-wide flex items-center justify-center gap-2 mt-2"
                >
                  {submitting ? 'Submitting...' : 'Submit Faculty Leave →'}
                </button>
              </form>
            </div>

            {/* My Faculty Leaves List */}
            <div className="lg:col-span-2 space-y-4">
              <h2 className="text-base font-bold text-white font-display">My Submitted Leaves ({myLeaves.length})</h2>

              {loading ? (
                <SkeletonCardList count={3} cols={1} />
              ) : myLeaves.length === 0 ? (
                <div className="glass-panel p-12 rounded-3xl border border-slate-800 text-center space-y-2">
                  <span className="text-5xl">🏖️</span>
                  <h3 className="text-base font-bold text-white font-display">No leaves recorded</h3>
                  <p className="text-xs text-slate-400">You have no active or historical faculty leaves.</p>
                </div>
              ) : (
                <div className="space-y-3.5">
                  {myLeaves.map((leave) => (
                    <div
                      key={leave.id}
                      className="glass-panel glass-panel-hover p-5 sm:p-6 rounded-3xl space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold uppercase tracking-wider bg-brand-subtle px-3 py-1 rounded-xl border border-brand text-indigo-300 font-display">
                          {leave.leaveType} • {leave.totalDays} Day(s)
                        </span>
                        <span
                          className={`px-3 py-1 text-xs font-bold rounded-full border shadow-xs ${
                            leave.status === 'approved'
                              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                              : leave.status === 'rejected'
                              ? 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                              : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                          }`}
                        >
                          {leave.status}
                        </span>
                      </div>
                      <p className="text-xs text-slate-300 bg-slate-950/60 p-3.5 rounded-2xl border border-slate-800/80">
                        "{leave.reason}"
                      </p>
                      {leave.reviewedBy && (
                        <div className="text-xs text-slate-400 italic">
                          Reviewed by <strong className="text-slate-200">{leave.reviewedBy}</strong>: "{leave.reviewerNotes || 'Approved'}"
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab 2: Review Student Requests */}
        {activeTab === 'students' && (() => {
          const filteredStudentLeaves = studentLeaves.filter((l) => {
            const matchesStatus = studentFilterStatus === 'all' || l.status === studentFilterStatus;
            const q = studentSearchQuery.toLowerCase().trim();
            const matchesSearch =
              !q ||
              (l.userName || '').toLowerCase().includes(q) ||
              (l.userEmail || '').toLowerCase().includes(q) ||
              (l.reason || '').toLowerCase().includes(q);
            return matchesStatus && matchesSearch;
          });

          const pendingCount = studentLeaves.filter(l => l.status === 'pending').length;
          const approvedCount = studentLeaves.filter(l => l.status === 'approved').length;
          const rejectedCount = studentLeaves.filter(l => l.status === 'rejected').length;

          return (
            <div className="space-y-5">
              {/* Metrics Header */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
                <div
                  onClick={() => setStudentFilterStatus('all')}
                  className={`glass-panel p-4 rounded-2xl cursor-pointer transition ${
                    studentFilterStatus === 'all' ? 'border-brand ring-1 ring-brand' : ''
                  }`}
                >
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-display">Total Inquiries</div>
                  <div className="text-2xl sm:text-3xl font-black text-white mt-1 font-display">{studentLeaves.length}</div>
                  <div className="text-[11px] text-slate-400 mt-0.5">All student leaves</div>
                </div>

                <div
                  onClick={() => setStudentFilterStatus('pending')}
                  className={`glass-panel p-4 rounded-2xl cursor-pointer transition ${
                    studentFilterStatus === 'pending' ? 'border-amber-400 ring-1 ring-amber-400' : ''
                  }`}
                >
                  <div className="flex items-center justify-between text-[10px] font-bold text-amber-400 uppercase tracking-wider font-display">
                    <span>Awaiting Review</span>
                    {pendingCount > 0 && <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />}
                  </div>
                  <div className="text-2xl sm:text-3xl font-black text-amber-400 mt-1 font-display">{pendingCount}</div>
                  <div className="text-[11px] text-amber-300/80 mt-0.5">Requires evaluation</div>
                </div>

                <div
                  onClick={() => setStudentFilterStatus('approved')}
                  className={`glass-panel p-4 rounded-2xl cursor-pointer transition ${
                    studentFilterStatus === 'approved' ? 'border-emerald-400 ring-1 ring-emerald-400' : ''
                  }`}
                >
                  <div className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider font-display">Approved Grants</div>
                  <div className="text-2xl sm:text-3xl font-black text-emerald-400 mt-1 font-display">{approvedCount}</div>
                  <div className="text-[11px] text-emerald-400/80 mt-0.5">Officially excused</div>
                </div>

                <div
                  onClick={() => setStudentFilterStatus('rejected')}
                  className={`glass-panel p-4 rounded-2xl cursor-pointer transition ${
                    studentFilterStatus === 'rejected' ? 'border-rose-400 ring-1 ring-rose-400' : ''
                  }`}
                >
                  <div className="text-[10px] font-bold text-rose-400 uppercase tracking-wider font-display">Declined</div>
                  <div className="text-2xl sm:text-3xl font-black text-rose-400 mt-1 font-display">{rejectedCount}</div>
                  <div className="text-[11px] text-rose-400/80 mt-0.5">Rejected applications</div>
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
                    className="w-full pl-9 pr-3.5 py-2.5 bg-slate-900/90 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-brand transition"
                  />
                  <span className="absolute left-3 top-3 text-slate-500 text-xs">🔍</span>
                  {studentSearchQuery && (
                    <button
                      onClick={() => setStudentSearchQuery('')}
                      className="absolute right-3 top-2.5 text-xs text-slate-400 hover:text-white"
                    >
                      ✕
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto p-1 bg-slate-950/80 border border-slate-800 rounded-xl">
                  {['all', 'pending', 'approved', 'rejected'].map((st) => (
                    <button
                      key={st}
                      onClick={() => setStudentFilterStatus(st)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize transition ${
                        studentFilterStatus === st
                          ? 'bg-brand text-white shadow-xs'
                          : 'text-slate-400 hover:text-white'
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
                  <h3 className="text-base font-bold text-white font-display">No student leave requests found</h3>
                  <p className="text-xs text-slate-400">
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
                      className="mt-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl transition"
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
                      className="glass-panel glass-panel-hover p-5 sm:p-6 rounded-3xl space-y-4 flex flex-col justify-between"
                    >
                      <div className="space-y-2.5">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-brand-subtle text-indigo-300 border border-brand flex items-center justify-center font-bold text-sm shadow-inner">
                              {(sub.userName || 'S').charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <h3 className="text-sm font-bold text-white font-display">{sub.userName}</h3>
                              <span className="text-xs text-slate-400">{sub.userEmail}</span>
                            </div>
                          </div>
                          <span
                            className={`px-3 py-1 text-[11px] font-extrabold uppercase tracking-wider rounded-full border shadow-xs ${
                              sub.status === 'approved'
                                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                                : sub.status === 'rejected'
                                ? 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                                : 'bg-amber-500/10 text-amber-400 border-amber-500/30 animate-pulse'
                            }`}
                          >
                            {sub.status}
                          </span>
                        </div>

                        <div className="p-2.5 bg-slate-950/60 rounded-xl border border-slate-800/80 flex items-center justify-between text-xs">
                          <span className="font-bold text-indigo-300 uppercase tracking-wider">
                            {sub.leaveType} Leave
                          </span>
                          <span className="font-mono text-slate-300">
                            {sub.startDate} → {sub.endDate} ({sub.totalDays} Day{sub.totalDays > 1 ? 's' : ''})
                          </span>
                        </div>

                        <p className="text-xs text-slate-300 bg-slate-900/70 p-3 rounded-xl border border-slate-800 leading-relaxed">
                          "{sub.reason}"
                        </p>

                        {sub.reviewedBy && (
                          <div className="text-[11px] text-slate-400 bg-slate-950/40 p-2.5 rounded-lg border border-slate-800/60">
                            Reviewed by <strong className="text-slate-200">{sub.reviewedBy}</strong>: "{sub.reviewerNotes || 'Reviewed'}"
                          </div>
                        )}
                      </div>

                      <div className="pt-3 border-t border-slate-800 flex items-center justify-between gap-2">
                        <span className="text-[11px] text-slate-500 font-mono">
                          Applied {new Date(sub.createdAt).toLocaleDateString()}
                        </span>

                        <div className="flex items-center gap-2">
                          {sub.status === 'pending' && (
                            <>
                              <button
                                onClick={() => handleQuickStatus(sub.id, 'approved')}
                                className="py-1.5 px-3 bg-emerald-600/20 text-emerald-300 hover:bg-emerald-600/30 border border-emerald-500/30 text-xs font-bold rounded-xl transition"
                                title="Quick Approve"
                              >
                                ✓ Approve
                              </button>
                              <button
                                onClick={() => handleQuickStatus(sub.id, 'rejected')}
                                className="py-1.5 px-3 bg-rose-600/20 text-rose-300 hover:bg-rose-600/30 border border-rose-500/30 text-xs font-bold rounded-xl transition"
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
          );
        })()}

        {/* Evaluation Modal */}
        {selectedLeave && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
            <div className="glass-panel p-6 sm:p-7 rounded-3xl border border-slate-800 max-w-md w-full space-y-4 shadow-2xl">
              <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
                <h3 className="text-base font-bold text-white font-display">Evaluate Student Leave</h3>
                <button
                  onClick={() => setSelectedLeave(null)}
                  className="p-1.5 rounded-lg bg-slate-900 text-slate-400 hover:text-white"
                >
                  ✕
                </button>
              </div>

              <div className="text-xs space-y-1 bg-slate-950/60 p-3.5 rounded-2xl border border-slate-800">
                <p><strong>Student:</strong> {selectedLeave.userName} ({selectedLeave.userEmail})</p>
                <p><strong>Period:</strong> {selectedLeave.startDate} to {selectedLeave.endDate} ({selectedLeave.totalDays} Days)</p>
                <p><strong>Reason:</strong> {selectedLeave.reason}</p>
              </div>

              <form onSubmit={handleReviewSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300 uppercase tracking-wider font-display">Decision</label>
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
                      ✓ Approve
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
                      ✕ Reject
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300 uppercase tracking-wider font-display">Feedback / Remarks</label>
                  <textarea
                    rows={3}
                    placeholder="e.g. Approved. Please coordinate with peers for lecture notes."
                    value={reviewNotes}
                    onChange={(e) => setReviewNotes(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-750 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand resize-none transition"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setSelectedLeave(null)}
                    className="px-4 py-2 btn-secondary text-xs font-bold rounded-xl"
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
