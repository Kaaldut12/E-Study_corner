// frontend/src/pages/Student/Quizzes.jsx
import { useState, useEffect, useCallback } from 'react';
import SidebarLayout from '../../components/common/SidebarLayout';
import api from '../../services/api';

const Quizzes = () => {
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeQuiz, setActiveQuiz] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [userAnswers, setUserAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [result, setResult] = useState(null);

  const fetchQuizzes = useCallback(async () => {
    try {
      const res = await api.get('/student/quizzes');
      if (res.data.success) {
        setQuizzes(res.data.quizzes || []);
      }
    } catch (err) {
      console.warn('Error fetching quizzes:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchQuizzes();
  }, [fetchQuizzes]);

  const submitQuiz = useCallback(async () => {
    if (!activeQuiz) return;

    try {
      const initialTime = (activeQuiz.timeLimitMinutes || 15) * 60;
      const timeTakenSeconds = initialTime - timeLeft;

      const res = await api.post('/student/quizzes/submit', {
        quizId: activeQuiz.id,
        userAnswers,
        timeTakenSeconds
      });
      if (res.data.success) {
        setResult(res.data.attempt);
        fetchQuizzes();
      }
    } catch (err) {
      console.error('Error submitting quiz:', err);
    }
  }, [activeQuiz, fetchQuizzes, timeLeft, userAnswers]);

  const handleAutoSubmit = useCallback(() => {
    submitQuiz();
  }, [submitQuiz]);

  // Timer countdown when active quiz is running
  useEffect(() => {
    if (!activeQuiz || result || timeLeft <= 0) return;
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          handleAutoSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [activeQuiz, result, timeLeft, handleAutoSubmit]);

  const startQuiz = async (quiz) => {
    setLoading(true);
    try {
      const res = await api.get(`/student/quizzes/${quiz.id}`);
      if (res.data.success) {
        setActiveQuiz(res.data.quiz);
        setQuestions(res.data.questions || []);
        setUserAnswers({});
        setResult(null);
        setTimeLeft((res.data.quiz.timeLimitMinutes || 15) * 60);
      }
    } catch (err) {
      console.warn('Error starting quiz:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOptionSelect = (questionId, optionIdx) => {
    setUserAnswers(prev => ({ ...prev, [questionId]: optionIdx }));
  };

  const quitQuiz = () => {
    setActiveQuiz(null);
    setQuestions([]);
    setResult(null);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <SidebarLayout>
      <div className="space-y-6">
        {/* Header Banner */}
        {!activeQuiz && (
          <div className="glass-panel p-4 sm:p-6 lg:p-8 rounded-2xl sm:rounded-3xl border border-slate-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-purple-400">V2 Learning System</span>
              <h1 className="text-2xl font-black text-white">Interactive Quizzes & Practice</h1>
              <p className="text-xs text-slate-400 mt-1">
                Evaluate your knowledge with timed multiple-choice quizzes, instant scoring, and detailed answer explanations.
              </p>
            </div>
          </div>
        )}

        {/* Active Quiz Header & Timer */}
        {activeQuiz && !result && (
          <div className="glass-panel p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-indigo-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest">{activeQuiz.subject}</span>
              <h2 className="text-xl font-bold text-white">{activeQuiz.title}</h2>
            </div>
            <div className="flex items-center gap-3 sm:gap-4 flex-wrap">
              <div className="px-3.5 py-1.5 sm:px-4 sm:py-2 bg-slate-900 border border-slate-750 rounded-2xl flex items-center gap-2">
                <span className="text-xs text-slate-400">Time Left:</span>
                <span className={`text-sm font-mono font-bold ${timeLeft < 120 ? 'text-rose-400 animate-pulse' : 'text-amber-400'}`}>
                  ⏱️ {formatTime(timeLeft)}
                </span>
              </div>
              <button
                onClick={quitQuiz}
                className="py-1.5 px-3 sm:py-2 sm:px-3 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl"
              >
                Quit
              </button>
            </div>
          </div>
        )}

        {/* Quiz Catalog Grid */}
        {!activeQuiz && (
          loading ? (
            <div className="flex justify-center py-12">
              <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {quizzes.map((quiz) => (
                <div key={quiz.id} className="glass-panel glass-panel-hover p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-slate-800 flex flex-col justify-between space-y-4">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center text-[10px] font-bold">
                      <span className="px-2.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 uppercase">{quiz.subject}</span>
                      <span className="text-slate-400">⏱️ {quiz.timeLimitMinutes} Mins</span>
                    </div>

                    <h3 className="text-base font-bold text-white">{quiz.title}</h3>
                    <p className="text-xs text-slate-400 leading-relaxed line-clamp-2">{quiz.description}</p>
                  </div>

                  <div className="space-y-3 pt-3 border-t border-slate-800/80">
                    <div className="flex justify-between items-center text-xs text-slate-400">
                      <span>Questions: <strong className="text-white">{quiz.totalQuestions || 5}</strong></span>
                      <span>Passing: <strong className="text-emerald-400">{quiz.passingScore}%</strong></span>
                    </div>

                    {quiz.bestScore !== null && (
                      <div className="p-2.5 rounded-xl bg-slate-850 border border-slate-800 flex justify-between items-center text-xs">
                        <span className="text-slate-400">Best Attempt:</span>
                        <span className={`font-bold ${quiz.passed ? 'text-emerald-400' : 'text-rose-400'}`}>
                          {quiz.bestScore} Points {quiz.passed ? '✓ Passed' : '✗ Failed'}
                        </span>
                      </div>
                    )}

                    <button
                      onClick={() => startQuiz(quiz)}
                      className="w-full py-2.5 px-4 btn-premium text-white text-xs font-bold rounded-xl shadow-lg shadow-indigo-600/30 hover:opacity-95 transition"
                    >
                      {quiz.attemptCount > 0 ? 'Retake Quiz' : 'Start Quiz'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )
        )}

        {/* Active Quiz Questions View */}
        {activeQuiz && !result && (
          <div className="space-y-4 sm:space-y-6 max-w-3xl mx-auto">
            {questions.map((q, qIdx) => (
              <div key={q.id} className="glass-panel p-4 sm:p-6 lg:p-8 rounded-2xl sm:rounded-3xl border border-slate-800 space-y-4">
                <div className="flex justify-between items-start">
                  <span className="text-xs font-bold text-indigo-400">Question {qIdx + 1} of {questions.length}</span>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-800 text-slate-400">+{q.points || 10} pts</span>
                </div>

                <h3 className="text-base font-bold text-white">{q.questionText}</h3>

                <div className="space-y-2 pt-2">
                  {q.options.map((opt, optIdx) => {
                    const isSelected = userAnswers[q.id] === optIdx;
                    return (
                      <button
                        key={optIdx}
                        onClick={() => handleOptionSelect(q.id, optIdx)}
                        className={`w-full p-3 sm:p-4 rounded-xl sm:rounded-2xl text-left text-xs font-semibold transition-all border flex items-center justify-between ${
                          isSelected
                            ? 'bg-indigo-600/20 border-indigo-500 text-white shadow-md shadow-indigo-600/20'
                            : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span className={`w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-bold ${
                            isSelected ? 'bg-indigo-500 text-white' : 'bg-slate-800 text-slate-400'
                          }`}>
                            {String.fromCharCode(65 + optIdx)}
                          </span>
                          <span>{opt}</span>
                        </div>
                        {isSelected && <span className="text-indigo-400 text-sm">✓</span>}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}

            <button
              onClick={submitQuiz}
              className="w-full py-3.5 sm:py-4 btn-premium text-white text-sm font-bold rounded-xl sm:rounded-2xl shadow-xl shadow-emerald-600/30 hover:opacity-95 transition"
            >
              Submit Quiz Answers
            </button>
          </div>
        )}

        {/* Quiz Result Modal */}
        {result && (
          <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-8 max-w-xl w-full space-y-6 max-h-[90vh] overflow-y-auto">
              <div className="text-center space-y-2">
                <div className={`w-16 h-16 rounded-full flex items-center justify-center text-3xl mx-auto ${
                  result.passed ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
                }`}>
                  {result.passed ? '🏆' : '🎯'}
                </div>
                <h2 className="text-2xl font-black text-white">
                  {result.passed ? 'Quiz Passed!' : 'Quiz Complete'}
                </h2>
                <p className="text-xs text-slate-400">
                  {result.passed ? 'Great job! You achieved a passing score.' : 'Review explanations below to strengthen weak areas.'}
                </p>
              </div>

              {/* Score breakdown stats */}
              <div className="grid grid-cols-3 gap-3 p-4 rounded-2xl bg-slate-950 border border-slate-800 text-center">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">Score</span>
                  <p className="text-lg font-black text-indigo-400">{result.score} / {result.totalPoints}</p>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">Percentage</span>
                  <p className={`text-lg font-black ${result.passed ? 'text-emerald-400' : 'text-rose-400'}`}>{result.percentage}%</p>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">Time Taken</span>
                  <p className="text-lg font-black text-slate-200">{formatTime(result.timeTakenSeconds)}</p>
                </div>
              </div>

              {/* Answer Explanations */}
              <div className="space-y-3 pt-2">
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Question Explanations</h4>
                <div className="space-y-3">
                  {result.answers.map((ans, idx) => (
                    <div key={idx} className={`p-4 rounded-2xl border ${ans.isCorrect ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-rose-500/10 border-rose-500/30'}`}>
                      <div className="flex items-center justify-between text-xs font-bold mb-1">
                        <span className="text-slate-300">Question {idx + 1}</span>
                        <span className={ans.isCorrect ? 'text-emerald-400' : 'text-rose-400'}>
                          {ans.isCorrect ? '✓ Correct' : '✗ Incorrect'}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 leading-relaxed mt-1">
                        💡 {ans.explanation || 'Review subject notes for detailed concepts.'}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <button
                onClick={quitQuiz}
                className="w-full py-3 btn-premium text-white text-xs font-bold rounded-xl shadow-lg shadow-indigo-600/30"
              >
                Return to Quizzes
              </button>
            </div>
          </div>
        )}
      </div>
    </SidebarLayout>
  );
};

export default Quizzes;
