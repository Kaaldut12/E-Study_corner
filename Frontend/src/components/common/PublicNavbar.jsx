import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Sun, Moon, Sparkles, MessageSquare, Palette, Check, ArrowRight, Shield } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { THEMES } from '../../utils/themes';

const PublicNavbar = () => {
  const { user, logout } = useAuth();
  const { mode, toggleMode, colorTheme, setColorTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [paletteMenuOpen, setPaletteMenuOpen] = useState(false);
  const paletteRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (paletteRef.current && !paletteRef.current.contains(event.target)) {
        setPaletteMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const activeThemeObj = THEMES.find((t) => t.id === colorTheme) || THEMES[0];

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
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Enquiry</span>
          </button>
        </nav>

        {/* Right: Theme Mode + Palette Switcher + Auth Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          
          {/* Quick Color Palette Switcher */}
          <div className="relative hidden sm:block" ref={paletteRef}>
            <button
              type="button"
              onClick={() => setPaletteMenuOpen(!paletteMenuOpen)}
              className="p-2 rounded-xl text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
              title={`Accent Theme: ${activeThemeObj?.label}`}
              aria-label="Choose color theme palette"
            >
              <span
                className="w-3.5 h-3.5 rounded-full block border border-white dark:border-slate-900 shadow-xs"
                style={{ backgroundColor: activeThemeObj?.hex }}
              />
            </button>

            {/* Flyout Palette Selector Menu */}
            {paletteMenuOpen && (
              <div className="absolute right-0 top-full mt-2 w-52 p-2 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl z-50 animate-in fade-in duration-150">
                <div className="px-2.5 py-1.5 border-b border-slate-100 dark:border-slate-800 mb-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Accent Palette
                  </span>
                </div>

                <div className="space-y-0.5 max-h-60 overflow-y-auto">
                  {THEMES.map((t) => {
                    const isSelected = colorTheme === t.id;
                    return (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => {
                          changeTheme(t.id);
                          setPaletteMenuOpen(false);
                        }}
                        className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                          isSelected
                            ? 'bg-slate-100 dark:bg-slate-800 text-slate-950 dark:text-white font-bold'
                            : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-850 hover:text-slate-900 dark:hover:text-slate-200'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span
                            className="w-3 h-3 rounded-full shrink-0 shadow-xs"
                            style={{ backgroundColor: t.hex }}
                          />
                          <span>{t.label}</span>
                        </div>
                        {isSelected && <Check className="w-3.5 h-3.5 text-brand" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Quick Light/Dark Mode Switcher */}
          <button
            type="button"
            onClick={toggleMode}
            className="theme-control flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl transition shadow-xs text-xs font-semibold cursor-pointer group"
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
            <div className="hidden lg:flex items-center gap-2">
              <Link
                to="/login"
                className="theme-control portal-login-link py-2 px-3 sm:py-2.5 sm:px-4 rounded-xl transition-all text-xs font-bold"
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
            <div className="hidden lg:flex items-center gap-2 sm:gap-2.5">
              <span
                className={`hidden md:inline-block px-2.5 py-1 text-[11px] font-bold rounded-full border capitalize ${
                  roleBadgeStyle[user.role] || 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                }`}
              >
                {user.role === 'superadmin' ? 'Super Admin' : user.role}
              </span>

              <Link
                to={getDashboardPath()}
                className="py-2 px-3 sm:px-4 rounded-xl btn-premium text-white text-xs font-bold transition-all flex items-center gap-1.5 shadow-brand"
              >
                <span>Dashboard</span>
                <ArrowRight className="w-3.5 h-3.5" />
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
            className="theme-control lg:hidden p-2 rounded-xl transition cursor-pointer"
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
        <div className="theme-mobile-drawer lg:hidden absolute top-16 sm:top-20 left-0 w-full backdrop-blur-2xl p-5 space-y-4 shadow-2xl animate-in fade-in slide-in-from-top-2 duration-200">
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
            <div className="theme-palette theme-mobile-palette flex items-center gap-1.5 px-2 py-1.5 rounded-xl">
              {THEMES.map((t) => (
                <button
                  key={t.id}
                  onClick={() => changeTheme(t.id)}
                  title={`${t.label} Theme`}
                  aria-label={`${t.label} Theme`}
                  aria-pressed={colorTheme === t.id}
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
                  className="theme-control portal-login-link w-full text-center py-2.5 rounded-xl transition"
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
