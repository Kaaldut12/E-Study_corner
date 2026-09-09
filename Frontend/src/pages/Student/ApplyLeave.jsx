// frontend/src/pages/Student/ApplyLeave.jsx
import { useState, useEffect } from 'react';
import SidebarLayout from '../../components/common/SidebarLayout';
import api from '../../services/api';

const LEAVE_TYPES = [
  { id: 'sick', label: 'Medical / Sick Leave', icon: '🩺' },
  { id: 'academic', label: 'Academic / Competition / Hackathon', icon: '🎓' },
  { id: 'casual', label: 'Casual / Personal Leave', icon: '🏠' },
  { id: 'emergency', label: 'Family Emergency', icon: '⚠️' }
];

const ApplyLeave = () => {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Form states
  const [leaveType, setLeaveType] = useState('sick');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reason, setReason] = useState('');
  const [toast, setToast] = useState(null);

  const showToast = (message, isError = false) => {
    setToast({ message, isError });
    setTimeout(() => setToast(null), 4000);
  };

  const fetchLeaves = async () => {
    try {
      const res = await api.get('/leaves/my-leaves');
      if (res.data.success) {
        setLeaves(res.data.leaves || []);
      }
    } catch (err) {
      console.warn('Failed to load leaves:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaves();
  }, []);

  // Compute total days between start and end date
  const calculateDays = () => {
    if (!startDate || !endDate) return 1;
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = end - start;
    if (diffTime < 0) return 0;
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  };

  const totalDays = calculateDays();

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

      if (res.data.success) {
        showToast('Leave request submitted successfully for administrative review!');
        setReason('');
        setStartDate('');
        setEndDate('');
        fetchLeaves();
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to submit leave request', true);
    } finally {
      setSubmitting(false);
    }
  };

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

        {/* Header Banner */}
        <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-rose-400">Campus Records</span>
            <h1 className="text-2xl sm:text-3xl font-black text-white mt-1">Leave Application & Tracking</h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Submit planned absences, medical leaves, or academic exemptions for faculty and admin approval.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Apply For Leave Form (1 col on desktop) */}
          <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-5">
            <div className="border-b border-slate-800 pb-3">
              <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400">New Request</span>
              <h2 className="text-lg font-bold text-white">Apply for Leave</h2>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Leave Type Selector */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Leave Category</label>
                <select
                  value={leaveType}
                  onChange={(e) => setLeaveType(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-750 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-rose-500"
                >
                  {LEAVE_TYPES.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.icon} {t.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Start Date & End Date */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">From Date</label>
                  <input
                    type="date"
                    required
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-750 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-rose-500"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">To Date</label>
                  <input
                    type="date"
                    required
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-750 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-rose-500"
                  />
                </div>
              </div>

              {/* Duration indicator */}
              {startDate && endDate && (
                <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800 text-xs flex items-center justify-between">
                  <span className="text-slate-400">Total Duration:</span>
                  <span className={`font-bold ${totalDays > 0 ? 'text-indigo-400' : 'text-rose-400'}`}>
                    {totalDays > 0 ? `${totalDays} Day(s)` : 'Invalid dates'}
                  </span>
                </div>
              )}

              {/* Reason */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Reason for Absence</label>
                <textarea
                  rows={4}
                  required
                  placeholder="Describe reason for leave (e.g. medical recovery, hospital appointment, family emergency)..."
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-750 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-rose-500 resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3 bg-gradient-to-r from-rose-600 to-indigo-600 hover:from-rose-500 hover:to-indigo-500 text-white text-xs font-black rounded-xl shadow-lg shadow-rose-600/20 hover:opacity-95 transition flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {submitting ? 'Submitting...' : 'Submit Leave Request →'}
              </button>
            </form>
          </div>

          {/* Leave History List (2 cols on desktop) */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <span>📋</span> My Leave Applications ({leaves.length})
              </h2>
            </div>

            {loading ? (
              <div className="flex justify-center py-16">
                <div className="w-8 h-8 border-4 border-rose-500 border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : leaves.length === 0 ? (
              <div className="glass-panel p-12 rounded-3xl border border-slate-800 text-center space-y-2">
                <span className="text-4xl">🏖️</span>
                <h3 className="text-base font-bold text-white">No leave applications found</h3>
                <p className="text-xs text-slate-400">
                  You haven't submitted any leave requests. Fill out the form on the left whenever you need time off.
                </p>
              </div>
            ) : (
              <div className="space-y-3.5">
                {leaves.map((leave) => {
                  const isApproved = leave.status === 'approved';
                  const isRejected = leave.status === 'rejected';

                  return (
                    <div
                      key={leave.id}
                      className="glass-panel p-5 rounded-3xl border border-slate-800 space-y-3 hover:border-slate-700 transition"
                    >
                      {/* Header row: category + dates + status */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold uppercase tracking-wider bg-slate-900 px-2.5 py-0.5 rounded-lg border border-slate-750 text-indigo-300">
                            {leave.leaveType} leave
                          </span>
                          <span className="text-xs text-slate-400">
                            {leave.totalDays} Day{leave.totalDays > 1 ? 's' : ''} ({leave.startDate} to {leave.endDate})
                          </span>
                        </div>

                        <span
                          className={`px-3 py-1 text-xs font-bold rounded-full border inline-flex items-center gap-1.5 self-start sm:self-auto ${
                            isApproved
                              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                              : isRejected
                              ? 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                              : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                          }`}
                        >
                          <span>{isApproved ? '✓' : isRejected ? '✕' : '⏳'}</span>
                          <span className="capitalize">{leave.status}</span>
                        </span>
                      </div>

                      {/* Reason */}
                      <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/40 p-3 rounded-xl border border-slate-800/50">
                        "{leave.reason}"
                      </p>

                      {/* Reviewer feedback if reviewed */}
                      {leave.reviewedBy && (
                        <div className="p-3 rounded-xl bg-indigo-950/20 border border-indigo-500/20 text-xs text-slate-300 space-y-1">
                          <div className="flex items-center justify-between text-[11px] text-indigo-400 font-bold">
                            <span>Reviewed by: {leave.reviewedBy}</span>
                            <span>{new Date(leave.reviewedAt).toLocaleDateString()}</span>
                          </div>
                          {leave.reviewerNotes && <p className="italic">"{leave.reviewerNotes}"</p>}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </SidebarLayout>
  );
};

export default ApplyLeave;
