// frontend/src/pages/Student/AICoach.jsx
import { useState, useRef, useEffect } from 'react';
import SidebarLayout from '../../components/common/SidebarLayout';
import studentService from '../../services/studentService';
import {
  Bot,
  User,
  Send,
  Copy,
  Check,
  RotateCcw,
  StickyNote,
  Code,
  ArrowRight,
  BookmarkCheck,
  Sparkles
} from 'lucide-react';

const STARTER_PROMPTS = [
  {
    title: 'Data Structures',
    prompt: 'Explain Binary Search Tree deletion logic with code',
    desc: 'BST cases, in-order successor, and C++ implementation'
  },
  {
    title: 'Database & SQL',
    prompt: 'What is the difference between INNER JOIN and LEFT JOIN in SQL?',
    desc: 'Relational operations, NULL matching, and query examples'
  },
  {
    title: 'Operating Systems',
    prompt: 'Explain Deadlocks and the 4 Coffman conditions in OS',
    desc: 'Mutual exclusion, hold & wait, and prevention techniques'
  },
  {
    title: 'Study Strategy',
    prompt: 'Create a 7-Day Comprehensive Exam Revision Schedule',
    desc: 'Spaced repetition, daily time blocks, and mock tests'
  }
];

const AICoach = () => {
  const [prompt, setPrompt] = useState('');
  const [messages, setMessages] = useState([
    {
      id: 'msg_welcome',
      sender: 'ai',
      text: 'Hello! I am your AI Study Coach. Ask me to explain any concept, write or debug code, prepare for exams, or review your quiz performance.',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [copiedCodeId, setCopiedCodeId] = useState(null);
  const [copiedMsgId, setCopiedMsgId] = useState(null);
  const [savedNoteId, setSavedNoteId] = useState(null);
  const [toastMessage, setToastMessage] = useState('');

  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);

  const scrollToBottom = (behavior = 'smooth') => {
    messagesEndRef.current?.scrollIntoView({ behavior });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 2500);
  };

  const handleSendPrompt = async (textToSend) => {
    const queryText = (textToSend !== undefined ? textToSend : prompt).trim();
    if (!queryText || loading) return;

    const userMsg = {
      id: `usr_${Date.now()}`,
      sender: 'user',
      text: queryText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    if (textToSend === undefined) setPrompt('');
    setError('');
    setLoading(true);

    // Provide conversation history for multi-turn dialogue
    const historyPayload = messages.slice(-6).map((m) => ({
      sender: m.sender,
      text: m.text || m.explanation || ''
    }));

    try {
      const data = await studentService.askAICoach(queryText, historyPayload);

      if (data.success) {
        const aiResponse = data.response || {};
        const aiMsg = {
          id: `ai_${Date.now()}`,
          sender: 'ai',
          text: aiResponse.text || aiResponse.explanation || '',
          codeSnippet: aiResponse.codeSnippet || '',
          codeLanguage: aiResponse.codeLanguage || 'cpp',
          practiceQuestions: Array.isArray(aiResponse.practiceQuestions) ? aiResponse.practiceQuestions : [],
          recommendedTopic: aiResponse.recommendedTopic || '',
          suggestedFollowUps: Array.isArray(aiResponse.suggestedFollowUps) ? aiResponse.suggestedFollowUps : [],
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        setMessages((prev) => [...prev, aiMsg]);
      } else {
        setError(data.message || 'The AI Coach could not process this request.');
      }
    } catch (err) {
      console.error('Error from AI Coach:', err);
      setError(err.parsedMessage || err.message || 'Unable to reach the AI Coach. Please try again.');
    } finally {
      setLoading(false);
      setTimeout(() => textareaRef.current?.focus(), 50);
    }
  };

  const handleCopyCode = async (code, snippetId) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedCodeId(snippetId);
      showToast('Code copied');
      setTimeout(() => setCopiedCodeId(null), 2000);
    } catch {
      showToast('Copy failed');
    }
  };

  const handleCopyMessage = async (msgText, msgId) => {
    try {
      await navigator.clipboard.writeText(msgText);
      setCopiedMsgId(msgId);
      showToast('Copied to clipboard');
      setTimeout(() => setCopiedMsgId(null), 2000);
    } catch {
      showToast('Copy failed');
    }
  };

  const handleSaveToNotes = async (msg) => {
    try {
      const noteTitle = `AI Study Note: ${msg.recommendedTopic || 'Key Concepts'}`;
      const noteContent = `${msg.text || ''}\n\n${
        msg.codeSnippet ? `\`\`\`${msg.codeLanguage || ''}\n${msg.codeSnippet}\n\`\`\`` : ''
      }`.trim();

      await studentService.createNote({
        title: noteTitle.slice(0, 100),
        content: noteContent
      });

      setSavedNoteId(msg.id);
      showToast('Saved to your Notes 📝');
      setTimeout(() => setSavedNoteId(null), 2500);
    } catch (err) {
      console.error('Error saving note:', err);
      showToast('Could not save note');
    }
  };

  const handleResetChat = () => {
    setMessages([
      {
        id: 'msg_welcome',
        sender: 'ai',
        text: 'Hello! I am your AI Study Coach. Ask me to explain any concept, write or debug code, prepare for exams, or review your quiz performance.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
    setError('');
  };

  // Clean Markdown & Inline Formatting
  const renderFormattedText = (rawText) => {
    if (!rawText) return null;

    const paragraphs = rawText.split('\n');

    return (
      <div className="space-y-2 text-xs sm:text-[13px] leading-relaxed">
        {paragraphs.map((para, pIdx) => {
          const trimmed = para.trim();
          if (!trimmed) return <div key={pIdx} className="h-1" />;

          // Bullet points
          if (trimmed.startsWith('•') || trimmed.startsWith('-') || trimmed.startsWith('* ')) {
            const bulletContent = trimmed.replace(/^([•\-\*]\s*)/, '');
            return (
              <div key={pIdx} className="flex items-start gap-2 pl-1">
                <span className="text-teal-500 dark:text-teal-400 font-bold leading-none mt-1.5">•</span>
                <span className="flex-1">{formatInlineHighlights(bulletContent)}</span>
              </div>
            );
          }

          // Numbered list
          if (/^\d+\.\s/.test(trimmed)) {
            const parts = trimmed.match(/^(\d+\.)\s+(.*)$/);
            if (parts) {
              return (
                <div key={pIdx} className="flex items-start gap-2 pl-1">
                  <span className="text-indigo-500 dark:text-indigo-400 font-semibold">{parts[1]}</span>
                  <span className="flex-1">{formatInlineHighlights(parts[2])}</span>
                </div>
              );
            }
          }

          return <p key={pIdx}>{formatInlineHighlights(trimmed)}</p>;
        })}
      </div>
    );
  };

  const formatInlineHighlights = (text) => {
    const parts = text.split(/(\*\*.*?\*\*|`.*?`)/g);
    return parts.map((part, idx) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return (
          <strong key={idx} className="font-semibold text-slate-900 dark:text-white">
            {part.slice(2, -2)}
          </strong>
        );
      }
      if (part.startsWith('`') && part.endsWith('`')) {
        return (
          <code key={idx} className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-teal-600 dark:text-teal-300 font-mono text-[11px]">
            {part.slice(1, -1)}
          </code>
        );
      }
      return part;
    });
  };

  const isInitialState = messages.length <= 1;

  return (
    <SidebarLayout>
      <div className="max-w-4xl mx-auto flex flex-col h-[calc(100vh-8rem)] sm:h-[calc(100vh-8.5rem)]">
        {/* Toast Alert */}
        {toastMessage && (
          <div className="fixed top-20 right-6 z-50 px-3.5 py-2 rounded-xl bg-slate-900 text-white border border-slate-700 shadow-xl text-xs font-medium flex items-center gap-2 animate-fade-in">
            <Check className="w-3.5 h-3.5 text-teal-400" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Minimal Clean Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-teal-600 text-white flex items-center justify-center shadow-xs">
              <Bot className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-bold text-slate-900 dark:text-white">AI Study Coach</h1>
                <span className="inline-flex items-center gap-1 text-[10px] font-medium text-emerald-600 dark:text-emerald-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  Active
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">Academic concept tutor & problem solver</p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleResetChat}
            className="px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-medium transition flex items-center gap-1.5 cursor-pointer"
            title="Start new conversation"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>New Chat</span>
          </button>
        </div>

        {/* Messages Stream */}
        <div className="flex-1 overflow-y-auto py-4 space-y-4 pr-1 scroll-smooth">
          {/* Starter Suggestions on Fresh Chat */}
          {isInitialState && (
            <div className="py-6 sm:py-8 space-y-4 text-center max-w-2xl mx-auto">
              <div className="inline-flex p-3 rounded-2xl bg-teal-500/10 text-teal-600 dark:text-teal-400 mb-1">
                <Sparkles className="w-6 h-6" />
              </div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                What do you want to learn today?
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Choose a starter topic below or type your question in the box to begin.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2 text-left">
                {STARTER_PROMPTS.map((item, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSendPrompt(item.prompt)}
                    className="p-3.5 rounded-xl border border-slate-200/80 dark:border-slate-800/90 bg-white/50 dark:bg-slate-900/50 hover:border-teal-500/50 hover:bg-teal-50/20 dark:hover:bg-teal-950/20 transition group text-left cursor-pointer"
                  >
                    <div className="flex items-center justify-between text-xs font-semibold text-slate-900 dark:text-white">
                      <span>{item.title}</span>
                      <ArrowRight className="w-3 h-3 text-slate-400 group-hover:text-teal-500 group-hover:translate-x-0.5 transition" />
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                      {item.prompt}
                    </p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Conversation History */}
          {!isInitialState &&
            messages.map((msg) => {
              const isUser = msg.sender === 'user';

              return (
                <div
                  key={msg.id}
                  className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}
                >
                  {!isUser && (
                    <div className="w-7 h-7 rounded-lg bg-teal-600 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
                      <Bot className="w-3.5 h-3.5" />
                    </div>
                  )}

                  <div
                    className={`max-w-[85%] sm:max-w-2xl rounded-2xl p-3.5 sm:p-4 space-y-3 shadow-xs ${
                      isUser
                        ? 'bg-indigo-600 text-white rounded-tr-none'
                        : 'bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-slate-800 dark:text-slate-200 rounded-tl-none'
                    }`}
                  >
                    {/* User Message */}
                    {isUser && <p className="text-xs sm:text-[13px] whitespace-pre-wrap leading-relaxed">{msg.text}</p>}

                    {/* AI Message Content */}
                    {!isUser && (
                      <>
                        {renderFormattedText(msg.text)}

                        {/* Code Block if any */}
                        {msg.codeSnippet && (
                          <div className="rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-950 text-slate-200 font-mono text-xs">
                            <div className="px-3 py-1.5 bg-slate-900 border-b border-slate-800 flex items-center justify-between text-slate-400 text-[11px]">
                              <span className="uppercase font-semibold text-teal-400 flex items-center gap-1.5">
                                <Code className="w-3 h-3" />
                                {msg.codeLanguage || 'code'}
                              </span>
                              <button
                                type="button"
                                onClick={() => handleCopyCode(msg.codeSnippet, msg.id)}
                                className="hover:text-white flex items-center gap-1 transition cursor-pointer"
                              >
                                {copiedCodeId === msg.id ? (
                                  <>
                                    <Check className="w-3 h-3 text-emerald-400" />
                                    <span className="text-emerald-400">Copied</span>
                                  </>
                                ) : (
                                  <>
                                    <Copy className="w-3 h-3" />
                                    <span>Copy</span>
                                  </>
                                )}
                              </button>
                            </div>
                            <pre className="p-3 overflow-x-auto text-emerald-300 leading-relaxed scrollbar-thin">
                              <code>{msg.codeSnippet}</code>
                            </pre>
                          </div>
                        )}

                        {/* Suggested Follow-Ups / Questions Chips (Subtle) */}
                        {((msg.practiceQuestions && msg.practiceQuestions.length > 0) ||
                          (msg.suggestedFollowUps && msg.suggestedFollowUps.length > 0)) && (
                          <div className="pt-1.5 space-y-1.5 border-t border-slate-100 dark:border-slate-800/80">
                            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
                              Suggested Follow-ups:
                            </span>
                            <div className="flex flex-wrap gap-1.5">
                              {(msg.suggestedFollowUps?.length ? msg.suggestedFollowUps : msg.practiceQuestions)
                                .slice(0, 2)
                                .map((q, qIdx) => (
                                  <button
                                    key={qIdx}
                                    type="button"
                                    onClick={() => handleSendPrompt(q)}
                                    className="px-2.5 py-1 rounded-lg text-[11px] bg-slate-100 hover:bg-slate-200 dark:bg-slate-800/70 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition text-left flex items-center gap-1 cursor-pointer"
                                  >
                                    <ArrowRight className="w-2.5 h-2.5 text-teal-500 shrink-0" />
                                    <span>{q}</span>
                                  </button>
                                ))}
                            </div>
                          </div>
                        )}

                        {/* Quiet Action Toolbar */}
                        <div className="pt-2 border-t border-slate-100 dark:border-slate-800/60 flex items-center justify-between text-[11px] text-slate-400">
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => handleSaveToNotes(msg)}
                              className="hover:text-indigo-500 dark:hover:text-indigo-400 transition flex items-center gap-1 cursor-pointer"
                              title="Save to Personal Notes"
                            >
                              {savedNoteId === msg.id ? (
                                <BookmarkCheck className="w-3 h-3 text-emerald-500" />
                              ) : (
                                <StickyNote className="w-3 h-3" />
                              )}
                              <span>Save Note</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => handleCopyMessage(msg.text, msg.id)}
                              className="hover:text-slate-600 dark:hover:text-slate-200 transition flex items-center gap-1 cursor-pointer"
                              title="Copy text"
                            >
                              {copiedMsgId === msg.id ? (
                                <Check className="w-3 h-3 text-emerald-500" />
                              ) : (
                                <Copy className="w-3 h-3" />
                              )}
                              <span>Copy</span>
                            </button>
                          </div>

                          <span className="text-[10px] text-slate-400">{msg.timestamp}</span>
                        </div>
                      </>
                    )}

                    {isUser && (
                      <div className="text-[10px] text-indigo-200 text-right">{msg.timestamp}</div>
                    )}
                  </div>

                  {isUser && (
                    <div className="w-7 h-7 rounded-lg bg-indigo-600 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
                      <User className="w-3.5 h-3.5" />
                    </div>
                  )}
                </div>
              );
            })}

          {/* Typing Indicator */}
          {loading && (
            <div className="flex items-center gap-2.5 text-xs text-slate-400 pl-1">
              <div className="w-6 h-6 rounded-lg bg-teal-600 text-white flex items-center justify-center shrink-0">
                <Bot className="w-3.5 h-3.5 animate-spin" />
              </div>
              <div className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-bounce" style={{ animationDelay: '300ms' }} />
                <span className="ml-1 text-slate-400">Thinking...</span>
              </div>
            </div>
          )}

          {error && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs flex items-center justify-between">
              <span>{error}</span>
              <button type="button" onClick={() => setError('')} className="text-rose-500 hover:text-rose-700">
                ✕
              </button>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Minimal Clean Input Bar */}
        <div className="pt-2 border-t border-slate-200 dark:border-slate-800 shrink-0">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendPrompt();
            }}
            className="flex items-end gap-2 p-2 rounded-2xl border border-slate-300 dark:border-slate-700/80 bg-white dark:bg-slate-900 shadow-xs focus-within:border-teal-500 transition"
          >
            <textarea
              ref={textareaRef}
              rows={1}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendPrompt();
                }
              }}
              maxLength={2000}
              placeholder="Ask anything about DSA, SQL, Web Dev, or paste code..."
              className="flex-1 max-h-28 px-2 py-1.5 bg-transparent text-xs sm:text-[13px] text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none resize-none leading-relaxed"
            />

            <button
              type="submit"
              disabled={loading || !prompt.trim()}
              className="p-2.5 bg-teal-600 hover:bg-teal-500 text-white rounded-xl shadow-xs transition disabled:opacity-40 disabled:cursor-not-allowed shrink-0 cursor-pointer"
              title="Send message"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
          <div className="text-[10px] text-slate-400 text-center pt-1.5">
            Press <span className="font-mono">Enter</span> to send, <span className="font-mono">Shift + Enter</span> for a new line.
          </div>
        </div>
      </div>
    </SidebarLayout>
  );
};

export default AICoach;
