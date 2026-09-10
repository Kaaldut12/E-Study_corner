import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Navbar = ({ toggleSidebar }) => {
  const { user, logout } = useAuth();

  // Apply saved theme on mount
  useEffect(() => {
    const saved = localStorage.getItem('estudy_theme') || 'indigo';
    if (saved === 'indigo') {
      document.documentElement.removeAttribute('data-theme');
    } else {
      document.documentElement.setAttribute('data-theme', saved);
    }
  }, []);

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
          className="lg:hidden p-1.5 sm:p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/80 transition-all"
          aria-label="Toggle menu"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
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

      {/* Right — Settings + Role Badge + User Profile + Logout */}
      <div className="flex items-center gap-2 sm:gap-3">
        {user && (
          <>
            {/* Settings Link Button */}
            <Link
              to={`/${user.role === 'superadmin' ? 'admin' : user.role}/settings`}
              className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl text-slate-300 hover:text-white bg-slate-900/90 hover:bg-slate-800 border border-slate-800/90 transition shadow-sm text-xs font-semibold group"
              title="Settings (Profile, Themes & Password)"
            >
              <svg className="w-4 h-4 text-brand group-hover:rotate-45 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span className="hidden sm:inline-block">Settings</span>
            </Link>

            <span className={`px-2.5 py-1 text-[11px] font-semibold rounded-full border capitalize hidden sm:inline-block shadow-xs ${roleBadge[user.role] || 'bg-slate-500/10 text-slate-400 border-slate-500/20'}`}>
              {user.role === 'superadmin' ? '👑 Super Admin' : user.role}
            </span>

            {/* User Profile Card linked to Settings */}
            <Link
              to={`/${user.role === 'superadmin' ? 'admin' : user.role}/settings`}
              className="flex items-center gap-2 sm:gap-2.5 pl-1.5 sm:pl-2 border-l border-slate-800/80 hover:opacity-90 transition group"
              title="View Profile & Settings"
            >
              <div className="w-8 h-8 rounded-xl bg-brand flex items-center justify-center font-bold text-white text-xs shadow-brand ring-1 ring-white/20 group-hover:scale-105 transition-transform">
                {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
              </div>
              <div className="hidden md:flex flex-col leading-tight">
                <span className="text-xs font-bold text-slate-200 group-hover:text-white transition">{user.name}</span>
                <span className="text-[10px] text-slate-400 truncate max-w-[140px]">{user.email}</span>
              </div>
            </Link>

            <button
              onClick={logout}
              className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition-all"
              title="Logout"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
          </>
        )}
      </div>
    </header>
  );
};

export default Navbar;
