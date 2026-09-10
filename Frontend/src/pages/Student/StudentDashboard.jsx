import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import SidebarLayout from '../../components/common/SidebarLayout';
import AttendanceWidget from '../../components/common/AttendanceWidget';
import { SkeletonDashboard } from '../../components/common/SkeletonLoader';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';

const StudentDashboard = () => {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await api.get('/student/dashboard');
        if (res.data.success) {
          setData(res.data);
        }
      } catch (err) {
        console.warn('Dashboard fetch error:', err);
        setData({
          stats: {
            totalAssigned: 0,
            pendingCount: 0,
            submittedCount: 0,
            gradedCount: 0,
            averageGradePercentage: 0
          },
          upcomingAssignments: [],
          recentFeedback: []
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
        <SkeletonDashboard role="student" />
      </SidebarLayout>
    );
  }

  const stats = data?.stats || {};

  return (
    <SidebarLayout>
      <div className="space-y-5 sm:space-y-6">
        {/* Welcome Header Banner */}
        <div className="glass-panel glass-card-accent p-4 sm:p-6 lg:p-8 rounded-2xl sm:rounded-3xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 sm:gap-5 relative overflow-hidden shadow-2xl">
          <div className="relative z-10">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-brand-subtle text-indigo-400 border border-brand text-[11px] font-extrabold uppercase tracking-widest font-display">
                Student Workspace
              </span>
              <span className="text-xs text-slate-400 hidden sm:inline-block">· Academic Session Active</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white mt-2 font-display">
              Welcome back, {user?.name || 'Student'} 👋
            </h1>
            <p className="text-slate-300 text-xs sm:text-sm mt-1 max-w-xl leading-relaxed">
              Track your coursework deadlines, submit homework & assignments, and review instructor grading evaluations.
            </p>
          </div>

          <div className="flex items-center gap-3 relative z-10 shrink-0">
            <Link
              to="/student/assignments"
              className="py-3 px-5 btn-premium text-white text-xs font-extrabold shadow-brand flex items-center justify-center gap-2"
            >
              <span>View Assignments</span>
              <span>→</span>
            </Link>
          </div>
        </div>

        {/* Daily Attendance Check-In Widget */}
        <AttendanceWidget />

        {/* Overview Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="glass-panel glass-panel-hover p-5 rounded-2xl animate-slide-up delay-75">
            <div className="flex items-center justify-between text-slate-400 text-xs font-bold uppercase tracking-wider font-display">
              <span>Pending Tasks</span>
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse" />
            </div>
            <div className="text-3xl sm:text-4xl font-black text-white mt-2 font-display">{stats.pendingCount || 0}</div>
            <div className="text-xs text-amber-400 mt-1 font-semibold">Assignments awaiting submission</div>
          </div>

          <div className="glass-panel glass-panel-hover p-5 rounded-2xl animate-slide-up delay-150">
            <div className="flex items-center justify-between text-slate-400 text-xs font-bold uppercase tracking-wider font-display">
              <span>Submitted</span>
              <span className="w-2.5 h-2.5 rounded-full bg-indigo-400 animate-pulse" />
            </div>
            <div className="text-3xl sm:text-4xl font-black text-white mt-2 font-display">{stats.submittedCount || 0}</div>
            <div className="text-xs t-brand mt-1 font-semibold">Completed & turned in</div>
          </div>

          <div className="glass-panel glass-panel-hover p-5 rounded-2xl animate-slide-up delay-225">
            <div className="flex items-center justify-between text-slate-400 text-xs font-bold uppercase tracking-wider font-display">
              <span>Graded</span>
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
            </div>
            <div className="text-3xl sm:text-4xl font-black text-white mt-2 font-display">{stats.gradedCount || 0}</div>
            <div className="text-xs text-emerald-400 mt-1 font-semibold">Evaluated by teachers</div>
          </div>

          <div className="glass-panel glass-panel-hover p-5 rounded-2xl animate-slide-up delay-300">
            <div className="flex items-center justify-between text-slate-400 text-xs font-bold uppercase tracking-wider font-display">
              <span>Average Grade</span>
              <span className="text-purple-400 font-bold text-base">★</span>
            </div>
            <div className="text-3xl sm:text-4xl font-black t-brand-grad mt-2 font-display">
              {stats.averageGradePercentage || 0}%
            </div>
            <div className="text-xs text-slate-400 mt-1 font-semibold">Overall score accuracy</div>
          </div>
        </div>

        {/* Content Section: Upcoming Assignments & Recent Feedback */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Upcoming Assignments (2 cols) */}
          <div className="lg:col-span-2 glass-panel p-4 sm:p-6 rounded-2xl sm:rounded-3xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-4">
              <h2 className="text-lg font-bold text-white flex items-center gap-2 font-display">
                <svg className="w-5 h-5 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Pending Assignments & Homework
              </h2>
              <Link to="/student/assignments" className="text-xs t-brand hover:opacity-80 font-bold transition">
                View all →
              </Link>
            </div>

            {data?.upcomingAssignments && data.upcomingAssignments.length > 0 ? (
              <div className="space-y-3">
                {data.upcomingAssignments.map((asg) => (
                  <div
                    key={asg.id}
                    className="p-3.5 sm:p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 hover:border-slate-700 hover:bg-slate-900/90 transition-all duration-200 group"
                  >
                    <div>
                      <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                        <span className="px-2.5 py-0.5 text-[11px] font-bold rounded-md bg-brand-subtle text-indigo-300 border border-brand">
                          {asg.subject || 'Coursework'}
                        </span>
                        {asg.category && (
                          <span className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-slate-800 text-slate-300 uppercase tracking-wider">
                            {asg.category}
                          </span>
                        )}
                        <span className="text-xs text-slate-400">By {asg.teacherName}</span>
                      </div>
                      <h3 className="font-bold text-slate-100 group-hover:text-white transition-colors">{asg.title}</h3>
                      <p className="text-xs text-slate-400 mt-1 flex items-center gap-1.5">
                        <span className="text-amber-400">⏰</span>
                        <span>Due: {new Date(asg.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                      </p>
                    </div>

                    <Link
                      to={`/student/submit/${asg.id}`}
                      className="py-2 px-4 btn-premium text-white text-xs font-bold text-center shrink-0"
                    >
                      Submit Now
                    </Link>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center text-slate-400 text-sm">
                🎉 All caught up! No pending assignments due right now.
              </div>
            )}
          </div>

          {/* Recent Feedback Stream (1 col) */}
          <div className="glass-panel p-4 sm:p-6 rounded-2xl sm:rounded-3xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-4">
              <h2 className="text-lg font-bold text-white flex items-center gap-2 font-display">
                <svg className="w-5 h-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Recent Feedback
              </h2>
              <Link to="/student/feedback" className="text-xs t-brand hover:opacity-80 font-bold transition">
                View history →
              </Link>
            </div>

            {data?.recentFeedback && data.recentFeedback.length > 0 ? (
              <div className="space-y-3">
                {data.recentFeedback.map((fb) => (
                  <div key={fb.id} className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2 hover:border-slate-700 transition">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-slate-400 font-semibold">{fb.gradedBy || 'Teacher'}</span>
                      <span className="px-2.5 py-0.5 text-xs font-bold rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/30">
                        {fb.grade} / {fb.totalPoints || 100} pts
                      </span>
                    </div>
                    <p className="text-sm font-bold text-slate-200">{fb.assignmentTitle || 'Assignment'}</p>
                    <p className="text-xs text-slate-300 italic bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/80">
                      "{fb.feedback}"
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-6 text-center text-slate-400 text-xs">
                No recent feedback evaluated yet.
              </div>
            )}
          </div>
        </div>
      </div>
    </SidebarLayout>
  );
};

export default StudentDashboard;
