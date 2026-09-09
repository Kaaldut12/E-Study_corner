// frontend/src/pages/Student/StudentFeedback.jsx
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import SidebarLayout from '../../components/common/SidebarLayout';
import api from '../../services/api';

const StudentFeedback = () => {
  const [feedbackList, setFeedbackList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeedback = async () => {
      try {
        const res = await api.get('/student/feedback');
        if (res.data.success) {
          setFeedbackList(res.data.feedbackList || []);
        }
      } catch (err) {
        console.warn('Feedback fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchFeedback();
  }, []);

  const totalGraded = feedbackList.length;
  const avgScore = totalGraded > 0
    ? Math.round(
        (feedbackList.reduce((acc, curr) => acc + (curr.grade || 0), 0) /
          feedbackList.reduce((acc, curr) => acc + (curr.totalPoints || 100), 0)) *
          100
      )
    : 0;

  return (
    <SidebarLayout>
      <div className="space-y-6">
        {/* Header Banner */}
        <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">Academic Records</span>
            <h1 className="text-2xl sm:text-3xl font-black text-white mt-1">My Grades & Instructor Feedback</h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Review grading evaluations, earned points, and personalized feedback from your teachers.
            </p>
          </div>

          <Link
            to="/student/assignments"
            className="py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-slate-200 text-xs font-bold rounded-xl border border-slate-800 transition flex items-center gap-1.5 shrink-0"
          >
            <span>← Back to All Assignments</span>
          </Link>
        </div>

        {/* Highlight Cards */}
        {totalGraded > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="glass-panel p-5 rounded-2xl border border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Graded Submissions</span>
                <div className="text-2xl font-black text-white mt-1">{totalGraded}</div>
              </div>
              <span className="text-3xl">📝</span>
            </div>

            <div className="glass-panel p-5 rounded-2xl border border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Cumulative Average</span>
                <div className="text-2xl font-black text-emerald-400 mt-1">{avgScore}%</div>
              </div>
              <span className="text-3xl">🎯</span>
            </div>
          </div>
        )}

        {/* Feedback List */}
        {loading ? (
          <div className="flex justify-center py-16">
            <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : feedbackList.length > 0 ? (
          <div className="space-y-4">
            {feedbackList.map((item) => {
              const maxPts = item.totalPoints || 100;
              const scorePct = Math.round((item.grade / maxPts) * 100);

              return (
                <div
                  key={item.id}
                  className="glass-panel p-6 sm:p-7 rounded-3xl border border-slate-800 space-y-4 shadow-lg hover:border-emerald-500/30 transition duration-200"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-3.5">
                    <div>
                      <span className="px-2.5 py-0.5 text-xs font-bold rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 mb-1.5 inline-block">
                        {item.subject || 'Coursework'}
                      </span>
                      <h2 className="text-base sm:text-lg font-bold text-white">{item.assignmentTitle}</h2>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <div className="text-xl font-black text-emerald-400">
                          {item.grade} <span className="text-xs text-slate-400 font-normal">/ {maxPts} pts</span>
                        </div>
                        <div className="text-xs font-bold text-emerald-300">{scorePct}% Overall Score</div>
                      </div>

                      <Link
                        to={`/student/submit/${item.assignmentId}`}
                        className="py-1.5 px-3 bg-slate-900 hover:bg-slate-800 text-slate-200 text-xs font-bold rounded-xl border border-slate-800 transition"
                      >
                        View Details →
                      </Link>
                    </div>
                  </div>

                  {/* Teacher Feedback Banner */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs text-slate-400 font-bold uppercase tracking-wider">
                      <span>Feedback Commentary from {item.gradedBy || 'Instructor'}</span>
                      {item.gradedAt && (
                        <span className="font-normal text-[11px] lowercase">
                          graded on {new Date(item.gradedAt).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                    <div className="p-4 rounded-2xl bg-emerald-950/20 border border-emerald-500/20 text-slate-200 text-sm leading-relaxed italic">
                      💬 "{item.feedback || 'No written comments provided.'}"
                    </div>
                  </div>

                  {/* Submitted Answer Excerpt */}
                  {item.submissionText && (
                    <div className="text-xs text-slate-300 pt-2 border-t border-slate-800/60 space-y-1">
                      <span className="font-bold text-slate-400 uppercase tracking-wider block text-[10px]">
                        Your Turned-in Response
                      </span>
                      <p className="font-mono text-[12px] bg-slate-950/60 p-3 rounded-xl border border-slate-800/80 line-clamp-3">
                        {item.submissionText}
                      </p>
                    </div>
                  )}

                  {/* Attachment if available */}
                  {item.attachmentUrl && (
                    <div className="pt-2 flex items-center justify-between text-xs text-slate-400 border-t border-slate-800/40">
                      <span>Attached file: <strong className="text-slate-200">{item.fileName || 'Submitted_Document.pdf'}</strong></span>
                      <a
                        href={item.attachmentUrl}
                        download={item.fileName || 'Submitted_Document.pdf'}
                        className="text-indigo-400 hover:underline font-semibold"
                      >
                        Download Your File
                      </a>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="glass-panel p-16 text-center text-slate-400 rounded-3xl border border-slate-800 space-y-3">
            <div className="text-4xl">🎓</div>
            <h3 className="text-lg font-bold text-white">No graded assignments yet</h3>
            <p className="text-xs text-slate-400">
              When instructors grade your turned-in work, your score, percentage, and feedback will appear here.
            </p>
            <div className="pt-2">
              <Link
                to="/student/assignments"
                className="py-2 px-4 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl transition"
              >
                Go to Assignments
              </Link>
            </div>
          </div>
        )}
      </div>
    </SidebarLayout>
  );
};

export default StudentFeedback;
