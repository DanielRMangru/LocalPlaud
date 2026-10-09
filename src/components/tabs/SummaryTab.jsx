import React, { useState } from 'react';
import { 
  Sparkles, 
  CheckCircle2, 
  Circle, 
  ListTodo, 
  Clock, 
  User, 
  Tag, 
  Copy, 
  Check, 
  Plus, 
  PieChart,
  Lightbulb,
  ArrowRight
} from 'lucide-react';
import { Button } from '../ui/Button';

export const SummaryTab = ({ recording, onUpdateRecording }) => {
  const [copiedSummary, setCopiedSummary] = useState(false);
  const [newActionText, setNewActionText] = useState('');
  const [newActionAssignee, setNewActionAssignee] = useState('');
  const [isAddingAction, setIsAddingAction] = useState(false);

  if (!recording || !recording.summary) {
    return (
      <div className="p-8 text-center text-slate-400">
        No summary generated for this recording.
      </div>
    );
  }

  const { executive, keyTakeaways, actionItems, speakerStats } = recording.summary;

  const handleCopySummary = () => {
    const text = `EXECUTIVE SUMMARY\n${executive}\n\nKEY TAKEAWAYS\n${keyTakeaways.map(k => `• ${k}`).join('\n')}\n\nACTION ITEMS\n${actionItems.map(a => `[${a.completed ? 'x' : ' '}] ${a.task} (${a.assignee} - Due: ${a.due})`).join('\n')}`;
    navigator.clipboard.writeText(text);
    setCopiedSummary(true);
    setTimeout(() => setCopiedSummary(false), 2000);
  };

  const toggleActionItem = (actId) => {
    const updatedActions = actionItems.map(act => 
      act.id === actId ? { ...act, completed: !act.completed } : act
    );
    const updatedRecording = {
      ...recording,
      summary: {
        ...recording.summary,
        actionItems: updatedActions
      }
    };
    onUpdateRecording(updatedRecording);
  };

  const handleAddAction = (e) => {
    e.preventDefault();
    if (!newActionText.trim()) return;

    const newAct = {
      id: `act_${Date.now()}`,
      task: newActionText.trim(),
      assignee: newActionAssignee.trim() || 'Unassigned',
      due: 'Pending',
      priority: 'Medium',
      completed: false
    };

    const updatedActions = [...actionItems, newAct];
    const updatedRecording = {
      ...recording,
      summary: {
        ...recording.summary,
        actionItems: updatedActions
      }
    };
    onUpdateRecording(updatedRecording);
    setNewActionText('');
    setNewActionAssignee('');
    setIsAddingAction(false);
  };

  return (
    <div className="space-y-6 animate-fade-in pb-8">
      {/* Executive Briefing Card */}
      <div className="p-5 rounded-2xl bg-gradient-to-br from-plaud-card to-slate-900 border border-plaud-border shadow-lg relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
          <div className="flex items-center gap-2 text-indigo-400 font-semibold text-sm">
            <Sparkles className="w-4 h-4 text-plaud-cyan" />
            <span>Executive Briefing</span>
          </div>
          <button
            onClick={handleCopySummary}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-xs text-slate-300 transition-all"
          >
            {copiedSummary ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedSummary ? 'Copied' : 'Copy All'}</span>
          </button>
        </div>
        <p className="mt-3 text-sm text-slate-200 leading-relaxed font-normal">
          {executive}
        </p>
      </div>

      {/* Speaker Talk-Time Distribution */}
      {speakerStats && (
        <div className="p-5 rounded-2xl bg-plaud-card/70 border border-plaud-border space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-200">
              <PieChart className="w-4 h-4 text-plaud-cyan" />
              <span>Speaker Diarization & Talk-Time Analytics</span>
            </div>
          </div>

          {/* Multi-segmented Progress Bar */}
          <div className="w-full h-3 rounded-full bg-slate-900 overflow-hidden flex">
            {recording.speakers?.map((spk) => {
              const stat = speakerStats[spk.id] || { percentage: 0 };
              return (
                <div
                  key={spk.id}
                  style={{
                    width: `${stat.percentage}%`,
                    backgroundColor: spk.color
                  }}
                  className="h-full transition-all duration-500 hover:brightness-125"
                  title={`${spk.name}: ${stat.percentage}%`}
                />
              );
            })}
          </div>

          {/* Speaker Percentage Chips */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-1">
            {recording.speakers?.map((spk) => {
              const stat = speakerStats[spk.id] || { percentage: 0, time: 0 };
              return (
                <div
                  key={spk.id}
                  className="flex items-center justify-between p-2 rounded-xl bg-slate-900/60 border border-slate-800 text-xs"
                >
                  <div className="flex items-center gap-2 truncate">
                    <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: spk.color }} />
                    <span className="text-slate-300 truncate font-medium">{spk.name}</span>
                  </div>
                  <span className="font-mono font-bold text-slate-100 ml-2">{stat.percentage}%</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Key Takeaways */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
          <Lightbulb className="w-4 h-4 text-amber-400" />
          Key Discussion Points & Insights ({keyTakeaways?.length || 0})
        </h3>
        <div className="grid grid-cols-1 gap-2.5">
          {keyTakeaways?.map((takeaway, idx) => (
            <div
              key={idx}
              className="flex items-start gap-3 p-3.5 rounded-xl bg-plaud-card/60 border border-plaud-border hover:border-slate-600 transition-all text-sm text-slate-200"
            >
              <span className="w-5 h-5 rounded-lg bg-indigo-500/15 text-indigo-400 font-mono text-xs flex items-center justify-center shrink-0 mt-0.5 font-bold">
                {idx + 1}
              </span>
              <p className="leading-relaxed">{takeaway}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Action Items & Deliverables */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
            <ListTodo className="w-4 h-4 text-plaud-emerald" />
            Extracted Action Items & Next Steps ({actionItems?.length || 0})
          </h3>
          <Button
            variant="ghost"
            size="sm"
            icon={Plus}
            onClick={() => setIsAddingAction(!isAddingAction)}
          >
            Add Task
          </Button>
        </div>

        {/* Add action input inline */}
        {isAddingAction && (
          <form onSubmit={handleAddAction} className="p-3.5 rounded-xl bg-slate-900 border border-indigo-500/40 space-y-2">
            <input
              type="text"
              placeholder="Action item task description..."
              value={newActionText}
              onChange={(e) => setNewActionText(e.target.value)}
              className="w-full px-3 py-1.5 text-xs bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-plaud-accent"
            />
            <div className="flex items-center justify-between gap-2">
              <input
                type="text"
                placeholder="Assignee (e.g. Alex Rivera)"
                value={newActionAssignee}
                onChange={(e) => setNewActionAssignee(e.target.value)}
                className="w-1/2 px-3 py-1.5 text-xs bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none"
              />
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" onClick={() => setIsAddingAction(false)}>Cancel</Button>
                <Button variant="primary" size="sm" type="submit">Save Task</Button>
              </div>
            </div>
          </form>
        )}

        <div className="space-y-2">
          {actionItems?.map((act) => (
            <div
              key={act.id}
              onClick={() => toggleActionItem(act.id)}
              className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${
                act.completed
                  ? 'bg-slate-900/40 border-slate-800 text-slate-500 line-through'
                  : 'bg-plaud-card/80 border-plaud-border hover:border-slate-600 text-slate-200'
              }`}
            >
              <div className="flex items-center gap-3 truncate">
                <button type="button" className="text-emerald-400 shrink-0">
                  {act.completed ? <CheckCircle2 className="w-5 h-5" /> : <Circle className="w-5 h-5 text-slate-500" />}
                </button>
                <span className="text-sm font-medium truncate">{act.task}</span>
              </div>

              <div className="flex items-center gap-2 text-xs shrink-0 ml-3">
                <span className="flex items-center gap-1 text-indigo-300 bg-indigo-500/10 px-2 py-0.5 rounded-md border border-indigo-500/20">
                  <User className="w-3 h-3" />
                  {act.assignee}
                </span>
                {act.due && (
                  <span className="flex items-center gap-1 text-slate-400 bg-slate-800 px-2 py-0.5 rounded-md">
                    <Clock className="w-3 h-3" />
                    {act.due}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
