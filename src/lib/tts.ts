// WorkAi Text-to-Speech (TTS) Engine
// Zero-dependency, zero-download footprint using native hardware-accelerated Web Speech API.

export type TTSPreferences = {
  enabled: boolean;
  autoRead: boolean;
  voiceURI: string | null;
  rate: number; // 0.5 to 2.0 (default 1.0)
  pitch: number; // 0.5 to 1.5 (default 1.0)
  volume: number; // 0.0 to 1.0 (default 1.0)
};

const STORAGE_KEY = "workai_tts_prefs";

const DEFAULT_PREFS: TTSPreferences = {
  enabled: true,
  autoRead: false,
  voiceURI: null,
  rate: 1.0,
  pitch: 1.0,
  volume: 1.0,
};

let currentUtterance: SpeechSynthesisUtterance | null = null;
let activeSpeakingId: string | null = null;
const listeners = new Set<(speakingId: string | null) => void>();

export function getTTSPreferences(): TTSPreferences {
  if (typeof window === "undefined") return DEFAULT_PREFS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_PREFS;
    return { ...DEFAULT_PREFS, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_PREFS;
  }
}

export function saveTTSPreferences(prefs: Partial<TTSPreferences>) {
  if (typeof window === "undefined") return;
  try {
    const next = { ...getTTSPreferences(), ...prefs };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {}
}

export function subscribeSpeaking(listener: (id: string | null) => void): () => void {
  listeners.add(listener);
  listener(activeSpeakingId);
  return () => listeners.delete(listener);
}

function notifySpeaking(id: string | null) {
  activeSpeakingId = id;
  for (const l of listeners) l(id);
}

export function getAvailableVoices(): SpeechSynthesisVoice[] {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return [];
  const voices = window.speechSynthesis.getVoices();
  // Filter or sort natural/english voices first
  return voices.sort((a, b) => {
    if (a.lang.startsWith("en") && !b.lang.startsWith("en")) return -1;
    if (!a.lang.startsWith("en") && b.lang.startsWith("en")) return 1;
    return a.name.localeCompare(b.name);
  });
}

/** Clean markdown syntax for smooth spoken audio */
export function cleanForSpeech(markdown: string): string {
  return markdown
    .replace(/```[\s\S]*?```/g, "Code block omitted.") // skip long code blocks
    .replace(/`([^`]+)`/g, "$1") // inline code
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1") // markdown links -> link text
    .replace(/[#*_~>|[\]]/g, "") // markdown characters
    .replace(/<think>[\s\S]*?<\/think>/gi, "") // skip thinking
    .replace(/\s+/g, " ")
    .trim();
}

/** Speak a message by text. If already speaking this message, stops it. */
export function toggleSpeak(id: string, text: string, onEnd?: () => void) {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;

  if (activeSpeakingId === id) {
    stopSpeech();
    return;
  }

  stopSpeech();

  const clean = cleanForSpeech(text);
  if (!clean) return;

  const prefs = getTTSPreferences();
  const utterance = new SpeechSynthesisUtterance(clean);
  utterance.rate = prefs.rate;
  utterance.pitch = prefs.pitch;
  utterance.volume = prefs.volume;

  const voices = getAvailableVoices();
  if (prefs.voiceURI) {
    const found = voices.find((v) => v.voiceURI === prefs.voiceURI);
    if (found) utterance.voice = found;
  } else {
    // Default to natural/en-US voice if available
    const preferred = voices.find((v) => v.lang.startsWith("en") && (v.name.includes("Natural") || v.name.includes("Siri") || v.name.includes("Samantha") || v.default));
    if (preferred) utterance.voice = preferred;
  }

  utterance.onstart = () => {
    currentUtterance = utterance;
    notifySpeaking(id);
  };

  utterance.onend = () => {
    currentUtterance = null;
    notifySpeaking(null);
    onEnd?.();
  };

  utterance.onerror = () => {
    currentUtterance = null;
    notifySpeaking(null);
  };

  window.speechSynthesis.speak(utterance);
}

export function stopSpeech() {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
  window.speechSynthesis.cancel();
  currentUtterance = null;
  notifySpeaking(null);
}

export function isSpeaking(): boolean {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return false;
  return window.speechSynthesis.speaking;
}

