// frontend/src/pages/Auth/Register.jsx
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { register as registerRequest } from '../../services/authService';
import PublicNavbar from '../../components/common/PublicNavbar';
import EnquiryModal from '../../components/common/EnquiryModal';

const Register = () => {
  const navigate = useNavigate();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [gender, setGender] = useState('Male');
  const [collegeName, setCollegeName] = useState(import.meta.env.VITE_COLLEGE_NAME || 'E-Study Academy');
  const [course, setCourse] = useState('Computer Science & Engineering');
  const [courseYear, setCourseYear] = useState('1st Year');
  const [mobileNo, setMobileNo] = useState('');
  const [dob, setDob] = useState('');
  const [addressP, setAddressP] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const fullName = `${firstName} ${lastName}`.trim();
      const res = await registerRequest({
        name: fullName,
        email,
        password,
        role: 'student',
        gender,
        collegeName,
        course,
        courseYear,
        mobileNo,
        dob,
        addressP
      });

      if (res.data.success) {
        setSuccessMsg('Registration successful! Redirecting to login portal...');
        setTimeout(() => {
          navigate('/login');
        }, 1500);
      } else {
        setErrorMsg(res.data.message || 'Registration failed. Please check your details.');
      }
    } catch (err) {
      console.warn('Registration request error:', err);
      const serverMsg = err.response?.data?.message || err.message || 'Registration failed. Please verify your details.';
      setErrorMsg(serverMsg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-shell min-h-screen dark:bg-[#070a12] flex flex-col font-sans text-slate-900 dark:text-slate-100 relative overflow-hidden">
      {/* Background Ambient Lighting Blobs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="ambient-blob-a absolute top-1/4 left-1/4 w-120 h-120 rounded-full blur-[140px] animate-float-slow" />
        <div className="ambient-blob-b absolute bottom-1/4 right-1/4 w-120 h-120 rounded-full blur-[150px] animate-float-reverse" />
      </div>

      {/* Top Public Navigation Bar */}
      <PublicNavbar />

      <div className="flex-1 flex items-center justify-center p-3.5 sm:p-6 relative z-10 my-2 sm:my-6">
        <div className="w-full max-w-2xl glass-panel p-5 sm:p-8 lg:p-10 rounded-2xl sm:rounded-3xl shadow-2xl relative z-10 animate-slide-up">
        <div className="text-center mb-6">
          <div className="w-16 h-16 rounded-2xl overflow-hidden border border-brand/40 shadow-brand ring-2 ring-white/15 mx-auto mb-3 bg-slate-900 shrink-0">
            <img src="/logo.png" alt="E-Study Corner Logo" className="w-full h-full object-cover" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white font-display">Student Registration Portal</h1>
          <p className="text-xs text-slate-400 mt-1">
            E-Study Corner · Student Registration
          </p>
        </div>

        {/* Role Restriction Alert Banner */}
        <div className="mb-6 p-3.5 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs flex items-start gap-2.5">
          <span className="text-base">🎓</span>
          <div>
            <strong className="font-bold text-white block">Student Direct Registration</strong>
            <span>Public registration is open to all enrolled students. Faculty and Teacher accounts are created directly by Institutional Administrators.</span>
          </div>
        </div>

        {successMsg && (
          <div className="mb-4 p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
            ✓ {successMsg}
          </div>
        )}

        {errorMsg && (
          <div className="mb-4 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs">
            ⚠ {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">First Name</label>
              <input
                type="text"
                required
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="e.g. Rahul"
                className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-500 text-xs focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Last Name</label>
              <input
                type="text"
                required
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="e.g. Sharma"
                className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-500 text-xs focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Email ID</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="student@estudy.com"
                className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-500 text-xs focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Password</label>
              <input
                type="password"
                required
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-500 text-xs focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Gender</label>
              <div className="flex items-center gap-4 bg-slate-900 p-2.5 rounded-xl border border-slate-800 text-xs text-slate-300">
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="radio"
                    name="gender"
                    value="Male"
                    checked={gender === 'Male'}
                    onChange={(e) => setGender(e.target.value)}
                  />
                  <span>Male</span>
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="radio"
                    name="gender"
                    value="Female"
                    checked={gender === 'Female'}
                    onChange={(e) => setGender(e.target.value)}
                  />
                  <span>Female</span>
                </label>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Mobile Number</label>
              <input
                type="tel"
                required
                value={mobileNo}
                onChange={(e) => setMobileNo(e.target.value)}
                placeholder="9876543210"
                className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-500 text-xs focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-300 mb-1">College / School / University Name</label>
              <input
                type="text"
                required
                value={collegeName}
                onChange={(e) => setCollegeName(e.target.value)}
                placeholder="e.g. E-Study Academy / University Name"
                className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-slate-100 text-xs focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Course / Program</label>
              <select
                value={course}
                onChange={(e) => setCourse(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-slate-100 text-xs focus:outline-none focus:border-indigo-500"
              >
                <option value="Computer Science & Engineering">Computer Science & Engineering</option>
                <option value="Information Technology">Information Technology</option>
                <option value="Artificial Intelligence & Data Science">Artificial Intelligence & Data Science</option>
                <option value="Computer Applications (BCA/MCA)">Computer Applications (BCA / MCA)</option>
                <option value="Electrical & Electronics Engineering">Electrical & Electronics Engineering</option>
                <option value="Mechanical & Automation Engineering">Mechanical & Automation Engineering</option>
                <option value="Civil Engineering">Civil Engineering</option>
                <option value="Diploma in CS & Engineering">Diploma in CS & Engineering</option>
                <option value="Diploma in Engineering (General)">Diploma in Engineering (General)</option>
                <option value="B.Sc / M.Sc (Science & IT)">B.Sc / M.Sc (Science & IT)</option>
                <option value="Higher Secondary (11th & 12th)">Higher Secondary (11th & 12th)</option>
                <option value="High School (9th & 10th)">High School (9th & 10th)</option>
                <option value="General Technical & Skill Development">General Technical & Skill Development</option>
                <option value="Other Degree / Academic Program">Other Degree / Academic Program</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Year / Semester / Level</label>
              <select
                value={courseYear}
                onChange={(e) => setCourseYear(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-slate-100 text-xs focus:outline-none focus:border-indigo-500"
              >
                <option value="1st Year">1st Year (Semester 1 - 2)</option>
                <option value="2nd Year">2nd Year (Semester 3 - 4)</option>
                <option value="3rd Year">3rd Year (Semester 5 - 6)</option>
                <option value="4th Year">4th Year (Semester 7 - 8)</option>
                <option value="Higher Secondary (11th/12th)">Higher Secondary (11th / 12th)</option>
                <option value="High School (9th/10th)">High School (9th / 10th)</option>
                <option value="Postgraduate">Postgraduate</option>
                <option value="Self-Paced Learning">Self-Paced / Open Learner</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Date of Birth</label>
              <input
                type="date"
                required
                value={dob}
                onChange={(e) => setDob(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-slate-100 text-xs focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-300 mb-1">Permanent Address</label>
              <textarea
                rows={2}
                required
                value={addressP}
                onChange={(e) => setAddressP(e.target.value)}
                placeholder="Enter full postal address..."
                className="w-full px-3.5 py-2 bg-slate-900 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-500 text-xs focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3.5 px-4 btn-premium text-white text-xs font-extrabold shadow-brand tracking-wide mt-3"
          >
            {submitting ? 'Registering Student...' : 'Complete Registration →'}
          </button>

          <div className="text-center pt-2">
            <span className="text-xs text-slate-400">Already registered? </span>
            <Link to="/login" className="text-xs font-semibold text-indigo-400 hover:underline">
              Sign In Here
            </Link>
          </div>
        </form>
      </div>
      </div>

      <EnquiryModal />
    </div>
  );
};

export default Register;
