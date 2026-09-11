// frontend/src/pages/Auth/LoginForm.jsx
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import PublicNavbar from '../../components/common/PublicNavbar';


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
    <div className="auth-shell min-h-screen dark:bg-[#070a12] flex flex-col font-sans text-slate-900 dark:text-slate-100 relative overflow-hidden">
      {/* Background Ambient Lighting Blobs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="ambient-blob-a absolute top-1/4 left-1/4 w-96 h-96 rounded-full blur-[140px] animate-float-slow" />
        <div className="ambient-blob-b absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full blur-[150px] animate-float-reverse" />
      </div>

      <PublicNavbar />

      <main className="flex-1 flex items-center justify-center p-3.5 sm:p-6 relative z-10">
        <div className="w-full max-w-md glass-panel p-5 sm:p-8 rounded-2xl sm:rounded-3xl shadow-2xl space-y-5 sm:space-y-6 animate-slide-up">
          {/* Header */}
          <div className="text-center space-y-2">
            <div className="w-16 h-16 rounded-2xl overflow-hidden border border-brand/40 shadow-brand ring-2 ring-white/15 mx-auto mb-3 bg-slate-900 shrink-0">
              <img src="/logo.png" alt="E-Study Corner Logo" className="w-full h-full object-cover" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight font-display">
              Welcome Back
            </h1>
            <p className="text-xs text-slate-400">
              Access your coursework, learning materials, and grades
            </p>
          </div>


          {(localError || error) && (
            <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2.5 animate-fade-in">
              <span className="font-bold text-base">⚠️</span>
              <span>{localError || error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Role Switcher */}
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase tracking-wider font-display">
                I am signing in as
              </label>
              <div className="grid grid-cols-3 gap-1.5 bg-slate-950/80 p-1.5 rounded-xl border border-slate-800/80">
                {['student', 'teacher', 'admin'].map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setRole(r)}
                    className={`py-2 text-xs font-bold capitalize rounded-lg transition-all ${
                      role === r
                        ? 'bg-brand text-white shadow-brand ring-1 ring-white/20'
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
              <label className="block text-xs font-semibold text-slate-300 mb-1">Email Address</label>
              <input
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@estudy.com"
                className="w-full px-4 py-3 bg-slate-950/80 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-500 text-xs focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand transition"
              />
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-slate-300">Password</label>
                <Link to="/reset-password" className="text-xs t-brand hover:underline font-medium">
                  Forgot Password?
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
                  className="w-full px-4 py-3 pr-12 bg-slate-950/80 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-500 text-xs focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand transition"
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
              className="w-full py-3.5 px-4 btn-premium text-white text-xs font-extrabold shadow-brand tracking-wide flex items-center justify-center gap-2 mt-2"
            >
              {isSubmitting ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Authenticating...</span>
                </>
              ) : (
                <span>Sign In to Portal →</span>
              )}
            </button>
          </form>

          {/* Footer */}
          <div className="text-center pt-3 border-t border-slate-800/80 text-xs text-slate-400">
            <span>Don't have an account? </span>
            <Link to="/register" className="font-bold t-brand hover:underline">
              Create student account
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
};

export default LoginForm;
