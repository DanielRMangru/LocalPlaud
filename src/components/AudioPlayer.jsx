import React, { useState, useRef, useEffect } from 'react';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  RotateCw, 
  Volume2, 
  VolumeX, 
  Gauge, 
  Radio, 
  PhoneCall, 
  Mic,
  Maximize2
} from 'lucide-react';

export const AudioPlayer = ({
  recording,
  currentTime,
  onSeek,
  isPlaying,
  onTogglePlay,
  onTimeUpdate
}) => {
  const [duration, setDuration] = useState(recording?.duration || 180);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);
  const [audioError, setAudioError] = useState(false);

  const audioRef = useRef(null);
  const canvasRef = useRef(null);
  const fallbackIntervalRef = useRef(null);

  const audioSrc = recording?.filename ? `/recordings/${recording.filename}` : null;

  useEffect(() => {
    if (recording?.duration) {
      setDuration(recording.duration);
    }
    setAudioError(false);
    if (audioRef.current) {
      audioRef.current.load();
    }
  }, [recording]);

  // Sync external seek or play state
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise.catch((err) => {
          console.warn('Audio play error / fallback triggered:', err);
          // If native audio tag fails or is empty, use fallback timer so timeline still advances
          startFallbackTimer();
        });
      }
    } else {
      audio.pause();
      stopFallbackTimer();
    }

    return () => stopFallbackTimer();
  }, [isPlaying, audioSrc]);

  // Fallback ticker in case audio file is purely synthesized or non-seekable
  const startFallbackTimer = () => {
    stopFallbackTimer();
    fallbackIntervalRef.current = setInterval(() => {
      onTimeUpdate((prev) => {
        const next = prev + 0.25 * playbackRate;
        if (next >= duration) {
          onTogglePlay(false);
          return 0;
        }
        return next;
      });
    }, 250);
  };

  const stopFallbackTimer = () => {
    if (fallbackIntervalRef.current) {
      clearInterval(fallbackIntervalRef.current);
      fallbackIntervalRef.current = null;
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current && !isNaN(audioRef.current.currentTime)) {
      onTimeUpdate(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current && audioRef.current.duration && !isNaN(audioRef.current.duration)) {
      setDuration(Math.round(audioRef.current.duration));
    }
  };

  const handleWaveformClick = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const ratio = Math.max(0, Math.min(1, clickX / rect.width));
    const targetTime = ratio * duration;
    
    if (audioRef.current) {
      audioRef.current.currentTime = targetTime;
    }
    onSeek(targetTime);
  };

  const skipSeconds = (delta) => {
    const newTime = Math.max(0, Math.min(duration, currentTime + delta));
    if (audioRef.current) {
      audioRef.current.currentTime = newTime;
    }
    onSeek(newTime);
  };

  const changePlaybackRate = (rate) => {
    setPlaybackRate(rate);
    if (audioRef.current) {
      audioRef.current.playbackRate = rate;
    }
    setShowSpeedMenu(false);
  };

  const toggleMute = () => {
    if (audioRef.current) {
      audioRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleVolumeChange = (e) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    if (audioRef.current) {
      audioRef.current.volume = val;
      if (val === 0) setIsMuted(true);
      else setIsMuted(false);
    }
  };

  // Draw Segmented Multi-Color Speaker Waveform
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;

    ctx.clearRect(0, 0, width, height);

    const numBars = 120;
    const barWidth = width / numBars;
    const progressRatio = duration > 0 ? currentTime / duration : 0;

    // Generate consistent pseudo-random amplitudes for this recording
    const seed = recording?.id ? recording.id.split('').reduce((a, b) => a + b.charCodeAt(0), 0) : 42;
    
    for (let i = 0; i < numBars; i++) {
      const barTime = (i / numBars) * duration;
      
      // Determine active speaker at this timestamp
      let speakerColor = '#6366F1';
      if (recording?.transcript) {
        const seg = recording.transcript.find(t => barTime >= t.startTime && barTime <= t.endTime);
        if (seg) {
          const spk = recording.speakers?.find(s => s.id === seg.speakerId);
          if (spk?.color) speakerColor = spk.color;
        }
      }

      // Height pseudo wave calculation
      const pseudoVal = Math.sin(i * 0.18 + seed) * 0.35 + Math.cos(i * 0.45) * 0.25 + 0.45;
      const barHeight = Math.max(6, pseudoVal * height * 0.82);

      const x = i * barWidth;
      const y = (height - barHeight) / 2;

      // Color logic (played vs future)
      const isPlayed = (i / numBars) <= progressRatio;
      
      if (isPlayed) {
        ctx.fillStyle = speakerColor;
        ctx.shadowColor = speakerColor;
        ctx.shadowBlur = 4;
      } else {
        ctx.fillStyle = 'rgba(71, 85, 105, 0.45)';
        ctx.shadowBlur = 0;
      }

      ctx.beginPath();
      ctx.roundRect(x + 1, y, barWidth - 2, barHeight, [2]);
      ctx.fill();
    }

    // Draw playhead cursor line
    const playheadX = progressRatio * width;
    ctx.shadowBlur = 8;
    ctx.shadowColor = '#06B6D4';
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(playheadX - 1, 0, 2, height);

  }, [recording, currentTime, duration]);

  const formatTime = (secs) => {
    const sFloor = Math.floor(secs || 0);
    const m = Math.floor(sFloor / 60);
    const s = sFloor % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="p-4 rounded-2xl bg-plaud-card/90 border border-plaud-border shadow-xl space-y-3">
      {/* Audio element */}
      {audioSrc && (
        <audio
          ref={audioRef}
          src={audioSrc}
          preload="auto"
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
          onEnded={() => onTogglePlay(false)}
          onError={() => setAudioError(true)}
        />
      )}

      {/* Speaker Legend Bar */}
      <div className="flex items-center justify-between text-xs px-1">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[11px] text-slate-400 font-medium">Speakers:</span>
          {recording?.speakers?.map((spk) => (
            <div
              key={spk.id}
              className="flex items-center gap-1.5 px-2 py-0.5 rounded-md border text-[11px] font-medium"
              style={{
                backgroundColor: `${spk.color}15`,
                borderColor: `${spk.color}40`,
                color: spk.color
              }}
            >
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: spk.color }} />
              <span>{spk.name}</span>
            </div>
          ))}
        </div>

        {/* Dual Mode Tag */}
        <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-slate-800/80 border border-slate-700 text-[11px] text-slate-300">
          {recording?.mode === 'Call' ? (
            <>
              <PhoneCall className="w-3 h-3 text-rose-400" />
              <span>VCS Vibration Mode</span>
            </>
          ) : (
            <>
              <Mic className="w-3 h-3 text-plaud-cyan" />
              <span>Air Mic Beamforming</span>
            </>
          )}
        </div>
      </div>

      {/* Interactive Waveform Canvas */}
      <div
        onClick={handleWaveformClick}
        className="relative w-full h-20 bg-slate-950/70 rounded-xl border border-slate-800/80 hover:border-plaud-accent/40 cursor-pointer overflow-hidden p-1 flex items-center transition-all group"
      >
        <canvas
          ref={canvasRef}
          width={800}
          height={72}
          className="w-full h-full"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-indigo-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
      </div>

      {/* Player Controls Bar */}
      <div className="flex items-center justify-between pt-1">
        {/* Left: Timers */}
        <div className="font-mono text-xs font-semibold text-slate-300 flex items-center gap-1.5">
          <span className="text-white">{formatTime(currentTime)}</span>
          <span className="text-slate-500">/</span>
          <span className="text-slate-400">{formatTime(duration)}</span>
        </div>

        {/* Center: Play / Pause / Skips */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => skipSeconds(-5)}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-all"
            title="Rewind 5s"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          <button
            onClick={() => onTogglePlay(!isPlaying)}
            className="w-10 h-10 rounded-xl bg-gradient-to-r from-plaud-accent to-indigo-600 hover:from-indigo-500 hover:to-indigo-600 text-white flex items-center justify-center shadow-lg shadow-indigo-500/25 transition-transform active:scale-95"
          >
            {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current ml-0.5" />}
          </button>

          <button
            onClick={() => skipSeconds(10)}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-all"
            title="Forward 10s"
          >
            <RotateCw className="w-4 h-4" />
          </button>
        </div>

        {/* Right: Speed & Volume */}
        <div className="flex items-center gap-3">
          {/* Speed Selector */}
          <div className="relative">
            <button
              onClick={() => setShowSpeedMenu(!showSpeedMenu)}
              className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 transition-all"
            >
              {playbackRate}x
            </button>

            {showSpeedMenu && (
              <div className="absolute bottom-full right-0 mb-2 py-1 w-20 bg-plaud-surface border border-plaud-border rounded-xl shadow-xl z-20 flex flex-col">
                {[0.75, 1, 1.25, 1.5, 2].map((rate) => (
                  <button
                    key={rate}
                    onClick={() => changePlaybackRate(rate)}
                    className={`px-3 py-1 text-xs text-left hover:bg-slate-800 transition-all ${
                      playbackRate === rate ? 'text-plaud-accent font-bold bg-indigo-500/10' : 'text-slate-300'
                    }`}
                  >
                    {rate}x
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Volume */}
          <div className="hidden sm:flex items-center gap-2 text-slate-400">
            <button onClick={toggleMute} className="hover:text-white transition-colors">
              {isMuted || volume === 0 ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4" />}
            </button>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={isMuted ? 0 : volume}
              onChange={handleVolumeChange}
              className="w-16 h-1 bg-slate-700 rounded-lg cursor-pointer"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
