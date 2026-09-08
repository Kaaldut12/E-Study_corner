import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';

const Navbar = ({ toggleSidebar }) => {
  const { user, logout } = useAuth();
  const [currentTheme, setCurrentTheme] = useState(() => localStorage.getItem('estudy_theme') || 'indigo');

  useEffect(() => {
    const saved = localStorage.getItem('estudy_theme');
    if (saved && saved !== 'indigo') {
      document.documentElement.setAttribute('data-theme', saved);
    }
  }, []);

  const changeTheme = (themeName) => {
    setCurrentTheme(themeName);
    localStorage.setItem('estudy_theme', themeName);
    if (themeName === 'indigo') {
      document.documentElement.removeAttribute('data-theme');
    } else {
      document.documentElement.setAttribute('data-theme', themeName);
    }
  };

  const themes = [
    { id: 'indigo', label: 'Indigo', color: 'bg-indigo-500' },
    { id: 'emerald', label: 'Emerald', color: 'bg-emerald-500' },
    { id: 'amber', label: 'Amber', color: 'bg-amber-500' },
    { id: 'rose', label: 'Rose', color: 'bg-rose-500' }
  ];

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case 'student': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'teacher': return 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20';
      case 'admin': return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      default: return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
    }
  };

  return (
    <header className="h-16 border-b border-slate-800 bg-slate-900/80 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30">
      <div className="flex items-center gap-3">
        <button
          onClick={toggleSidebar}
          className="lg:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          aria-label="Toggle menu"
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg gradient-bg-primary flex items-center justify-center font-bold text-white shadow-lg shadow-indigo-500/20">
            E
          </div>
          <span className="font-extrabold text-lg tracking-tight bg-linear-to-r from-white via-slate-200 to-indigo-300 bg-clip-text text-transparent hidden sm:inline-block">
            E-Study Corner
          </span>
        </div>
      </div>

      <div className="flex items-center gap-3 sm:gap-4">
        {/* Custom Theme Palette Switcher */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-950/80 rounded-xl border border-slate-800" title="Custom Theme Palette">
          {themes.map((t) => (
            <button
              key={t.id}
              onClick={() => changeTheme(t.id)}
              className={`w-5 h-5 rounded-lg transition-all ${t.color} ${
                currentTheme === t.id ? 'ring-2 ring-white scale-110 shadow-md' : 'opacity-60 hover:opacity-100'
              }`}
              title={`Switch to ${t.label} Theme`}
              aria-label={`${t.label} Theme`}
            />
          ))}
        </div>

        {user && (
          <>
            <span className={`px-2.5 py-1 text-xs font-semibold rounded-full border ${getRoleBadgeColor(user.role)} capitalize hidden sm:inline-block`}>
              {user.role} Portal
            </span>

            <div className="flex items-center gap-3 pl-2 border-l border-slate-800">
              <div className="w-9 h-9 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-indigo-400 font-bold text-sm shadow-inner">
                {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
              </div>
              <div className="hidden md:flex flex-col">
                <span className="text-sm font-semibold text-slate-200 leading-tight">{user.name}</span>
                <span className="text-xs text-slate-400">{user.email}</span>
              </div>
            </div>

            <button
              onClick={logout}
              className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors flex items-center gap-1.5 text-xs font-medium"
              title="Logout"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              <span className="hidden sm:inline">Logout</span>
            </button>
          </>
        )}
      </div>
    </header>
  );
};

export default Navbar;
