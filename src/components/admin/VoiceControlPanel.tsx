import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Volume2, Sparkles, Command } from 'lucide-react';
import { useCricket } from '../../context/CricketContext';

// Define SpeechRecognition interface for browser compatibility
interface IWindow extends Window {
  webkitSpeechRecognition?: any;
  SpeechRecognition?: any;
}

export const VoiceControlPanel: React.FC = () => {
  const { handleVoiceInput } = useCricket();
  const [isListening, setIsListening] = useState(false);
  const [lastTranscript, setLastTranscript] = useState('');
  const [hasSpeechSupport, setHasSpeechSupport] = useState(true);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    const win = window as unknown as IWindow;
    const SpeechRecClass = win.SpeechRecognition || win.webkitSpeechRecognition;

    if (!SpeechRecClass) {
      setHasSpeechSupport(false);
      return;
    }

    const recognition = new SpeechRecClass();
    recognition.continuous = true;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onresult = (event: any) => {
      const current = event.resultIndex;
      const transcript = event.results[current][0].transcript;
      setLastTranscript(transcript);
      handleVoiceInput(transcript);
    };

    recognition.onerror = (err: any) => {
      console.warn('Speech recognition error:', err);
      setIsListening(false);
    };

    recognition.onend = () => {
      if (isListening) {
        try {
          recognition.start();
        } catch {
          setIsListening(false);
        }
      }
    };

    recognitionRef.current = recognition;

    return () => {
      try {
        recognition.stop();
      } catch {}
    };
  }, [handleVoiceInput, isListening]);

  const toggleListening = () => {
    if (!recognitionRef.current) return;
    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch {
        setIsListening(false);
      }
    }
  };

  const sampleCommands = [
    { label: '"Add four runs"', cmd: 'add four runs' },
    { label: '"Wicket"', cmd: 'wicket' },
    { label: '"Wide"', cmd: 'wide' },
    { label: '"Dot ball"', cmd: 'dot ball' },
    { label: '"Camera two"', cmd: 'camera two' },
    { label: '"Open review"', cmd: 'open review' },
    { label: '"Undo last ball"', cmd: 'undo last ball' },
  ];

  return (
    <div className="flex flex-col rounded-xl bg-zinc-900 border border-zinc-800 p-4 sm:p-5 shadow-xl space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
        <div>
          <h3 className="text-sm font-bold uppercase tracking-wider text-orange-400 flex items-center gap-2">
            <Mic className="w-4 h-4" />
            VOICE COMMAND SCORING SYSTEM
          </h3>
          <p className="text-xs text-zinc-400 mt-0.5">
            Hands-free official scoring with confirmation safeguards
          </p>
        </div>

        {/* Microphone Toggle */}
        <button
          onClick={toggleListening}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all shadow ${
            isListening
              ? 'bg-red-600 text-white animate-pulse ring-2 ring-red-400'
              : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border border-zinc-700'
          }`}
        >
          {isListening ? (
            <>
              <Mic className="w-4 h-4" />
              <span>LISTENING NOW...</span>
            </>
          ) : (
            <>
              <MicOff className="w-4 h-4 text-zinc-400" />
              <span>START VOICE MIC</span>
            </>
          )}
        </button>
      </div>

      {/* Live transcript readout */}
      <div className="p-3.5 rounded-lg bg-zinc-950 border border-zinc-800 text-xs flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-zinc-500 font-semibold uppercase text-[10px]">Heard Input:</span>
          <span className="font-mono text-zinc-200">
            {lastTranscript ? `"${lastTranscript}"` : isListening ? 'Waiting for voice command...' : 'Microphone paused'}
          </span>
        </div>
        {isListening && (
          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
        )}
      </div>

      {/* Quick Test Voice Command Buttons (Simulate speech input) */}
      <div>
        <div className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
          <Command className="w-3.5 h-3.5 text-orange-400" />
          <span>Quick Simulator & Command Cheat-Sheet:</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {sampleCommands.map((item) => (
            <button
              key={item.cmd}
              onClick={() => {
                setLastTranscript(item.cmd);
                handleVoiceInput(item.cmd);
              }}
              className="p-2.5 rounded-lg bg-zinc-800/80 hover:bg-orange-600 hover:text-white text-zinc-300 text-left text-xs font-medium border border-zinc-700/80 transition-all flex items-center justify-between group"
            >
              <span>{item.label}</span>
              <Sparkles className="w-3 h-3 opacity-0 group-hover:opacity-100 text-white" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
