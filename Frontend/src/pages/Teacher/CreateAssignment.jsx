// frontend/src/pages/Teacher/CreateAssignment.jsx
import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import SidebarLayout from '../../components/common/SidebarLayout';
import api from '../../services/api';

const SUBJECT_SUGGESTIONS = [
  'Computer Science',
  'Mathematics',
  'Physics',
  'Data Structures & Algorithms',
  'Operating Systems',
  'Database Management',
  'Software Engineering'
];

const CreateAssignment = () => {
  const navigate = useNavigate();

  const [courses, setCourses] = useState([]);
  const [courseId, setCourseId] = useState('');
  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState('Computer Science');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [totalPoints, setTotalPoints] = useState(100);
  const [resourceLink, setResourceLink] = useState('');
  const [attachmentName, setAttachmentName] = useState('');
  const [attachmentUrl, setAttachmentUrl] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await api.get('/teacher/courses');
        if (res.data.success && res.data.courses && res.data.courses.length > 0) {
          setCourses(res.data.courses);
          setCourseId(res.data.courses[0].id);
          if (res.data.courses[0].subject) {
            setSubject(res.data.courses[0].subject);
          }
        }
      } catch (err) {
        console.warn('Failed to fetch courses:', err.message);
      }
    };
    fetchCourses();
  }, []);

  const handleCourseChange = (selectedId) => {
    setCourseId(selectedId);
    const selected = courses.find(c => c.id === selectedId);
    if (selected && selected.subject) {
      setSubject(selected.subject);
    }
  };

  const handleFileAttachment = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAttachmentName(file.name);
      const reader = new FileReader();
      reader.onload = (event) => {
        setAttachmentUrl(event.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg('');
    setSuccessMsg('');

    if (!title.trim() || !subject.trim() || !description.trim() || !dueDate) {
      setErrorMsg('Please complete all required fields (Title, Subject, Due Date, and Description).');
      setSubmitting(false);
      return;
    }

    try {
      const res = await api.post('/teacher/assignments', {
        courseId: courseId || 'course_1',
        title: title.trim(),
        subject: subject.trim(),
        description: description.trim(),
        dueDate,
        totalPoints: Number(totalPoints) || 100,
        resourceLink: resourceLink.trim(),
        attachmentUrl,
        attachmentName
      });

      if (res.data.success) {
        setSuccessMsg('Assignment created and published to students successfully!');
        setTimeout(() => {
          navigate('/teacher/assignments');
        }, 1200);
      }
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Failed to create assignment. Please try again.';
      setErrorMsg(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SidebarLayout>
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <Link to="/teacher/assignments" className="hover:text-purple-400">Assignments</Link>
          <span>/</span>
          <span className="text-slate-200">Create Assignment</span>
        </div>

        <div>
          <h1 className="text-2xl font-black text-white">Create New Coursework Task</h1>
          <p className="text-sm text-slate-400">
            Publish an assignment, coding lab, or problem statement for students to complete and submit.
          </p>
        </div>

        <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 shadow-xl">
          {successMsg && (
            <div className="mb-6 p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm font-semibold flex items-center gap-2">
              <span>✓</span>
              <span>{successMsg}</span>
            </div>
          )}

          {errorMsg && (
            <div className="mb-6 p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-sm flex items-center gap-2">
              <span>⚠</span>
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              {/* Associated Course */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                  Associated Course <span className="text-rose-400">*</span>
                </label>
                {courses.length > 0 ? (
                  <select
                    value={courseId}
                    onChange={(e) => handleCourseChange(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-900/90 border border-slate-800 rounded-xl text-slate-100 text-sm focus:outline-none focus:border-purple-500 transition"
                  >
                    {courses.map(c => (
                      <option key={c.id} value={c.id}>
                        {c.code} - {c.title} ({c.subject})
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="text"
                    required
                    value={courseId}
                    onChange={(e) => setCourseId(e.target.value)}
                    placeholder="Enter Course ID (e.g. course_1)"
                    className="w-full px-4 py-3 bg-slate-900/90 border border-slate-800 rounded-xl text-slate-100 text-sm focus:outline-none focus:border-purple-500 transition"
                  />
                )}
                <p className="text-[11px] text-slate-400 mt-1">
                  Enrolled students of this course will be authorized to submit their solutions.
                </p>
              </div>

              {/* Title */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                  Assignment Title <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Data Structures & Algorithms - Balanced Trees & Hash Maps"
                  className="w-full px-4 py-3 bg-slate-900/90 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:border-purple-500 transition"
                />
              </div>

              {/* Subject Selection & Input */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                  Subject / Discipline <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="e.g. Computer Science, Mathematics"
                  className="w-full px-4 py-3 bg-slate-900/90 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:border-purple-500 transition"
                />
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {SUBJECT_SUGGESTIONS.map((item) => (
                    <button
                      key={item}
                      type="button"
                      onClick={() => setSubject(item)}
                      className={`text-[11px] px-2.5 py-1 rounded-lg transition ${
                        subject === item
                          ? 'bg-purple-600 text-white font-bold'
                          : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
                      }`}
                    >
                      {item}
                    </button>
                  ))}
                </div>
              </div>

              {/* Max Points & Due Date */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                    Maximum Points <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="number"
                    required
                    min={1}
                    max={1000}
                    value={totalPoints}
                    onChange={(e) => setTotalPoints(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-900/90 border border-slate-800 rounded-xl text-slate-100 font-mono text-sm focus:outline-none focus:border-purple-500 transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                    Submission Due Date & Time <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="datetime-local"
                    required
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-900/90 border border-slate-800 rounded-xl text-slate-100 text-sm focus:outline-none focus:border-purple-500 transition"
                  />
                </div>
              </div>

              {/* Instructions / Description */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                  Detailed Instructions & Guidelines <span className="text-rose-400">*</span>
                </label>
                <textarea
                  rows={6}
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Provide detailed problem specifications, requirements, grading rubric, code guidelines, or deliverables expected from students..."
                  className="w-full px-4 py-3 bg-slate-900/90 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:border-purple-500 leading-relaxed transition"
                />
              </div>

              {/* External Reference Link */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                  Reference Documentation / Lab URL (Optional)
                </label>
                <input
                  type="url"
                  value={resourceLink}
                  onChange={(e) => setResourceLink(e.target.value)}
                  placeholder="https://docs.oracle.com/en/java/ or https://developer.mozilla.org"
                  className="w-full px-4 py-3 bg-slate-900/90 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-500 text-xs focus:outline-none focus:border-purple-500 transition"
                />
              </div>

              {/* Optional File Attachment (Question Sheet / Starter Code) */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                  Attach Problem Sheet / Starter Template File (Optional)
                </label>
                <div className="border border-dashed border-slate-800 hover:border-purple-500/50 rounded-2xl p-4 transition bg-slate-900/40 relative">
                  <input
                    type="file"
                    onChange={handleFileAttachment}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  {attachmentName ? (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">📎</span>
                        <span className="text-xs font-bold text-purple-400">{attachmentName}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setAttachmentName('');
                          setAttachmentUrl('');
                        }}
                        className="text-xs text-rose-400 hover:underline px-2"
                      >
                        Remove
                      </button>
                    </div>
                  ) : (
                    <div className="text-center py-2 text-xs text-slate-400">
                      <span>Click or drag a problem statement PDF, ZIP, or code file to attach for students</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
              <button
                type="button"
                onClick={() => navigate('/teacher/assignments')}
                className="py-2.5 px-5 rounded-xl text-xs font-semibold text-slate-400 hover:text-white bg-slate-900 border border-slate-800 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="py-2.5 px-6 bg-linear-to-r from-purple-600 to-indigo-600 text-white text-xs font-bold rounded-xl shadow-lg shadow-purple-600/30 hover:opacity-95 transition disabled:opacity-50 flex items-center gap-2"
              >
                {submitting ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Publishing Task...</span>
                  </>
                ) : (
                  <span>Publish Assignment to Students</span>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </SidebarLayout>
  );
};

export default CreateAssignment;
