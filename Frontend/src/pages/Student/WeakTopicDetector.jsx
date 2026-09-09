// frontend/src/pages/Student/WeakTopicDetector.jsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import SidebarLayout from '../../components/common/SidebarLayout';
import studentService from '../../services/studentService';

const WeakTopicDetector = () => {
  const [topics, setTopics] = useState([]);
  const [diagnosticScore, setDiagnosticScore] = useState(null);
  const [emptyMessage, setEmptyMessage] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWeakTopics = async () => {
      try {
        const res = await studentService.getWeakTopics();
        if (res.success) {
          setTopics(res.weakTopics || []);
          setDiagnosticScore(res.overallDiagnosticScore !== undefined ? res.overallDiagnosticScore : null);
          if (res.message) setEmptyMessage(res.message);
        }
      } catch (err) {
        console.warn('Error fetching weak topic analysis:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchWeakTopics();
  }, []);

  return (
    <SidebarLayout>
      <div className="space-y-6">
        {/* Header Banner */}
        <div className="glass-panel p-6 rounded-3xl border border-slate-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-rose-400">Diagnostic Analytics</span>
            <h1 className="text-2xl font-black text-white flex items-center gap-2">
              <span>🎯</span> Weak Topic Diagnostic Dashboard
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Data-driven analysis of your quiz responses and low-scoring concepts with targeted practice links.
            </p>
          </div>

          <div className="px-4 py-2 bg-slate-900 border border-slate-750 rounded-2xl flex items-center gap-3">
            <span className="text-xs text-slate-400">Diagnostic Score:</span>
            <span className="text-lg font-black text-amber-400">
              {diagnosticScore !== null ? `${diagnosticScore} / 100` : 'No Attempts'}
            </span>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 border-4 border-rose-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : topics.length === 0 ? (
          <div className="glass-panel p-10 rounded-3xl border border-slate-800 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mx-auto text-xl font-bold">
              ✓
            </div>
            <h3 className="text-base font-bold text-white">
              {diagnosticScore !== null ? 'All Attempted Concepts Mastered!' : 'No Quiz Attempts Recorded Yet'}
            </h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              {emptyMessage ||
                (diagnosticScore !== null
                  ? 'Great job! Your recent quiz answers show high accuracy across all attempted topics.'
                  : 'Take practice quizzes to unlock personalized weak topic detection and diagnostic analytics.')}
            </p>
            <Link
              to="/student/quizzes"
              className="inline-block mt-2 py-2.5 px-5 bg-linear-to-r from-rose-600 to-indigo-600 text-white text-xs font-bold rounded-xl shadow-lg shadow-rose-600/20 hover:opacity-95 transition"
            >
              Go to Quizzes
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {topics.map((t, idx) => (
              <div key={idx} className="glass-panel p-6 rounded-3xl border border-slate-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded text-[10px] font-bold uppercase bg-rose-500/20 text-rose-300">{t.status}</span>
                    <span className="text-xs font-semibold text-slate-400">{t.subject}</span>
                  </div>

                  <h3 className="text-base font-bold text-white">{t.topic}</h3>
                  <p className="text-xs text-slate-300">💡 {t.recommendation}</p>
                </div>

                <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-800">
                  <div className="text-center sm:text-right">
                    <span className="text-[10px] text-slate-400 uppercase font-semibold">Quiz Accuracy</span>
                    <p className="text-sm font-black text-rose-400">{t.accuracy}%</p>
                  </div>

                  <Link
                    to={t.actionUrl || '/student/quizzes'}
                    className="py-2.5 px-4 bg-linear-to-r from-rose-600 to-indigo-600 text-white text-xs font-bold rounded-xl shadow-lg shadow-rose-600/20 hover:opacity-95 transition"
                  >
                    Practice Topic
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </SidebarLayout>
  );
};

export default WeakTopicDetector;
