// frontend/src/pages/Auth/ResetPassword.jsx
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { requestPasswordReset, confirmResetPassword } from '../../services/authService';

const ResetPassword = () => {
  const navigate = useNavigate();

  const [step, setStep] = useState(1); // Step 1: Request OTP, Step 2: Confirm OTP & New Password
  const [email, setEmail] = useState('');
  const [resetCode, setResetCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Step 1: Send OTP
  const handleRequestOTP = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg('');
    setMessage('');

    try {
      const res = await requestPasswordReset(email);
      if (res.data.success) {
        setMessage(res.data.message || `Password reset OTP sent to ${email}`);
        setStep(2);
      } else {
        setErrorMsg(res.data.message || 'Unable to request password reset.');
      }
    } catch (err) {
      setErrorMsg(err.parsedMessage || err.response?.data?.message || 'Failed to send OTP. Please check your email and try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // Step 2: Confirm OTP & New Password
  const handleConfirmReset = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setMessage('');

    if (newPassword !== confirmPassword) {
      setErrorMsg('New password and confirmation password do not match.');
      return;
    }

    setSubmitting(true);

    try {
      const res = await confirmResetPassword({
        email,
        resetCode,
        newPassword
      });

      if (res.data.success) {
        setMessage(res.data.message || 'Password reset successfully! Redirecting to login...');
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      } else {
        setErrorMsg(res.data.message || 'Invalid or expired OTP code.');
      }
    } catch (err) {
      setErrorMsg(err.parsedMessage || err.response?.data?.message || 'Failed to reset password. Please check the OTP code and try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-shell min-h-screen dark:bg-slate-950 flex items-center justify-center p-3.5 sm:p-4 font-sans text-slate-900 dark:text-slate-100 relative overflow-hidden">
      <div className="w-full max-w-md glass-panel p-5 sm:p-8 rounded-2xl sm:rounded-3xl border border-slate-800 shadow-2xl space-y-5 sm:space-y-6 relative z-10">
        <div className="text-center space-y-1">
          <div className="w-12 h-12 bg-linear-to-tr from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-2 font-black text-white text-xl">
            🔒
          </div>
          <h1 className="text-2xl font-extrabold text-white">Reset Password</h1>
          <p className="text-xs text-slate-400">
            {step === 1 ? 'Step 1: Enter email to receive a 6-digit OTP' : 'Step 2: Enter OTP code and new password'}
          </p>
        </div>

        {message && (
          <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold text-center">
            ✓ {message}
          </div>
        )}


        {errorMsg && (
          <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs text-center">
            ⚠ {errorMsg}
          </div>
        )}

        {step === 1 ? (
          <form onSubmit={handleRequestOTP} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Email Address</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="student@estudy.com"
                className="w-full px-4 py-3 bg-slate-900 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-500 text-xs focus:outline-none focus:border-indigo-500"
              />
            </div>
            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3.5 px-4 btn-shimmer text-white text-xs font-extrabold rounded-xl shadow-lg shadow-indigo-600/40 hover:scale-[1.02] transition-all disabled:opacity-50"
            >
              {submitting ? 'Sending OTP Email...' : 'Send 6-Digit OTP Code'}
            </button>
            <div className="text-center pt-2">
              <Link to="/login" className="text-xs text-slate-400 hover:text-slate-200">
                ← Back to Login
              </Link>
            </div>
          </form>
        ) : (
          <form onSubmit={handleConfirmReset} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">6-Digit OTP Reset Code</label>
              <input
                type="text"
                required
                maxLength={6}
                value={resetCode}
                onChange={(e) => setResetCode(e.target.value)}
                placeholder="123456"
                className="w-full px-4 py-3 bg-slate-900 border border-slate-800 rounded-xl text-slate-100 text-center font-mono text-base tracking-widest focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">New Password</label>
              <input
                type="password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password"
                className="w-full px-4 py-3 bg-slate-900 border border-slate-800 rounded-xl text-slate-100 text-xs focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Confirm New Password</label>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter new password"
                className="w-full px-4 py-3 bg-slate-900 border border-slate-800 rounded-xl text-slate-100 text-xs focus:outline-none focus:border-indigo-500"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3.5 px-4 btn-premium text-white text-xs font-extrabold shadow-brand tracking-wide flex items-center justify-center gap-2 hover:scale-[1.02] transition-all disabled:opacity-50"
            >
              {submitting ? 'Resetting Password...' : 'Confirm & Update Password'}
            </button>

            <div className="flex items-center justify-between text-xs pt-2">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="text-slate-400 hover:text-slate-200"
              >
                ← Back to Step 1
              </button>
              <Link to="/login" className="text-indigo-400 hover:underline">
                Return to Login
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default ResetPassword;
