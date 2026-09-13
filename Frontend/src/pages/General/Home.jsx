import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles,
  ArrowRight,
  BookOpen,
  Laptop,
  Video,
  GraduationCap,
  CheckCircle2,
  Bot,
  Cpu,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Award,
  Layers,
  Code,
  CalendarCheck,
  FlaskConical,
  Globe,
  RefreshCw,
  Users,
  Zap,
  Headphones,
  FileText,
  Wrench,
  MessageSquare,
  ExternalLink
} from 'lucide-react';
import NotificationMarquee from '../../components/common/NotificationMarquee';
import EnquiryModal from '../../components/common/EnquiryModal';
import PublicNavbar from '../../components/common/PublicNavbar';

const HERO_SLIDES = [
  {
    id: 'learning',
    tag: 'Academic Curriculum & Labs',
    tagIcon: BookOpen,
    badgeColor: 'bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border-indigo-500/30',
    title: 'University-Standard Curriculum',
    titleAccent: '& Academic Architecture',
    subtitle: 'Access verified subject syllabi, lab manuals, and solved question archives across technical engineering disciplines.',
    highlights: ['100+ Free Subject Modules', 'Self-Paced Learning', 'Direct Teacher Guidance'],
    primaryCta: { label: 'Get Started Free', to: '/register' },
    secondaryCta: { label: 'Explore Coursework', to: '/login' },
    previewType: 'course'
  },
  {
    id: 'ai-coach',
    tag: 'Intelligent AI Study Assistant',
    tagIcon: Bot,
    badgeColor: 'bg-purple-500/10 text-purple-700 dark:text-purple-300 border-purple-500/30',
    title: '24/7 AI Study Coach',
    titleAccent: '& Code Debugging Tutor',
    subtitle: 'Ask complex coding doubts, explore step-by-step algorithms, and generate practice diagnostic questions in real time.',
    highlights: ['Instant Code Explanations', 'Diagnostic Practice Quizzes', 'Offline Fallback Engine'],
    primaryCta: { label: 'Try AI Study Coach', to: '/student/ai-coach' },
    secondaryCta: { label: 'Practice Quizzes', to: '/student/quizzes' },
    previewType: 'ai'
  },
  {
    id: 'classroom',
    tag: 'Academic Governance & Classroom',
    tagIcon: GraduationCap,
    badgeColor: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/30',
    title: 'Seamless Coursework, Attendance',
    titleAccent: '& Faculty Grading Evaluation',
    subtitle: 'Submit assignments with code attachments, receive instructor feedback, and track daily attendance with instant leave synchronization.',
    highlights: ['Automated Attendance Audit', 'Faculty Homework Grading', 'Leave Approvals Workflow'],
    primaryCta: { label: 'Access Student Portal', to: '/login' },
    secondaryCta: { label: 'Instructor Console', to: '/login' },
    previewType: 'stats'
  },
  {
    id: 'architecture',
    tag: 'Engineered by Abhay Patel',
    tagIcon: Cpu,
    badgeColor: 'bg-sky-500/10 text-sky-700 dark:text-sky-300 border-sky-500/30',
    title: 'Engineered for Performance',
    titleAccent: '& Dual-Database Persistence',
    subtitle: 'Designed with React 19, Tailwind CSS, Express, and a dual-step MongoDB Atlas Cloud engine paired with local replica backups.',
    highlights: ['React 19 & Tailwind CSS', 'Dual-Step Database Sync', 'Role-Based Access Control'],
    primaryCta: { label: 'Explore Platform', to: '/register' },
    secondaryCta: { label: 'Meet the Developer', to: '#about', isHash: true },
    previewType: 'tech'
  }
];

const renderSlidePreview = (type) => {
  switch (type) {
    case 'course':
      return (
        <div className="glass-panel p-5 sm:p-6 rounded-3xl border border-slate-200/90 dark:border-slate-800/90 bg-white/95 dark:bg-slate-900/95 shadow-xl space-y-4 max-w-md mx-auto w-full text-left">
          <div className="flex items-center justify-between">
            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border border-indigo-500/20">
              Computer Science · Semester IV
            </span>
            <span className="flex items-center gap-1.5 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              Active Course
            </span>
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white font-display">
              Cloud Systems & Distributed Computing
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Microservices architecture, consensus algorithms & Docker containerization.
            </p>
          </div>
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-semibold text-slate-700 dark:text-slate-300">
              <span>Syllabus Progress</span>
              <span className="text-brand font-bold">72% (18 / 25 Modules)</span>
            </div>
            <div className="h-2 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
              <div className="h-full rounded-full bg-brand" style={{ width: '72%' }} />
            </div>
          </div>
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-indigo-500/20 text-indigo-600 dark:text-indigo-300 font-bold flex items-center justify-center text-xs">
                CS
              </div>
              <span className="text-slate-600 dark:text-slate-400 font-medium">Faculty of Computing</span>
            </div>
            <span className="text-brand font-bold flex items-center gap-1">
              Resume <ArrowRight className="w-3.5 h-3.5" />
            </span>
          </div>
        </div>
      );

    case 'ai':
      return (
        <div className="glass-panel p-5 sm:p-6 rounded-3xl border border-slate-200/90 dark:border-slate-800/90 bg-white/95 dark:bg-slate-900/95 shadow-xl space-y-3.5 max-w-md mx-auto w-full text-left">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-purple-500/20 text-purple-600 dark:text-purple-300 flex items-center justify-center">
                <Bot className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs font-bold text-slate-900 dark:text-white block leading-none">AI Study Coach</span>
                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">Online · 24/7 Intelligent Tutor</span>
              </div>
            </div>
            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-purple-500/10 text-purple-600 dark:text-purple-300 border border-purple-500/20">
              Live AI
            </span>
          </div>

          {/* Chat Sample */}
          <div className="space-y-2.5 text-xs">
            <div className="flex justify-end">
              <div className="p-2.5 rounded-2xl rounded-tr-xs bg-brand text-white font-medium max-w-[85%] text-xs shadow-xs">
                How does Binary Search achieve O(log n) efficiency?
              </div>
            </div>
            <div className="flex justify-start">
              <div className="p-3 rounded-2xl rounded-tl-xs bg-slate-100 dark:bg-slate-800/90 text-slate-800 dark:text-slate-200 border border-slate-200/70 dark:border-slate-700/60 max-w-[95%] space-y-1.5 shadow-xs">
                <p className="font-semibold text-brand text-[11px]">Key Intuition:</p>
                <p className="text-[11px] leading-relaxed">
                  On sorted arrays, each midpoint comparison cuts the candidate search interval in half:
                </p>
                <div className="font-mono text-[10px] bg-slate-200/70 dark:bg-slate-950 p-2 rounded-lg text-indigo-700 dark:text-indigo-300">
                  N → N/2 → N/4 → ... → 1  =&gt;  T(N) = O(log₂ N)
                </div>
              </div>
            </div>
          </div>
        </div>
      );

    case 'stats':
      return (
        <div className="glass-panel p-5 sm:p-6 rounded-3xl border border-slate-200/90 dark:border-slate-800/90 bg-white/95 dark:bg-slate-900/95 shadow-xl space-y-3.5 max-w-md mx-auto w-full text-left">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <GraduationCap className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              <span className="text-xs font-bold text-slate-900 dark:text-white">Academic Performance Index</span>
            </div>
            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20">
              Grade A+
            </span>
          </div>
          <div className="grid grid-cols-2 gap-2.5">
            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-800">
              <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase block">Attendance Streak</span>
              <span className="text-lg font-black text-emerald-600 dark:text-emerald-400 font-display">96% · 18 Days</span>
            </div>
            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-800">
              <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase block">Coursework Score</span>
              <span className="text-lg font-black text-indigo-600 dark:text-indigo-400 font-display">94.5 / 100</span>
            </div>
          </div>
          <div className="p-3 rounded-2xl bg-emerald-50/70 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 text-xs">
            <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 uppercase block mb-0.5">Faculty Evaluation</span>
            <p className="text-slate-700 dark:text-slate-300 italic text-[11px]">
              "Exceptional coursework submission. Great understanding of graph traversal and complexity analysis."
            </p>
          </div>
        </div>
      );

    case 'tech':
      return (
        <div className="glass-panel p-5 sm:p-6 rounded-3xl border border-slate-200/90 dark:border-slate-800/90 bg-white/95 dark:bg-slate-900/95 shadow-xl space-y-3.5 max-w-md mx-auto w-full text-left">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <Cpu className="w-5 h-5 text-sky-600 dark:text-sky-400" />
              <span className="text-xs font-bold text-slate-900 dark:text-white">Full-Stack Tech Architecture</span>
            </div>
            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-sky-500/10 text-sky-700 dark:text-sky-300 border border-sky-500/20">
              Production Stack
            </span>
          </div>
          <div className="space-y-2 text-xs">
            <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-800 flex items-center justify-between">
              <span className="text-slate-500 dark:text-slate-400 font-medium">Client Tier</span>
              <span className="font-bold text-slate-800 dark:text-slate-200">React 19 + Tailwind v4 + Vite</span>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-800 flex items-center justify-between">
              <span className="text-slate-500 dark:text-slate-400 font-medium">Server Tier</span>
              <span className="font-bold text-slate-800 dark:text-slate-200">Express Node.js REST API</span>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-800 flex items-center justify-between">
              <span className="text-slate-500 dark:text-slate-400 font-medium">Dual-Step Data</span>
              <span className="font-bold text-emerald-600 dark:text-emerald-400">MongoDB Atlas + Local Replica</span>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-800 flex items-center justify-between">
              <span className="text-slate-500 dark:text-slate-400 font-medium">Access Control</span>
              <span className="font-bold text-indigo-600 dark:text-indigo-400">Role-Based (4 Tiers) + JWT</span>
            </div>
          </div>
        </div>
      );

    default:
      return null;
  }
};

const Home = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [activeTab, setActiveTab] = useState('academic');

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % HERO_SLIDES.length);
  }, []);

  const prevSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev - 1 + HERO_SLIDES.length) % HERO_SLIDES.length);
  }, []);

  useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(() => {
      nextSlide();
    }, 6000);
    return () => clearInterval(timer);
  }, [isPaused, nextSlide]);

  return (
    <div id="top" className="site-shell min-h-screen dark:bg-[#070a12] text-slate-900 dark:text-slate-100 flex flex-col font-sans relative overflow-hidden">
      {/* Marquee Ticker */}
      <NotificationMarquee />

      {/* Public Navbar */}
      <PublicNavbar />

      {/* Hero Slideshow Banner */}
      <section
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        className="home-hero relative min-h-[500px] sm:min-h-[540px] lg:min-h-[580px] py-10 sm:py-16 lg:py-20 overflow-hidden flex items-center justify-center border-b border-slate-200/90 dark:border-slate-800/80 bg-gradient-to-b from-slate-50 via-white to-slate-100/60 dark:from-slate-950 dark:via-slate-900/40 dark:to-slate-950 z-10"
      >
        {/* Subtle Ambient Radial Highlight */}
        <div
          className="absolute inset-0 pointer-events-none opacity-40 dark:opacity-20"
          style={{
            background: 'radial-gradient(ellipse 60% 50% at 50% 30%, var(--brand-glow), transparent)'
          }}
        />

        {/* Previous Slide Button */}
        <button
          type="button"
          onClick={prevSlide}
          aria-label="Previous Slide"
          className="absolute left-2 sm:left-6 top-1/2 -translate-y-1/2 z-20 w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-white/80 dark:bg-slate-900/80 hover:bg-white dark:hover:bg-slate-800 border border-slate-200/90 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-950 dark:hover:text-white shadow-md backdrop-blur-md flex items-center justify-center transition-all cursor-pointer group"
        >
          <ChevronLeft className="w-5 h-5 group-hover:-translate-x-0.5 transition-transform" />
        </button>

        {/* Next Slide Button */}
        <button
          type="button"
          onClick={nextSlide}
          aria-label="Next Slide"
          className="absolute right-2 sm:right-6 top-1/2 -translate-y-1/2 z-20 w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-white/80 dark:bg-slate-900/80 hover:bg-white dark:hover:bg-slate-800 border border-slate-200/90 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-950 dark:hover:text-white shadow-md backdrop-blur-md flex items-center justify-center transition-all cursor-pointer group"
        >
          <ChevronRight className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" />
        </button>

        {/* Slides Container */}
        <div className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-12 w-full relative z-10">
          {HERO_SLIDES.map((slide, index) => {
            const TagIcon = slide.tagIcon;
            const isActive = index === currentSlide;

            return (
              <div
                key={slide.id}
                className={`transition-all duration-700 ${
                  isActive
                    ? 'opacity-100 translate-y-0 relative z-10'
                    : 'opacity-0 absolute inset-0 pointer-events-none translate-y-4'
                }`}
              >
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
                  {/* Left Column: Headline, Description & CTAs */}
                  <div className="lg:col-span-7 space-y-4 sm:space-y-6 text-center lg:text-left">
                    <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 rounded-full border text-[11px] sm:text-xs font-extrabold uppercase tracking-wider backdrop-blur-md shadow-xs mx-auto lg:mx-0 font-display">
                      <TagIcon className="w-3.5 h-3.5 text-brand" />
                      <span className="text-slate-700 dark:text-slate-200">{slide.tag}</span>
                    </div>

                    <h1 className="text-3xl sm:text-5xl lg:text-5xl font-black text-slate-900 dark:text-white leading-tight tracking-tight font-display">
                      {slide.title}{' '}
                      <span className="t-brand-grad block sm:inline font-display">{slide.titleAccent}</span>
                    </h1>

                    <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 max-w-2xl mx-auto lg:mx-0 leading-relaxed font-normal">
                      {slide.subtitle}
                    </p>

                    {/* Highlights Row */}
                    <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2 sm:gap-3 pt-1">
                      {slide.highlights.map((hl, i) => (
                        <div
                          key={i}
                          className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-100/90 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800 text-[11px] sm:text-xs font-semibold text-slate-700 dark:text-slate-300"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                          <span>{hl}</span>
                        </div>
                      ))}
                    </div>

                    {/* CTA Actions */}
                    <div className="pt-2 sm:pt-4 flex flex-wrap items-center justify-center lg:justify-start gap-3 sm:gap-4">
                      <Link
                        to={slide.primaryCta.to}
                        className="py-3 px-6 sm:px-7 rounded-2xl btn-premium text-white text-xs font-extrabold shadow-brand tracking-wide flex items-center gap-2"
                      >
                        <span>{slide.primaryCta.label}</span>
                        <ArrowRight className="w-4 h-4" />
                      </Link>

                      {slide.secondaryCta.isHash ? (
                        <a
                          href={slide.secondaryCta.to}
                          className="py-3 px-5 sm:px-6 rounded-2xl btn-secondary text-slate-700 dark:text-slate-200 text-xs font-bold flex items-center gap-2"
                        >
                          <span>{slide.secondaryCta.label}</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </a>
                      ) : (
                        <Link
                          to={slide.secondaryCta.to}
                          className="py-3 px-5 sm:px-6 rounded-2xl btn-secondary text-slate-700 dark:text-slate-200 text-xs font-bold flex items-center gap-2"
                        >
                          <span>{slide.secondaryCta.label}</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                      )}
                    </div>
                  </div>

                  {/* Right Column: Live Feature Preview Card */}
                  <div className="lg:col-span-5 flex items-center justify-center">
                    {renderSlidePreview(slide.previewType)}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Custom Progress Indicators & Slide Counter */}
        <div className="absolute bottom-5 sm:bottom-6 z-20 flex items-center gap-3">
          <div className="flex items-center gap-1.5 p-1.5 rounded-full bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-slate-200/80 dark:border-slate-800 shadow-sm">
            {HERO_SLIDES.map((slide, idx) => (
              <button
                key={slide.id}
                type="button"
                onClick={() => setCurrentSlide(idx)}
                aria-label={`Go to slide ${idx + 1}: ${slide.title}`}
                className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                  idx === currentSlide
                    ? 'w-7 bg-brand shadow-xs'
                    : 'w-2 bg-slate-300 dark:bg-slate-700 hover:bg-slate-400 dark:hover:bg-slate-600'
                }`}
              />
            ))}
          </div>

          <span className="text-[11px] font-mono font-bold text-slate-500 dark:text-slate-400 px-2 py-0.5 rounded-md bg-slate-100/80 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800">
            0{currentSlide + 1} / 0{HERO_SLIDES.length}
          </span>
        </div>
      </section>

      {/* KPI Stats Counter Ribbon */}
      <section className="home-stats border-b border-slate-200/90 dark:border-slate-800/80 bg-white/80 dark:bg-slate-950/70 backdrop-blur-md py-5 sm:py-8 px-4 relative z-10">
        <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-6 text-center">
          <div className="glass-panel glass-panel-hover p-3.5 sm:p-5 rounded-2xl">
            <div className="text-2xl sm:text-4xl font-black t-brand-grad font-display">100+</div>
            <div className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">Free Study Courses</div>
          </div>
          <div className="glass-panel glass-panel-hover p-3.5 sm:p-5 rounded-2xl">
            <div className="text-2xl sm:text-4xl font-black text-emerald-600 dark:text-emerald-400 font-display">20+ Yrs</div>
            <div className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">Faculty Experience</div>
          </div>
          <div className="glass-panel glass-panel-hover p-3.5 sm:p-5 rounded-2xl">
            <div className="text-2xl sm:text-4xl font-black text-amber-600 dark:text-amber-400 font-display">100%</div>
            <div className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">Free Student Access</div>
          </div>
          <div className="glass-panel glass-panel-hover p-3.5 sm:p-5 rounded-2xl">
            <div className="text-2xl sm:text-4xl font-black text-indigo-600 dark:text-indigo-300 font-display">All Streams</div>
            <div className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">Accredited Syllabus</div>
          </div>
        </div>
      </section>

      {/* Main Content Sections */}
      <section className="py-8 sm:py-14 px-3.5 sm:px-8 max-w-7xl mx-auto space-y-8 sm:space-y-14 w-full relative z-10">
        {/* Student Services Section */}
        <div id="services" className="space-y-6 sm:space-y-10 scroll-mt-24">
          <div className="text-center space-y-2 sm:space-y-3">
            <span className="px-3.5 py-1 rounded-full bg-brand-subtle text-brand border border-brand text-[10px] sm:text-xs font-extrabold uppercase tracking-widest font-display">
              Digital Learning Experience
            </span>
            <h2 className="text-2xl sm:text-5xl font-black text-slate-900 dark:text-white font-display">
              Student <span className="t-brand-grad font-display">Services</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
              Empowering technical education with flexible online tools, interactive courseware, and direct teacher guidance.
            </p>
          </div>

          {/* 3 Interactive Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
            <div className="glass-panel glass-panel-hover p-5 sm:p-7 rounded-2xl sm:rounded-3xl space-y-3 sm:space-y-4 group bg-white/95 dark:bg-slate-900/90 border border-slate-200/90 dark:border-slate-800">
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-indigo-500/10 dark:bg-indigo-500/20 border border-indigo-500/30 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold group-hover:scale-110 transition-all shadow-xs">
                <Laptop className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-300 transition-colors font-display">
                Facilities of Online Classes
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Flexible online education enabling all students to complete coursework, labs, and projects seamlessly from any location.
              </p>
            </div>

            <div className="glass-panel glass-panel-hover p-5 sm:p-7 rounded-2xl sm:rounded-3xl space-y-3 sm:space-y-4 group bg-white/95 dark:bg-slate-900/90 border border-slate-200/90 dark:border-slate-800">
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-purple-500/10 dark:bg-purple-500/20 border border-purple-500/30 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold group-hover:scale-110 transition-all shadow-xs">
                <Video className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-300 transition-colors font-display">
                Daily Live Classes
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Daily live interactive sessions, recorded lecture archives, and practical task guidance by experienced faculty and lecturers.
              </p>
            </div>

            <div className="glass-panel glass-panel-hover p-5 sm:p-7 rounded-2xl sm:rounded-3xl space-y-3 sm:space-y-4 group bg-white/95 dark:bg-slate-900/90 border border-slate-200/90 dark:border-slate-800">
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-emerald-500/10 dark:bg-emerald-500/20 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold group-hover:scale-110 transition-all shadow-xs">
                <BookOpen className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-300 transition-colors font-display">
                100+ Free Courses & Notes
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Comprehensive subject study notes, lab manuals, solved question banks, and syllabus guides available 24/7.
              </p>
            </div>
          </div>
        </div>

        {/* Tabbed Learning Features Component */}
        <div id="academics" className="glass-panel p-5 sm:p-8 lg:p-10 rounded-2xl sm:rounded-3xl border border-slate-200/90 dark:border-slate-800 bg-white/95 dark:bg-slate-900/90 space-y-6 sm:space-y-8 shadow-xl scroll-mt-24">
          <div className="text-center space-y-2">
            <h3 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white font-display">
              Through Online <span className="t-brand-grad font-display">Learning</span>
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400">Select a category to explore platform capabilities</p>

            {/* Tab Pill Buttons */}
            <div className="flex flex-wrap justify-center gap-2 pt-4">
              <button
                type="button"
                onClick={() => setActiveTab('academic')}
                className={`py-2 px-5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'academic'
                    ? 'bg-brand text-white shadow-brand ring-1 ring-white/20'
                    : 'bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-700'
                }`}
              >
                Academic Features
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('pedagogy')}
                className={`py-2 px-5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'pedagogy'
                    ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/40 ring-1 ring-white/20'
                    : 'bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-700'
                }`}
              >
                Learning Pedagogy
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('support')}
                className={`py-2 px-5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'support'
                    ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/40 ring-1 ring-white/20'
                    : 'bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-700'
                }`}
              >
                Student Support
              </button>
            </div>
          </div>

          {/* Active Tab Content Display */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            {activeTab === 'academic' && (
              <>
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-indigo-500/20 space-y-2 flex items-start gap-3 hover:border-indigo-500/40 transition">
                  <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 shrink-0">
                    <CalendarCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-white text-sm font-display">Daily Tasks & Homework</h4>
                    <p className="text-slate-600 dark:text-slate-400 mt-0.5">Submit lab assignments and track instructor evaluation feedback.</p>
                  </div>
                </div>
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-indigo-500/20 space-y-2 flex items-start gap-3 hover:border-indigo-500/40 transition">
                  <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 shrink-0">
                    <Video className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-white text-sm font-display">E-Learning Classes</h4>
                    <p className="text-slate-600 dark:text-slate-400 mt-0.5">Structured video lectures and code walk-throughs for CS/IT subjects.</p>
                  </div>
                </div>
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-indigo-500/20 space-y-2 flex items-start gap-3 hover:border-indigo-500/40 transition">
                  <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 shrink-0">
                    <FlaskConical className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-white text-sm font-display">Regular Activity Classes</h4>
                    <p className="text-slate-600 dark:text-slate-400 mt-0.5">Hands-on lab experiments, coding challenges, and live project work.</p>
                  </div>
                </div>
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-indigo-500/20 space-y-2 flex items-start gap-3 hover:border-indigo-500/40 transition">
                  <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 shrink-0">
                    <Globe className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-white text-sm font-display">Live + Recorded Sessions</h4>
                    <p className="text-slate-600 dark:text-slate-400 mt-0.5">Never miss a class with archived lecture recordings accessible 24/7.</p>
                  </div>
                </div>
              </>
            )}

            {activeTab === 'pedagogy' && (
              <>
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-purple-500/20 space-y-2 flex items-start gap-3 hover:border-purple-500/40 transition">
                  <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 shrink-0">
                    <RefreshCw className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-white text-sm font-display">Learn, Practice, Master, Repeat</h4>
                    <p className="text-slate-600 dark:text-slate-400 mt-0.5">Iterative learning methodology designed for deep skill retention.</p>
                  </div>
                </div>
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-purple-500/20 space-y-2 flex items-start gap-3 hover:border-purple-500/40 transition">
                  <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 shrink-0">
                    <BookOpen className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-white text-sm font-display">100+ Free Courses Available</h4>
                    <p className="text-slate-600 dark:text-slate-400 mt-0.5">Comprehensive subject notes, syllabus topics, reference PDFs, and technical tutorials.</p>
                  </div>
                </div>
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-purple-500/20 space-y-2 flex items-start gap-3 hover:border-purple-500/40 transition">
                  <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 shrink-0">
                    <Users className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-white text-sm font-display">Experienced Faculty Guidance</h4>
                    <p className="text-slate-600 dark:text-slate-400 mt-0.5">Instructors with over 20+ years of domain expertise in technical education.</p>
                  </div>
                </div>
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-purple-500/20 space-y-2 flex items-start gap-3 hover:border-purple-500/40 transition">
                  <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 shrink-0">
                    <Zap className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-white text-sm font-display">Engaging Interactive Modules</h4>
                    <p className="text-slate-600 dark:text-slate-400 mt-0.5">Rich multimedia content tailored for fast grasp of complex topics.</p>
                  </div>
                </div>
              </>
            )}

            {activeTab === 'support' && (
              <>
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-emerald-500/20 space-y-2 flex items-start gap-3 hover:border-emerald-500/40 transition">
                  <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 shrink-0">
                    <Headphones className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-white text-sm font-display">Help Center & Enquiry Support</h4>
                    <p className="text-slate-600 dark:text-slate-400 mt-0.5">Direct line to admin and faculty for academic and technical queries.</p>
                  </div>
                </div>
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-emerald-500/20 space-y-2 flex items-start gap-3 hover:border-emerald-500/40 transition">
                  <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 shrink-0">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-white text-sm font-display">Exam Solved Question Papers</h4>
                    <p className="text-slate-600 dark:text-slate-400 mt-0.5">Comprehensive previous years question paper archives with model solutions and answer rubrics.</p>
                  </div>
                </div>
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-emerald-500/20 space-y-2 flex items-start gap-3 hover:border-emerald-500/40 transition">
                  <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 shrink-0">
                    <Wrench className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-white text-sm font-display">Basic to Advanced Skill Labs</h4>
                    <p className="text-slate-600 dark:text-slate-400 mt-0.5">Gradual progression from fundamental programming to MERN stack projects.</p>
                  </div>
                </div>
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-emerald-500/20 space-y-2 flex items-start gap-3 hover:border-emerald-500/40 transition">
                  <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 shrink-0">
                    <MessageSquare className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-white text-sm font-display">Live Doubts Recovery Classes</h4>
                    <p className="text-slate-600 dark:text-slate-400 mt-0.5">Dedicated doubt clearing sessions prior to board examinations.</p>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Project Introduction Card */}
        <div id="about" className="glass-panel p-5 sm:p-8 lg:p-10 rounded-2xl sm:rounded-3xl border border-slate-200/90 dark:border-slate-800 bg-white/95 dark:bg-slate-900/90 space-y-3 sm:space-y-4 relative overflow-hidden scroll-mt-24 shadow-xl">
          <span className="text-xs font-extrabold t-brand uppercase tracking-widest block font-display">Featured Portfolio Project</span>
          <h3 className="text-xl sm:text-3xl font-black text-slate-900 dark:text-white font-display">About E-Study Corner</h3>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed text-justify">
            E-Study Corner is an enterprise-grade, full-stack Learning Management & Academic Governance platform designed and engineered by <strong className="text-slate-900 dark:text-white font-semibold">Abhay Patel</strong>.
          </p>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed text-justify">
            Built with modern web standards, this platform features role-based access control for Students, Faculty, Administrators, and SuperAdmins. It includes automated attendance tracking, interactive quiz evaluation, coursework assignments, real-time email broadcasting via Nodemailer, and an innovative dual-step database persistence engine synchronizing MongoDB Atlas Cloud with local backups.
          </p>
        </div>
      </section>

      {/* Floating Enquiry Modal Trigger */}
      <EnquiryModal />

      {/* Developer Portfolio Footer */}
      <footer id="contact" className="mt-auto border-t border-slate-800/80 bg-slate-950/90 py-8 sm:py-12 px-4 sm:px-8 text-xs text-slate-400 scroll-mt-24 relative z-10">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-start justify-between gap-8">
          {/* Col 1: Platform Overview */}
          <div className="space-y-2 max-w-sm">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl overflow-hidden border border-brand/40 shadow-brand bg-slate-900 shrink-0">
                <img src="/logo.png" alt="Logo" className="w-full h-full object-cover" />
              </div>
              <span className="font-black text-lg text-white font-display">E-Study Corner</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              A comprehensive, production-ready Full-Stack Learning Management System built by <strong className="text-slate-200">Abhay Patel</strong> as a flagship software engineering portfolio project.
            </p>
            <div className="text-[11px] text-slate-500 pt-1">
              React 19 · Node.js · Express · MongoDB Atlas · Tailwind CSS
            </div>
          </div>

          {/* Col 2: Developer Portfolio Card */}
          <div className="text-xs space-y-2.5 bg-slate-900/80 p-5 rounded-2xl border border-slate-800/90 shadow-xl w-full lg:w-auto lg:min-w-[340px]">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
              <div>
                <div className="font-bold text-white text-sm">Abhay Patel</div>
                <div className="text-[11px] t-brand font-medium">Full Stack Software Developer</div>
              </div>
              <a
                href="https://github.com/Kaaldut12"
                target="_blank"
                rel="noopener noreferrer"
                className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-semibold border border-slate-700/80 transition inline-flex items-center gap-1.5"
              >
                <span>GitHub</span>
                <span>↗</span>
              </a>
            </div>
            <div className="space-y-1.5 text-[11px]">
              <div className="flex items-center gap-2">
                <span className="text-slate-500">Email:</span>
                <a href="mailto:abhaypatel2556444@gmail.com" className="text-indigo-400 hover:underline">abhaypatel2556444@gmail.com</a>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-slate-500">Repository:</span>
                <a href="https://github.com/Kaaldut12/E-Study_corner" target="_blank" rel="noopener noreferrer" className="text-purple-400 hover:underline">Kaaldut12/E-Study_corner</a>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-slate-500">Dual-Step DB:</span>
                <span className="text-emerald-400">MongoDB Atlas Cloud + Local Replica</span>
              </div>
            </div>
          </div>

          {/* Col 3: Navigation & Copyright */}
          <div className="space-y-3 lg:text-right">
            <div className="flex flex-wrap gap-3 text-xs font-medium text-slate-400 lg:justify-end">
              <a href="#top" className="hover:text-white transition">Back to Top</a>
              <a href="#services" className="hover:text-white transition">Services</a>
              <a href="#academics" className="hover:text-white transition">Academics</a>
              <a href="#about" className="hover:text-white transition">About</a>
              <Link to="/login" className="t-brand hover:underline">Sign In</Link>
            </div>
            <div className="text-slate-500 text-[11px]">
              Copyright &copy; {new Date().getFullYear()} E-Study Corner. Engineered by Abhay Patel.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
