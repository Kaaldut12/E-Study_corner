// frontend/src/pages/Admin/AdminDashboard.jsx
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import SidebarLayout from '../../components/common/SidebarLayout';
import api from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';

const AdminDashboard = () => {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        const res = await api.get('/admin/dashboard');
        if (res.data.success) {
          setData(res.data);
        }
      } catch (err) {
        console.warn('Admin dashboard fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAdminData();
  }, []);

  if (loading) {
    return (
      <SidebarLayout>
        <div className="py-20 text-center text-slate-400">Loading System Operations Dashboard...</div>
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
              <div className="flex items-center gap-2">
                <span className={`text-xs font-bold uppercase tracking-wider ${user?.role === 'superadmin' ? 'text-rose-400' : 'text-amber-400'}`}>
                  {user?.role === 'superadmin' ? '👑 Super Admin Authority Console' : 'Administrator Console'}
                </span>
                {user?.role === 'superadmin' && (
                  <span className="px-2 py-0.5 bg-rose-500/20 text-rose-300 text-[10px] font-extrabold rounded-md border border-rose-500/30">
                    MASTER CONTROL
                  </span>
                )}
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
                {user?.role === 'superadmin' ? `Welcome, ${user?.name || 'Super Admin'} 👑` : 'System Command & Overview 🛡️'}
              </h1>
              <p className="text-slate-400 text-sm mt-1">
                {user?.role === 'superadmin'
                  ? 'Universal platform management: oversee administrators, faculty, students, security health, and system-wide configurations.'
                  : 'Manage system users, monitor user activity, review support queries, and ensure smooth platform operation.'}
              </p>
            </div>

            <div className="flex gap-2 shrink-0">
              <Link
                to="/admin/users"
                className="py-2.5 px-4 gradient-bg-primary text-white text-xs font-semibold rounded-xl shadow-lg shadow-indigo-600/30 hover:opacity-95 transition"
              >
                Manage Users
              </Link>
              <Link
                to="/admin/messages"
                className="py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700 transition"
              >
                Support Inbox
              </Link>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="glass-panel glass-panel-hover p-5 rounded-2xl border border-slate-800 animate-slide-up delay-75">
            <div className="text-slate-400 text-xs font-medium uppercase tracking-wider">Total Active Users</div>
            <div className="text-3xl font-extrabold text-white mt-2">{stats.totalUsers || 0}</div>
            <div className="text-xs t-brand mt-1 font-medium">
              {stats.studentCount || 0} Students · {stats.teacherCount || 0} Teachers {stats.adminCount ? `· ${stats.adminCount} Admins` : ''}
            </div>
          </div>

          <div className="glass-panel glass-panel-hover p-5 rounded-2xl border border-slate-800 animate-slide-up delay-150">
            <div className="text-slate-400 text-xs font-medium uppercase tracking-wider">Published Coursework</div>
            <div className="text-3xl font-extrabold t-brand mt-2">{stats.totalAssignments || 0}</div>
            <div className="text-xs text-slate-400 mt-1 font-medium">{stats.totalSubmissions || 0} student submissions</div>
          </div>

          <div className="glass-panel glass-panel-hover p-5 rounded-2xl border border-slate-800 animate-slide-up delay-225">
            <div className="flex items-center justify-between text-slate-400 text-xs font-medium uppercase tracking-wider">
              <span>Support Tickets</span>
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse"></span>
            </div>
            <div className="text-3xl font-extrabold text-amber-400 mt-2">{stats.pendingSupportMessages || 0}</div>
            <div className="text-xs text-amber-400 mt-1 font-medium">Pending admin resolution</div>
          </div>

          <div className="glass-panel glass-panel-hover p-5 rounded-2xl border border-slate-800 animate-slide-up delay-300">
            <div className="text-slate-400 text-xs font-medium uppercase tracking-wider">Platform Feedback</div>
            <div className="text-3xl font-extrabold text-emerald-400 mt-2">{stats.totalFeedback || 0}</div>
            <div className="text-xs text-emerald-400 mt-1 font-medium">Reviews submitted</div>
          </div>
        </div>

        {/* Tables Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* User Management Quick Table */}
          <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-4">
              <h2 className="text-lg font-bold text-white">System Accounts</h2>
              <Link to="/admin/users" className="text-xs t-brand hover:opacity-80 font-semibold">
                Manage all ({stats.totalUsers}) →
              </Link>
            </div>

            <div className="space-y-2">
              {data?.recentUsers?.map((u) => (
                <div key={u.id} className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-brand flex items-center justify-center font-bold text-xs text-white border border-slate-700">
                      {u.name.charAt(0)}
                    </div>
                    <div>
                      <div className="font-semibold text-sm text-slate-100">{u.name}</div>
                      <div className="text-xs text-slate-400">{u.email}</div>
                    </div>
                  </div>

                  <span className={`px-2.5 py-0.5 text-xs font-semibold rounded-full capitalize ${
                    u.role === 'student'
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                      : u.role === 'teacher'
                      ? 'badge-brand border'
                      : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                  }`}>
                    {u.role}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Support Tickets Quick Log */}
          <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-4">
              <h2 className="text-lg font-bold text-white">Support Inquiries</h2>
              <Link to="/admin/messages" className="text-xs t-brand hover:opacity-80 font-semibold">
                View all tickets →
              </Link>
            </div>

            <div className="space-y-2">
              {data?.recentSupportMessages?.map((msg) => (
                <div key={msg.id} className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-sm text-slate-100">{msg.subject}</div>
                    <div className="text-xs text-slate-400">By {msg.userName} ({msg.userRole})</div>
                  </div>

                  <span className={`px-2.5 py-0.5 text-xs font-semibold rounded-full ${
                    msg.status === 'resolved'
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                      : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                  }`}>
                    {msg.status === 'resolved' ? 'Resolved' : 'Pending'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </SidebarLayout>
  );
};

export default AdminDashboard;
