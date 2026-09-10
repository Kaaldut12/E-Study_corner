// frontend/src/pages/General/Home.jsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import NotificationMarquee from '../../components/common/NotificationMarquee';
import EnquiryModal from '../../components/common/EnquiryModal';
import PublicNavbar from '../../components/common/PublicNavbar';

const QUOTES_CAROUSEL = [
  {
    tag: 'Smart Learning Pathashala',
    title: 'Digital Portal for Computer Science & Technical Education',
    quote: 'Personalized e-learning platform designed to meet the academic and career requirements of students across all disciplines and degrees.',
    badgeColor: 'from-indigo-500/20 to-purple-500/20 text-indigo-300 border-indigo-500/40',
    bgGradient: 'from-indigo-950/80 via-slate-950 to-purple-950/80'
  },
  {
    tag: 'Continuous Innovation',
    title: 'Learn, Practice, Master & Excel',
    quote: '"Education is a continuous process, it\'s like a bicycle if you don\'t pedal you don\'t move forward."',
    badgeColor: 'from-purple-500/20 to-pink-500/20 text-purple-300 border-purple-500/40',
    bgGradient: 'from-purple-950/80 via-slate-950 to-indigo-950/80'
  },
  {
    tag: 'Mind & Knowledge Training',
    title: 'Real-world Practical Skill Mastery',
    quote: '"The aim of education is not to learn facts but the main aim of education is to train the mind." - Albert Einstein',
    badgeColor: 'from-blue-500/20 to-indigo-500/20 text-blue-300 border-blue-500/40',
    bgGradient: 'from-blue-950/80 via-slate-950 to-purple-950/80'
  },
  {
    tag: 'Industry Ready Skills',
    title: 'Empowering Technical Education',
    quote: '"Education is the most powerful weapon you can use to change the world." - B.B. King',
    badgeColor: 'from-emerald-500/20 to-teal-500/20 text-emerald-300 border-emerald-500/40',
    bgGradient: 'from-slate-950 via-indigo-950/80 to-purple-950/80'
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
    <div id="top" className="site-shell min-h-screen bg-[#070a12] text-slate-100 flex flex-col font-sans relative overflow-hidden">
      {/* Dynamic Background Ambient Glowing Blobs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-16 left-10 w-[30rem] h-[30rem] bg-indigo-600/15 rounded-full blur-[140px] animate-float-slow" />
        <div className="absolute top-96 right-10 w-[32rem] h-[32rem] bg-purple-600/15 rounded-full blur-[160px] animate-float-reverse" />
        <div className="absolute bottom-20 left-1/3 w-96 h-96 bg-emerald-600/10 rounded-full blur-[120px] animate-pulse-glow" />
      </div>

      {/* Marquee Ticker */}
      <NotificationMarquee />

      {/* Public Navbar */}
      <PublicNavbar />

      {/* Hero Carousel Banner */}
      <section className="home-hero relative min-h-[440px] sm:min-h-[500px] h-auto py-10 sm:py-16 overflow-hidden flex items-center justify-center border-b border-slate-800/80 z-10">
        {QUOTES_CAROUSEL.map((slide, index) => (
          <div
            key={index}
            className={`home-slide absolute inset-0 transition-all duration-1000 flex items-center justify-center p-4 sm:p-6 text-center bg-linear-to-b ${slide.bgGradient} ${
              index === currentSlide ? 'opacity-100 scale-100 z-10' : 'opacity-0 scale-95 z-0 pointer-events-none'
            }`}
          >
            <div className="max-w-4xl space-y-4 sm:space-y-6 animate-fade-in">
              <span className={`px-3 sm:px-4 py-1 sm:py-1.5 rounded-full bg-linear-to-r ${slide.badgeColor} text-[10px] sm:text-xs font-extrabold uppercase tracking-widest border backdrop-blur-md shadow-lg`}>
                ✨ {slide.tag}
              </span>
              <h1 className="text-2xl sm:text-5xl lg:text-6xl font-black text-white leading-tight tracking-tight font-display drop-shadow-lg">
                {slide.title}
              </h1>
              <p className="text-xs sm:text-lg text-slate-300 italic font-serif max-w-2xl mx-auto leading-relaxed drop-shadow">
                {slide.quote}
              </p>
              <div className="pt-2 sm:pt-3 flex flex-wrap justify-center gap-3 sm:gap-4">
                <Link
                  to="/register"
                  className="py-2.5 sm:py-3.5 px-5 sm:px-8 rounded-2xl btn-premium text-white text-xs font-extrabold shadow-brand tracking-wide"
                >
                  🚀 Get Started Free
                </Link>
                <Link
                  to="/login"
                  className="py-2.5 sm:py-3.5 px-5 sm:px-8 rounded-2xl btn-secondary text-slate-200 text-xs font-bold"
                >
                  📖 Explore Course Materials
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
              aria-label={`Slide ${idx + 1}`}
              className={`h-2.5 rounded-full transition-all duration-300 ${
                idx === currentSlide
                  ? 'bg-brand w-10 shadow-lg shadow-indigo-500/50 scale-105'
                  : 'bg-slate-800 hover:bg-slate-600 w-3'
              }`}
            />
          ))}
        </div>
      </section>

      {/* KPI Stats Counter Ribbon */}
      <section className="home-stats border-b border-slate-800/80 bg-slate-950/70 backdrop-blur-md py-5 sm:py-8 px-4 relative z-10">
        <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-6 text-center">
          <div className="glass-panel glass-panel-hover p-3.5 sm:p-5 rounded-2xl">
            <div className="text-2xl sm:text-4xl font-black t-brand-grad font-display">100+</div>
            <div className="text-[11px] sm:text-xs text-slate-400 font-medium mt-0.5">Free Study Courses</div>
          </div>
          <div className="glass-panel glass-panel-hover p-3.5 sm:p-5 rounded-2xl">
            <div className="text-2xl sm:text-4xl font-black text-emerald-400 font-display">20+ Yrs</div>
            <div className="text-[11px] sm:text-xs text-slate-400 font-medium mt-0.5">Faculty Experience</div>
          </div>
          <div className="glass-panel glass-panel-hover p-3.5 sm:p-5 rounded-2xl">
            <div className="text-2xl sm:text-4xl font-black text-amber-400 font-display">100%</div>
            <div className="text-[11px] sm:text-xs text-slate-400 font-medium mt-0.5">Free Student Access</div>
          </div>
          <div className="glass-panel glass-panel-hover p-3.5 sm:p-5 rounded-2xl">
            <div className="text-2xl sm:text-4xl font-black text-indigo-300 font-display">All Streams</div>
            <div className="text-[11px] sm:text-xs text-slate-400 font-medium mt-0.5">Accredited Syllabus</div>
          </div>
        </div>
      </section>

      {/* Main Content Sections */}
      <section className="py-8 sm:py-14 px-3.5 sm:px-8 max-w-7xl mx-auto space-y-8 sm:space-y-14 w-full relative z-10">
        {/* Student Services Section */}
        <div id="services" className="space-y-6 sm:space-y-10 scroll-mt-24">
          <div className="text-center space-y-2 sm:space-y-3">
            <span className="px-3.5 py-1 rounded-full bg-brand-subtle text-indigo-400 border border-brand text-[10px] sm:text-xs font-extrabold uppercase tracking-widest">
              Digital Learning Experience
            </span>
            <h2 className="text-2xl sm:text-5xl font-black text-white font-display">
              Student <span className="t-brand-grad font-display">Services</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 max-w-2xl mx-auto leading-relaxed">
              Empowering technical education with flexible online tools, interactive courseware, and direct teacher guidance.
            </p>
          </div>

          {/* 3 Interactive Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
            <div className="glass-panel glass-panel-hover glass-card-accent p-5 sm:p-7 rounded-2xl sm:rounded-3xl space-y-3 sm:space-y-4 group">
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-indigo-500/15 border border-indigo-500/30 text-indigo-400 flex items-center justify-center text-2xl sm:text-3xl font-bold group-hover:scale-110 group-hover:rotate-6 transition-all shadow-md">
                💻
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-white group-hover:text-indigo-300 transition-colors font-display">
                Facilities of Online Classes
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Flexible online education enabling all students to complete coursework, labs, and projects seamlessly from any location.
              </p>
            </div>

            <div className="glass-panel glass-panel-hover glass-card-accent p-5 sm:p-7 rounded-2xl sm:rounded-3xl space-y-3 sm:space-y-4 group">
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-purple-500/15 border border-purple-500/30 text-purple-400 flex items-center justify-center text-2xl sm:text-3xl font-bold group-hover:scale-110 group-hover:rotate-6 transition-all shadow-md">
                🎥
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-white group-hover:text-purple-300 transition-colors font-display">
                Daily Live Classes
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Daily live interactive sessions, recorded lecture archives, and practical task guidance by experienced faculty and lecturers.
              </p>
            </div>

            <div className="glass-panel glass-panel-hover glass-card-accent p-5 sm:p-7 rounded-2xl sm:rounded-3xl space-y-3 sm:space-y-4 group">
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center text-2xl sm:text-3xl font-bold group-hover:scale-110 group-hover:rotate-6 transition-all shadow-md">
                📚
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-white group-hover:text-emerald-300 transition-colors font-display">
                100+ Free Courses & Notes
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Comprehensive subject study notes, lab manuals, solved question banks, and syllabus guides available 24/7.
              </p>
            </div>
          </div>
        </div>

        {/* Tabbed Learning Features Component */}
        <div id="academics" className="glass-panel p-5 sm:p-8 lg:p-10 rounded-2xl sm:rounded-3xl border border-slate-800 space-y-6 sm:space-y-8 shadow-2xl scroll-mt-24">
          <div className="text-center space-y-2">
            <h3 className="text-2xl sm:text-3xl font-black text-white font-display">
              Through Online <span className="t-brand-grad font-display">Learning</span>
            </h3>
            <p className="text-xs text-slate-400">Select a category to explore platform capabilities</p>

            {/* Tab Pill Buttons */}
            <div className="flex flex-wrap justify-center gap-2 pt-4">
              <button
                onClick={() => setActiveTab('academic')}
                className={`py-2 px-5 rounded-xl text-xs font-bold transition-all ${
                  activeTab === 'academic'
                    ? 'bg-brand text-white shadow-brand ring-1 ring-white/20'
                    : 'bg-slate-900/80 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                Academic Features
              </button>
              <button
                onClick={() => setActiveTab('pedagogy')}
                className={`py-2 px-5 rounded-xl text-xs font-bold transition-all ${
                  activeTab === 'pedagogy'
                    ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/40 ring-1 ring-white/20'
                    : 'bg-slate-900/80 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                Learning Pedagogy
              </button>
              <button
                onClick={() => setActiveTab('support')}
                className={`py-2 px-5 rounded-xl text-xs font-bold transition-all ${
                  activeTab === 'support'
                    ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/40 ring-1 ring-white/20'
                    : 'bg-slate-900/80 text-slate-400 hover:text-white border border-slate-800'
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
                <div className="p-4 rounded-2xl bg-slate-900/80 border border-indigo-500/20 space-y-2 flex items-start gap-3 hover:border-indigo-500/40 transition">
                  <span className="text-2xl p-2 rounded-xl bg-indigo-500/10">📅</span>
                  <div>
                    <h4 className="font-bold text-white text-sm font-display">Daily Tasks & Homework</h4>
                    <p className="text-slate-400 mt-0.5">Submit lab assignments and track instructor evaluation feedback.</p>
                  </div>
                </div>
                <div className="p-4 rounded-2xl bg-slate-900/80 border border-indigo-500/20 space-y-2 flex items-start gap-3 hover:border-indigo-500/40 transition">
                  <span className="text-2xl p-2 rounded-xl bg-indigo-500/10">💻</span>
                  <div>
                    <h4 className="font-bold text-white text-sm font-display">E-Learning Classes</h4>
                    <p className="text-slate-400 mt-0.5">Structured video lectures and code walk-throughs for CS/IT subjects.</p>
                  </div>
                </div>
                <div className="p-4 rounded-2xl bg-slate-900/80 border border-indigo-500/20 space-y-2 flex items-start gap-3 hover:border-indigo-500/40 transition">
                  <span className="text-2xl p-2 rounded-xl bg-indigo-500/10">🧪</span>
                  <div>
                    <h4 className="font-bold text-white text-sm font-display">Regular Activity Classes</h4>
                    <p className="text-slate-400 mt-0.5">Hands-on lab experiments, coding challenges, and live project work.</p>
                  </div>
                </div>
                <div className="p-4 rounded-2xl bg-slate-900/80 border border-indigo-500/20 space-y-2 flex items-start gap-3 hover:border-indigo-500/40 transition">
                  <span className="text-2xl p-2 rounded-xl bg-indigo-500/10">🌐</span>
                  <div>
                    <h4 className="font-bold text-white text-sm font-display">Live + Recorded Sessions</h4>
                    <p className="text-slate-400 mt-0.5">Never miss a class with archived lecture recordings accessible 24/7.</p>
                  </div>
                </div>
              </>
            )}

            {activeTab === 'pedagogy' && (
              <>
                <div className="p-4 rounded-2xl bg-slate-900/80 border border-purple-500/20 space-y-2 flex items-start gap-3 hover:border-purple-500/40 transition">
                  <span className="text-2xl p-2 rounded-xl bg-purple-500/10">🔁</span>
                  <div>
                    <h4 className="font-bold text-white text-sm font-display">Learn, Practice, Master, Repeat</h4>
                    <p className="text-slate-400 mt-0.5">Iterative learning methodology designed for deep skill retention.</p>
                  </div>
                </div>
                <div className="p-4 rounded-2xl bg-slate-900/80 border border-purple-500/20 space-y-2 flex items-start gap-3 hover:border-purple-500/40 transition">
                  <span className="text-2xl p-2 rounded-xl bg-purple-500/10">📚</span>
                  <div>
                    <h4 className="font-bold text-white text-sm font-display">100+ Free Courses Available</h4>
                    <p className="text-slate-400 mt-0.5">Comprehensive subject notes, syllabus topics, reference PDFs, and technical tutorials.</p>
                  </div>
                </div>
                <div className="p-4 rounded-2xl bg-slate-900/80 border border-purple-500/20 space-y-2 flex items-start gap-3 hover:border-purple-500/40 transition">
                  <span className="text-2xl p-2 rounded-xl bg-purple-500/10">👨‍🏫</span>
                  <div>
                    <h4 className="font-bold text-white text-sm font-display">Experienced Faculty Guidance</h4>
                    <p className="text-slate-400 mt-0.5">Instructors with over 20+ years of domain expertise in technical education.</p>
                  </div>
                </div>
                <div className="p-4 rounded-2xl bg-slate-900/80 border border-purple-500/20 space-y-2 flex items-start gap-3 hover:border-purple-500/40 transition">
                  <span className="text-2xl p-2 rounded-xl bg-purple-500/10">⚡</span>
                  <div>
                    <h4 className="font-bold text-white text-sm font-display">Engaging Interactive Modules</h4>
                    <p className="text-slate-400 mt-0.5">Rich multimedia content tailored for fast grasp of complex topics.</p>
                  </div>
                </div>
              </>
            )}

            {activeTab === 'support' && (
              <>
                <div className="p-4 rounded-2xl bg-slate-900/80 border border-emerald-500/20 space-y-2 flex items-start gap-3 hover:border-emerald-500/40 transition">
                  <span className="text-2xl p-2 rounded-xl bg-emerald-500/10">🎧</span>
                  <div>
                    <h4 className="font-bold text-white text-sm font-display">Help Center & Enquiry Support</h4>
                    <p className="text-slate-400 mt-0.5">Direct line to admin and faculty for academic and technical queries.</p>
                  </div>
                </div>
                <div className="p-4 rounded-2xl bg-slate-900/80 border border-emerald-500/20 space-y-2 flex items-start gap-3 hover:border-emerald-500/40 transition">
                  <span className="text-2xl p-2 rounded-xl bg-emerald-500/10">📝</span>
                  <div>
                    <h4 className="font-bold text-white text-sm font-display">Exam Solved Question Papers</h4>
                    <p className="text-slate-400 mt-0.5">Comprehensive previous years question paper archives with model solutions and answer rubrics.</p>
                  </div>
                </div>
                <div className="p-4 rounded-2xl bg-slate-900/80 border border-emerald-500/20 space-y-2 flex items-start gap-3 hover:border-emerald-500/40 transition">
                  <span className="text-2xl p-2 rounded-xl bg-emerald-500/10">🛠️</span>
                  <div>
                    <h4 className="font-bold text-white text-sm font-display">Basic to Advanced Skill Labs</h4>
                    <p className="text-slate-400 mt-0.5">Gradual progression from fundamental programming to MERN stack projects.</p>
                  </div>
                </div>
                <div className="p-4 rounded-2xl bg-slate-900/80 border border-emerald-500/20 space-y-2 flex items-start gap-3 hover:border-emerald-500/40 transition">
                  <span className="text-2xl p-2 rounded-xl bg-emerald-500/10">💬</span>
                  <div>
                    <h4 className="font-bold text-white text-sm font-display">Live Doubts Recovery Classes</h4>
                    <p className="text-slate-400 mt-0.5">Dedicated doubt clearing sessions prior to board examinations.</p>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Project Introduction Card */}
        <div id="about" className="glass-panel p-5 sm:p-8 lg:p-10 rounded-2xl sm:rounded-3xl border border-slate-800 space-y-3 sm:space-y-4 relative overflow-hidden scroll-mt-24">
          <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />
          <span className="text-xs font-extrabold t-brand uppercase tracking-widest block">Project Abstract</span>
          <h3 className="text-xl sm:text-3xl font-black text-white font-display">About E-Study Corner</h3>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed text-justify">
            Professional education is rapidly evolving. Industry requirements demand students to possess real-world, practical skills. E-Study Corner acts as a bridge of communication amongst students across different branches and institutions.
          </p>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed text-justify">
            Smart Learning Pathashala is a personalized web portal created to meet all academic requirements of every student — providing anytime/anywhere access to online learning, assignments, performance evaluation, and comprehensive technical study notes.
          </p>
        </div>
      </section>

      {/* Floating Enquiry Modal Trigger */}
      <EnquiryModal />

      {/* Project Credits Footer */}
      <footer id="contact" className="mt-auto border-t border-slate-800/80 bg-slate-950/90 py-6 sm:py-8 px-4 sm:px-8 text-xs text-slate-400 scroll-mt-24 relative z-10">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
          <div className="space-y-1">
            <div className="font-black text-white text-sm font-display">{import.meta.env.VITE_COLLEGE_NAME || 'National Institute of Technology & Advanced Studies'}</div>
            <div className="text-slate-400">{import.meta.env.VITE_COLLEGE_DEPT || 'Department of Computer Science & Engineering'} · Academic Portal</div>
            <div className="text-[11px] text-slate-500">Autonomous Institute & Higher Technical Education Center</div>
          </div>

          <div className="text-xs space-y-1 bg-slate-900/70 p-4 rounded-2xl border border-slate-800">
            <div><strong className="text-indigo-400">Project Team:</strong> {import.meta.env.VITE_PROJECT_TEAM || 'Computer Science & Engineering Student Team'}</div>
            <div><strong className="text-purple-400">Under Guidance of:</strong> {import.meta.env.VITE_PROJECT_GUIDE || 'Department Faculty Lecturer'}</div>
            <div><strong className="text-emerald-400">HOD & Supervisor:</strong> {import.meta.env.VITE_PROJECT_HOD || 'Head of Department & Academic Supervisor'}</div>
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
