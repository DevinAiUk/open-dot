"use client";

import { useEffect, useState } from "react";
import { Check, Play, Square, Volume2, X, Sparkles, Sliders } from "lucide-react";
import {
  getAvailableVoices,
  getTTSPreferences,
  saveTTSPreferences,
  stopSpeech,
  toggleSpeak,
  type TTSPreferences,
} from "@/lib/tts";

type Props = {
  open: boolean;
  onClose: () => void;
};

export default function TTSModal({ open, onClose }: Props) {
  const [prefs, setPrefs] = useState<TTSPreferences>(getTTSPreferences());
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [testing, setTesting] = useState(false);

  useEffect(() => {
    if (!open) return;
    const loadVoices = () => {
      const v = getAvailableVoices();
      setVoices(v);
    };
    loadVoices();
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }
  }, [open]);

  if (!open) return null;

  const update = (patch: Partial<TTSPreferences>) => {
    const next = { ...prefs, ...patch };
    setPrefs(next);
    saveTTSPreferences(patch);
  };

  const handleTestSpeech = () => {
    if (testing) {
      stopSpeech();
      setTesting(false);
      return;
    }
    setTesting(true);
    toggleSpeak(
      "test_tts",
      "Hello! I am your WorkAi agent from worksAi.org, ready to research, plan, and automate tasks for you.",
      () => setTesting(false)
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className="relative w-full max-w-md rounded-2xl border border-black/10 bg-card p-6 shadow-2xl transition-all"
        role="dialog"
        aria-modal="true"
        aria-labelledby="tts-modal-title"
      >
        <div className="flex items-center justify-between pb-4 border-b border-black/[0.06]">
          <div className="flex items-center gap-2.5">
            <div className="flex size-8 items-center justify-center rounded-lg bg-brand/10 text-brand">
              <Volume2 className="size-4" strokeWidth={2} />
            </div>
            <div>
              <h2 id="tts-modal-title" className="text-[16px] font-semibold tracking-tight text-foreground">
                Text-to-Speech Settings
              </h2>
              <p className="text-[12px] text-foreground/50">Zero-latency native speech synthesis</p>
            </div>
          </div>
          <button
            onClick={() => {
              stopSpeech();
              onClose();
            }}
            className="flex size-7 items-center justify-center rounded-md text-foreground/40 hover:bg-black/[0.05] hover:text-foreground"
            aria-label="Close"
          >
            <X className="size-4" />
          </button>
        </div>

        <div className="mt-5 space-y-4">
          {/* Voice Selector */}
          <div>
            <label className="text-[12px] font-medium text-foreground/70 mb-1.5 block">
              Voice
            </label>
            <select
              className="field w-full text-[13px] bg-background"
              value={prefs.voiceURI ?? ""}
              onChange={(e) => update({ voiceURI: e.target.value || null })}
            >
              <option value="">Default System Voice (Natural / Siri)</option>
              {voices.map((v) => (
                <option key={v.voiceURI} value={v.voiceURI}>
                  {v.name} ({v.lang})
                </option>
              ))}
            </select>
          </div>

          {/* Speed / Rate Slider */}
          <div>
            <div className="flex items-center justify-between text-[12px] font-medium text-foreground/70 mb-1">
              <span>Speed: {prefs.rate}x</span>
              <span className="text-[11px] text-foreground/45">
                {prefs.rate < 1 ? "Slow" : prefs.rate === 1 ? "Normal" : "Fast"}
              </span>
            </div>
            <input
              type="range"
              min="0.5"
              max="2.0"
              step="0.05"
              value={prefs.rate}
              onChange={(e) => update({ rate: parseFloat(e.target.value) })}
              className="w-full accent-foreground"
            />
            <div className="flex justify-between text-[10px] text-foreground/40 font-mono mt-0.5">
              <span>0.5x</span>
              <span>1.0x</span>
              <span>1.5x</span>
              <span>2.0x</span>
            </div>
          </div>

          {/* Pitch Slider */}
          <div>
            <div className="flex items-center justify-between text-[12px] font-medium text-foreground/70 mb-1">
              <span>Pitch: {prefs.pitch}</span>
              <span className="text-[11px] text-foreground/45">
                {prefs.pitch < 1 ? "Deeper" : prefs.pitch === 1 ? "Natural" : "Higher"}
              </span>
            </div>
            <input
              type="range"
              min="0.6"
              max="1.4"
              step="0.05"
              value={prefs.pitch}
              onChange={(e) => update({ pitch: parseFloat(e.target.value) })}
              className="w-full accent-foreground"
            />
          </div>

          {/* Auto Read Toggle */}
          <div className="flex items-center justify-between pt-2">
            <div>
              <div className="text-[13px] font-medium text-foreground">Auto-read incoming replies</div>
              <div className="text-[11px] text-foreground/50">Automatically speaks when a work finishes replying</div>
            </div>
            <button
              type="button"
              onClick={() => update({ autoRead: !prefs.autoRead })}
              className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${prefs.autoRead ? "bg-foreground" : "bg-black/15"}`}
            >
              <span
                className={`pointer-events-none inline-block size-4 transform rounded-full bg-card shadow-sm ring-0 transition duration-200 ease-in-out ${prefs.autoRead ? "translate-x-4" : "translate-x-0"}`}
              />
            </button>
          </div>
        </div>

        {/* Footer with Test Button */}
        <div className="mt-6 flex items-center justify-between pt-4 border-t border-black/[0.06]">
          <button
            type="button"
            onClick={handleTestSpeech}
            className="flex items-center gap-1.5 rounded-lg border border-black/10 px-3 py-1.5 text-[12px] font-medium text-foreground/80 hover:bg-black/[0.04] transition-colors"
          >
            {testing ? (
              <>
                <Square className="size-3.5 fill-foreground text-foreground" />
                <span>Stop</span>
              </>
            ) : (
              <>
                <Play className="size-3.5 fill-foreground text-foreground" />
                <span>Test Voice</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={() => {
              stopSpeech();
              onClose();
            }}
            className="btn-primary h-8 px-4 text-[13px]"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}

