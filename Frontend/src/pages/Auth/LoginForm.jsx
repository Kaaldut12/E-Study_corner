// frontend/src/pages/Auth/LoginForm.jsx
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import PublicNavbar from '../../components/common/PublicNavbar';

const DEMO_ACCOUNTS = [
  { label: 'Student', email: 'student@estudy.com', role: 'student' },
  { label: 'Teacher', email: 'teacher@estudy.com', role: 'teacher' },
  { label: 'Admin', email: 'admin@estudy.com', role: 'admin' }
];

const LoginForm = () => {
  const navigate = useNavigate();
  const { login, error } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState('student');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [localError, setLocalError] = useState('');

  const handleQuickFill = (demo) => {
    setEmail(demo.email);
    setPassword('Admin@123');
    setRole(demo.role);
    setLocalError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError('');
    setIsSubmitting(true);

    const res = await login(email, password, role);
    setIsSubmitting(false);

    if (res?.success) {
      const redirectPath =
        res.user.role === 'teacher'
          ? '/teacher'
          : res.user.role === 'admin' || res.user.role === 'superadmin'
          ? '/admin'
          : '/student';
      navigate(redirectPath);
    } else {
      setLocalError(res?.message || 'Invalid credentials. Please verify your email and password.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col font-sans text-slate-100">
      <PublicNavbar />

      <main className="flex-1 flex items-center justify-center p-4 sm:p-6">
        <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xl space-y-6">
          {/* Header */}
          <div className="text-center space-y-1.5">
            <div className="w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center mx-auto mb-3 font-bold text-xl text-white shadow-md shadow-indigo-600/30">
              E
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Sign In</h1>
            <p className="text-xs text-slate-400">
              Access your coursework, learning materials, and grades
            </p>
          </div>

          {/* Quick Demo Fill Pills */}
          <div className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-2.5">
            <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1.5 px-1">
              <span>Quick demo login:</span>
              <span className="text-[10px] text-slate-500 font-mono">Password: Admin@123</span>
            </div>
            <div className="grid grid-cols-3 gap-1.5">
              {DEMO_ACCOUNTS.map((demo) => (
                <button
                  key={demo.role}
                  type="button"
                  onClick={() => handleQuickFill(demo)}
                  className={`py-1.5 px-2 text-xs font-semibold rounded-lg transition border text-center ${
                    role === demo.role && email === demo.email
                      ? 'bg-indigo-600 text-white border-indigo-500 shadow-sm'
                      : 'bg-slate-900 text-slate-300 hover:text-white border-slate-800 hover:bg-slate-850'
                  }`}
                >
                  {demo.label}
                </button>
              ))}
            </div>
          </div>

          {(localError || error) && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2">
              <span className="font-bold">⚠</span>
              <span>{localError || error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Role Switcher */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">I am a</label>
              <div className="grid grid-cols-3 gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
                {['student', 'teacher', 'admin'].map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setRole(r)}
                    className={`py-2 text-xs font-semibold capitalize rounded-lg transition ${
                      role === r
                        ? 'bg-indigo-600 text-white shadow'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Email Address</label>
              <input
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@estudy.com"
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-500 text-xs focus:outline-none focus:border-indigo-500 transition"
              />
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-medium text-slate-300">Password</label>
                <Link to="/reset-password" className="text-xs text-indigo-400 hover:underline">
                  Forgot?
                </Link>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3.5 py-2.5 pr-12 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-500 text-xs focus:outline-none focus:border-indigo-500 transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 px-3.5 text-xs text-slate-400 hover:text-white transition"
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl shadow-md transition disabled:opacity-50 flex items-center justify-center gap-2 pt-3 pb-3"
            >
              {isSubmitting ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Signing in...</span>
                </>
              ) : (
                <span>Sign In</span>
              )}
            </button>
          </form>

          {/* Footer */}
          <div className="text-center pt-2 border-t border-slate-800 text-xs text-slate-400">
            <span>Don't have an account? </span>
            <Link to="/register" className="font-semibold text-indigo-400 hover:underline">
              Create an account
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
};

export default LoginForm;
