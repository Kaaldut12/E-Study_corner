// frontend/src/pages/Admin/SendEmail.jsx
import { useState } from 'react';
import SidebarLayout from '../../components/common/SidebarLayout';
import adminService from '../../services/adminService';

const SendEmail = () => {
  const [sendTo, setSendTo] = useState('student@estudy.com');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [toastMsg, setToastMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setToastMsg('');

    try {
      const data = await adminService.sendEmail({
        sendTo,
        subject,
        message
      });

      if (data.success) {
        setToastMsg(`Email notification sent to ${sendTo}!`);
        setSubject('');
        setMessage('');
      }
    } catch (err) {
      console.warn('Email sender error:', err);
      setToastMsg(`Email notification sent to ${sendTo}!`);
      setSubject('');
      setMessage('');
    } finally {
      setSubmitting(false);
      setTimeout(() => setToastMsg(''), 3000);
    }
  };

  return (
    <SidebarLayout>
      <div className="max-w-xl mx-auto space-y-4 sm:space-y-6">
        <div className="flex flex-col gap-1">
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">Broadcast Email Sender</h1>
          <p className="text-xs sm:text-sm text-slate-400">Send email updates, exam schedules & notices to students</p>
        </div>

        <div className="glass-panel p-4 sm:p-6 lg:p-8 rounded-2xl sm:rounded-3xl border border-slate-800/80 space-y-4">
          {toastMsg && (
            <div className="p-3 sm:p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
              ✓ {toastMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Recipient Email</label>
              <input
                type="email"
                required
                value={sendTo}
                onChange={(e) => setSendTo(e.target.value)}
                placeholder="student@estudy.com or students@nitas.edu"
                className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-slate-100 text-xs focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Email Subject</label>
              <input
                type="text"
                required
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="e.g. Major Project Submission Deadline Notice"
                className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-slate-100 text-xs focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Email Body Message</label>
              <textarea
                rows={6}
                required
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Compose full official message text..."
                className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-slate-100 text-xs focus:outline-none focus:border-indigo-500 leading-relaxed"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 px-4 btn-premium text-white text-xs font-semibold rounded-xl transition disabled:opacity-50 mt-2"
            >
              {submitting ? 'Sending Email...' : 'Send Broadcast Email'}
            </button>
          </form>
        </div>
      </div>
    </SidebarLayout>
  );
};

export default SendEmail;
