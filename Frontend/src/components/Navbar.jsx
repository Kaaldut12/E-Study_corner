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
      <div className="flex items-center gap-2 sm:gap-2.5">
        {user && (
          <>
            {/* Quick Color Palette Switcher Dropdown */}
            <div className="relative" ref={paletteRef}>
              <button
                onClick={() => setPaletteMenuOpen(!paletteMenuOpen)}
                className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl text-slate-700 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white bg-slate-100/90 dark:bg-slate-900/90 hover:bg-slate-200/90 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800/90 transition shadow-xs text-xs font-semibold cursor-pointer group"
                title={`Accent Theme: ${activeThemeObj?.label}`}
                aria-label="Choose color theme palette"
              >
                <span
                  className="w-3.5 h-3.5 rounded-full shadow-xs ring-1 ring-white/60 dark:ring-slate-950 shrink-0 transition-transform group-hover:scale-110"
                  style={{ backgroundColor: activeThemeObj?.hex }}
                />
                <Palette className="w-3.5 h-3.5 text-brand hidden sm:inline-block" />
                <span className="hidden md:inline-block text-[11px] font-bold truncate max-w-[90px]">
                  {activeThemeObj?.label}
                </span>
              </button>

              {/* Flyout Palette Selector Menu */}
              {paletteMenuOpen && (
                <div className="absolute right-0 top-full mt-2 w-64 p-2.5 rounded-2xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl border border-slate-200 dark:border-slate-800 shadow-2xl z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="px-2 py-1.5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between mb-1.5">
                    <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">
                      Color Palettes
                    </span>
                    <Link
                      to={`${settingsPath}?tab=themes`}
                      onClick={() => setPaletteMenuOpen(false)}
                      className="text-[10px] font-bold text-brand hover:underline"
                    >
                      View All
                    </Link>
                  </div>

                  <div className="space-y-1 max-h-72 overflow-y-auto pr-1">
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
                          className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-bold ring-1 ring-slate-200 dark:ring-slate-700'
                              : 'text-slate-600 dark:text-slate-400 hover:text-slate-950 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800/60'
                          }`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <span
                              className="w-4 h-4 rounded-full shadow-xs shrink-0 ring-1 ring-white/60 dark:ring-slate-950"
                              style={{ backgroundColor: t.hex }}
                            />
                            <div className="text-left truncate">
                              <div className="truncate leading-tight">{t.label}</div>
                              <div className="text-[9px] text-slate-400 font-normal">{t.category}</div>
                            </div>
                          </div>

                          {isSelected && (
                            <Check className="w-3.5 h-3.5 text-brand shrink-0 stroke-3" />
                          )}
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
              className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl text-slate-700 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white bg-slate-100/90 dark:bg-slate-900/90 hover:bg-slate-200/90 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800/90 transition shadow-xs text-xs font-semibold cursor-pointer group"
              title={mode === 'dark' ? 'Switch to Lite Theme (Daylight)' : 'Switch to Dark Theme (Midnight)'}
              aria-label="Toggle theme mode"
            >
              {mode === 'dark' ? (
                <Sun className="w-4 h-4 text-amber-500 transition-transform group-hover:rotate-45" />
              ) : (
                <Moon className="w-4 h-4 text-indigo-500 transition-transform group-hover:-rotate-12" />
              )}
              <span className="hidden sm:inline-block text-[11px] font-bold">{mode === 'dark' ? 'Lite' : 'Dark'}</span>
            </button>

            {/* Role Badge */}
            <span className={`px-2.5 py-1 text-[11px] font-semibold rounded-full border capitalize hidden sm:inline-flex items-center gap-1 shadow-xs ${roleBadge[user.role] || 'bg-slate-500/10 text-slate-400 border-slate-500/20'}`}>
              {user.role === 'superadmin' && <Crown className="w-3 h-3 text-amber-400 shrink-0" />}
              <span>{user.role === 'superadmin' ? 'Super Admin' : user.role}</span>
            </span>

            {/* Settings Shortcut Button */}
            <Link
              to={settingsPath}
              className="flex items-center gap-1.5 p-2 sm:px-2.5 sm:py-1.5 rounded-xl text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-slate-100/80 dark:bg-slate-900/80 hover:bg-white dark:hover:bg-slate-800 border border-slate-200/90 dark:border-slate-800/90 hover:border-slate-300 dark:hover:border-slate-700 transition shadow-2xs hover:shadow-xs text-xs font-semibold group cursor-pointer"
              title="Account Settings"
            >
              <Settings className="w-4 h-4 text-slate-500 dark:text-slate-400 group-hover:text-brand group-hover:rotate-45 transition-transform duration-300" />
              <span className="hidden xl:inline-block text-[11px] font-bold">Settings</span>
            </Link>

            {/* Executive User Profile Capsule Button */}
            <Link
              to={settingsPath}
              className="group relative flex items-center gap-2 sm:gap-2.5 p-1 sm:py-1.5 sm:px-2.5 rounded-2xl bg-slate-100/90 dark:bg-slate-900/90 hover:bg-white dark:hover:bg-slate-800/95 border border-slate-200/90 dark:border-slate-800/90 hover:border-brand/40 dark:hover:border-brand/40 shadow-2xs hover:shadow-md transition-all duration-200 cursor-pointer"
              title="Open Profile & Settings"
              aria-label="Open User Profile"
            >
              {/* Avatar with brand accent, crisp light ring, and active pulse dot */}
              <div className="relative shrink-0">
                <div className="w-8 h-8 rounded-xl bg-brand flex items-center justify-center font-bold text-white text-xs shadow-xs ring-2 ring-white dark:ring-slate-900 group-hover:scale-105 group-hover:ring-brand/30 transition-all duration-200">
                  {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                </div>
                <span className="absolute -bottom-0.5 -right-0.5 flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500 border-2 border-white dark:border-slate-900" />
                </span>
              </div>

              {/* User Identity Details */}
              <div className="hidden md:flex flex-col text-left leading-tight pr-0.5">
                <span className="navbar-user-name text-xs font-bold text-slate-900 dark:text-slate-100 group-hover:text-brand transition-colors truncate max-w-[110px] xl:max-w-[140px]">
                  {user.name}
                </span>
                <div className="flex items-center gap-1 text-[10px] text-slate-500 dark:text-slate-400">
                  <span className="capitalize font-medium">{user.role}</span>
                  <span className="text-slate-300 dark:text-slate-600">•</span>
                  <span className="text-brand font-semibold group-hover:underline">Profile</span>
                </div>
              </div>

              {/* Action Affordance Chevron */}
              <ChevronDown className="hidden sm:block w-3.5 h-3.5 text-slate-400 group-hover:text-brand group-hover:translate-y-0.5 transition-all duration-200 shrink-0" />
            </Link>

            {/* Logout Button */}
            <button
              onClick={logout}
              className="p-2 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-xl transition-all cursor-pointer border border-transparent hover:border-rose-200/80 dark:hover:border-rose-900/40"
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
