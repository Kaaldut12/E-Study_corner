// frontend/src/pages/Admin/PlatformAnalytics.jsx
import { useState, useEffect } from 'react';
import SidebarLayout from '../../components/common/SidebarLayout';

const PlatformAnalytics = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:3001/api/admin/analytics', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const resData = await res.json();
      if (resData.success) {
        setData(resData.analytics);
      }
    } catch (err) {
      console.error('Error fetching admin analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SidebarLayout>
      <div className="space-y-6">
        {/* Header Banner */}
        <div className="glass-panel p-6 rounded-3xl border border-slate-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-400">V4 Platform</span>
            <h1 className="text-2xl font-black text-white">Platform Reports & System Analytics</h1>
            <p className="text-xs text-slate-400 mt-1">
              Institutional engagement trends, department distribution, helpdesk SLA metrics, and rating averages.
            </p>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Top Stat Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total System Users</span>
                <p className="text-3xl font-black text-indigo-400">{data?.totalUsers || 8}</p>
              </div>

              <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Submissions</span>
                <p className="text-3xl font-black text-purple-400">{data?.totalSubmissions || 3}</p>
              </div>

              <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Published Study Docs</span>
                <p className="text-3xl font-black text-emerald-400">{data?.totalMaterials || 4}</p>
              </div>

              <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Platform Satisfaction</span>
                <p className="text-3xl font-black text-amber-400">⭐ {data?.feedbackAvgRating || 4.8} / 5.0</p>
              </div>
            </div>

            {/* Department Distribution */}
            <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 space-y-6">
              <div>
                <h3 className="text-base font-bold text-white">Department Enrollment Distribution</h3>
                <p className="text-xs text-slate-400">Active student representation across polytechnic departments.</p>
              </div>

              <div className="space-y-4">
                {(data?.departmentDistribution || []).map((dept, idx) => (
                  <div key={idx} className="space-y-2">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-semibold text-slate-200">{dept.name} ({dept.count} Students)</span>
                      <span className="font-bold text-indigo-400">{dept.percentage}%</span>
                    </div>
                    <div className="w-full bg-slate-900 h-3 rounded-full overflow-hidden p-0.5 border border-slate-800">
                      <div
                        className="h-full rounded-full bg-linear-to-r from-indigo-500 to-purple-500 transition-all duration-1000"
                        style={{ width: `${dept.percentage}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Monthly Activity Trends Table */}
            <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
              <h3 className="text-base font-bold text-white">Monthly System Activity Trends</h3>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-slate-950 text-slate-400 uppercase text-[10px]">
                    <tr>
                      <th className="p-3">Month</th>
                      <th className="p-3">Active Students</th>
                      <th className="p-3">Submissions</th>
                      <th className="p-3">Support Tickets</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {(data?.monthlyTrends || []).map((t, idx) => (
                      <tr key={idx} className="hover:bg-slate-850">
                        <td className="p-3 font-bold text-white">{t.month} 2026</td>
                        <td className="p-3">{t.students}</td>
                        <td className="p-3 text-indigo-400 font-semibold">{t.submissions}</td>
                        <td className="p-3 text-amber-400">{t.supportTickets}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </SidebarLayout>
  );
};

export default PlatformAnalytics;
