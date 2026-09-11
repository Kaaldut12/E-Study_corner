// frontend/src/components/common/SidebarLayout.jsx
import { useState, useEffect } from 'react';
import { NavLink, useLocation, Link } from 'react-router-dom';
import {
  LayoutDashboard,
  BookOpen,
  FileText,
  HelpCircle,
  CheckSquare,
  Download,
  StickyNote,
  Bot,
  TrendingUp,
  Bell,
  Calendar,
  Award,
  Settings as SettingsIcon,
  LifeBuoy,
  PlusCircle,
  FolderPlus,
  Users,
  FileCheck,
  MessageSquare,
  BarChart3,
  Mail,
  CalendarCheck,
  GraduationCap
} from 'lucide-react';
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
          { path: '/student', label: 'Dashboard', icon: LayoutDashboard },
          { path: '/student/courses', label: 'Course Catalog', icon: BookOpen },
          { path: '/student/assignments', label: 'Assignments', icon: FileText },
          { path: '/student/questions', label: 'Ask Teacher (Q&A)', icon: HelpCircle },
          { path: '/student/quizzes', label: 'Quizzes & Practice', icon: CheckSquare },
          { path: '/student/study-material', label: 'Study Materials', icon: Download }
        ]
      },
      {
        sectionTitle: 'Tools & AI',
        items: [
          { path: '/student/notes', label: 'Personal Notes', icon: StickyNote },
          { path: '/student/ai-coach', label: 'AI Study Coach', icon: Bot },
          { path: '/student/progress', label: 'Progress Tracking', icon: TrendingUp },
          { path: '/student/notifications-feed', label: 'Notice Board', icon: Bell }
        ]
      },
      {
        sectionTitle: 'Account & Service',
        items: [
          { path: '/student/leave', label: 'Apply for Leave', icon: Calendar },
          { path: '/student/feedback', label: 'Grades & Feedback', icon: Award },
          { path: '/student/settings', label: 'Settings', icon: SettingsIcon },
          { path: '/student/contact-admin', label: 'Help & Support', icon: LifeBuoy }
        ]
      }
    ],
    teacher: [
      {
        sectionTitle: 'Coursework',
        items: [
          { path: '/teacher', label: 'Dashboard', icon: LayoutDashboard },
          { path: '/teacher/assignments', label: 'Assignments & Submissions', icon: FileCheck },
          { path: '/teacher/create-assignment', label: 'Give Assignment', icon: PlusCircle },
          { path: '/teacher/questions', label: 'Student Doubts (Q&A)', icon: MessageSquare },
          { path: '/teacher/courses', label: 'Course Catalog', icon: BookOpen },
          { path: '/teacher/create-course', label: 'Create Course', icon: FolderPlus }
        ]
      },
      {
        sectionTitle: 'Classroom & Service',
        items: [
          { path: '/teacher/students', label: 'Students Roster', icon: Users },
          { path: '/teacher/leave', label: 'Leave Requests', icon: Calendar },
          { path: '/teacher/settings', label: 'Settings', icon: SettingsIcon }
        ]
      }
    ],
    admin: [
      {
        sectionTitle: 'Platform',
        items: [
          { path: '/admin', label: 'Dashboard', icon: LayoutDashboard },
          { path: '/admin/analytics', label: 'Analytics', icon: BarChart3 },
          { path: '/admin/users', label: 'Users Directory', icon: Users },
          { path: '/admin/students', label: 'Student Governance', icon: GraduationCap },
          { path: '/admin/study-material', label: 'Study Materials', icon: Download },
          { path: '/admin/leaves', label: 'Leave Approvals', icon: CalendarCheck },
          { path: '/admin/notifications', label: 'Notifications', icon: Bell },
          { path: '/admin/messages', label: 'Messages', icon: Mail },
          { path: '/admin/settings', label: 'Settings', icon: SettingsIcon }
        ]
      }
    ],
    superadmin: [
      {
        sectionTitle: 'Platform Command',
        items: [
          { path: '/admin', label: 'Overview', icon: LayoutDashboard },
          { path: '/admin/users', label: 'User Directory', icon: Users },
          { path: '/admin/students', label: 'Student Governance', icon: GraduationCap },
          { path: '/admin/analytics', label: 'Analytics', icon: BarChart3 },
          { path: '/admin/leaves', label: 'Leave Approvals', icon: CalendarCheck },
          { path: '/teacher', label: 'Teacher Portal', icon: GraduationCap },
          { path: '/student', label: 'Student Portal', icon: BookOpen },
          { path: '/admin/settings', label: 'Settings', icon: SettingsIcon }
        ]
      }
    ]
  };

  const navSections = navSectionsByRole[role] || navSectionsByRole.student;

  return (
    <div className="app-shell min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans relative transition-colors duration-200">
      {/* Dynamic Background Ambient Glowing Blobs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="ambient-blob-a absolute top-12 left-1/4 w-96 h-96 rounded-full blur-[140px] animate-float-slow" />
        <div className="ambient-blob-b absolute bottom-16 right-1/4 w-96 h-96 rounded-full blur-[150px] animate-float-reverse" />
        <div className="ambient-blob-c absolute top-1/2 right-12 w-80 h-80 rounded-full blur-[120px] animate-pulse-glow" />
      </div>

      <Navbar toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

      <div className="flex flex-1 relative z-10">
        {/* Mobile backdrop */}
        {sidebarOpen && (
          <div
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 top-16 z-30 bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-md lg:hidden transition-opacity"
          />
        )}

        {/* Fixed Sidebar */}
        <aside
          className={`fixed top-16 left-0 z-40 w-64 h-[calc(100vh-4rem)] bg-white/95 dark:bg-slate-900/90 backdrop-blur-2xl border-r border-slate-200/90 dark:border-slate-800/80 shadow-sm dark:shadow-2xl transform transition-transform duration-300 ease-out flex flex-col shrink-0 ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
          }`}
        >
          <nav className="flex-1 px-3.5 py-5 space-y-6 overflow-y-auto scrollbar-none">
            {navSections.map((sec, secIdx) => (
              <div key={secIdx} className="space-y-1.5">
                <div className="px-3 py-1 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-brand shadow-xs" />
                    <span className="text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-widest font-display">
                      {sec.sectionTitle}
                    </span>
                  </div>
                  <span className="text-[9px] font-bold text-slate-400 dark:text-slate-600">
                    {sec.items.length}
                  </span>
                </div>
                {sec.items.map((item) => {
                  const Icon = item.icon;
                  return (
                    <NavLink
                      key={item.path}
                      to={item.path}
                      end={item.path === `/student` || item.path === `/teacher` || item.path === `/admin`}
                      onClick={() => {
                        setSidebarOpen(false);
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      className={({ isActive }) =>
                        `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 group relative cursor-pointer ${
                          isActive
                            ? 'bg-brand text-white shadow-brand ring-1 ring-white/20 font-bold translate-x-1'
                            : 'text-slate-600 dark:text-slate-400 hover:text-slate-950 dark:hover:text-white hover:bg-slate-100/90 dark:hover:bg-slate-800/70 hover:translate-x-0.5'
                        }`
                      }
                    >
                      {({ isActive }) => (
                        <>
                          {isActive && (
                            <span className="absolute left-0 top-2 bottom-2 w-1 rounded-r-full bg-white shadow-xs" />
                          )}
                          <Icon
                            className={`w-4 h-4 shrink-0 transition-transform duration-200 ${
                              isActive
                                ? 'text-white scale-110'
                                : 'text-slate-500 dark:text-slate-400 group-hover:text-brand dark:group-hover:text-white group-hover:scale-105'
                            }`}
                          />
                          <span className="truncate">{item.label}</span>
                          {isActive ? (
                            <span className="ml-auto w-1.5 h-1.5 rounded-full bg-white shadow-xs" />
                          ) : (
                            <span className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity text-[11px] text-slate-400">
                              ›
                            </span>
                          )}
                        </>
                      )}
                    </NavLink>
                  );
                })}
              </div>
            ))}
          </nav>

          {/* Sidebar Footer User Quick Card */}
          {user && (
            <div className="p-3 border-t border-slate-200/90 dark:border-slate-800/80 bg-slate-50/80 dark:bg-slate-950/60 flex items-center justify-between gap-2">
              <Link
                to={`/${role === 'superadmin' ? 'admin' : role}/settings`}
                className="flex items-center gap-3 p-1.5 rounded-xl hover:bg-slate-200/70 dark:hover:bg-slate-800/70 transition group flex-1 min-w-0 cursor-pointer"
                title="Open Settings"
              >
                <div className="relative shrink-0">
                  <div className="w-8 h-8 rounded-lg bg-brand flex items-center justify-center font-bold text-white text-xs shadow-brand group-hover:scale-105 transition-transform">
                    {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-white dark:border-slate-900" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate group-hover:text-brand transition">
                    {user.name}
                  </div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400 capitalize flex items-center gap-1">
                    <span className="w-1 h-1 rounded-full bg-emerald-400 inline-block animate-ping" />
                    <span>Active {user.role}</span>
                  </div>
                </div>
              </Link>

              <Link
                to={`/${role === 'superadmin' ? 'admin' : role}/settings`}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/70 dark:hover:bg-slate-800/80 transition shrink-0 cursor-pointer"
                title="Settings"
                aria-label="Settings"
              >
                <SettingsIcon className="w-4 h-4 text-slate-400 group-hover:text-brand transition-colors" />
              </Link>
            </div>
          )}
        </aside>

        {/* Main Content with Fixed Sidebar Offset */}
        <div className="flex-1 lg:pl-64 w-full min-w-0 flex flex-col">
          <main className="flex-1 p-3.5 sm:p-5 lg:p-7 max-w-7xl w-full mx-auto animate-slide-up min-w-0">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
};

export default SidebarLayout;
