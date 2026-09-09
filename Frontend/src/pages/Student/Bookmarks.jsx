// frontend/src/pages/Student/Bookmarks.jsx
import { useState, useEffect } from 'react';
import SidebarLayout from '../../components/common/SidebarLayout';
import { useAuth } from '../../contexts/AuthContext';

const Bookmarks = () => {
  const { apiUrl } = useAuth();
  const [bookmarks, setBookmarks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBookmarks = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`${apiUrl}/student/bookmarks`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        if (data.success) {
          setBookmarks(data.bookmarks);
        }
      } catch (err) {
        console.warn('Error fetching bookmarks:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchBookmarks();
  }, [apiUrl]);

  const removeBookmark = (id) => {
    setBookmarks(bookmarks.filter(b => b.id !== id));
  };

  return (
    <SidebarLayout>
      <div className="space-y-6">
        {/* Header Banner */}
        <div className="glass-panel p-6 rounded-3xl border border-slate-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-amber-400">Study Tools</span>
            <h1 className="text-2xl font-black text-white">Saved Bookmarks & Quick Links</h1>
            <p className="text-xs text-slate-400 mt-1">
              Quickly access saved courses, PDF study notes, quizzes, and personal reference items.
            </p>
          </div>
        </div>

        {/* Bookmarks Grid */}
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : bookmarks.length === 0 ? (
          <div className="glass-panel p-12 rounded-3xl border border-slate-800 text-center space-y-3">
            <div className="text-4xl">🔖</div>
            <h3 className="text-lg font-bold text-white">No saved bookmarks yet</h3>
            <p className="text-xs text-slate-400">Bookmark your favorite courses, notes, and study guides for one-click access.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {bookmarks.map((bm) => (
              <div key={bm.id} className="glass-panel glass-panel-hover p-6 rounded-3xl border border-slate-800 flex flex-col justify-between space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-amber-500/20 text-amber-300">
                      {bm.itemType}
                    </span>
                    <button
                      onClick={() => removeBookmark(bm.id)}
                      className="text-slate-500 hover:text-rose-400 text-xs font-bold transition"
                    >
                      Remove ✕
                    </button>
                  </div>

                  <h3 className="text-base font-bold text-white leading-snug">{bm.title}</h3>
                </div>

                <div className="pt-3 border-t border-slate-800/80">
                  <a
                    href={bm.url || '#'}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full py-2.5 px-4 bg-slate-850 hover:bg-amber-600 text-slate-200 hover:text-white text-xs font-bold rounded-xl border border-slate-750 transition flex items-center justify-center gap-2"
                  >
                    <span>Open Resource</span>
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </SidebarLayout>
  );
};

export default Bookmarks;
