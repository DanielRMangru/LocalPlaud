import React, { useState, useRef } from 'react';
import { 
  Upload, 
  FileAudio, 
  Sparkles, 
  CheckCircle2, 
  X, 
  AlertCircle,
  FolderOpen
} from 'lucide-react';
import { Button } from './ui/Button';

export const UploadModal = ({ isOpen, onClose, onRecordingAdded, onSelectRecording }) => {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [title, setTitle] = useState('');
  const [mode, setMode] = useState('Note');
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  if (!isOpen) return null;

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      setSelectedFile(file);
      setTitle(file.name.replace(/\.[^/.]+$/, ''));
    }
  };

  const handleChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setTitle(file.name.replace(/\.[^/.]+$/, ''));
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;
    setUploading(true);

    const formData = new FormData();
    formData.append('audio', selectedFile);
    formData.append('title', title || selectedFile.name.replace(/\.[^/.]+$/, ''));
    formData.append('mode', mode);
    formData.append('deviceSource', 'Local File Import');

    try {
      const res = await fetch('/api/recordings/upload', {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      if (data.success) {
        onRecordingAdded(data.recording);
        onSelectRecording(data.recording);
        onClose();
      } else {
        alert('Upload failed: ' + data.error);
      }
    } catch (err) {
      console.error('Upload error:', err);
      alert('Error uploading and processing audio file');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-md bg-plaud-surface border border-plaud-border rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-plaud-border flex items-center justify-between bg-plaud-card/40">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-plaud-accent/15 text-plaud-accent border border-plaud-accent/30">
              <Upload className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-100">
                Import Audio Recording
              </h2>
              <p className="text-xs text-plaud-muted">
                Extract speakers, transcribe & generate AI intelligence
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

        {/* Form Body */}
        <div className="p-6 space-y-4">
          {/* Drag & Drop Zone */}
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-2 ${
              dragActive
                ? 'border-plaud-accent bg-indigo-500/10'
                : selectedFile
                ? 'border-emerald-500/50 bg-emerald-500/5'
                : 'border-slate-700 hover:border-slate-500 bg-plaud-card/40'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="audio/*,.wav,.mp3,.m4a,.aac,.flac,.opus,.ogg"
              onChange={handleChange}
              className="hidden"
            />
            {selectedFile ? (
              <>
                <div className="p-3 rounded-full bg-emerald-500/20 text-emerald-400">
                  <FileAudio className="w-6 h-6" />
                </div>
                <div className="text-sm font-semibold text-slate-200 truncate max-w-xs">
                  {selectedFile.name}
                </div>
                <div className="text-xs text-slate-400">
                  {(selectedFile.size / 1024 / 1024).toFixed(2)} MB • Ready to transcribe
                </div>
              </>
            ) : (
              <>
                <div className="p-3 rounded-full bg-slate-800 text-slate-300">
                  <FolderOpen className="w-6 h-6 text-plaud-cyan" />
                </div>
                <div className="text-sm font-medium text-slate-200">
                  Drop audio file here, or <span className="text-plaud-cyan">browse</span>
                </div>
                <div className="text-xs text-slate-500">
                  Supports WAV, MP3, M4A, OPUS, FLAC, AAC (up to 500MB)
                </div>
              </>
            )}
          </div>

          {/* Title & Mode */}
          {selectedFile && (
            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium text-slate-300">Recording Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full mt-1 px-3 py-1.5 text-sm bg-plaud-card border border-plaud-border rounded-xl text-slate-100 focus:outline-none focus:border-plaud-accent"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-slate-300">Recording Type</label>
                <div className="grid grid-cols-2 gap-2 mt-1">
                  <button
                    type="button"
                    onClick={() => setMode('Note')}
                    className={`py-1.5 text-xs font-medium rounded-lg border transition-all ${
                      mode === 'Note'
                        ? 'bg-indigo-500/20 border-indigo-500 text-indigo-300'
                        : 'bg-plaud-card border-plaud-border text-slate-400'
                    }`}
                  >
                    Meeting Note
                  </button>
                  <button
                    type="button"
                    onClick={() => setMode('Call')}
                    className={`py-1.5 text-xs font-medium rounded-lg border transition-all ${
                      mode === 'Call'
                        ? 'bg-rose-500/20 border-rose-500 text-rose-300'
                        : 'bg-plaud-card border-plaud-border text-slate-400'
                    }`}
                  >
                    Phone Call
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-plaud-border bg-plaud-card/40 flex items-center justify-between">
          <Button variant="ghost" size="sm" onClick={onClose} disabled={uploading}>
            Cancel
          </Button>
          <Button
            variant="cyan"
            size="md"
            icon={Sparkles}
            disabled={!selectedFile || uploading}
            onClick={handleUpload}
          >
            {uploading ? 'Transcribing & Diarizing...' : 'Import & Transcribe'}
          </Button>
        </div>
      </div>
    </div>
  );
};
