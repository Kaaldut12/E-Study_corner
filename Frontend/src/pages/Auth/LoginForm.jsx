// frontend/src/pages/Auth/LoginForm.jsx
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import PublicNavbar from '../../components/common/PublicNavbar';
import EnquiryModal from '../../components/common/EnquiryModal';

const LoginForm = () => {
  const navigate = useNavigate();
  const { login, error } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
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
      const redirectPath = res.user.role === 'teacher' ? '/teacher' : (res.user.role === 'admin' || res.user.role === 'superadmin') ? '/admin' : '/student';
      navigate(redirectPath);
    } else {
      setLocalError(res?.message || 'Invalid credentials');
    }
  };


  return (
    <div className="min-h-screen bg-slate-950 flex flex-col font-sans relative overflow-x-hidden">
      {/* Ambient glow orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full blur-[120px] pointer-events-none animate-float-slow" style={{background: 'var(--brand-glow)'}}></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full blur-[140px] pointer-events-none animate-float-reverse" style={{background: 'var(--brand-glow)'}}></div>

      {/* Top Public Navigation Bar */}
      <PublicNavbar />

      {/* Main Login Form Container */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-6 relative z-10 my-4 sm:my-8">
        <div className="w-full max-w-md glass-panel p-8 sm:p-10 rounded-3xl shadow-2xl relative z-10 border border-slate-800 space-y-6 page-animate">
          <div className="text-center space-y-2">
            <Link to="/" className="inline-block group">
              <div className="w-14 h-14 bg-brand rounded-2xl flex items-center justify-center mx-auto mb-2 shadow-brand group-hover:scale-110 transition-transform">
                <span className="text-2xl font-black text-white">E</span>
              </div>
            </Link>
            <h1 className="text-2xl font-black tracking-tight text-white">E-Study Corner Portal</h1>
            <p className="text-xs text-slate-400">
              {import.meta.env.VITE_COLLEGE_NAME || 'National Institute of Technology & Advanced Studies'}
            </p>
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
            <div className="grid grid-cols-4 gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800">
              {['student', 'teacher', 'admin', 'superadmin'].map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setRole(r)}
                  className={`py-2 text-[11px] font-bold capitalize rounded-lg transition-all ${
                    role === r
                      ? 'bg-brand text-white shadow-md'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {r === 'superadmin' ? 'Super Admin' : r}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Email Address</label>
            <input
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. student@estudy.com"
              className="w-full px-4 py-3 bg-slate-900/90 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-500 text-xs focus:outline-none focus:border-brand-solid focus:ring-1 focus:ring-[var(--brand-t1)]/30 transition"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-slate-300">Password</label>
              <Link to="/reset-password" className="text-xs t-brand hover:underline">
                Forgot password?
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
                className="w-full px-4 py-3 pr-12 bg-slate-900/90 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-500 text-xs focus:outline-none focus:border-brand-solid focus:ring-1 focus:ring-[var(--brand-t1)]/30 transition"
              />
              <button
                type="button"
                onClick={() => setShowPassword((visible) => !visible)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                aria-pressed={showPassword}
                className="absolute inset-y-0 right-0 px-4 text-slate-400 hover:text-white transition-colors"
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>
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
          <Link to="/register" className="text-xs font-bold t-brand hover:underline">
            Register Account
          </Link>
        </div>
      </div>
      </div>

      <EnquiryModal />
    </div>
  );
};

export default LoginForm;
