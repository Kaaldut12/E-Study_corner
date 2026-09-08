// frontend/src/pages/Student/ViewAssignments.jsx
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import SidebarLayout from '../../components/common/SidebarLayout';
import { useAuth } from '../../contexts/AuthContext';

const ViewAssignments = () => {
  const { apiUrl } = useAuth();
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchAssignments = async () => {
      try {
        const res = await axios.get(`${apiUrl}/student/assignments`);
        if (res.data.success) {
          setAssignments(res.data.assignments);
        }
      } catch (err) {
        console.warn('Assignments fetch error:', err);
        // Mock fallback
        setAssignments([
          {
            id: 'asg_1',
            title: 'Data Structures & Algorithms - Binary Trees Implementation',
            subject: 'Computer Science',
            description: 'Implement a Binary Search Tree with insertion, deletion, and traversals.',
            teacherName: 'Dr. Robert Miller',
            dueDate: '2026-09-15T23:59:59.000Z',
            totalPoints: 100,
            resourceLink: 'https://developer.mozilla.org',
            status: 'submitted'
          },
          {
            id: 'asg_2',
            title: 'Quantum Physics - Wave Particle Duality Paper',
            subject: 'Physics',
            description: 'Write a 3-page research essay on Young\'s double-slit experiment.',
            teacherName: 'Prof. Elena Rostova',
            dueDate: '2026-09-20T23:59:59.000Z',
            totalPoints: 50,
            resourceLink: 'https://arxiv.org',
            status: 'pending'
          },
          {
            id: 'asg_3',
            title: 'Linear Algebra - Matrix Transformations',
            subject: 'Mathematics',
            description: 'Solve matrix transformation lab problems.',
            teacherName: 'Dr. Robert Miller',
            dueDate: '2026-09-10T23:59:59.000Z',
            totalPoints: 75,
            resourceLink: '',
            status: 'graded'
          }
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchAssignments();
  }, [apiUrl]);

  const filteredAssignments = assignments.filter((asg) => {
    const matchesStatus = filterStatus === 'all' || asg.status === filterStatus;
    const matchesSearch =
      asg.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      asg.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      asg.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case 'graded':
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">Graded</span>;
      case 'submitted':
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">Submitted</span>;
      default:
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">Pending</span>;
    }
  };

  return (
    <SidebarLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white">Course Assignments</h1>
            <p className="text-sm text-slate-400">View details, resources, and submit your homework</p>
          </div>

          {/* Search bar */}
          <div className="w-full sm:w-72">
            <input
              type="text"
              placeholder="Search assignments or subjects..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-3.5 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>

        {/* Filter status tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {['all', 'pending', 'submitted', 'graded'].map((st) => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-medium capitalize transition ${
                filterStatus === st
                  ? 'bg-indigo-600 text-white font-semibold'
                  : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              {st} ({assignments.filter(a => st === 'all' || a.status === st).length})
            </button>
          ))}
        </div>

        {/* Assignment List */}
        {loading ? (
          <div className="py-12 text-center text-slate-400">Loading assignments...</div>
        ) : filteredAssignments.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredAssignments.map((asg) => (
              <div key={asg.id} className="glass-panel p-5 rounded-2xl border border-slate-800 flex flex-col justify-between space-y-4">
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="px-2.5 py-0.5 text-xs font-semibold rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                      {asg.subject}
                    </span>
                    {getStatusBadge(asg.status)}
                  </div>
                  <h2 className="text-base font-bold text-white leading-snug">{asg.title}</h2>
                  <p className="text-xs text-slate-400 mt-2 line-clamp-3 leading-relaxed">{asg.description}</p>
                </div>

                <div className="pt-3 border-t border-slate-800/80 space-y-3">
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span>Teacher: <strong className="text-slate-300">{asg.teacherName}</strong></span>
                    <span>Max Points: <strong className="text-indigo-400">{asg.totalPoints || 100}</strong></span>
                  </div>

                  <div className="flex items-center justify-between gap-2 pt-1">
                    {asg.resourceLink ? (
                      <a
                        href={asg.resourceLink}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs text-indigo-400 hover:underline flex items-center gap-1"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                        Reference Resource
                      </a>
                    ) : (
                      <span className="text-xs text-slate-500">No external link</span>
                    )}

                    <Link
                      to={`/student/submit/${asg.id}`}
                      className={`py-1.5 px-3.5 text-xs font-semibold rounded-lg transition ${
                        asg.status === 'graded'
                          ? 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                          : asg.status === 'submitted'
                          ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 hover:bg-indigo-600/30'
                          : 'gradient-bg-primary text-white shadow'
                      }`}
                    >
                      {asg.status === 'pending' ? 'Submit Work' : 'Update / View'}
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="glass-panel p-12 text-center text-slate-400 rounded-2xl border border-slate-800">
            No assignments match your search or filter criteria.
          </div>
        )}
      </div>
    </SidebarLayout>
  );
};

export default ViewAssignments;
