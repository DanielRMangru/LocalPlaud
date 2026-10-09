import React from 'react';
import { 
  Folder, 
  PhoneCall, 
  Mic, 
  Star, 
  Trash2, 
  Smartphone, 
  Usb, 
  Sparkles, 
  CheckCircle2,
  HardDrive,
  Clock,
  Layers,
  ChevronRight
} from 'lucide-react';

export const Sidebar = ({
  recordings,
  selectedRecording,
  onSelectRecording,
  activeFilter,
  setActiveFilter,
  onToggleStar,
  onDeleteRecording,
  onOpenDeviceModal,
  searchQuery
}) => {
  // Filter list
  const filtered = recordings.filter((r) => {
    // Category / Mode filter
    if (activeFilter === 'starred' && !r.starred) return false;
    if (activeFilter === 'call' && r.mode !== 'Call') return false;
    if (activeFilter === 'meeting' && r.mode !== 'Note') return false;

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = r.title.toLowerCase().includes(q);
      const matchExec = r.summary?.executive?.toLowerCase().includes(q);
      const matchSpeaker = r.speakers?.some(s => s.name.toLowerCase().includes(q));
      const matchTranscript = r.transcript?.some(t => t.text.toLowerCase().includes(q));
      if (!matchTitle && !matchExec && !matchSpeaker && !matchTranscript) return false;
    }
    return true;
  });

  const formatDuration = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}m ${s}s`;
  };

  const formatDate = (dateStr) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    } catch (e) {
      return dateStr;
    }
  };

  return (
    <aside className="w-80 lg:w-96 border-r border-plaud-border bg-plaud-surface/70 flex flex-col h-[calc(100vh-4rem)] shrink-0 select-none">
      {/* Category Navigation Pills */}
      <div className="p-3 border-b border-plaud-border/80 space-y-2">
        <div className="grid grid-cols-4 gap-1 text-[11px] font-semibold">
          <button
            onClick={() => setActiveFilter('all')}
            className={`py-1.5 rounded-lg transition-all ${
              activeFilter === 'all'
                ? 'bg-plaud-accent text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            All ({recordings.length})
          </button>
          <button
            onClick={() => setActiveFilter('meeting')}
            className={`py-1.5 rounded-lg transition-all ${
              activeFilter === 'meeting'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            Meetings
          </button>
          <button
            onClick={() => setActiveFilter('call')}
            className={`py-1.5 rounded-lg transition-all ${
              activeFilter === 'call'
                ? 'bg-rose-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            Calls
          </button>
          <button
            onClick={() => setActiveFilter('starred')}
            className={`py-1.5 rounded-lg transition-all ${
              activeFilter === 'starred'
                ? 'bg-amber-500 text-slate-950 font-bold shadow-md'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            ★ Starred
          </button>
        </div>
      </div>

      {/* Recordings List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {filtered.length === 0 ? (
          <div className="p-8 text-center text-slate-500 text-xs">
            No recordings found matching your filters.
          </div>
        ) : (
          filtered.map((rec) => {
            const isSelected = selectedRecording?.id === rec.id;

            return (
              <div
                key={rec.id}
                onClick={() => onSelectRecording(rec)}
                className={`p-3.5 rounded-2xl border cursor-pointer transition-all relative group ${
                  isSelected
                    ? 'bg-plaud-card border-plaud-accent shadow-lg shadow-indigo-500/10 ring-1 ring-plaud-accent/50'
                    : 'bg-plaud-card/50 border-plaud-border hover:border-slate-600 hover:bg-plaud-card/80'
                }`}
              >
                {/* Header: Mode icon + Title + Star */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-start gap-2.5 truncate">
                    <div
                      className={`p-1.5 rounded-lg shrink-0 mt-0.5 ${
                        rec.mode === 'Call'
                          ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                          : 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
                      }`}
                    >
                      {rec.mode === 'Call' ? (
                        <PhoneCall className="w-3.5 h-3.5" />
                      ) : (
                        <Mic className="w-3.5 h-3.5" />
                      )}
                    </div>
                    <div className="truncate">
                      <h4
                        className={`text-xs sm:text-sm font-semibold truncate ${
                          isSelected ? 'text-white' : 'text-slate-200'
                        }`}
                      >
                        {rec.title}
                      </h4>
                      <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                        <span>{formatDate(rec.date)}</span>
                        <span>•</span>
                        <span>{formatDuration(rec.duration || 60)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleStar(rec.id);
                      }}
                      className={`p-1 rounded transition-colors ${
                        rec.starred
                          ? 'text-amber-400'
                          : 'text-slate-500 hover:text-slate-300 opacity-0 group-hover:opacity-100'
                      }`}
                      title={rec.starred ? 'Unstar' : 'Star'}
                    >
                      <Star className={`w-3.5 h-3.5 ${rec.starred ? 'fill-current' : ''}`} />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (confirm(`Delete "${rec.title}"?`)) {
                          onDeleteRecording(rec.id);
                        }
                      }}
                      className="p-1 rounded text-slate-500 hover:text-rose-400 opacity-0 group-hover:opacity-100 transition-colors"
                      title="Delete recording"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Speakers Preview & Device tag */}
                <div className="flex items-center justify-between mt-2.5 pt-2 border-t border-slate-800/60 text-[10px]">
                  <div className="flex items-center gap-1">
                    {rec.speakers?.map((spk) => (
                      <span
                        key={spk.id}
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: spk.color }}
                        title={spk.name}
                      />
                    ))}
                    <span className="text-slate-400 ml-1">
                      {rec.speakers?.length || 1} {rec.speakers?.length === 1 ? 'Speaker' : 'Speakers'}
                    </span>
                  </div>

                  <span className="text-slate-500 truncate max-w-[120px]">
                    {rec.deviceSource || 'Plaud Note Pro'}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Connected Device & Storage Dock Widget */}
      <div className="p-3 border-t border-plaud-border bg-plaud-card/90">
        <div
          onClick={onOpenDeviceModal}
          className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-plaud-accent/50 cursor-pointer transition-all flex items-center justify-between group"
        >
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-indigo-500/15 text-indigo-400 border border-indigo-500/30">
              <Smartphone className="w-4 h-4 text-plaud-cyan" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-slate-100 group-hover:text-plaud-cyan transition-colors">
                  Pixel 11 Pro / Plaud
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              </div>
              <p className="text-[10px] text-slate-400">
                USB Connected • 64GB Ready
              </p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-white transition-colors" />
        </div>
      </div>
    </aside>
  );
};
