import React from 'react';
import { 
  Radio, 
  Upload, 
  Smartphone, 
  Search, 
  Sparkles, 
  Sliders, 
  Usb, 
  Bluetooth, 
  CheckCircle2, 
  AlertCircle,
  HelpCircle
} from 'lucide-react';
import { Button } from './ui/Button';

export const Header = ({
  searchQuery,
  setSearchQuery,
  onOpenDeviceModal,
  onOpenRecordModal,
  onOpenUploadModal,
  onOpenSettingsModal,
  connectedDevice,
  deviceCount = 1
}) => {
  return (
    <header className="h-16 border-b border-plaud-border bg-plaud-surface/90 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30">
      {/* Brand & Logo */}
      <div className="flex items-center gap-3">
        <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-plaud-accent via-indigo-500 to-plaud-cyan p-0.5 shadow-lg shadow-indigo-500/25">
          <div className="w-full h-full bg-plaud-surface rounded-[10px] flex items-center justify-center">
            <Radio className="w-5 h-5 text-plaud-cyan animate-pulse" />
          </div>
          <span className="absolute -top-1 -right-1 w-3 h-3 bg-plaud-emerald rounded-full border-2 border-plaud-surface animate-ping" />
          <span className="absolute -top-1 -right-1 w-3 h-3 bg-plaud-emerald rounded-full border-2 border-plaud-surface" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-extrabold text-base sm:text-lg tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
              PLAUD<span className="text-plaud-cyan font-light text-xs ml-1 px-1.5 py-0.5 rounded bg-plaud-cyan/10 border border-plaud-cyan/30 uppercase tracking-wider">AI Studio</span>
            </h1>
          </div>
          <p className="text-[11px] text-plaud-muted leading-none hidden sm:block">
            Voice Intelligence & Speaker Diarization
          </p>
        </div>
      </div>

      {/* Center: Search input */}
      <div className="hidden md:flex items-center max-w-md w-full mx-4">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search audio, transcripts, action items, or speakers..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-1.5 text-sm bg-plaud-card/80 border border-plaud-border rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:border-plaud-accent focus:ring-1 focus:ring-plaud-accent transition-all"
          />
        </div>
      </div>

      {/* Right Actions: Device Status & Action Buttons */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Device Status Pill */}
        <button
          onClick={onOpenDeviceModal}
          className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-plaud-card hover:bg-slate-800/80 border border-plaud-border transition-all text-xs font-medium text-slate-300 group"
        >
          <div className="relative flex items-center justify-center">
            <Usb className="w-3.5 h-3.5 text-plaud-cyan group-hover:scale-110 transition-transform" />
            <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-emerald-400 rounded-full" />
          </div>
          <span className="hidden sm:inline text-slate-200">Pixel 11 Pro / Plaud</span>
          <span className="px-1.5 py-0.2 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-semibold">
            USB Active
          </span>
        </button>

        {/* Live Record Button */}
        <Button
          variant="primary"
          size="sm"
          icon={Radio}
          onClick={onOpenRecordModal}
          className="hidden sm:inline-flex"
        >
          Record
        </Button>

        {/* Import Audio */}
        <Button
          variant="secondary"
          size="sm"
          icon={Upload}
          onClick={onOpenUploadModal}
        >
          <span className="hidden sm:inline">Import</span>
        </Button>

        {/* Settings */}
        <button
          onClick={onOpenSettingsModal}
          className="p-2 rounded-xl text-slate-400 hover:text-slate-100 hover:bg-plaud-card transition-all"
          title="AI Studio Settings & Keys"
        >
          <Sliders className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
