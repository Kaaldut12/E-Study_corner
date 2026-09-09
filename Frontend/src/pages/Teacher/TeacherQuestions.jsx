// frontend/src/pages/Teacher/TeacherQuestions.jsx
import { useEffect, useState } from 'react';
import SidebarLayout from '../../components/common/SidebarLayout';
import { SkeletonCardList } from '../../components/common/SkeletonLoader';
import api from '../../services/api';

const TeacherQuestions = () => {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [toastMsg, setToastMsg] = useState('');

  // Replying state
  const [replyingQuestion, setReplyingQuestion] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [submittingReply, setSubmittingReply] = useState(false);

  const fetchQuestions = async () => {
    try {
      const res = await api.get('/teacher/questions');
      if (res.data.success) {
        setQuestions(res.data.questions || []);
      }
    } catch (err) {
      console.warn('Error fetching teacher questions:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuestions();
  }, []);

  const handleOpenReply = (q) => {
    setReplyingQuestion(q);
    setReplyText(q.teacherReply || '');
  };

  const handleSendReply = async (e) => {
    e.preventDefault();
    if (!replyingQuestion) return;

    setSubmittingReply(true);

    try {
      const res = await api.post(`/teacher/questions/${replyingQuestion.id}/reply`, {
        replyText: replyText.trim()
      });

      if (res.data.success) {
        const updated = res.data.question;
        setQuestions(prev => prev.map(item => item.id === updated.id ? updated : item));
        setToastMsg(`✓ Replied to "${replyingQuestion.studentName}" successfully!`);
        setReplyingQuestion(null);
        setReplyText('');
      }
    } catch (err) {
      setToastMsg(err.response?.data?.message || 'Failed to submit reply.');
    } finally {
      setSubmittingReply(false);
      setTimeout(() => setToastMsg(''), 4000);
    }
  };

  const pendingCount = questions.filter(q => q.status === 'pending').length;
  const answeredCount = questions.filter(q => q.status === 'answered').length;

  const filteredQuestions = questions.filter(q => {
    const matchesFilter = filter === 'all' || q.status === filter;
    const query = searchQuery.toLowerCase();
    const matchesSearch =
      !query ||
      (q.studentName || '').toLowerCase().includes(query) ||
      (q.studentEmail || '').toLowerCase().includes(query) ||
      (q.title || '').toLowerCase().includes(query) ||
      (q.question || '').toLowerCase().includes(query) ||
      (q.subject || '').toLowerCase().includes(query) ||
      (q.assignmentTitle || '').toLowerCase().includes(query);
    return matchesFilter && matchesSearch;
  });

  return (
    <SidebarLayout>
      <div className="space-y-6 max-w-7xl mx-auto">
        {/* Header Banner */}
        <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xl">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-purple-400">Faculty Classroom</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/10 text-purple-300 border border-purple-500/20">
                Direct Student Doubts
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white mt-1">Student Questions & Doubts</h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl">
              Answer direct questions and clarify coursework concepts asked by students in your courses.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                setLoading(true);
                fetchQuestions();
              }}
              className="py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-slate-200 text-xs font-bold rounded-xl border border-slate-800 transition flex items-center gap-2"
            >
              <span>🔄 Refresh Doubts</span>
            </button>
          </div>
        </div>

        {/* Feedback Alert Toast */}
        {toastMsg && (
          <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm font-semibold flex items-center justify-between shadow-lg animate-fadeIn">
            <span>{toastMsg}</span>
            <button onClick={() => setToastMsg('')} className="text-emerald-400/70 hover:text-emerald-300 text-xs font-bold">
              ✕
            </button>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="glass-panel p-4 rounded-2xl border border-slate-800 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 font-bold text-lg">
              💬
            </div>
            <div>
              <div className="text-xl font-bold text-white">{questions.length}</div>
              <div className="text-xs text-slate-400">Total Inquiries Received</div>
            </div>
          </div>

          <div className="glass-panel p-4 rounded-2xl border border-slate-800 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 font-bold text-lg">
              ⚠️
            </div>
            <div>
              <div className="text-xl font-bold text-amber-400">{pendingCount}</div>
              <div className="text-xs text-slate-400">Needs Your Answer</div>
            </div>
          </div>

          <div className="glass-panel p-4 rounded-2xl border border-slate-800 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 font-bold text-lg">
              ✓
            </div>
            <div>
              <div className="text-xl font-bold text-emerald-400">{answeredCount}</div>
              <div className="text-xs text-slate-400">Resolved & Answered</div>
            </div>
          </div>
        </div>

        {/* Filters & Search */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
            {[
              { id: 'all', label: `All Inquiries (${questions.length})` },
              { id: 'pending', label: `Needs Answer (${pendingCount})` },
              { id: 'answered', label: `Answered (${answeredCount})` }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setFilter(tab.id)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                  filter === tab.id
                    ? 'bg-purple-600 text-white shadow'
                    : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-72">
            <input
              type="text"
              placeholder="Search student or doubt text..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3.5 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-purple-500 transition"
            />
            <span className="absolute left-3 top-2.5 text-slate-500 text-xs">🔍</span>
          </div>
        </div>

        {/* Questions Feed */}
        {loading ? (
          <SkeletonCardList count={4} cols={1} />
        ) : filteredQuestions.length > 0 ? (
          <div className="space-y-4">
            {filteredQuestions.map((q) => {
              const isAnswered = q.status === 'answered';

              return (
                <div
                  key={q.id}
                  className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4 hover:border-slate-700 transition shadow-lg"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-purple-500/10 text-purple-300 border border-purple-500/20">
                          {q.subject || 'Coursework Doubt'}
                        </span>
                        {q.assignmentTitle && (
                          <span className="px-2.5 py-0.5 rounded-md text-[11px] font-medium bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                            📎 {q.assignmentTitle}
                          </span>
                        )}
                        <span className="text-[11px] text-slate-500">
                          Submitted on {new Date(q.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <h2 className="text-base font-bold text-white pt-1">{q.title}</h2>
                    </div>

                    <div className="flex items-center gap-2">
                      {isAnswered ? (
                        <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center gap-1.5 whitespace-nowrap">
                          <span>✓</span>
                          <span>Answered</span>
                        </span>
                      ) : (
                        <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30 flex items-center gap-1.5 whitespace-nowrap">
                          <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
                          <span>Awaiting Answer</span>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Student Inquiry Header */}
                  <div className="flex items-center gap-3 p-3 bg-slate-900/80 rounded-xl border border-slate-800">
                    <div className="w-9 h-9 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 flex items-center justify-center font-bold text-xs">
                      {(q.studentName || 'S').charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white flex items-center gap-1.5">
                        <span>{q.studentName}</span>
                        <span className="text-[10px] text-slate-400">({q.studentEmail})</span>
                      </div>
                      <div className="text-[10px] text-slate-400">Student ID: {q.studentId}</div>
                    </div>
                  </div>

                  {/* Question Content */}
                  <div className="p-4 bg-slate-950/60 rounded-xl border border-slate-800/80 text-xs text-slate-200 leading-relaxed whitespace-pre-wrap">
                    {q.question}
                  </div>

                  {/* Teacher Existing Reply or Reply Button */}
                  {isAnswered ? (
                    <div className="p-4 bg-emerald-500/5 border border-emerald-500/20 rounded-xl space-y-2 animate-fadeIn">
                      <div className="flex items-center justify-between border-b border-emerald-500/15 pb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-emerald-300">
                            ✓ Your Answer to {q.studentName}
                          </span>
                        </div>
                        <button
                          onClick={() => handleOpenReply(q)}
                          className="text-[11px] text-indigo-400 hover:underline font-semibold"
                        >
                          Edit Answer
                        </button>
                      </div>
                      <p className="text-xs text-slate-200 leading-relaxed whitespace-pre-wrap pt-1">
                        {q.teacherReply}
                      </p>
                    </div>
                  ) : (
                    <div className="pt-2 flex justify-end">
                      <button
                        onClick={() => handleOpenReply(q)}
                        className="py-2 px-4 bg-linear-to-r from-purple-600 to-indigo-600 hover:opacity-95 text-white text-xs font-bold rounded-xl shadow-lg shadow-purple-600/25 transition flex items-center gap-1.5"
                      >
                        <span>✍️ Reply to Student</span>
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="glass-panel p-16 text-center text-slate-400 rounded-3xl border border-slate-800 space-y-3">
            <div className="text-4xl">👨‍🏫</div>
            <h3 className="text-lg font-bold text-white">No questions in this view</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              {searchQuery || filter !== 'all'
                ? 'No student doubts match your current search or filter.'
                : 'No students have asked questions yet. Any academic inquiries sent to you will appear here.'}
            </p>
          </div>
        )}

        {/* Reply Modal */}
        {replyingQuestion && (
          <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
            <div className="glass-panel max-w-xl w-full p-6 rounded-2xl border border-slate-800 space-y-4 shadow-2xl max-h-[90vh] flex flex-col">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div>
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <span>✍️ Reply to Student</span>
                  </h3>
                  <p className="text-xs text-slate-400">
                    Answering doubt from <strong className="text-purple-300">{replyingQuestion.studentName}</strong>
                  </p>
                </div>
                <button onClick={() => setReplyingQuestion(null)} className="text-slate-400 hover:text-white p-1 text-sm font-bold">
                  ✕
                </button>
              </div>

              {/* Inquiry summary preview */}
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs space-y-1">
                <div className="font-bold text-white">{replyingQuestion.title}</div>
                <div className="text-slate-400 text-[11px] line-clamp-3">{replyingQuestion.question}</div>
              </div>

              <form onSubmit={handleSendReply} className="space-y-4 flex-1 flex flex-col">
                <div className="flex-1">
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Your Explanation & Answer *
                  </label>
                  <textarea
                    required
                    rows={6}
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder="Provide detailed guidance, reference equations, textbook chapters, or hints..."
                    className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-slate-100 text-xs focus:outline-none focus:border-purple-500 resize-none font-sans"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => setReplyingQuestion(null)}
                    className="py-2 px-4 rounded-xl text-xs text-slate-400 hover:text-white bg-slate-900 border border-slate-800"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submittingReply}
                    className="py-2.5 px-5 bg-linear-to-r from-purple-600 to-indigo-600 hover:opacity-95 text-white text-xs font-bold rounded-xl shadow-lg shadow-purple-600/25 transition disabled:opacity-50"
                  >
                    {submittingReply ? 'Sending Answer...' : 'Send Verified Answer'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </SidebarLayout>
  );
};

export default TeacherQuestions;
