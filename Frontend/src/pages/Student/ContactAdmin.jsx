// frontend/src/pages/Student/ContactAdmin.jsx
import { useEffect, useState } from 'react';
import SidebarLayout from '../../components/common/SidebarLayout';
import studentService from '../../services/studentService';

const ContactAdmin = () => {
  const [subject, setSubject] = useState('');
  const [category, setCategory] = useState('Technical Support');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [loadingTickets, setLoadingTickets] = useState(true);
  const [myTickets, setMyTickets] = useState([]);

  const fetchTickets = async () => {
    try {
      setLoadingTickets(true);
      const data = await studentService.getMyTickets();
      if (data?.success && Array.isArray(data.tickets)) {
        setMyTickets(data.tickets);
      }
    } catch (err) {
      console.warn('Failed to fetch student tickets:', err);
    } finally {
      setLoadingTickets(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setSuccessMsg('');
    setErrorMsg('');

    try {
      const data = await studentService.contactAdmin({
        subject,
        category,
        message
      });

      if (data.success) {
        setSuccessMsg('Support ticket sent to Administrator.');
        if (data.ticket) {
          setMyTickets((prev) => [data.ticket, ...prev]);
        }
        setSubject('');
        setMessage('');
      }
    } catch (err) {
      console.error('Error submitting support ticket:', err);
      setErrorMsg(err?.parsedMessage || err?.response?.data?.message || 'Unable to submit your ticket. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SidebarLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Contact Administrator</h1>
          <p className="text-sm text-slate-400">Have a question or platform issue? Send a direct support ticket to admin.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Submission Form */}
          <div className="glass-panel p-4 sm:p-6 rounded-2xl border border-slate-800 space-y-4">
            <h2 className="text-lg font-bold text-white">Submit New Inquiry</h2>

            {successMsg && (
              <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm">
                ✓ {successMsg}
              </div>
            )}

            {errorMsg && (
              <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-sm">
                ✕ {errorMsg}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-slate-100 text-sm focus:outline-none focus:border-indigo-500"
                >
                  <option value="Technical Support">Technical Support</option>
                  <option value="Assignment Query">Assignment Query</option>
                  <option value="Account Issue">Account Issue</option>
                  <option value="General Feedback">General Feedback</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Subject</label>
                <input
                  type="text"
                  required
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Brief summary of your question..."
                  className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Message Details</label>
                <textarea
                  rows={4}
                  required
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Describe your issue or request in detail..."
                  className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:border-indigo-500"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3 px-4 btn-premium text-white text-xs font-semibold rounded-xl shadow-lg shadow-indigo-600/30 hover:opacity-95 transition disabled:opacity-50"
              >
                {submitting ? 'Submitting...' : 'Send Message to Admin'}
              </button>
            </form>
          </div>

          {/* Ticket History */}
          <div className="glass-panel p-4 sm:p-6 rounded-2xl border border-slate-800 space-y-4">
            <h2 className="text-lg font-bold text-white">Your Submitted Tickets</h2>

            {loadingTickets ? (
              <div className="flex justify-center py-8">
                <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : myTickets.length > 0 ? (
              <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
                {myTickets.map((t) => (
                  <div key={t.id} className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-indigo-400">{t.category}</span>
                      <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${
                        t.status === 'resolved'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                      }`}>
                        {t.status === 'resolved' ? 'Resolved' : 'Pending Response'}
                      </span>
                    </div>

                    <h3 className="font-semibold text-sm text-slate-100">{t.subject}</h3>
                    <p className="text-xs text-slate-400">{t.message}</p>

                    {t.adminReply && (
                      <div className="p-2.5 rounded bg-indigo-950/40 border border-indigo-500/30 text-xs text-indigo-200 mt-2">
                        <strong>Admin Reply: </strong> {t.adminReply}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400 text-center py-8">No previous tickets submitted.</p>
            )}
          </div>
        </div>
      </div>
    </SidebarLayout>
  );
};

export default ContactAdmin;
