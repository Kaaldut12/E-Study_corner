// frontend/src/pages/Admin/SendEmail.jsx
import { useState, useEffect } from 'react';
import SidebarLayout from '../../components/common/SidebarLayout';
import adminService from '../../services/adminService';

const TEMPLATES = [
  {
    name: 'General Announcement',
    subject: '📢 Official Announcement: Campus Updates & Guidelines',
    body: 'Dear Students,\n\nPlease review the attached academic and schedule guidelines for the upcoming semester. Ensure your project and assignment submissions are completed before the scheduled deadline.\n\nBest regards,\nDepartment Administration'
  },
  {
    name: 'Exam Schedule Notice',
    subject: '📝 Mid-Term Examination Schedule Notification',
    body: 'Attention Students,\n\nThe mid-term examination timetable has been published on the student portal. Please check your personalized dashboard under "Academic Schedule" for specific hall assignments and dates.\n\nWarm regards,\nOffice of the Dean'
  },
  {
    name: 'Fee / Administrative Reminder',
    subject: '⚠️ Reminder: Semester Registration & Documentation',
    body: 'Hello,\n\nThis is a friendly reminder to complete your semester registration and verify your enrollment credentials. If you have already finalized your submission, please disregard this notification.\n\nRegards,\nAcademic Registrar'
  }
];

const SendEmail = () => {
  const [sendTo, setSendTo] = useState('student@estudy.com');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [testing, setTesting] = useState(false);
  const [checkingStatus, setCheckingStatus] = useState(false);
  const [toastMsg, setToastMsg] = useState({ type: '', text: '', hint: '' });
  const [smtpStatus, setSmtpStatus] = useState(null);

  // Check SMTP connection status on mount
  const checkConnection = async () => {
    setCheckingStatus(true);
    try {
      const res = await adminService.getEmailStatus();
      if (res.success) {
        setSmtpStatus(res.status);
      }
    } catch (err) {
      console.warn('Failed to query SMTP status:', err);
      setSmtpStatus({
        connected: false,
        mode: 'error',
        message: err.response?.data?.message || err.message
      });
    } finally {
      setCheckingStatus(false);
    }
  };

  useEffect(() => {
    checkConnection();
  }, []);

  const handleApplyTemplate = (tpl) => {
    setSubject(tpl.subject);
    setMessage(tpl.body);
  };

  const handleSendTestEmail = async () => {
    setTesting(true);
    setToastMsg({ type: '', text: '', hint: '' });

    try {
      const target = sendTo.trim() || 'test@estudy.com';
      const res = await adminService.sendTestEmail({ to: target });

      if (res.success) {
        setToastMsg({
          type: 'success',
          text: `✓ Test email successfully sent to ${target} (Mode: ${res.result?.mode || 'live'})`
        });
        checkConnection();
      }
    } catch (err) {
      const errorData = err.response?.data;
      setToastMsg({
        type: 'error',
        text: errorData?.message || err.message || 'Failed to send test email',
        hint: errorData?.hint || 'Check your SMTP credentials and IP whitelisting in your email provider dashboard.'
      });
    } finally {
      setTesting(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setToastMsg({ type: '', text: '', hint: '' });

    try {
      const data = await adminService.sendEmail({
        sendTo: sendTo.trim(),
        subject: subject.trim(),
        message: message.trim()
      });

      if (data.success) {
        setToastMsg({
          type: 'success',
          text: `✓ Email successfully dispatched to ${sendTo}! (Message ID: ${data.result?.messageId || 'Delivered'})`
        });
        setSubject('');
        setMessage('');
      }
    } catch (err) {
      const errorData = err.response?.data;
      setToastMsg({
        type: 'error',
        text: errorData?.message || err.message || 'Failed to dispatch email.',
        hint: errorData?.hint || 'Verify SMTP provider settings in Backend/.env or check authorized IP rules.'
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SidebarLayout>
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2.5">
              <span>📧</span> Nodemailer Email Sender
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Dispatch official notices, updates & transactional emails via Nodemailer SMTP
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={checkConnection}
              disabled={checkingStatus}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium border border-slate-700 transition flex items-center gap-1.5 disabled:opacity-50"
            >
              <span className={`inline-block w-2 h-2 rounded-full ${smtpStatus?.connected ? 'bg-emerald-400' : smtpStatus?.mode === 'mock' ? 'bg-sky-400' : 'bg-amber-400'}`}></span>
              {checkingStatus ? 'Checking...' : 'Check Status'}
            </button>
            <button
              type="button"
              onClick={handleSendTestEmail}
              disabled={testing}
              className="px-3.5 py-1.5 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 text-xs font-medium border border-indigo-500/30 transition disabled:opacity-50"
            >
              {testing ? 'Sending Test...' : '🧪 Send Test Email'}
            </button>
          </div>
        </div>

        {/* SMTP Status Banner */}
        {smtpStatus && (
          <div className={`p-4 rounded-2xl border text-xs leading-relaxed transition-all ${
            smtpStatus.connected
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
              : smtpStatus.mode === 'mock'
              ? 'bg-sky-500/10 border-sky-500/30 text-sky-300'
              : 'bg-amber-500/10 border-amber-500/30 text-amber-200'
          }`}>
            <div className="flex items-start justify-between gap-2">
              <div className="space-y-1">
                <div className="font-semibold flex items-center gap-1.5 text-sm">
                  {smtpStatus.connected ? '✓ SMTP Server Connected' : smtpStatus.mode === 'mock' ? 'ℹ Development Simulator Active' : '⚠️ SMTP Configuration Alert'}
                </div>
                <p className="opacity-90">{smtpStatus.message || smtpStatus.error}</p>
                {smtpStatus.hint && (
                  <p className="mt-2 text-amber-300 bg-amber-950/40 p-2.5 rounded-lg border border-amber-800/40 font-mono text-[11px]">
                    <strong>Tip:</strong> {smtpStatus.hint}
                  </p>
                )}
              </div>
              {smtpStatus.host && (
                <div className="text-right shrink-0 font-mono text-[10px] text-slate-400 bg-slate-900/60 px-2 py-1 rounded-md border border-slate-800">
                  {smtpStatus.host}:{smtpStatus.port || 587}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Feedback Alert Toast */}
        {toastMsg.text && (
          <div className={`p-4 rounded-2xl border text-xs space-y-1 ${
            toastMsg.type === 'success'
              ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300'
              : 'bg-rose-500/15 border-rose-500/40 text-rose-200'
          }`}>
            <div className="font-semibold">{toastMsg.text}</div>
            {toastMsg.hint && (
              <div className="text-[11px] opacity-90 text-rose-300 pt-1 font-mono">
                {toastMsg.hint}
              </div>
            )}
          </div>
        )}

        {/* Compose Card */}
        <div className="glass-panel p-5 sm:p-7 rounded-2xl sm:rounded-3xl border border-slate-800/80 space-y-5">
          {/* Quick Template Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-2">
              Quick Templates
            </label>
            <div className="flex flex-wrap gap-2">
              {TEMPLATES.map((tpl) => (
                <button
                  key={tpl.name}
                  type="button"
                  onClick={() => handleApplyTemplate(tpl)}
                  className="text-xs px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700/70 text-slate-300 hover:text-white transition"
                >
                  {tpl.name}
                </button>
              ))}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Recipient Email Address <span className="text-rose-400">*</span>
              </label>
              <input
                type="email"
                required
                value={sendTo}
                onChange={(e) => setSendTo(e.target.value)}
                placeholder="e.g. student@estudy.com or your-email@gmail.com"
                className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-slate-100 text-xs focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Subject <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                required
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="e.g. End-Semester Examination Schedule Published"
                className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-slate-100 text-xs focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Email Body Message <span className="text-rose-400">*</span>
              </label>
              <textarea
                rows={7}
                required
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Compose your full official email body..."
                className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-slate-100 text-xs focus:outline-none focus:border-indigo-500 leading-relaxed font-sans"
              />
            </div>

            <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
              <button
                type="submit"
                disabled={submitting}
                className="w-full sm:flex-1 py-3 px-4 btn-premium text-white text-xs font-semibold rounded-xl transition disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                    <span>Dispatching via Nodemailer...</span>
                  </>
                ) : (
                  <>
                    <span>✉️</span>
                    <span>Send Email Broadcast</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => {
                  setSubject('');
                  setMessage('');
                  setToastMsg({ type: '', text: '', hint: '' });
                }}
                className="w-full sm:w-auto px-4 py-3 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-slate-200 text-xs font-medium rounded-xl transition"
              >
                Clear
              </button>
            </div>
          </form>
        </div>
      </div>
    </SidebarLayout>
  );
};

export default SendEmail;
