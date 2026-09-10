import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import SidebarLayout from '../../components/common/SidebarLayout';
import { SkeletonCardList } from '../../components/common/SkeletonLoader';
import api from '../../services/api';
import downloadFile from '../../utils/fileDownload';

const ManageAssignments = () => {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toastMsg, setToastMsg] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const fetchAssignments = async () => {
    try {
      const res = await api.get('/teacher/assignments');
      if (res.data.success) {
        setAssignments(res.data.assignments);
      }
    } catch (err) {
      console.warn('Error fetching teacher assignments:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssignments();
  }, []);

  const handleDeleteAssignment = async (id, title) => {
    if (!window.confirm(`Are you sure you want to delete assignment "${title}"? This will also remove student submissions for it.`)) {
      return;
    }

    try {
      await api.delete(`/teacher/assignments/${id}`);
      setAssignments((prev) => prev.filter((a) => a.id !== id));
      setToastMsg(`Assignment "${title}" deleted successfully.`);
    } catch (err) {
      console.warn('Delete error:', err);
      setToastMsg(`Error deleting assignment: ${err.message}`);
    } finally {
      setTimeout(() => setToastMsg(''), 3500);
    }
  };

  const subjects = ['all', ...new Set(assignments.map((a) => a.subject).filter(Boolean))];

  const filteredAssignments = assignments.filter((asg) => {
    const matchesSubject = selectedSubject === 'all' || asg.subject === selectedSubject;
    const matchesCategory =
      selectedCategory === 'all' ||
      (asg.category || 'assignment').toLowerCase() === selectedCategory.toLowerCase();
    const matchesSearch =
      asg.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      asg.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      asg.subject?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSubject && matchesCategory && matchesSearch;
  });

  const totalSubmissionsCount = assignments.reduce((acc, a) => acc + (a.submissionCount || 0), 0);
  const totalPendingGradeCount = assignments.reduce((acc, a) => acc + (a.pendingGradeCount || 0), 0);

  return (
    <SidebarLayout>
      <div className="space-y-6">
        {/* Header Banner */}
        <div className="glass-panel p-4 sm:p-6 lg:p-8 rounded-2xl sm:rounded-3xl border border-slate-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-purple-400">Teacher Coursework Hub</span>
            <h1 className="text-2xl sm:text-3xl font-black text-white mt-1">Coursework Assignments & Submissions</h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Give assignments, review student documents, and grade submissions.
            </p>
          </div>

          <Link
            to="/teacher/create-assignment"
            className="py-2.5 sm:py-3 px-4 sm:px-5 btn-premium text-white text-xs font-bold rounded-xl shadow-lg shadow-purple-600/30 hover:opacity-95 transition flex items-center justify-center gap-2 shrink-0 w-full sm:w-auto"
          >
            <span className="text-base leading-none">+</span>
            <span>Give New Assignment</span>
          </Link>
        </div>

        {/* Quick Stat Highlights */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="glass-panel p-5 rounded-2xl border border-slate-800">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Active Coursework</span>
            <div className="text-2xl font-black text-white mt-1">{assignments.length}</div>
            <span className="text-[11px] text-slate-500">Assignments created by you</span>
          </div>

          <div className="glass-panel p-5 rounded-2xl border border-slate-800">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Submissions</span>
            <div className="text-2xl font-black text-indigo-400 mt-1">{totalSubmissionsCount}</div>
            <span className="text-[11px] text-slate-500">Student submissions received</span>
          </div>

          <div className="glass-panel p-5 rounded-2xl border border-slate-800">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Needs Evaluation</span>
            <div className="text-2xl font-black text-amber-400 mt-1">{totalPendingGradeCount}</div>
            <span className="text-[11px] text-amber-400/80 font-medium">Submissions awaiting your grade</span>
          </div>
        </div>

        {toastMsg && (
          <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold flex items-center gap-2">
            <span>✓</span>
            <span>{toastMsg}</span>
          </div>
        )}

        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            {subjects.map((subj) => (
              <button
                key={subj}
                onClick={() => setSelectedSubject(subj)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold capitalize whitespace-nowrap transition ${
                  selectedSubject === subj
                    ? 'bg-purple-600 text-white shadow'
                    : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                {subj}
              </button>
            ))}
          </div>

          <div className="w-full sm:w-72">
            <input
              type="text"
              placeholder="Search coursework..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-3.5 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-purple-500"
            />
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mr-1">Category:</span>
          {[
            { id: 'all', label: 'All Tasks' },
            { id: 'homework', label: '📚 Homework' },
            { id: 'assignment', label: '📝 Assignments' },
            { id: 'project', label: '💻 Projects & Labs' }
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition whitespace-nowrap border ${
                selectedCategory === cat.id
                  ? 'bg-purple-600 text-white border-purple-500 shadow-sm'
                  : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Assignments List */}
        {loading ? (
          <SkeletonCardList count={4} cols={2} />
        ) : filteredAssignments.length === 0 ? (
          <div className="glass-panel p-6 sm:p-10 rounded-2xl sm:rounded-3xl border border-slate-800 text-center space-y-3">
            <div className="text-4xl">📝</div>
            <h3 className="text-lg font-bold text-white">No assignments found</h3>
            <p className="text-xs text-slate-400">
              {searchQuery || selectedSubject !== 'all'
                ? 'Try adjusting your search query or subject filter.'
                : 'Click "Give New Assignment" above to publish coursework for your students.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredAssignments.map((asg) => (
              <div
                key={asg.id}
                className="glass-panel p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-slate-800 space-y-4 flex flex-col justify-between hover:border-purple-500/40 transition duration-200 shadow-lg"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="px-2.5 py-1 bg-purple-500/10 border border-purple-500/20 text-purple-400 text-[10px] font-bold uppercase rounded-lg">
                      {asg.subject}
                    </span>
                    <span className="text-xs text-slate-400">
                      Points: <strong className="text-white font-mono">{asg.totalPoints || 100} pts</strong>
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-white leading-snug">{asg.title}</h3>
                  <p className="text-xs text-slate-400 line-clamp-3 leading-relaxed">{asg.description}</p>

                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    {asg.category && (
                      <span className="px-2 py-0.5 text-[10px] font-bold rounded-lg bg-purple-500/10 text-purple-300 border border-purple-500/20 uppercase tracking-wider">
                        {asg.category === 'homework' ? '📚 Homework' : asg.category}
                      </span>
                    )}

                    {asg.resourceLink && (
                      <a
                        href={asg.resourceLink}
                        target="_blank"
                        rel="noreferrer"
                        className="text-purple-400 hover:underline flex items-center gap-1 text-[11px]"
                      >
                        <span>🔗 Reference Material</span>
                      </a>
                    )}
                  </div>

                  {asg.attachmentUrl && (
                    <div className="pt-1">
                      <button
                        type="button"
                        onClick={() =>
                          downloadFile(
                            asg.attachmentUrl,
                            asg.attachmentName || `${asg.title.replace(/\s+/g, '_')}_Document.pdf`
                          )
                        }
                        className="py-1.5 px-3 bg-purple-600/15 hover:bg-purple-600/30 text-purple-300 border border-purple-500/30 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer"
                      >
                        <span>📥 Download Coursework File ({asg.attachmentName || 'Attachment'})</span>
                      </button>
                    </div>
                  )}
                </div>

                <div className="space-y-3 pt-3 border-t border-slate-800/80">
                  <div className="grid grid-cols-2 gap-2 p-3 bg-slate-950/80 rounded-2xl border border-slate-800/80 text-center text-xs">
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-semibold block">Submissions</span>
                      <p className="font-extrabold text-indigo-400 text-sm mt-0.5">{asg.submissionCount || 0}</p>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-semibold block">Needs Grading</span>
                      <p className={`font-extrabold text-sm mt-0.5 ${(asg.pendingGradeCount || 0) > 0 ? 'text-amber-400' : 'text-slate-400'}`}>
                        {asg.pendingGradeCount || 0}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pt-1 text-xs">
                    <span className="text-slate-400 text-[11px]">
                      Due: <strong className="text-slate-300">{new Date(asg.dueDate).toLocaleDateString()}</strong>
                    </span>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleDeleteAssignment(asg.id, asg.title)}
                        className="px-3 py-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-xs font-semibold rounded-xl transition border border-rose-500/20"
                      >
                        Delete
                      </button>

                      <Link
                        to={`/teacher/submissions/${asg.id}`}
                        className="px-3.5 py-1.5 btn-premium hover:opacity-95 text-white text-xs font-bold rounded-xl transition shadow flex items-center gap-1"
                      >
                        <span>Check Submissions</span>
                        {(asg.pendingGradeCount || 0) > 0 && (
                          <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
                        )}
                        <span>→</span>
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
