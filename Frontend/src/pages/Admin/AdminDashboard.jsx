// frontend/src/pages/Admin/AdminDashboard.jsx
import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import SidebarLayout from '../../components/common/SidebarLayout';
import { SkeletonDashboard } from '../../components/common/SkeletonLoader';
import adminService from '../../services/adminService';
import { useAuth } from '../../contexts/AuthContext';

const AdminDashboard = () => {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionSuccess, setActionSuccess] = useState('');
  const [actionError, setActionError] = useState('');

  // Modals & Action States
  const [showBroadcastModal, setShowBroadcastModal] = useState(false);
  const [broadcastMsg, setBroadcastMsg] = useState('');
  const [broadcasting, setBroadcasting] = useState(false);

  const [selectedTicket, setSelectedTicket] = useState(null);
  const [ticketReply, setTicketReply] = useState('');
  const [ticketStatus, setTicketStatus] = useState('resolved');
  const [submittingTicket, setSubmittingTicket] = useState(false);

  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [questionReply, setQuestionReply] = useState('');
  const [submittingQuestion, setSubmittingQuestion] = useState(false);

  const [resyncing, setResyncing] = useState(false);
  const [resyncAudit, setResyncAudit] = useState(null);
  const [showResyncModal, setShowResyncModal] = useState(false);

  const fetchAdminData = useCallback(async () => {
    try {
      const res = await adminService.getDashboard();
      if (res.success) {
        setData(res);
      }
    } catch (err) {
      console.warn('Admin dashboard fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAdminData();
  }, [fetchAdminData]);

  const showToast = (msg, isError = false) => {
    if (isError) {
      setActionError(msg);
      setTimeout(() => setActionError(''), 4000);
    } else {
      setActionSuccess(msg);
      setTimeout(() => setActionSuccess(''), 4000);
    }
  };

  // Action: Toggle User Status (Active / Suspended)
  const handleToggleUserStatus = async (targetUser) => {
    const nextStatus = targetUser.status === 'suspended' ? 'active' : 'suspended';
    try {
      const res = await adminService.toggleUserStatus(targetUser.id, nextStatus);
      if (res.success) {
        showToast(`User ${targetUser.name} status updated to ${nextStatus}!`);
        fetchAdminData();
      }
    } catch (err) {
      showToast(err.parsedMessage || err.message || 'Failed updating user status', true);
    }
  };

  // Action: Broadcast Campus Announcement
  const handleBroadcastAnnouncement = async (e) => {
    e.preventDefault();
    if (!broadcastMsg.trim()) return;
    setBroadcasting(true);
    try {
      const res = await adminService.createNotification({ Noti_Message: broadcastMsg.trim() });
      if (res.success) {
        showToast('Campus announcement broadcasted successfully!');
        setBroadcastMsg('');
        setShowBroadcastModal(false);
        fetchAdminData();
      }
    } catch (err) {
      showToast(err.parsedMessage || err.message || 'Broadcast failed', true);
    } finally {
      setBroadcasting(false);
    }
  };

  // Action: Resolve Support Ticket
  const handleResolveTicket = async (e) => {
    e.preventDefault();
    if (!selectedTicket) return;
    setSubmittingTicket(true);
    try {
      const res = await adminService.replyMessage(selectedTicket.id, {
        status: ticketStatus,
        adminReply: ticketReply.trim()
      });
      if (res.success) {
        showToast(`Ticket #${selectedTicket.id} updated to ${ticketStatus}!`);
        setSelectedTicket(null);
        setTicketReply('');
        fetchAdminData();
      }
    } catch (err) {
      showToast(err.parsedMessage || err.message || 'Failed updating ticket', true);
    } finally {
      setSubmittingTicket(false);
    }
  };

  // Action: Answer Student Doubt
  const handleAnswerQuestion = async (e) => {
    e.preventDefault();
    if (!selectedQuestion || !questionReply.trim()) return;
    setSubmittingQuestion(true);
    try {
      const res = await adminService.replyQuestion(selectedQuestion.id, questionReply.trim());
      if (res.success) {
        showToast('Administrative resolution dispatched to student!');
        setSelectedQuestion(null);
        setQuestionReply('');
        fetchAdminData();
      }
    } catch (err) {
      showToast(err.parsedMessage || err.message || 'Failed replying to doubt', true);
    } finally {
      setSubmittingQuestion(false);
    }
  };

  // Action: Trigger Database Diagnostic Re-sync
  const handleTriggerResync = async () => {
    setResyncing(true);
    try {
      const res = await adminService.triggerResync();
      if (res.success) {
        setResyncAudit(res.audit);
        setShowResyncModal(true);
        showToast('Database collections synchronized & audited successfully!');
        fetchAdminData();
      }
    } catch {
      showToast('Database re-sync failed', true);
    } finally {
      setResyncing(false);
    }
  };

  if (loading) {
    return (
      <SidebarLayout>
        <SkeletonDashboard role="admin" />
      </SidebarLayout>
    );
  }

  const stats = data?.stats || {};

  return (
    <SidebarLayout>
      <div className="space-y-6">
        {/* Welcome Header */}
        <div className="glass-panel p-4 sm:p-6 lg:p-8 rounded-2xl sm:rounded-3xl relative overflow-hidden border border-brand">
          <div className="absolute right-0 top-0 w-72 h-72 rounded-full blur-3xl pointer-events-none" style={{ background: 'var(--brand-glow)' }}></div>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
            <div>
              <div className="flex items-center gap-2">
                <span className={`text-xs font-bold uppercase tracking-wider ${user?.role === 'superadmin' ? 'text-rose-400' : 'text-amber-400'}`}>
                  {user?.role === 'superadmin' ? '👑 Super Admin Authority Command' : '🛡️ Administrator Control Center'}
                </span>
                {user?.role === 'superadmin' && (
                  <span className="px-2 py-0.5 bg-rose-500/20 text-rose-300 text-[10px] font-extrabold rounded-md border border-rose-500/30">
                    MASTER CONTROL
                  </span>
                )}
                <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-300 text-[10px] font-extrabold rounded-md border border-emerald-500/30 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  OPERATIONAL
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
                {user?.role === 'superadmin' ? `Welcome, ${user?.name || 'Super Admin'} 👑` : 'Platform Operations & Triage Console 🛡️'}
              </h1>
              <p className="text-slate-400 text-xs sm:text-sm mt-1 max-w-2xl">
                Universal platform management: oversee administrators, faculty, student coursework, doubts triage, and live institutional governance.
              </p>
            </div>

            <div className="flex flex-wrap gap-2.5 shrink-0">
              <Link
                to="/admin/students"
                className="py-2.5 px-4 btn-dashboard-emerald text-white text-xs font-bold rounded-xl flex items-center gap-2"
              >
                <span>🎓</span>
                <span>Student Actions Hub</span>
              </Link>
              <Link
                to="/admin/analytics"
                className="py-2.5 px-4 btn-premium text-white text-xs font-bold rounded-xl flex items-center gap-2"
              >
                <span>📊</span>
                <span>Deep Analytics Hub</span>
              </Link>
              <Link
                to="/admin/users"
                className="py-2.5 px-4 btn-dashboard-secondary text-xs font-bold rounded-xl flex items-center gap-2"
              >
                <span>👥</span>
                <span>User Directory</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Action Feedback Alerts */}
        {actionSuccess && (
          <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-semibold flex items-center justify-between animate-fade-in">
            <span>✅ {actionSuccess}</span>
            <button onClick={() => setActionSuccess('')} className="text-emerald-400 font-bold">✕</button>
          </div>
        )}
        {actionError && (
          <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-semibold flex items-center justify-between animate-fade-in">
            <span>⚠️ {actionError}</span>
            <button onClick={() => setActionError('')} className="text-rose-400 font-bold">✕</button>
          </div>
        )}

        {/* =========================================================================
            ADMINISTRATIVE QUICK ACTION COMMAND CENTER
        ========================================================================== */}
        <div className="glass-panel p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-indigo-500/30 bg-indigo-950/20 relative overflow-hidden space-y-4">
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 border-b border-indigo-500/20 pb-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-lg">⚡</span>
                <h2 className="text-base font-black text-white">Administrative Action Command Center</h2>
              </div>
              <p className="text-xs text-indigo-300/80 mt-0.5">
                Execute platform-wide actions, broadcast institutional notifications, triage queries, and verify databases.
              </p>
            </div>
            <span className="text-[11px] font-mono text-indigo-400">Direct Execution Mode</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {/* Action 1: Broadcast */}
            <button
              onClick={() => setShowBroadcastModal(true)}
              className="p-4 rounded-2xl dashboard-action-card border border-indigo-500/30 text-left space-y-1.5 group cursor-pointer hover:border-indigo-400"
            >
              <div className="flex justify-between items-center">
                <span className="text-xl">📢</span>
                <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider group-hover:underline">Launch →</span>
              </div>
              <h3 className="text-xs font-bold text-white group-hover:text-indigo-300 transition">Broadcast Notice</h3>
              <p className="text-[11px] text-slate-400">Post instant announcement to student & teacher dashboards.</p>
            </button>

            {/* Action 2: Student Actions Hub */}
            <Link
              to="/admin/students"
              className="p-4 rounded-2xl dashboard-action-card border border-emerald-500/30 text-left space-y-1.5 group cursor-pointer hover:border-emerald-400 block"
            >
              <div className="flex justify-between items-center">
                <span className="text-xl">🎓</span>
                <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider group-hover:underline">Manage →</span>
              </div>
              <h3 className="text-xs font-bold text-white group-hover:text-emerald-300 transition">Student Actions Console</h3>
              <p className="text-[11px] text-slate-400">Grade coursework, manage student leaves, override attendance & answer doubts.</p>
            </Link>

            {/* Action 3: Leave Approvals */}
            <Link
              to="/admin/leaves"
              className="p-4 rounded-2xl dashboard-action-card border border-purple-500/30 text-left space-y-1.5 group cursor-pointer hover:border-purple-400 block"
            >
              <div className="flex justify-between items-center">
                <span className="text-xl">🏖️</span>
                {(stats.pendingLeavesCount || 0) > 0 && (
                  <span className="px-1.5 py-0.5 bg-purple-500 text-white text-[10px] font-extrabold rounded-full animate-pulse">
                    {stats.pendingLeavesCount} PENDING
                  </span>
                )}
              </div>
              <h3 className="text-xs font-bold text-white group-hover:text-purple-300 transition">Leave Approvals</h3>
              <p className="text-[11px] text-slate-400">Review & evaluate student & faculty leave applications campus-wide.</p>
            </Link>

            {/* Action 4: Resolve Support */}
            <button
              onClick={() => {
                if (data?.recentSupportMessages?.length > 0) {
                  setSelectedTicket(data.recentSupportMessages[0]);
                } else {
                  showToast('No pending support tickets found.');
                }
              }}
              className="p-4 rounded-2xl dashboard-action-card border border-amber-500/30 text-left space-y-1.5 group cursor-pointer hover:border-amber-400"
            >
              <div className="flex justify-between items-center">
                <span className="text-xl">🎫</span>
                {stats.pendingSupportMessages > 0 && (
                  <span className="px-1.5 py-0.5 bg-amber-500 text-slate-950 text-[10px] font-extrabold rounded-full">
                    {stats.pendingSupportMessages} PENDING
                  </span>
                )}
              </div>
              <h3 className="text-xs font-bold text-white group-hover:text-amber-300 transition">Resolve Helpdesk</h3>
              <p className="text-[11px] text-slate-400">Review pending inquiries & dispatch official solutions.</p>
            </button>

            {/* Action 5: Triage Doubts */}
            <button
              onClick={() => {
                if (data?.recentPendingQuestions?.length > 0) {
                  setSelectedQuestion(data.recentPendingQuestions[0]);
                } else {
                  showToast('All student doubts are currently answered!');
                }
              }}
              className="p-4 rounded-2xl dashboard-action-card border border-sky-500/30 text-left space-y-1.5 group cursor-pointer hover:border-sky-400"
            >
              <div className="flex justify-between items-center">
                <span className="text-xl">❓</span>
                {stats.pendingTeacherQuestions > 0 && (
                  <span className="px-1.5 py-0.5 bg-sky-500 text-slate-950 text-[10px] font-extrabold rounded-full">
                    {stats.pendingTeacherQuestions} WAITING
                  </span>
                )}
              </div>
              <h3 className="text-xs font-bold text-white group-hover:text-sky-300 transition">Triage Student Doubts</h3>
              <p className="text-[11px] text-slate-400">Answer unanswered questions sent to course teachers.</p>
            </button>

            {/* Action 6: Resync DB */}
            <button
              onClick={handleTriggerResync}
              disabled={resyncing}
              className="p-4 rounded-2xl dashboard-action-card border border-teal-500/30 text-left space-y-1.5 group cursor-pointer hover:border-teal-400 disabled:opacity-50"
            >
              <div className="flex justify-between items-center">
                <span className={`text-xl ${resyncing ? 'animate-spin' : ''}`}>🔄</span>
                <span className="text-[10px] font-bold text-teal-400 uppercase tracking-wider group-hover:underline">Audit →</span>
              </div>
              <h3 className="text-xs font-bold text-white group-hover:text-teal-300 transition">Database Integrity Audit</h3>
              <p className="text-[11px] text-slate-400">Verify MongoDB Atlas connection & refresh all collections.</p>
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="glass-panel glass-panel-hover p-5 rounded-2xl border border-slate-800">
            <div className="text-slate-400 text-xs font-medium uppercase tracking-wider">Total Registered Accounts</div>
            <div className="text-3xl font-extrabold text-white mt-2">{stats.totalUsers || 0}</div>
            <div className="text-xs text-indigo-400 mt-1 font-medium">
              {stats.studentCount || 0} Students · {stats.teacherCount || 0} Teachers · {stats.activeUsers || 0} Active
            </div>
          </div>

          <div className="glass-panel glass-panel-hover p-5 rounded-2xl border border-slate-800">
            <div className="text-slate-400 text-xs font-medium uppercase tracking-wider">Coursework & Homework</div>
            <div className="text-3xl font-extrabold text-purple-400 mt-2">{stats.totalSubmissions || 0}</div>
            <div className="text-xs text-slate-400 mt-1 font-medium">
              {stats.totalAssignments || 0} assignments · {stats.pendingGradingSubmissions || 0} pending grading
            </div>
          </div>

          <div className="glass-panel glass-panel-hover p-5 rounded-2xl border border-slate-800">
            <div className="flex items-center justify-between text-slate-400 text-xs font-medium uppercase tracking-wider">
              <span>Student Inquiries (Doubts)</span>
              {stats.pendingTeacherQuestions > 0 && (
                <span className="w-2.5 h-2.5 rounded-full bg-sky-400 animate-pulse"></span>
              )}
            </div>
            <div className="text-3xl font-extrabold text-sky-400 mt-2">{stats.totalTeacherQuestions || 0}</div>
            <div className="text-xs text-sky-400 mt-1 font-medium">
              {stats.pendingTeacherQuestions || 0} awaiting faculty answer
            </div>
          </div>

          <div className="glass-panel glass-panel-hover p-5 rounded-2xl border border-slate-800">
            <div className="flex items-center justify-between text-slate-400 text-xs font-medium uppercase tracking-wider">
              <span>Support Tickets</span>
              {stats.pendingSupportMessages > 0 && (
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse"></span>
              )}
            </div>
            <div className="text-3xl font-extrabold text-amber-400 mt-2">{stats.pendingSupportMessages || 0}</div>
            <div className="text-xs text-amber-400 mt-1 font-medium">Pending admin resolution</div>
          </div>
        </div>

        {/* Tables Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* User Management Quick Table with Direct Status Action */}
          <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-4">
              <div>
                <h2 className="text-base font-bold text-white">System Accounts & Quick Governance</h2>
                <p className="text-xs text-slate-400 mt-0.5">One-click status toggling and user overview</p>
              </div>
              <Link to="/admin/users" className="text-xs text-indigo-400 hover:underline font-bold">
                Manage all ({stats.totalUsers}) →
              </Link>
            </div>

            <div className="space-y-2.5">
              {data?.recentUsers?.map((u) => (
                <div key={u.id} className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center font-bold text-xs text-white border border-slate-700 shrink-0">
                      {u.name.charAt(0)}
                    </div>
                    <div>
                      <div className="font-semibold text-sm text-slate-100 flex items-center gap-2">
                        <span>{u.name}</span>
                        {u.status === 'suspended' && (
                          <span className="px-1.5 py-0.2 text-[10px] bg-rose-500/20 text-rose-300 rounded-md font-bold">
                            SUSPENDED
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-slate-400">{u.email}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className={`px-2.5 py-0.5 text-[11px] font-semibold rounded-full capitalize ${
                      u.role === 'student'
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        : u.role === 'teacher'
                        ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
                        : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                    }`}>
                      {u.role}
                    </span>

                    {u.role !== 'superadmin' && (
                      <button
                        onClick={() => handleToggleUserStatus(u)}
                        title={u.status === 'suspended' ? 'Activate User' : 'Suspend User'}
                        className={`p-1.5 px-2.5 rounded-lg text-[11px] font-bold transition border ${
                          u.status === 'suspended'
                            ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30 hover:bg-emerald-500/30'
                            : 'bg-rose-500/10 text-rose-300 border-rose-500/20 hover:bg-rose-500/20'
                        }`}
                      >
                        {u.status === 'suspended' ? 'Activate' : 'Suspend'}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Support Tickets Quick Log with Inline Action */}
          <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-4">
              <div>
                <h2 className="text-base font-bold text-white">Helpdesk Queries & Instant Reply</h2>
                <p className="text-xs text-slate-400 mt-0.5">Direct triage of student & instructor queries</p>
              </div>
              <Link to="/admin/messages" className="text-xs text-indigo-400 hover:underline font-bold">
                View all tickets →
              </Link>
            </div>

            <div className="space-y-2.5">
              {data?.recentSupportMessages?.map((msg) => (
                <div key={msg.id} className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center justify-between gap-3">
                  <div>
                    <div className="font-semibold text-sm text-slate-100">{msg.subject}</div>
                    <div className="text-xs text-slate-400">By {msg.userName} ({msg.userRole})</div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className={`px-2.5 py-0.5 text-xs font-semibold rounded-full ${
                      msg.status === 'resolved'
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                    }`}>
                      {msg.status === 'resolved' ? 'Resolved' : 'Pending'}
                    </span>

                    <button
                      onClick={() => setSelectedTicket(msg)}
                      className="py-1 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-bold border border-slate-700 transition"
                    >
                      Reply ✍️
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Third Operational Queue: Pending Doubts Requiring Attention */}
        {data?.recentPendingQuestions && data.recentPendingQuestions.length > 0 && (
          <div className="glass-panel p-6 rounded-2xl border border-sky-500/30 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <span className="text-lg">❓</span>
                <h3 className="text-base font-bold text-white">Student Questions Needing Administrative Triage</h3>
              </div>
              <Link to="/admin/analytics" className="text-xs text-sky-400 hover:underline font-bold">
                Explore in Analytics →
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {data.recentPendingQuestions.map((q) => (
                <div key={q.id} className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-center text-[10px] font-bold text-sky-400 uppercase">
                      <span>{q.subject}</span>
                      <span className="text-slate-500">{new Date(q.createdAt).toLocaleDateString()}</span>
                    </div>
                    <h4 className="text-xs font-bold text-white mt-1">{q.title}</h4>
                    <p className="text-xs text-slate-300 italic mt-1 line-clamp-2">"{q.questionText}"</p>
                    <p className="text-[11px] text-slate-400 mt-1">Asked by: {q.studentName} → Teacher: {q.teacherName}</p>
                  </div>

                  <button
                    onClick={() => setSelectedQuestion(q)}
                    className="w-full mt-2 py-1.5 bg-sky-600 hover:bg-sky-500 text-white rounded-lg text-xs font-bold transition text-center"
                  >
                    Provide Administrative Answer ✍️
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* =========================================================================
            MODAL 1: CAMPUS BROADCAST MODAL
        ========================================================================== */}
        {showBroadcastModal && (
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-3 sm:p-4">
            <div className="glass-panel p-4 sm:p-5 rounded-2xl border border-slate-800 max-w-md w-full space-y-3 shadow-2xl animate-scale-up">
              <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                <div className="flex items-center gap-2">
                  <span className="text-lg">📢</span>
                  <h3 className="text-base font-bold text-white">Dispatch Campus Broadcast</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setShowBroadcastModal(false)}
                  className="text-slate-400 hover:text-white font-bold text-sm"
                >
                  ✕
                </button>
              </div>

              <p className="text-[11px] text-slate-400 leading-relaxed">
                Notice will be immediately synchronized across the database and displayed on student & teacher dashboards.
              </p>

              <form onSubmit={handleBroadcastAnnouncement} className="space-y-3">
                <textarea
                  rows={3}
                  value={broadcastMsg}
                  onChange={(e) => setBroadcastMsg(e.target.value)}
                  placeholder="e.g. System maintenance scheduled for Saturday 11:00 PM. Assignment deadline extended."
                  required
                  className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs focus:outline-none focus:border-indigo-500 resize-none"
                />

                <div className="flex justify-end gap-2 pt-1 border-t border-slate-800/80">
                  <button
                    type="button"
                    onClick={() => setShowBroadcastModal(false)}
                    className="py-2 px-3.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-xl transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={broadcasting || !broadcastMsg.trim()}
                    className="py-2 px-4 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl transition disabled:opacity-50"
                  >
                    {broadcasting ? 'Publishing...' : 'Publish Announcement'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* =========================================================================
            MODAL 2: TICKET RESOLVER MODAL
        ========================================================================== */}
        {selectedTicket && (
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-3 sm:p-4">
            <div className="glass-panel p-4 sm:p-5 rounded-2xl border border-slate-800 max-w-md w-full max-h-[88vh] overflow-y-auto space-y-3 shadow-2xl animate-scale-up">
              <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                <div className="flex items-center gap-2">
                  <span className="text-lg">🎫</span>
                  <h3 className="text-base font-bold text-white">Resolve Ticket #{selectedTicket.id}</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedTicket(null)}
                  className="text-slate-400 hover:text-white font-bold text-sm"
                >
                  ✕
                </button>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 space-y-1 text-xs">
                <div className="text-slate-400">
                  From: <span className="text-white font-semibold">{selectedTicket.userName}</span> ({selectedTicket.userRole})
                </div>
                <div className="text-slate-400">Subject: <span className="text-white font-semibold">{selectedTicket.subject}</span></div>
                <div className="text-slate-300 italic bg-slate-950 p-2 rounded-lg border border-slate-800 mt-1">
                  "{selectedTicket.message}"
                </div>
              </div>

              <form onSubmit={handleResolveTicket} className="space-y-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-300 block mb-1 uppercase tracking-wider">Ticket Status</label>
                  <select
                    value={ticketStatus}
                    onChange={(e) => setTicketStatus(e.target.value)}
                    className="w-full p-2 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs focus:outline-none focus:border-indigo-500"
                  >
                    <option value="resolved">Resolved (Close Ticket)</option>
                    <option value="in-progress">In-Progress (Keep Active)</option>
                    <option value="pending">Pending</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-300 block mb-1 uppercase tracking-wider">Official Reply</label>
                  <textarea
                    rows={3}
                    value={ticketReply}
                    onChange={(e) => setTicketReply(e.target.value)}
                    placeholder="Provide resolution commentary for user..."
                    required
                    className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs focus:outline-none focus:border-indigo-500 resize-none"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-1 border-t border-slate-800/80">
                  <button
                    type="button"
                    onClick={() => setSelectedTicket(null)}
                    className="py-2 px-3.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-xl transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submittingTicket || !ticketReply.trim()}
                    className="py-2 px-4 bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold rounded-xl transition disabled:opacity-50"
                  >
                    {submittingTicket ? 'Updating...' : 'Dispatch Resolution'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* =========================================================================
            MODAL 3: DOUBT ANSWER MODAL
        ========================================================================== */}
        {selectedQuestion && (
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-3 sm:p-4">
            <div className="glass-panel p-4 sm:p-5 rounded-2xl border border-slate-800 max-w-md w-full max-h-[88vh] overflow-y-auto space-y-3 shadow-2xl animate-scale-up">
              <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                <div className="flex items-center gap-2">
                  <span className="text-lg">✍️</span>
                  <h3 className="text-base font-bold text-white">Answer Student Question</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedQuestion(null)}
                  className="text-slate-400 hover:text-white font-bold text-sm"
                >
                  ✕
                </button>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 space-y-1 text-xs">
                <div className="text-sky-400 font-bold">{selectedQuestion.subject}</div>
                <h4 className="font-bold text-white">{selectedQuestion.title}</h4>
                <p className="text-slate-300 italic mt-0.5 bg-slate-950 p-2 rounded-lg border border-slate-800">
                  "{selectedQuestion.questionText}"
                </p>
                <div className="text-[10px] text-slate-400 mt-1">
                  Student: {selectedQuestion.studentName} · Assigned Teacher: {selectedQuestion.teacherName}
                </div>
              </div>

              <form onSubmit={handleAnswerQuestion} className="space-y-3">
                <textarea
                  rows={3}
                  value={questionReply}
                  onChange={(e) => setQuestionReply(e.target.value)}
                  placeholder="Type administrative clarification or academic guidance..."
                  required
                  className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs focus:outline-none focus:border-indigo-500 resize-none"
                />

                <div className="flex justify-end gap-2 pt-1 border-t border-slate-800/80">
                  <button
                    type="button"
                    onClick={() => setSelectedQuestion(null)}
                    className="py-2 px-3.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-xl transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submittingQuestion || !questionReply.trim()}
                    className="py-2 px-4 bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold rounded-xl transition disabled:opacity-50"
                  >
                    {submittingQuestion ? 'Submitting...' : 'Dispatch Answer'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* =========================================================================
            MODAL 4: SYSTEM AUDIT REPORT MODAL
        ========================================================================== */}
        {showResyncModal && resyncAudit && (
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-3 sm:p-4">
            <div className="glass-panel p-4 sm:p-5 rounded-2xl border border-slate-800 max-w-md w-full max-h-[88vh] overflow-y-auto space-y-3 shadow-2xl animate-scale-up">
              <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                <div className="flex items-center gap-2">
                  <span className="text-lg">✅</span>
                  <h3 className="text-base font-bold text-white">System Diagnostic & Audit</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setShowResyncModal(false)}
                  className="text-slate-400 hover:text-white font-bold text-sm"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-2.5 text-xs">
                <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 font-bold flex justify-between items-center">
                  <span>Engine:</span>
                  <span>{resyncAudit.databaseState}</span>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 space-y-1.5">
                  <div className="text-[10px] uppercase font-bold text-slate-400">Live Collection Counts</div>
                  <div className="grid grid-cols-2 gap-1.5 text-xs">
                    <div>Users: <span className="font-bold text-white">{resyncAudit.recordCounts?.users}</span></div>
                    <div>Courses: <span className="font-bold text-white">{resyncAudit.recordCounts?.courses}</span></div>
                    <div>Assignments: <span className="font-bold text-white">{resyncAudit.recordCounts?.assignments}</span></div>
                    <div>Submissions: <span className="font-bold text-white">{resyncAudit.recordCounts?.submissions}</span></div>
                    <div>Doubts: <span className="font-bold text-white">{resyncAudit.recordCounts?.teacherDoubts}</span></div>
                    <div>Quizzes: <span className="font-bold text-white">{resyncAudit.recordCounts?.quizzes}</span></div>
                    <div>Tickets: <span className="font-bold text-white">{resyncAudit.recordCounts?.supportTickets}</span></div>
                    <div>Feedback: <span className="font-bold text-white">{resyncAudit.recordCounts?.feedbackReviews}</span></div>
                  </div>
                </div>

                <div className="text-[10px] text-slate-500 font-mono text-center">
                  Timestamp: {resyncAudit.timestamp}
                </div>
              </div>

              <div className="flex justify-end pt-1 border-t border-slate-800/80">
                <button
                  type="button"
                  onClick={() => setShowResyncModal(false)}
                  className="py-2 px-4 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl transition"
                >
                  Dismiss
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </SidebarLayout>
  );
};

export default AdminDashboard;
