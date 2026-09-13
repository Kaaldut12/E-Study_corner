import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Sun, Moon, Settings, LogOut, Menu, Crown, Palette, Check, ChevronDown } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { THEMES } from '../utils/themes';

const Navbar = ({ toggleSidebar }) => {
  const { user, logout } = useAuth();
  const { mode, toggleMode, colorTheme, setColorTheme } = useTheme();
  const [paletteMenuOpen, setPaletteMenuOpen] = useState(false);
  const paletteRef = useRef(null);

  // Close palette menu on outside click
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

  const roleBadge = {
    student: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30',
    teacher: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/30',
    admin:   'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30',
    superadmin: 'bg-rose-500/15 text-rose-600 dark:text-rose-300 border-rose-500/30 font-bold',
  };

  const settingsPath = `/${user?.role === 'superadmin' ? 'admin' : user?.role || 'student'}/settings`;

  return (
    <header className="app-navbar h-16 border-b border-slate-200/90 dark:border-slate-800/80 bg-white/85 dark:bg-slate-950/85 backdrop-blur-xl px-3.5 sm:px-6 flex items-center justify-between sticky top-0 z-50 transition-colors duration-200 shadow-xs dark:shadow-md">
      {/* Left — Hamburger Toggle + Brand Identity */}
      <div className="flex items-center gap-2.5 sm:gap-3.5">
        <button
          onClick={toggleSidebar}
          className="lg:hidden p-2 rounded-xl text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-all cursor-pointer"
          aria-label="Toggle navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <Link to="/" className="flex items-center gap-2.5 sm:gap-3 group">
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl overflow-hidden border border-brand/40 shadow-brand group-hover:scale-105 group-hover:rotate-2 transition-all bg-white dark:bg-slate-900 shrink-0 p-0.5">
            <img src="/logo.png" alt="E-Study Corner Logo" className="w-full h-full object-cover rounded-lg" />
          </div>
          <div className="flex flex-col">
            <span className="font-extrabold text-sm sm:text-base tracking-tight t-brand-grad font-display leading-tight">
              E-Study Corner
            </span>
            <span className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold tracking-wide hidden sm:inline-block">
              Smart Technical Learning
            </span>
          </div>
        </Link>
      </div>

      {/* Right — Quick Theme Palette + Mode Toggle + Role Badge + Profile + Logout */}
      <div className="flex items-center gap-1.5 sm:gap-2">
        {user && (
          <>
            {/* Quick Color Palette Switcher Dropdown */}
            <div className="relative" ref={paletteRef}>
              <button
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
                <div className="absolute right-0 top-full mt-2 w-56 p-2 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl z-50 animate-in fade-in duration-150">
                  <div className="px-2.5 py-1.5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between mb-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Accent Palette
                    </span>
                    <Link
                      to={`${settingsPath}?tab=themes`}
                      onClick={() => setPaletteMenuOpen(false)}
                      className="text-[10px] font-semibold text-brand hover:underline"
                    >
                      All Themes
                    </Link>
                  </div>

                  <div className="space-y-0.5 max-h-60 overflow-y-auto">
                    {THEMES.map((t) => {
                      const isSelected = colorTheme === t.id;
                      return (
                        <button
                          key={t.id}
                          type="button"
                          onClick={() => {
                            setColorTheme(t.id);
                            setPaletteMenuOpen(false);
                          }}
                          className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl text-xs font-medium transition cursor-pointer ${
                            isSelected
                              ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-semibold'
                              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800/50'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <span
                              className="w-3 h-3 rounded-full shrink-0"
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

            {/* Quick Daylight / Midnight Mode Toggle */}
            <button
              onClick={toggleMode}
              className="p-2 rounded-xl text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
              title={mode === 'dark' ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
              aria-label="Toggle theme mode"
            >
              {mode === 'dark' ? (
                <Sun className="w-4 h-4 text-amber-500" />
              ) : (
                <Moon className="w-4 h-4 text-indigo-500" />
              )}
            </button>

            {/* Role Badge */}
            <span className={`px-2.5 py-0.5 text-[10px] font-semibold rounded-full border capitalize hidden sm:inline-flex items-center gap-1 ${roleBadge[user.role] || 'bg-slate-100 dark:bg-slate-800 text-slate-500 border-slate-200 dark:border-slate-700'}`}>
              {user.role === 'superadmin' && <Crown className="w-3 h-3 text-amber-500 shrink-0" />}
              <span>{user.role === 'superadmin' ? 'Super Admin' : user.role}</span>
            </span>

            {/* Clean User Profile Capsule Button */}
            <Link
              to={settingsPath}
              className="flex items-center gap-2 p-1 sm:px-2 sm:py-1 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
              title="Profile & Settings"
              aria-label="Open User Profile"
            >
              <div className="w-7 h-7 rounded-lg bg-brand text-white flex items-center justify-center font-bold text-xs shadow-xs shrink-0">
                {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
              </div>
              <div className="hidden md:flex flex-col text-left leading-tight pr-1">
                <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate max-w-32">
                  {user.name}
                </span>
              </div>
            </Link>

            {/* Logout Button */}
            <button
              onClick={logout}
              className="p-2 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-xl transition cursor-pointer"
              title="Log Out"
              aria-label="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </>
        )}
      </div>
    </header>
  );
};

export default Navbar;
