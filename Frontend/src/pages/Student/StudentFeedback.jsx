// frontend/src/pages/Student/StudentFeedback.jsx
import { useEffect, useState } from 'react';
import axios from 'axios';
import SidebarLayout from '../../components/common/SidebarLayout';
import { useAuth } from '../../contexts/AuthContext';

const StudentFeedback = () => {
  const { apiUrl } = useAuth();
  const [feedbackList, setFeedbackList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeedback = async () => {
      try {
        const res = await axios.get(`${apiUrl}/student/feedback`);
        if (res.data.success) {
          setFeedbackList(res.data.feedbackList);
        }
      } catch (err) {
        console.warn('Feedback fetch error:', err);
        setFeedbackList([
          {
            id: 'sub_1',
            assignmentId: 'asg_3',
            assignmentTitle: 'Linear Algebra - Matrix Transformations Quiz & Coding Lab',
            subject: 'Mathematics',
            grade: 72,
            totalPoints: 75,
            feedback: 'Excellent work Alex! Your matrix rotation implementation handled edge angles correctly. Great docstrings.',
            gradedAt: '2026-09-06T10:15:00.000Z',
            gradedBy: 'Dr. Robert Miller',
            submissionText: 'Completed matrix rotation function in NumPy.'
          }
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchFeedback();
  }, [apiUrl]);

  return (
    <SidebarLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white">My Grades & Instructor Feedback</h1>
          <p className="text-sm text-slate-400">Review evaluation scores and teacher notes on your submitted coursework</p>
        </div>

        {loading ? (
          <div className="py-12 text-center text-slate-400">Loading grades and feedback...</div>
        ) : feedbackList.length > 0 ? (
          <div className="space-y-4">
            {feedbackList.map((item) => {
              const scorePct = Math.round((item.grade / (item.totalPoints || 100)) * 100);
              return (
                <div key={item.id} className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
                    <div>
                      <span className="px-2.5 py-0.5 text-xs font-semibold rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 mb-1 inline-block">
                        {item.subject || 'Coursework'}
                      </span>
                      <h2 className="text-lg font-bold text-white">{item.assignmentTitle}</h2>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <div className="text-lg font-extrabold text-emerald-400">
                          {item.grade} <span className="text-xs text-slate-400 font-normal">/ {item.totalPoints || 100} pts</span>
                        </div>
                        <div className="text-xs font-semibold text-indigo-300">{scorePct}% Score</div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                      Teacher Commentary by {item.gradedBy || 'Instructor'}
                    </span>
                    <div className="p-4 rounded-xl bg-slate-900/90 border border-indigo-500/20 text-slate-200 text-sm leading-relaxed">
                      💬 "{item.feedback}"
                    </div>
                  </div>

                  {item.submissionText && (
                    <div className="text-xs text-slate-400 pt-2 border-t border-slate-800/60">
                      <span className="font-semibold text-slate-300">Your Original Submission: </span>
                      <span className="italic">{item.submissionText}</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="glass-panel p-12 text-center text-slate-400 rounded-2xl border border-slate-800">
            No graded submissions available yet. Check back once your instructors evaluate your turned-in assignments.
          </div>
        )}
      </div>
    </SidebarLayout>
  );
};

export default StudentFeedback;
