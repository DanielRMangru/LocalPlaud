import React, { useState } from 'react';
import { 
  GitBranch, 
  ZoomIn, 
  ZoomOut, 
  Maximize2, 
  Copy, 
  Check, 
  ChevronRight, 
  ChevronDown, 
  Sparkles,
  Layers
} from 'lucide-react';
import { Button } from '../ui/Button';

export const MindMapTab = ({ recording }) => {
  const [zoom, setZoom] = useState(1);
  const [collapsedNodes, setCollapsedNodes] = useState({});
  const [copied, setCopied] = useState(false);

  if (!recording || !recording.summary?.mindMap) {
    return (
      <div className="p-8 text-center text-slate-400">
        No Mind Map generated for this recording.
      </div>
    );
  }

  const mindMap = recording.summary.mindMap;

  const toggleCollapse = (nodeKey) => {
    setCollapsedNodes((prev) => ({
      ...prev,
      [nodeKey]: !prev[nodeKey]
    }));
  };

  const handleCopyMarkdown = () => {
    let md = `# ${mindMap.title}\n`;
    mindMap.children?.forEach((branch) => {
      md += `\n## ${branch.title}\n`;
      branch.children?.forEach((sub) => {
        md += `- ${sub.title}\n`;
      });
    });
    navigator.clipboard.writeText(md);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const branchColors = [
    { bg: 'from-indigo-600/30 to-indigo-900/40', border: 'border-indigo-500/50', text: 'text-indigo-300', dot: 'bg-indigo-400' },
    { bg: 'from-cyan-600/30 to-cyan-900/40', border: 'border-cyan-500/50', text: 'text-cyan-300', dot: 'bg-cyan-400' },
    { bg: 'from-emerald-600/30 to-emerald-900/40', border: 'border-emerald-500/50', text: 'text-emerald-300', dot: 'bg-emerald-400' },
    { bg: 'from-amber-600/30 to-amber-900/40', border: 'border-amber-500/50', text: 'text-amber-300', dot: 'bg-amber-400' },
  ];

  return (
    <div className="space-y-4 animate-fade-in pb-8">
      {/* Mind Map Controls Header */}
      <div className="p-4 rounded-2xl bg-plaud-card/80 border border-plaud-border flex items-center justify-between">
        <div className="flex items-center gap-2">
          <GitBranch className="w-4 h-4 text-plaud-cyan" />
          <span className="text-xs font-bold text-slate-200 uppercase tracking-wider">
            Visual Mind Map Knowledge Graph
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setZoom((z) => Math.max(0.7, z - 0.1))}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300"
            title="Zoom Out"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <span className="text-xs font-mono text-slate-400 min-w-[40px] text-center">
            {Math.round(zoom * 100)}%
          </span>
          <button
            onClick={() => setZoom((z) => Math.min(1.5, z + 0.1))}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300"
            title="Zoom In"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            onClick={() => setZoom(1)}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium"
            title="Reset Zoom"
          >
            Reset
          </button>

          <button
            onClick={handleCopyMarkdown}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 transition-all ml-2"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied' : 'Copy Outline'}</span>
          </button>
        </div>
      </div>

      {/* Visual Mind Map Canvas View */}
      <div className="relative min-h-[440px] p-8 rounded-2xl bg-gradient-to-br from-slate-950 via-plaud-bg to-slate-950 border border-plaud-border overflow-x-auto flex items-center justify-center">
        {/* Subtle grid background */}
        <div 
          className="absolute inset-0 opacity-15 pointer-events-none"
          style={{
            backgroundImage: 'radial-gradient(#6366F1 1px, transparent 1px)',
            backgroundSize: '24px 24px'
          }}
        />

        <div
          style={{ transform: `scale(${zoom})`, transformOrigin: 'center center' }}
          className="transition-transform duration-200 flex flex-col md:flex-row items-center gap-8 md:gap-12 relative z-10 max-w-full"
        >
          {/* Root Central Node */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-plaud-accent via-indigo-600 to-plaud-cyan p-0.5 shadow-2xl shadow-indigo-500/30 mindmap-node shrink-0 max-w-xs">
            <div className="p-4 rounded-[14px] bg-slate-950/95 flex flex-col items-center text-center gap-1.5">
              <span className="text-[10px] uppercase tracking-widest text-plaud-cyan font-bold flex items-center gap-1">
                <Sparkles className="w-3 h-3" /> Root Topic
              </span>
              <h3 className="text-sm font-bold text-white tracking-tight">
                {mindMap.title}
              </h3>
              <span className="text-[11px] text-slate-400">
                {recording.duration ? `${Math.floor(recording.duration / 60)}m ${recording.duration % 60}s` : 'Recording'}
              </span>
            </div>
          </div>

          {/* Primary Branches */}
          <div className="flex flex-col gap-6 w-full max-w-md">
            {mindMap.children?.map((branch, idx) => {
              const theme = branchColors[idx % branchColors.length];
              const isCollapsed = collapsedNodes[`branch_${idx}`];

              return (
                <div key={idx} className="flex flex-col gap-2 relative">
                  {/* Branch Node */}
                  <div
                    onClick={() => toggleCollapse(`branch_${idx}`)}
                    className={`p-3 rounded-xl bg-gradient-to-r ${theme.bg} border ${theme.border} cursor-pointer flex items-center justify-between mindmap-node shadow-md`}
                  >
                    <div className="flex items-center gap-2">
                      <span className={`w-2.5 h-2.5 rounded-full ${theme.dot}`} />
                      <span className={`text-xs font-bold ${theme.text}`}>
                        {branch.title}
                      </span>
                    </div>
                    <button className="text-slate-400 hover:text-white">
                      {isCollapsed ? (
                        <ChevronRight className="w-4 h-4" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      )}
                    </button>
                  </div>

                  {/* Sub-branch Leaf Items */}
                  {!isCollapsed && branch.children && (
                    <div className="pl-6 space-y-1.5 border-l-2 border-slate-800 ml-3">
                      {branch.children.map((sub, sIdx) => (
                        <div
                          key={sIdx}
                          className="p-2.5 rounded-lg bg-plaud-card/90 border border-plaud-border hover:border-slate-600 text-xs text-slate-200 transition-all flex items-center gap-2 shadow-sm"
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-slate-500" />
                          <span>{sub.title}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
