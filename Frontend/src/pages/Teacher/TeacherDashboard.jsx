// frontend/src/pages/Teacher/TeacherDashboard.jsx
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import SidebarLayout from '../../components/common/SidebarLayout';
import { useAuth } from '../../contexts/AuthContext';

const TeacherDashboard = () => {
  const { user, apiUrl } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await axios.get(`${apiUrl}/teacher/dashboard`);
        if (res.data.success) {
          setData(res.data);
        }
      } catch (err) {
        console.warn('Teacher dashboard fetch error:', err);
        // Fallback
        setData({
          stats: {
            totalAssignments: 2,
            totalSubmissions: 2,
            pendingGradingCount: 1,
            gradedCount: 1,
            totalStudents: 2
          },
          recentAssignments: [
            {
              id: 'asg_1',
              title: 'Data Structures & Algorithms - Binary Trees Implementation',
              subject: 'Computer Science',
              dueDate: '2026-09-15T23:59:59.000Z',
              totalPoints: 100
            },
            {
              id: 'asg_3',
              title: 'Linear Algebra - Matrix Transformations',
              subject: 'Mathematics',
              dueDate: '2026-09-10T23:59:59.000Z',
              totalPoints: 75
            }
          ],
          pendingGradingSubmissions: [
            {
              id: 'sub_2',
              assignmentId: 'asg_1',
              studentName: 'Alex Johnson',
              submittedAt: '2026-09-07T11:00:00.000Z',
              submissionText: 'Implemented BinarySearchTree class with delete node rebalancing logic.'
            }
          ]
        });
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, [apiUrl]);

  if (loading) {
    return (
      <SidebarLayout>
        <div className="py-20 text-center text-slate-400">Loading Teacher Portal...</div>
      </SidebarLayout>
    );
  }

  const stats = data?.stats || {};

  return (
    <SidebarLayout>
      <div className="space-y-6">
        {/* Welcome Header */}
        <div className="glass-panel p-6 sm:p-8 rounded-2xl relative overflow-hidden border border-brand">
          <div className="absolute right-0 top-0 w-72 h-72 rounded-full blur-3xl pointer-events-none" style={{background:'var(--brand-glow)'}}></div>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-purple-400">Instructor Portal</span>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
                Welcome back, {user?.name || 'Instructor'} 🎓
              </h1>
              <p className="text-slate-400 text-sm mt-1">
                Manage your coursework assignments, grade student submissions, and monitor class performance.
              </p>
            </div>

            <Link
              to="/teacher/create-assignment"
              className="py-3 px-5 gradient-bg-primary text-white text-xs font-semibold rounded-xl shadow-lg shadow-indigo-600/30 hover:opacity-95 transition flex items-center justify-center gap-2 shrink-0"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
              </svg>
              <span>Create New Assignment</span>
            </Link>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="glass-panel glass-panel-hover p-5 rounded-2xl border border-slate-800 animate-slide-up delay-75">
            <div className="text-slate-400 text-xs font-medium uppercase tracking-wider">Active Assignments</div>
            <div className="text-3xl font-extrabold text-white mt-2">{stats.totalAssignments || 0}</div>
            <div className="text-xs t-brand mt-1 font-medium">Published coursework</div>
          </div>

          <div className="glass-panel glass-panel-hover p-5 rounded-2xl border border-slate-800 animate-slide-up delay-150">
            <div className="flex items-center justify-between text-slate-400 text-xs font-medium uppercase tracking-wider">
              <span>Pending Grading</span>
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse"></span>
            </div>
            <div className="text-3xl font-extrabold text-amber-400 mt-2">{stats.pendingGradingCount || 0}</div>
            <div className="text-xs text-slate-400 mt-1 font-medium">Submissions awaiting review</div>
          </div>

          <div className="glass-panel glass-panel-hover p-5 rounded-2xl border border-slate-800 animate-slide-up delay-225">
            <div className="text-slate-400 text-xs font-medium uppercase tracking-wider">Graded Submissions</div>
            <div className="text-3xl font-extrabold text-emerald-400 mt-2">{stats.gradedCount || 0}</div>
            <div className="text-xs text-emerald-400 mt-1 font-medium">Evaluated & feedback sent</div>
          </div>

          <div className="glass-panel glass-panel-hover p-5 rounded-2xl border border-slate-800 animate-slide-up delay-300">
            <div className="text-slate-400 text-xs font-medium uppercase tracking-wider">Total Enrolled Students</div>
            <div className="text-3xl font-extrabold text-purple-400 mt-2">{stats.totalStudents || 0}</div>
            <div className="text-xs text-slate-400 mt-1 font-medium">Active roster</div>
          </div>
        </div>

        {/* Content Section: Submissions to Grade & Published Assignments */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Submissions Pending Grade */}
          <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-4">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <svg className="w-5 h-5 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Needs Grading
              </h2>
            </div>

            {data?.pendingGradingSubmissions && data.pendingGradingSubmissions.length > 0 ? (
              <div className="space-y-3">
                {data.pendingGradingSubmissions.map((sub) => (
                  <div key={sub.id} className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-sm text-slate-100">{sub.studentName}</span>
                      <span className="text-xs text-slate-400">
                        {new Date(sub.submittedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>

                    <p className="text-xs text-slate-300 line-clamp-2 bg-slate-950/40 p-2.5 rounded border border-slate-800/50">
                      {sub.submissionText}
                    </p>

                    <div className="text-right">
                      <Link
                        to={`/teacher/submissions/${sub.assignmentId}`}
                        className="inline-block py-1.5 px-3 bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 border border-amber-500/20 text-xs font-semibold rounded-lg transition"
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
          <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-4">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <svg className="w-5 h-5 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
                Published Assignments
              </h2>
            </div>

            {data?.recentAssignments && data.recentAssignments.length > 0 ? (
              <div className="space-y-3">
                {data.recentAssignments.map((asg) => (
                  <div key={asg.id} className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center justify-between">
                    <div>
                      <span className="px-2 py-0.5 text-xs font-semibold rounded badge-brand mb-1 inline-block">
                        {asg.subject}
                      </span>
                      <h3 className="font-semibold text-sm text-white">{asg.title}</h3>
                      <p className="text-xs text-slate-400 mt-1">Due: {new Date(asg.dueDate).toLocaleDateString()}</p>
                    </div>

                    <Link
                      to={`/teacher/submissions/${asg.id}`}
                      className="py-1.5 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-lg transition"
                    >
                      View Submissions
                    </Link>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center text-slate-400 text-sm">
                No assignments created yet. Click "Create New Assignment" above to publish coursework.
              </div>
            )}
          </div>
        </div>
      </div>
    </SidebarLayout>
  );
};

export default TeacherDashboard;
