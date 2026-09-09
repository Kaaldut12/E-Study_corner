// frontend/src/pages/Student/ViewAssignments.jsx
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import SidebarLayout from '../../components/common/SidebarLayout';
import api from '../../services/api';

const ViewAssignments = () => {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const fetchAssignments = async () => {
    try {
      const res = await api.get('/student/assignments');
      if (res.data.success) {
        setAssignments(res.data.assignments);
      }
    } catch (err) {
      console.warn('Assignments fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssignments();
  }, []);

  const pendingCount = assignments.filter((a) => a.status === 'pending').length;
  const submittedCount = assignments.filter((a) => a.status === 'submitted').length;
  const gradedCount = assignments.filter((a) => a.status === 'graded').length;

  const filteredAssignments = assignments.filter((asg) => {
    const matchesStatus = filterStatus === 'all' || asg.status === filterStatus;
    const matchesSearch =
      asg.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      asg.subject?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      asg.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      asg.teacherName?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const getStatusBadge = (asg) => {
    switch (asg.status) {
      case 'graded':
        return (
          <span className="px-3 py-1 text-xs font-bold rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center gap-1.5">
            <span>✓</span>
            <span>Graded: {asg.submission?.grade ?? 'Done'} / {asg.totalPoints || 100} pts</span>
          </span>
        );
      case 'submitted':
        return (
          <span className="px-3 py-1 text-xs font-bold rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/30 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-indigo-400"></span>
            <span>Submitted (Under Review)</span>
          </span>
        );
      default:
        return (
          <span className="px-3 py-1 text-xs font-bold rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
            <span>Pending Submission</span>
          </span>
        );
    }
  };

  return (
    <SidebarLayout>
      <div className="space-y-6">
        {/* Header Banner */}
        <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-400">Student Academics</span>
            <h1 className="text-2xl sm:text-3xl font-black text-white mt-1">Coursework & Assignments</h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Access homework given by instructors, upload your solutions, and view teacher feedback.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/student/feedback"
              className="py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-slate-200 text-xs font-bold rounded-xl border border-slate-800 transition flex items-center gap-2"
            >
              <span>📊 View All Grades & Feedback</span>
            </Link>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="glass-panel p-5 rounded-2xl border border-slate-800">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Awaiting Submission</span>
            <div className="text-2xl font-black text-amber-400 mt-1">{pendingCount}</div>
            <span className="text-[11px] text-amber-400/80 font-medium">Pending tasks to complete</span>
          </div>

          <div className="glass-panel p-5 rounded-2xl border border-slate-800">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Turned In</span>
            <div className="text-2xl font-black text-indigo-400 mt-1">{submittedCount}</div>
            <span className="text-[11px] text-slate-500">Submitted awaiting evaluation</span>
          </div>

          <div className="glass-panel p-5 rounded-2xl border border-slate-800">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Evaluated & Graded</span>
            <div className="text-2xl font-black text-emerald-400 mt-1">{gradedCount}</div>
            <span className="text-[11px] text-slate-500">Graded with teacher feedback</span>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
            {[
              { id: 'all', label: `All Tasks (${assignments.length})` },
              { id: 'pending', label: `Pending (${pendingCount})` },
              { id: 'submitted', label: `Submitted (${submittedCount})` },
              { id: 'graded', label: `Graded (${gradedCount})` }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setFilterStatus(tab.id)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                  filterStatus === tab.id
                    ? 'bg-indigo-600 text-white shadow'
                    : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="w-full sm:w-72">
            <input
              type="text"
              placeholder="Search assignments or subjects..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-3.5 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>

        {/* Assignment Cards Grid */}
        {loading ? (
          <div className="flex justify-center py-16">
            <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : filteredAssignments.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredAssignments.map((asg) => (
              <div
                key={asg.id}
                className="glass-panel p-6 rounded-3xl border border-slate-800 flex flex-col justify-between space-y-4 hover:border-indigo-500/40 transition duration-200 shadow-lg"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="px-2.5 py-0.5 text-xs font-bold rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                      {asg.subject}
                    </span>
                    {getStatusBadge(asg)}
                  </div>

                  <h2 className="text-base font-bold text-white leading-snug">{asg.title}</h2>
                  <p className="text-xs text-slate-300 leading-relaxed line-clamp-3">{asg.description}</p>

                  {/* Reference Material Link or Attachment */}
                  {asg.resourceLink && (
                    <div className="pt-1">
                      <a
                        href={asg.resourceLink}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs text-indigo-400 hover:underline inline-flex items-center gap-1 font-medium"
                      >
                        <span>🔗 Instructor Reference Resource</span>
                      </a>
                    </div>
                  )}

                  {asg.attachmentUrl && (
                    <div className="pt-1">
                      <a
                        href={asg.attachmentUrl}
                        download={asg.attachmentName || 'Problem_Sheet.pdf'}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs text-purple-400 hover:underline inline-flex items-center gap-1 font-medium"
                      >
                        <span>📎 Download Instructor Problem Sheet</span>
                      </a>
                    </div>
                  )}
                </div>

                <div className="pt-3 border-t border-slate-800/80 space-y-3">
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span>Instructor: <strong className="text-slate-300">{asg.teacherName}</strong></span>
                    <span>Max Points: <strong className="text-indigo-400 font-mono">{asg.totalPoints || 100} pts</strong></span>
                  </div>

                  <div className="flex items-center justify-between gap-2 pt-1">
                    <span className="text-[11px] text-slate-400">
                      Due: <strong className="text-amber-400">{new Date(asg.dueDate).toLocaleDateString()}</strong>
                    </span>

                    <Link
                      to={`/student/submit/${asg.id}`}
                      className={`py-2 px-4 text-xs font-bold rounded-xl transition shadow flex items-center gap-1.5 ${
                        asg.status === 'graded'
                          ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                          : asg.status === 'submitted'
                          ? 'bg-indigo-600 hover:bg-indigo-500 text-white'
                          : 'bg-linear-to-r from-indigo-600 to-purple-600 hover:opacity-95 text-white'
                      }`}
                    >
                      {asg.status === 'graded' ? (
                        <span>View Evaluation & Work →</span>
                      ) : asg.status === 'submitted' ? (
                        <span>Review / Update Work →</span>
                      ) : (
                        <span>Upload & Submit Work →</span>
                      )}
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="glass-panel p-16 text-center text-slate-400 rounded-3xl border border-slate-800 space-y-3">
            <div className="text-4xl">📚</div>
            <h3 className="text-lg font-bold text-white">No assignments found</h3>
            <p className="text-xs text-slate-400">
              {searchQuery || filterStatus !== 'all'
                ? 'Try clearing your search or switching to all assignments.'
                : 'Your instructors have not assigned any coursework yet.'}
            </p>
          </div>
        )}
      </div>
    </SidebarLayout>
  );
};

export default ViewAssignments;
