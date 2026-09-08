// frontend/src/pages/Auth/LoginForm.jsx
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const LoginForm = () => {
  const navigate = useNavigate();
  const { login, demoLogin, error } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('student');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [localError, setLocalError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError('');
    setIsSubmitting(true);

    const res = await login(email, password, role);
    setIsSubmitting(false);

    if (res?.success) {
      const redirectPath = res.user.role === 'teacher' ? '/teacher' : res.user.role === 'admin' ? '/admin' : '/student';
      navigate(redirectPath);
    } else {
      setLocalError(res?.message || 'Invalid credentials');
    }
  };

  const handleDemoLogin = async (selectedRole) => {
    setLocalError('');
    setIsSubmitting(true);
    const res = await demoLogin(selectedRole);
    setIsSubmitting(false);

    if (res?.success) {
      const redirectPath = selectedRole === 'teacher' ? '/teacher' : selectedRole === 'admin' ? '/admin' : '/student';
      navigate(redirectPath);
    } else {
      setLocalError(res?.message || 'Demo login failed');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 sm:p-6 font-sans relative overflow-hidden">
      {/* Floating Ambient Glow Orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-600/20 rounded-full blur-[120px] pointer-events-none animate-float-slow"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-[120px] pointer-events-none animate-float-reverse"></div>

      <div className="w-full max-w-md glass-panel p-8 sm:p-10 rounded-3xl shadow-2xl relative z-10 border border-slate-800 space-y-6">
        <div className="text-center space-y-2">
          <Link to="/" className="inline-block group">
            <div className="w-14 h-14 bg-linear-to-tr from-indigo-500 via-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-2 shadow-lg shadow-indigo-500/30 group-hover:scale-110 transition-transform border border-white/20">
              <span className="text-2xl font-black text-white">E</span>
            </div>
          </Link>
          <h1 className="text-2xl font-black tracking-tight text-white">E-Study Corner Portal</h1>
          <p className="text-xs text-slate-400">Government Polytechnic Aurai, Bhadohi</p>
        </div>

        {/* 1-Click Quick Demo Login Presets */}
        <div className="bg-slate-900/80 p-4 rounded-2xl border border-indigo-500/20 space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-indigo-300 uppercase tracking-wider">
              ⚡ 1-Click Demo Access
            </span>
            <span className="text-[10px] text-slate-400">Select Role</span>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => handleDemoLogin('student')}
              className="py-2.5 px-2 text-xs font-bold bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/20 rounded-xl transition-all shadow-sm flex flex-col items-center gap-1 hover:scale-105"
            >
              <span>🎓</span>
              <span>Student</span>
            </button>
            <button
              type="button"
              onClick={() => handleDemoLogin('teacher')}
              className="py-2.5 px-2 text-xs font-bold bg-indigo-500/10 text-indigo-300 border border-indigo-500/30 hover:bg-indigo-500/20 rounded-xl transition-all shadow-sm flex flex-col items-center gap-1 hover:scale-105"
            >
              <span>👨‍🏫</span>
              <span>Teacher</span>
            </button>
            <button
              type="button"
              onClick={() => handleDemoLogin('admin')}
              className="py-2.5 px-2 text-xs font-bold bg-amber-500/10 text-amber-300 border border-amber-500/30 hover:bg-amber-500/20 rounded-xl transition-all shadow-sm flex flex-col items-center gap-1 hover:scale-105"
            >
              <span>🛡️</span>
              <span>Admin</span>
            </button>
          </div>
        </div>

        {(localError || error) && (
          <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2">
            <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{localError || error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Role selection tabs */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Portal Role</label>
            <div className="grid grid-cols-3 gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800">
              {['student', 'teacher', 'admin'].map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setRole(r)}
                  className={`py-2 text-xs font-bold capitalize rounded-lg transition-all ${
                    role === r
                      ? 'bg-linear-to-r from-indigo-600 to-purple-600 text-white shadow-md'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Email Address</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. student@estudy.com"
              className="w-full px-4 py-3 bg-slate-900/90 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-500 text-xs focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-slate-300">Password</label>
              <Link to="/reset-password" className="text-xs text-indigo-400 hover:underline">
                Forgot password?
              </Link>
            </div>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-3 bg-slate-900/90 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-500 text-xs focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3.5 px-4 btn-shimmer text-white text-xs font-extrabold rounded-xl shadow-lg shadow-indigo-600/40 hover:scale-[1.02] transition-all disabled:opacity-50 flex items-center justify-center gap-2 mt-2"
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Signing in...</span>
              </>
            ) : (
              <span>Sign In to Portal</span>
            )}
          </button>
        </form>

        <div className="text-center pt-2 border-t border-slate-800">
          <span className="text-xs text-slate-400">New student? </span>
          <Link to="/register" className="text-xs font-bold text-indigo-400 hover:underline">
            Register Account
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;
