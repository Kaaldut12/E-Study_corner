import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import SidebarLayout from '../../components/common/SidebarLayout';
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
        <div className="py-20 text-center text-slate-400">Loading Student Dashboard...</div>
      </SidebarLayout>
    );
  }

  const stats = data?.stats || {};

  return (
    <SidebarLayout>
      <div className="space-y-6">
        {/* Welcome Header Banner */}
        <div className="glass-panel p-6 sm:p-7 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-semibold text-indigo-400 uppercase tracking-wider">Student Portal</span>
            <h1 className="text-2xl font-bold text-white mt-1">
              Welcome back, {user?.name || 'Student'} 👋
            </h1>
            <p className="text-slate-400 text-xs sm:text-sm mt-1 max-w-xl">
              Track your coursework, submit assignments on time, and review teacher feedback.
            </p>
          </div>

          <Link
            to="/student/assignments"
            className="py-2.5 px-4 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl shadow transition flex items-center justify-center gap-1.5 shrink-0"
          >
            <span>View Assignments →</span>
          </Link>
        </div>

        {/* Overview Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="glass-panel glass-panel-hover p-5 rounded-2xl border border-slate-800 animate-slide-up delay-75">
            <div className="flex items-center justify-between text-slate-400 text-xs font-medium uppercase tracking-wider">
              <span>Pending Tasks</span>
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse"></span>
            </div>
            <div className="text-3xl font-extrabold text-white mt-2">{stats.pendingCount || 0}</div>
            <div className="text-xs text-amber-400 mt-1 font-medium">Assignments awaiting submission</div>
          </div>

          <div className="glass-panel glass-panel-hover p-5 rounded-2xl border border-slate-800 animate-slide-up delay-150">
            <div className="flex items-center justify-between text-slate-400 text-xs font-medium uppercase tracking-wider">
              <span>Submitted</span>
              <span className="w-2.5 h-2.5 rounded-full t-brand animate-pulse"></span>
            </div>
            <div className="text-3xl font-extrabold text-white mt-2">{stats.submittedCount || 0}</div>
            <div className="text-xs t-brand mt-1 font-medium">Completed & turned in</div>
          </div>

          <div className="glass-panel glass-panel-hover p-5 rounded-2xl border border-slate-800 animate-slide-up delay-225">
            <div className="flex items-center justify-between text-slate-400 text-xs font-medium uppercase tracking-wider">
              <span>Graded</span>
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
            </div>
            <div className="text-3xl font-extrabold text-white mt-2">{stats.gradedCount || 0}</div>
            <div className="text-xs text-emerald-400 mt-1 font-medium">Evaluated by teachers</div>
          </div>

          <div className="glass-panel glass-panel-hover p-5 rounded-2xl border border-slate-800 animate-slide-up delay-300">
            <div className="flex items-center justify-between text-slate-400 text-xs font-medium uppercase tracking-wider">
              <span>Average Grade</span>
              <span className="text-purple-400 font-bold">★</span>
            </div>
            <div className="text-3xl font-extrabold t-brand-grad mt-2">
              {stats.averageGradePercentage || 0}%
            </div>
            <div className="text-xs text-slate-400 mt-1 font-medium">Overall score accuracy</div>
          </div>
        </div>

        {/* Content Section: Upcoming Assignments & Recent Feedback */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Upcoming Assignments (2 cols) */}
          <div className="lg:col-span-2 glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-4">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <svg className="w-5 h-5 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Pending Assignments
              </h2>
              <Link to="/student/assignments" className="text-xs t-brand hover:opacity-80 font-medium">
                View all →
              </Link>
            </div>

            {data?.upcomingAssignments && data.upcomingAssignments.length > 0 ? (
              <div className="space-y-3">
                {data.upcomingAssignments.map((asg) => (
                  <div
                    key={asg.id}
                    className="p-4 rounded-xl bg-slate-900/80 border border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-slate-700 transition"
                  >
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="px-2 py-0.5 text-xs font-semibold rounded badge-brand">
                          {asg.subject}
                        </span>
                        <span className="text-xs text-slate-400">By {asg.teacherName}</span>
                      </div>
                      <h3 className="font-semibold text-slate-100">{asg.title}</h3>
                      <p className="text-xs text-slate-400 mt-1">
                        Due: {new Date(asg.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                      </p>
                    </div>

                    <Link
                      to={`/student/submit/${asg.id}`}
                      className="py-2 px-4 bg-brand text-white text-xs font-semibold rounded-lg transition text-center flex-shrink-0 shadow-brand"
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
          <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-4">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <svg className="w-5 h-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Recent Feedback
              </h2>
              <Link to="/student/feedback" className="text-xs t-brand hover:opacity-80 font-medium">
                View history →
              </Link>
            </div>

            {data?.recentFeedback && data.recentFeedback.length > 0 ? (
              <div className="space-y-3">
                {data.recentFeedback.map((fb) => (
                  <div key={fb.id} className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-slate-400 font-medium">{fb.gradedBy || 'Teacher'}</span>
                      <span className="px-2 py-0.5 text-xs font-bold rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        {fb.grade} / {fb.totalPoints || 100} pts
                      </span>
                    </div>
                    <p className="text-sm font-semibold text-slate-200">{fb.assignmentTitle || 'Assignment'}</p>
                    <p className="text-xs text-slate-300 italic bg-slate-950/40 p-2 rounded border border-slate-800/50">
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
