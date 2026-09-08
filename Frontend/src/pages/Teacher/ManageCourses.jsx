// frontend/src/pages/Teacher/ManageCourses.jsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import SidebarLayout from '../../components/common/SidebarLayout';

const ManageCourses = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTeacherCourses();
  }, []);

  const fetchTeacherCourses = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:3001/api/teacher/courses', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setCourses(data.courses);
      }
    } catch (err) {
      console.error('Error fetching teacher courses:', err);
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
            <span className="text-xs font-bold uppercase tracking-wider text-purple-400">V4 Platform</span>
            <h1 className="text-2xl font-black text-white">Teacher Course Manager</h1>
            <p className="text-xs text-slate-400 mt-1">
              Manage your published course catalogs, lesson modules, and student enrollments.
            </p>
          </div>

          <Link
            to="/teacher/create-course"
            className="py-2.5 px-4 bg-linear-to-r from-purple-600 to-indigo-600 text-white text-xs font-bold rounded-xl shadow-lg shadow-purple-600/30 hover:opacity-95 transition flex items-center gap-2"
          >
            <span>+ Create New Course</span>
          </Link>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : courses.length === 0 ? (
          <div className="glass-panel p-12 rounded-3xl border border-slate-800 text-center space-y-3">
            <div className="text-4xl">📚</div>
            <h3 className="text-lg font-bold text-white">No courses published yet</h3>
            <p className="text-xs text-slate-400">Click "Create New Course" to build your first course module.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {courses.map((course) => (
              <div key={course.id} className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
                <div className="flex items-center gap-4">
                  <img src={course.thumbnail} alt={course.title} className="w-16 h-16 rounded-2xl object-cover shrink-0" />
                  <div>
                    <span className="text-[10px] font-bold text-indigo-400 uppercase">{course.code} • {course.subject}</span>
                    <h3 className="text-base font-bold text-white leading-tight">{course.title}</h3>
                    <p className="text-[11px] text-slate-400 mt-0.5">{course.department} ({course.courseYear})</p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 p-3 bg-slate-950 rounded-2xl border border-slate-800 text-center text-xs">
                  <div>
                    <span className="text-[9px] text-slate-400 uppercase font-semibold">Modules</span>
                    <p className="font-bold text-slate-200">{course.modulesCount || 4}</p>
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-400 uppercase font-semibold">Lessons</span>
                    <p className="font-bold text-indigo-400">{course.lessonsCount || 12}</p>
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-400 uppercase font-semibold">Enrolled</span>
                    <p className="font-bold text-emerald-400">{course.enrolledCount || 45}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-800">
                  <span className="text-slate-400">Rating: <strong className="text-amber-400">⭐ {course.rating}</strong></span>
                  <button className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl transition">
                    Edit Modules
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </SidebarLayout>
  );
};

export default ManageCourses;
