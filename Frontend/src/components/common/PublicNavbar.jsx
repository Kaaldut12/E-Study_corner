// frontend/src/components/common/PublicNavbar.jsx
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Sun, Moon, Sparkles } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { THEMES } from '../../utils/themes';

const PublicNavbar = () => {
  const { user, logout } = useAuth();
  const { mode, toggleMode, colorTheme, setColorTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const changeTheme = (name) => {
    setColorTheme(name);
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
    student: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
    teacher: 'badge-brand border',
    admin: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
    superadmin: 'bg-rose-500/15 text-rose-600 dark:text-rose-300 border-rose-500/30 font-bold',
  };

  return (
    <header className="public-navbar h-16 sm:h-20 border-b border-slate-200/90 dark:border-slate-800/80 bg-white/85 dark:bg-slate-950/85 backdrop-blur-xl px-3.5 sm:px-8 sticky top-0 z-40 shadow-xs dark:shadow-xl transition-all">
      <div className="max-w-7xl mx-auto h-full flex items-center justify-between">
        
        {/* Left: Brand Identity */}
        <Link to="/" className="flex items-center gap-2.5 sm:gap-3 group">
          <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl overflow-hidden border border-brand/40 shadow-brand group-hover:scale-105 group-hover:rotate-2 transition-all bg-white dark:bg-slate-900 shrink-0 p-0.5">
            <img src="/logo.png" alt="E-Study Corner Logo" className="w-full h-full object-cover rounded-lg" />
          </div>
          <div>
            <span className="font-black text-lg sm:text-xl tracking-tight t-brand-grad font-display block leading-tight">
              E-Study Corner
            </span>
            <span className="text-[9px] sm:text-[10px] font-bold t-brand uppercase tracking-widest block truncate max-w-[180px] sm:max-w-none">
              {import.meta.env.VITE_PLATFORM_TAGLINE || 'Engineered by Abhay Patel'}
            </span>
          </div>
        </Link>

        {/* Center: Desktop Public Navigation Links */}
        <nav className="hidden lg:flex items-center gap-1.5 px-3.5 py-1.5 rounded-2xl bg-slate-100/90 dark:bg-slate-900/50 border border-slate-200/90 dark:border-slate-800/80 text-xs font-semibold text-slate-700 dark:text-slate-300 shadow-xs">
          <a
            href="/"
            className="px-3.5 py-2 rounded-xl text-slate-600 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white hover:bg-white dark:hover:bg-slate-800/70 transition shadow-none hover:shadow-xs"
          >
            Home
          </a>
          <a
            href="/#services"
            className="px-3.5 py-2 rounded-xl text-slate-600 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white hover:bg-white dark:hover:bg-slate-800/70 transition shadow-none hover:shadow-xs"
          >
            Services
          </a>
          <a
            href="/#academics"
            className="px-3.5 py-2 rounded-xl text-slate-600 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white hover:bg-white dark:hover:bg-slate-800/70 transition shadow-none hover:shadow-xs"
          >
            Academics
          </a>
          <a
            href="/#about"
            className="px-3.5 py-2 rounded-xl text-slate-600 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white hover:bg-white dark:hover:bg-slate-800/70 transition shadow-none hover:shadow-xs"
          >
            About
          </a>
          <button
            type="button"
            onClick={openEnquiry}
            className="px-3.5 py-2 rounded-xl text-brand hover:bg-brand/10 transition flex items-center gap-1.5 font-bold cursor-pointer"
          >
            <span>💬</span>
            <span>Enquiry</span>
          </button>
        </nav>

        {/* Right: Theme Mode + Palette Switcher + Auth Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          
          {/* Theme Palette Switcher */}
          <div
            className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-100/90 dark:bg-slate-900/90 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs"
            title="Switch Platform Theme"
          >
            {THEMES.map((t) => (
              <button
                key={t.id}
                onClick={() => changeTheme(t.id)}
                title={`${t.label} Theme (${t.category})`}
                aria-label={`${t.label} Theme`}
                style={{ backgroundColor: t.hex }}
                className={`w-3.5 h-3.5 rounded-full transition-all duration-200 cursor-pointer ${
                  colorTheme === t.id
                    ? 'ring-2 ring-slate-900 dark:ring-white ring-offset-1 ring-offset-white dark:ring-offset-slate-950 scale-110 shadow-xs'
                    : 'opacity-40 hover:opacity-100 hover:scale-105'
                }`}
              />
            ))}
          </div>

          {/* Quick Light/Dark Mode Switcher */}
          <button
            onClick={toggleMode}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-slate-700 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white bg-slate-100/90 dark:bg-slate-900/90 hover:bg-slate-200/90 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800/90 transition shadow-xs text-xs font-semibold cursor-pointer group"
            title={mode === 'dark' ? 'Switch to Lite Theme (Daylight)' : 'Switch to Dark Theme (Midnight)'}
            aria-label="Toggle theme mode"
          >
            {mode === 'dark' ? (
              <Sun className="w-4 h-4 text-amber-500 transition-transform group-hover:rotate-45" />
            ) : (
              <Moon className="w-4 h-4 text-indigo-500 transition-transform group-hover:-rotate-12" />
            )}
          </button>

          {/* Conditional Auth State */}
          {!user ? (
            /* WITHOUT LOGIN STATE */
            <div className="hidden sm:flex items-center gap-2">
              <Link
                to="/login"
                className="py-2 px-3 sm:py-2.5 sm:px-4 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 hover:text-slate-950 dark:hover:text-white bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800/80 transition-all border border-slate-200 dark:border-slate-800"
              >
                Portal Login
              </Link>
              <Link
                to="/register"
                className="py-2 px-3.5 sm:py-2.5 sm:px-4 rounded-xl btn-premium text-white text-xs font-bold transition-all shadow-brand"
              >
                Registration
              </Link>
            </div>
          ) : (
            /* LOGGED IN STATE */
            <div className="flex items-center gap-2 sm:gap-2.5">
              <span
                className={`hidden md:inline-block px-2.5 py-1 text-[11px] font-bold rounded-full border capitalize ${
                  roleBadgeStyle[user.role] || 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                }`}
              >
                {user.role === 'superadmin' ? '👑 Super Admin' : user.role}
              </span>

              <Link
                to={getDashboardPath()}
                className="py-2 px-3 sm:px-4 rounded-xl btn-premium text-white text-xs font-bold transition-all flex items-center gap-1.5 shadow-brand"
              >
                <span>Dashboard</span>
                <span className="text-xs">→</span>
              </Link>

              <button
                onClick={logout}
                title="Logout"
                className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 rounded-xl transition cursor-pointer"
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
            className="lg:hidden p-2 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white transition cursor-pointer"
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
        <div className="lg:hidden absolute top-16 sm:top-20 left-0 w-full bg-white/95 dark:bg-slate-950/95 backdrop-blur-2xl border-b border-slate-200 dark:border-slate-800 p-5 space-y-4 shadow-2xl animate-in fade-in slide-in-from-top-2 duration-200">
          <nav className="flex flex-col space-y-1.5 text-sm font-semibold text-slate-700 dark:text-slate-300">
            <a
              href="/"
              onClick={() => setMobileMenuOpen(false)}
              className="p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-900 hover:text-slate-950 dark:hover:text-white transition"
            >
              🏠 Home
            </a>
            <a
              href="/#services"
              onClick={() => setMobileMenuOpen(false)}
              className="p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-900 hover:text-slate-950 dark:hover:text-white transition"
            >
              💻 Student Services
            </a>
            <a
              href="/#academics"
              onClick={() => setMobileMenuOpen(false)}
              className="p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-900 hover:text-slate-950 dark:hover:text-white transition"
            >
              📚 Online Learning
            </a>
            <a
              href="/#about"
              onClick={() => setMobileMenuOpen(false)}
              className="p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-900 hover:text-slate-950 dark:hover:text-white transition"
            >
              ℹ️ About Platform
            </a>
            <button
              type="button"
              onClick={openEnquiry}
              className="p-2.5 rounded-xl text-left text-brand hover:bg-brand/10 font-bold transition flex items-center gap-2 cursor-pointer"
            >
              <span>💬</span>
              <span>Submit Student Enquiry</span>
            </button>
          </nav>

          {/* Mobile Theme Selector */}
          <div className="pt-3 border-t border-slate-200 dark:border-slate-800/80 flex items-center justify-between">
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Theme Palette</span>
            <div className="flex items-center gap-1.5 px-2 py-1.5 bg-slate-100 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
              {THEMES.map((t) => (
                <button
                  key={t.id}
                  onClick={() => changeTheme(t.id)}
                  title={`${t.label} Theme`}
                  style={{ backgroundColor: t.hex }}
                  className={`w-4 h-4 rounded-full transition-all cursor-pointer ${
                    colorTheme === t.id ? 'ring-2 ring-slate-900 dark:ring-white scale-110 shadow-xs' : 'opacity-40 hover:opacity-100'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Mobile Auth Actions */}
          <div className="pt-2 border-t border-slate-200 dark:border-slate-800/80 flex flex-col gap-2">
            {!user ? (
              <>
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center py-2.5 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-200 dark:hover:bg-slate-800 transition"
                >
                  Portal Login
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center py-2.5 rounded-xl btn-premium text-white text-xs font-bold shadow-brand transition"
                >
                  Student Registration
                </Link>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to={getDashboardPath()}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex-1 text-center py-2.5 rounded-xl btn-premium text-white text-xs font-bold transition shadow-brand"
                >
                  Go to Dashboard →
                </Link>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    logout();
                  }}
                  className="p-2.5 text-slate-400 hover:text-rose-500 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl transition"
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
