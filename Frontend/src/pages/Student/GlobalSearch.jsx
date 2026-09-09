// frontend/src/pages/Student/GlobalSearch.jsx
import { useState } from 'react';
import SidebarLayout from '../../components/common/SidebarLayout';
import { useAuth } from '../../contexts/AuthContext';

const GlobalSearch = () => {
  const { apiUrl } = useAuth();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState({ courses: [], materials: [], notes: [] });
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${apiUrl}/student/search?q=${encodeURIComponent(query)}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setResults(data.results);
      }
    } catch (err) {
      console.warn('Search error:', err);
    } finally {
      setLoading(false);
      setHasSearched(true);
    }
  };

  const totalResults = results.courses.length + results.materials.length + results.notes.length;

  return (
    <SidebarLayout>
      <div className="space-y-6 max-w-4xl mx-auto">
        {/* Header & Search Bar */}
        <div className="glass-panel p-8 rounded-3xl border border-slate-800 space-y-4 text-center">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">V1 Foundation</span>
          <h1 className="text-3xl font-black text-white">Global Search Omnibar</h1>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            Search across all learning courses, downloadable study materials, and personal notes simultaneously.
          </p>

          <form onSubmit={handleSearch} className="flex items-center gap-2 max-w-xl mx-auto pt-2">
            <input
              type="text"
              required
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="e.g. Data Structures, SQL, Algorithms..."
              className="flex-1 px-5 py-3.5 bg-slate-950 border border-slate-750 rounded-2xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
            <button
              type="submit"
              className="py-3.5 px-6 bg-linear-to-r from-emerald-600 to-indigo-600 text-white text-xs font-bold rounded-2xl shadow-lg shadow-emerald-600/30 hover:opacity-95 transition"
            >
              Search
            </button>
          </form>
        </div>

        {/* Results View */}
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : hasSearched && totalResults === 0 ? (
          <div className="glass-panel p-12 rounded-3xl border border-slate-800 text-center space-y-2">
            <div className="text-4xl">🔍</div>
            <h3 className="text-base font-bold text-white">No results found for "{query}"</h3>
            <p className="text-xs text-slate-400">Try searching for keywords like "Data", "SQL", "C++", or "Notes".</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Courses Results */}
            {results.courses.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                  <span>📚 Courses ({results.courses.length})</span>
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {results.courses.map((c) => (
                    <div key={c.id} className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-2">
                      <span className="text-[10px] font-bold text-indigo-400 uppercase">{c.code} • {c.subject}</span>
                      <h4 className="text-sm font-bold text-white">{c.title}</h4>
                      <p className="text-xs text-slate-400 line-clamp-2">{c.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Study Materials Results */}
            {results.materials.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                  <span>📄 Study Materials ({results.materials.length})</span>
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {results.materials.map((m) => (
                    <div key={m.id} className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-2">
                      <span className="text-[10px] font-bold text-emerald-400 uppercase">{m.subject}</span>
                      <h4 className="text-sm font-bold text-white">{m.title}</h4>
                      <p className="text-xs text-slate-400 line-clamp-2">{m.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Personal Notes Results */}
            {results.notes.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                  <span>📝 Personal Notes ({results.notes.length})</span>
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {results.notes.map((n) => (
                    <div key={n.id} className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-2">
                      <span className="text-[10px] font-bold text-purple-400 uppercase">{n.category || 'General'}</span>
                      <h4 className="text-sm font-bold text-white">{n.title}</h4>
                      <p className="text-xs text-slate-300 line-clamp-2">{n.content}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </SidebarLayout>
  );
};

export default GlobalSearch;
