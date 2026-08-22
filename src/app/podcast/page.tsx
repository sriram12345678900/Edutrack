"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Headphones, Play, Pause, RotateCcw, FastForward, Rewind, Volume2, 
  Sparkles, Download, FileText, Share2, Flame, BookOpen, Clock, Music, 
  Radio, Check, RefreshCw
} from "lucide-react";
import { awardXp } from "@/lib/xp";
import { cn } from "@/lib/utils";

interface PodcastDialogue {
  speaker: "Alex" | "Maya";
  role: "Inquisitive Host" | "Expert Explainer";
  avatar: string;
  voiceGender: "male" | "female";
  text: string;
  durationEst: number; // in seconds
}

interface PodcastEpisode {
  id: string;
  title: string;
  subject: string;
  duration: string;
  summary: string;
  dialogues: PodcastDialogue[];
}

const PRESET_PODCASTS: PodcastEpisode[] = [
  {
    id: "pod-1",
    title: "The Magic of Electromagnetic Induction & Faraday's Law",
    subject: "Physics (Class 10)",
    duration: "4 min",
    summary: "Alex and Maya break down how moving magnets generate electricity, Lenz's law, and how power plants light up our world.",
    dialogues: [
      {
        speaker: "Alex",
        role: "Inquisitive Host",
        avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=AlexPodcast",
        voiceGender: "male",
        text: "Welcome back to EduCast! Today we are diving into one of the wildest discoveries in physics: Electromagnetic Induction. Maya, is it true that just wiggling a magnet can generate electric current without any battery attached?",
        durationEst: 10
      },
      {
        speaker: "Maya",
        role: "Expert Explainer",
        avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=MayaPodcast",
        voiceGender: "female",
        text: "Absolutely, Alex! Back in 1831, Michael Faraday discovered that when the magnetic flux linked with a closed coil changes over time, an electromotive force is induced in the circuit.",
        durationEst: 11
      },
      {
        speaker: "Alex",
        role: "Inquisitive Host",
        avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=AlexPodcast",
        voiceGender: "male",
        text: "Wait, so if the magnet is just sitting stationary inside the coil, nothing happens at all?",
        durationEst: 6
      },
      {
        speaker: "Maya",
        role: "Expert Explainer",
        avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=MayaPodcast",
        voiceGender: "female",
        text: "Exactly zero current! The magic only happens during relative motion. It's the rate of change of magnetic flux that induces the voltage. This is the exact principle running every hydroelectric and wind turbine generator on Earth!",
        durationEst: 14
      },
      {
        speaker: "Alex",
        role: "Inquisitive Host",
        avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=AlexPodcast",
        voiceGender: "male",
        text: "And what about Lenz's Law? Why do physics teachers always say induced current is like a stubborn teenager that opposes whatever caused it?",
        durationEst: 9
      },
      {
        speaker: "Maya",
        role: "Expert Explainer",
        avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=MayaPodcast",
        voiceGender: "female",
        text: "Haha, spot on! Lenz's law states that the induced current always flows in a direction that produces a magnetic field opposing the change in flux that created it. It's essentially the conservation of energy in action!",
        durationEst: 13
      }
    ]
  },
  {
    id: "pod-2",
    title: "Carbon & Its Allotropes: Diamonds, Graphite & Buckyballs",
    subject: "Chemistry (Class 10)",
    duration: "3.5 min",
    summary: "Why can the exact same element be both the hardest gemstone on Earth and the slippery black lead inside your pencil?",
    dialogues: [
      {
        speaker: "Alex",
        role: "Inquisitive Host",
        avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=AlexPodcast",
        voiceGender: "male",
        text: "Hey everyone! Today's mind-bender: Diamond and pencil graphite are made of 100 percent identical carbon atoms. Maya, why doesn't my pencil sparkle like a diamond ring?",
        durationEst: 11
      },
      {
        speaker: "Maya",
        role: "Expert Explainer",
        avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=MayaPodcast",
        voiceGender: "female",
        text: "It all comes down to bonding geometry, Alex! In a diamond, each carbon atom is tetrahedrally bonded to four other carbons in a rigid 3D framework, making it the hardest natural substance.",
        durationEst: 12
      },
      {
        speaker: "Alex",
        role: "Inquisitive Host",
        avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=AlexPodcast",
        voiceGender: "male",
        text: "And in graphite?",
        durationEst: 3
      },
      {
        speaker: "Maya",
        role: "Expert Explainer",
        avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=MayaPodcast",
        voiceGender: "female",
        text: "In graphite, each carbon bonds with only three others in flat hexagonal layers. The fourth electron is delocalized and free to move, which is why graphite conducts electricity and layers easily slide off onto paper!",
        durationEst: 14
      }
    ]
  }
];

export default function PodcastPage() {
  const [selectedPodcast, setSelectedPodcast] = useState<PodcastEpisode>(PRESET_PODCASTS[0]);
  const [currentLineIndex, setCurrentLineIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1.0);
  const [customTopic, setCustomTopic] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  const transcriptScrollRef = useRef<HTMLDivElement>(null);
  const lineTimeoutRef = useRef<any>(null);

  // Sync scroll with active dialogue line
  useEffect(() => {
    if (transcriptScrollRef.current) {
      const activeElement = transcriptScrollRef.current.children[currentLineIndex] as HTMLElement;
      if (activeElement) {
        activeElement.scrollIntoView({ behavior: "smooth", block: "nearest" });
      }
    }
  }, [currentLineIndex]);

  // Handle Web Speech Playback
  useEffect(() => {
    if (isPlaying) {
      playLine(currentLineIndex);
    } else {
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
      if (lineTimeoutRef.current) clearTimeout(lineTimeoutRef.current);
    }

    return () => {
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
      if (lineTimeoutRef.current) clearTimeout(lineTimeoutRef.current);
    };
  }, [isPlaying, currentLineIndex, playbackSpeed]);

  const playLine = (index: number) => {
    if (index >= selectedPodcast.dialogues.length) {
      setIsPlaying(false);
      awardXp(60, "Listened to AI Study Podcast");
      return;
    }

    const currentDialogue = selectedPodcast.dialogues[index];
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(currentDialogue.text);
      utterance.rate = playbackSpeed;
      utterance.pitch = currentDialogue.speaker === "Maya" ? 1.15 : 0.95;

      const voices = window.speechSynthesis.getVoices();
      if (voices.length > 0) {
        if (currentDialogue.voiceGender === "female") {
          const fVoice = voices.find(v => v.name.includes("Female") || v.name.includes("Zira") || v.name.includes("Samantha") || v.lang.includes("en-US"));
          if (fVoice) utterance.voice = fVoice;
        } else {
          const mVoice = voices.find(v => v.name.includes("Male") || v.name.includes("David") || v.name.includes("George") || v.lang.includes("en-GB"));
          if (mVoice) utterance.voice = mVoice;
        }
      }

      utterance.onend = () => {
        if (index + 1 < selectedPodcast.dialogues.length) {
          setCurrentLineIndex(index + 1);
        } else {
          setIsPlaying(false);
          awardXp(60, "Listened to AI Study Podcast");
        }
      };

      utterance.onerror = () => {
        setIsPlaying(false);
      };

      window.speechSynthesis.speak(utterance);
    } else {
      // Fallback timer simulation if SpeechSynthesis is unavailable
      const durationMs = (currentDialogue.durationEst * 1000) / playbackSpeed;
      lineTimeoutRef.current = setTimeout(() => {
        if (index + 1 < selectedPodcast.dialogues.length) {
          setCurrentLineIndex(index + 1);
        } else {
          setIsPlaying(false);
        }
      }, durationMs);
    }
  };

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  const handleSkipNext = () => {
    if (currentLineIndex + 1 < selectedPodcast.dialogues.length) {
      setCurrentLineIndex(currentLineIndex + 1);
    }
  };

  const handleSkipPrev = () => {
    if (currentLineIndex > 0) {
      setCurrentLineIndex(currentLineIndex - 1);
    }
  };

  const handleReset = () => {
    setIsPlaying(false);
    setCurrentLineIndex(0);
  };

  const handleGenerateCustom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customTopic.trim()) return;

    setIsGenerating(true);
    setTimeout(() => {
      const newEp: PodcastEpisode = {
        id: `pod-custom-${Date.now()}`,
        title: `${customTopic} Deep Dive`,
        subject: "Custom Topic",
        duration: "3 min",
        summary: `Alex and Maya explore key concepts, real-life applications, and exam strategies for ${customTopic}.`,
        dialogues: [
          {
            speaker: "Alex",
            role: "Inquisitive Host",
            avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=AlexCustom",
            voiceGender: "male",
            text: `Welcome to this special deep dive on ${customTopic}! Maya, why is this topic so crucial for students to master?`,
            durationEst: 8
          },
          {
            speaker: "Maya",
            role: "Expert Explainer",
            avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=MayaCustom",
            voiceGender: "female",
            text: `Great question, Alex! ${customTopic} connects core theoretical principles to practical applications in science and technology. Once you grasp the intuition, the formulas and derivations become second nature.`,
            durationEst: 12
          },
          {
            speaker: "Alex",
            role: "Inquisitive Host",
            avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=AlexCustom",
            voiceGender: "male",
            text: `What's the one golden takeaway or common mistake students make during board exams on this?`,
            durationEst: 7
          },
          {
            speaker: "Maya",
            role: "Expert Explainer",
            avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=MayaCustom",
            voiceGender: "female",
            text: `Students often memorize definitions without picturing the mechanism! Always draw a quick schematic or mental model when solving problems on ${customTopic}.`,
            durationEst: 11
          }
        ]
      };

      setSelectedPodcast(newEp);
      setCurrentLineIndex(0);
      setIsGenerating(false);
      setCustomTopic("");
      awardXp(40, "Generated AI Study Podcast");
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 md:p-8 font-sans">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Banner */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-pink-900/40 via-purple-900/40 to-slate-900/60 border border-pink-500/20 p-6 md:p-8 backdrop-blur-xl shadow-2xl">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-pink-500/10 border border-pink-500/30 text-pink-400 text-xs font-black uppercase tracking-wider">
                <Radio className="w-3.5 h-3.5 animate-pulse" />
                2-Host Conversational AI Podcast
              </div>
              <h1 className="text-3xl md:text-4xl font-black tracking-tight text-white">
                AI Audio <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-purple-300">Podcast Generator</span>
              </h1>
              <p className="text-slate-300 text-xs md:text-sm max-w-xl">
                Convert any chapter, formula sheet, or revision topic into a lively 2-host audio discussion (NotebookLM style) for hands-free learning on the go!
              </p>
            </div>

            <div className="p-3 bg-slate-900/80 rounded-2xl border border-slate-800 text-center">
              <span className="text-[10px] text-slate-400 font-bold block">LISTEN REWARD</span>
              <span className="text-sm font-black text-amber-400 flex items-center gap-1 justify-center">
                <Flame className="w-4 h-4" /> +60 XP
              </span>
            </div>
          </div>
        </div>

        {/* Generate Custom Bar */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 shadow-lg">
          <form onSubmit={handleGenerateCustom} className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              value={customTopic}
              onChange={e => setCustomTopic(e.target.value)}
              placeholder="Enter any topic or chapter (e.g. 'Human Eye & Colourful World', 'Trigonometry Ratios')..."
              className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs md:text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-pink-500"
            />
            <button
              type="submit"
              disabled={isGenerating || !customTopic.trim()}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white font-black text-xs flex items-center justify-center gap-2 disabled:opacity-50 transition-all shadow-md shadow-pink-600/25"
            >
              <Sparkles className="w-4 h-4" />
              {isGenerating ? "Generating Dialogue..." : "Generate AI Podcast"}
            </button>
          </form>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left: Episodes List */}
          <div className="space-y-3">
            <h3 className="text-sm font-black text-white flex items-center gap-2 px-1">
              <Headphones className="w-4 h-4 text-pink-400" />
              Featured Podcast Episodes
            </h3>

            {PRESET_PODCASTS.map(pod => {
              const isSelected = selectedPodcast.id === pod.id;
              return (
                <div
                  key={pod.id}
                  onClick={() => {
                    handleReset();
                    setSelectedPodcast(pod);
                  }}
                  className={cn(
                    "p-4 rounded-2xl border cursor-pointer transition-all space-y-2",
                    isSelected
                      ? "bg-pink-950/30 border-pink-500 shadow-md shadow-pink-950/40"
                      : "bg-slate-900/60 border-slate-800 hover:border-slate-700"
                  )}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-pink-400">{pod.subject}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 font-bold flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {pod.duration}
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-white">{pod.title}</h4>
                  <p className="text-[11px] text-slate-400 line-clamp-2">{pod.summary}</p>
                </div>
              );
            })}
          </div>

          {/* Center & Right: Audio Player & Synced Live Transcript */}
          <div className="lg:col-span-2 space-y-4">
            
            {/* Player Card */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-5 shadow-xl">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-pink-400">{selectedPodcast.subject}</span>
                  <h2 className="text-lg font-black text-white">{selectedPodcast.title}</h2>
                </div>

                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1 bg-slate-950 border border-slate-800 rounded-xl p-1 text-xs">
                    {[0.8, 1.0, 1.25, 1.5].map(speed => (
                      <button
                        key={speed}
                        onClick={() => setPlaybackSpeed(speed)}
                        className={cn(
                          "px-2 py-1 rounded-lg font-bold transition-all",
                          playbackSpeed === speed
                            ? "bg-pink-600 text-white"
                            : "text-slate-400 hover:text-white"
                        )}
                      >
                        {speed}x
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Waveform / Visualizer */}
              <div className="h-16 bg-slate-950 rounded-2xl border border-slate-800 flex items-center justify-center gap-1.5 px-4 overflow-hidden">
                {Array.from({ length: 36 }).map((_, i) => {
                  const barHeight = isPlaying 
                    ? Math.sin(i * 0.4 + currentLineIndex) * 24 + 28
                    : 12;
                  return (
                    <div
                      key={i}
                      className={cn(
                        "w-1.5 rounded-full transition-all duration-150",
                        isPlaying ? "bg-gradient-to-t from-pink-600 to-purple-400" : "bg-slate-800"
                      )}
                      style={{ height: `${barHeight}px` }}
                    />
                  );
                })}
              </div>

              {/* Progress Slider & Playback Controls */}
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs text-slate-400 font-bold">
                  <span>Dialogue {currentLineIndex + 1} of {selectedPodcast.dialogues.length}</span>
                  <span>{Math.round(((currentLineIndex + 1) / selectedPodcast.dialogues.length) * 100)}%</span>
                </div>

                <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                  <div
                    className="h-full bg-gradient-to-r from-pink-500 to-purple-500 transition-all duration-300"
                    style={{ width: `${((currentLineIndex + 1) / selectedPodcast.dialogues.length) * 100}%` }}
                  />
                </div>

                <div className="flex items-center justify-center gap-4 pt-2">
                  <button
                    onClick={handleSkipPrev}
                    disabled={currentLineIndex === 0}
                    className="p-3 rounded-2xl bg-slate-800 hover:bg-slate-700 disabled:opacity-30 text-white transition-all"
                    title="Previous Dialogue"
                  >
                    <Rewind className="w-5 h-5" />
                  </button>

                  <button
                    onClick={togglePlay}
                    className="w-14 h-14 rounded-3xl bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white flex items-center justify-center shadow-lg shadow-pink-600/30 transition-all hover:scale-105 active:scale-95"
                  >
                    {isPlaying ? <Pause className="w-6 h-6 fill-white" /> : <Play className="w-6 h-6 fill-white ml-0.5" />}
                  </button>

                  <button
                    onClick={handleSkipNext}
                    disabled={currentLineIndex === selectedPodcast.dialogues.length - 1}
                    className="p-3 rounded-2xl bg-slate-800 hover:bg-slate-700 disabled:opacity-30 text-white transition-all"
                    title="Next Dialogue"
                  >
                    <FastForward className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Synchronized Transcript View */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-3 shadow-xl">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-pink-400" />
                Live Synchronized Transcript
              </h3>

              <div 
                ref={transcriptScrollRef}
                className="max-h-[260px] overflow-y-auto space-y-3 pr-2"
              >
                {selectedPodcast.dialogues.map((dlg, idx) => {
                  const isCurrent = currentLineIndex === idx;
                  return (
                    <div
                      key={idx}
                      onClick={() => {
                        setCurrentLineIndex(idx);
                        if (!isPlaying) setIsPlaying(true);
                      }}
                      className={cn(
                        "p-4 rounded-2xl border transition-all cursor-pointer space-y-1.5",
                        isCurrent
                          ? "bg-pink-950/30 border-pink-500/60 shadow-md shadow-pink-950/40 scale-[1.01]"
                          : "bg-slate-950/60 border-slate-800/80 hover:border-slate-700 opacity-70"
                      )}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <img src={dlg.avatar} alt={dlg.speaker} className="w-6 h-6 rounded-full bg-slate-800" />
                          <span className={cn(
                            "text-xs font-black",
                            dlg.speaker === "Maya" ? "text-purple-400" : "text-pink-400"
                          )}>
                            {dlg.speaker} ({dlg.role})
                          </span>
                        </div>

                        {isCurrent && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-pink-500/20 text-pink-300 font-bold flex items-center gap-1 animate-pulse">
                            <Radio className="w-3 h-3" /> Speaking
                          </span>
                        )}
                      </div>

                      <p className={cn(
                        "text-xs md:text-sm leading-relaxed",
                        isCurrent ? "text-white font-medium" : "text-slate-400"
                      )}>
                        {dlg.text}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
