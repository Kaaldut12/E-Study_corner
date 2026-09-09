// frontend/src/pages/Student/SubmitAssignment.jsx
import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import SidebarLayout from '../../components/common/SidebarLayout';
import api from '../../services/api';
import downloadFile from '../../utils/fileDownload';

const SubmitAssignment = () => {
  const { assignmentId } = useParams();
  const navigate = useNavigate();

  const [assignment, setAssignment] = useState(null);
  const [submissionText, setSubmissionText] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileName, setFileName] = useState('');
  const [fileSize, setFileSize] = useState('');
  const [attachmentUrl, setAttachmentUrl] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isDragOver, setIsDragOver] = useState(false);

  const processFile = (file) => {
    if (!file) return;

    if (file.size > 25 * 1024 * 1024) {
      setErrorMsg('File size exceeds the 25MB limit. Please attach a smaller file or provide a cloud link.');
      return;
    }

    setSelectedFile(file);
    setFileName(file.name);
    const sizeInMB = file.size / (1024 * 1024);
    setFileSize(sizeInMB < 1 ? `${(file.size / 1024).toFixed(1)} KB` : `${sizeInMB.toFixed(2)} MB`);

    const reader = new FileReader();
    reader.onload = (event) => {
      setAttachmentUrl(event.target.result);
    };
    reader.readAsDataURL(file);
    setErrorMsg('');
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  };

  useEffect(() => {
    const fetchAssignmentDetails = async () => {
      try {
        const res = await api.get('/student/assignments');
        if (res.data.success) {
          const target = res.data.assignments.find((a) => a.id === assignmentId);
          setAssignment(target || null);
          if (target?.submission) {
            setSubmissionText(target.submission.submissionText || '');
            setAttachmentUrl(target.submission.attachmentUrl || '');
            setFileName(target.submission.fileName || '');
            setFileSize(target.submission.fileSize || '');
          }
        }
      } catch (err) {
        console.warn('Error loading assignment:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAssignmentDetails();
  }, [assignmentId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg('');
    setSuccessMsg('');

    if (!submissionText.trim() && !attachmentUrl && !fileName) {
      setErrorMsg('Please provide a written response or upload a coursework document before submitting.');
      setSubmitting(false);
      return;
    }

    try {
      const res = await api.post('/student/submit', {
        assignmentId,
        submissionText: submissionText.trim(),
        attachmentUrl,
        fileName: fileName || (selectedFile ? selectedFile.name : ''),
        fileSize: fileSize || ''
      });

      if (res.data.success) {
        setSuccessMsg('Your assignment has been submitted successfully to your instructor!');
        setTimeout(() => {
          navigate('/student/assignments');
        }, 1500);
      }
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Submission failed. Please try again.';
      setErrorMsg(msg);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <SidebarLayout>
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </SidebarLayout>
    );
  }

  if (!assignment) {
    return (
      <SidebarLayout>
        <div className="glass-panel p-10 rounded-3xl text-center max-w-lg mx-auto border border-slate-800 space-y-3">
          <div className="text-4xl">⚠️</div>
          <h2 className="text-xl font-bold text-white">Assignment Not Found</h2>
          <p className="text-sm text-slate-400">The requested coursework could not be located or may have been deleted.</p>
          <Link to="/student/assignments" className="inline-block pt-2 text-xs font-bold text-indigo-400 hover:underline">
            ← Return to All Assignments
          </Link>
        </div>
      </SidebarLayout>
    );
  }

  const existingSub = assignment.submission;
  const isGraded = existingSub?.status === 'graded';
  const maxPts = assignment.totalPoints || 100;
  const scorePct = isGraded ? Math.round((existingSub.grade / maxPts) * 100) : null;

  return (
    <SidebarLayout>
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <Link to="/student/assignments" className="hover:text-indigo-400">Assignments</Link>
          <span>/</span>
          <span className="text-slate-200">Submit Coursework</span>
        </div>

        {/* Graded Evaluation Banner (If Graded) */}
        {isGraded && (
          <div className="glass-panel p-6 rounded-3xl border border-emerald-500/30 bg-emerald-950/20 space-y-3 shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-emerald-500/20 pb-3">
              <div className="flex items-center gap-2">
                <span className="text-xl">🏆</span>
                <h3 className="text-base font-extrabold text-white">Evaluation Results & Score</h3>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-black text-emerald-400">
                  {existingSub.grade} <span className="text-xs text-slate-400 font-normal">/ {maxPts} pts</span>
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold">
                  {scorePct}%
                </span>
              </div>
            </div>

            {existingSub.feedback && (
              <div className="space-y-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-300">
                  Instructor Commentary ({existingSub.gradedBy || 'Instructor'}):
                </span>
                <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-emerald-500/20 text-slate-200 text-xs leading-relaxed italic">
                  "{existingSub.feedback}"
                </div>
              </div>
            )}
          </div>
        )}

        {/* Assignment Briefing Header */}
        <div className="glass-panel p-6 sm:p-7 rounded-3xl border border-slate-800 space-y-4 shadow-lg">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="px-3 py-1 text-xs font-bold rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              {assignment.subject}
            </span>
            <span className="text-xs font-semibold text-slate-400">
              Maximum Points: <strong className="text-indigo-400 font-mono">{maxPts} pts</strong>
            </span>
          </div>

          <div>
            <h1 className="text-xl sm:text-2xl font-black text-white">{assignment.title}</h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-2 leading-relaxed bg-slate-900/70 p-4 rounded-2xl border border-slate-800">
              {assignment.description}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-slate-400 pt-2 border-t border-slate-800">
            <span>Instructor: <strong className="text-slate-200">{assignment.teacherName}</strong></span>
            <div className="flex items-center gap-3">
              <Link
                to={`/student/questions?teacherId=${assignment.teacherId || ''}&assignmentId=${assignment.id}&assignmentTitle=${encodeURIComponent(assignment.title)}&subject=${encodeURIComponent(assignment.subject || '')}`}
                className="text-indigo-400 hover:text-indigo-300 font-bold inline-flex items-center gap-1 transition"
              >
                <span>💬 Ask Instructor Doubt</span>
              </Link>
              <span>
                Due Date: <strong className="text-amber-400">{new Date(assignment.dueDate).toLocaleString()}</strong>
              </span>
            </div>
          </div>

          {/* Reference Link / Attachment if provided by teacher */}
          {(assignment.resourceLink || assignment.attachmentUrl) && (
            <div className="flex flex-wrap items-center gap-4 pt-1 text-xs border-t border-slate-800/60">
              {assignment.resourceLink && (
                <a
                  href={assignment.resourceLink}
                  target="_blank"
                  rel="noreferrer"
                  className="text-indigo-400 hover:underline inline-flex items-center gap-1 font-medium"
                >
                  <span>🔗 Reference Documentation</span>
                </a>
              )}
              {assignment.attachmentUrl && (
                <button
                  type="button"
                  onClick={() => downloadFile(assignment.attachmentUrl, assignment.attachmentName || `${assignment.title}_Problem_Sheet.pdf`)}
                  className="py-1.5 px-3 bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/30 rounded-xl text-xs font-semibold transition inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <span>📥 Download Question Sheet / Homework Document</span>
                </button>
              )}
            </div>
          )}
        </div>

        {/* Submission Form */}
        <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 shadow-xl space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white">
              {existingSub ? (isGraded ? 'Your Submitted Solution' : 'Update Your Submission') : 'Submit Your Solution'}
            </h2>
            {existingSub && !isGraded && (
              <span className="text-[11px] font-bold text-indigo-400 bg-indigo-500/10 px-3 py-1 rounded-full border border-indigo-500/20">
                Submitted on {new Date(existingSub.submittedAt).toLocaleDateString()}
              </span>
            )}
          </div>

          {successMsg && (
            <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm font-semibold flex items-center gap-2">
              <span>✓</span>
              <span>{successMsg}</span>
            </div>
          )}

          {errorMsg && (
            <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-sm flex items-center gap-2">
              <span>⚠</span>
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Written Answer or Code */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                Written Response / Source Code Implementation / Explanation
              </label>
              <textarea
                rows={7}
                value={submissionText}
                onChange={(e) => setSubmissionText(e.target.value)}
                placeholder="Type your solution, algorithm implementation, code snippets, or written findings here..."
                className="w-full px-4 py-3 bg-slate-900/90 border border-slate-800 rounded-2xl text-slate-100 placeholder-slate-500 text-xs font-mono focus:outline-none focus:border-indigo-500 leading-relaxed transition"
              />
            </div>

            {/* Document File Uploader */}
            <div className="space-y-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300">
                Upload Assignment Document / Project File (PDF, DOCX, ZIP, Source Code, Images)
              </label>

              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragOver(true);
                }}
                onDragLeave={() => setIsDragOver(false)}
                onDrop={handleDrop}
                className={`border-2 border-dashed rounded-2xl p-6 text-center transition bg-slate-900/60 relative ${
                  isDragOver ? 'border-indigo-500 bg-indigo-500/10' : 'border-slate-800 hover:border-indigo-500/50'
                }`}
              >
                <input
                  type="file"
                  onChange={handleFileChange}
                  accept=".pdf,.doc,.docx,.zip,.rar,.png,.jpg,.jpeg,.txt,.cpp,.java,.py,.js,.ts,.html,.css"
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />

                {fileName ? (
                  <div className="flex items-center justify-between p-3.5 bg-slate-950 rounded-2xl border border-indigo-500/30 text-left">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-xl bg-indigo-500/20 text-indigo-400 font-black flex items-center justify-center text-xl shrink-0">
                        📄
                      </div>
                      <div>
                        <span className="font-bold text-white text-xs block truncate max-w-xs">{fileName}</span>
                        <span className="text-[11px] text-slate-400 font-mono">
                          {fileSize || 'Document file'} • Attached for Instructor Review
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {attachmentUrl && (
                        <button
                          type="button"
                          onClick={() => downloadFile(attachmentUrl, fileName || 'My_Submitted_Work.pdf')}
                          className="text-xs text-indigo-400 hover:text-indigo-300 font-bold underline px-2 cursor-pointer"
                        >
                          Download My File
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedFile(null);
                          setFileName('');
                          setFileSize('');
                          setAttachmentUrl('');
                        }}
                        className="text-xs text-rose-400 hover:underline px-2 font-semibold"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2 pointer-events-none">
                    <div className="w-12 h-12 bg-indigo-500/10 text-indigo-400 rounded-2xl flex items-center justify-center text-2xl mx-auto border border-indigo-500/20">
                      📥
                    </div>
                    <div>
                      <p className="text-xs font-bold text-white">Click or drag document to upload</p>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        Supports PDF, DOCX, ZIP, Code (.py, .cpp, .java, .js), and Images up to 25MB
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* External Cloud Link */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                Or Attach External Project URL / GitHub Repository
              </label>
              <input
                type="url"
                value={attachmentUrl && !attachmentUrl.startsWith('data:') ? attachmentUrl : ''}
                onChange={(e) => setAttachmentUrl(e.target.value)}
                placeholder="https://github.com/username/project-repo or https://drive.google.com/..."
                className="w-full px-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-500 text-xs focus:outline-none focus:border-indigo-500 transition"
              />
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
              <Link
                to="/student/assignments"
                className="py-2.5 px-5 rounded-xl text-xs font-semibold text-slate-400 hover:text-white bg-slate-900 border border-slate-800 transition"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={submitting}
                className="py-2.5 px-7 bg-linear-to-r from-indigo-600 to-purple-600 text-white text-xs font-bold rounded-xl shadow-lg shadow-indigo-600/30 hover:opacity-95 transition disabled:opacity-50 flex items-center gap-2"
              >
                {submitting ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Submitting Work...</span>
                  </>
                ) : (
                  <span>{existingSub ? 'Update & Re-Submit Assignment' : 'Turn In Assignment'}</span>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </SidebarLayout>
  );
};

export default SubmitAssignment;
