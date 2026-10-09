import React, { useState, useRef, useEffect } from 'react';
import { 
  Radio, 
  Square, 
  Pause, 
  Play, 
  Mic, 
  PhoneCall, 
  Sparkles, 
  Volume2, 
  Check, 
  X,
  Sliders,
  AudioWaveform
} from 'lucide-react';
import { Button } from './ui/Button';

export const LiveRecordModal = ({ isOpen, onClose, onRecordingAdded, onSelectRecording }) => {
  const [recording, setRecording] = useState(false);
  const [paused, setPaused] = useState(false);
  const [timer, setTimer] = useState(0);
  const [mode, setMode] = useState('Note'); // 'Note' or 'Call'
  const [title, setTitle] = useState('');
  const [noiseReduction, setNoiseReduction] = useState(true);
  const [processing, setProcessing] = useState(false);

  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const canvasRef = useRef(null);
  const animationFrameRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const streamRef = useRef(null);

  useEffect(() => {
    let interval = null;
    if (recording && !paused) {
      interval = setInterval(() => {
        setTimer((t) => t + 1);
      }, 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [recording, paused]);

  // Start Live Recording
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          noiseSuppression: noiseReduction,
          echoCancellation: true,
          autoGainControl: true,
        }
      });
      streamRef.current = stream;

      // Audio Context for visualizer
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      audioContextRef.current = audioCtx;
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 64;
      analyserRef.current = analyser;

      const source = audioCtx.createMediaStreamSource(stream);
      source.connect(analyser);

      drawVisualizer();

      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.start(250);
      setRecording(true);
      setPaused(false);
      setTimer(0);
    } catch (err) {
      console.error('Microphone access denied or error:', err);
      alert('Could not access microphone. Please allow microphone permissions in your browser.');
    }
  };

  const drawVisualizer = () => {
    if (!canvasRef.current || !analyserRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const analyser = analyserRef.current;
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const render = () => {
      animationFrameRef.current = requestAnimationFrame(render);
      analyser.getByteFrequencyData(dataArray);

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const barWidth = (canvas.width / bufferLength) * 1.8;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        const barHeight = (dataArray[i] / 255) * canvas.height * 0.85;

        const gradient = ctx.createLinearGradient(0, canvas.height, 0, 0);
        if (mode === 'Call') {
          gradient.addColorStop(0, '#6366F1');
          gradient.addColorStop(1, '#F43F5E');
        } else {
          gradient.addColorStop(0, '#6366F1');
          gradient.addColorStop(1, '#06B6D4');
        }

        ctx.fillStyle = gradient;
        ctx.fillRect(x, canvas.height - barHeight, barWidth - 2, barHeight);
        x += barWidth;
      }
    };
    render();
  };

  const pauseRecording = () => {
    if (mediaRecorderRef.current && recording) {
      if (paused) {
        mediaRecorderRef.current.resume();
        setPaused(false);
      } else {
        mediaRecorderRef.current.pause();
        setPaused(true);
      }
    }
  };

  const stopAndSave = async () => {
    if (!mediaRecorderRef.current) return;
    setProcessing(true);

    mediaRecorderRef.current.onstop = async () => {
      const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
      const defaultName = title.trim() || `${mode === 'Call' ? 'Phone Call' : 'Meeting Note'} ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;

      const formData = new FormData();
      formData.append('audio', audioBlob, `${defaultName}.webm`);
      formData.append('title', defaultName);
      formData.append('mode', mode);
      formData.append('deviceSource', 'PLAUD In-Browser Dual-Engine');

      try {
        const res = await fetch('/api/recordings/upload', {
          method: 'POST',
          body: formData
        });
        const data = await res.json();
        if (data.success) {
          onRecordingAdded(data.recording);
          onSelectRecording(data.recording);
          cleanup();
          onClose();
        } else {
          alert('Failed to process recording: ' + data.error);
        }
      } catch (err) {
        console.error('Error uploading recording:', err);
        alert('Failed to save and diarize recording');
      } finally {
        setProcessing(false);
      }
    };

    mediaRecorderRef.current.stop();
  };

  const cleanup = () => {
    if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
    }
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      audioContextRef.current.close();
    }
    setRecording(false);
    setPaused(false);
    setTimer(0);
  };

  const formatTimer = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-lg bg-plaud-surface border border-plaud-border rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-plaud-border flex items-center justify-between bg-plaud-card/40">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-xl border ${
              mode === 'Call'
                ? 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                : 'bg-plaud-accent/15 text-plaud-accent border-plaud-accent/30'
            }`}>
              {mode === 'Call' ? <PhoneCall className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-100">
                Plaud Dual-Engine Live Recorder
              </h2>
              <p className="text-xs text-plaud-muted">
                Studio-grade audio capture with real-time noise suppression
              </p>
            </div>
          </div>
          {!recording && (
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-all"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          {/* Mode Selector */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
              Recording Mode (Dual Hardware Sensor Simulation)
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                disabled={recording}
                onClick={() => setMode('Note')}
                className={`p-3 rounded-xl border flex flex-col items-start gap-1 transition-all ${
                  mode === 'Note'
                    ? 'bg-indigo-500/15 border-indigo-500 text-white shadow-lg shadow-indigo-500/10'
                    : 'bg-plaud-card border-plaud-border text-slate-400 hover:border-slate-600'
                }`}
              >
                <div className="flex items-center gap-2 font-semibold text-xs text-indigo-300">
                  <Mic className="w-4 h-4" />
                  Note Mode (Air Mic)
                </div>
                <span className="text-[11px] text-slate-400 text-left">
                  Conference rooms, interviews & lectures with spatial beamforming.
                </span>
              </button>

              <button
                type="button"
                disabled={recording}
                onClick={() => setMode('Call')}
                className={`p-3 rounded-xl border flex flex-col items-start gap-1 transition-all ${
                  mode === 'Call'
                    ? 'bg-rose-500/15 border-rose-500 text-white shadow-lg shadow-rose-500/10'
                    : 'bg-plaud-card border-plaud-border text-slate-400 hover:border-slate-600'
                }`}
              >
                <div className="flex items-center gap-2 font-semibold text-xs text-rose-300">
                  <PhoneCall className="w-4 h-4" />
                  Call Mode (VCS Sensor)
                </div>
                <span className="text-[11px] text-slate-400 text-left">
                  Phone calls, vibration sensor conduction with zero background leak.
                </span>
              </button>
            </div>
          </div>

          {/* Title input */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">
              Recording Title
            </label>
            <input
              type="text"
              placeholder={mode === 'Call' ? 'e.g. Client Discovery Call with VP' : 'e.g. Q4 Executive Product Strategy'}
              value={title}
              disabled={recording}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3.5 py-2 text-sm bg-plaud-card border border-plaud-border rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:border-plaud-accent"
            />
          </div>

          {/* Visualizer Canvas & Timer */}
          <div className="p-4 rounded-xl bg-slate-950/80 border border-plaud-border flex flex-col items-center justify-center relative overflow-hidden h-36">
            <canvas
              ref={canvasRef}
              width={380}
              height={90}
              className="w-full h-24 mb-2 z-10"
            />

            {/* Timer Display */}
            <div className="flex items-center gap-2 z-10">
              {recording && (
                <span className={`w-2.5 h-2.5 rounded-full ${paused ? 'bg-amber-400' : 'bg-rose-500 animate-ping'}`} />
              )}
              <span className="font-mono text-2xl font-bold tracking-wider text-slate-100">
                {formatTimer(timer)}
              </span>
              <span className="text-[10px] text-slate-400 px-1.5 py-0.5 rounded bg-slate-800">
                {mode === 'Call' ? 'VCS' : 'Air Mic'} • 48kHz
              </span>
            </div>
          </div>

          {/* Noise suppression toggle */}
          <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-plaud-card border border-plaud-border text-xs text-slate-300">
            <div className="flex items-center gap-2">
              <Volume2 className="w-4 h-4 text-plaud-cyan" />
              <span>AI Noise Suppression (35dB SNR)</span>
            </div>
            <input
              type="checkbox"
              checked={noiseReduction}
              disabled={recording}
              onChange={(e) => setNoiseReduction(e.target.checked)}
              className="w-4 h-4 rounded text-plaud-accent focus:ring-plaud-accent"
            />
          </div>
        </div>

        {/* Controls Footer */}
        <div className="px-6 py-4 border-t border-plaud-border bg-plaud-card/40 flex items-center justify-between">
          {!recording ? (
            <Button
              variant="primary"
              size="lg"
              icon={Radio}
              onClick={startRecording}
              className="w-full"
            >
              Start Recording
            </Button>
          ) : (
            <div className="flex items-center gap-3 w-full justify-between">
              <Button
                variant="secondary"
                size="md"
                icon={paused ? Play : Pause}
                onClick={pauseRecording}
              >
                {paused ? 'Resume' : 'Pause'}
              </Button>

              <Button
                variant="emerald"
                size="md"
                icon={Square}
                disabled={processing}
                onClick={stopAndSave}
                className="flex-1"
              >
                {processing ? 'Diarizing & Transcribing...' : 'Stop & Auto-Summarize'}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
