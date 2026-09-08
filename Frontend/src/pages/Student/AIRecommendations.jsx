// frontend/src/pages/Student/AIRecommendations.jsx
import { useState, useEffect } from 'react';
import SidebarLayout from '../../components/common/SidebarLayout';

const AIRecommendations = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRecommendations();
  }, []);

  const fetchRecommendations = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:3001/api/student/recommendations', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const resData = await res.json();
      if (resData.success) {
        setData(resData.recommendations);
      }
    } catch (err) {
      console.error('Error fetching AI recommendations:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SidebarLayout>
      <div className="space-y-6">
        {/* Header Banner */}
        <div className="glass-panel p-6 rounded-3xl border border-slate-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-teal-400">V3 Advanced Learning</span>
            <h1 className="text-2xl font-black text-white flex items-center gap-2">
              <span>✨</span> Personalized AI Recommendations
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Curated course modules, study materials, and topic pathways based on your quiz performance.
            </p>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 border-4 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* AI Reasoning Spotlight Card */}
            <div className="p-6 rounded-3xl bg-linear-to-r from-teal-900/30 to-indigo-900/30 border border-teal-500/30 space-y-2">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-teal-400">Next Focus Milestone</span>
              <h2 className="text-xl font-bold text-white">{data?.nextRecommendedTopic || 'Tree Traversals & Graph Search'}</h2>
              <p className="text-xs text-slate-300 leading-relaxed">{data?.reasoning}</p>
            </div>

            {/* Recommended Courses */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Recommended Courses For You</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {(data?.courses || []).map((c) => (
                  <div key={c.id} className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-3">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 uppercase">{c.subject}</span>
                    <h4 className="text-base font-bold text-white">{c.title}</h4>
                    <p className="text-xs text-slate-400 line-clamp-2">{c.description}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Recommended Study Materials */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Suggested Study Materials</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {(data?.materials || []).map((m) => (
                  <div key={m.id} className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-3">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 uppercase">{m.subject}</span>
                    <h4 className="text-base font-bold text-white">{m.title}</h4>
                    <p className="text-xs text-slate-400 line-clamp-2">{m.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </SidebarLayout>
  );
};

export default AIRecommendations;
