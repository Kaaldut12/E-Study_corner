// frontend/src/pages/Student/StudentQuestions.jsx
import { useEffect, useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import SidebarLayout from '../../components/common/SidebarLayout';
import api from '../../services/api';

const StudentQuestions = () => {
  const location = useLocation();
  const [questions, setQuestions] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [toastMsg, setToastMsg] = useState('');

  // Ask Question Modal State
  const [showModal, setShowModal] = useState(false);
  const [selectedTeacherId, setSelectedTeacherId] = useState('');
  const [title, setTitle] = useState('');
  const [questionText, setQuestionText] = useState('');
  const [subject, setSubject] = useState('');
  const [assignmentId, setAssignmentId] = useState('');
  const [assignmentTitle, setAssignmentTitle] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Load questions and teachers
  const fetchData = async () => {
    try {
      const [qRes, tRes] = await Promise.all([
        api.get('/student/questions'),
        api.get('/student/teachers')
      ]);

      if (qRes.data.success) {
        setQuestions(qRes.data.questions || []);
      }
      if (tRes.data.success) {
        setTeachers(tRes.data.teachers || []);
        if (tRes.data.teachers.length > 0 && !selectedTeacherId) {
          setSelectedTeacherId(tRes.data.teachers[0].id);
        }
      }
    } catch (err) {
      console.warn('Error fetching questions:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Check URL query parameters for prefilling (e.g. from an assignment)
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const qTeacherId = params.get('teacherId');
    const qAsgId = params.get('assignmentId');
    const qAsgTitle = params.get('assignmentTitle');
    const qSubject = params.get('subject');

    if (qTeacherId || qAsgId) {
      if (qTeacherId) setSelectedTeacherId(qTeacherId);
      if (qAsgId) setAssignmentId(qAsgId);
      if (qAsgTitle) {
        setAssignmentTitle(qAsgTitle);
        setTitle(`Question regarding: ${qAsgTitle}`);
      }
      if (qSubject) setSubject(qSubject);
      setShowModal(true);
    }
  }, [location.search]);

  const handleAskQuestion = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    const chosenTeacher = teachers.find(t => t.id === selectedTeacherId);

    try {
      const res = await api.post('/student/questions', {
        teacherId: selectedTeacherId,
        teacherName: chosenTeacher ? chosenTeacher.name : 'Faculty Instructor',
        assignmentId,
        assignmentTitle,
        subject: subject || (chosenTeacher ? chosenTeacher.department : 'General Academic Doubt'),
        title: title.trim(),
        question: questionText.trim()
      });

      if (res.data.success) {
        setQuestions(prev => [res.data.question, ...prev]);
        setToastMsg(`✓ Your question was sent to ${chosenTeacher?.name || 'your instructor'}!`);
        setShowModal(false);
        resetForm();
      }
    } catch (err) {
      setToastMsg(err.response?.data?.message || 'Failed to submit question. Please try again.');
    } finally {
      setSubmitting(false);
      setTimeout(() => setToastMsg(''), 4000);
    }
  };

  const resetForm = () => {
    setTitle('');
    setQuestionText('');
    setSubject('');
    setAssignmentId('');
    setAssignmentTitle('');
  };

  const pendingCount = questions.filter(q => q.status === 'pending').length;
  const answeredCount = questions.filter(q => q.status === 'answered').length;

  const filteredQuestions = questions.filter(q => {
    const matchesFilter = filter === 'all' || q.status === filter;
    const query = searchQuery.toLowerCase();
    const matchesSearch =
      !query ||
      (q.title || '').toLowerCase().includes(query) ||
      (q.question || '').toLowerCase().includes(query) ||
      (q.teacherName || '').toLowerCase().includes(query) ||
      (q.subject || '').toLowerCase().includes(query) ||
      (q.assignmentTitle || '').toLowerCase().includes(query);
    return matchesFilter && matchesSearch;
  });

  return (
    <SidebarLayout>
      <div className="space-y-6 max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xl">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-400">Direct Academic Help</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                1-on-1 Faculty Q&A
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white mt-1">Ask Your Teachers Directly</h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl">
              Have doubts on homework, coursework assignments, or lecture concepts? Ask your faculty instructors directly and receive verified answers.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowModal(true)}
              className="py-3 px-5 bg-linear-to-r from-indigo-600 to-purple-600 hover:opacity-95 text-white text-xs font-bold rounded-xl shadow-lg shadow-indigo-600/25 transition flex items-center gap-2"
            >
              <span className="text-base">💬</span>
              <span>+ Ask a Question</span>
            </button>
          </div>
        </div>

        {/* Toast Alert */}
        {toastMsg && (
          <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm font-semibold flex items-center justify-between shadow-lg animate-fadeIn">
            <span>{toastMsg}</span>
            <button onClick={() => setToastMsg('')} className="text-emerald-400/70 hover:text-emerald-300 text-xs font-bold">
              ✕
            </button>
          </div>
        )}

        {/* Summary Badges & Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="glass-panel p-4 rounded-2xl border border-slate-800 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 font-bold text-lg">
              ❓
            </div>
            <div>
              <div className="text-xl font-bold text-white">{questions.length}</div>
              <div className="text-xs text-slate-400">Total Questions Asked</div>
            </div>
          </div>

          <div className="glass-panel p-4 rounded-2xl border border-slate-800 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 font-bold text-lg">
              ⏳
            </div>
            <div>
              <div className="text-xl font-bold text-amber-400">{pendingCount}</div>
              <div className="text-xs text-slate-400">Awaiting Teacher's Answer</div>
            </div>
          </div>

          <div className="glass-panel p-4 rounded-2xl border border-slate-800 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 font-bold text-lg">
              ✓
            </div>
            <div>
              <div className="text-xl font-bold text-emerald-400">{answeredCount}</div>
              <div className="text-xs text-slate-400">Answered by Instructors</div>
            </div>
          </div>
        </div>

        {/* Filter Tabs & Search Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
            {[
              { id: 'all', label: `All Questions (${questions.length})` },
              { id: 'pending', label: `Awaiting Reply (${pendingCount})` },
              { id: 'answered', label: `Answered (${answeredCount})` }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setFilter(tab.id)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                  filter === tab.id
                    ? 'bg-indigo-600 text-white shadow'
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
              placeholder="Search questions, subjects, teachers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3.5 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition"
            />
            <span className="absolute left-3 top-2.5 text-slate-500 text-xs">🔍</span>
          </div>
        </div>

        {/* Questions Feed */}
        {loading ? (
          <div className="py-20 text-center text-slate-400 space-y-2">
            <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-xs text-slate-400">Loading your questions...</p>
          </div>
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
                        <span className="px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                          {q.subject || 'Academic Doubt'}
                        </span>
                        {q.assignmentTitle && (
                          <span className="px-2.5 py-0.5 rounded-md text-[11px] font-medium bg-purple-500/10 text-purple-300 border border-purple-500/20">
                            📎 {q.assignmentTitle}
                          </span>
                        )}
                        <span className="text-[11px] text-slate-500">
                          Asked on {new Date(q.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <h2 className="text-base font-bold text-white pt-1">{q.title}</h2>
                    </div>

                    <div>
                      {isAnswered ? (
                        <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center gap-1.5 whitespace-nowrap">
                          <span>✓</span>
                          <span>Answered</span>
                        </span>
                      ) : (
                        <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30 flex items-center gap-1.5 whitespace-nowrap">
                          <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
                          <span>Awaiting Teacher</span>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Question Content */}
                  <div className="p-3.5 bg-slate-900/60 rounded-xl border border-slate-800/80 text-xs text-slate-200 leading-relaxed whitespace-pre-wrap">
                    {q.question}
                  </div>

                  {/* Target Instructor info */}
                  <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
                    <div className="flex items-center gap-2">
                      <span className="text-slate-500">Directed to:</span>
                      <strong className="text-slate-300 flex items-center gap-1">
                        <span>👨‍🏫</span>
                        <span>{q.teacherName}</span>
                      </strong>
                    </div>

                    {!isAnswered && (
                      <span className="text-[11px] text-slate-500 italic">
                        The instructor has been notified of your doubt.
                      </span>
                    )}
                  </div>

                  {/* Teacher Reply Section */}
                  {isAnswered && (
                    <div className="p-4 bg-emerald-500/5 border border-emerald-500/20 rounded-xl space-y-2 mt-3 animate-fadeIn">
                      <div className="flex items-center justify-between border-b border-emerald-500/15 pb-2">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-300 flex items-center justify-center font-bold text-xs">
                            ✓
                          </div>
                          <span className="text-xs font-bold text-emerald-300">
                            Instructor {q.teacherName}'s Answer
                          </span>
                        </div>
                        {q.repliedAt && (
                          <span className="text-[11px] text-slate-500">
                            Replied {new Date(q.repliedAt).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-200 leading-relaxed whitespace-pre-wrap pt-1">
                        {q.teacherReply}
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="glass-panel p-16 text-center text-slate-400 rounded-3xl border border-slate-800 space-y-3">
            <div className="text-4xl">💬</div>
            <h3 className="text-lg font-bold text-white">No questions found</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              {searchQuery || filter !== 'all'
                ? 'No inquiries match your current search or filter. Try clearing filters.'
                : 'You have not asked any questions to your teachers yet. Click below to submit your first question!'}
            </p>
            <button
              onClick={() => setShowModal(true)}
              className="mt-2 py-2 px-4 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl transition inline-block"
            >
              + Ask Your Teacher
            </button>
          </div>
        )}

        {/* Ask Question Modal */}
        {showModal && (
          <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
            <div className="glass-panel max-w-xl w-full p-6 rounded-2xl border border-slate-800 space-y-4 shadow-2xl max-h-[90vh] flex flex-col">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div>
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <span>👨‍🏫 Ask Your Instructor</span>
                  </h3>
                  <p className="text-xs text-slate-400">
                    Your question will be delivered directly to the instructor's coursework portal.
                  </p>
                </div>
                <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-white p-1 text-sm font-bold">
                  ✕
                </button>
              </div>

              <form onSubmit={handleAskQuestion} className="space-y-4 overflow-y-auto pr-1 flex-1">
                {/* Choose Teacher */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Select Instructor / Faculty Member *
                  </label>
                  <select
                    value={selectedTeacherId}
                    onChange={(e) => {
                      setSelectedTeacherId(e.target.value);
                      const t = teachers.find(item => item.id === e.target.value);
                      if (t && !subject) setSubject(t.department || 'Computer Science');
                    }}
                    required
                    className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-slate-100 text-xs focus:outline-none focus:border-indigo-500"
                  >
                    {teachers.map(t => (
                      <option key={t.id} value={t.id}>
                        {t.name} ({t.department || 'Faculty'}) - {t.email}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Subject */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Academic Subject
                    </label>
                    <input
                      type="text"
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      placeholder="e.g. Data Structures, OS, DBMS"
                      className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-slate-100 text-xs focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  {/* Related Assignment Title if applicable */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Related Assignment (Optional)
                    </label>
                    <input
                      type="text"
                      value={assignmentTitle}
                      onChange={(e) => setAssignmentTitle(e.target.value)}
                      placeholder="e.g. Assignment 1: Binary Trees"
                      className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-slate-100 text-xs focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                {/* Question Title */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Question Summary / Subject Line *
                  </label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Doubt regarding recursion base case in preorder traversal"
                    className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-slate-100 text-xs focus:outline-none focus:border-indigo-500"
                  />
                </div>

                {/* Detailed Question Body */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Detailed Explanation of Your Doubt *
                  </label>
                  <textarea
                    required
                    rows={5}
                    value={questionText}
                    onChange={(e) => setQuestionText(e.target.value)}
                    placeholder="Explain what you tried, the specific code or concept giving you trouble, or what clarification you need..."
                    className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-slate-100 text-xs focus:outline-none focus:border-indigo-500 resize-none font-sans"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="py-2 px-4 rounded-xl text-xs text-slate-400 hover:text-white bg-slate-900 border border-slate-800"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="py-2.5 px-5 bg-linear-to-r from-indigo-600 to-purple-600 hover:opacity-95 text-white text-xs font-bold rounded-xl shadow-lg shadow-indigo-600/25 transition disabled:opacity-50"
                  >
                    {submitting ? 'Submitting Question...' : 'Send Question to Teacher'}
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

export default StudentQuestions;
