// frontend/src/pages/Student/ContactAdmin.jsx
import { useEffect, useState } from 'react';
import axios from 'axios';
import SidebarLayout from '../../components/common/SidebarLayout';
import { useAuth } from '../../contexts/AuthContext';

const ContactAdmin = () => {
  const { apiUrl } = useAuth();
  const [subject, setSubject] = useState('');
  const [category, setCategory] = useState('Technical Support');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [myTickets, setMyTickets] = useState([]);

  useEffect(() => {
    // Initial sample ticket
    setMyTickets([
      {
        id: 'msg_1',
        subject: 'Issue submitting large PDF files',
        category: 'Technical Support',
        message: 'Hello, when I try to attach a PDF larger than 5MB, the form takes long. Is there a size limit?',
        status: 'pending',
        createdAt: '2026-09-06T14:10:00.000Z',
        adminReply: ''
      }
    ]);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setSuccessMsg('');

    try {
      const res = await axios.post(`${apiUrl}/student/contact-admin`, {
        subject,
        category,
        message
      });

      if (res.data.success) {
        setSuccessMsg('Support ticket sent to Administrator.');
        if (res.data.ticket) {
          setMyTickets((prev) => [res.data.ticket, ...prev]);
        }
        setSubject('');
        setMessage('');
      }
    } catch (err) {
      console.warn('Sending ticket offline mode:', err);
      const newTicket = {
        id: `msg_${Date.now()}`,
        subject,
        category,
        message,
        status: 'pending',
        createdAt: new Date().toISOString(),
        adminReply: ''
      };
      setMyTickets((prev) => [newTicket, ...prev]);
      setSuccessMsg('Support ticket created (Local Session).');
      setSubject('');
      setMessage('');
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
          <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
            <h2 className="text-lg font-bold text-white">Submit New Inquiry</h2>

            {successMsg && (
              <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm">
                ✓ {successMsg}
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
                className="w-full py-3 px-4 gradient-bg-primary text-white text-xs font-semibold rounded-xl shadow-lg shadow-indigo-600/30 hover:opacity-95 transition disabled:opacity-50"
              >
                {submitting ? 'Submitting...' : 'Send Message to Admin'}
              </button>
            </form>
          </div>

          {/* Ticket History */}
          <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
            <h2 className="text-lg font-bold text-white">Your Submitted Tickets</h2>

            {myTickets.length > 0 ? (
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
