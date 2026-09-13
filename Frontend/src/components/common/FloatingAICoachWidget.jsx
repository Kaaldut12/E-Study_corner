// frontend/src/components/common/FloatingAICoachWidget.jsx
import { useState, useRef, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import studentService from '../../services/studentService';
import {
  Bot,
  Send,
  X,
  Maximize2,
  RotateCcw,
  Code,
  Copy,
  Check
} from 'lucide-react';

const QUICK_PROMPTS = [
  'Explain BST deletion with code',
  'INNER JOIN vs LEFT JOIN in SQL',
  'Deadlocks & 4 Coffman conditions',
  'Analyze my weak quiz areas'
];

const FloatingAICoachWidget = () => {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [copiedId, setCopiedId] = useState(null);
  const [messages, setMessages] = useState([
    {
      id: 'msg_float_init',
      sender: 'ai',
      text: 'Hi! Ask me any study question, code explanation, or concept you need help with.',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);

  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  // Don't show floating widget on dedicated AI Coach page
  if (location.pathname === '/student/ai-coach') {
    return null;
  }

  const handleSend = async (textToSend) => {
    const query = (textToSend !== undefined ? textToSend : prompt).trim();
    if (!query || loading) return;

    const userMsg = {
      id: `usr_${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    if (textToSend === undefined) setPrompt('');
    setLoading(true);

    try {
      const historyPayload = messages.slice(-4).map((m) => ({
        sender: m.sender,
        text: m.text || ''
      }));

      const data = await studentService.askAICoach(query, historyPayload);
      if (data.success && data.response) {
        const res = data.response;
        const aiMsg = {
          id: `ai_${Date.now()}`,
          sender: 'ai',
          text: res.text || res.explanation || 'Here is your study explanation.',
          codeSnippet: res.codeSnippet || '',
          codeLanguage: res.codeLanguage || 'cpp',
          recommendedTopic: res.recommendedTopic || '',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        setMessages((prev) => [...prev, aiMsg]);
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: `err_${Date.now()}`,
          sender: 'ai',
          text: 'Unable to reach the AI Coach right now. Please try again.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyCode = (code, id) => {
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <aside aria-label="AI Study Coach Widget" className="fixed bottom-6 right-6 z-40 flex flex-col items-end">
      {/* Floating Chat Window */}
      {isOpen && (
        <div className="w-96 max-w-[calc(100vw-2rem)] h-[490px] mb-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-fade-in">
          {/* Header */}
          <div className="px-3.5 py-3 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/70 dark:bg-slate-950/70">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-teal-600 text-white flex items-center justify-center">
                <Bot className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  AI Study Coach
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                </h2>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setMessages([
                  {
                    id: 'msg_float_init',
                    sender: 'ai',
                    text: 'Hi! Ask me any study question or concept you need help with.',
                    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                  }
                ])}
                title="Reset Chat"
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
              <Link
                to="/student/ai-coach"
                title="Open Full Page AI Coach"
                className="p-1 rounded-lg text-slate-400 hover:text-teal-600 dark:hover:text-teal-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              >
                <Maximize2 className="w-3.5 h-3.5" />
              </Link>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                title="Close"
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Quick Starter Chips */}
          <div className="px-3 py-1.5 border-b border-slate-100 dark:border-slate-800 flex items-center gap-1.5 overflow-x-auto scrollbar-none bg-slate-50/40 dark:bg-slate-950/40">
            {QUICK_PROMPTS.map((qp, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSend(qp)}
                className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-[10px] text-slate-600 dark:text-slate-300 whitespace-nowrap transition shrink-0 cursor-pointer"
              >
                {qp}
              </button>
            ))}
          </div>

          {/* Chat Messages Stream */}
          <div className="flex-1 p-3.5 overflow-y-auto space-y-3 text-xs">
            {messages.map((m) => {
              const isUser = m.sender === 'user';
              return (
                <div key={m.id} className={`flex gap-2 ${isUser ? 'justify-end' : 'justify-start'}`}>
                  {!isUser && (
                    <div className="w-6 h-6 rounded-md bg-teal-600 text-white flex items-center justify-center shrink-0 mt-0.5">
                      <Bot className="w-3.5 h-3.5" />
                    </div>
                  )}

                  <div
                    className={`max-w-[85%] p-3 rounded-xl space-y-2 text-[11px] leading-relaxed ${
                      isUser
                        ? 'bg-indigo-600 text-white rounded-tr-none'
                        : 'bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/60 text-slate-800 dark:text-slate-200 rounded-tl-none'
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{m.text}</p>

                    {m.codeSnippet && (
                      <div className="rounded-lg overflow-hidden bg-slate-950 border border-slate-800 font-mono text-[10px] text-slate-200">
                        <div className="px-2 py-1 bg-slate-900 border-b border-slate-800 flex items-center justify-between text-slate-400">
                          <span className="uppercase text-[9px] text-teal-400">{m.codeLanguage || 'Code'}</span>
                          <button
                            type="button"
                            onClick={() => handleCopyCode(m.codeSnippet, m.id)}
                            className="flex items-center gap-1 text-[9px] hover:text-white cursor-pointer"
                          >
                            {copiedId === m.id ? <Check className="w-2.5 h-2.5 text-emerald-400" /> : <Copy className="w-2.5 h-2.5" />}
                            <span>{copiedId === m.id ? 'Copied' : 'Copy'}</span>
                          </button>
                        </div>
                        <pre className="p-2 overflow-x-auto text-emerald-300">
                          <code>{m.codeSnippet}</code>
                        </pre>
                      </div>
                    )}

                    <div className="text-[9px] text-slate-400 text-right">{m.timestamp}</div>
                  </div>
                </div>
              );
            })}

            {loading && (
              <div className="flex items-center gap-2 text-slate-400 text-[11px]">
                <Bot className="w-3.5 h-3.5 animate-spin text-teal-500" />
                <span>Generating explanation...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Box */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="p-2 border-t border-slate-200 dark:border-slate-800 flex items-center gap-1.5 bg-slate-50/50 dark:bg-slate-950/50"
          >
            <input
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Ask a question..."
              className="flex-1 px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-teal-500"
            />
            <button
              type="submit"
              disabled={loading || !prompt.trim()}
              className="p-1.5 bg-teal-600 hover:bg-teal-500 text-white rounded-lg shadow-xs transition disabled:opacity-40 cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      )}

      {/* Launcher Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-3 rounded-full bg-teal-600 hover:bg-teal-500 text-white shadow-lg transition-transform hover:scale-105 flex items-center justify-center cursor-pointer"
        title="AI Study Coach"
      >
        <span className="absolute top-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-white dark:border-slate-900"></span>
        <Bot className="w-5 h-5" />
      </button>
    </aside>
  );
};

export default FloatingAICoachWidget;
