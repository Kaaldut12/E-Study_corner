// frontend/src/pages/Teacher/TeacherLeaves.jsx
import { useState, useEffect } from 'react';
import SidebarLayout from '../../components/common/SidebarLayout';
import api from '../../services/api';

const LEAVE_TYPES = [
  { id: 'casual', label: 'Casual / Personal Leave', icon: '🏠' },
  { id: 'sick', label: 'Medical / Sick Leave', icon: '🩺' },
  { id: 'academic', label: 'Faculty Training / Conference / Research', icon: '🎓' },
  { id: 'vacation', label: 'Official Vacation / Break', icon: '🏖️' }
];

const TeacherLeaves = () => {
  const [activeTab, setActiveTab] = useState('faculty'); // 'faculty' | 'students'
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

  // Faculty form states
  const [leaveType, setLeaveType] = useState('casual');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reason, setReason] = useState('');

  const showToast = (message, isError = false) => {
    setToast({ message, isError });
    setTimeout(() => setToast(null), 4000);
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
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-400">Faculty Operations</span>
            <h1 className="text-2xl sm:text-3xl font-black text-white mt-1">Leave Management Hub</h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Apply for personal faculty leaves and review attendance leave requests from your students.
            </p>
          </div>

          {/* Tab Switcher */}
          <div className="flex p-1 bg-slate-900 border border-slate-750 rounded-2xl shrink-0">
            <button
              onClick={() => setActiveTab('faculty')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
                activeTab === 'faculty'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              My Faculty Leave
            </button>
            <button
              onClick={() => setActiveTab('students')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                activeTab === 'students'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <span>Student Requests</span>
              {pendingStudentLeaves.length > 0 && (
                <span className="px-1.5 py-0.2 bg-rose-500 text-white rounded-full text-[10px] font-black">
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
            <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-5">
              <div className="border-b border-slate-800 pb-3">
                <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400">Application</span>
                <h2 className="text-lg font-bold text-white">Apply for Faculty Leave</h2>
              </div>

              <form onSubmit={handleApply} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">Category</label>
                  <select
                    value={leaveType}
                    onChange={(e) => setLeaveType(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-750 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
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
                    <label className="text-xs font-semibold text-slate-300">Start Date</label>
                    <input
                      type="date"
                      required
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-750 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-300">End Date</label>
                    <input
                      type="date"
                      required
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-750 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                {startDate && endDate && (
                  <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800 text-xs flex items-center justify-between">
                    <span className="text-slate-400">Duration:</span>
                    <span className="font-bold text-indigo-400">{totalDays} Day(s)</span>
                  </div>
                )}

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">Reason</label>
                  <textarea
                    rows={4}
                    required
                    placeholder="Details for Dean/Admin approval..."
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-750 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-indigo-500 resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-xs font-black rounded-xl shadow-lg shadow-indigo-600/20 hover:opacity-95 transition flex items-center justify-center gap-2"
                >
                  {submitting ? 'Submitting...' : 'Submit Faculty Leave →'}
                </button>
              </form>
            </div>

            {/* My Faculty Leaves List */}
            <div className="lg:col-span-2 space-y-4">
              <h2 className="text-base font-bold text-white">My Submitted Leaves ({myLeaves.length})</h2>

              {loading ? (
                <div className="flex justify-center py-16">
                  <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
              ) : myLeaves.length === 0 ? (
                <div className="glass-panel p-12 rounded-3xl border border-slate-800 text-center space-y-2">
                  <span className="text-4xl">🏖️</span>
                  <h3 className="text-base font-bold text-white">No leaves recorded</h3>
                  <p className="text-xs text-slate-400">You have no active or historical faculty leaves.</p>
                </div>
              ) : (
                <div className="space-y-3.5">
                  {myLeaves.map((leave) => (
                    <div
                      key={leave.id}
                      className="glass-panel p-5 rounded-3xl border border-slate-800 space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold uppercase tracking-wider bg-slate-900 px-2.5 py-0.5 rounded-lg border border-slate-750 text-indigo-300">
                          {leave.leaveType} • {leave.totalDays} Day(s)
                        </span>
                        <span
                          className={`px-3 py-0.5 text-xs font-bold rounded-full border ${
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
                      <p className="text-xs text-slate-300 bg-slate-950/40 p-3 rounded-xl border border-slate-800/50">
                        "{leave.reason}"
                      </p>
                      {leave.reviewedBy && (
                        <div className="text-[11px] text-slate-400 italic">
                          Reviewed by {leave.reviewedBy}: "{leave.reviewerNotes || 'Approved'}"
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
        {activeTab === 'students' && (
          <div className="space-y-4">
            <h2 className="text-base font-bold text-white">
              Student Leave Applications ({studentLeaves.length})
            </h2>

            {studentLeaves.length === 0 ? (
              <div className="glass-panel p-12 rounded-3xl border border-slate-800 text-center space-y-2">
                <span className="text-4xl">🎓</span>
                <h3 className="text-base font-bold text-white">No student leave requests</h3>
                <p className="text-xs text-slate-400">All student leave requests are up to date.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {studentLeaves.map((sub) => (
                  <div
                    key={sub.id}
                    className="glass-panel p-5 rounded-3xl border border-slate-800 space-y-3.5 flex flex-col justify-between"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-sm font-bold text-white">{sub.userName}</h3>
                          <span className="text-[11px] text-slate-400">{sub.userEmail}</span>
                        </div>
                        <span
                          className={`px-2.5 py-0.5 text-xs font-bold rounded-full border ${
                            sub.status === 'approved'
                              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                              : sub.status === 'rejected'
                              ? 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                              : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                          }`}
                        >
                          {sub.status}
                        </span>
                      </div>

                      <div className="text-xs text-indigo-400 font-semibold">
                        {sub.leaveType.toUpperCase()} LEAVE • {sub.totalDays} Day(s) ({sub.startDate} to {sub.endDate})
                      </div>

                      <p className="text-xs text-slate-300 bg-slate-950/40 p-3 rounded-xl border border-slate-800/50">
                        "{sub.reason}"
                      </p>
                    </div>

                    <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
                      <span className="text-[11px] text-slate-500">
                        {new Date(sub.createdAt).toLocaleDateString()}
                      </span>
                      <button
                        onClick={() => {
                          setSelectedLeave(sub);
                          setReviewStatus(sub.status === 'pending' ? 'approved' : sub.status);
                          setReviewNotes(sub.reviewerNotes || '');
                        }}
                        className="py-1.5 px-4 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl shadow transition"
                      >
                        {sub.status === 'pending' ? 'Evaluate Request →' : 'Edit Decision'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Evaluation Modal */}
        {selectedLeave && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
            <div className="glass-panel p-6 rounded-3xl border border-slate-800 max-w-md w-full space-y-4 shadow-2xl">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="text-base font-bold text-white">Evaluate Student Leave</h3>
                <button
                  onClick={() => setSelectedLeave(null)}
                  className="p-1 rounded-lg bg-slate-900 text-slate-400 hover:text-white"
                >
                  ✕
                </button>
              </div>

              <div className="text-xs space-y-1 bg-slate-950/50 p-3 rounded-xl border border-slate-800">
                <p><strong>Student:</strong> {selectedLeave.userName} ({selectedLeave.userEmail})</p>
                <p><strong>Period:</strong> {selectedLeave.startDate} to {selectedLeave.endDate} ({selectedLeave.totalDays} Days)</p>
                <p><strong>Reason:</strong> {selectedLeave.reason}</p>
              </div>

              <form onSubmit={handleReviewSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">Decision</label>
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
                  <label className="text-xs font-semibold text-slate-300">Feedback / Remarks</label>
                  <textarea
                    rows={3}
                    placeholder="e.g. Approved. Please coordinate with peers for lecture notes."
                    value={reviewNotes}
                    onChange={(e) => setReviewNotes(e.target.value)}
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
