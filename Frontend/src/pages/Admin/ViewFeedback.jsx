// frontend/src/pages/Admin/ViewFeedback.jsx
import { useEffect, useState } from 'react';
import SidebarLayout from '../../components/common/SidebarLayout';
import api from '../../services/api';

const ViewFeedback = () => {
  const [feedbackList, setFeedbackList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeedback = async () => {
      try {
        const res = await api.get('/admin/feedback');
        if (res.data.success) {
          setFeedbackList(res.data.feedbackList || []);
        }
      } catch (err) {
        console.warn('Admin feedback fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchFeedback();
  }, []);

  return (
    <SidebarLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Platform Coursework Feedback</h1>
          <p className="text-sm text-slate-400">Review student and teacher platform evaluation comments</p>
        </div>

        {loading ? (
          <div className="py-12 text-center text-slate-400">Loading platform feedback...</div>
        ) : feedbackList.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {feedbackList.map((fb) => (
              <div key={fb.id} className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-sm text-white">{fb.userName || fb.studentName || 'Student'}</span>
                  <div className="flex items-center text-amber-400 text-sm">
                    {Array.from({ length: fb.rating || 5 }).map((_, i) => (
                      <span key={i}>★</span>
                    ))}
                  </div>
                </div>

                <div className="text-xs text-indigo-400 font-medium">{fb.category || fb.assignmentTitle || 'Platform Feedback'}</div>

                <p className="text-xs text-slate-300 italic bg-slate-900/80 p-3 rounded-xl border border-slate-800">
                  "{fb.feedbackText || fb.comment}"
                </p>

                <div className="text-xs text-slate-500 text-right">
                  Submitted: {new Date(fb.createdAt).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="glass-panel p-12 text-center text-slate-400 rounded-2xl border border-slate-800">
            No platform feedback reviews recorded yet.
          </div>
        )}
      </div>
    </SidebarLayout>
  );
};

export default ViewFeedback;
