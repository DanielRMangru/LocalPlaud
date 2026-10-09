import React, { useState, useRef, useEffect } from 'react';
import { 
  Users, 
  Search, 
  Play, 
  Copy, 
  Check, 
  Edit3, 
  Filter, 
  Volume2, 
  Clock, 
  MessageSquare
} from 'lucide-react';
import { Button } from '../ui/Button';

export const TranscriptTab = ({
  recording,
  currentTime,
  onSeek,
  onUpdateRecording,
  isPlaying,
  onTogglePlay
}) => {
  const [searchWord, setSearchWord] = useState('');
  const [selectedSpeakerFilter, setSelectedSpeakerFilter] = useState('ALL');
  const [editingSpeakerId, setEditingSpeakerId] = useState(null);
  const [newSpeakerName, setNewSpeakerName] = useState('');
  const [copiedId, setCopiedId] = useState(null);
  const [copiedAll, setCopiedAll] = useState(false);

  const activeSegmentRef = useRef(null);

  if (!recording || !recording.transcript) {
    return (
      <div className="p-8 text-center text-slate-400">
        No transcript available for this recording.
      </div>
    );
  }

  const { transcript, speakers } = recording;

  // Filter segments
  const filteredTranscript = transcript.filter((seg) => {
    const matchesSpeaker = selectedSpeakerFilter === 'ALL' || seg.speakerId === selectedSpeakerFilter;
    const matchesSearch = !searchWord.trim() || seg.text.toLowerCase().includes(searchWord.toLowerCase()) || seg.speakerName.toLowerCase().includes(searchWord.toLowerCase());
    return matchesSpeaker && matchesSearch;
  });

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const handleRenameSpeaker = (spkId) => {
    if (!newSpeakerName.trim()) return;

    // Update speaker in speakers array
    const updatedSpeakers = speakers.map((s) =>
      s.id === spkId ? { ...s, name: newSpeakerName.trim() } : s
    );

    // Update speaker name in transcript segments
    const updatedTranscript = transcript.map((seg) =>
      seg.speakerId === spkId ? { ...seg, speakerName: newSpeakerName.trim() } : seg
    );

    // Also update speakerStats in summary if exists
    let updatedSummary = { ...recording.summary };
    if (updatedSummary.speakerStats && updatedSummary.speakerStats[spkId]) {
      updatedSummary.speakerStats[spkId].name = newSpeakerName.trim();
    }

    onUpdateRecording({
      ...recording,
      speakers: updatedSpeakers,
      transcript: updatedTranscript,
      summary: updatedSummary
    });

    setEditingSpeakerId(null);
    setNewSpeakerName('');
  };

  const copySegment = (seg) => {
    navigator.clipboard.writeText(`[${formatTime(seg.startTime)}] ${seg.speakerName}: ${seg.text}`);
    setCopiedId(seg.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const copyAllTranscript = () => {
    const text = transcript
      .map((seg) => `[${formatTime(seg.startTime)} - ${formatTime(seg.endTime)}] ${seg.speakerName}:\n${seg.text}\n`)
      .join('\n');
    navigator.clipboard.writeText(text);
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 2000);
  };

  return (
    <div className="space-y-4 animate-fade-in pb-8">
      {/* Controls & Speaker Filter Header */}
      <div className="p-4 rounded-2xl bg-plaud-card/80 border border-plaud-border space-y-3">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          {/* Speaker Pills Filter */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-xs text-slate-400 font-medium flex items-center gap-1 mr-1">
              <Filter className="w-3.5 h-3.5 text-plaud-cyan" /> Filter:
            </span>
            <button
              onClick={() => setSelectedSpeakerFilter('ALL')}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                selectedSpeakerFilter === 'ALL'
                  ? 'bg-plaud-accent text-white shadow-md'
                  : 'bg-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              All Speakers ({transcript.length})
            </button>
            {speakers?.map((spk) => (
              <button
                key={spk.id}
                onClick={() => setSelectedSpeakerFilter(spk.id)}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium border flex items-center gap-1.5 transition-all ${
                  selectedSpeakerFilter === spk.id
                    ? 'border-white text-white font-semibold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                style={{
                  backgroundColor: selectedSpeakerFilter === spk.id ? spk.color : `${spk.color}15`,
                  borderColor: `${spk.color}40`,
                }}
              >
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: selectedSpeakerFilter === spk.id ? '#FFF' : spk.color }} />
                <span>{spk.name}</span>
              </button>
            ))}
          </div>

          {/* Copy All Button */}
          <button
            onClick={copyAllTranscript}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 transition-all shrink-0"
          >
            {copiedAll ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedAll ? 'Copied Full Transcript' : 'Copy All Text'}</span>
          </button>
        </div>

        {/* Search Bar within transcript */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search within this transcript..."
            value={searchWord}
            onChange={(e) => setSearchWord(e.target.value)}
            className="w-full pl-9 pr-4 py-1.5 text-xs bg-slate-900 border border-slate-700 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:border-plaud-accent"
          />
        </div>
      </div>

      {/* Transcript Segments List */}
      <div className="space-y-3">
        {filteredTranscript.length === 0 ? (
          <div className="p-8 text-center text-slate-500 text-xs">
            No dialogue matching your filter or search query.
          </div>
        ) : (
          filteredTranscript.map((seg) => {
            const spk = speakers?.find((s) => s.id === seg.speakerId) || {
              name: seg.speakerName,
              color: '#6366F1'
            };

            const isActive = currentTime >= seg.startTime && currentTime <= seg.endTime;

            return (
              <div
                key={seg.id}
                className={`p-4 rounded-2xl border transition-all relative group ${
                  isActive
                    ? 'bg-plaud-card border-indigo-500/80 shadow-lg shadow-indigo-500/10 ring-1 ring-indigo-500/40'
                    : 'bg-plaud-card/60 border-plaud-border hover:border-slate-600'
                }`}
              >
                {/* Speaker Header & Timestamp */}
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800/60">
                  <div className="flex items-center gap-2">
                    {/* Speaker Avatar Badge */}
                    <div
                      className="w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold font-mono"
                      style={{
                        backgroundColor: `${spk.color}25`,
                        color: spk.color,
                        border: `1px solid ${spk.color}50`
                      }}
                    >
                      {spk.name.charAt(0)}
                    </div>

                    {/* Speaker Name or Rename Form */}
                    {editingSpeakerId === spk.id ? (
                      <div className="flex items-center gap-1.5">
                        <input
                          type="text"
                          defaultValue={spk.name}
                          onChange={(e) => setNewSpeakerName(e.target.value)}
                          className="px-2 py-0.5 text-xs bg-slate-900 border border-indigo-500 rounded text-white focus:outline-none"
                          autoFocus
                        />
                        <Button
                          variant="cyan"
                          size="sm"
                          onClick={() => handleRenameSpeaker(spk.id)}
                        >
                          Save
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setEditingSpeakerId(null)}
                        >
                          Cancel
                        </Button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-slate-200">
                          {seg.speakerName}
                        </span>
                        <button
                          onClick={() => {
                            setEditingSpeakerId(spk.id);
                            setNewSpeakerName(spk.name);
                          }}
                          className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-white transition-opacity"
                          title="Rename speaker"
                        >
                          <Edit3 className="w-3 h-3" />
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Timestamp & Play Trigger */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        onSeek(seg.startTime);
                        if (!isPlaying) onTogglePlay(true);
                      }}
                      className="flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-slate-800/80 hover:bg-indigo-600 hover:text-white text-[11px] font-mono text-slate-400 transition-all"
                      title="Click to seek playback to this moment"
                    >
                      <Play className="w-3 h-3 fill-current" />
                      <span>{formatTime(seg.startTime)}</span>
                    </button>

                    <button
                      onClick={() => copySegment(seg)}
                      className="p-1 rounded text-slate-500 hover:text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity"
                      title="Copy segment"
                    >
                      {copiedId === seg.id ? (
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Utterance Text */}
                <p
                  onClick={() => {
                    onSeek(seg.startTime);
                    if (!isPlaying) onTogglePlay(true);
                  }}
                  className={`text-sm leading-relaxed cursor-pointer transition-colors ${
                    isActive ? 'text-white font-medium' : 'text-slate-300 hover:text-slate-100'
                  }`}
                >
                  {seg.text}
                </p>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
