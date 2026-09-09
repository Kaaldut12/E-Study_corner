// frontend/src/pages/Student/ViewAssignments.jsx
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import SidebarLayout from '../../components/common/SidebarLayout';
import { SkeletonCardList } from '../../components/common/SkeletonLoader';
import api from '../../services/api';
import downloadFile from '../../utils/fileDownload';

const ViewAssignments = () => {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');
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
    const matchesCategory =
      filterCategory === 'all' ||
      (asg.category || 'assignment').toLowerCase() === filterCategory.toLowerCase();
    const matchesSearch =
      asg.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      asg.subject?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      asg.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      asg.teacherName?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesCategory && matchesSearch;
  });

  const getStatusBadge = (asg) => {
    switch (asg.status) {
      case 'graded':
        return (
          <span className="px-3 py-1 text-xs font-bold rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center gap-1.5 shadow-xs">
            <span>✓</span>
            <span>Graded: {asg.submission?.grade ?? 'Done'} / {asg.totalPoints || 100} pts</span>
          </span>
        );
      case 'submitted':
        return (
          <span className="px-3 py-1 text-xs font-bold rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/30 flex items-center gap-1.5 shadow-xs">
            <span className="w-2 h-2 rounded-full bg-indigo-400" />
            <span>Submitted (Under Review)</span>
          </span>
        );
      default:
        return (
          <span className="px-3 py-1 text-xs font-bold rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30 flex items-center gap-1.5 shadow-xs">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            <span>Pending Submission</span>
          </span>
        );
    }
  };

  return (
    <SidebarLayout>
      <div className="space-y-6">
        {/* Header Banner */}
        <div className="glass-panel glass-card-accent p-6 sm:p-8 rounded-3xl flex flex-col sm:flex-row sm:items-center justify-between gap-5 shadow-2xl">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-brand-subtle text-indigo-400 border border-brand text-[11px] font-extrabold uppercase tracking-widest font-display">
                Student Academics
              </span>
              <span className="text-xs text-slate-400">· Coursework Repository</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white mt-2 font-display">
              Coursework & Assignments
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl leading-relaxed">
              Access homework given by instructors, download problem sheets, upload your solutions, and view evaluation feedback.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <Link
              to="/student/feedback"
              className="py-3 px-4 btn-secondary text-slate-200 text-xs font-bold rounded-xl flex items-center gap-2"
            >
              <span>📊 View All Grades & Feedback</span>
            </Link>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="glass-panel glass-panel-hover p-5 rounded-2xl animate-slide-up delay-75">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider font-display">Awaiting Submission</span>
            <div className="text-3xl font-black text-amber-400 mt-1 font-display">{pendingCount}</div>
            <span className="text-xs text-amber-400/80 font-medium">Pending tasks to complete</span>
          </div>

          <div className="glass-panel glass-panel-hover p-5 rounded-2xl animate-slide-up delay-150">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider font-display">Turned In</span>
            <div className="text-3xl font-black text-indigo-400 mt-1 font-display">{submittedCount}</div>
            <span className="text-xs text-slate-400 font-medium">Submitted awaiting review</span>
          </div>

          <div className="glass-panel glass-panel-hover p-5 rounded-2xl animate-slide-up delay-225">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider font-display">Evaluated & Graded</span>
            <div className="text-3xl font-black text-emerald-400 mt-1 font-display">{gradedCount}</div>
            <span className="text-xs text-slate-400 font-medium">Graded with teacher feedback</span>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="space-y-3.5">
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
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                    filterStatus === tab.id
                      ? 'bg-brand text-white shadow-brand ring-1 ring-white/20'
                      : 'bg-slate-900/80 text-slate-400 hover:text-white border border-slate-800'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="w-full sm:w-80">
              <input
                type="text"
                placeholder="Search coursework, homework, or subjects..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand transition"
              />
            </div>
          </div>

          {/* Category Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 mr-1 font-display">Filter Type:</span>
            {[
              { id: 'all', label: 'All Types' },
              { id: 'homework', label: '📚 Homework Only' },
              { id: 'assignment', label: '📝 Assignments Only' },
              { id: 'project', label: '💻 Projects & Labs' }
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => setFilterCategory(cat.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap border ${
                  filterCategory === cat.id
                    ? 'bg-purple-600 text-white border-purple-500 shadow-md shadow-purple-600/30'
                    : 'bg-slate-950/70 text-slate-400 border-slate-800 hover:text-white'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Assignment Cards Grid */}
        {loading ? (
          <SkeletonCardList count={4} cols={2} />
        ) : filteredAssignments.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredAssignments.map((asg) => (
              <div
                key={asg.id}
                className="glass-panel glass-panel-hover p-6 sm:p-7 rounded-3xl flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 text-xs font-bold rounded-lg bg-brand-subtle text-indigo-300 border border-brand">
                        {asg.subject}
                      </span>
                      {asg.category && (
                        <span className="px-2.5 py-0.5 text-[10px] font-bold rounded-lg bg-purple-500/10 text-purple-300 border border-purple-500/30 uppercase tracking-wider">
                          {asg.category === 'homework' ? '📚 Homework' : asg.category}
                        </span>
                      )}
                    </div>
                    {getStatusBadge(asg)}
                  </div>

                  <h2 className="text-base font-bold text-white leading-snug font-display">{asg.title}</h2>
                  <p className="text-xs text-slate-300 leading-relaxed line-clamp-3">{asg.description}</p>

                  {/* Reference Material Link or Attachment */}
                  {asg.resourceLink && (
                    <div className="pt-1">
                      <a
                        href={asg.resourceLink}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs text-indigo-400 hover:underline inline-flex items-center gap-1 font-semibold"
                      >
                        <span>🔗 Instructor Reference Resource</span>
                      </a>
                    </div>
                  )}

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
                        className="w-full sm:w-auto py-2.5 px-4 bg-purple-600/15 hover:bg-purple-600/30 text-purple-300 border border-purple-500/30 rounded-xl text-xs font-bold transition flex items-center justify-center sm:justify-start gap-2 shadow-xs hover:scale-[1.02] cursor-pointer"
                      >
                        <span className="text-sm animate-bounce">📥</span>
                        <span>
                          Download {asg.category === 'homework' ? 'Homework Sheet' : 'Problem Document'} (
                          {asg.attachmentName || 'Attached File'})
                        </span>
                      </button>
                    </div>
                  )}
                </div>

                <div className="pt-3 border-t border-slate-800/80 space-y-3">
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span>Instructor: <strong className="text-slate-300 font-semibold">{asg.teacherName}</strong></span>
                    <span>Max Points: <strong className="text-indigo-400 font-mono font-bold">{asg.totalPoints || 100} pts</strong></span>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-1">
                    <span className="text-xs text-slate-400">
                      Due: <strong className="text-amber-400 font-semibold">{new Date(asg.dueDate).toLocaleDateString()}</strong>
                    </span>

                    <div className="flex items-center gap-2">
                      <Link
                        to={`/student/questions?teacherId=${asg.teacherId || ''}&assignmentId=${asg.id}&assignmentTitle=${encodeURIComponent(asg.title)}&subject=${encodeURIComponent(asg.subject || '')}`}
                        className="py-2.5 px-3.5 btn-secondary rounded-xl text-xs font-bold flex items-center gap-1"
                        title="Directly ask instructor a doubt regarding this coursework"
                      >
                        <span>💬 Ask</span>
                      </Link>

                      <Link
                        to={`/student/submit/${asg.id}`}
                        className="py-2.5 px-4 btn-premium text-white text-xs font-bold flex items-center gap-1.5"
                      >
                        {asg.status === 'graded' ? (
                          <span>Evaluation →</span>
                        ) : asg.status === 'submitted' ? (
                          <span>Review Work →</span>
                        ) : (
                          <span>Submit Work →</span>
                        )}
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="glass-panel p-16 text-center text-slate-400 rounded-3xl space-y-3">
            <div className="text-5xl">📚</div>
            <h3 className="text-lg font-bold text-white font-display">No assignments found</h3>
            <p className="text-xs text-slate-400">
              {searchQuery || filterStatus !== 'all'
                ? 'Try clearing your search query or switching the status filter.'
                : 'Your instructors have not published any coursework yet.'}
            </p>
          </div>
        )}
      </div>
    </SidebarLayout>
  );
};

export default ViewAssignments;
