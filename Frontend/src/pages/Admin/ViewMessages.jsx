// frontend/src/pages/Admin/ViewMessages.jsx
import { useEffect, useState } from 'react';
import SidebarLayout from '../../components/common/SidebarLayout';
import api from '../../services/api';

const ViewMessages = () => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);

  // Selected message for reply
  const [selectedMsg, setSelectedMsg] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [statusInput, setStatusInput] = useState('resolved');
  const [submitting, setSubmitting] = useState(false);
  const [toastMsg, setToastMsg] = useState('');

  const fetchMessages = async () => {
    try {
      const res = await api.get('/admin/messages');
      if (res.data.success) {
        setMessages(res.data.messages || []);
      }
    } catch (err) {
      console.warn('Admin messages fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  const openReplyModal = (msg) => {
    setSelectedMsg(msg);
    setReplyText(msg.adminReply || '');
    setStatusInput(msg.status || 'resolved');
  };

  const handleReplySubmit = async (e) => {
    e.preventDefault();
    if (!selectedMsg) return;
    setSubmitting(true);

    try {
      const res = await api.put(`/admin/messages/${selectedMsg.id}`, {
        status: statusInput,
        adminReply: replyText
      });

      if (res.data.success) {
        setMessages((prev) =>
          prev.map((m) => (m.id === selectedMsg.id ? (res.data.ticket || { ...m, status: statusInput, adminReply: replyText }) : m))
        );
        setToastMsg(`Responded to ${selectedMsg.userName}'s ticket.`);
        setSelectedMsg(null);
      }
    } catch (err) {
      setToastMsg(err.response?.data?.message || 'Error updating ticket.');
    } finally {
      setSubmitting(false);
      setTimeout(() => setToastMsg(''), 3000);
    }
  };

  return (
    <SidebarLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Support Inquiry Tickets</h1>
          <p className="text-sm text-slate-400">Review and resolve user queries, bug reports, and technical help requests</p>
        </div>

        {toastMsg && (
          <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm font-semibold">
            ✓ {toastMsg}
          </div>
        )}

        {loading ? (
          <div className="py-12 text-center text-slate-400">Loading support ticket inbox...</div>
        ) : messages.length > 0 ? (
          <div className="grid grid-cols-1 gap-4">
            {messages.map((msg) => (
              <div key={msg.id} className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="px-2.5 py-0.5 text-xs font-semibold rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                        {msg.category}
                      </span>
                      <span className="text-xs text-slate-400">From: <strong className="text-slate-200">{msg.userName}</strong> ({msg.userRole})</span>
                    </div>
                    <h2 className="text-base font-bold text-white">{msg.subject}</h2>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className={`px-3 py-1 text-xs font-bold rounded-full ${
                      msg.status === 'resolved'
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                    }`}>
                      {msg.status === 'resolved' ? 'Resolved' : 'Pending Response'}
                    </span>

                    <button
                      onClick={() => openReplyModal(msg)}
                      className="py-1.5 px-4 gradient-bg-primary text-white text-xs font-semibold rounded-lg transition"
                    >
                      {msg.status === 'resolved' ? 'Edit Response' : 'Reply & Resolve'}
                    </button>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 text-sm leading-relaxed">
                  {msg.message}
                </div>

                {msg.adminReply && (
                  <div className="p-3.5 rounded-xl bg-indigo-950/40 border border-indigo-500/30 text-xs text-indigo-200">
                    <strong className="text-indigo-300">Admin Response: </strong> {msg.adminReply}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="glass-panel p-12 text-center text-slate-400 rounded-2xl border border-slate-800">
            No support tickets in inbox.
          </div>
        )}

        {/* Reply Modal */}
        {selectedMsg && (
          <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="glass-panel max-w-lg w-full p-6 rounded-2xl border border-slate-800 space-y-4 shadow-2xl">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="text-lg font-bold text-white">
                  Respond to Support Ticket
                </h3>
                <button onClick={() => setSelectedMsg(null)} className="text-slate-400 hover:text-white p-1">
                  ✕
                </button>
              </div>

              <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 text-xs text-slate-300">
                <strong>Subject:</strong> {selectedMsg.subject}
              </div>

              <form onSubmit={handleReplySubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Ticket Status</label>
                  <select
                    value={statusInput}
                    onChange={(e) => setStatusInput(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-slate-100 text-sm focus:outline-none focus:border-indigo-500"
                  >
                    <option value="resolved">Resolved</option>
                    <option value="pending">Pending</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Admin Response Message</label>
                  <textarea
                    rows={4}
                    required
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder="Enter official resolution or instructions for user..."
                    className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-slate-100 text-sm focus:outline-none focus:border-indigo-500 leading-relaxed"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setSelectedMsg(null)}
                    className="py-2 px-4 rounded-xl text-xs text-slate-400 hover:text-white bg-slate-900 border border-slate-800"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="py-2 px-5 gradient-bg-primary text-white text-xs font-semibold rounded-xl shadow-lg shadow-indigo-600/30 hover:opacity-95 transition disabled:opacity-50"
                  >
                    {submitting ? 'Saving...' : 'Send Response & Resolve'}
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

export default ViewMessages;
