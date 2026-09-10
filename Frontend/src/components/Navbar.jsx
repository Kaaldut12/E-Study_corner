import { Link } from 'react-router-dom';
import { Sun, Moon, Settings, LogOut, Menu, Crown } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';

const Navbar = ({ toggleSidebar }) => {
  const { user, logout } = useAuth();
  const { mode, toggleMode } = useTheme();

  const roleBadge = {
    student: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
    teacher: 'bg-indigo-500/10 text-indigo-300 border-indigo-500/30',
    admin:   'bg-amber-500/10 text-amber-300 border-amber-500/30',
    superadmin: 'bg-rose-500/15 text-rose-300 border-rose-500/30 font-bold',
  };

  return (
    <header className="h-16 border-b border-slate-800/80 bg-slate-950/85 backdrop-blur-xl px-3 sm:px-6 flex items-center justify-between sticky top-0 z-50 transition-all shadow-md">
      {/* Left — Menu + Logo */}
      <div className="flex items-center gap-2 sm:gap-3">
        <button
          onClick={toggleSidebar}
          className="lg:hidden p-1.5 sm:p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/80 transition-all cursor-pointer"
          aria-label="Toggle menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <Link to="/" className="flex items-center gap-2 sm:gap-2.5 group">
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl overflow-hidden border border-brand/40 shadow-brand group-hover:scale-105 group-hover:rotate-2 transition-all bg-slate-900 shrink-0">
            <img src="/logo.png" alt="E-Study Corner Logo" className="w-full h-full object-cover" />
          </div>
          <div className="flex flex-col">
            <span className="font-extrabold text-sm sm:text-base tracking-tight t-brand-grad font-display leading-tight">
              E-Study Corner
            </span>
            <span className="text-[10px] text-slate-400 font-medium hidden sm:inline-block">
              Smart Technical Learning
            </span>
          </div>
        </Link>
      </div>

      {/* Right — Theme Toggle + Settings + Role Badge + User Profile + Logout */}
      <div className="flex items-center gap-2 sm:gap-3">
        {user && (
          <>
            {/* Quick Mode Toggle */}
            <button
              onClick={toggleMode}
              className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl text-slate-700 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white bg-slate-100 dark:bg-slate-900/90 hover:bg-slate-200 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800/90 transition shadow-xs text-xs font-semibold cursor-pointer"
              title={mode === 'dark' ? 'Switch to Lite Theme' : 'Switch to Dark Theme'}
              aria-label="Toggle theme mode"
            >
              {mode === 'dark' ? (
                <Sun className="w-4 h-4 text-amber-500" />
              ) : (
                <Moon className="w-4 h-4 text-indigo-500" />
              )}
              <span className="hidden sm:inline-block">{mode === 'dark' ? 'Lite' : 'Dark'}</span>
            </button>

            {/* Settings Link Button */}
            <Link
              to={`/${user.role === 'superadmin' ? 'admin' : user.role}/settings`}
              className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl text-slate-700 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white bg-slate-100 dark:bg-slate-900/90 hover:bg-slate-200 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800/90 transition shadow-xs text-xs font-semibold group cursor-pointer"
              title="Settings (Profile, Themes & Password)"
            >
              <Settings className="w-4 h-4 text-brand group-hover:rotate-45 transition-transform duration-300" />
              <span className="hidden sm:inline-block">Settings</span>
            </Link>

            <span className={`px-2.5 py-1 text-[11px] font-semibold rounded-full border capitalize hidden sm:inline-flex items-center gap-1 shadow-xs ${roleBadge[user.role] || 'bg-slate-500/10 text-slate-400 border-slate-500/20'}`}>
              {user.role === 'superadmin' && <Crown className="w-3 h-3 text-amber-400 shrink-0" />}
              <span>{user.role === 'superadmin' ? 'Super Admin' : user.role}</span>
            </span>

            {/* User Profile Card linked to Settings */}
            <Link
              to={`/${user.role === 'superadmin' ? 'admin' : user.role}/settings`}
              className="flex items-center gap-2 sm:gap-2.5 pl-1.5 sm:pl-2 border-l border-slate-200 dark:border-slate-800/80 hover:opacity-90 transition group cursor-pointer"
              title="View Profile & Settings"
            >
              <div className="w-8 h-8 rounded-xl bg-brand flex items-center justify-center font-bold text-white text-xs shadow-brand ring-1 ring-white/20 group-hover:scale-105 transition-transform">
                {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
              </div>
              <div className="hidden md:flex flex-col leading-tight">
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 group-hover:text-slate-950 dark:group-hover:text-white transition">{user.name}</span>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 truncate max-w-[140px]">{user.email}</span>
              </div>
            </Link>

            <button
              onClick={logout}
              className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition-all cursor-pointer"
              title="Logout"
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
