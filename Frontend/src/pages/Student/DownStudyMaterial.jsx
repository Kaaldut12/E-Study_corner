// frontend/src/pages/Student/DownStudyMaterial.jsx
import { useEffect, useState } from 'react';
import axios from 'axios';
import SidebarLayout from '../../components/common/SidebarLayout';
import { useAuth } from '../../contexts/AuthContext';

const DownStudyMaterial = () => {
  const { apiUrl } = useAuth();
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('All');

  useEffect(() => {
    const fetchMaterials = async () => {
      try {
        const res = await axios.get(`${apiUrl}/student/study-material`);
        if (res.data.success) {
          setMaterials(res.data.materials);
        }
      } catch (err) {
        console.warn('Study material fetch error:', err);
        setMaterials([
          {
            id: 'mat_1',
            subject: 'Computer Science',
            title: 'Data Structures & Algorithms Complete Notes',
            description: 'Comprehensive study notes covering Arrays, Linked Lists, Stacks, Queues, Binary Search Trees, and Graphs.',
            fileName: 'DSA_Complete_Notes.pdf',
            fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
            uploadDt: '2026-09-02T10:00:00.000Z'
          },
          {
            id: 'mat_2',
            subject: 'Computer Science',
            title: 'MERN Stack Web Development Lab Guide',
            description: 'Step by step guide for building REST APIs with Express, Node.js, MongoDB and React Frontend.',
            fileName: 'MERN_Web_Dev_Guide.pdf',
            fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
            uploadDt: '2026-09-04T15:20:00.000Z'
          },
          {
            id: 'mat_3',
            subject: 'Mathematics',
            title: 'Applied Mathematics III Solved Papers',
            description: 'Previous 5 years solved question papers for Applied Mathematics & Core Engineering Subjects.',
            fileName: 'Applied_Maths_III_Solved.pdf',
            fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
            uploadDt: '2026-09-05T09:00:00.000Z'
          }
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchMaterials();
  }, [apiUrl]);

  const filteredMaterials = materials.filter((mat) => {
    const matchesSubject = selectedSubject === 'All' || mat.subject === selectedSubject;
    const matchesSearch =
      mat.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      mat.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      mat.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSubject && matchesSearch;
  });

  return (
    <SidebarLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white">Download Study Materials</h1>
            <p className="text-sm text-slate-400">Access course notes, lecture slides, lab manuals & solved papers</p>
          </div>

          <div className="w-full sm:w-64">
            <input
              type="text"
              placeholder="Search title, topic, subject..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-3.5 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>

        {/* Subject Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {['All', 'Computer Science', 'Mathematics', 'Physics', 'Electrical'].map((sub) => (
            <button
              key={sub}
              onClick={() => setSelectedSubject(sub)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-medium capitalize transition ${
                selectedSubject === sub
                  ? 'bg-indigo-600 text-white font-semibold'
                  : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              {sub}
            </button>
          ))}
        </div>

        {/* Material Cards */}
        {loading ? (
          <div className="py-12 text-center text-slate-400">Loading study materials...</div>
        ) : filteredMaterials.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredMaterials.map((mat) => (
              <div key={mat.id} className="glass-panel p-6 rounded-2xl border border-slate-800 flex flex-col justify-between space-y-4">
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="px-2.5 py-0.5 text-xs font-semibold rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                      {mat.subject}
                    </span>
                    <span className="text-xs text-slate-400">
                      Uploaded: {new Date(mat.uploadDt).toLocaleDateString()}
                    </span>
                  </div>
                  <h2 className="text-base font-bold text-white leading-snug">{mat.title}</h2>
                  <p className="text-xs text-slate-400 mt-2 line-clamp-3 leading-relaxed">{mat.description}</p>
                </div>

                <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between">
                  <span className="text-xs text-slate-400 font-mono flex items-center gap-1">
                    📄 {mat.fileName}
                  </span>
                  <a
                    href={mat.fileUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="py-1.5 px-4 gradient-bg-primary text-white text-xs font-semibold rounded-lg shadow transition flex items-center gap-1.5"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    Download PDF
                  </a>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="glass-panel p-12 text-center text-slate-400 rounded-2xl border border-slate-800">
            No study materials found matching query.
          </div>
        )}
      </div>
    </SidebarLayout>
  );
};

export default DownStudyMaterial;
