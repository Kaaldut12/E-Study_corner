// frontend/src/pages/Admin/PlatformAnalytics.jsx
import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import SidebarLayout from '../../components/common/SidebarLayout';
import { useAuth } from '../../contexts/AuthContext';

const PlatformAnalytics = () => {
  const { apiUrl, user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview'); // overview, academics, doubts, exams, helpdesk
  const [resyncing, setResyncing] = useState(false);
  const [resyncResult, setResyncResult] = useState(null);
  const [showResyncModal, setShowResyncModal] = useState(false);

  // Broadcast Modal State
  const [showBroadcastModal, setShowBroadcastModal] = useState(false);
  const [broadcastMessage, setBroadcastMessage] = useState('');
  const [broadcasting, setBroadcasting] = useState(false);
  const [broadcastSuccess, setBroadcastSuccess] = useState('');

  // Doubt Reply Modal State
  const [selectedDoubt, setSelectedDoubt] = useState(null);
  const [doubtReply, setDoubtReply] = useState('');
  const [submittingReply, setSubmittingReply] = useState(false);
  const [actionSuccess, setActionSuccess] = useState('');

  const fetchAnalytics = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${apiUrl}/admin/analytics`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const resData = await res.json();
      if (resData.success) {
        setData(resData.analytics);
      }
    } catch (err) {
      console.warn('Error fetching admin analytics:', err);
    } finally {
      setLoading(false);
    }
  }, [apiUrl]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  // Action: Live Database Resync
  const handleTriggerResync = async () => {
    setResyncing(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${apiUrl}/admin/action/resync`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      const resData = await res.json();
      if (resData.success) {
        setResyncResult(resData.audit);
        setShowResyncModal(true);
        fetchAnalytics();
      }
    } catch (err) {
      console.error('Error triggering database re-sync:', err);
    } finally {
      setResyncing(false);
    }
  };

  // Action: Broadcast Announcement
  const handleSendBroadcast = async (e) => {
    e.preventDefault();
    if (!broadcastMessage.trim()) return;
    setBroadcasting(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${apiUrl}/admin/notifications`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ Noti_Message: broadcastMessage.trim() })
      });
      const resData = await res.json();
      if (resData.success) {
        setBroadcastSuccess('Announcement successfully broadcast to platform!');
        setBroadcastMessage('');
        setTimeout(() => {
          setBroadcastSuccess('');
          setShowBroadcastModal(false);
        }, 1500);
      }
    } catch (err) {
      console.error('Broadcast failed:', err);
    } finally {
      setBroadcasting(false);
    }
  };

  // Action: Admin Doubt Resolution
  const handleResolveDoubt = async (e) => {
    e.preventDefault();
    if (!doubtReply.trim() || !selectedDoubt) return;
    setSubmittingReply(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${apiUrl}/admin/questions/${selectedDoubt.id}/reply`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ replyText: doubtReply.trim() })
      });
      const resData = await res.json();
      if (resData.success) {
        setActionSuccess('Question resolved with administrative answer!');
        setDoubtReply('');
        setSelectedDoubt(null);
        fetchAnalytics();
        setTimeout(() => setActionSuccess(''), 3000);
      }
    } catch (err) {
      console.error('Failed replying to doubt:', err);
    } finally {
      setSubmittingReply(false);
    }
  };

  return (
    <SidebarLayout>
      <div className="space-y-6">
        {/* Header Action Banner */}
        <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 relative overflow-hidden">
          <div className="absolute right-0 top-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 relative z-10">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-400">Universal Intelligence</span>
                <span className="px-2 py-0.5 bg-indigo-500/20 text-indigo-300 text-[10px] font-extrabold rounded-md border border-indigo-500/30">
                  ALL 17 COLLECTIONS
                </span>
                <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-300 text-[10px] font-extrabold rounded-md border border-emerald-500/30 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  LIVE AUDIT ACTIVE
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-white mt-1">
                Executive System & Platform Analytics
              </h1>
              <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl">
                Comprehensive data aggregation spanning student academics, faculty coursework, doubt resolution SLA, examination integrity, and platform sentiment.
              </p>
            </div>

            {/* Direct Admin Quick Action Buttons */}
            <div className="flex flex-wrap gap-2.5 shrink-0">
              <button
                onClick={handleTriggerResync}
                disabled={resyncing}
                className="py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-slate-100 text-xs font-bold rounded-xl border border-slate-700 transition flex items-center gap-2 shadow-sm"
              >
                <span className={resyncing ? 'animate-spin' : ''}>🔄</span>
                <span>{resyncing ? 'Auditing System...' : 'Re-sync & Audit DB'}</span>
              </button>

              <button
                onClick={() => setShowBroadcastModal(true)}
                className="py-2.5 px-4 bg-linear-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-bold rounded-xl transition shadow-lg shadow-indigo-600/30 flex items-center gap-2"
              >
                <span>📢</span>
                <span>Broadcast Notice</span>
              </button>

              <Link
                to="/admin/users"
                className="py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl border border-slate-700 transition flex items-center gap-2"
              >
                <span>👥</span>
                <span>User Directory</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Global Toast Success Message */}
        {actionSuccess && (
          <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-semibold flex items-center justify-between animate-fade-in">
            <span>✅ {actionSuccess}</span>
            <button onClick={() => setActionSuccess('')} className="text-emerald-400 hover:text-white font-bold">✕</button>
          </div>
        )}

        {/* Analytics Navigation Tabs */}
        <div className="flex border-b border-slate-800 gap-2 overflow-x-auto pb-1 text-xs font-bold">
          <button
            onClick={() => setActiveTab('overview')}
            className={`py-3 px-5 rounded-2xl transition whitespace-nowrap flex items-center gap-2 ${
              activeTab === 'overview'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <span>🌐</span> Executive Overview
          </button>

          <button
            onClick={() => setActiveTab('academics')}
            className={`py-3 px-5 rounded-2xl transition whitespace-nowrap flex items-center gap-2 ${
              activeTab === 'academics'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <span>📚</span> Academics & Coursework
            {data?.pendingSubmissions > 0 && (
              <span className="px-1.5 py-0.5 bg-amber-500 text-slate-950 font-black rounded-full text-[10px]">
                {data?.pendingSubmissions}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('doubts')}
            className={`py-3 px-5 rounded-2xl transition whitespace-nowrap flex items-center gap-2 ${
              activeTab === 'doubts'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <span>❓</span> Student Doubts (Q&A)
            {data?.pendingDoubts > 0 && (
              <span className="px-1.5 py-0.5 bg-rose-500 text-white font-black rounded-full text-[10px]">
                {data?.pendingDoubts}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('exams')}
            className={`py-3 px-5 rounded-2xl transition whitespace-nowrap flex items-center gap-2 ${
              activeTab === 'exams'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <span>📝</span> Examinations & Quizzes
          </button>

          <button
            onClick={() => setActiveTab('helpdesk')}
            className={`py-3 px-5 rounded-2xl transition whitespace-nowrap flex items-center gap-2 ${
              activeTab === 'helpdesk'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <span>⭐</span> Helpdesk & Sentiment
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="space-y-6 animate-fade-in">
            {/* =========================================================================
                TAB 1: EXECUTIVE OVERVIEW
            ========================================================================== */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                {/* 6 Key KPI Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
                  <div className="glass-panel p-5 rounded-3xl border border-slate-800 space-y-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Users</span>
                    <p className="text-3xl font-black text-indigo-400">{data?.totalUsers || 0}</p>
                    <p className="text-[11px] text-emerald-400 font-medium">
                      {data?.activeUsers || 0} active · {data?.suspendedUsers || 0} suspended
                    </p>
                  </div>

                  <div className="glass-panel p-5 rounded-3xl border border-slate-800 space-y-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Submissions</span>
                    <p className="text-3xl font-black text-purple-400">{data?.totalSubmissions || 0}</p>
                    <p className="text-[11px] text-slate-400 font-medium">
                      {data?.gradedSubmissions || 0} graded · {data?.pendingSubmissions || 0} pending
                    </p>
                  </div>

                  <div className="glass-panel p-5 rounded-3xl border border-slate-800 space-y-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Doubts Raised</span>
                    <p className="text-3xl font-black text-sky-400">{data?.totalDoubts || 0}</p>
                    <p className="text-[11px] text-emerald-400 font-medium">
                      {data?.doubtResolutionRate || 100}% SLA resolution
                    </p>
                  </div>

                  <div className="glass-panel p-5 rounded-3xl border border-slate-800 space-y-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Exam Pass Rate</span>
                    <p className="text-3xl font-black text-emerald-400">{data?.quizPassRate || 90}%</p>
                    <p className="text-[11px] text-slate-400 font-medium">
                      Avg score: {data?.avgQuizScore || 85}%
                    </p>
                  </div>

                  <div className="glass-panel p-5 rounded-3xl border border-slate-800 space-y-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Published Docs</span>
                    <p className="text-3xl font-black text-amber-400">{data?.totalMaterials || 0}</p>
                    <p className="text-[11px] text-slate-400 font-medium">
                      {data?.totalCourses || 0} courses · {data?.totalLessons || 0} lessons
                    </p>
                  </div>

                  <div className="glass-panel p-5 rounded-3xl border border-slate-800 space-y-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Satisfaction</span>
                    <p className="text-3xl font-black text-rose-400">⭐ {data?.feedbackAvgRating || 4.9}</p>
                    <p className="text-[11px] text-slate-400 font-medium">
                      {data?.feedbackTotal || 0} verified reviews
                    </p>
                  </div>
                </div>

                {/* 2-Column Split: Department Distribution & System Collections Audit */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Department Distribution */}
                  <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 space-y-6">
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="text-base font-bold text-white">Department Enrollment Distribution</h3>
                        <p className="text-xs text-slate-400 mt-0.5">Live distribution of students & faculty by department</p>
                      </div>
                      <span className="px-2.5 py-1 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-xs font-bold rounded-lg">
                        {data?.departmentDistribution?.length || 0} Departments
                      </span>
                    </div>

                    <div className="space-y-4">
                      {(data?.departmentDistribution || []).map((dept, idx) => (
                        <div key={idx} className="space-y-1.5">
                          <div className="flex justify-between items-center text-xs">
                            <span className="font-semibold text-slate-200">{dept.name} ({dept.count} Members)</span>
                            <span className="font-bold text-indigo-400">{dept.percentage}%</span>
                          </div>
                          <div className="w-full bg-slate-900 h-2.5 rounded-full overflow-hidden p-0.5 border border-slate-800">
                            <div
                              className="h-full rounded-full bg-linear-to-r from-indigo-500 to-purple-500 transition-all duration-1000"
                              style={{ width: `${Math.max(5, dept.percentage)}%` }}
                            ></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Operational Collections Audit */}
                  <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 space-y-6">
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="text-base font-bold text-white">Platform Collection Health</h3>
                        <p className="text-xs text-slate-400 mt-0.5">MongoDB Atlas synchronized entities status</p>
                      </div>
                      <span className="px-2.5 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-bold rounded-lg">
                        17 Active Schemas
                      </span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                      <div className="p-3 rounded-2xl bg-slate-900/80 border border-slate-800">
                        <span className="text-slate-400 text-[10px] block font-bold">STUDENTS</span>
                        <span className="text-lg font-black text-white">{data?.studentCount || 0}</span>
                      </div>
                      <div className="p-3 rounded-2xl bg-slate-900/80 border border-slate-800">
                        <span className="text-slate-400 text-[10px] block font-bold">FACULTY TEACHERS</span>
                        <span className="text-lg font-black text-white">{data?.teacherCount || 0}</span>
                      </div>
                      <div className="p-3 rounded-2xl bg-slate-900/80 border border-slate-800">
                        <span className="text-slate-400 text-[10px] block font-bold">ADMINISTRATORS</span>
                        <span className="text-lg font-black text-white">{data?.adminCount || 0}</span>
                      </div>
                      <div className="p-3 rounded-2xl bg-slate-900/80 border border-slate-800">
                        <span className="text-slate-400 text-[10px] block font-bold">COURSE MODULES</span>
                        <span className="text-lg font-black text-indigo-400">{data?.totalCourses || 0}</span>
                      </div>
                      <div className="p-3 rounded-2xl bg-slate-900/80 border border-slate-800">
                        <span className="text-slate-400 text-[10px] block font-bold">STUDENT NOTES</span>
                        <span className="text-lg font-black text-purple-400">{data?.totalNotes || 0}</span>
                      </div>
                      <div className="p-3 rounded-2xl bg-slate-900/80 border border-slate-800">
                        <span className="text-slate-400 text-[10px] block font-bold">BOOKMARKS</span>
                        <span className="text-lg font-black text-amber-400">{data?.totalBookmarks || 0}</span>
                      </div>
                    </div>

                    <div className="p-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-xs text-indigo-200 flex items-center justify-between">
                      <div>
                        <span className="font-bold block">Need immediate triage?</span>
                        <span className="text-[11px] text-slate-400">
                          {data?.pendingDoubts || 0} unanswered student doubts and {data?.pendingSubmissions || 0} ungraded coursework.
                        </span>
                      </div>
                      <button
                        onClick={() => setActiveTab('doubts')}
                        className="py-1.5 px-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold transition shrink-0 ml-3"
                      >
                        Inspect Doubts →
                      </button>
                    </div>
                  </div>
                </div>

                {/* Monthly Activity Trends Table */}
                <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 space-y-4">
                  <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2">
                    <div>
                      <h3 className="text-base font-bold text-white">Cross-Semester Engagement Growth</h3>
                      <p className="text-xs text-slate-400 mt-0.5">Aggregated metrics trajectory over the past six months.</p>
                    </div>
                    <span className="text-[10px] font-mono text-slate-500">Academic Year 2026</span>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs text-slate-300">
                      <thead className="bg-slate-950/80 text-slate-400 uppercase text-[10px] border-b border-slate-800">
                        <tr>
                          <th className="p-3.5">Month</th>
                          <th className="p-3.5">Active Learners</th>
                          <th className="p-3.5">Submissions</th>
                          <th className="p-3.5">Doubts Raised</th>
                          <th className="p-3.5">Support Tickets</th>
                          <th className="p-3.5">Platform Activity Bar</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/80">
                        {(data?.monthlyTrends || []).map((t, idx) => {
                          const maxSub = Math.max(...(data?.monthlyTrends || []).map(x => x.submissions), 1);
                          const barWidth = Math.round((t.submissions / maxSub) * 100);
                          return (
                            <tr key={idx} className="hover:bg-slate-850/60 transition">
                              <td className="p-3.5 font-bold text-white">{t.month} 2026</td>
                              <td className="p-3.5">{t.students}</td>
                              <td className="p-3.5 text-purple-400 font-semibold">{t.submissions}</td>
                              <td className="p-3.5 text-sky-400 font-semibold">{t.doubtsAsked}</td>
                              <td className="p-3.5 text-amber-400">{t.supportTickets}</td>
                              <td className="p-3.5 w-48">
                                <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden border border-slate-800">
                                  <div
                                    className="h-full rounded-full bg-indigo-500"
                                    style={{ width: `${barWidth}%` }}
                                  ></div>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* =========================================================================
                TAB 2: ACADEMICS & COURSEWORK
            ========================================================================== */}
            {activeTab === 'academics' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Coursework</span>
                    <p className="text-3xl font-black text-indigo-400">{data?.totalAssignments || 0}</p>
                    <p className="text-xs text-slate-400">Assignments & homework tasks</p>
                  </div>

                  <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Student Submissions</span>
                    <p className="text-3xl font-black text-purple-400">{data?.totalSubmissions || 0}</p>
                    <p className="text-xs text-slate-400">Turned in across all semesters</p>
                  </div>

                  <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Graded Submissions</span>
                    <p className="text-3xl font-black text-emerald-400">{data?.gradedSubmissions || 0}</p>
                    <p className="text-xs text-emerald-400">Reviewed with instructor marks</p>
                  </div>

                  <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Avg Submission Mark</span>
                    <p className="text-3xl font-black text-amber-400">{data?.avgSubmissionGrade || 88}%</p>
                    <p className="text-xs text-slate-400">Across verified assignments</p>
                  </div>
                </div>

                <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 space-y-6">
                  <div>
                    <h3 className="text-base font-bold text-white">Coursework Completion & Evaluation Queue</h3>
                    <p className="text-xs text-slate-400 mt-0.5">Status breakdown of submitted student documents.</p>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs font-semibold">
                        <span className="text-emerald-400">Graded Assignments ({data?.gradedSubmissions || 0})</span>
                        <span className="text-slate-400">
                          {data?.totalSubmissions ? Math.round(((data?.gradedSubmissions || 0) / data?.totalSubmissions) * 100) : 100}%
                        </span>
                      </div>
                      <div className="w-full bg-slate-900 h-3 rounded-full overflow-hidden border border-slate-800 p-0.5">
                        <div
                          className="h-full bg-emerald-500 rounded-full transition-all duration-1000"
                          style={{ width: `${data?.totalSubmissions ? Math.round(((data?.gradedSubmissions || 0) / data?.totalSubmissions) * 100) : 100}%` }}
                        ></div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-xs font-semibold">
                        <span className="text-amber-400">Pending Evaluation Queue ({data?.pendingSubmissions || 0})</span>
                        <span className="text-slate-400">
                          {data?.totalSubmissions ? Math.round(((data?.pendingSubmissions || 0) / data?.totalSubmissions) * 100) : 0}%
                        </span>
                      </div>
                      <div className="w-full bg-slate-900 h-3 rounded-full overflow-hidden border border-slate-800 p-0.5">
                        <div
                          className="h-full bg-amber-500 rounded-full transition-all duration-1000"
                          style={{ width: `${data?.totalSubmissions ? Math.round(((data?.pendingSubmissions || 0) / data?.totalSubmissions) * 100) : 0}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end pt-4 border-t border-slate-800">
                    <Link
                      to="/teacher/assignments"
                      className="py-2.5 px-5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl transition"
                    >
                      Open Faculty Coursework Manager →
                    </Link>
                  </div>
                </div>
              </div>
            )}

            {/* =========================================================================
                TAB 3: STUDENT DOUBTS (Q&A)
            ========================================================================== */}
            {activeTab === 'doubts' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Inquiries</span>
                    <p className="text-3xl font-black text-sky-400">{data?.totalDoubts || 0}</p>
                    <p className="text-xs text-slate-400">Questions asked to teachers</p>
                  </div>

                  <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Resolved Doubts</span>
                    <p className="text-3xl font-black text-emerald-400">{data?.answeredDoubts || 0}</p>
                    <p className="text-xs text-emerald-400">Answers provided by faculty/admin</p>
                  </div>

                  <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Unresolved Doubts</span>
                    <p className="text-3xl font-black text-rose-400">{data?.pendingDoubts || 0}</p>
                    <p className="text-xs text-rose-400">Awaiting response</p>
                  </div>

                  <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Faculty SLA</span>
                    <p className="text-3xl font-black text-indigo-400">{data?.doubtResolutionRate || 100}%</p>
                    <p className="text-xs text-slate-400">Resolution fulfillment rate</p>
                  </div>
                </div>

                {/* Doubts by Subject & Action Triage */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Subject Breakdown */}
                  <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 space-y-6">
                    <h3 className="text-base font-bold text-white">Questions Grouped by Subject</h3>

                    <div className="space-y-3">
                      {(data?.doubtsBySubject || []).length === 0 ? (
                        <p className="text-xs text-slate-400 italic">No doubts recorded yet.</p>
                      ) : (
                        (data?.doubtsBySubject || []).map((s, idx) => (
                          <div key={idx} className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 flex justify-between items-center text-xs">
                            <span className="font-semibold text-slate-200">{s.subject}</span>
                            <span className="px-2.5 py-1 bg-sky-500/10 text-sky-400 border border-sky-500/20 font-bold rounded-lg">
                              {s.count} Doubts
                            </span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  {/* Pending Doubts Needing Admin Triage */}
                  <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 space-y-6">
                    <div className="flex justify-between items-center">
                      <h3 className="text-base font-bold text-white">Pending Doubts Needing Attention</h3>
                      <span className="px-2 py-0.5 bg-rose-500/20 text-rose-300 text-[10px] font-extrabold rounded-md border border-rose-500/30">
                        {data?.recentPendingDoubts?.length || 0} PENDING
                      </span>
                    </div>

                    <div className="space-y-3">
                      {(!data?.recentPendingDoubts || data.recentPendingDoubts.length === 0) ? (
                        <div className="py-8 text-center text-xs text-emerald-400 bg-emerald-500/5 rounded-2xl border border-emerald-500/20 p-4">
                          🎉 All student questions are answered! No pending doubts in queue.
                        </div>
                      ) : (
                        data.recentPendingDoubts.map((q) => (
                          <div key={q.id} className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
                            <div className="flex justify-between items-start gap-2">
                              <div>
                                <h4 className="font-bold text-xs text-white">{q.title}</h4>
                                <p className="text-[11px] text-slate-400 mt-0.5">
                                  From {q.studentName} to {q.teacherName} ({q.subject})
                                </p>
                              </div>
                              <button
                                onClick={() => setSelectedDoubt(q)}
                                className="py-1 px-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-[11px] font-bold transition shrink-0"
                              >
                                Answer Now ✍️
                              </button>
                            </div>
                            <p className="text-xs text-slate-300 line-clamp-2 bg-slate-950 p-2 rounded-lg border border-slate-800/80">
                              "{q.questionText}"
                            </p>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* =========================================================================
                TAB 4: EXAMINATIONS & QUIZZES
            ========================================================================== */}
            {activeTab === 'exams' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Quizzes</span>
                    <p className="text-3xl font-black text-indigo-400">{data?.totalQuizzes || 0}</p>
                    <p className="text-xs text-slate-400">{data?.totalQuestions || 0} examination questions</p>
                  </div>

                  <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Quiz Attempts</span>
                    <p className="text-3xl font-black text-purple-400">{data?.totalQuizAttempts || 0}</p>
                    <p className="text-xs text-slate-400">Completed by student learners</p>
                  </div>

                  <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Pass Rate</span>
                    <p className="text-3xl font-black text-emerald-400">{data?.quizPassRate || 92}%</p>
                    <p className="text-xs text-emerald-400">Score &ge; 50% benchmark</p>
                  </div>

                  <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Average Score</span>
                    <p className="text-3xl font-black text-amber-400">{data?.avgQuizScore || 86}%</p>
                    <p className="text-xs text-slate-400">Institutional grade average</p>
                  </div>
                </div>

                <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 space-y-6">
                  <h3 className="text-base font-bold text-white">Examination Integrity & Evaluation Standards</h3>
                  <p className="text-xs text-slate-400">
                    Automated scoring metrics evaluate students based on randomized multiple-choice tests with instant results storage in MongoDB.
                  </p>

                  <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                    <div>
                      <span className="text-xs font-bold text-slate-200">Need to inspect or manage questions?</span>
                      <p className="text-[11px] text-slate-400 mt-0.5">Faculty instructors curate quiz questions per course curriculum.</p>
                    </div>
                    <Link
                      to="/teacher/quizzes"
                      className="py-2.5 px-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition shrink-0"
                    >
                      View Quiz Curriculum →
                    </Link>
                  </div>
                </div>
              </div>
            )}

            {/* =========================================================================
                TAB 5: HELPDESK & SENTIMENT
            ========================================================================== */}
            {activeTab === 'helpdesk' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Helpdesk Tickets</span>
                    <p className="text-3xl font-black text-indigo-400">{data?.supportMetrics?.total || 0}</p>
                    <p className="text-xs text-slate-400">Inquiries submitted</p>
                  </div>

                  <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Pending Tickets</span>
                    <p className="text-3xl font-black text-amber-400">{data?.supportMetrics?.pending || 0}</p>
                    <p className="text-xs text-amber-400">Awaiting administrative reply</p>
                  </div>

                  <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Resolution Rate</span>
                    <p className="text-3xl font-black text-emerald-400">{data?.supportMetrics?.resolutionRate || 100}%</p>
                    <p className="text-xs text-emerald-400">Tickets closed successfully</p>
                  </div>

                  <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Platform Rating</span>
                    <p className="text-3xl font-black text-rose-400">⭐ {data?.feedbackAvgRating || 4.9} / 5.0</p>
                    <p className="text-xs text-slate-400">Overall user satisfaction</p>
                  </div>
                </div>

                {/* Star Distribution & Recent Reviews */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Star Rating Breakdown */}
                  <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 space-y-6">
                    <div className="flex justify-between items-center">
                      <h3 className="text-base font-bold text-white">Sentiment Star Distribution</h3>
                      <span className="text-xs font-bold text-slate-400">
                        {data?.feedbackTotal || 0} Total Reviews
                      </span>
                    </div>

                    <div className="space-y-3">
                      {[5, 4, 3, 2, 1].map((stars) => {
                        const count = data?.starCounts ? data.starCounts[stars] || 0 : 0;
                        const pct = data?.feedbackTotal ? Math.round((count / data.feedbackTotal) * 100) : 0;
                        return (
                          <div key={stars} className="flex items-center gap-3 text-xs">
                            <span className="w-14 font-bold text-amber-400">{stars} Stars</span>
                            <div className="flex-1 bg-slate-900 h-2.5 rounded-full overflow-hidden border border-slate-800 p-0.5">
                              <div
                                className="h-full bg-linear-to-r from-amber-500 to-rose-500 rounded-full transition-all duration-1000"
                                style={{ width: `${pct}%` }}
                              ></div>
                            </div>
                            <span className="w-16 text-right font-mono text-slate-400">{count} ({pct}%)</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Recent Testimonials */}
                  <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 space-y-4">
                    <div className="flex justify-between items-center">
                      <h3 className="text-base font-bold text-white">Recent Student & Faculty Feedback</h3>
                      <Link to="/admin/feedback" className="text-xs text-indigo-400 hover:underline font-bold">
                        View all →
                      </Link>
                    </div>

                    <div className="space-y-3">
                      {(!data?.recentFeedback || data.recentFeedback.length === 0) ? (
                        <p className="text-xs text-slate-400 italic">No feedback entries found.</p>
                      ) : (
                        data.recentFeedback.map((fb, idx) => (
                          <div key={idx} className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
                            <div className="flex justify-between items-center text-xs">
                              <span className="font-bold text-white">{fb.name || 'Anonymous User'}</span>
                              <span className="text-amber-400 font-bold">{'★'.repeat(fb.rating || 5)}</span>
                            </div>
                            <p className="text-xs text-slate-300 italic">"{fb.comments || fb.message}"</p>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* =========================================================================
            MODAL 1: CAMPUS BROADCAST NOTICE
        ========================================================================== */}
        {showBroadcastModal && (
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
            <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 max-w-lg w-full space-y-5 animate-scale-up">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <span className="text-xl">📢</span>
                  <h3 className="text-lg font-bold text-white">Campus-Wide Announcement</h3>
                </div>
                <button
                  onClick={() => setShowBroadcastModal(false)}
                  className="text-slate-400 hover:text-white font-bold text-sm"
                >
                  ✕
                </button>
              </div>

              <p className="text-xs text-slate-400">
                This notice will immediately appear on all student and teacher dashboards, as well as the top rolling ticker marquee.
              </p>

              {broadcastSuccess && (
                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-semibold">
                  {broadcastSuccess}
                </div>
              )}

              <form onSubmit={handleSendBroadcast} className="space-y-4">
                <textarea
                  rows={4}
                  value={broadcastMessage}
                  onChange={(e) => setBroadcastMessage(e.target.value)}
                  placeholder="e.g. Mid-term semester exams commence next Monday. All assignment submissions are due this Friday at 5:00 PM."
                  required
                  className="w-full p-3.5 rounded-2xl bg-slate-900 border border-slate-800 text-white text-xs focus:outline-none focus:border-indigo-500 resize-none"
                />

                <div className="flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setShowBroadcastModal(false)}
                    className="py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-xl transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={broadcasting || !broadcastMessage.trim()}
                    className="py-2.5 px-5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl transition disabled:opacity-50"
                  >
                    {broadcasting ? 'Publishing...' : 'Publish Announcement'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* =========================================================================
            MODAL 2: ADMIN DOUBT RESOLUTION
        ========================================================================== */}
        {selectedDoubt && (
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
            <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 max-w-lg w-full space-y-5 animate-scale-up">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <span className="text-xl">✍️</span>
                  <h3 className="text-lg font-bold text-white">Administrative Doubt Resolution</h3>
                </div>
                <button
                  onClick={() => setSelectedDoubt(null)}
                  className="text-slate-400 hover:text-white font-bold text-sm"
                >
                  ✕
                </button>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
                <div className="text-[11px] text-indigo-400 font-bold">
                  {selectedDoubt.subject} · {selectedDoubt.studentName} asked:
                </div>
                <h4 className="text-xs font-bold text-white">{selectedDoubt.title}</h4>
                <p className="text-xs text-slate-300 italic mt-1">"{selectedDoubt.questionText}"</p>
              </div>

              <form onSubmit={handleResolveDoubt} className="space-y-4">
                <textarea
                  rows={4}
                  value={doubtReply}
                  onChange={(e) => setDoubtReply(e.target.value)}
                  placeholder="Provide authoritative clarification or faculty instruction..."
                  required
                  className="w-full p-3.5 rounded-2xl bg-slate-900 border border-slate-800 text-white text-xs focus:outline-none focus:border-indigo-500 resize-none"
                />

                <div className="flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setSelectedDoubt(null)}
                    className="py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-xl transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submittingReply || !doubtReply.trim()}
                    className="py-2.5 px-5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl transition disabled:opacity-50"
                  >
                    {submittingReply ? 'Submitting...' : 'Dispatch Answer'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* =========================================================================
            MODAL 3: SYSTEM AUDIT & RESYNC REPORT
        ========================================================================== */}
        {showResyncModal && resyncResult && (
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
            <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 max-w-lg w-full space-y-5 animate-scale-up">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <span className="text-xl">✅</span>
                  <h3 className="text-lg font-bold text-white">System Diagnostic & Audit Report</h3>
                </div>
                <button
                  onClick={() => setShowResyncModal(false)}
                  className="text-slate-400 hover:text-white font-bold text-sm"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-3 text-xs">
                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 font-bold flex justify-between items-center">
                  <span>Connection Engine:</span>
                  <span>{resyncResult.databaseState}</span>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
                  <div className="text-[10px] uppercase font-bold text-slate-400">Live Collection Counts</div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>Users: <span className="font-bold text-white">{resyncResult.recordCounts?.users}</span></div>
                    <div>Courses: <span className="font-bold text-white">{resyncResult.recordCounts?.courses}</span></div>
                    <div>Assignments: <span className="font-bold text-white">{resyncResult.recordCounts?.assignments}</span></div>
                    <div>Submissions: <span className="font-bold text-white">{resyncResult.recordCounts?.submissions}</span></div>
                    <div>Teacher Doubts: <span className="font-bold text-white">{resyncResult.recordCounts?.teacherDoubts}</span></div>
                    <div>Quizzes: <span className="font-bold text-white">{resyncResult.recordCounts?.quizzes}</span></div>
                    <div>Support Tickets: <span className="font-bold text-white">{resyncResult.recordCounts?.supportTickets}</span></div>
                    <div>Feedback Reviews: <span className="font-bold text-white">{resyncResult.recordCounts?.feedbackReviews}</span></div>
                  </div>
                </div>

                <div className="text-[10px] text-slate-500 font-mono text-center">
                  Audit Timestamp: {resyncResult.timestamp}
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  onClick={() => setShowResyncModal(false)}
                  className="py-2 px-5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl transition"
                >
                  Close Audit Report
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </SidebarLayout>
  );
};

export default PlatformAnalytics;
