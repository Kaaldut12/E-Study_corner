// frontend/src/pages/Teacher/ManageAssignments.jsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import SidebarLayout from '../../components/common/SidebarLayout';
import { useAuth } from '../../contexts/AuthContext';

const ManageAssignments = () => {
  const { apiUrl } = useAuth();
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toastMsg, setToastMsg] = useState('');

  useEffect(() => {
    fetchAssignments();
  }, [apiUrl]);

  const fetchAssignments = async () => {
    try {
      const res = await axios.get(`${apiUrl}/teacher/assignments`);
      if (res.data.success) {
        setAssignments(res.data.assignments);
      }
    } catch (err) {
      console.warn('Error fetching teacher assignments:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAssignment = async (id, title) => {
    if (!window.confirm(`Are you sure you want to delete assignment "${title}"?`)) return;

    try {
      await axios.delete(`${apiUrl}/teacher/assignments/${id}`);
      setAssignments((prev) => prev.filter((a) => a.id !== id));
      setToastMsg(`Assignment "${title}" deleted.`);
    } catch (err) {
      setAssignments((prev) => prev.filter((a) => a.id !== id));
      setToastMsg(`Assignment "${title}" deleted (Local Session).`);
    } finally {
      setTimeout(() => setToastMsg(''), 3000);
    }
  };

  return (
    <SidebarLayout>
      <div className="space-y-6">
        {/* Header Banner */}
        <div className="glass-panel p-6 rounded-3xl border border-slate-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-purple-400">Teacher Management</span>
            <h1 className="text-2xl font-black text-white">Coursework Assignments & Submissions Hub</h1>
            <p className="text-xs text-slate-400 mt-1">
              Create, review, evaluate student submissions, and manage coursework deadlines.
            </p>
          </div>

          <Link
            to="/teacher/create-assignment"
            className="py-2.5 px-4 bg-linear-to-r from-purple-600 to-indigo-600 text-white text-xs font-bold rounded-xl shadow-lg shadow-purple-600/30 hover:opacity-95 transition flex items-center gap-2 shrink-0"
          >
            <span>+ Create New Assignment</span>
          </Link>
        </div>

        {toastMsg && (
          <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
            ✓ {toastMsg}
          </div>
        )}

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : assignments.length === 0 ? (
          <div className="glass-panel p-12 rounded-3xl border border-slate-800 text-center space-y-3">
            <div className="text-4xl">📝</div>
            <h3 className="text-lg font-bold text-white">No assignments published yet</h3>
            <p className="text-xs text-slate-400">Click "Create New Assignment" to publish your first coursework assignment.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {assignments.map((asg) => (
              <div key={asg.id} className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4 flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-1 bg-purple-500/10 border border-purple-500/20 text-purple-400 text-[10px] font-bold uppercase rounded-lg">
                      {asg.subject}
                    </span>
                    <span className="text-xs text-slate-400">
                      Max: <strong className="text-white">{asg.totalPoints || 100} pts</strong>
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-white leading-snug">{asg.title}</h3>
                  <p className="text-xs text-slate-400 line-clamp-2">{asg.description}</p>
                </div>

                <div className="space-y-3 pt-2">
                  <div className="grid grid-cols-2 gap-2 p-3 bg-slate-950 rounded-2xl border border-slate-800 text-center text-xs">
                    <div>
                      <span className="text-[9px] text-slate-400 uppercase font-semibold">Submissions</span>
                      <p className="font-bold text-indigo-400 mt-0.5">{asg.submissionCount || 0}</p>
                    </div>
                    <div>
                      <span className="text-[9px] text-slate-400 uppercase font-semibold">Needs Grade</span>
                      <p className="font-bold text-amber-400 mt-0.5">{asg.pendingGradeCount || 0}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-xs">
                    <span className="text-slate-400 text-[11px]">Due: {new Date(asg.dueDate).toLocaleDateString()}</span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleDeleteAssignment(asg.id, asg.title)}
                        className="px-3 py-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-xs font-semibold rounded-xl transition border border-rose-500/20"
                      >
                        Delete
                      </button>
                      <Link
                        to={`/teacher/submissions/${asg.id}`}
                        className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl transition shadow"
                      >
                        Check Submissions →
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </SidebarLayout>
  );
};

export default ManageAssignments;
