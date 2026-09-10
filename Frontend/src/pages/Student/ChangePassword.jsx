// frontend/src/pages/Student/ChangePassword.jsx
import { useState } from 'react';
import SidebarLayout from '../../components/common/SidebarLayout';
import studentService from '../../services/studentService';

const ChangePassword = () => {
  const [pass, setPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confPass, setConfPass] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [toastMsg, setToastMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setToastMsg('');

    if (newPass !== confPass) {
      setErrorMsg('New password and confirm password do not match!');
      return;
    }

    setSubmitting(true);

    try {
      const data = await studentService.changePassword({
        Pass: pass,
        NewPass: newPass,
        ConfPass: confPass
      });

      if (data.success) {
        setToastMsg('Password updated successfully!');
        setPass('');
        setNewPass('');
        setConfPass('');
      } else {
        setErrorMsg(data.message || 'Unable to update password.');
      }
    } catch (err) {
      setErrorMsg(err.parsedMessage || err.message || 'Unable to update password.');
    } finally {
      setSubmitting(false);
      setTimeout(() => setToastMsg(''), 3000);
    }
  };

  return (
    <SidebarLayout>
      <div className="max-w-md mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Change Account Password</h1>
          <p className="text-sm text-slate-400">Update your account credentials securely</p>
        </div>

        <div className="glass-panel p-4 sm:p-6 lg:p-8 rounded-2xl sm:rounded-3xl border border-slate-800 space-y-4">
          {toastMsg && (
            <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
              ✓ {toastMsg}
            </div>
          )}

          {errorMsg && (
            <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs">
              ⚠ {errorMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Current Password</label>
              <input
                type="password"
                required
                value={pass}
                onChange={(e) => setPass(e.target.value)}
                placeholder="Enter current password"
                className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-500 text-xs focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">New Password</label>
              <input
                type="password"
                required
                value={newPass}
                onChange={(e) => setNewPass(e.target.value)}
                placeholder="Enter new password"
                className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-500 text-xs focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Confirm New Password</label>
              <input
                type="password"
                required
                value={confPass}
                onChange={(e) => setConfPass(e.target.value)}
                placeholder="Re-enter new password"
                className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-500 text-xs focus:outline-none focus:border-indigo-500"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 px-4 btn-premium text-white text-xs font-semibold rounded-xl shadow-lg shadow-indigo-600/30 hover:opacity-95 transition disabled:opacity-50 mt-2"
            >
              {submitting ? 'Updating Password...' : 'Update Password'}
            </button>
          </form>
        </div>
      </div>
    </SidebarLayout>
  );
};

export default ChangePassword;
