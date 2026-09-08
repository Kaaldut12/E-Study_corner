// frontend/src/pages/Teacher/ManageStudents.jsx
import { useState, useEffect } from 'react';
import SidebarLayout from '../../components/common/SidebarLayout';

const ManageStudents = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchTeacherStudents();
  }, []);

  const fetchTeacherStudents = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:3001/api/teacher/students', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setStudents(data.students);
      }
    } catch (err) {
      console.error('Error fetching teacher student roster:', err);
    } finally {
      setLoading(false);
    }
  };

  const filtered = students.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.email.toLowerCase().includes(search.toLowerCase()) ||
    (s.course && s.course.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <SidebarLayout>
      <div className="space-y-6">
        {/* Header Banner */}
        <div className="glass-panel p-6 rounded-3xl border border-slate-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-purple-400">Teacher Portal</span>
            <h1 className="text-2xl font-black text-white">Student Roster & Class Performance</h1>
            <p className="text-xs text-slate-400 mt-1">
              Monitor student submissions, evaluate performance trends, and manage class rosters.
            </p>
          </div>

          <input
            type="text"
            placeholder="Search students by name, email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full sm:w-64 px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
          />
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : filtered.length === 0 ? (
          <div className="glass-panel p-12 rounded-3xl border border-slate-800 text-center space-y-3">
            <div className="text-4xl">🎓</div>
            <h3 className="text-lg font-bold text-white">No students found</h3>
            <p className="text-xs text-slate-400">Students registered in your department will appear here.</p>
          </div>
        ) : (
          <div className="glass-panel rounded-3xl border border-slate-800 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] border-b border-slate-800">
                  <tr>
                    <th className="p-4">Student Name</th>
                    <th className="p-4">Course & Year</th>
                    <th className="p-4">Submissions</th>
                    <th className="p-4">Average Grade</th>
                    <th className="p-4">Contact info</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80">
                  {filtered.map((s) => (
                    <tr key={s.id} className="hover:bg-slate-900/50 transition">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-xl bg-purple-500/20 text-purple-400 font-bold border border-purple-500/30 flex items-center justify-center">
                            {s.name.charAt(0)}
                          </div>
                          <div>
                            <span className="font-bold text-white block">{s.name}</span>
                            <span className="text-[11px] text-slate-400">{s.email}</span>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="text-indigo-400 font-semibold block">{s.course || 'Diploma in CS & Engg'}</span>
                        <span className="text-[10px] text-slate-400">{s.courseYear || '3rd Year'}</span>
                      </td>
                      <td className="p-4">
                        <span className="px-2.5 py-1 bg-slate-900 border border-slate-800 text-slate-200 font-bold rounded-lg">
                          {s.submissionsCount || 0} Submissions
                        </span>
                      </td>
                      <td className="p-4 font-bold text-emerald-400">
                        {s.avgGrade}
                      </td>
                      <td className="p-4 text-[11px] text-slate-400 font-mono">
                        {s.mobileNo || 'N/A'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </SidebarLayout>
  );
};

export default ManageStudents;
