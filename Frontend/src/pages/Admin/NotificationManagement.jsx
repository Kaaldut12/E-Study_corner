// frontend/src/pages/Admin/NotificationManagement.jsx
import { useEffect, useState } from 'react';
import SidebarLayout from '../../components/common/SidebarLayout';
import api from '../../services/api';

const NotificationManagement = () => {
  const [notifications, setNotifications] = useState([]);
  const [notiMessage, setNotiMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [toastMsg, setToastMsg] = useState('');

  const fetchNotifications = async () => {
    try {
      const res = await api.get('/admin/notifications');
      if (res.data.success) {
        setNotifications(res.data.notifications || []);
      }
    } catch (err) {
      console.warn('Notifications fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setToastMsg('');

    try {
      const res = await api.post('/admin/notifications', {
        Noti_Message: notiMessage
      });

      if (res.data.success) {
        setNotifications((prev) => [res.data.notification, ...prev]);
        setToastMsg('Notification published live to top marquee ticker!');
        setNotiMessage('');
      }
    } catch (err) {
      setToastMsg(err.response?.data?.message || 'Failed to publish notification.');
    } finally {
      setSubmitting(false);
      setTimeout(() => setToastMsg(''), 3000);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this broadcast notification?')) return;

    try {
      await api.delete(`/admin/notifications/${id}`);
      setNotifications((prev) => prev.filter((n) => n.id !== id));
      setToastMsg('Notification deleted successfully.');
    } catch (err) {
      setToastMsg(err.response?.data?.message || 'Failed to delete notification.');
    } finally {
      setTimeout(() => setToastMsg(''), 3000);
    }
  };

  return (
    <SidebarLayout>
      <div className="space-y-4 sm:space-y-6">
        <div className="flex flex-col gap-1">
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">Live Marquee Notification Management</h1>
          <p className="text-xs sm:text-sm text-slate-400">Publish broadcast ticker alerts visible at the top of every page</p>
        </div>

        {toastMsg && (
          <div className="p-3 sm:p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
            ✓ {toastMsg}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          {/* Create Notification Form */}
          <div className="glass-panel p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-slate-800/80 space-y-4">
            <h2 className="text-base sm:text-lg font-bold text-white">Publish Alert</h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Notification Message</label>
                <textarea
                  rows={4}
                  required
                  value={notiMessage}
                  onChange={(e) => setNotiMessage(e.target.value)}
                  placeholder="Type notification text to scroll across header marquee..."
                  className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-slate-100 text-xs focus:outline-none focus:border-indigo-500 leading-relaxed"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-2.5 px-4 btn-premium text-white text-xs font-semibold rounded-xl transition disabled:opacity-50"
              >
                {submitting ? 'Publishing...' : 'Publish Live Notification'}
              </button>
            </form>
          </div>

          {/* Active Notifications Table */}
          <div className="lg:col-span-2 glass-panel p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-slate-800/80 space-y-4">
            <h2 className="text-base sm:text-lg font-bold text-white">Active Ticker Notifications</h2>

            {loading ? (
              <div className="py-12 text-center text-slate-400 text-xs">Loading notifications...</div>
            ) : notifications.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-300 min-w-[480px]">
                  <thead className="bg-slate-900 text-slate-400 uppercase font-semibold border-b border-slate-800">
                    <tr>
                      <th className="px-3.5 py-3">ID</th>
                      <th className="px-3.5 py-3">Notification Text</th>
                      <th className="px-3.5 py-3">Published Date</th>
                      <th className="px-3.5 py-3 text-right">Delete</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/80">
                    {notifications.map((n) => (
                      <tr key={n.id} className="hover:bg-slate-900/40 transition">
                        <td className="px-3.5 py-3 font-mono text-slate-400">{n.notificationId || '#'}</td>
                        <td className="px-3.5 py-3 font-medium text-slate-100">{n.notiMessage}</td>
                        <td className="px-3.5 py-3 text-slate-400">
                          {new Date(n.notiDt).toLocaleDateString()}
                        </td>
                        <td className="px-3.5 py-3 text-right">
                          <button
                            onClick={() => handleDelete(n.id)}
                            className="px-2.5 py-1 bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 border border-rose-500/20 font-semibold rounded transition"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-6 sm:p-8 text-center text-slate-400 text-xs">No active marquee notifications published.</div>
            )}
          </div>
        </div>
      </div>
    </SidebarLayout>
  );
};

export default NotificationManagement;
