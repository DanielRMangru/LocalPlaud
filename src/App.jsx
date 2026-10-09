import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  FileText, 
  Users, 
  GitBranch, 
  MessageSquare, 
  Star, 
  Download, 
  Edit3, 
  Share2, 
  Calendar, 
  Clock, 
  HardDrive,
  Check,
  PhoneCall,
  Mic,
  Tag,
  RefreshCw,
  Cpu
} from 'lucide-react';

import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { AudioPlayer } from './components/AudioPlayer';
import { SummaryTab } from './components/tabs/SummaryTab';
import { TranscriptTab } from './components/tabs/TranscriptTab';
import { MindMapTab } from './components/tabs/MindMapTab';
import { AskAiTab } from './components/tabs/AskAiTab';
import { DeviceManagerModal } from './components/DeviceManagerModal';
import { LiveRecordModal } from './components/LiveRecordModal';
import { UploadModal } from './components/UploadModal';
import { SettingsModal } from './components/SettingsModal';
import { ExportModal } from './components/ExportModal';
import { Button } from './components/ui/Button';

export function App() {
  const [recordings, setRecordings] = useState([]);
  const [selectedRecording, setSelectedRecording] = useState(null);
  const [activeTab, setActiveTab] = useState('summary');
  const [activeFilter, setActiveFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Audio Playback state
  const [currentTime, setCurrentTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [retranscribing, setRetranscribing] = useState(false);

  // Modals state
  const [deviceModalOpen, setDeviceModalOpen] = useState(false);
  const [recordModalOpen, setRecordModalOpen] = useState(false);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [settingsModalOpen, setSettingsModalOpen] = useState(false);
  const [exportModalOpen, setExportModalOpen] = useState(false);

  // Title edit inline
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editTitleValue, setEditTitleValue] = useState('');

  const fetchRecordings = async () => {
    try {
      const res = await fetch('/api/recordings');
      const data = await res.json();
      if (data.success && data.recordings) {
        setRecordings(data.recordings);
        if (data.recordings.length > 0 && !selectedRecording) {
          setSelectedRecording(data.recordings[0]);
        }
      }
    } catch (err) {
      console.error('Error fetching recordings:', err);
    }
  };

  useEffect(() => {
    fetchRecordings();
  }, []);

  const handleSelectRecording = (rec) => {
    setSelectedRecording(rec);
    setCurrentTime(0);
    setIsPlaying(false);
    setIsEditingTitle(false);
  };

  const handleUpdateRecording = async (updated) => {
    setRecordings((prev) =>
      prev.map((r) => (r.id === updated.id ? updated : r))
    );
    setSelectedRecording(updated);

    try {
      await fetch(`/api/recordings/${updated.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated)
      });
    } catch (err) {
      console.error('Error updating recording:', err);
    }
  };

  // 1-Click Retranscribe with real Whisper
  const handleRetranscribe = async (recId) => {
    setRetranscribing(true);
    try {
      const res = await fetch(`/api/recordings/${recId}/retranscribe`, {
        method: 'POST'
      });
      const data = await res.json();
      if (data.success) {
        setRecordings((prev) =>
          prev.map((r) => (r.id === data.recording.id ? data.recording : r))
        );
        setSelectedRecording(data.recording);
        alert('Real AI Whisper transcription & diarization complete!');
      } else {
        alert('Transcription failed: ' + (data.error || 'Unknown error'));
      }
    } catch (err) {
      console.error('Retranscribe error:', err);
      alert('Error running AI Whisper model');
    } finally {
      setRetranscribing(false);
    }
  };

  const handleToggleStar = (id) => {
    const rec = recordings.find((r) => r.id === id);
    if (rec) {
      handleUpdateRecording({ ...rec, starred: !rec.starred });
    }
  };

  const handleDeleteRecording = async (id) => {
    try {
      await fetch(`/api/recordings/${id}`, { method: 'DELETE' });
      const nextList = recordings.filter((r) => r.id !== id);
      setRecordings(nextList);
      if (selectedRecording?.id === id) {
        setSelectedRecording(nextList[0] || null);
      }
    } catch (err) {
      console.error('Error deleting recording:', err);
    }
  };

  const handleSaveTitle = () => {
    if (selectedRecording && editTitleValue.trim()) {
      handleUpdateRecording({
        ...selectedRecording,
        title: editTitleValue.trim()
      });
      setIsEditingTitle(false);
    }
  };

  const handleRecordingAdded = (newRec) => {
    setRecordings((prev) => [newRec, ...prev]);
    setSelectedRecording(newRec);
    setCurrentTime(0);
    setIsPlaying(false);
  };

  return (
    <div className="min-h-screen bg-plaud-bg text-plaud-text flex flex-col font-sans">
      {/* Top Navigation Header */}
      <Header
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onOpenDeviceModal={() => setDeviceModalOpen(true)}
        onOpenRecordModal={() => setRecordModalOpen(true)}
        onOpenUploadModal={() => setUploadModalOpen(true)}
        onOpenSettingsModal={() => setSettingsModalOpen(true)}
      />

      {/* Main Studio Body */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Recordings Sidebar */}
        <Sidebar
          recordings={recordings}
          selectedRecording={selectedRecording}
          onSelectRecording={handleSelectRecording}
          activeFilter={activeFilter}
          setActiveFilter={setActiveFilter}
          onToggleStar={handleToggleStar}
          onDeleteRecording={handleDeleteRecording}
          onOpenDeviceModal={() => setDeviceModalOpen(true)}
          searchQuery={searchQuery}
        />

        {/* Right Main Content Panel */}
        <main className="flex-1 overflow-y-auto bg-slate-950/40 p-4 lg:p-6 flex flex-col gap-5">
          {selectedRecording ? (
            <>
              {/* Recording Detail Header */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 rounded-2xl bg-plaud-card/70 border border-plaud-border">
                {/* Title & Metadata */}
                <div className="space-y-1">
                  {isEditingTitle ? (
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={editTitleValue}
                        onChange={(e) => setEditTitleValue(e.target.value)}
                        className="text-lg font-bold bg-slate-900 border border-indigo-500 rounded-lg px-2.5 py-1 text-white focus:outline-none"
                        autoFocus
                      />
                      <Button variant="cyan" size="sm" onClick={handleSaveTitle}>Save</Button>
                      <Button variant="ghost" size="sm" onClick={() => setIsEditingTitle(false)}>Cancel</Button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 group">
                      <h2 className="text-base sm:text-xl font-extrabold text-white tracking-tight">
                        {selectedRecording.title}
                      </h2>
                      <button
                        onClick={() => {
                          setEditTitleValue(selectedRecording.title);
                          setIsEditingTitle(true);
                        }}
                        className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-white transition-opacity"
                        title="Edit title"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                    </div>
                  )}

                  <div className="flex items-center gap-3 text-xs text-slate-400 flex-wrap">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-indigo-400" />
                      {new Date(selectedRecording.date).toLocaleDateString([], {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-plaud-cyan" />
                      {Math.floor((selectedRecording.duration || 60) / 60)}m {(selectedRecording.duration || 60) % 60}s
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <HardDrive className="w-3.5 h-3.5 text-emerald-400" />
                      {selectedRecording.deviceSource || 'PLAUD Note Pro (Hardware)'}
                    </span>
                  </div>
                </div>

                {/* Right Top Actions: Retranscribe, Star, Export */}
                <div className="flex items-center gap-2 shrink-0">
                  <Button
                    variant="cyan"
                    size="sm"
                    icon={Cpu}
                    disabled={retranscribing}
                    onClick={() => handleRetranscribe(selectedRecording.id)}
                    title="Run Real Whisper Speech-to-Text on this audio"
                  >
                    {retranscribing ? 'Transcribing AI...' : 'Run Whisper AI'}
                  </Button>

                  <button
                    onClick={() => handleToggleStar(selectedRecording.id)}
                    className={`p-2 rounded-xl border transition-all ${
                      selectedRecording.starred
                        ? 'bg-amber-500/10 border-amber-500/30 text-amber-400'
                        : 'bg-plaud-card border-plaud-border text-slate-400 hover:text-white'
                    }`}
                    title={selectedRecording.starred ? 'Starred' : 'Star this recording'}
                  >
                    <Star className={`w-4 h-4 ${selectedRecording.starred ? 'fill-current' : ''}`} />
                  </button>

                  <Button
                    variant="secondary"
                    size="sm"
                    icon={Download}
                    onClick={() => setExportModalOpen(true)}
                  >
                    Export
                  </Button>
                </div>
              </div>

              {/* Segmented Waveform Audio Player */}
              <AudioPlayer
                recording={selectedRecording}
                currentTime={currentTime}
                onSeek={(time) => setCurrentTime(time)}
                isPlaying={isPlaying}
                onTogglePlay={(playing) => setIsPlaying(playing)}
                onTimeUpdate={(time) => setCurrentTime(time)}
              />

              {/* Plaud Tab Bar */}
              <div className="flex items-center border-b border-plaud-border gap-2 sm:gap-4 overflow-x-auto text-xs font-semibold">
                <button
                  onClick={() => setActiveTab('summary')}
                  className={`py-3 px-3 flex items-center gap-2 border-b-2 transition-all shrink-0 ${
                    activeTab === 'summary'
                      ? 'border-plaud-accent text-indigo-400 font-bold'
                      : 'border-transparent text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Sparkles className="w-4 h-4" />
                  AI Summary & Tasks
                </button>

                <button
                  onClick={() => setActiveTab('transcript')}
                  className={`py-3 px-3 flex items-center gap-2 border-b-2 transition-all shrink-0 ${
                    activeTab === 'transcript'
                      ? 'border-plaud-cyan text-plaud-cyan font-bold'
                      : 'border-transparent text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Users className="w-4 h-4" />
                  Diarized Transcript ({selectedRecording.transcript?.length || 0})
                </button>

                <button
                  onClick={() => setActiveTab('mindmap')}
                  className={`py-3 px-3 flex items-center gap-2 border-b-2 transition-all shrink-0 ${
                    activeTab === 'mindmap'
                      ? 'border-emerald-400 text-emerald-400 font-bold'
                      : 'border-transparent text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <GitBranch className="w-4 h-4" />
                  Visual Mind Map
                </button>

                <button
                  onClick={() => setActiveTab('askai')}
                  className={`py-3 px-3 flex items-center gap-2 border-b-2 transition-all shrink-0 ${
                    activeTab === 'askai'
                      ? 'border-purple-400 text-purple-400 font-bold'
                      : 'border-transparent text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <MessageSquare className="w-4 h-4" />
                  Ask Plaud AI
                </button>
              </div>

              {/* Active Tab Panel */}
              <div className="flex-1">
                {activeTab === 'summary' && (
                  <SummaryTab
                    recording={selectedRecording}
                    onUpdateRecording={handleUpdateRecording}
                  />
                )}

                {activeTab === 'transcript' && (
                  <TranscriptTab
                    recording={selectedRecording}
                    currentTime={currentTime}
                    onSeek={(time) => setCurrentTime(time)}
                    onUpdateRecording={handleUpdateRecording}
                    isPlaying={isPlaying}
                    onTogglePlay={(p) => setIsPlaying(p)}
                  />
                )}

                {activeTab === 'mindmap' && (
                  <MindMapTab recording={selectedRecording} />
                )}

                {activeTab === 'askai' && (
                  <AskAiTab recording={selectedRecording} />
                )}
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-12 text-slate-400 space-y-4">
              <div className="p-4 rounded-3xl bg-plaud-card border border-plaud-border text-plaud-cyan">
                <Sparkles className="w-10 h-10 animate-pulse" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-200">No Recording Selected</h3>
                <p className="text-xs text-slate-400 max-w-sm mt-1">
                  Connect your Pixel 11 Pro, Plaud Note device, or record/upload audio to extract speakers and generate AI insights.
                </p>
              </div>
              <Button variant="cyan" size="md" onClick={() => setDeviceModalOpen(true)}>
                Open Device Hub & Sync
              </Button>
            </div>
          )}
        </main>
      </div>

      {/* Modals */}
      <DeviceManagerModal
        isOpen={deviceModalOpen}
        onClose={() => setDeviceModalOpen(false)}
        onSelectRecording={handleSelectRecording}
        onRecordingAdded={handleRecordingAdded}
      />

      <LiveRecordModal
        isOpen={recordModalOpen}
        onClose={() => setRecordModalOpen(false)}
        onSelectRecording={handleSelectRecording}
        onRecordingAdded={handleRecordingAdded}
      />

      <UploadModal
        isOpen={uploadModalOpen}
        onClose={() => setUploadModalOpen(false)}
        onSelectRecording={handleSelectRecording}
        onRecordingAdded={handleRecordingAdded}
      />

      <SettingsModal
        isOpen={settingsModalOpen}
        onClose={() => setSettingsModalOpen(false)}
      />

      <ExportModal
        isOpen={exportModalOpen}
        onClose={() => setExportModalOpen(false)}
        recording={selectedRecording}
      />
    </div>
  );
}

export default App;
