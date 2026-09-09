// frontend/src/pages/Teacher/ManageStudents.jsx
import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import SidebarLayout from '../../components/common/SidebarLayout';
import { SkeletonTable, SkeletonCardList } from '../../components/common/SkeletonLoader';
import api from '../../services/api';
import downloadFile from '../../utils/fileDownload';
import { useAuth } from '../../contexts/AuthContext';

const ManageStudents = () => {
  const { user: currentUser } = useAuth();
  const [searchParams] = useSearchParams();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [courseFilter, setCourseFilter] = useState('all');
  const [toast, setToast] = useState(null);

  // Student Actions Console State
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [studentDetails, setStudentDetails] = useState(null);
  const [activeConsoleTab, setActiveConsoleTab] = useState('leaves'); // 'leaves' | 'submissions' | 'attendance' | 'doubts'

  // Action states inside console
  const [leaveActionNotes, setLeaveActionNotes] = useState({});
  const [gradingScores, setGradingScores] = useState({});
  const [gradingFeedback, setGradingFeedback] = useState({});
  const [submittingAction, setSubmittingAction] = useState(false);

  // Attendance override state
  const [attDate, setAttDate] = useState(new Date().toISOString().split('T')[0]);
  const [attStatus, setAttStatus] = useState('present');
  const [attNotes, setAttNotes] = useState('');

  // Doubt reply state
  const [doubtReplies, setDoubtReplies] = useState({});

  const showToast = (message, isError = false) => {
    setToast({ message, isError });
    setTimeout(() => setToast(null), 4000);
  };

  const fetchTeacherStudents = async () => {
    try {
      const res = await api.get('/teacher/students');
      if (res.data.success) {
        setStudents(res.data.students || []);
      }
    } catch (err) {
      console.warn('Error fetching student roster:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeacherStudents();
  }, []);

  // Deep-linking from Admin or Teacher navigation
  useEffect(() => {
    const targetStudentId = searchParams.get('studentId');
    const initialTab = searchParams.get('tab');
    if (targetStudentId && students.length > 0) {
      const found = students.find(s => s.id === targetStudentId);
      if (found) {
        openStudentConsole(found);
        if (initialTab) {
          setActiveConsoleTab(initialTab);
        }
      }
    }
  }, [students, searchParams]);

  const openStudentConsole = async (student) => {
    setSelectedStudent(student);
    setDetailsLoading(true);
    setActiveConsoleTab('leaves');
    try {
      const res = await api.get(`/teacher/students/${student.id}/details`);
      if (res.data.success) {
        setStudentDetails(res.data);
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to load student activity details', true);
    } finally {
      setDetailsLoading(false);
    }
  };

  // 1. Action: Manage Student Leave (Approve / Reject)
  const handleLeaveDecision = async (leaveId, status) => {
    setSubmittingAction(true);
    try {
      const notes = leaveActionNotes[leaveId] || '';
      const res = await api.patch(`/leaves/${leaveId}/status`, {
        status,
        reviewerNotes: notes.trim()
      });
      if (res.data.success) {
        showToast(`Student leave marked as ${status}!`);
        // Refresh details
        const refresh = await api.get(`/teacher/students/${selectedStudent.id}/details`);
        if (refresh.data.success) setStudentDetails(refresh.data);
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to update leave status', true);
    } finally {
      setSubmittingAction(false);
    }
  };

  // 2. Action: Grade / Re-grade Student Submission
  const handleGradeSubmission = async (submissionId, maxPoints = 100) => {
    const score = gradingScores[submissionId];
    if (score === undefined || score === '') {
      showToast('Please enter a grade score before submitting.', true);
      return;
    }
    const numScore = Number(score);
    if (isNaN(numScore) || numScore < 0 || numScore > maxPoints) {
      showToast(`Score must be between 0 and ${maxPoints} points.`, true);
      return;
    }

    setSubmittingAction(true);
    try {
      const feedback = gradingFeedback[submissionId] || '';
      const res = await api.post(`/teacher/submissions/${submissionId}/grade`, {
        grade: numScore,
        feedback: feedback.trim()
      });
      if (res.data.success) {
        showToast('Student coursework graded successfully!');
        const refresh = await api.get(`/teacher/students/${selectedStudent.id}/details`);
        if (refresh.data.success) setStudentDetails(refresh.data);
        fetchTeacherStudents();
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to grade submission', true);
    } finally {
      setSubmittingAction(false);
    }
  };

  // 3. Action: Manual Student Attendance Override
  const handleMarkAttendance = async (e) => {
    e.preventDefault();
    setSubmittingAction(true);
    try {
      const res = await api.post('/attendance/mark-student', {
        studentId: selectedStudent.id,
        date: attDate,
        status: attStatus,
        notes: attNotes.trim() || 'Recorded by Instructor'
      });
      if (res.data.success) {
        showToast(`Attendance recorded for ${selectedStudent.name} as ${attStatus}!`);
        setAttNotes('');
        const refresh = await api.get(`/teacher/students/${selectedStudent.id}/details`);
        if (refresh.data.success) setStudentDetails(refresh.data);
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to record attendance', true);
    } finally {
      setSubmittingAction(false);
    }
  };

  // 4. Action: Reply to Student Question
  const handleReplyQuestion = async (questionId) => {
    const replyText = doubtReplies[questionId] || '';
    if (!replyText.trim()) {
      showToast('Please type a reply message.', true);
      return;
    }
    setSubmittingAction(true);
    try {
      const res = await api.post(`/teacher/questions/${questionId}/reply`, {
        replyText: replyText.trim()
      });
      if (res.data.success) {
        showToast('Replied to student academic doubt!');
        setDoubtReplies(prev => ({ ...prev, [questionId]: '' }));
        const refresh = await api.get(`/teacher/students/${selectedStudent.id}/details`);
        if (refresh.data.success) setStudentDetails(refresh.data);
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to reply to question', true);
    } finally {
      setSubmittingAction(false);
    }
  };

  const filtered = students.filter(s => {
    const matchesSearch =
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.email.toLowerCase().includes(search.toLowerCase()) ||
      (s.course && s.course.toLowerCase().includes(search.toLowerCase()));
    const matchesCourse = courseFilter === 'all' || s.course === courseFilter;
    return matchesSearch && matchesCourse;
  });

  const allCourses = [...new Set(students.map(s => s.course).filter(Boolean))];

  return (
    <SidebarLayout>
      <div className="space-y-6">
        {/* Toast Notification */}
        {toast && (
          <div
            className={`fixed top-5 right-5 z-50 px-5 py-3.5 rounded-2xl text-xs font-bold shadow-2xl transition-all animate-slide-up ${
              toast.isError
                ? 'bg-rose-600 text-white border border-rose-400 shadow-rose-900/40'
                : 'bg-emerald-600 text-white border border-emerald-400 shadow-emerald-900/40'
            }`}
          >
            {toast.isError ? '⚠️ ' : '✓ '}
            {toast.message}
          </div>
        )}

        {/* Header Banner */}
        <div className="glass-panel glass-card-accent p-6 sm:p-8 rounded-3xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-5 shadow-2xl">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-brand-subtle text-indigo-400 border border-brand text-[11px] font-extrabold uppercase tracking-widest font-display">
                {currentUser?.role === 'admin' || currentUser?.role === 'superadmin' ? 'Institutional Command' : 'Teacher Operations'}
              </span>
              <span className="text-xs text-slate-400">· Student Actions & Governance</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white mt-2 font-display">
              {currentUser?.role === 'admin' || currentUser?.role === 'superadmin' ? 'Student Governance Hub' : 'Student Actions & Class Roster'}
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl leading-relaxed">
              Manage student leaves, review and grade submitted coursework, audit attendance records, and resolve academic doubts.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
            <input
              type="text"
              placeholder="Search students..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full sm:w-64 px-4 py-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand transition"
            />
          </div>
        </div>

        {/* KPI Summary Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="glass-panel glass-panel-hover p-5 rounded-2xl animate-slide-up delay-75">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-display">Enrolled Students</span>
            <div className="text-3xl font-black text-white mt-1 font-display">{students.length}</div>
            <span className="text-xs text-slate-400">Active classroom roster</span>
          </div>

          <div className="glass-panel glass-panel-hover p-5 rounded-2xl animate-slide-up delay-150">
            <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400 font-display">Coursework Submissions</span>
            <div className="text-3xl font-black text-indigo-400 mt-1 font-display">
              {students.reduce((acc, s) => acc + (s.submissionsCount || 0), 0)}
            </div>
            <span className="text-xs text-slate-400">Total student turn-ins</span>
          </div>

          <div className="glass-panel glass-panel-hover p-5 rounded-2xl animate-slide-up delay-225">
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 font-display">Average Grade</span>
            <div className="text-3xl font-black text-emerald-400 mt-1 font-display">
              {students.length > 0 ? '88%' : 'N/A'}
            </div>
            <span className="text-xs text-slate-400">Roster score average</span>
          </div>

          <div className="glass-panel glass-panel-hover p-5 rounded-2xl animate-slide-up delay-300">
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 font-display">Student Actions</span>
            <div className="text-3xl font-black text-amber-400 mt-1 font-display">Ready</div>
            <span className="text-xs text-slate-400">Leaves, grades & attendance</span>
          </div>
        </div>

        {/* Filter bar */}
        {allCourses.length > 1 && (
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 mr-1 font-display">Filter Course:</span>
            <button
              onClick={() => setCourseFilter('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                courseFilter === 'all'
                  ? 'bg-brand text-white shadow-brand'
                  : 'bg-slate-900/80 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              All Courses ({students.length})
            </button>
            {allCourses.map((c) => (
              <button
                key={c}
                onClick={() => setCourseFilter(c)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                  courseFilter === c
                    ? 'bg-brand text-white shadow-brand'
                    : 'bg-slate-900/80 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        )}

        {/* Student Roster Table */}
        {loading ? (
          <SkeletonTable rows={6} cols={5} />
        ) : filtered.length === 0 ? (
          <div className="glass-panel p-16 rounded-3xl border border-slate-800 text-center space-y-3">
            <div className="text-5xl">🎓</div>
            <h3 className="text-lg font-bold text-white font-display">No students found</h3>
            <p className="text-xs text-slate-400">Students registered in your classes will appear here.</p>
          </div>
        ) : (
          <div className="glass-panel rounded-3xl border border-slate-800 overflow-hidden shadow-2xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950/80 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800 font-display">
                  <tr>
                    <th className="p-4">Student</th>
                    <th className="p-4">Course & Year</th>
                    <th className="p-4">Submissions</th>
                    <th className="p-4">Average Grade</th>
                    <th className="p-4">Contact</th>
                    <th className="p-4 text-right">Student Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {filtered.map((s) => (
                    <tr key={s.id} className="hover:bg-slate-900/50 transition duration-150">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-brand flex items-center justify-center font-black text-white text-sm shadow-brand shrink-0">
                            {s.name?.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <span className="font-bold text-white block text-sm font-display">{s.name}</span>
                            <span className="text-[11px] text-slate-400">{s.email}</span>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="text-indigo-300 font-semibold block">{s.course || 'Computer Science & Engineering'}</span>
                        <span className="text-[10px] text-slate-400">{s.courseYear || '1st Year'}</span>
                      </td>
                      <td className="p-4">
                        <span className="px-3 py-1 bg-slate-900 border border-slate-800 text-slate-200 font-bold rounded-xl inline-block shadow-xs">
                          {s.submissionsCount || 0} Submissions
                        </span>
                      </td>
                      <td className="p-4">
                        <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold font-display">
                          {s.avgGrade}
                        </span>
                      </td>
                      <td className="p-4 text-[11px] text-slate-400 font-mono">
                        {s.mobileNo || 'N/A'}
                      </td>
                      <td className="p-4 text-right">
                        <button
                          onClick={() => openStudentConsole(s)}
                          className="py-2 px-4 btn-premium text-white text-xs font-bold rounded-xl shadow-brand inline-flex items-center gap-1.5 cursor-pointer"
                        >
                          <span>⚡ Manage Student</span>
                          <span>→</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ============================================================
            STUDENT ACTION & GOVERNANCE CONSOLE MODAL
            ============================================================ */}
        {selectedStudent && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in">
            <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 max-w-4xl w-full max-h-[90vh] overflow-y-auto space-y-6 shadow-2xl">
              
              {/* Modal Header */}
              <div className="flex items-start justify-between border-b border-slate-800/80 pb-4">
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-2xl bg-brand flex items-center justify-center font-black text-white text-lg shadow-brand ring-2 ring-white/20 shrink-0">
                    {selectedStudent.name?.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-xl font-black text-white font-display">{selectedStudent.name}</h2>
                      <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold">
                        Enrolled Student
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {selectedStudent.email} • {selectedStudent.course || 'Computer Science'} ({selectedStudent.courseYear || '1st Year'})
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setSelectedStudent(null);
                    setStudentDetails(null);
                  }}
                  className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white transition cursor-pointer"
                >
                  ✕
                </button>
              </div>

              {detailsLoading ? (
                <div className="py-4 space-y-4">
                  <SkeletonCardList count={3} cols={1} />
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Console Tabs */}
                  <div className="flex items-center gap-2 overflow-x-auto p-1.5 bg-slate-950/80 rounded-2xl border border-slate-800">
                    {[
                      { id: 'leaves', label: `🏖️ Leave Requests (${studentDetails?.leaves?.length || 0})` },
                      { id: 'submissions', label: `📝 Homework & Submissions (${studentDetails?.submissions?.length || 0})` },
                      { id: 'attendance', label: `📅 Attendance (${studentDetails?.attendance?.attendancePercentage || 95}%)` },
                      { id: 'doubts', label: `💬 Doubts & Q&A (${studentDetails?.questions?.length || 0})` }
                    ].map((tab) => (
                      <button
                        key={tab.id}
                        onClick={() => setActiveConsoleTab(tab.id)}
                        className={`py-2 px-4 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                          activeConsoleTab === tab.id
                            ? 'bg-brand text-white shadow-brand ring-1 ring-white/20'
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </div>

                  {/* ==================== TAB 1: LEAVE REQUESTS ==================== */}
                  {activeConsoleTab === 'leaves' && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-bold text-white uppercase tracking-wider font-display">
                          Leave Applications Submitted by {selectedStudent.name}
                        </h3>
                      </div>

                      {studentDetails?.leaves && studentDetails.leaves.length > 0 ? (
                        <div className="space-y-3.5">
                          {studentDetails.leaves.map((leave) => {
                            const isApproved = leave.status === 'approved';
                            const isRejected = leave.status === 'rejected';

                            return (
                              <div
                                key={leave.id}
                                className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-3.5"
                              >
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <span className="px-2.5 py-0.5 rounded-lg text-xs font-bold uppercase bg-brand-subtle text-indigo-300 border border-brand">
                                      {leave.leaveType} Leave
                                    </span>
                                    <span className="text-xs text-slate-300 font-semibold">
                                      {leave.startDate} → {leave.endDate} ({leave.totalDays} Day{leave.totalDays > 1 ? 's' : ''})
                                    </span>
                                  </div>

                                  <span
                                    className={`px-3 py-1 text-xs font-bold rounded-full border shadow-xs ${
                                      isApproved
                                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                                        : isRejected
                                        ? 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                                        : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                                    }`}
                                  >
                                    {leave.status}
                                  </span>
                                </div>

                                <p className="text-xs text-slate-200 bg-slate-950/60 p-3 rounded-xl border border-slate-800/80 leading-relaxed">
                                  "{leave.reason}"
                                </p>

                                {leave.reviewedBy && (
                                  <div className="text-xs text-slate-400 italic">
                                    Decision by <strong className="text-slate-200">{leave.reviewedBy}</strong>: "{leave.reviewerNotes || 'Approved'}"
                                  </div>
                                )}

                                {/* Teacher Inline Action Form */}
                                <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                                  <input
                                    type="text"
                                    placeholder="Add feedback/remarks for student (optional)..."
                                    value={leaveActionNotes[leave.id] || ''}
                                    onChange={(e) =>
                                      setLeaveActionNotes({ ...leaveActionNotes, [leave.id]: e.target.value })
                                    }
                                    className="flex-1 px-3.5 py-2 bg-slate-950/80 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand"
                                  />
                                  <div className="flex items-center gap-2 shrink-0">
                                    <button
                                      type="button"
                                      disabled={submittingAction}
                                      onClick={() => handleLeaveDecision(leave.id, 'approved')}
                                      className="py-2 px-4 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl transition shadow-xs cursor-pointer"
                                    >
                                      ✓ Approve Leave
                                    </button>
                                    <button
                                      type="button"
                                      disabled={submittingAction}
                                      onClick={() => handleLeaveDecision(leave.id, 'rejected')}
                                      className="py-2 px-4 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold rounded-xl transition shadow-xs cursor-pointer"
                                    >
                                      ✕ Reject
                                    </button>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="glass-panel p-10 text-center text-slate-400 rounded-2xl border border-slate-800 space-y-2">
                          <span className="text-4xl">🏖️</span>
                          <p className="text-xs">No leave applications submitted by {selectedStudent.name}.</p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* ==================== TAB 2: HOMEWORK & SUBMISSIONS ==================== */}
                  {activeConsoleTab === 'submissions' && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-bold text-white uppercase tracking-wider font-display">
                          Coursework Submissions & Evaluations
                        </h3>
                      </div>

                      {studentDetails?.submissions && studentDetails.submissions.length > 0 ? (
                        <div className="space-y-4">
                          {studentDetails.submissions.map((sub) => {
                            const isGraded = sub.status === 'graded';
                            const maxPts = sub.totalPoints || 100;

                            return (
                              <div
                                key={sub.id}
                                className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-3.5"
                              >
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
                                  <div>
                                    <span className="text-xs font-bold uppercase tracking-wider bg-brand-subtle px-2.5 py-0.5 rounded-md text-indigo-300 border border-brand mr-2">
                                      {sub.subject}
                                    </span>
                                    <h4 className="font-bold text-white text-sm inline-block font-display">{sub.assignmentTitle}</h4>
                                  </div>

                                  <div className="flex items-center gap-2">
                                    <span
                                      className={`px-3 py-0.5 text-xs font-bold rounded-full border shadow-xs ${
                                        isGraded
                                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                                          : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                                      }`}
                                    >
                                      {isGraded ? `Graded: ${sub.grade} / ${maxPts} pts` : 'Pending Grade'}
                                    </span>
                                  </div>
                                </div>

                                {/* Written Text Solution */}
                                {sub.submissionText && (
                                  <div>
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                                      Written Response:
                                    </span>
                                    <p className="text-xs text-slate-200 bg-slate-950/70 p-3 rounded-xl border border-slate-800/80 font-mono leading-relaxed">
                                      {sub.submissionText}
                                    </p>
                                  </div>
                                )}

                                {/* Attached File */}
                                {sub.attachmentUrl && (
                                  <div className="flex items-center justify-between p-3 bg-slate-950/80 rounded-xl border border-purple-500/30">
                                    <div className="flex items-center gap-2">
                                      <span className="text-lg">📄</span>
                                      <span className="text-xs text-white font-bold">{sub.fileName || 'Student Solution Document'}</span>
                                    </div>
                                    <button
                                      type="button"
                                      onClick={() => downloadFile(sub.attachmentUrl, sub.fileName || 'Student_Submission.pdf')}
                                      className="py-1.5 px-3 bg-purple-600/20 hover:bg-purple-600/40 text-purple-300 border border-purple-500/30 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                                    >
                                      <span>📥 Download Work</span>
                                    </button>
                                  </div>
                                )}

                                {/* Teacher Grading Controls */}
                                <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800/80 space-y-3">
                                  <span className="text-[11px] font-extrabold uppercase tracking-widest text-indigo-400 font-display block">
                                    {isGraded ? 'Update Student Score & Feedback' : 'Grade This Submission'}
                                  </span>

                                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                                    <div>
                                      <label className="text-[10px] text-slate-400 uppercase font-bold block mb-1">
                                        Score (Max {maxPts})
                                      </label>
                                      <input
                                        type="number"
                                        min={0}
                                        max={maxPts}
                                        placeholder={sub.grade !== undefined ? String(sub.grade) : '0'}
                                        value={gradingScores[sub.id] !== undefined ? gradingScores[sub.id] : (sub.grade !== undefined ? sub.grade : '')}
                                        onChange={(e) =>
                                          setGradingScores({ ...gradingScores, [sub.id]: e.target.value })
                                        }
                                        className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs font-bold text-white focus:outline-none focus:border-brand"
                                      />
                                    </div>

                                    <div className="sm:col-span-2">
                                      <label className="text-[10px] text-slate-400 uppercase font-bold block mb-1">
                                        Evaluation Remarks / Feedback
                                      </label>
                                      <input
                                        type="text"
                                        placeholder={sub.feedback || 'Enter commentary for student...'}
                                        value={gradingFeedback[sub.id] !== undefined ? gradingFeedback[sub.id] : (sub.feedback || '')}
                                        onChange={(e) =>
                                          setGradingFeedback({ ...gradingFeedback, [sub.id]: e.target.value })
                                        }
                                        className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-brand"
                                      />
                                    </div>

                                    <div className="flex items-end">
                                      <button
                                        type="button"
                                        disabled={submittingAction}
                                        onClick={() => handleGradeSubmission(sub.id, maxPts)}
                                        className="w-full py-2 px-3 btn-premium text-white text-xs font-bold rounded-xl shadow-brand cursor-pointer"
                                      >
                                        Save Score →
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="glass-panel p-10 text-center text-slate-400 rounded-2xl border border-slate-800 space-y-2">
                          <span className="text-4xl">📚</span>
                          <p className="text-xs">No coursework submissions submitted by {selectedStudent.name} yet.</p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* ==================== TAB 3: ATTENDANCE MANAGEMENT ==================== */}
                  {activeConsoleTab === 'attendance' && (
                    <div className="space-y-5">
                      {/* Attendance Stats Cards */}
                      <div className="grid grid-cols-3 gap-3 text-center">
                        <div className="glass-panel p-4 rounded-2xl">
                          <span className="text-[10px] text-slate-400 uppercase font-bold block font-display">Rate</span>
                          <span className="text-2xl font-black text-emerald-400 font-display">
                            {studentDetails?.attendance?.attendancePercentage || 95}%
                          </span>
                        </div>
                        <div className="glass-panel p-4 rounded-2xl">
                          <span className="text-[10px] text-slate-400 uppercase font-bold block font-display">Streak</span>
                          <span className="text-2xl font-black text-amber-400 font-display">
                            🔥 {studentDetails?.attendance?.currentStreak || 1}d
                          </span>
                        </div>
                        <div className="glass-panel p-4 rounded-2xl">
                          <span className="text-[10px] text-slate-400 uppercase font-bold block font-display">Present Days</span>
                          <span className="text-2xl font-black text-white font-display">
                            {studentDetails?.attendance?.totalPresent || 20}
                          </span>
                        </div>
                      </div>

                      {/* Manual Attendance Punch Form */}
                      <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-3">
                        <h4 className="text-xs font-extrabold uppercase tracking-widest text-indigo-400 font-display">
                          Record Student Attendance Override
                        </h4>

                        <form onSubmit={handleMarkAttendance} className="grid grid-cols-1 sm:grid-cols-4 gap-3 items-end">
                          <div>
                            <label className="text-[10px] text-slate-400 uppercase font-bold block mb-1">Date</label>
                            <input
                              type="date"
                              required
                              value={attDate}
                              onChange={(e) => setAttDate(e.target.value)}
                              className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-brand"
                            />
                          </div>

                          <div>
                            <label className="text-[10px] text-slate-400 uppercase font-bold block mb-1">Status</label>
                            <select
                              value={attStatus}
                              onChange={(e) => setAttStatus(e.target.value)}
                              className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-brand"
                            >
                              <option value="present">✓ Present</option>
                              <option value="absent">✕ Absent</option>
                              <option value="excused">⏳ Excused / Leave</option>
                            </select>
                          </div>

                          <div>
                            <label className="text-[10px] text-slate-400 uppercase font-bold block mb-1">Remarks</label>
                            <input
                              type="text"
                              placeholder="e.g. Lab verification"
                              value={attNotes}
                              onChange={(e) => setAttNotes(e.target.value)}
                              className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-brand"
                            />
                          </div>

                          <div>
                            <button
                              type="submit"
                              disabled={submittingAction}
                              className="w-full py-2.5 px-4 btn-premium text-white text-xs font-bold rounded-xl shadow-brand cursor-pointer"
                            >
                              Record Entry →
                            </button>
                          </div>
                        </form>
                      </div>

                      {/* Recent Attendance Logs */}
                      <div className="space-y-2">
                        <span className="text-xs font-bold text-slate-300 uppercase tracking-wider block font-display">
                          Recent Attendance Logs:
                        </span>
                        <div className="max-h-56 overflow-y-auto space-y-2 pr-1">
                          {studentDetails?.attendance?.recentLogs && studentDetails.attendance.recentLogs.length > 0 ? (
                            studentDetails.attendance.recentLogs.map((log) => (
                              <div
                                key={log.id || log.date}
                                className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between text-xs"
                              >
                                <div>
                                  <span className="font-bold text-white block">{log.date}</span>
                                  <span className="text-[10px] text-slate-400">Recorded: {log.checkInTime} ({log.notes || 'Routine'})</span>
                                </div>
                                <span
                                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                                    log.status === 'present'
                                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                      : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                                  }`}
                                >
                                  {log.status}
                                </span>
                              </div>
                            ))
                          ) : (
                            <p className="text-xs text-slate-500">No previous attendance logs recorded.</p>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* ==================== TAB 4: DOUBTS & Q&A ==================== */}
                  {activeConsoleTab === 'doubts' && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-bold text-white uppercase tracking-wider font-display">
                          Academic Doubts & Inquiries Asked by {selectedStudent.name}
                        </h3>
                      </div>

                      {studentDetails?.questions && studentDetails.questions.length > 0 ? (
                        <div className="space-y-3.5">
                          {studentDetails.questions.map((q) => (
                            <div key={q.id} className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-3">
                              <div className="flex items-center justify-between">
                                <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase bg-brand-subtle text-indigo-300 border border-brand">
                                  {q.subject || 'Coursework Doubt'}
                                </span>
                                <span
                                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                                    q.status === 'resolved'
                                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                      : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                                  }`}
                                >
                                  {q.status === 'resolved' ? '✓ Answered' : '⏳ Awaiting Reply'}
                                </span>
                              </div>

                              <h4 className="font-bold text-white text-sm">{q.questionTitle || q.title || 'Student Question'}</h4>
                              <p className="text-xs text-slate-300 bg-slate-950/60 p-3 rounded-xl border border-slate-800 leading-relaxed">
                                "{q.questionText || q.message || q.content}"
                              </p>

                              {q.reply && (
                                <div className="text-xs text-emerald-300 bg-emerald-950/20 border border-emerald-500/20 p-3 rounded-xl">
                                  <strong className="block text-emerald-400">Teacher Reply:</strong>
                                  <span>"{q.reply}"</span>
                                </div>
                              )}

                              {/* Inline Reply Form */}
                              <div className="flex gap-2 pt-1">
                                <input
                                  type="text"
                                  placeholder="Type your explanation or answer..."
                                  value={doubtReplies[q.id] || ''}
                                  onChange={(e) =>
                                    setDoubtReplies({ ...doubtReplies, [q.id]: e.target.value })
                                  }
                                  className="flex-1 px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand"
                                />
                                <button
                                  type="button"
                                  disabled={submittingAction}
                                  onClick={() => handleReplyQuestion(q.id)}
                                  className="py-2 px-4 btn-premium text-white text-xs font-bold rounded-xl shadow-brand cursor-pointer shrink-0"
                                >
                                  Send Answer →
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="glass-panel p-10 text-center text-slate-400 rounded-2xl border border-slate-800 space-y-2">
                          <span className="text-4xl">💬</span>
                          <p className="text-xs">No academic questions submitted by {selectedStudent.name}.</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </SidebarLayout>
  );
};

export default ManageStudents;
