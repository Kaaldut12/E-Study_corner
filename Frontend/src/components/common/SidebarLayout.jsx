// frontend/src/components/common/SidebarLayout.jsx
import { useState, useEffect } from 'react';
import { NavLink, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import Navbar from '../Navbar';

const SidebarLayout = ({ children }) => {
  const { user } = useAuth();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [location.pathname]);

  const role = user?.role || 'student';

  const navSectionsByRole = {
    student: [
      {
        sectionTitle: 'Learning',
        items: [
          { path: '/student', label: 'Dashboard', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
          { path: '/student/courses', label: 'Course Catalog', icon: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253' },
          { path: '/student/assignments', label: 'Assignments', icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
          { path: '/student/questions', label: 'Ask Teacher (Q&A)', icon: 'M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z' },
          { path: '/student/quizzes', label: 'Quizzes & Practice', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4' },
          { path: '/student/study-material', label: 'Study Materials', icon: 'M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' }
        ]
      },
      {
        sectionTitle: 'Tools & AI',
        items: [
          { path: '/student/notes', label: 'Personal Notes', icon: 'M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z' },
          { path: '/student/ai-coach', label: 'AI Study Coach', icon: 'M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z' },
          { path: '/student/progress', label: 'Progress Tracking', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' },
          { path: '/student/notifications-feed', label: 'Notice Board', icon: 'M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9' }
        ]
      },
      {
        sectionTitle: 'Account & Service',
        items: [
          { path: '/student/leave', label: 'Apply for Leave', icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' },
          { path: '/student/feedback', label: 'Grades & Feedback', icon: 'M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z' },
          { path: '/student/profile', label: 'My Profile', icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' },
          { path: '/student/contact-admin', label: 'Help & Support', icon: 'M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z' }
        ]
      }
    ],
    teacher: [
      {
        sectionTitle: 'Coursework',
        items: [
          { path: '/teacher', label: 'Dashboard', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
          { path: '/teacher/assignments', label: 'Assignments & Submissions', icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
          { path: '/teacher/create-assignment', label: 'Give Assignment', icon: 'M12 4v16m8-8H4' },
          { path: '/teacher/questions', label: 'Student Doubts (Q&A)', icon: 'M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z' },
          { path: '/teacher/courses', label: 'Course Catalog', icon: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253' },
          { path: '/teacher/create-course', label: 'Create Course', icon: 'M12 4v16m8-8H4' }
        ]
      },
      {
        sectionTitle: 'Classroom & Service',
        items: [
          { path: '/teacher/students', label: 'Students Roster', icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z' },
          { path: '/teacher/leave', label: 'Leave Requests', icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' }
        ]
      }
    ],
    admin: [
      {
        sectionTitle: 'Platform',
        items: [
          { path: '/admin', label: 'Dashboard', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
          { path: '/admin/analytics', label: 'Analytics', icon: 'M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z' },
          { path: '/admin/users', label: 'Users Directory', icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z' },
          { path: '/admin/students', label: 'Student Governance', icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z' },
          { path: '/admin/study-material', label: 'Study Materials', icon: 'M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
          { path: '/admin/leaves', label: 'Leave Approvals', icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' },
          { path: '/admin/notifications', label: 'Notifications', icon: 'M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9' },
          { path: '/admin/messages', label: 'Messages', icon: 'M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z' }
        ]
      }
    ],
    superadmin: [
      {
        sectionTitle: 'Platform Command',
        items: [
          { path: '/admin', label: 'Overview', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' },
          { path: '/admin/users', label: 'User Directory', icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z' },
          { path: '/admin/students', label: 'Student Governance', icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z' },
          { path: '/admin/analytics', label: 'Analytics', icon: 'M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z' },
          { path: '/admin/leaves', label: 'Leave Approvals', icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' },
          { path: '/teacher', label: 'Teacher Portal', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
          { path: '/student', label: 'Student Portal', icon: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253' }
        ]
      }
    ]
  };

  const navSections = navSectionsByRole[role] || navSectionsByRole.student;

  return (
    <div className="min-h-screen bg-[#070a12] flex flex-col text-slate-100 font-sans relative">
      {/* Dynamic Background Ambient Glowing Blobs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-12 left-1/4 w-[32rem] h-[32rem] bg-indigo-600/10 rounded-full blur-[140px] animate-float-slow" />
        <div className="absolute bottom-16 right-1/4 w-[34rem] h-[34rem] bg-purple-600/10 rounded-full blur-[150px] animate-float-reverse" />
        <div className="absolute top-1/2 right-12 w-80 h-80 bg-emerald-600/5 rounded-full blur-[120px] animate-pulse-glow" />
      </div>

      <Navbar toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

      <div className="flex flex-1 relative z-10">
        {/* Mobile backdrop */}
        {sidebarOpen && (
          <div
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 top-16 z-30 bg-slate-950/80 backdrop-blur-md lg:hidden transition-opacity"
          />
        )}

        {/* Fixed Sidebar */}
        <aside
          className={`fixed top-16 left-0 z-40 w-64 h-[calc(100vh-4rem)] bg-slate-900/90 backdrop-blur-2xl border-r border-slate-800/80 shadow-2xl transform transition-transform duration-300 ease-out flex flex-col shrink-0 ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
          }`}
        >
          <nav className="flex-1 px-3.5 py-5 space-y-6 overflow-y-auto">
            {navSections.map((sec, secIdx) => (
              <div key={secIdx} className="space-y-1.5">
                <div className="px-3 py-1 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-brand" />
                  <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest font-display">
                    {sec.sectionTitle}
                  </span>
                </div>
                {sec.items.map((item) => (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    end={item.path === `/student` || item.path === `/teacher` || item.path === `/admin`}
                    onClick={() => {
                      setSidebarOpen(false);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 group relative ${
                        isActive
                          ? 'bg-brand text-white shadow-brand ring-1 ring-white/20 font-bold translate-x-1'
                          : 'text-slate-400 hover:text-white hover:bg-slate-800/70 hover:translate-x-0.5'
                      }`
                    }
                  >
                    {({ isActive }) => (
                      <>
                        <svg
                          className={`w-4 h-4 shrink-0 transition-transform duration-200 ${
                            isActive ? 'text-white scale-110' : 'text-slate-400 group-hover:text-white group-hover:scale-105'
                          }`}
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={item.icon} />
                        </svg>
                        <span className="truncate">{item.label}</span>
                        {isActive && (
                          <span className="ml-auto w-1.5 h-1.5 rounded-full bg-white shadow-sm" />
                        )}
                      </>
                    )}
                  </NavLink>
                ))}
              </div>
            ))}
          </nav>

          {/* Sidebar Footer User Quick Card */}
          {user && (
            <div className="p-3.5 border-t border-slate-800/80 bg-slate-950/50">
              <Link
                to={role === 'student' ? '/student/profile' : '#'}
                className="flex items-center gap-3 p-2 rounded-xl hover:bg-slate-800/60 transition group"
              >
                <div className="relative">
                  <div className="w-8 h-8 rounded-lg bg-brand flex items-center justify-center font-bold text-white text-xs shadow-brand group-hover:scale-105 transition-transform">
                    {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-slate-900" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-bold text-slate-200 truncate group-hover:text-white transition">
                    {user.name}
                  </div>
                  <div className="text-[10px] text-slate-400 capitalize flex items-center gap-1">
                    <span className="w-1 h-1 rounded-full bg-emerald-400 inline-block animate-ping" />
                    <span>Active {user.role}</span>
                  </div>
                </div>
              </Link>
            </div>
          )}
        </aside>

        {/* Main Content with Fixed Sidebar Offset */}
        <div className="flex-1 lg:pl-64 w-full min-w-0 flex flex-col">
          <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto animate-slide-up">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
};

export default SidebarLayout;
