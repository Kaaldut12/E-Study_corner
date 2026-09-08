// frontend/src/pages/General/Home.jsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import NotificationMarquee from '../../components/common/NotificationMarquee';
import EnquiryModal from '../../components/common/EnquiryModal';

const QUOTES_CAROUSEL = [
  {
    tag: 'Smart Learning Pathashala',
    title: 'Digital Portal for Computer Science & Engineering',
    quote: 'Personalized e-learning platform designed to meet all academic requirements of Diploma students at a single venue.',
    badgeColor: 'from-indigo-500/20 to-purple-500/20 text-indigo-300 border-indigo-500/30',
    bgGradient: 'from-indigo-950 via-slate-950 to-purple-950'
  },
  {
    tag: 'Continuous Innovation',
    title: 'Learn, Practice, Master & Excel',
    quote: '"Education is a continuous process, it\'s like a bicycle if you don\'t pedal you don\'t move forward."',
    badgeColor: 'from-purple-500/20 to-pink-500/20 text-purple-300 border-purple-500/30',
    bgGradient: 'from-purple-950 via-slate-950 to-indigo-950'
  },
  {
    tag: 'Mind & Knowledge Training',
    title: 'Real-world Practical Skill Mastery',
    quote: '"The aim of education is not to learn facts but the main aim of education is to train the mind." - Albert Einstein',
    badgeColor: 'from-blue-500/20 to-indigo-500/20 text-blue-300 border-blue-500/30',
    bgGradient: 'from-blue-950 via-slate-950 to-purple-950'
  },
  {
    tag: 'Industry Ready Skills',
    title: 'Empowering Technical Education',
    quote: '"Education is the most powerful weapon you can use to change the world." - B.B. King',
    badgeColor: 'from-emerald-500/20 to-teal-500/20 text-emerald-300 border-emerald-500/30',
    bgGradient: 'from-slate-950 via-indigo-950 to-purple-950'
  }
];

const Home = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [activeTab, setActiveTab] = useState('academic');

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % QUOTES_CAROUSEL.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white relative overflow-hidden">
      {/* Floating Ambient Glowing Blobs */}
      <div className="absolute top-20 left-10 w-96 h-96 bg-indigo-600/15 rounded-full blur-[120px] pointer-events-none animate-float-slow"></div>
      <div className="absolute top-96 right-10 w-96 h-96 bg-purple-600/15 rounded-full blur-[140px] pointer-events-none animate-float-reverse"></div>
      <div className="absolute bottom-20 left-1/3 w-80 h-80 bg-emerald-600/10 rounded-full blur-[100px] pointer-events-none animate-pulse-glow"></div>

      {/* Marquee Ticker */}
      <NotificationMarquee />

      {/* Header Navigation */}
      <header className="h-20 border-b border-slate-800/80 bg-slate-950/70 backdrop-blur-xl px-4 sm:px-8 flex items-center justify-between sticky top-0 z-30 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-linear-to-tr from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center font-black text-white text-2xl shadow-lg shadow-indigo-500/30 border border-white/20">
            E
          </div>
          <div>
            <span className="font-extrabold text-xl tracking-tight gradient-text-indigo block leading-tight">
              E-Study Corner
            </span>
            <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest block">
              Govt. Polytechnic Aurai, Bhadohi
            </span>
          </div>
        </div>

        <nav className="flex items-center gap-3 sm:gap-4">
          <Link
            to="/login"
            className="py-2.5 px-5 rounded-xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800/80 transition-all border border-transparent hover:border-slate-700"
          >
            Portal Login
          </Link>
          <Link
            to="/register"
            className="py-2.5 px-5 rounded-xl btn-shimmer text-white text-xs font-bold shadow-lg shadow-indigo-600/40 hover:scale-105 transition-all"
          >
            Student Registration
          </Link>
        </nav>
      </header>

      {/* Hero Carousel Banner */}
      <section className="relative h-[460px] sm:h-[500px] overflow-hidden flex items-center justify-center border-b border-slate-800/80">
        {QUOTES_CAROUSEL.map((slide, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-all duration-1000 flex items-center justify-center p-6 text-center bg-linear-to-b ${slide.bgGradient} ${
              index === currentSlide ? 'opacity-100 scale-100 z-10' : 'opacity-0 scale-95 z-0 pointer-events-none'
            }`}
          >
            <div className="max-w-3xl space-y-6">
              <span className={`px-4 py-1.5 rounded-full bg-linear-to-r ${slide.badgeColor} text-xs font-extrabold uppercase tracking-widest border backdrop-blur-md shadow-lg`}>
                ✨ {slide.tag}
              </span>
              <h1 className="text-3xl sm:text-5xl font-black text-white leading-tight tracking-tight drop-shadow-md">
                {slide.title}
              </h1>
              <p className="text-base sm:text-xl text-slate-300 italic font-serif max-w-2xl mx-auto leading-relaxed drop-shadow">
                {slide.quote}
              </p>
              <div className="pt-2 flex justify-center gap-4">
                <Link
                  to="/register"
                  className="py-3.5 px-7 rounded-2xl btn-shimmer text-white text-xs font-extrabold shadow-xl shadow-indigo-600/50 hover:scale-105 transition-all"
                >
                  Get Started Free
                </Link>
                <Link
                  to="/login"
                  className="py-3.5 px-7 rounded-2xl glass-panel text-slate-200 text-xs font-bold hover:bg-slate-800 transition-all border border-slate-700 hover:border-slate-600"
                >
                  Explore Course Materials
                </Link>
              </div>
            </div>
          </div>
        ))}

        {/* Custom Progress Indicators */}
        <div className="absolute bottom-6 z-20 flex gap-2.5">
          {QUOTES_CAROUSEL.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentSlide(idx)}
              className={`h-2 rounded-full transition-all duration-300 ${
                idx === currentSlide ? 'bg-linear-to-r from-indigo-400 to-purple-400 w-10 shadow-lg shadow-indigo-500/50' : 'bg-slate-800 hover:bg-slate-600 w-3'
              }`}
            />
          ))}
        </div>
      </section>

      {/* KPI Stats Counter Ribbon */}
      <section className="border-b border-slate-800/80 bg-slate-950/60 py-6 px-4">
        <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div className="p-3 rounded-2xl bg-slate-900/40 border border-slate-800/60">
            <div className="text-2xl sm:text-3xl font-black gradient-text-indigo">100+</div>
            <div className="text-xs text-slate-400 font-medium">Free Study Courses</div>
          </div>
          <div className="p-3 rounded-2xl bg-slate-900/40 border border-slate-800/60">
            <div className="text-2xl sm:text-3xl font-black gradient-text-emerald">20+ Yrs</div>
            <div className="text-xs text-slate-400 font-medium">Faculty Experience</div>
          </div>
          <div className="p-3 rounded-2xl bg-slate-900/40 border border-slate-800/60">
            <div className="text-2xl sm:text-3xl font-black gradient-text-amber">100%</div>
            <div className="text-xs text-slate-400 font-medium">Free Diploma Access</div>
          </div>
          <div className="p-3 rounded-2xl bg-slate-900/40 border border-slate-800/60">
            <div className="text-2xl sm:text-3xl font-black text-indigo-400">BTEUP</div>
            <div className="text-xs text-slate-400 font-medium">Accredited Syllabus</div>
          </div>
        </div>
      </section>

      {/* Main Content Sections */}
      <section className="py-16 px-4 sm:px-8 max-w-7xl mx-auto space-y-16 w-full relative z-10">
        {/* Student Services Section */}
        <div className="space-y-10">
          <div className="text-center space-y-3">
            <span className="px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-xs font-bold uppercase tracking-widest">
              Digital Learning Experience
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-white">
              Student <span className="gradient-text-indigo">Services</span>
            </h2>
            <p className="text-sm text-slate-400 max-w-2xl mx-auto leading-relaxed">
              Empowering technical education with flexible online tools, interactive courseware, and direct teacher guidance.
            </p>
          </div>

          {/* 3 Interactive Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="glass-panel glass-panel-hover glass-card-accent p-8 rounded-3xl space-y-4 group">
              <div className="w-14 h-14 rounded-2xl bg-linear-to-tr from-indigo-500/20 to-purple-500/20 border border-indigo-500/30 text-indigo-400 flex items-center justify-center text-3xl font-bold group-hover:scale-110 transition-transform">
                💻
              </div>
              <h3 className="text-xl font-bold text-white group-hover:text-indigo-300 transition-colors">Facilities of Online Classes</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Flexible online education enabling diploma students to complete coursework, labs, and projects seamlessly from any location.
              </p>
            </div>

            <div className="glass-panel glass-panel-hover glass-card-accent p-8 rounded-3xl space-y-4 group">
              <div className="w-14 h-14 rounded-2xl bg-linear-to-tr from-purple-500/20 to-pink-500/20 border border-purple-500/30 text-purple-400 flex items-center justify-center text-3xl font-bold group-hover:scale-110 transition-transform">
                🎥
              </div>
              <h3 className="text-xl font-bold text-white group-hover:text-purple-300 transition-colors">Daily Live Classes</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Daily live interactive sessions, recorded lecture archives, and practical task guidance by experienced polytechnic lecturers.
              </p>
            </div>

            <div className="glass-panel glass-panel-hover glass-card-accent p-8 rounded-3xl space-y-4 group">
              <div className="w-14 h-14 rounded-2xl bg-linear-to-tr from-emerald-500/20 to-teal-500/20 border border-emerald-500/30 text-emerald-400 flex items-center justify-center text-3xl font-bold group-hover:scale-110 transition-transform">
                📚
              </div>
              <h3 className="text-xl font-bold text-white group-hover:text-emerald-300 transition-colors">100+ Free Courses & Notes</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Comprehensive subject study notes, lab manuals, solved question banks, and syllabus guides available 24/7.
              </p>
            </div>
          </div>
        </div>

        {/* Tabbed Learning Features Component */}
        <div className="glass-panel p-8 sm:p-10 rounded-3xl border border-slate-800 space-y-8 shadow-2xl">
          <div className="text-center space-y-2">
            <h3 className="text-2xl font-black text-white">
              Through Online <span className="gradient-text-emerald">Learning</span>
            </h3>
            <p className="text-xs text-slate-400">Select a category to explore platform capabilities</p>

            {/* Tab Pill Buttons */}
            <div className="flex justify-center gap-2 pt-4">
              <button
                onClick={() => setActiveTab('academic')}
                className={`py-2 px-5 rounded-xl text-xs font-bold transition-all ${
                  activeTab === 'academic'
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/40'
                    : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                Academic Features
              </button>
              <button
                onClick={() => setActiveTab('pedagogy')}
                className={`py-2 px-5 rounded-xl text-xs font-bold transition-all ${
                  activeTab === 'pedagogy'
                    ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/40'
                    : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                Learning Pedagogy
              </button>
              <button
                onClick={() => setActiveTab('support')}
                className={`py-2 px-5 rounded-xl text-xs font-bold transition-all ${
                  activeTab === 'support'
                    ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/40'
                    : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                Student Support
              </button>
            </div>
          </div>

          {/* Active Tab Content Display */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-slate-300">
            {activeTab === 'academic' && (
              <>
                <div className="p-4 rounded-2xl bg-slate-900/90 border border-indigo-500/20 space-y-2 flex items-start gap-3">
                  <span className="text-xl">📅</span>
                  <div>
                    <h4 className="font-bold text-white text-sm">Daily Tasks & Homework</h4>
                    <p className="text-slate-400 mt-0.5">Submit lab assignments and track instructor evaluation feedback.</p>
                  </div>
                </div>
                <div className="p-4 rounded-2xl bg-slate-900/90 border border-indigo-500/20 space-y-2 flex items-start gap-3">
                  <span className="text-xl">💻</span>
                  <div>
                    <h4 className="font-bold text-white text-sm">E-Learning Classes</h4>
                    <p className="text-slate-400 mt-0.5">Structured video lectures and code walk-throughs for CS/IT subjects.</p>
                  </div>
                </div>
                <div className="p-4 rounded-2xl bg-slate-900/90 border border-indigo-500/20 space-y-2 flex items-start gap-3">
                  <span className="text-xl">🧪</span>
                  <div>
                    <h4 className="font-bold text-white text-sm">Regular Activity Classes</h4>
                    <p className="text-slate-400 mt-0.5">Hands-on lab experiments, coding challenges, and live project work.</p>
                  </div>
                </div>
                <div className="p-4 rounded-2xl bg-slate-900/90 border border-indigo-500/20 space-y-2 flex items-start gap-3">
                  <span className="text-xl">🌐</span>
                  <div>
                    <h4 className="font-bold text-white text-sm">Live + Recorded Sessions</h4>
                    <p className="text-slate-400 mt-0.5">Never miss a class with archived lecture recordings accessible 24/7.</p>
                  </div>
                </div>
              </>
            )}

            {activeTab === 'pedagogy' && (
              <>
                <div className="p-4 rounded-2xl bg-slate-900/90 border border-purple-500/20 space-y-2 flex items-start gap-3">
                  <span className="text-xl">🔁</span>
                  <div>
                    <h4 className="font-bold text-white text-sm">Learn, Practice, Master, Repeat</h4>
                    <p className="text-slate-400 mt-0.5">Iterative learning methodology designed for deep skill retention.</p>
                  </div>
                </div>
                <div className="p-4 rounded-2xl bg-slate-900/90 border border-purple-500/20 space-y-2 flex items-start gap-3">
                  <span className="text-xl">📚</span>
                  <div>
                    <h4 className="font-bold text-white text-sm">100+ Free Courses Available</h4>
                    <p className="text-slate-400 mt-0.5">Comprehensive diploma subject notes, syllabus topics, and reference PDFs.</p>
                  </div>
                </div>
                <div className="p-4 rounded-2xl bg-slate-900/90 border border-purple-500/20 space-y-2 flex items-start gap-3">
                  <span className="text-xl">👨‍🏫</span>
                  <div>
                    <h4 className="font-bold text-white text-sm">Experienced Faculty Guidance</h4>
                    <p className="text-slate-400 mt-0.5">Instructors with over 20+ years of domain expertise in technical education.</p>
                  </div>
                </div>
                <div className="p-4 rounded-2xl bg-slate-900/90 border border-purple-500/20 space-y-2 flex items-start gap-3">
                  <span className="text-xl">⚡</span>
                  <div>
                    <h4 className="font-bold text-white text-sm">Engaging Interactive Modules</h4>
                    <p className="text-slate-400 mt-0.5">Rich multimedia content tailored for fast grasp of complex topics.</p>
                  </div>
                </div>
              </>
            )}

            {activeTab === 'support' && (
              <>
                <div className="p-4 rounded-2xl bg-slate-900/90 border border-emerald-500/20 space-y-2 flex items-start gap-3">
                  <span className="text-xl">🎧</span>
                  <div>
                    <h4 className="font-bold text-white text-sm">Help Center & Enquiry Support</h4>
                    <p className="text-slate-400 mt-0.5">Direct line to admin and faculty for academic and technical queries.</p>
                  </div>
                </div>
                <div className="p-4 rounded-2xl bg-slate-900/90 border border-emerald-500/20 space-y-2 flex items-start gap-3">
                  <span className="text-xl">📝</span>
                  <div>
                    <h4 className="font-bold text-white text-sm">Exam Solved Question Papers</h4>
                    <p className="text-slate-400 mt-0.5">BTEUP previous years question paper archives with model answers.</p>
                  </div>
                </div>
                <div className="p-4 rounded-2xl bg-slate-900/90 border border-emerald-500/20 space-y-2 flex items-start gap-3">
                  <span className="text-xl">🛠️</span>
                  <div>
                    <h4 className="font-bold text-white text-sm">Basic to Advanced Skill Labs</h4>
                    <p className="text-slate-400 mt-0.5">Gradual progression from fundamental programming to MERN stack projects.</p>
                  </div>
                </div>
                <div className="p-4 rounded-2xl bg-slate-900/90 border border-emerald-500/20 space-y-2 flex items-start gap-3">
                  <span className="text-xl">💬</span>
                  <div>
                    <h4 className="font-bold text-white text-sm">Live Doubts Recovery Classes</h4>
                    <p className="text-slate-400 mt-0.5">Dedicated doubt clearing sessions prior to board examinations.</p>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Project Introduction Card */}
        <div className="glass-panel p-8 sm:p-10 rounded-3xl border border-slate-800 space-y-4 relative overflow-hidden">
          <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none"></div>
          <span className="text-xs font-bold text-indigo-400 uppercase tracking-widest block">Project Abstract</span>
          <h3 className="text-2xl sm:text-3xl font-black text-white">About E-Study Corner</h3>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed text-justify">
            Professional education is rapidly evolving. Industry requirements demand students to possess real-world, practical skills. E-Study Corner acts as a bridge of communication amongst students across different branches and institutions.
          </p>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed text-justify">
            Smart Learning Pathashala is a personalized web portal created to meet all academic requirements of diploma students at a single platform — providing anytime/anywhere access to online learning, assignments, performance evaluation, and technical study notes.
          </p>
        </div>
      </section>

      {/* Floating Enquiry Modal Trigger */}
      <EnquiryModal />

      {/* Project Credits Footer */}
      <footer className="mt-auto border-t border-slate-800/80 bg-slate-950/90 py-10 px-4 sm:px-8 text-xs text-slate-400">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
          <div className="space-y-1">
            <div className="font-extrabold text-white text-sm">Government Polytechnic Aurai, Bhadohi (U.P.)</div>
            <div className="text-slate-400">Department of Computer Science & Engineering · BTEUP Session June 2024</div>
            <div className="text-[11px] text-slate-500">Affiliate to Board of Technical Education Uttar Pradesh, Lucknow</div>
          </div>

          <div className="text-xs space-y-1 bg-slate-900/60 p-3.5 rounded-2xl border border-slate-800">
            <div><strong className="text-indigo-400">Project Team:</strong> Mayank Singh, Abhay Patel, Rohit Kannaujiya</div>
            <div><strong className="text-purple-400">Under Guidance of:</strong> Er. Durgesh Nandani (Lecturer)</div>
            <div><strong className="text-emerald-400">HOD & Supervisor:</strong> Dr. Rajeev Kumar & Er. S.P. Srivastava</div>
          </div>

          <div className="text-slate-500">
            Copyright &copy; {new Date().getFullYear()} E-Study Corner. All Rights Reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
