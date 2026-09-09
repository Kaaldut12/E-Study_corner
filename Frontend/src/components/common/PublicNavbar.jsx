// frontend/src/components/common/PublicNavbar.jsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const THEMES = [
  { id: 'indigo', label: 'Indigo', hex: '#6366f1' },
  { id: 'emerald', label: 'Emerald', hex: '#10b981' },
  { id: 'amber', label: 'Amber', hex: '#f59e0b' },
  { id: 'rose', label: 'Rose', hex: '#f43f5e' },
];

const PublicNavbar = () => {
  const { user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [currentTheme, setCurrentTheme] = useState(
    () => localStorage.getItem('estudy_theme') || 'indigo'
  );

  useEffect(() => {
    const saved = localStorage.getItem('estudy_theme') || 'indigo';
    applyTheme(saved);
  }, []);

  const applyTheme = (name) => {
    if (name === 'indigo') {
      document.documentElement.removeAttribute('data-theme');
    } else {
      document.documentElement.setAttribute('data-theme', name);
    }
  };

  const changeTheme = (name) => {
    setCurrentTheme(name);
    localStorage.setItem('estudy_theme', name);
    applyTheme(name);
  };

  const openEnquiry = (e) => {
    e.preventDefault();
    setMobileMenuOpen(false);
    window.dispatchEvent(new CustomEvent('open-enquiry-modal'));
  };

  const getDashboardPath = () => {
    if (!user) return '/login';
    if (user.role === 'superadmin' || user.role === 'admin') return '/admin';
    if (user.role === 'teacher') return '/teacher';
    return '/student';
  };

  const roleBadgeStyle = {
    student: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    teacher: 'badge-brand border',
    admin: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    superadmin: 'bg-rose-500/15 text-rose-300 border-rose-500/30 font-bold',
  };

  return (
    <header className="h-20 border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-xl px-4 sm:px-8 sticky top-0 z-40 shadow-xl transition-all">
      <div className="max-w-7xl mx-auto h-full flex items-center justify-between">
        
        {/* Left: Brand Identity */}
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-11 h-11 rounded-2xl overflow-hidden border border-brand/40 shadow-brand group-hover:scale-105 group-hover:rotate-2 transition-all bg-slate-900 shrink-0">
            <img src="/logo.png" alt="E-Study Corner Logo" className="w-full h-full object-cover" />
          </div>
          <div>
            <span className="font-black text-xl tracking-tight t-brand-grad font-display block leading-tight">
              E-Study Corner
            </span>
            <span className="text-[10px] font-bold t-brand uppercase tracking-widest block truncate max-w-[220px] sm:max-w-none">
              {import.meta.env.VITE_COLLEGE_NAME || 'National Institute of Technology & Advanced Studies'}
            </span>
          </div>
        </Link>

        {/* Center: Desktop Public Navigation Links */}
        <nav className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-slate-900/50 border border-slate-800/80 text-xs font-semibold text-slate-300">
          <a
            href="/"
            className="px-3.5 py-2 rounded-xl hover:text-white hover:bg-slate-800/60 transition"
          >
            Home
          </a>
          <a
            href="/#services"
            className="px-3.5 py-2 rounded-xl hover:text-white hover:bg-slate-800/60 transition"
          >
            Services
          </a>
          <a
            href="/#academics"
            className="px-3.5 py-2 rounded-xl hover:text-white hover:bg-slate-800/60 transition"
          >
            Academics
          </a>
          <a
            href="/#about"
            className="px-3.5 py-2 rounded-xl hover:text-white hover:bg-slate-800/60 transition"
          >
            About
          </a>
          <button
            type="button"
            onClick={openEnquiry}
            className="px-3.5 py-2 rounded-xl text-indigo-400 hover:text-indigo-300 hover:bg-indigo-500/10 transition flex items-center gap-1 font-bold"
          >
            <span>💬</span>
            <span>Enquiry</span>
          </button>
        </nav>

        {/* Right: Theme Switcher + Auth Controls */}
        <div className="flex items-center gap-2.5 sm:gap-3.5">
          
          {/* Theme Palette Switcher */}
          <div
            className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-900/90 rounded-xl border border-slate-800"
            title="Switch Platform Theme"
          >
            {THEMES.map((t) => (
              <button
                key={t.id}
                onClick={() => changeTheme(t.id)}
                title={`${t.label} Theme`}
                aria-label={`${t.label} Theme`}
                style={{ backgroundColor: t.hex }}
                className={`w-3.5 h-3.5 rounded-full transition-all duration-200 ${
                  currentTheme === t.id
                    ? 'ring-2 ring-white ring-offset-1 ring-offset-slate-950 scale-110'
                    : 'opacity-40 hover:opacity-100 hover:scale-105'
                }`}
              />
            ))}
          </div>

          {/* Conditional Auth State */}
          {!user ? (
            /* WITHOUT LOGIN STATE */
            <div className="hidden sm:flex items-center gap-2.5">
              <Link
                to="/login"
                className="py-2.5 px-4 rounded-xl text-xs font-bold text-slate-300 hover:text-white hover:bg-slate-800/80 transition-all border border-slate-800 hover:border-slate-700"
              >
                Portal Login
              </Link>
              <Link
                to="/register"
                className="py-2.5 px-4 rounded-xl btn-premium text-white text-xs font-bold transition-all"
              >
                Student Registration
              </Link>
            </div>
          ) : (
            /* LOGGED IN STATE */
            <div className="flex items-center gap-2 sm:gap-3">
              <span
                className={`hidden md:inline-block px-2.5 py-1 text-[11px] font-bold rounded-full border capitalize ${
                  roleBadgeStyle[user.role] || 'bg-slate-800 text-slate-300'
                }`}
              >
                {user.role === 'superadmin' ? '👑 Super Admin' : user.role}
              </span>

              <Link
                to={getDashboardPath()}
                className="py-2 px-3 sm:px-4 rounded-xl btn-premium text-white text-xs font-bold transition-all flex items-center gap-1.5"
              >
                <span>Dashboard</span>
                <span className="text-xs">→</span>
              </Link>

              <button
                onClick={logout}
                title="Logout"
                className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </button>
            </div>
          )}

          {/* Mobile Hamburger Button */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white transition"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Dropdown */}
      {mobileMenuOpen && (
        <div className="lg:hidden absolute top-20 left-0 w-full bg-slate-950/95 backdrop-blur-2xl border-b border-slate-800 p-5 space-y-4 shadow-2xl animate-slide-down">
          <nav className="flex flex-col space-y-2 text-sm font-semibold text-slate-300">
            <a
              href="/"
              onClick={() => setMobileMenuOpen(false)}
              className="p-2.5 rounded-xl hover:bg-slate-900 hover:text-white transition"
            >
              🏠 Home
            </a>
            <a
              href="/#services"
              onClick={() => setMobileMenuOpen(false)}
              className="p-2.5 rounded-xl hover:bg-slate-900 hover:text-white transition"
            >
              💻 Student Services
            </a>
            <a
              href="/#academics"
              onClick={() => setMobileMenuOpen(false)}
              className="p-2.5 rounded-xl hover:bg-slate-900 hover:text-white transition"
            >
              📚 Online Learning
            </a>
            <a
              href="/#about"
              onClick={() => setMobileMenuOpen(false)}
              className="p-2.5 rounded-xl hover:bg-slate-900 hover:text-white transition"
            >
              ℹ️ About Platform
            </a>
            <button
              type="button"
              onClick={openEnquiry}
              className="p-2.5 rounded-xl text-left text-indigo-400 hover:bg-indigo-500/10 font-bold transition flex items-center gap-2"
            >
              <span>💬</span>
              <span>Submit Student Enquiry</span>
            </button>
          </nav>

          {/* Mobile Theme Selector */}
          <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">Theme Palette</span>
            <div className="flex items-center gap-2 px-2 py-1.5 bg-slate-900 rounded-xl border border-slate-800">
              {THEMES.map((t) => (
                <button
                  key={t.id}
                  onClick={() => changeTheme(t.id)}
                  title={`${t.label} Theme`}
                  style={{ backgroundColor: t.hex }}
                  className={`w-4 h-4 rounded-full transition-all ${
                    currentTheme === t.id ? 'ring-2 ring-white scale-110' : 'opacity-40'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Mobile Auth Actions */}
          <div className="pt-2 border-t border-slate-800/80 flex flex-col gap-2">
            {!user ? (
              <>
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center py-3 rounded-xl text-xs font-bold text-slate-200 bg-slate-900 border border-slate-800 hover:bg-slate-800 transition"
                >
                  Portal Login
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center py-3 rounded-xl btn-shimmer text-white text-xs font-bold shadow-lg shadow-indigo-600/40 transition"
                >
                  Student Registration
                </Link>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to={getDashboardPath()}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex-1 text-center py-3 rounded-xl btn-shimmer text-white text-xs font-bold transition"
                >
                  Go to Dashboard →
                </Link>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    logout();
                  }}
                  className="p-3 text-slate-400 hover:text-rose-400 bg-slate-900 border border-slate-800 rounded-xl transition"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default PublicNavbar;
