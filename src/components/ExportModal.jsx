import React, { useState } from 'react';
import { 
  Download, 
  FileText, 
  FileCode, 
  FileSpreadsheet, 
  Music, 
  Check, 
  Copy, 
  X,
  Share2
} from 'lucide-react';
import { Button } from './ui/Button';

export const ExportModal = ({ isOpen, onClose, recording }) => {
  const [format, setFormat] = useState('markdown'); // markdown, pdf, txt, srt, json
  const [copied, setCopied] = useState(false);

  if (!isOpen || !recording) return null;

  const generateMarkdown = () => {
    return `# ${recording.title}
**Date:** ${new Date(recording.date).toLocaleString()}
**Mode:** ${recording.mode === 'Call' ? 'Phone Call (VCS Vibration)' : 'Meeting Note (Air Mic)'}
**Duration:** ${Math.floor((recording.duration || 60) / 60)}m ${(recording.duration || 60) % 60}s
**Device:** ${recording.deviceSource || 'Plaud Note Pro'}

---

## 📋 Executive Summary
${recording.summary?.executive || ''}

---

## 💡 Key Takeaways
${recording.summary?.keyTakeaways?.map(k => `- ${k}`).join('\n') || ''}

---

## ✅ Action Items
${recording.summary?.actionItems?.map(a => `- [${a.completed ? 'x' : ' '}] **${a.task}** (Assignee: ${a.assignee} | Due: ${a.due} | Priority: ${a.priority})`).join('\n') || ''}

---

## 👥 Speaker Diarization Transcript
${recording.transcript?.map(t => `**[${Math.floor(t.startTime)}s] ${t.speakerName}:**\n${t.text}\n`).join('\n') || ''}
`;
  };

  const generateSRT = () => {
    return recording.transcript?.map((t, idx) => {
      const formatSRTTime = (secs) => {
        const h = Math.floor(secs / 3600).toString().padStart(2, '0');
        const m = Math.floor((secs % 3600) / 60).toString().padStart(2, '0');
        const s = Math.floor(secs % 60).toString().padStart(2, '0');
        const ms = Math.floor((secs % 1) * 1000).toString().padStart(3, '0');
        return `${h}:${m}:${s},${ms}`;
      };
      return `${idx + 1}\n${formatSRTTime(t.startTime)} --> ${formatSRTTime(t.endTime)}\n[${t.speakerName}] ${t.text}\n`;
    }).join('\n') || '';
  };

  const handleDownload = () => {
    let content = '';
    let ext = 'md';
    let mime = 'text/markdown';

    if (format === 'markdown') {
      content = generateMarkdown();
      ext = 'md';
      mime = 'text/markdown';
    } else if (format === 'txt') {
      content = generateMarkdown();
      ext = 'txt';
      mime = 'text/plain';
    } else if (format === 'srt') {
      content = generateSRT();
      ext = 'srt';
      mime = 'text/plain';
    } else if (format === 'json') {
      content = JSON.stringify(recording, null, 2);
      ext = 'json';
      mime = 'application/json';
    }

    const blob = new Blob([content], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${recording.title.replace(/[^a-zA-Z0-9_-]/g, '_')}_plaud.${ext}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    onClose();
  };

  const handleCopy = () => {
    const md = generateMarkdown();
    navigator.clipboard.writeText(md);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-md bg-plaud-surface border border-plaud-border rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-plaud-border flex items-center justify-between bg-plaud-card/40">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-plaud-cyan/15 text-plaud-cyan border border-plaud-cyan/30">
              <Download className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-100">
                Export Intelligence Document
              </h2>
              <p className="text-xs text-plaud-muted">
                Download summary, action items & diarized transcripts
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-2.5">
            <button
              onClick={() => setFormat('markdown')}
              className={`p-3 rounded-xl border flex flex-col items-start gap-1 transition-all ${
                format === 'markdown'
                  ? 'bg-indigo-500/15 border-indigo-500 text-white'
                  : 'bg-plaud-card border-plaud-border text-slate-400 hover:border-slate-600'
              }`}
            >
              <FileText className="w-4 h-4 text-indigo-400" />
              <span className="text-xs font-bold">Markdown (.md)</span>
              <span className="text-[10px] text-slate-400">Formatted with headers & bullets</span>
            </button>

            <button
              onClick={() => setFormat('txt')}
              className={`p-3 rounded-xl border flex flex-col items-start gap-1 transition-all ${
                format === 'txt'
                  ? 'bg-indigo-500/15 border-indigo-500 text-white'
                  : 'bg-plaud-card border-plaud-border text-slate-400 hover:border-slate-600'
              }`}
            >
              <FileCode className="w-4 h-4 text-emerald-400" />
              <span className="text-xs font-bold">Plain Text (.txt)</span>
              <span className="text-[10px] text-slate-400">Universal text file</span>
            </button>

            <button
              onClick={() => setFormat('srt')}
              className={`p-3 rounded-xl border flex flex-col items-start gap-1 transition-all ${
                format === 'srt'
                  ? 'bg-indigo-500/15 border-indigo-500 text-white'
                  : 'bg-plaud-card border-plaud-border text-slate-400 hover:border-slate-600'
              }`}
            >
              <Music className="w-4 h-4 text-amber-400" />
              <span className="text-xs font-bold">Subtitles (.srt)</span>
              <span className="text-[10px] text-slate-400">Video & audio sync format</span>
            </button>

            <button
              onClick={() => setFormat('json')}
              className={`p-3 rounded-xl border flex flex-col items-start gap-1 transition-all ${
                format === 'json'
                  ? 'bg-indigo-500/15 border-indigo-500 text-white'
                  : 'bg-plaud-card border-plaud-border text-slate-400 hover:border-slate-600'
              }`}
            >
              <FileSpreadsheet className="w-4 h-4 text-rose-400" />
              <span className="text-xs font-bold">Raw JSON (.json)</span>
              <span className="text-[10px] text-slate-400">Full API structured payload</span>
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-plaud-border bg-plaud-card/40 flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            icon={copied ? Check : Copy}
            onClick={handleCopy}
          >
            {copied ? 'Copied' : 'Copy All Text'}
          </Button>
          <Button
            variant="cyan"
            size="md"
            icon={Download}
            onClick={handleDownload}
          >
            Download File
          </Button>
        </div>
      </div>
    </div>
  );
};
