// frontend/src/pages/Admin/UploadStudyMaterial.jsx
import { useEffect, useState } from 'react';
import SidebarLayout from '../../components/common/SidebarLayout';
import api from '../../services/api';

const UploadStudyMaterial = () => {
  const [materials, setMaterials] = useState([]);
  const [subject, setSubject] = useState('Computer Science');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [fileName, setFileName] = useState('');
  const [fileUrl, setFileUrl] = useState('');

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [toastMsg, setToastMsg] = useState('');

  const fetchMaterials = async () => {
    try {
      const res = await api.get('/student/study-material');
      if (res.data.success) {
        setMaterials(res.data.materials || []);
      }
    } catch (err) {
      console.warn('Study material fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMaterials();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setToastMsg('');

    try {
      const res = await api.post('/admin/study-material', {
        Subject: subject,
        Title: title,
        Description: description,
        FileName: fileName || 'Course_Notes.pdf',
        fileUrl: fileUrl || 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf'
      });

      if (res.data.success) {
        setMaterials((prev) => [res.data.material, ...prev]);
        setToastMsg('Study material published successfully!');
        setTitle('');
        setDescription('');
        setFileName('');
        setFileUrl('');
      }
    } catch (err) {
      setToastMsg(err.response?.data?.message || 'Failed to upload study material.');
    } finally {
      setSubmitting(false);
      setTimeout(() => setToastMsg(''), 3000);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this study material entry?')) return;

    try {
      await api.delete(`/admin/study-material/${id}`);
      setMaterials((prev) => prev.filter((m) => m.id !== id));
      setToastMsg('Study material deleted.');
    } catch (err) {
      setToastMsg(err.response?.data?.message || 'Failed to delete study material.');
    } finally {
      setTimeout(() => setToastMsg(''), 3000);
    }
  };

  return (
    <SidebarLayout>
      <div className="space-y-4 sm:space-y-6">
        <div className="flex flex-col gap-1">
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">Upload Study Material & Course Notes</h1>
          <p className="text-xs sm:text-sm text-slate-400">Publish notes, syllabus guides, and solved question banks for students</p>
        </div>

        {toastMsg && (
          <div className="p-3 sm:p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
            ✓ {toastMsg}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          {/* Upload Form */}
          <div className="glass-panel p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-slate-800/80 space-y-4">
            <h2 className="text-base sm:text-lg font-bold text-white">Upload Form</h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Subject</label>
                <select
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-slate-100 text-xs focus:outline-none focus:border-indigo-500"
                >
                  <option value="Computer Science">Computer Science & Engg</option>
                  <option value="Information Technology">Information Technology</option>
                  <option value="Mathematics">Applied Mathematics</option>
                  <option value="Physics">Applied Physics</option>
                  <option value="Electrical">Electrical Engineering</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Material Title</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Data Structures Notes"
                  className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-slate-100 text-xs focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Description</label>
                <textarea
                  rows={3}
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Brief summary of syllabus units covered..."
                  className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-slate-100 text-xs focus:outline-none focus:border-indigo-500 leading-relaxed"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">File Name Display</label>
                <input
                  type="text"
                  value={fileName}
                  onChange={(e) => setFileName(e.target.value)}
                  placeholder="DSA_Complete_Notes.pdf"
                  className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-slate-100 text-xs focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">File Link / URL</label>
                <input
                  type="url"
                  value={fileUrl}
                  onChange={(e) => setFileUrl(e.target.value)}
                  placeholder="https://drive.google.com/file/d/..."
                  className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-slate-100 text-xs focus:outline-none focus:border-indigo-500"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-2.5 px-4 btn-premium text-white text-xs font-semibold rounded-xl transition disabled:opacity-50"
              >
                {submitting ? 'Uploading...' : 'Publish Study Material'}
              </button>
            </form>
          </div>

          {/* Uploaded List */}
          <div className="lg:col-span-2 glass-panel p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-slate-800/80 space-y-4">
            <h2 className="text-base sm:text-lg font-bold text-white">Published Study Materials</h2>

            {loading ? (
              <div className="py-12 text-center text-slate-400 text-xs">Loading study materials...</div>
            ) : materials.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-300 min-w-[500px]">
                  <thead className="bg-slate-900 text-slate-400 uppercase font-semibold border-b border-slate-800">
                    <tr>
                      <th className="px-3.5 py-3">Subject</th>
                      <th className="px-3.5 py-3">Title & File</th>
                      <th className="px-3.5 py-3">Date</th>
                      <th className="px-3.5 py-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/80">
                    {materials.map((m) => (
                      <tr key={m.id} className="hover:bg-slate-900/40 transition">
                        <td className="px-3.5 py-3 font-semibold text-indigo-400">{m.subject}</td>
                        <td className="px-3.5 py-3">
                          <div className="font-bold text-slate-100">{m.title}</div>
                          <div className="text-slate-400 text-[11px] font-mono">📄 {m.fileName}</div>
                        </td>
                        <td className="px-3.5 py-3 text-slate-400">
                          {new Date(m.uploadDt).toLocaleDateString()}
                        </td>
                        <td className="px-3.5 py-3 text-right">
                          <button
                            onClick={() => handleDelete(m.id)}
                            className="px-2.5 py-1 bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 border border-rose-500/20 font-semibold rounded transition"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-6 sm:p-8 text-center text-slate-400 text-xs">No study materials published yet.</div>
            )}
          </div>
        </div>
      </div>
    </SidebarLayout>
  );
};

export default UploadStudyMaterial;
