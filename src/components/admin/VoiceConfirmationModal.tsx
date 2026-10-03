import React from 'react';
import { Mic, Check, X, AlertCircle } from 'lucide-react';
import { useCricket } from '../../context/CricketContext';

export const VoiceConfirmationModal: React.FC = () => {
  const { pendingVoiceCommand, confirmVoiceCommand, cancelVoiceCommand } = useCricket();

  if (!pendingVoiceCommand) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-zinc-900 border-2 border-orange-500 rounded-2xl p-5 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-full bg-orange-500/20 text-orange-400 border border-orange-500/40">
            <Mic className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-orange-400 uppercase tracking-wider block">
              Voice Command Detected
            </span>
            <h3 className="text-lg font-black text-white">{pendingVoiceCommand.command}</h3>
          </div>
        </div>

        <div className="p-3 rounded-lg bg-zinc-950 border border-zinc-800 text-xs text-zinc-300">
          <span className="text-zinc-500 block mb-0.5 font-semibold">Action to execute:</span>
          {pendingVoiceCommand.description}
        </div>

        <p className="text-[11px] text-zinc-400">
          Please confirm this scoring operation to prevent accidental changes.
        </p>

        <div className="grid grid-cols-2 gap-3 pt-2">
          <button
            onClick={cancelVoiceCommand}
            className="flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-bold text-xs transition-colors"
          >
            <X className="w-4 h-4" />
            <span>CANCEL</span>
          </button>

          <button
            onClick={confirmVoiceCommand}
            className="flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-black text-xs shadow-lg transition-colors"
          >
            <Check className="w-4 h-4" />
            <span>CONFIRM</span>
          </button>
        </div>
      </div>
    </div>
  );
};
