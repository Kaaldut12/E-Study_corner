import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Users, PlusCircle, CheckCircle2, ClipboardList, BookOpen, ArrowRight, Clock, Edit3 } from 'lucide-react';
import SidebarLayout from '../../components/common/SidebarLayout';
import AttendanceWidget from '../../components/common/AttendanceWidget';
import { SkeletonDashboard } from '../../components/common/SkeletonLoader';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';

const TeacherDashboard = () => {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await api.get('/teacher/dashboard');
        if (res.data.success) {
          setData(res.data);
        }
      } catch (err) {
        console.warn('Teacher dashboard fetch error:', err);
        setData({
          stats: {
            totalAssignments: 0,
            totalSubmissions: 0,
            pendingGradingCount: 0,
            gradedCount: 0,
            totalStudents: 0
          },
          recentAssignments: [],
          pendingGradingSubmissions: []
        });
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <SidebarLayout>
        <SkeletonDashboard role="teacher" />
      </SidebarLayout>
    );
  }

  const stats = data?.stats || {};

  return (
    <SidebarLayout>
      <div className="space-y-6">
        {/* Welcome Header */}
        <div className="glass-panel glass-card-accent p-4 sm:p-6 lg:p-8 rounded-2xl sm:rounded-3xl flex flex-col sm:flex-row sm:items-center justify-between gap-5 relative overflow-hidden shadow-2xl">
          <div className="relative z-10">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-brand-subtle text-indigo-600 dark:text-indigo-400 border border-brand text-[11px] font-extrabold uppercase tracking-widest font-display">
                Instructor Console
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400 hidden sm:inline-block">· Faculty Portal</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-2 font-display">
              Welcome back, {user?.name || 'Instructor'}
            </h1>
            <p className="text-slate-600 dark:text-slate-300 text-xs sm:text-sm mt-1 max-w-xl leading-relaxed">
              Manage coursework assignments, review student submissions, evaluate homework, and track classroom attendance.
            </p>
          </div>

          <div className="relative z-10 shrink-0 flex flex-wrap items-center gap-2.5">
            <Link
              to="/teacher/students"
              className="py-3 px-4 btn-dashboard-secondary text-xs font-bold rounded-2xl flex items-center gap-2"
            >
              <Users className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <span>Student Actions Hub</span>
            </Link>
            <Link
              to="/teacher/create-assignment"
              className="py-3 px-5 btn-premium text-white text-xs font-extrabold flex items-center justify-center gap-2"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Create Assignment</span>
            </Link>
          </div>
        </div>

        {/* Daily Attendance Check-In Widget */}
        <AttendanceWidget />

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          <div className="glass-panel glass-panel-hover p-5 rounded-2xl animate-slide-up delay-75">
            <div className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider font-display">Active Coursework</div>
            <div className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white mt-2 font-display">{stats.totalAssignments || 0}</div>
            <div className="text-xs t-brand mt-1 font-semibold">Published assignments</div>
          </div>

          <div className="glass-panel glass-panel-hover p-5 rounded-2xl animate-slide-up delay-150">
            <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider font-display">
              <span>Pending Grading</span>
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse" />
            </div>
            <div className="text-3xl sm:text-4xl font-black text-amber-600 dark:text-amber-400 mt-2 font-display">{stats.pendingGradingCount || 0}</div>
            <div className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-semibold">Submissions awaiting review</div>
          </div>

          <div className="glass-panel glass-panel-hover p-5 rounded-2xl animate-slide-up delay-225">
            <div className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider font-display">Graded Submissions</div>
            <div className="text-3xl sm:text-4xl font-black text-emerald-600 dark:text-emerald-400 mt-2 font-display">{stats.gradedCount || 0}</div>
            <div className="text-xs text-emerald-600 dark:text-emerald-400 mt-1 font-semibold">Evaluated & feedback sent</div>
          </div>

          <div className="glass-panel glass-panel-hover p-5 rounded-2xl animate-slide-up delay-300">
            <div className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider font-display">Enrolled Students</div>
            <div className="text-3xl sm:text-4xl font-black text-purple-600 dark:text-purple-400 mt-2 font-display">{stats.totalStudents || 0}</div>
            <div className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-semibold">Active classroom roster</div>
          </div>

          <Link
            to="/teacher/leave"
            className="glass-panel glass-panel-hover p-5 rounded-2xl animate-slide-up delay-300 border-indigo-500/30 group hover:border-indigo-400 transition block"
          >
            <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider font-display">
              <span className="group-hover:text-indigo-600 dark:group-hover:text-indigo-300 transition">Student Leaves</span>
              {(stats.pendingStudentLeavesCount || 0) > 0 ? (
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse" />
              ) : (
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              )}
            </div>
            <div className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white mt-2 font-display">
              {stats.pendingStudentLeavesCount || 0}
            </div>
            <div className="text-xs text-indigo-600 dark:text-indigo-400 mt-1 font-semibold group-hover:underline">
              {(stats.pendingStudentLeavesCount || 0) > 0 ? 'Review requests →' : 'All leaves evaluated'}
            </div>
          </Link>
        </div>

        {/* Content Section: Submissions to Grade & Published Assignments */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Submissions Pending Grade */}
          <div className="glass-panel p-4 sm:p-6 rounded-2xl sm:rounded-3xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800/80 pb-4">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2 font-display">
                <Edit3 className="w-5 h-5 text-amber-500" />
                Needs Grading
              </h2>
            </div>

            {data?.pendingGradingSubmissions && data.pendingGradingSubmissions.length > 0 ? (
              <div className="space-y-3">
                {data.pendingGradingSubmissions.map((sub) => (
                  <div key={sub.id} className="p-4 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-3 hover:border-slate-300 dark:hover:border-slate-700 transition">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-sm text-slate-800 dark:text-slate-100">{sub.studentName}</span>
                      <span className="text-xs text-slate-500 dark:text-slate-400">
                        {new Date(sub.submittedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2 bg-slate-50 dark:bg-slate-950/60 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800/80">
                      {sub.submissionText}
                    </p>

                    <div className="text-right">
                      <Link
                        to={`/teacher/submissions/${sub.assignmentId}`}
                        className="inline-flex items-center gap-1.5 py-2 px-3.5 btn-dashboard-amber text-white text-xs font-bold rounded-xl"
                      >
                        <span>Grade Submission</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center text-slate-500 dark:text-slate-400 text-sm flex flex-col items-center justify-center gap-2">
                <CheckCircle2 className="w-8 h-8 text-emerald-500" />
                <span>No pending student submissions requiring grading.</span>
              </div>
            )}
          </div>

          {/* Recent Created Assignments */}
          <div className="glass-panel p-4 sm:p-6 rounded-2xl sm:rounded-3xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800/80 pb-4">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2 font-display">
                <ClipboardList className="w-5 h-5 text-indigo-500 dark:text-indigo-400" />
                Published Coursework
              </h2>
              <Link to="/teacher/assignments" className="text-xs t-brand hover:opacity-80 font-bold transition flex items-center gap-1">
                <span>Manage all</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {data?.recentAssignments && data.recentAssignments.length > 0 ? (
              <div className="space-y-3">
                {data.recentAssignments.map((asg) => (
                  <div key={asg.id} className="p-4 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-slate-300 dark:hover:border-slate-700 transition">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="px-2.5 py-0.5 text-[11px] font-bold rounded-md bg-brand-subtle text-indigo-700 dark:text-indigo-300 border border-brand">
                          {asg.subject}
                        </span>
                        {asg.category && (
                          <span className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 uppercase tracking-wider">
                            {asg.category}
                          </span>
                        )}
                      </div>
                      <h3 className="font-bold text-sm text-slate-900 dark:text-white">{asg.title}</h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Due: {new Date(asg.dueDate).toLocaleDateString()}</p>
                    </div>

                    <Link
                      to={`/teacher/submissions/${asg.id}`}
                      className="py-2 px-3.5 btn-secondary text-xs font-bold rounded-xl transition"
                    >
                      View Submissions
                    </Link>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center text-slate-500 dark:text-slate-400 text-sm">
                No assignments created yet. Click "Create Assignment" above to publish coursework.
              </div>
            )}
          </div>
        </div>
      </div>
    </SidebarLayout>
  );
};

export default TeacherDashboard;
