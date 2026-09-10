// frontend/src/pages/Student/PersonalNotes.jsx
import { useState, useEffect } from 'react';
import SidebarLayout from '../../components/common/SidebarLayout';
import api from '../../services/api';

const PersonalNotes = () => {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [showModal, setShowModal] = useState(false);
  const [editingNote, setEditingNote] = useState(null);

  // Form State
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('General');
  const [tags, setTags] = useState('DSA, Notes');
  const [color, setColor] = useState('#3B82F6');
  const [isPinned, setIsPinned] = useState(false);

  const fetchNotes = async () => {
    try {
      const res = await api.get('/student/notes');
      if (res.data.success) {
        setNotes(res.data.notes || []);
      }
    } catch (err) {
      console.warn('Failed fetching notes:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotes();
  }, []);

  const handleCreateOrUpdate = async (e) => {
    e.preventDefault();
    if (!title || !content) return;

    const payload = {
      title,
      content,
      category,
      tags: tags.split(',').map(t => t.trim()).filter(Boolean),
      color,
      isPinned
    };

    try {
      if (editingNote) {
        const res = await api.put(`/student/notes/${editingNote.id}`, payload);
        if (res.data.success) {
          setNotes(notes.map(n => n.id === editingNote.id ? { ...n, ...payload } : n));
          closeModal();
        }
      } else {
        const res = await api.post('/student/notes', payload);
        if (res.data.success) {
          setNotes([res.data.note, ...notes]);
          closeModal();
        }
      }
    } catch (err) {
      console.warn('Error saving note:', err);
    }
  };

  const handleDelete = async (id) => {
    setNotes(notes.filter(n => n.id !== id));
    try {
      await api.delete(`/student/notes/${id}`);
    } catch (err) {
      console.warn('Error deleting note:', err);
      fetchNotes();
    }
  };

  const openModalForCreate = () => {
    setEditingNote(null);
    setTitle('');
    setContent('');
    setCategory('General');
    setTags('DSA, Revision');
    setColor('#3B82F6');
    setIsPinned(false);
    setShowModal(true);
  };

  const openModalForEdit = (note) => {
    setEditingNote(note);
    setTitle(note.title);
    setContent(note.content);
    setCategory(note.category || 'General');
    setTags((note.tags || []).join(', '));
    setColor(note.color || '#3B82F6');
    setIsPinned(!!note.isPinned);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingNote(null);
  };

  const categories = ['All', ...new Set(notes.map(n => n.category || 'General'))];

  const filteredNotes = notes.filter(n => {
    const matchesCategory = selectedCategory === 'All' || n.category === selectedCategory;
    const matchesSearch = n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          n.content.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <SidebarLayout>
      <div className="space-y-6">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-panel p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-slate-800">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-purple-400">V1 Foundation</span>
            <h1 className="text-xl sm:text-2xl font-black text-white">Personal Notes App</h1>
            <p className="text-xs text-slate-400 mt-1">
              Create, tag, pin, and organize your study notes linked to course subjects.
            </p>
          </div>
          <button
            onClick={openModalForCreate}
            className="py-2.5 px-5 btn-premium text-white text-xs font-bold shadow-brand hover:opacity-95 transition flex items-center justify-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
            </svg>
            <span>Create New Note</span>
          </button>
        </div>

        {/* Search & Categories Bar */}
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-1 scrollbar-none">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  selectedCategory === cat
                    ? 'bg-linear-to-r from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-600/30'
                    : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <input
            type="text"
            placeholder="Search notes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="px-4 py-2 bg-slate-900 border border-slate-750 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-purple-500 w-full sm:w-64"
          />
        </div>

        {/* Notes Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : filteredNotes.length === 0 ? (
          <div className="glass-panel p-6 sm:p-10 rounded-2xl sm:rounded-3xl border border-slate-800 text-center space-y-3">
            <div className="text-4xl">📝</div>
            <h3 className="text-lg font-bold text-white">No personal notes found</h3>
            <p className="text-xs text-slate-400">Click "Create New Note" to start writing your personal study notes.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {filteredNotes.map((note) => (
              <div
                key={note.id}
                className="glass-panel glass-panel-hover p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-slate-800 flex flex-col justify-between space-y-4 relative group"
                style={{ borderTop: `4px solid ${note.color || '#3B82F6'}` }}
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-slate-800 text-slate-300">
                      {note.category || 'General'}
                    </span>
                    {note.isPinned && (
                      <span className="text-amber-400 text-xs flex items-center gap-1 font-bold">
                        📌 Pinned
                      </span>
                    )}
                  </div>

                  <h3 className="text-base font-bold text-white group-hover:text-purple-300 transition-colors">
                    {note.title}
                  </h3>

                  <p className="text-xs text-slate-300 whitespace-pre-wrap leading-relaxed line-clamp-4">
                    {note.content}
                  </p>
                </div>

                <div className="space-y-3 pt-3 border-t border-slate-800/80">
                  {note.tags && note.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {note.tags.map((tag, idx) => (
                        <span key={idx} className="text-[10px] px-2 py-0.5 rounded bg-slate-850 text-indigo-300 font-medium">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="flex items-center justify-between text-xs pt-1">
                    <span className="text-[10px] text-slate-500">
                      {new Date(note.createdAt).toLocaleDateString()}
                    </span>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => openModalForEdit(note)}
                        className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 text-[10px] font-semibold rounded-lg transition"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(note.id)}
                        className="px-2.5 py-1 bg-rose-500/20 hover:bg-rose-500/30 text-rose-400 text-[10px] font-semibold rounded-lg transition"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Modal for Create/Edit Note */}
        {showModal && (
          <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3.5 sm:p-4">
            <form onSubmit={handleCreateOrUpdate} className="bg-slate-900 border border-slate-800 rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-8 max-w-lg w-full space-y-4 max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-bold text-white">
                  {editingNote ? 'Edit Study Note' : 'Create New Study Note'}
                </h3>
                <button type="button" onClick={closeModal} className="text-slate-400 hover:text-white">✕</button>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Title</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. BST Tree Balancing Logic"
                  className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Category</label>
                <input
                  type="text"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  placeholder="Computer Science, IT, Math..."
                  className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Note Content</label>
                <textarea
                  required
                  rows="4"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Write your notes, formula summaries, or key lecture concepts..."
                  className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-purple-500"
                ></textarea>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Tags (comma-separated)</label>
                <input
                  type="text"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  placeholder="DSA, Revision, Formula"
                  className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-300">
                  <input
                    type="checkbox"
                    checked={isPinned}
                    onChange={(e) => setIsPinned(e.target.checked)}
                    className="rounded bg-slate-950 border-slate-800 text-purple-600 focus:ring-0"
                  />
                  <span>Pin this note to top</span>
                </label>

                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400">Accent Color:</span>
                  <input
                    type="color"
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    className="w-8 h-8 bg-transparent cursor-pointer border-0 rounded-lg"
                  />
                </div>
              </div>

              <div className="pt-3 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-linear-to-r from-purple-600 to-indigo-600 text-white text-xs font-bold rounded-xl shadow-lg shadow-purple-600/30"
                >
                  {editingNote ? 'Save Changes' : 'Create Note'}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </SidebarLayout>
  );
};

export default PersonalNotes;
