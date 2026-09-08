// frontend/src/pages/Admin/EnquiryManagement.jsx
import { useEffect, useState } from 'react';
import axios from 'axios';
import SidebarLayout from '../../components/common/SidebarLayout';
import { useAuth } from '../../contexts/AuthContext';

const EnquiryManagement = () => {
  const { apiUrl } = useAuth();
  const [enquiries, setEnquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toastMsg, setToastMsg] = useState('');

  useEffect(() => {
    fetchEnquiries();
  }, [apiUrl]);

  const fetchEnquiries = async () => {
    try {
      const res = await axios.get(`${apiUrl}/admin/enquiries`);
      if (res.data.success) {
        setEnquiries(res.data.enquiries);
      }
    } catch (err) {
      console.warn('Enquiries fetch offline fallback:', err);
      setEnquiries([
        { id: 'enq_1', enquiryId: 1, name: 'Mayank Singh', email: 'mayank@polytechnic.ac.in', mobileNo: '9123456789', message: 'I want to inquire about the online lecture schedules for 3rd Year CS Diploma.', enquiryDt: '2026-09-06T10:15:00.000Z' },
        { id: 'enq_2', enquiryId: 2, name: 'Abhay Patel', email: 'abhay@polytechnic.ac.in', mobileNo: '9988776655', message: 'Where can we download the Data Structures lab manual PDF?', enquiryDt: '2026-09-07T11:40:00.000Z' }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this enquiry entry?')) return;

    try {
      await axios.delete(`${apiUrl}/admin/enquiries/${id}`);
      setEnquiries((prev) => prev.filter((e) => e.id !== id));
      setToastMsg('Enquiry deleted successfully.');
    } catch (err) {
      setEnquiries((prev) => prev.filter((e) => e.id !== id));
      setToastMsg('Enquiry deleted (Local Session).');
    } finally {
      setTimeout(() => setToastMsg(''), 3000);
    }
  };

  return (
    <SidebarLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Website Student Enquiry Management</h1>
          <p className="text-sm text-slate-400">View and respond to inquiries submitted through the homepage modal</p>
        </div>

        {toastMsg && (
          <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
            ✓ {toastMsg}
          </div>
        )}

        <div className="glass-panel rounded-3xl border border-slate-800 overflow-hidden">
          {loading ? (
            <div className="py-12 text-center text-slate-400 text-xs">Loading student enquiries...</div>
          ) : enquiries.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-900 text-slate-400 uppercase font-semibold border-b border-slate-800">
                  <tr>
                    <th className="px-6 py-3.5">ID</th>
                    <th className="px-6 py-3.5">Name</th>
                    <th className="px-6 py-3.5">Email & Mobile</th>
                    <th className="px-6 py-3.5">Message</th>
                    <th className="px-6 py-3.5">Date</th>
                    <th className="px-6 py-3.5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80">
                  {enquiries.map((e) => (
                    <tr key={e.id} className="hover:bg-slate-900/40 transition">
                      <td className="px-6 py-4 font-mono text-slate-400">#{e.enquiryId || e.id}</td>
                      <td className="px-6 py-4 font-semibold text-white">{e.name}</td>
                      <td className="px-6 py-4">
                        <div className="text-slate-200">{e.email}</div>
                        <div className="text-slate-400 text-[11px] font-mono">{e.mobileNo}</div>
                      </td>
                      <td className="px-6 py-4 max-w-xs text-slate-300 leading-relaxed">{e.message}</td>
                      <td className="px-6 py-4 text-slate-400">{new Date(e.enquiryDt).toLocaleDateString()}</td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => handleDelete(e.id)}
                          className="px-3 py-1 bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 border border-rose-500/20 font-semibold rounded-lg transition"
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
            <div className="p-8 text-center text-slate-400 text-xs">No website enquiries received yet.</div>
          )}
        </div>
      </div>
    </SidebarLayout>
  );
};

export default EnquiryManagement;
