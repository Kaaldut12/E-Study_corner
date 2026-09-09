// frontend/src/pages/Teacher/TeacherDashboard.jsx
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
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
        <div className="glass-panel glass-card-accent p-6 sm:p-8 rounded-3xl flex flex-col sm:flex-row sm:items-center justify-between gap-5 relative overflow-hidden shadow-2xl">
          <div className="relative z-10">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-brand-subtle text-indigo-400 border border-brand text-[11px] font-extrabold uppercase tracking-widest font-display">
                Instructor Console
              </span>
              <span className="text-xs text-slate-400 hidden sm:inline-block">· Faculty Portal</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white mt-2 font-display">
              Welcome back, {user?.name || 'Instructor'} 👋
            </h1>
            <p className="text-slate-300 text-xs sm:text-sm mt-1 max-w-xl leading-relaxed">
              Manage coursework assignments, review student submissions, evaluate homework, and track classroom attendance.
            </p>
          </div>

          <div className="relative z-10 shrink-0 flex flex-wrap items-center gap-2.5">
            <Link
              to="/teacher/students"
              className="py-3 px-4 bg-slate-900/80 hover:bg-slate-800 text-slate-200 text-xs font-bold rounded-2xl border border-slate-700 transition flex items-center gap-2 shadow-sm"
            >
              <span>👨‍🎓</span>
              <span>Student Actions Hub</span>
            </Link>
            <Link
              to="/teacher/create-assignment"
              className="py-3 px-5 btn-premium text-white text-xs font-extrabold shadow-brand flex items-center justify-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" />
              </svg>
              <span>Create Assignment</span>
            </Link>
          </div>
        </div>

        {/* Daily Attendance Check-In Widget */}
        <AttendanceWidget />

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="glass-panel glass-panel-hover p-5 rounded-2xl animate-slide-up delay-75">
            <div className="text-slate-400 text-xs font-bold uppercase tracking-wider font-display">Active Coursework</div>
            <div className="text-3xl sm:text-4xl font-black text-white mt-2 font-display">{stats.totalAssignments || 0}</div>
            <div className="text-xs t-brand mt-1 font-semibold">Published assignments</div>
          </div>

          <div className="glass-panel glass-panel-hover p-5 rounded-2xl animate-slide-up delay-150">
            <div className="flex items-center justify-between text-slate-400 text-xs font-bold uppercase tracking-wider font-display">
              <span>Pending Grading</span>
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse" />
            </div>
            <div className="text-3xl sm:text-4xl font-black text-amber-400 mt-2 font-display">{stats.pendingGradingCount || 0}</div>
            <div className="text-xs text-slate-400 mt-1 font-semibold">Submissions awaiting review</div>
          </div>

          <div className="glass-panel glass-panel-hover p-5 rounded-2xl animate-slide-up delay-225">
            <div className="text-slate-400 text-xs font-bold uppercase tracking-wider font-display">Graded Submissions</div>
            <div className="text-3xl sm:text-4xl font-black text-emerald-400 mt-2 font-display">{stats.gradedCount || 0}</div>
            <div className="text-xs text-emerald-400 mt-1 font-semibold">Evaluated & feedback sent</div>
          </div>

          <div className="glass-panel glass-panel-hover p-5 rounded-2xl animate-slide-up delay-300">
            <div className="text-slate-400 text-xs font-bold uppercase tracking-wider font-display">Enrolled Students</div>
            <div className="text-3xl sm:text-4xl font-black text-purple-400 mt-2 font-display">{stats.totalStudents || 0}</div>
            <div className="text-xs text-slate-400 mt-1 font-semibold">Active classroom roster</div>
          </div>

          <Link
            to="/teacher/leave"
            className="glass-panel glass-panel-hover p-5 rounded-2xl animate-slide-up delay-300 border-indigo-500/30 group hover:border-indigo-400 transition block"
          >
            <div className="flex items-center justify-between text-slate-400 text-xs font-bold uppercase tracking-wider font-display">
              <span className="group-hover:text-indigo-300 transition">Student Leaves</span>
              {(stats.pendingStudentLeavesCount || 0) > 0 ? (
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse" />
              ) : (
                <span className="text-emerald-400 text-xs font-bold">✓</span>
              )}
            </div>
            <div className="text-3xl sm:text-4xl font-black text-white mt-2 font-display">
              {stats.pendingStudentLeavesCount || 0}
            </div>
            <div className="text-xs text-indigo-400 mt-1 font-semibold group-hover:underline">
              {(stats.pendingStudentLeavesCount || 0) > 0 ? 'Review requests →' : 'All leaves evaluated'}
            </div>
          </Link>
        </div>

        {/* Content Section: Submissions to Grade & Published Assignments */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Submissions Pending Grade */}
          <div className="glass-panel p-6 sm:p-7 rounded-3xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-4">
              <h2 className="text-lg font-bold text-white flex items-center gap-2 font-display">
                <svg className="w-5 h-5 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Needs Grading
              </h2>
            </div>

            {data?.pendingGradingSubmissions && data.pendingGradingSubmissions.length > 0 ? (
              <div className="space-y-3">
                {data.pendingGradingSubmissions.map((sub) => (
                  <div key={sub.id} className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3 hover:border-slate-700 transition">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-sm text-slate-100">{sub.studentName}</span>
                      <span className="text-xs text-slate-400">
                        {new Date(sub.submittedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>

                    <p className="text-xs text-slate-300 line-clamp-2 bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/80">
                      {sub.submissionText}
                    </p>

                    <div className="text-right">
                      <Link
                        to={`/teacher/submissions/${sub.assignmentId}`}
                        className="inline-block py-2 px-3.5 bg-amber-500/10 text-amber-300 hover:bg-amber-500/20 border border-amber-500/30 text-xs font-bold rounded-xl transition"
                      >
                        Grade Submission →
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center text-slate-400 text-sm">
                🎉 No pending student submissions requiring grading.
              </div>
            )}
          </div>

          {/* Recent Created Assignments */}
          <div className="glass-panel p-6 sm:p-7 rounded-3xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-4">
              <h2 className="text-lg font-bold text-white flex items-center gap-2 font-display">
                <svg className="w-5 h-5 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
                Published Coursework
              </h2>
              <Link to="/teacher/assignments" className="text-xs t-brand hover:opacity-80 font-bold transition">
                Manage all →
              </Link>
            </div>

            {data?.recentAssignments && data.recentAssignments.length > 0 ? (
              <div className="space-y-3">
                {data.recentAssignments.map((asg) => (
                  <div key={asg.id} className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 flex items-center justify-between hover:border-slate-700 transition">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="px-2.5 py-0.5 text-[11px] font-bold rounded-md bg-brand-subtle text-indigo-300 border border-brand">
                          {asg.subject}
                        </span>
                        {asg.category && (
                          <span className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-slate-800 text-slate-300 uppercase tracking-wider">
                            {asg.category}
                          </span>
                        )}
                      </div>
                      <h3 className="font-bold text-sm text-white">{asg.title}</h3>
                      <p className="text-xs text-slate-400 mt-1">Due: {new Date(asg.dueDate).toLocaleDateString()}</p>
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
              <div className="p-8 text-center text-slate-400 text-sm">
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
