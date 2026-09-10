// frontend/src/pages/Student/WeakTopicDetector.jsx
import { useState, useEffect, useMemo, useCallback } from 'react';
import { Link } from 'react-router-dom';
import SidebarLayout from '../../components/common/SidebarLayout';
import studentService from '../../services/studentService';

const WeakTopicDetector = () => {
  const [topics, setTopics] = useState([]);
  const [diagnosticScore, setDiagnosticScore] = useState(null);
  const [emptyMessage, setEmptyMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  // Filter & Search states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('All');
  const [severityFilter, setSeverityFilter] = useState('all'); // 'all' | 'critical' | 'practice'

  // Fetch weak topics with cancellation and error resilience
  const fetchWeakTopics = useCallback(async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    setError(null);

    try {
      const res = await studentService.getWeakTopics();
      if (res.success) {
        setTopics(res.weakTopics || []);
        setDiagnosticScore(res.overallDiagnosticScore !== undefined ? res.overallDiagnosticScore : null);
        setEmptyMessage(res.message || '');
      } else {
        setError(res.message || 'Failed to retrieve diagnostic analytics.');
      }
    } catch (err) {
      console.warn('Error fetching weak topic analysis:', err);
      setError('Unable to load weak topic analysis. Please check your network connection and try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;

    const load = async () => {
      try {
        const res = await studentService.getWeakTopics();
        if (!isMounted) return;
        if (res.success) {
          setTopics(res.weakTopics || []);
          setDiagnosticScore(res.overallDiagnosticScore !== undefined ? res.overallDiagnosticScore : null);
          setEmptyMessage(res.message || '');
        } else {
          setError(res.message || 'Failed to retrieve diagnostic analytics.');
        }
      } catch (err) {
        if (!isMounted) return;
        console.warn('Error fetching weak topic analysis:', err);
        setError('Unable to load weak topic analysis. Please verify your connection and try again.');
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    load();

    return () => {
      isMounted = false;
    };
  }, []);

  // Compute summary stats with useMemo to avoid recalculations on re-render
  const stats = useMemo(() => {
    const total = topics.length;
    const critical = topics.filter(t => t.accuracy < 50).length;
    const practice = topics.filter(t => t.accuracy >= 50 && t.accuracy < 75).length;
    const avgAccuracy = total > 0
      ? Math.round(topics.reduce((acc, t) => acc + (t.accuracy || 0), 0) / total)
      : null;

    return { total, critical, practice, avgAccuracy };
  }, [topics]);

  // Unique subjects derived from fetched topics
  const subjects = useMemo(() => {
    const list = Array.from(new Set(topics.map(t => t.subject).filter(Boolean)));
    return ['All', ...list];
  }, [topics]);

  // Filtered and sorted topics using useMemo
  const filteredTopics = useMemo(() => {
    return topics.filter(t => {
      // Subject filter
      const matchesSubject = selectedSubject === 'All' || t.subject === selectedSubject;

      // Severity filter
      const matchesSeverity =
        severityFilter === 'all'
          ? true
          : severityFilter === 'critical'
          ? t.accuracy < 50
          : t.accuracy >= 50;

      // Search query (matches topic title, subject, or recommendation)
      const q = searchQuery.trim().toLowerCase();
      const matchesSearch =
        !q ||
        (t.topic || '').toLowerCase().includes(q) ||
        (t.subject || '').toLowerCase().includes(q) ||
        (t.recommendation || '').toLowerCase().includes(q);

      return matchesSubject && matchesSeverity && matchesSearch;
    });
  }, [topics, selectedSubject, severityFilter, searchQuery]);

  // Helper for dynamic score color
  const getScoreColor = (score) => {
    if (score === null) return 'text-slate-400';
    if (score >= 80) return 'text-emerald-400';
    if (score >= 60) return 'text-amber-400';
    return 'text-rose-400';
  };

  return (
    <SidebarLayout>
      <div className="space-y-6">
        {/* Header Banner */}
        <div className="glass-panel p-4 sm:p-6 lg:p-8 rounded-2xl sm:rounded-3xl border border-slate-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="space-y-1">
            <span className="text-xs font-bold uppercase tracking-wider text-rose-400">Diagnostic Analytics</span>
            <h1 className="text-2xl font-black text-white flex items-center gap-2">
              <span>🎯</span> Weak Topic Diagnostic Dashboard
            </h1>
            <p className="text-xs text-slate-400">
              Data-driven analysis of your quiz responses and low-scoring concepts with targeted practice links.
            </p>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
            {/* Diagnostic Score Card */}
            <div className="px-4 py-2 bg-slate-900 border border-slate-750 rounded-2xl flex items-center gap-3">
              <span className="text-xs text-slate-400 font-medium">Diagnostic Score:</span>
              <span className={`text-lg font-black ${getScoreColor(diagnosticScore)}`}>
                {diagnosticScore !== null ? `${diagnosticScore} / 100` : 'No Attempts'}
              </span>
            </div>

            {/* Refresh Diagnostics Button */}
            <button
              onClick={() => fetchWeakTopics(true)}
              disabled={loading || refreshing}
              title="Refresh diagnostic analysis"
              className="p-2.5 bg-slate-900 hover:bg-slate-800 border border-slate-750 text-slate-300 hover:text-white rounded-2xl transition disabled:opacity-50 flex items-center justify-center shrink-0"
              aria-label="Refresh analysis"
            >
              <svg
                className={`w-4 h-4 ${refreshing ? 'animate-spin text-rose-400' : ''}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Error Notification / State */}
        {error && (
          <div className="glass-panel p-5 rounded-2xl border border-rose-500/30 bg-rose-950/20 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="text-xl">⚠️</span>
              <p className="text-xs text-rose-200 font-medium">{error}</p>
            </div>
            <button
              onClick={() => fetchWeakTopics(false)}
              className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-rose-600/20 transition whitespace-nowrap"
            >
              Retry Diagnostics
            </button>
          </div>
        )}

        {/* Summary Metric KPI Cards */}
        {!loading && !error && topics.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {/* Card 1: Total Flagged */}
            <div className="glass-panel p-4 rounded-2xl border border-slate-800 space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Identified Concepts</span>
              <div className="text-2xl font-black text-white">{stats.total}</div>
              <p className="text-[10px] text-slate-500">Topics below 75% mastery threshold</p>
            </div>

            {/* Card 2: Critical Attention */}
            <div className="glass-panel p-4 rounded-2xl border border-slate-800 space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-rose-400">Critical Review</span>
              <div className="text-2xl font-black text-rose-400">{stats.critical}</div>
              <p className="text-[10px] text-slate-500">Accuracy below 50%</p>
            </div>

            {/* Card 3: Needs Practice */}
            <div className="glass-panel p-4 rounded-2xl border border-slate-800 space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400">Needs Practice</span>
              <div className="text-2xl font-black text-amber-400">{stats.practice}</div>
              <p className="text-[10px] text-slate-500">Accuracy between 50% and 74%</p>
            </div>

            {/* Card 4: Weak Topics Average */}
            <div className="glass-panel p-4 rounded-2xl border border-slate-800 space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400">Cohort Accuracy</span>
              <div className="text-2xl font-black text-indigo-300">
                {stats.avgAccuracy !== null ? `${stats.avgAccuracy}%` : '—'}
              </div>
              <p className="text-[10px] text-slate-500">Average across flagged items</p>
            </div>
          </div>
        )}

        {/* Search and Filters Bar */}
        {!loading && !error && topics.length > 0 && (
          <div className="glass-panel p-4 rounded-2xl border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-3">
            {/* Search Input */}
            <div className="relative w-full md:w-72">
              <input
                type="text"
                placeholder="Search weak topics or subjects..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-slate-900 border border-slate-750 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-rose-500 transition"
              />
              <span className="absolute left-3 top-2.5 text-xs text-slate-500">🔍</span>
            </div>

            {/* Filter Pills & Subject Dropdown */}
            <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
              {/* Severity Buttons */}
              <div className="flex bg-slate-900 border border-slate-750 p-1 rounded-xl shrink-0">
                <button
                  onClick={() => setSeverityFilter('all')}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
                    severityFilter === 'all'
                      ? 'bg-slate-800 text-white shadow'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  All ({topics.length})
                </button>
                <button
                  onClick={() => setSeverityFilter('critical')}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
                    severityFilter === 'critical'
                      ? 'bg-rose-500/20 text-rose-300 shadow'
                      : 'text-slate-400 hover:text-rose-300'
                  }`}
                >
                  Critical ({stats.critical})
                </button>
                <button
                  onClick={() => setSeverityFilter('practice')}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
                    severityFilter === 'practice'
                      ? 'bg-amber-500/20 text-amber-300 shadow'
                      : 'text-slate-400 hover:text-amber-300'
                  }`}
                >
                  Practice ({stats.practice})
                </button>
              </div>

              {/* Subject Selector */}
              {subjects.length > 2 && (
                <select
                  value={selectedSubject}
                  onChange={(e) => setSelectedSubject(e.target.value)}
                  className="px-3 py-1.5 bg-slate-900 border border-slate-750 rounded-xl text-xs text-slate-300 focus:outline-none focus:border-rose-500 shrink-0"
                >
                  {subjects.map((sub) => (
                    <option key={sub} value={sub}>
                      {sub === 'All' ? 'All Subjects' : sub}
                    </option>
                  ))}
                </select>
              )}
            </div>
          </div>
        )}

        {/* Loading Spinner */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16 space-y-3">
            <div className="w-9 h-9 border-4 border-rose-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-xs text-slate-400 font-medium animate-pulse">
              Analyzing quiz logs & calculating diagnostic scores...
            </p>
          </div>
        ) : !error && topics.length === 0 ? (
          /* Zero-state (No weak topics or no quiz attempts) */
          <div className="glass-panel p-6 sm:p-10 rounded-2xl sm:rounded-3xl border border-slate-800 text-center space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mx-auto text-2xl font-bold border border-emerald-500/20">
              ✓
            </div>
            <div className="space-y-1 max-w-md mx-auto">
              <h3 className="text-lg font-bold text-white">
                {diagnosticScore !== null ? 'All Attempted Concepts Mastered!' : 'No Quiz Attempts Recorded Yet'}
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                {emptyMessage ||
                  (diagnosticScore !== null
                    ? 'Outstanding work! Your recent quiz answers demonstrate high proficiency (≥75%) across all attempted concepts.'
                    : 'Complete practice quizzes to unlock personalized weak topic detection, diagnostic analytics, and tailored practice links.')}
              </p>
            </div>
            <Link
              to="/student/quizzes"
              className="inline-block py-2.5 px-6 bg-linear-to-r from-rose-600 to-indigo-600 hover:from-rose-500 hover:to-indigo-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-rose-600/20 hover:opacity-95 transition"
            >
              Explore Practice Quizzes →
            </Link>
          </div>
        ) : !error && filteredTopics.length === 0 ? (
          /* Filter zero-state */
          <div className="glass-panel p-8 rounded-3xl border border-slate-800 text-center space-y-3">
            <span className="text-2xl">🔍</span>
            <h3 className="text-sm font-bold text-white">No topics match your current filter</h3>
            <p className="text-xs text-slate-400">
              Try adjusting your search keywords or switching the severity filter.
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedSubject('All');
                setSeverityFilter('all');
              }}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl transition"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          /* Topics List with Optimized Keys and Visual Meter */
          <div className="space-y-4">
            {filteredTopics.map((t, idx) => {
              const isCritical = t.accuracy < 50;
              const pointsToMastery = Math.max(0, 75 - t.accuracy);
              const cardKey = t.topicId || `${t.subject}-${t.topic}-${idx}`;

              return (
                <div
                  key={cardKey}
                  className="glass-panel p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-slate-800 hover:border-slate-700 transition flex flex-col md:flex-row justify-between items-start md:items-center gap-5 group"
                >
                  {/* Left Column: Subject, Status, Topic, Recommendation */}
                  <div className="space-y-2.5 flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border flex items-center gap-1.5 ${
                          isCritical
                            ? 'bg-rose-500/10 text-rose-300 border-rose-500/30'
                            : 'bg-amber-500/10 text-amber-300 border-amber-500/30'
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            isCritical ? 'bg-rose-500 animate-pulse' : 'bg-amber-400'
                          }`}
                        />
                        {t.status}
                      </span>
                      <span className="text-xs font-semibold text-slate-400 bg-slate-900/60 px-2 py-0.5 rounded-lg border border-slate-800">
                        {t.subject}
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-white group-hover:text-rose-300 transition line-clamp-2">
                      {t.topic}
                    </h3>

                    <div className="flex items-start gap-2 bg-slate-950/40 p-3 rounded-xl border border-slate-800/60">
                      <span className="text-sm shrink-0">💡</span>
                      <p className="text-xs text-slate-300 leading-relaxed">{t.recommendation}</p>
                    </div>
                  </div>

                  {/* Right Column: Visual Accuracy Meter & Action Button */}
                  <div className="flex flex-col sm:flex-row md:flex-col lg:flex-row items-start sm:items-center md:items-end lg:items-center gap-4 w-full md:w-auto border-t md:border-t-0 pt-4 md:pt-0 border-slate-800 shrink-0">
                    {/* Visual Meter Bar */}
                    <div className="w-full sm:w-44 md:w-40 text-left sm:text-right md:text-right space-y-1.5">
                      <div className="flex items-center justify-between sm:justify-end gap-2">
                        <span className="text-[10px] text-slate-400 uppercase font-semibold">Quiz Accuracy:</span>
                        <p
                          className={`text-base font-black ${
                            isCritical ? 'text-rose-400' : 'text-amber-400'
                          }`}
                        >
                          {t.accuracy}%
                        </p>
                      </div>

                      {/* Progress bar towards 75% target threshold */}
                      <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden border border-slate-800 relative">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            isCritical
                              ? 'bg-linear-to-r from-rose-600 to-rose-400'
                              : 'bg-linear-to-r from-amber-600 to-amber-400'
                          }`}
                          style={{ width: `${Math.min(100, Math.max(5, t.accuracy))}%` }}
                        />
                      </div>

                      <div className="flex items-center justify-between text-[10px] text-slate-500">
                        <span>Target: 75%</span>
                        <span className={isCritical ? 'text-rose-400 font-medium' : 'text-amber-400 font-medium'}>
                          +{pointsToMastery}% needed
                        </span>
                      </div>
                    </div>

                    {/* Action Link */}
                    <Link
                      to={t.actionUrl || '/student/quizzes'}
                      className="py-2.5 px-5 bg-linear-to-r from-rose-600 to-indigo-600 hover:from-rose-500 hover:to-indigo-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-rose-600/25 hover:shadow-rose-600/40 hover:scale-[1.02] active:scale-[0.98] transition whitespace-nowrap self-stretch sm:self-auto text-center"
                    >
                      Practice Concept →
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </SidebarLayout>
  );
};

export default WeakTopicDetector;
