// frontend/src/pages/Student/Courses.jsx
import { useState, useEffect } from 'react';
import SidebarLayout from '../../components/common/SidebarLayout';
import api from '../../services/api';

const Courses = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSubject, setSelectedSubject] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [courseLessons, setCourseLessons] = useState([]);
  const [loadingLessons, setLoadingLessons] = useState(false);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await api.get('/student/courses');
        if (res.data.success) {
          setCourses(res.data.courses);
        }
      } catch (err) {
        console.warn('Failed fetching courses:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  const openCourseModal = async (course) => {
    setSelectedCourse(course);
    setLoadingLessons(true);
    setCourseLessons([]);
    try {
      const res = await api.get(`/student/courses/${course.id}`);
      if (res.data.success && res.data.lessons) {
        setCourseLessons(res.data.lessons);
      }
    } catch (err) {
      console.warn('Error fetching course lessons:', err);
    } finally {
      setLoadingLessons(false);
    }
  };

  const subjects = ['All', ...new Set(courses.map(c => c.subject).filter(Boolean))];

  const filteredCourses = courses.filter(c => {
    const matchesSubject = selectedSubject === 'All' || c.subject === selectedSubject;
    const matchesSearch = (c.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (c.description || '').toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSubject && matchesSearch;
  });

  return (
    <SidebarLayout>
      <div className="space-y-6">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-panel p-6 rounded-3xl border border-slate-800">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-400">Curriculum Catalog</span>
            <h1 className="text-2xl font-black text-white">Course Catalog & Learning Paths</h1>
            <p className="text-xs text-slate-400 mt-1">
              Explore structured academic, degree & technical courses with real syllabus modules and progress tracking.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <input
              type="text"
              placeholder="Search courses..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="px-4 py-2.5 bg-slate-900 border border-slate-750 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-indigo-500 w-full sm:w-64"
            />
          </div>
        </div>

        {/* Subject Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {subjects.map((sub) => (
            <button
              key={sub}
              onClick={() => setSelectedSubject(sub)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                selectedSubject === sub
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                  : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-850'
              }`}
            >
              {sub}
            </button>
          ))}
        </div>

        {/* Loading Spinner */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : filteredCourses.length === 0 ? (
          <div className="glass-panel p-12 rounded-3xl border border-slate-800 text-center space-y-3">
            <div className="text-4xl">📚</div>
            <h3 className="text-lg font-bold text-white">No courses match your filter</h3>
            <p className="text-xs text-slate-400">Try clearing your search query or selecting a different subject.</p>
          </div>
        ) : (
          /* Course Cards Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCourses.map((course) => (
              <div
                key={course.id}
                className="glass-panel glass-panel-hover p-6 rounded-3xl border border-slate-800 flex flex-col justify-between space-y-4 group"
              >
                <div className="space-y-3">
                  <div className="h-40 rounded-2xl overflow-hidden relative">
                    <img
                      src={course.thumbnail}
                      alt={course.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-3 left-3 bg-slate-950/80 backdrop-blur-md px-3 py-1 rounded-lg border border-white/10 text-[10px] font-bold text-indigo-300">
                      {course.code}
                    </div>
                    <div className="absolute top-3 right-3 bg-indigo-600/90 backdrop-blur-md px-2.5 py-1 rounded-lg text-[10px] font-bold text-white shadow-md">
                      ⭐ {course.rating}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-[10px] text-slate-400">
                    <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-semibold">{course.subject}</span>
                    <span>•</span>
                    <span>{course.courseYear}</span>
                  </div>

                  <h3 className="text-base font-bold text-white group-hover:text-indigo-300 transition-colors line-clamp-1">
                    {course.title}
                  </h3>
                  <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                    {course.description}
                  </p>
                </div>

                <div className="space-y-3 pt-3 border-t border-slate-800/80">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-400">Instructor:</span>
                    <span className="font-semibold text-slate-200">{course.teacherName}</span>
                  </div>

                  {/* Progress Bar */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-[10px] font-medium">
                      <span className="text-slate-400">Progress</span>
                      <span className="text-indigo-400 font-bold">{course.progressPercentage || 0}%</span>
                    </div>
                    <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-indigo-600 h-full transition-all duration-500"
                        style={{ width: `${course.progressPercentage || 0}%` }}
                      ></div>
                    </div>
                  </div>

                  <button
                    onClick={() => openCourseModal(course)}
                    className="w-full py-2.5 px-4 bg-slate-850 hover:bg-indigo-600 text-slate-200 hover:text-white text-xs font-bold rounded-xl border border-slate-750 transition-all flex items-center justify-center gap-2"
                  >
                    <span>View Course Modules</span>
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Modal for Course Modules */}
        {selectedCourse && (
          <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-xl w-full space-y-6 max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-[10px] font-bold uppercase text-indigo-400">{selectedCourse.code}</span>
                  <h2 className="text-xl font-bold text-white">{selectedCourse.title}</h2>
                  <p className="text-xs text-slate-400 mt-1">{selectedCourse.description}</p>
                </div>
                <button
                  onClick={() => setSelectedCourse(null)}
                  className="p-2 text-slate-400 hover:text-white text-lg font-bold"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Course Modules & Lessons</h4>
                  <span className="text-xs text-slate-400">{courseLessons.length} lessons loaded</span>
                </div>

                {loadingLessons ? (
                  <div className="flex justify-center py-8">
                    <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                  </div>
                ) : courseLessons.length === 0 ? (
                  <div className="p-6 rounded-2xl bg-slate-850 border border-slate-800 text-center text-xs text-slate-400">
                    No lessons published for this course yet. Check back soon.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {courseLessons.map((lesson, idx) => (
                      <div
                        key={lesson.id || idx}
                        className="p-4 rounded-2xl bg-slate-850 border border-slate-800 flex items-start justify-between gap-3"
                      >
                        <div className="flex items-start gap-3">
                          <div className="w-7 h-7 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                            {lesson.lessonOrder || idx + 1}
                          </div>
                          <div>
                            <h5 className="text-xs font-bold text-white">{lesson.title}</h5>
                            <p className="text-[10px] text-slate-400 mt-0.5 line-clamp-2">{lesson.summary || lesson.content}</p>
                            {lesson.durationMinutes && (
                              <span className="text-[10px] text-indigo-400 mt-1 inline-block">⏱️ {lesson.durationMinutes} mins</span>
                            )}
                          </div>
                        </div>
                        <span className="text-[10px] px-2 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded font-semibold whitespace-nowrap">
                          {lesson.status || 'Active'}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <button
                onClick={() => setSelectedCourse(null)}
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-indigo-600/30 transition"
              >
                Close Course Overview
              </button>
            </div>
          </div>
        )}
      </div>
    </SidebarLayout>
  );
};

export default Courses;
