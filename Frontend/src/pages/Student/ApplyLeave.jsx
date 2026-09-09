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

        {/* Header Banner */}
        <div className="glass-panel glass-card-accent p-6 sm:p-8 rounded-3xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shadow-2xl">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-brand-subtle text-indigo-400 border border-brand text-[11px] font-extrabold uppercase tracking-widest font-display">
                Campus Attendance & Leave
              </span>
              <span className="text-xs text-slate-400">· Official Exemption Portal</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white mt-2 font-display">
              Leave Application & Tracking
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl leading-relaxed">
              Submit planned absences, medical leaves, or academic exemptions for faculty and administrative approval.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Apply For Leave Form (1 col on desktop) */}
          <div className="glass-panel p-6 sm:p-7 rounded-3xl space-y-5 shadow-2xl">
            <div className="border-b border-slate-800/80 pb-3">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-indigo-400 font-display">New Request</span>
              <h2 className="text-lg font-bold text-white font-display">Apply for Leave</h2>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Leave Type Selector */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider font-display">Leave Category</label>
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

              {/* Start Date & End Date */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300 uppercase tracking-wider font-display">From Date</label>
                  <input
                    type="date"
                    required
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-900/90 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand transition"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300 uppercase tracking-wider font-display">To Date</label>
                  <input
                    type="date"
                    required
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-900/90 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand transition"
                  />
                </div>
              </div>

              {/* Duration indicator */}
              {startDate && endDate && (
                <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 text-xs flex items-center justify-between">
                  <span className="text-slate-400">Total Duration:</span>
                  <span className={`font-black font-display ${totalDays > 0 ? 'text-indigo-400' : 'text-rose-400'}`}>
                    {totalDays > 0 ? `${totalDays} Day(s)` : 'Invalid dates'}
                  </span>
                </div>
              )}

              {/* Reason */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider font-display">Reason for Absence</label>
                <textarea
                  rows={4}
                  required
                  placeholder="Describe reason for leave (e.g. medical recovery, hospital appointment, family emergency)..."
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-900/90 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand resize-none transition leading-relaxed"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3.5 btn-premium text-white text-xs font-extrabold shadow-brand tracking-wide flex items-center justify-center gap-2 mt-2"
              >
                {submitting ? 'Submitting...' : 'Submit Leave Request →'}
              </button>
            </form>
          </div>

          {/* Leave History List (2 cols on desktop) */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-white flex items-center gap-2 font-display">
                <span>📋</span> My Leave Applications ({leaves.length})
              </h2>
            </div>

            {loading ? (
              <div className="flex flex-col items-center justify-center py-20 space-y-3">
                <div className="w-8 h-8 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
                <p className="text-slate-400 text-xs">Loading Leave Records...</p>
              </div>
            ) : leaves.length === 0 ? (
              <div className="glass-panel p-12 rounded-3xl text-center space-y-2">
                <span className="text-5xl">🏖️</span>
                <h3 className="text-base font-bold text-white font-display">No leave applications found</h3>
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
                      className="glass-panel glass-panel-hover p-5 sm:p-6 rounded-3xl space-y-3.5"
                    >
                      {/* Header row: category + dates + status */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
                        <div className="flex items-center gap-2.5 flex-wrap">
                          <span className="text-xs font-bold uppercase tracking-wider bg-brand-subtle px-3 py-1 rounded-xl border border-brand text-indigo-300 font-display">
                            {leave.leaveType} leave
                          </span>
                          <span className="text-xs text-slate-400">
                            {leave.totalDays} Day{leave.totalDays > 1 ? 's' : ''} ({leave.startDate} to {leave.endDate})
                          </span>
                        </div>

                        <span
                          className={`px-3 py-1 text-xs font-bold rounded-full border inline-flex items-center gap-1.5 self-start sm:self-auto shadow-xs ${
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
                      <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/60 p-3.5 rounded-2xl border border-slate-800/80">
                        "{leave.reason}"
                      </p>

                      {/* Reviewer feedback if reviewed */}
                      {leave.reviewedBy && (
                        <div className="p-3.5 rounded-2xl bg-indigo-950/20 border border-indigo-500/20 text-xs text-slate-300 space-y-1">
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
