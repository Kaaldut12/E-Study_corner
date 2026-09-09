// frontend/src/pages/Teacher/ViewSubmissions.jsx
import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import SidebarLayout from '../../components/common/SidebarLayout';
import { SkeletonCardList } from '../../components/common/SkeletonLoader';
import api from '../../services/api';
import downloadFile from '../../utils/fileDownload';

const QUICK_FEEDBACK_TEMPLATES = [
  'Excellent work! Thorough analysis and clean implementation.',
  'Well structured solution. Handled primary requirements accurately.',
  'Good effort. Please pay closer attention to edge cases and optimization.',
  'Code is functioning properly. Recommend adding more descriptive comments.',
  'Outstanding! Meets all evaluation criteria with high quality.'
];

const ViewSubmissions = () => {
  const { assignmentId } = useParams();
  const navigate = useNavigate();

  const [assignment, setAssignment] = useState(null);
  const [allAssignments, setAllAssignments] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');

  // Selected submission for grading modal
  const [selectedSub, setSelectedSub] = useState(null);
  const [gradeInput, setGradeInput] = useState('');
  const [feedbackInput, setFeedbackInput] = useState('');
  const [grading, setGrading] = useState(false);
  const [toastMsg, setToastMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Load all assignments list for switching
  useEffect(() => {
    const loadAssignmentsList = async () => {
      try {
        const res = await api.get('/teacher/assignments');
        if (res.data.success) {
          setAllAssignments(res.data.assignments);
        }
      } catch (err) {
        console.warn('Could not load assignments list:', err);
      }
    };
    loadAssignmentsList();
  }, []);

  // Fetch submissions for currently selected assignment
  useEffect(() => {
    const fetchSubmissionsData = async () => {
      setLoading(true);
      try {
        let currentId = assignmentId;
        if (!currentId || currentId === 'all') {
          const asgRes = await api.get('/teacher/assignments');
          if (asgRes.data.success && asgRes.data.assignments.length > 0) {
            currentId = asgRes.data.assignments[0].id;
          }
        }

        if (currentId) {
          const res = await api.get(`/teacher/submissions/${currentId}`);
          if (res.data.success) {
            setAssignment(res.data.assignment);
            setSubmissions(res.data.submissions || []);
          }
        }
      } catch (err) {
        console.warn('Teacher submissions fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchSubmissionsData();
  }, [assignmentId]);

  const openGradeModal = (sub) => {
    setSelectedSub(sub);
    setGradeInput(sub.grade !== null && sub.grade !== undefined ? sub.grade : '');
    setFeedbackInput(sub.feedback || '');
    setErrorMsg('');
  };

  const handleGradeSubmit = async (e) => {
    e.preventDefault();
    if (!selectedSub) return;
    setGrading(true);
    setErrorMsg('');

    const maxPts = assignment?.totalPoints || selectedSub.totalPoints || 100;
    const numericGrade = Number(gradeInput);

    if (isNaN(numericGrade) || numericGrade < 0 || numericGrade > maxPts) {
      setErrorMsg(`Grade must be a number between 0 and ${maxPts}.`);
      setGrading(false);
      return;
    }

    try {
      const res = await api.post('/teacher/grade-submission', {
        submissionId: selectedSub.id,
        grade: numericGrade,
        feedback: feedbackInput.trim()
      });

      if (res.data.success) {
        setSubmissions((prev) =>
          prev.map((s) => (s.id === selectedSub.id ? res.data.submission : s))
        );
        setToastMsg(`Successfully graded ${selectedSub.studentName}'s work!`);
        setSelectedSub(null);
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || err.message || 'Error saving grade.');
    } finally {
      setGrading(false);
      setTimeout(() => setToastMsg(''), 4000);
    }
  };

  const filteredSubmissions = submissions.filter((sub) => {
    if (filterStatus === 'pending') return sub.status === 'submitted';
    if (filterStatus === 'graded') return sub.status === 'graded';
    return true;
  });

  const pendingCount = submissions.filter((s) => s.status === 'submitted').length;
  const gradedCount = submissions.filter((s) => s.status === 'graded').length;

  return (
    <SidebarLayout>
      <div className="space-y-6">
        {/* Navigation & Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs text-slate-400 mb-1">
              <Link to="/teacher/assignments" className="hover:text-purple-400">Assignments Hub</Link>
              <span>/</span>
              <span className="text-slate-200">Submissions Evaluation</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white">Student Submissions Review</h1>
            {assignment && (
              <div className="flex flex-wrap items-center gap-2 mt-1.5">
                <span className="px-2.5 py-0.5 rounded-lg bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs font-bold">
                  {assignment.subject}
                </span>
                <span className="text-sm font-semibold text-slate-200">{assignment.title}</span>
                <span className="text-xs text-slate-400">• Max: {assignment.totalPoints || 100} pts</span>
              </div>
            )}
          </div>

          {/* Switch Assignment Dropdown */}
          {allAssignments.length > 1 && (
            <div className="flex items-center gap-2">
              <label className="text-xs font-semibold text-slate-400 whitespace-nowrap">Switch Task:</label>
              <select
                value={assignment?.id || assignmentId || ''}
                onChange={(e) => navigate(`/teacher/submissions/${e.target.value}`)}
                className="px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-purple-500 font-medium"
              >
                {allAssignments.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.title} ({a.subject})
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {toastMsg && (
          <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm font-semibold flex items-center gap-2">
            <span>✓</span>
            <span>{toastMsg}</span>
          </div>
        )}

        {/* Filter Tabs & Summary Counts */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setFilterStatus('all')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${
                filterStatus === 'all'
                  ? 'bg-purple-600 text-white shadow'
                  : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              All Submissions ({submissions.length})
            </button>
            <button
              onClick={() => setFilterStatus('pending')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                filterStatus === 'pending'
                  ? 'bg-amber-600 text-white shadow'
                  : 'bg-slate-900 text-amber-400/80 hover:text-amber-300 border border-slate-800'
              }`}
            >
              <span>Needs Grading ({pendingCount})</span>
              {pendingCount > 0 && <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>}
            </button>
            <button
              onClick={() => setFilterStatus('graded')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${
                filterStatus === 'graded'
                  ? 'bg-emerald-600 text-white shadow'
                  : 'bg-slate-900 text-emerald-400/80 hover:text-emerald-300 border border-slate-800'
              }`}
            >
              Graded ({gradedCount})
            </button>
          </div>

          <span className="text-xs text-slate-400">
            Due Date: <strong className="text-slate-300">{assignment ? new Date(assignment.dueDate).toLocaleDateString() : 'N/A'}</strong>
          </span>
        </div>

        {/* Submissions List */}
        {loading ? (
          <SkeletonCardList count={3} cols={1} />
        ) : filteredSubmissions.length > 0 ? (
          <div className="grid grid-cols-1 gap-5">
            {filteredSubmissions.map((sub) => {
              const maxPoints = sub.totalPoints || assignment?.totalPoints || 100;
              const isGraded = sub.status === 'graded';
              const percentage = isGraded && maxPoints > 0 ? Math.round((sub.grade / maxPoints) * 100) : null;

              return (
                <div
                  key={sub.id}
                  className={`glass-panel p-6 sm:p-7 rounded-3xl border transition duration-150 space-y-5 shadow-lg ${
                    isGraded ? 'border-slate-800' : 'border-amber-500/30'
                  }`}
                >
                  {/* Student Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-2xl bg-linear-to-br from-purple-600 to-indigo-600 text-white font-extrabold flex items-center justify-center text-sm shadow">
                        {sub.studentName ? sub.studentName.charAt(0).toUpperCase() : 'S'}
                      </div>
                      <div>
                        <h2 className="text-base font-bold text-white leading-tight">{sub.studentName}</h2>
                        <span className="text-xs text-slate-400">
                          Turned in on {new Date(sub.submittedAt).toLocaleString()}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      {isGraded ? (
                        <div className="text-right">
                          <span className="px-3 py-1 text-xs font-bold rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 inline-block">
                            Graded: {sub.grade} / {maxPoints} pts ({percentage}%)
                          </span>
                        </div>
                      ) : (
                        <span className="px-3 py-1 text-xs font-bold rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
                          <span>Awaiting Grading</span>
                        </span>
                      )}

                      <button
                        onClick={() => openGradeModal(sub)}
                        className={`py-2 px-4 text-xs font-bold rounded-xl shadow transition ${
                          isGraded
                            ? 'bg-slate-800 hover:bg-slate-700 text-slate-200'
                            : 'bg-linear-to-r from-purple-600 to-indigo-600 hover:opacity-95 text-white'
                        }`}
                      >
                        {isGraded ? 'Edit Evaluation' : 'Grade & Give Feedback'}
                      </button>
                    </div>
                  </div>

                  {/* Student Answer Content */}
                  {sub.submissionText && (
                    <div className="space-y-2">
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
                        Written Response / Code Implementation
                      </span>
                      <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 text-slate-200 text-sm leading-relaxed whitespace-pre-wrap font-mono text-[13px]">
                        {sub.submissionText}
                      </div>
                    </div>
                  )}

                  {/* Uploaded File Attachment */}
                  {sub.attachmentUrl && (
                    <div className="p-4 bg-slate-950/80 rounded-2xl border border-slate-800/90 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-400 font-bold border border-purple-500/30 flex items-center justify-center text-lg shrink-0">
                          📄
                        </div>
                        <div>
                          <span className="font-bold text-white block">
                            {sub.fileName || 'Uploaded_Assignment_Document.pdf'}
                          </span>
                          <span className="text-[11px] text-slate-400 font-mono">
                            {sub.fileSize || 'Attachment file'} • Student Upload
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => downloadFile(sub.attachmentUrl, sub.fileName || 'Student_Submitted_Homework.pdf')}
                          className="py-2 px-4 bg-linear-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold rounded-xl shadow hover:opacity-95 transition flex items-center gap-1.5 cursor-pointer"
                        >
                          <span>📥 Download Student Document</span>
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Graded Feedback Banner */}
                  {isGraded && sub.feedback && (
                    <div className="p-4 rounded-2xl bg-purple-950/30 border border-purple-500/20 text-xs text-slate-200 space-y-1">
                      <div className="flex items-center justify-between text-purple-400 font-bold">
                        <span>Instructor Commentary ({sub.gradedBy || 'You'}):</span>
                        {sub.gradedAt && <span>{new Date(sub.gradedAt).toLocaleDateString()}</span>}
                      </div>
                      <p className="text-slate-300 leading-relaxed italic">"{sub.feedback}"</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="glass-panel p-16 text-center text-slate-400 rounded-3xl border border-slate-800 space-y-3">
            <div className="text-4xl">📬</div>
            <h3 className="text-lg font-bold text-white">No submissions matching criteria</h3>
            <p className="text-xs text-slate-400">
              {filterStatus !== 'all'
                ? 'Try viewing all submissions instead.'
                : 'No students have turned in coursework for this assignment yet.'}
            </p>
          </div>
        )}

        {/* Grading Modal */}
        {selectedSub && (
          <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
            <div className="glass-panel max-w-lg w-full p-6 sm:p-7 rounded-3xl border border-slate-800 space-y-5 shadow-2xl animate-in fade-in zoom-in duration-150">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3.5">
                <div>
                  <h3 className="text-lg font-black text-white">
                    Grade Submission: <span className="text-purple-400">{selectedSub.studentName}</span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Assignment: {assignment?.title || 'Coursework'}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedSub(null)}
                  className="text-slate-400 hover:text-white p-1 text-lg font-bold"
                >
                  ✕
                </button>
              </div>

              {errorMsg && (
                <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs">
                  ⚠ {errorMsg}
                </div>
              )}

              <form onSubmit={handleGradeSubmit} className="space-y-4">
                {/* Score Input */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-300">
                      Score (Out of {selectedSub.totalPoints || assignment?.totalPoints || 100})
                    </label>
                    {gradeInput !== '' && !isNaN(Number(gradeInput)) && (
                      <span className="text-xs font-mono font-bold text-purple-400">
                        {Math.round((Number(gradeInput) / (selectedSub.totalPoints || assignment?.totalPoints || 100)) * 100)}%
                      </span>
                    )}
                  </div>
                  <input
                    type="number"
                    required
                    min={0}
                    max={selectedSub.totalPoints || assignment?.totalPoints || 100}
                    value={gradeInput}
                    onChange={(e) => setGradeInput(e.target.value)}
                    placeholder="e.g. 95"
                    className="w-full px-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-slate-100 font-mono text-sm focus:outline-none focus:border-purple-500 transition"
                  />
                </div>

                {/* Quick Feedback Chips */}
                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                    Quick Feedback Phrases:
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {QUICK_FEEDBACK_TEMPLATES.map((tmpl, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setFeedbackInput(tmpl)}
                        className="text-[10px] px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 text-left transition"
                      >
                        + {tmpl.slice(0, 45)}...
                      </button>
                    ))}
                  </div>
                </div>

                {/* Written Feedback Textarea */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                    Instructor Written Feedback & Notes
                  </label>
                  <textarea
                    rows={4}
                    value={feedbackInput}
                    onChange={(e) => setFeedbackInput(e.target.value)}
                    placeholder="Provide constructive commentary on student logic, structure, formatting, strengths, and areas for improvement..."
                    className="w-full px-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-slate-100 text-xs focus:outline-none focus:border-purple-500 leading-relaxed transition"
                  />
                </div>

                {/* Modal Buttons */}
                <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => setSelectedSub(null)}
                    className="py-2.5 px-4 rounded-xl text-xs font-semibold text-slate-400 hover:text-white bg-slate-900 border border-slate-800 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={grading}
                    className="py-2.5 px-6 bg-linear-to-r from-purple-600 to-indigo-600 text-white text-xs font-bold rounded-xl shadow-lg shadow-purple-600/30 hover:opacity-95 transition disabled:opacity-50 flex items-center gap-2"
                  >
                    {grading ? (
                      <>
                        <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Saving...</span>
                      </>
                    ) : (
                      <span>Save & Notify Student</span>
                    )}
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

export default ViewSubmissions;
