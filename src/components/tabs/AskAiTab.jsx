import React, { useState } from 'react';
import { 
  Sparkles, 
  Send, 
  Bot, 
  User, 
  Copy, 
  Check, 
  MessageSquare, 
  Zap,
  Mail,
  ListTodo,
  FileText
} from 'lucide-react';
import { Button } from '../ui/Button';

export const AskAiTab = ({ recording }) => {
  const [messages, setMessages] = useState([
    {
      id: 'msg_welcome',
      sender: 'ai',
      text: `Hello! I have fully parsed and diarized **"${recording?.title || 'this recording'}"**. What would you like me to extract or generate?`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [inputQuery, setInputQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [copiedId, setCopiedId] = useState(null);

  const quickPrompts = [
    { label: 'Follow-up Email', icon: Mail, prompt: 'Draft a professional follow-up email based on the decisions and action items in this meeting.' },
    { label: 'Action Items & Deadlines', icon: ListTodo, prompt: 'List all action items, assignees, and stated deadlines.' },
    { label: 'Executive 30-Sec Summary', icon: FileText, prompt: 'Summarize the entire recording in 3 bullet points with direct impact.' },
    { label: 'Speaker Perspectives', icon: User, prompt: 'What was each speaker\'s main position or contribution during this session?' },
  ];

  const handleSend = async (queryText) => {
    const textToSend = queryText || inputQuery;
    if (!textToSend.trim() || !recording?.id) return;

    const userMsg = {
      id: `usr_${Date.now()}`,
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputQuery('');
    setLoading(true);

    try {
      const res = await fetch(`/api/recordings/${recording.id}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: textToSend })
      });
      const data = await res.json();

      if (data.success) {
        const aiMsg = {
          id: `ai_${Date.now()}`,
          sender: 'ai',
          text: data.answer,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        setMessages((prev) => [...prev, aiMsg]);
      } else {
        throw new Error(data.error || 'Failed to query AI');
      }
    } catch (err) {
      console.error('AI chat error:', err);
      const errorMsg = {
        id: `err_${Date.now()}`,
        sender: 'ai',
        text: 'Sorry, I encountered an issue processing that query. Please try again.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const copyMessage = (id, text) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-4 animate-fade-in flex flex-col h-[520px]">
      {/* Quick Prompt Suggestions */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 shrink-0">
        {quickPrompts.map((qp, i) => {
          const Icon = qp.icon;
          return (
            <button
              key={i}
              onClick={() => handleSend(qp.prompt)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-plaud-card hover:bg-slate-800 border border-plaud-border hover:border-indigo-500/40 text-xs text-slate-300 transition-all shrink-0"
            >
              <Icon className="w-3.5 h-3.5 text-plaud-cyan" />
              <span>{qp.label}</span>
            </button>
          );
        })}
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto space-y-3 p-4 rounded-2xl bg-slate-950/60 border border-plaud-border">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex items-start gap-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {msg.sender === 'ai' && (
              <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-plaud-accent to-plaud-cyan flex items-center justify-center text-white shrink-0 shadow-md">
                <Sparkles className="w-4 h-4" />
              </div>
            )}

            <div
              className={`max-w-xl p-3.5 rounded-2xl text-xs sm:text-sm leading-relaxed relative group ${
                msg.sender === 'user'
                  ? 'bg-plaud-accent text-white rounded-tr-sm shadow-md'
                  : 'bg-plaud-card border border-plaud-border text-slate-200 rounded-tl-sm'
              }`}
            >
              <div className="whitespace-pre-line">{msg.text}</div>

              <div className="flex items-center justify-between mt-2 pt-1 border-t border-white/10 text-[10px] text-slate-400">
                <span>{msg.timestamp}</span>
                <button
                  onClick={() => copyMessage(msg.id, msg.text)}
                  className="hover:text-white transition-colors"
                  title="Copy answer"
                >
                  {copiedId === msg.id ? (
                    <Check className="w-3 h-3 text-emerald-400" />
                  ) : (
                    <Copy className="w-3 h-3" />
                  )}
                </button>
              </div>
            </div>

            {msg.sender === 'user' && (
              <div className="w-7 h-7 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300 shrink-0">
                <User className="w-4 h-4" />
              </div>
            )}
          </div>
        ))}

        {loading && (
          <div className="flex items-center gap-2 p-3 text-xs text-indigo-400 bg-indigo-500/10 rounded-xl border border-indigo-500/20 max-w-xs animate-pulse">
            <Sparkles className="w-4 h-4 animate-spin" />
            <span>Analyzing recording context...</span>
          </div>
        )}
      </div>

      {/* Query Input Box */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        className="flex items-center gap-2 pt-1"
      >
        <input
          type="text"
          placeholder="Ask anything about this recording (e.g. 'What did Sarah agree to?')..."
          value={inputQuery}
          onChange={(e) => setInputQuery(e.target.value)}
          disabled={loading}
          className="flex-1 px-4 py-2.5 text-xs sm:text-sm bg-plaud-card border border-plaud-border rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:border-plaud-accent"
        />
        <Button
          variant="primary"
          size="md"
          icon={Send}
          disabled={!inputQuery.trim() || loading}
          type="submit"
        >
          Ask
        </Button>
      </form>
    </div>
  );
};
