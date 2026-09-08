// frontend/src/pages/Student/ProgressTracking.jsx
import { useState, useEffect } from 'react';
import SidebarLayout from '../../components/common/SidebarLayout';

const ProgressTracking = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProgress();
  }, []);

  const fetchProgress = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:3001/api/student/progress', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const resData = await res.json();
      if (resData.success) {
        setData(resData);
      }
    } catch (err) {
      console.error('Error fetching progress stats:', err);
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
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">V2 Learning System</span>
            <h1 className="text-2xl font-black text-white">Learning Analytics & Progress Tracking</h1>
            <p className="text-xs text-slate-400 mt-1">
              Track study streak days, total learning minutes, subject mastery bars, and completed course milestones.
            </p>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Stat Cards Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Daily Study Streak</span>
                <div className="flex items-center gap-2">
                  <span className="text-3xl font-black text-amber-400">🔥 {data?.stats?.studyStreakDays || 5}</span>
                  <span className="text-xs text-slate-400">Days</span>
                </div>
              </div>

              <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Study Time</span>
                <div className="flex items-center gap-2">
                  <span className="text-3xl font-black text-indigo-400">⏱️ {data?.stats?.totalStudyMinutes || 240}</span>
                  <span className="text-xs text-slate-400">Mins</span>
                </div>
              </div>

              <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Completed Courses</span>
                <div className="flex items-center gap-2">
                  <span className="text-3xl font-black text-emerald-400">🎓 {data?.stats?.completedCoursesCount || 2}</span>
                  <span className="text-xs text-slate-400">Courses</span>
                </div>
              </div>

              <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Personal Notes</span>
                <div className="flex items-center gap-2">
                  <span className="text-3xl font-black text-purple-400">📝 {data?.stats?.activeNotesCount || 4}</span>
                  <span className="text-xs text-slate-400">Notes</span>
                </div>
              </div>
            </div>

            {/* Subject Mastery Progress Bars */}
            <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 space-y-6">
              <div>
                <h3 className="text-base font-bold text-white">Subject Mastery & Skill Levels</h3>
                <p className="text-xs text-slate-400">Calculated based on quiz attempts, completed lessons, and assignment grades.</p>
              </div>

              <div className="space-y-4">
                {(data?.stats?.subjectSkills || []).map((skill, idx) => (
                  <div key={idx} className="space-y-2">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-semibold text-slate-200">{skill.name}</span>
                      <span className="font-bold text-slate-300">{skill.percentage}%</span>
                    </div>
                    <div className="w-full bg-slate-900 h-3 rounded-full overflow-hidden p-0.5 border border-slate-800">
                      <div
                        className={`h-full rounded-full bg-linear-to-r ${skill.color} transition-all duration-1000`}
                        style={{ width: `${skill.percentage}%` }}
                      ></div>
                    </div>
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

export default ProgressTracking;
