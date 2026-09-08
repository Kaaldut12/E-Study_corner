// frontend/src/pages/Student/AICoach.jsx
import { useState } from 'react';
import SidebarLayout from '../../components/common/SidebarLayout';

const AICoach = () => {
  const [prompt, setPrompt] = useState('');
  const [messages, setMessages] = useState([
    {
      sender: 'ai',
      text: 'Hello! I am your AI Study Coach for E-Study Corner. Ask me to explain any topic in C++, Data Structures, SQL, or Networks, generate practice questions, or build a personalized revision schedule.',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [loading, setLoading] = useState(false);

  const samplePrompts = [
    'Explain Binary Search Tree deletion logic with code',
    'What is the difference between INNER JOIN and LEFT JOIN in SQL?',
    'Create a 7-Day Exam Revision Schedule for 3rd Year Diploma',
    'Analyze my weak areas based on recent quiz scores'
  ];

  const handleSendPrompt = async (textToSend) => {
    const queryText = textToSend || prompt;
    if (!queryText.trim() || loading) return;

    const userMsg = {
      sender: 'user',
      text: queryText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    if (!textToSend) setPrompt('');
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:3001/api/student/ai-coach', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ prompt: queryText })
      });
      const data = await res.json();

      if (data.success) {
        const aiResponse = data.response;
        const aiMsg = {
          sender: 'ai',
          explanation: aiResponse.explanation,
          codeSnippet: aiResponse.codeSnippet,
          practiceQuestions: aiResponse.practiceQuestions,
          recommendedTopic: aiResponse.recommendedTopic,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        setMessages(prev => [...prev, aiMsg]);
      }
    } catch (err) {
      console.error('Error from AI Coach:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SidebarLayout>
      <div className="space-y-6 max-w-4xl mx-auto flex flex-col h-[calc(100vh-6rem)]">
        {/* Header Banner */}
        <div className="glass-panel p-6 rounded-3xl border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-teal-400">V3 Advanced Learning</span>
            <h1 className="text-2xl font-black text-white flex items-center gap-2">
              <span>🤖</span> AI Study Coach & Tutor
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Real-time concept explanations, code generation, custom practice questions, and study plans.
            </p>
          </div>
        </div>

        {/* Sample Quick Prompt Chips */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {samplePrompts.map((p, idx) => (
            <button
              key={idx}
              onClick={() => handleSendPrompt(p)}
              className="px-3.5 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-[11px] text-slate-300 hover:text-white hover:border-slate-700 whitespace-nowrap transition"
            >
              💡 {p}
            </button>
          ))}
        </div>

        {/* Chat Messages Log */}
        <div className="flex-1 glass-panel p-6 rounded-3xl border border-slate-800 overflow-y-auto space-y-4">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
            >
              <div
                className={`max-w-2xl p-4 sm:p-5 rounded-2xl space-y-3 text-xs leading-relaxed ${
                  msg.sender === 'user'
                    ? 'bg-linear-to-r from-indigo-600 to-purple-600 text-white rounded-br-none shadow-lg shadow-indigo-600/20'
                    : 'bg-slate-850 border border-slate-800 text-slate-200 rounded-bl-none'
                }`}
              >
                {msg.text && <p className="whitespace-pre-wrap">{msg.text}</p>}

                {msg.explanation && (
                  <div className="space-y-2">
                    <p className="whitespace-pre-wrap leading-relaxed">{msg.explanation}</p>

                    {msg.codeSnippet && (
                      <div className="p-3 bg-slate-950 rounded-xl font-mono text-[11px] text-emerald-300 overflow-x-auto border border-slate-800">
                        <pre>{msg.codeSnippet}</pre>
                      </div>
                    )}

                    {msg.practiceQuestions && msg.practiceQuestions.length > 0 && (
                      <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 space-y-1.5">
                        <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider">Suggested Practice Questions:</span>
                        <ul className="list-disc list-inside space-y-1 text-slate-300">
                          {msg.practiceQuestions.map((q, qIdx) => (
                            <li key={qIdx}>{q}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {msg.recommendedTopic && (
                      <div className="text-[10px] text-indigo-400 font-bold pt-1">
                        🎯 Recommended Topic: {msg.recommendedTopic}
                      </div>
                    )}
                  </div>
                )}

                <div className="text-[9px] text-slate-400 text-right">{msg.timestamp}</div>
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex items-center gap-2 text-xs text-slate-400 py-2">
              <div className="w-4 h-4 border-2 border-teal-400 border-t-transparent rounded-full animate-spin"></div>
              <span>AI Coach is thinking and analyzing your query...</span>
            </div>
          )}
        </div>

        {/* Input Bar */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendPrompt();
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Ask AI Coach a question, e.g. Explain SQL normalization..."
            className="flex-1 px-5 py-3.5 bg-slate-900 border border-slate-750 rounded-2xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-teal-500"
          />
          <button
            type="submit"
            disabled={loading}
            className="py-3.5 px-6 bg-linear-to-r from-teal-600 to-indigo-600 text-white text-xs font-bold rounded-2xl shadow-lg shadow-teal-600/30 hover:opacity-95 transition disabled:opacity-50"
          >
            Ask AI
          </button>
        </form>
      </div>
    </SidebarLayout>
  );
};

export default AICoach;
