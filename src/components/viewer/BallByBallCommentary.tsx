import React, { useState } from 'react';
import { MessageSquareText, Radio, Volume2, Sparkles, Filter } from 'lucide-react';
import { useCricket } from '../../context/CricketContext';
import { audioAnnouncer } from '../../utils/audioAnnouncer';

export const BallByBallCommentary: React.FC = () => {
  const { commentary, isVoiceEnabled, setIsVoiceEnabled } = useCricket();
  const [filter, setFilter] = useState<'ALL' | 'BOUNDARIES' | 'WICKETS'>('ALL');

  const filteredItems = commentary.filter((item) => {
    if (filter === 'BOUNDARIES') {
      return item.eventSummary.includes('FOUR') || item.eventSummary.includes('SIX');
    }
    if (filter === 'WICKETS') {
      return item.eventSummary.includes('WICKET');
    }
    return true;
  });

  const handleSpeakItem = (text: string) => {
    audioAnnouncer.announce(text, true);
  };

  return (
    <div className="flex flex-col rounded-xl bg-zinc-900 border border-zinc-800 overflow-hidden shadow-xl h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-zinc-950 border-b border-zinc-800 text-xs">
        <div className="flex items-center gap-2">
          <MessageSquareText className="w-4 h-4 text-orange-400" />
          <span className="font-bold uppercase tracking-wider text-zinc-100 font-display">
            LIVE COMMENTARY
          </span>
          <span className="flex items-center gap-1 text-[11px] text-red-500 font-semibold uppercase">
            <Radio className="w-3 h-3 animate-pulse" />
            AI FEED
          </span>
        </div>

        {/* Audio Toggle */}
        <button
          onClick={() => setIsVoiceEnabled(!isVoiceEnabled)}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs transition-colors border ${
            isVoiceEnabled
              ? 'bg-orange-500/20 text-orange-300 border-orange-500/40'
              : 'bg-zinc-800 text-zinc-400 border-zinc-700'
          }`}
          title="Auto voice announcements"
        >
          <Volume2 className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">{isVoiceEnabled ? 'Voice ON' : 'Voice OFF'}</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1 p-2 bg-zinc-950/60 border-b border-zinc-800/80 text-xs">
        <Filter className="w-3.5 h-3.5 text-zinc-500 ml-1 mr-1" />
        {(['ALL', 'BOUNDARIES', 'WICKETS'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={`px-3 py-1 rounded font-medium transition-colors ${
              filter === tab
                ? 'bg-zinc-800 text-white font-semibold shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Commentary Items List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2.5 max-h-[420px]">
        {filteredItems.length === 0 ? (
          <div className="p-8 text-center text-xs text-zinc-500">
            No commentary matching the selected filter.
          </div>
        ) : (
          filteredItems.map((item) => {
            const isWicket = item.eventSummary.includes('WICKET');
            const isFour = item.eventSummary.includes('FOUR');
            const isSix = item.eventSummary.includes('SIX');

            let badgeStyle = 'bg-zinc-800 text-zinc-300 border-zinc-700';
            if (isWicket) badgeStyle = 'bg-red-950 text-red-300 border-red-800 font-bold';
            else if (isSix) badgeStyle = 'bg-purple-950 text-purple-300 border-purple-800 font-bold';
            else if (isFour) badgeStyle = 'bg-blue-950 text-blue-300 border-blue-800 font-bold';

            return (
              <div
                key={item.id}
                className={`p-3 rounded-lg border transition-all ${
                  item.isHighlighted
                    ? 'bg-gradient-to-r from-orange-950/20 via-zinc-900 to-zinc-900 border-orange-500/30'
                    : 'bg-zinc-950/50 border-zinc-800/70 hover:border-zinc-700'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className="font-mono-numbers text-xs font-bold text-orange-400 bg-zinc-900 px-2 py-0.5 rounded border border-zinc-800">
                      Over {item.overStr}
                    </span>
                    <span className={`text-[10px] px-2 py-0.5 rounded border uppercase tracking-wide ${badgeStyle}`}>
                      {item.eventSummary}
                    </span>
                  </div>

                  <button
                    onClick={() => handleSpeakItem(item.text)}
                    className="p-1 rounded text-zinc-500 hover:text-orange-400 hover:bg-zinc-800 transition-colors"
                    title="Read out commentary"
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <p className="text-xs text-zinc-200 leading-relaxed font-normal">
                  {item.text}
                </p>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
