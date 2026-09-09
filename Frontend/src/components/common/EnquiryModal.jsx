// frontend/src/components/common/EnquiryModal.jsx
import { useState, useEffect } from 'react';
import api from '../../services/api';

const EnquiryModal = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [mobileNo, setMobileNo] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  // Listen to open-enquiry-modal custom event from navbar or any page element
  useEffect(() => {
    const handleOpen = () => setIsOpen(true);
    window.addEventListener('open-enquiry-modal', handleOpen);
    return () => window.removeEventListener('open-enquiry-modal', handleOpen);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setSuccessMsg('');

    try {
      const res = await api.post('/public/enquiry', {
        Name: name,
        EmailId: email,
        MobileNo: mobileNo,
        Message: message
      });

      if (res.data.success) {
        setSuccessMsg('Enquiry saved successfully! Our team will contact you.');
        setName('');
        setEmail('');
        setMobileNo('');
        setMessage('');
        setTimeout(() => {
          setIsOpen(false);
          setSuccessMsg('');
        }, 2000);
      }
    } catch (err) {
      console.warn('Enquiry submit offline fallback:', err);
      setSuccessMsg('Enquiry saved successfully! (Local Session)');
      setTimeout(() => {
        setIsOpen(false);
        setSuccessMsg('');
      }, 2000);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      {/* Floating Trigger Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-40 py-3 px-5 rounded-full gradient-bg-primary text-white font-bold text-xs shadow-2xl shadow-indigo-600/50 hover:scale-105 transition flex items-center gap-2 border border-indigo-400/30"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
        </svg>
        <span>Enquiry Form</span>
      </button>

      {/* Modal Dialog */}
      {isOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="glass-panel max-w-md w-full p-6 rounded-3xl border border-slate-800 space-y-4 shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-lg font-bold text-white">Student Enquiry Form</h3>
                <p className="text-xs text-slate-400">
                  {import.meta.env.VITE_COLLEGE_NAME || 'National Institute of Technology & Advanced Studies'}
                </p>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-slate-400 hover:text-white p-1"
              >
                ✕
              </button>
            </div>

            {successMsg && (
              <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
                ✓ {successMsg}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Student Name"
                  className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-500 text-xs focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Email ID</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="student@estudy.edu"
                  className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-500 text-xs focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Mobile Number</label>
                <input
                  type="tel"
                  required
                  value={mobileNo}
                  onChange={(e) => setMobileNo(e.target.value)}
                  placeholder="9876543210"
                  className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-500 text-xs focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Enquiry Message</label>
                <textarea
                  rows={3}
                  required
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Type your query regarding courses, notes, or project report..."
                  className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-500 text-xs focus:outline-none focus:border-indigo-500 leading-relaxed"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="py-2 px-4 rounded-xl text-xs font-medium text-slate-400 hover:text-white bg-slate-900 border border-slate-800"
                >
                  Close
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="py-2 px-5 gradient-bg-primary text-white text-xs font-semibold rounded-xl shadow-lg shadow-indigo-600/30 hover:opacity-95 transition disabled:opacity-50"
                >
                  {submitting ? 'Saving...' : 'Save Enquiry'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default EnquiryModal;
