import { useState, useEffect } from 'react';
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
    student: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    teacher: 'badge-brand border',
    admin:   'bg-amber-500/10 text-amber-400 border-amber-500/20',
    superadmin: 'bg-rose-500/15 text-rose-300 border-rose-500/30 font-bold',
  };

  return (
    <header className="h-16 border-b border-slate-800/70 bg-slate-900/80 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30 transition-all">
      {/* Left — Menu + Logo */}
      <div className="flex items-center gap-3">
        <button
          onClick={toggleSidebar}
          className="lg:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          aria-label="Toggle menu"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-brand flex items-center justify-center font-bold text-white text-sm shadow-brand transition-all">
            E
          </div>
          <span className="font-extrabold text-base tracking-tight t-brand-grad hidden sm:inline-block">
            E-Study Corner
          </span>
        </div>
      </div>

      {/* Right — Theme switcher + User */}
      <div className="flex items-center gap-3 sm:gap-4">

        {/* Theme Palette Switcher */}
        <div className="flex items-center gap-1.5 px-2 py-1.5 bg-slate-950/80 rounded-xl border border-slate-800/80" title="Switch Theme">
          {THEMES.map((t) => (
            <button
              key={t.id}
              onClick={() => changeTheme(t.id)}
              title={`${t.label} theme`}
              aria-label={`${t.label} theme`}
              style={{ backgroundColor: t.hex }}
              className={`w-4 h-4 rounded-full transition-all duration-200 ${
                currentTheme === t.id
                  ? 'ring-2 ring-white ring-offset-1 ring-offset-slate-950 scale-110'
                  : 'opacity-50 hover:opacity-90 hover:scale-105'
              }`}
            />
          ))}
        </div>

        {user && (
          <>
            <span className={`px-2.5 py-1 text-xs font-semibold rounded-full border capitalize hidden sm:inline-block ${roleBadge[user.role] || 'bg-slate-500/10 text-slate-400 border-slate-500/20'}`}>
              {user.role === 'superadmin' ? '👑 Super Admin' : user.role}
            </span>

            <div className="flex items-center gap-2.5 pl-2 border-l border-slate-800">
              <div className="w-8 h-8 rounded-full bg-brand flex items-center justify-center font-bold text-white text-xs shadow-brand">
                {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
              </div>
              <div className="hidden md:flex flex-col leading-tight">
                <span className="text-sm font-semibold text-slate-200">{user.name}</span>
                <span className="text-xs text-slate-500">{user.email}</span>
              </div>
            </div>

            <button
              onClick={logout}
              className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
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
