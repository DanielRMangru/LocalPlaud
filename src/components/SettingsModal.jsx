import React, { useState, useEffect } from 'react';
import { 
  Sliders, 
  Key, 
  Cpu, 
  Sparkles, 
  Check, 
  X, 
  ShieldCheck,
  Bot,
  RefreshCw,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { Button } from './ui/Button';

export const SettingsModal = ({ isOpen, onClose }) => {
  const [geminiKey, setGeminiKey] = useState(localStorage.getItem('plaud_gemini_key') || '');
  const [openaiKey, setOpenaiKey] = useState(localStorage.getItem('plaud_openai_key') || '');
  const [modelChoice, setModelChoice] = useState(localStorage.getItem('plaud_ai_model') || 'local-whisper');
  const [saved, setSaved] = useState(false);
  const [whisperHealth, setWhisperHealth] = useState(null);
  const [checkingHealth, setCheckingHealth] = useState(false);

  const checkWhisperHealth = async () => {
    setCheckingHealth(true);
    try {
      const res = await fetch('/api/health/whisper');
      const data = await res.json();
      if (data.success) {
        setWhisperHealth(data.whisper);
      }
    } catch (e) {
      console.error('Error checking Whisper health:', e);
    } finally {
      setCheckingHealth(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      checkWhisperHealth();
    }
  }, [isOpen]);

  const handleReinstallWhisper = async () => {
    try {
      await fetch('/api/health/whisper/reinstall', { method: 'POST' });
      alert('Whisper automated verification & repair initiated in background.');
      setTimeout(checkWhisperHealth, 3000);
    } catch (e) {
      alert('Error triggering repair');
    }
  };

  if (!isOpen) return null;

  const handleSave = () => {
    localStorage.setItem('plaud_gemini_key', geminiKey.trim());
    localStorage.setItem('plaud_openai_key', openaiKey.trim());
    localStorage.setItem('plaud_ai_model', modelChoice);
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      onClose();
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-lg bg-plaud-surface border border-plaud-border rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-plaud-border flex items-center justify-between bg-plaud-card/40">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-plaud-accent/15 text-plaud-accent border border-plaud-accent/30">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-100">
                Plaud AI Studio Settings & Validation
              </h2>
              <p className="text-xs text-plaud-muted">
                Speech Diarization, Local Whisper Health & Cloud Keys
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

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Local Whisper Health Card */}
          <div className="p-4 rounded-xl bg-gradient-to-r from-plaud-card to-slate-900 border border-plaud-border space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Cpu className="w-4 h-4 text-plaud-cyan" />
                <span className="text-xs font-bold text-slate-100">
                  Local Whisper AI Engine (Self-Healing Failsafe)
                </span>
              </div>
              <button
                onClick={checkWhisperHealth}
                className="p-1 rounded text-slate-400 hover:text-white"
                title="Refresh Status"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${checkingHealth ? 'animate-spin' : ''}`} />
              </button>
            </div>

            <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-950/80 border border-slate-800 text-xs">
              <div className="flex items-center gap-2">
                {whisperHealth?.ready ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                ) : whisperHealth?.installing ? (
                  <RefreshCw className="w-4 h-4 text-amber-400 animate-spin" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-rose-400" />
                )}
                <div>
                  <span className="font-semibold text-slate-200">
                    {whisperHealth?.ready
                      ? 'Whisper AI Verified & Active'
                      : whisperHealth?.installing
                      ? 'Auto-Installing Whisper...'
                      : 'Whisper Engine Offline'}
                  </span>
                  <div className="text-[10px] text-slate-400">
                    Model: <code className="text-indigo-300">{whisperHealth?.model || 'base.en'}</code> • {whisperHealth?.device || 'CPU INT8'}
                  </div>
                </div>
              </div>

              <Button
                variant="ghost"
                size="sm"
                onClick={handleReinstallWhisper}
                className="text-[11px]"
              >
                Validate / Repair
              </Button>
            </div>
          </div>

          {/* AI Model Choice */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <Bot className="w-3.5 h-3.5 text-plaud-cyan" />
              Active Intelligence Model
            </label>
            <select
              value={modelChoice}
              onChange={(e) => setModelChoice(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-plaud-card border border-plaud-border rounded-xl text-slate-100 focus:outline-none focus:border-plaud-accent"
            >
              <option value="local-whisper">Local Faster-Whisper (100% Offline & Private)</option>
              <option value="gemini-flash">Google Gemini 2.0 / 1.5 Flash (Ultra Fast Audio API)</option>
              <option value="openai-whisper">OpenAI Whisper v3 Large + GPT-4o API</option>
            </select>
          </div>

          {/* Optional Cloud Keys */}
          <div className="space-y-3 pt-1 border-t border-slate-800">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
                <Key className="w-3.5 h-3.5 text-amber-400" />
                Google Gemini API Key (Optional Expansion)
              </label>
              <input
                type="password"
                placeholder="AIzaSy..."
                value={geminiKey}
                onChange={(e) => setGeminiKey(e.target.value)}
                className="w-full px-3 py-1.5 text-xs bg-plaud-card border border-plaud-border rounded-xl text-slate-100 placeholder-slate-600 focus:outline-none focus:border-plaud-accent"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
                <Key className="w-3.5 h-3.5 text-emerald-400" />
                OpenAI API Key (Optional Expansion)
              </label>
              <input
                type="password"
                placeholder="sk-..."
                value={openaiKey}
                onChange={(e) => setOpenaiKey(e.target.value)}
                className="w-full px-3 py-1.5 text-xs bg-plaud-card border border-plaud-border rounded-xl text-slate-100 placeholder-slate-600 focus:outline-none focus:border-plaud-accent"
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-plaud-border bg-plaud-card/40 flex items-center justify-between">
          <Button variant="ghost" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="primary"
            size="md"
            icon={saved ? Check : Sparkles}
            onClick={handleSave}
          >
            {saved ? 'Preferences Saved!' : 'Save Settings'}
          </Button>
        </div>
      </div>
    </div>
  );
};
