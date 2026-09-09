import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const THEMES = [
  { id: 'indigo', label: 'Indigo',  hex: '#6366f1' },
  { id: 'emerald', label: 'Emerald', hex: '#10b981' },
  { id: 'amber',   label: 'Amber',   hex: '#f59e0b' },
  { id: 'rose',    label: 'Rose',    hex: '#f43f5e' },
];

const Navbar = ({ toggleSidebar }) => {
  const { user, logout } = useAuth();
  const [currentTheme, setCurrentTheme] = useState(
    () => localStorage.getItem('estudy_theme') || 'indigo'
  );

  // Apply saved theme on mount
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

  const roleBadge = {
    student: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
    teacher: 'bg-indigo-500/10 text-indigo-300 border-indigo-500/30',
    admin:   'bg-amber-500/10 text-amber-300 border-amber-500/30',
    superadmin: 'bg-rose-500/15 text-rose-300 border-rose-500/30 font-bold',
  };

  return (
    <header className="h-16 border-b border-slate-800/80 bg-slate-950/85 backdrop-blur-xl px-4 sm:px-6 flex items-center justify-between sticky top-0 z-50 transition-all shadow-md">
      {/* Left — Menu + Logo */}
      <div className="flex items-center gap-3">
        <button
          onClick={toggleSidebar}
          className="lg:hidden p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/80 transition-all"
          aria-label="Toggle menu"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-xl overflow-hidden border border-brand/40 shadow-brand group-hover:scale-105 group-hover:rotate-2 transition-all bg-slate-900 shrink-0">
            <img src="/logo.png" alt="E-Study Corner Logo" className="w-full h-full object-cover" />
          </div>
          <div className="flex flex-col">
            <span className="font-extrabold text-base tracking-tight t-brand-grad font-display leading-tight">
              E-Study Corner
            </span>
            <span className="text-[10px] text-slate-400 font-medium hidden sm:inline-block">
              Smart Technical Learning
            </span>
          </div>
        </Link>
      </div>

      {/* Right — Theme switcher + User Profile */}
      <div className="flex items-center gap-3 sm:gap-4">
        {/* Theme Palette Switcher */}
        <div
          className="flex items-center gap-2 px-2.5 py-1.5 bg-slate-900/90 rounded-xl border border-slate-800/90 shadow-inner"
          title="Switch Color Theme"
        >
          {THEMES.map((t) => (
            <button
              key={t.id}
              onClick={() => changeTheme(t.id)}
              title={`${t.label} theme`}
              aria-label={`${t.label} theme`}
              style={{ backgroundColor: t.hex }}
              className={`w-3.5 h-3.5 rounded-full transition-all duration-300 ${
                currentTheme === t.id
                  ? 'ring-2 ring-white ring-offset-2 ring-offset-slate-950 scale-125 shadow-md shadow-white/20'
                  : 'opacity-40 hover:opacity-100 hover:scale-110'
              }`}
            />
          ))}
        </div>

        {user && (
          <>
            <span className={`px-2.5 py-1 text-[11px] font-semibold rounded-full border capitalize hidden sm:inline-block shadow-xs ${roleBadge[user.role] || 'bg-slate-500/10 text-slate-400 border-slate-500/20'}`}>
              {user.role === 'superadmin' ? '👑 Super Admin' : user.role}
            </span>

            <div className="flex items-center gap-2.5 pl-2 border-l border-slate-800/80">
              <div className="w-8 h-8 rounded-xl bg-brand flex items-center justify-center font-bold text-white text-xs shadow-brand ring-1 ring-white/20">
                {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
              </div>
              <div className="hidden md:flex flex-col leading-tight">
                <span className="text-xs font-bold text-slate-200">{user.name}</span>
                <span className="text-[10px] text-slate-400 truncate max-w-[140px]">{user.email}</span>
              </div>
            </div>

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
