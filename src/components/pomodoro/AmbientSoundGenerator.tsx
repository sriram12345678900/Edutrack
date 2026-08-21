"use client";

import React, { useState, useEffect, useRef } from "react";
import { 
  CloudRain, Coffee, Radio, Wind, 
  Volume2, VolumeX, Sparkles, Sliders, Users, Share2, Copy, Check
} from "lucide-react";

type SoundType = "rain" | "cafe" | "binaural" | "brownNoise";

export default function AmbientSoundGenerator() {
  const [activeSound, setActiveSound] = useState<SoundType | null>(null);
  const [volume, setVolume] = useState<number>(0.4);
  const [roomCode, setRoomCode] = useState<string>("FOCUS-100");
  const [roomCopied, setRoomCopied] = useState<boolean>(false);
  const [activePeers, setActivePeers] = useState<number>(3);

  const audioCtxRef = useRef<AudioContext | null>(null);
  const nodeSourceRef = useRef<any>(null);
  const gainNodeRef = useRef<GainNode | null>(null);

  const stopCurrentSound = () => {
    if (nodeSourceRef.current) {
      try {
        nodeSourceRef.current.stop();
        nodeSourceRef.current.disconnect();
      } catch {}
      nodeSourceRef.current = null;
    }
  };

  const playRainSound = (ctx: AudioContext, gainNode: GainNode) => {
    // Generate pink/white noise buffer
    const bufferSize = ctx.sampleRate * 2;
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
    
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      b3 = 0.86650 * b3 + white * 0.3104856;
      b4 = 0.55000 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.0168980;
      output[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.11;
      b6 = white * 0.115926;
    }

    const whiteNoise = ctx.createBufferSource();
    whiteNoise.buffer = noiseBuffer;
    whiteNoise.loop = true;

    // Lowpass filter for gentle rain acoustics
    const filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.setValueAtTime(800, ctx.currentTime);

    whiteNoise.connect(filter);
    filter.connect(gainNode);
    whiteNoise.start();
    nodeSourceRef.current = whiteNoise;
  };

  const playBinauralBeta = (ctx: AudioContext, gainNode: GainNode) => {
    // Binaural Beat (200 Hz base + 14 Hz Beta wave for intense cognitive focus)
    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    osc1.type = "sine";
    osc2.type = "sine";
    osc1.frequency.setValueAtTime(200, ctx.currentTime);
    osc2.frequency.setValueAtTime(214, ctx.currentTime); // 14 Hz difference = Beta wave

    const merger = ctx.createChannelMerger(2);
    osc1.connect(merger, 0, 0); // Left channel
    osc2.connect(merger, 0, 1); // Right channel

    merger.connect(gainNode);
    osc1.start();
    osc2.start();

    nodeSourceRef.current = {
      stop: () => {
        osc1.stop();
        osc2.stop();
      },
      disconnect: () => {
        osc1.disconnect();
        osc2.disconnect();
        merger.disconnect();
      }
    };
  };

  const playBrownNoise = (ctx: AudioContext, gainNode: GainNode) => {
    const bufferSize = ctx.sampleRate * 2;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    let lastOut = 0.0;

    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      data[i] = (lastOut + 0.02 * white) / 1.02;
      lastOut = data[i];
      data[i] *= 3.5;
    }

    const brownSource = ctx.createBufferSource();
    brownSource.buffer = buffer;
    brownSource.loop = true;

    const filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.setValueAtTime(400, ctx.currentTime);

    brownSource.connect(filter);
    filter.connect(gainNode);
    brownSource.start();
    nodeSourceRef.current = brownSource;
  };

  const handleToggleSound = (type: SoundType) => {
    if (activeSound === type) {
      stopCurrentSound();
      setActiveSound(null);
      return;
    }

    stopCurrentSound();

    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!audioCtxRef.current) {
        audioCtxRef.current = new AudioCtx();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === "suspended") {
        ctx.resume();
      }

      if (!gainNodeRef.current) {
        const gain = ctx.createGain();
        gain.gain.setValueAtTime(volume, ctx.currentTime);
        gain.connect(ctx.destination);
        gainNodeRef.current = gain;
      }

      const gainNode = gainNodeRef.current;
      gainNode.gain.setValueAtTime(volume, ctx.currentTime);

      if (type === "rain") playRainSound(ctx, gainNode);
      else if (type === "binaural") playBinauralBeta(ctx, gainNode);
      else if (type === "brownNoise" || type === "cafe") playBrownNoise(ctx, gainNode);

      setActiveSound(type);
    } catch (e) {
      console.error("Audio synth error:", e);
    }
  };

  const handleVolumeChange = (newVol: number) => {
    setVolume(newVol);
    if (gainNodeRef.current && audioCtxRef.current) {
      gainNodeRef.current.gain.setValueAtTime(newVol, audioCtxRef.current.currentTime);
    }
  };

  useEffect(() => {
    return () => {
      stopCurrentSound();
      if (audioCtxRef.current) {
        audioCtxRef.current.close();
      }
    };
  }, []);

  const handleCopyRoom = () => {
    navigator.clipboard.writeText(roomCode);
    setRoomCopied(true);
    setTimeout(() => setRoomCopied(false), 2000);
  };

  return (
    <div className="grid md:grid-cols-2 gap-6 p-6 rounded-3xl bg-white/5 border border-white/10 shadow-xl backdrop-blur-md">
      {/* Left: Ambient Sound Synthesizer */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-indigo-400">
            <Radio className="w-4 h-4" />
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-300">
              Ambient Focus Synth
            </h3>
          </div>
          {activeSound && (
            <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20 flex items-center gap-1">
              <Sparkles className="w-3 h-3" /> Playing
            </span>
          )}
        </div>

        {/* Sound Selection Grid */}
        <div className="grid grid-cols-2 gap-2.5">
          <button
            onClick={() => handleToggleSound("rain")}
            className={`p-3 rounded-2xl border text-left transition-all flex items-center gap-2.5 ${
              activeSound === "rain"
                ? "bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-600/30 font-bold"
                : "bg-white/5 border-white/10 text-slate-300 hover:bg-white/10"
            }`}
          >
            <CloudRain className="w-4 h-4 text-cyan-400" />
            <div>
              <div className="text-xs font-bold">Gentle Rain</div>
              <div className="text-[9px] text-slate-400">Filtered pink noise</div>
            </div>
          </button>

          <button
            onClick={() => handleToggleSound("binaural")}
            className={`p-3 rounded-2xl border text-left transition-all flex items-center gap-2.5 ${
              activeSound === "binaural"
                ? "bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-600/30 font-bold"
                : "bg-white/5 border-white/10 text-slate-300 hover:bg-white/10"
            }`}
          >
            <Radio className="w-4 h-4 text-purple-400" />
            <div>
              <div className="text-xs font-bold">14Hz Beta Waves</div>
              <div className="text-[9px] text-slate-400">Binaural focus pulse</div>
            </div>
          </button>

          <button
            onClick={() => handleToggleSound("brownNoise")}
            className={`p-3 rounded-2xl border text-left transition-all flex items-center gap-2.5 ${
              activeSound === "brownNoise"
                ? "bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-600/30 font-bold"
                : "bg-white/5 border-white/10 text-slate-300 hover:bg-white/10"
            }`}
          >
            <Wind className="w-4 h-4 text-amber-400" />
            <div>
              <div className="text-xs font-bold">Deep Brown Noise</div>
              <div className="text-[9px] text-slate-400">Blocks distractions</div>
            </div>
          </button>

          <button
            onClick={() => handleToggleSound("cafe")}
            className={`p-3 rounded-2xl border text-left transition-all flex items-center gap-2.5 ${
              activeSound === "cafe"
                ? "bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-600/30 font-bold"
                : "bg-white/5 border-white/10 text-slate-300 hover:bg-white/10"
            }`}
          >
            <Coffee className="w-4 h-4 text-orange-400" />
            <div>
              <div className="text-xs font-bold">Cafe Acoustics</div>
              <div className="text-[9px] text-slate-400">Warm study vibe</div>
            </div>
          </button>
        </div>

        {/* Volume Slider */}
        <div className="flex items-center gap-3 pt-1">
          <Volume2 className="w-4 h-4 text-slate-400" />
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={volume}
            onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
            className="w-full accent-indigo-500"
          />
          <span className="text-xs font-mono text-slate-400 w-8">{Math.round(volume * 100)}%</span>
        </div>
      </div>

      {/* Right: Synchronized Study Room */}
      <div className="space-y-4 border-t md:border-t-0 md:border-l border-white/10 md:pl-6 pt-4 md:pt-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-indigo-400">
            <Users className="w-4 h-4" />
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-300">
              Co-Working Study Room
            </h3>
          </div>
          <span className="text-[10px] font-bold text-slate-400">
            {activePeers} Buddies Online
          </span>
        </div>

        <p className="text-xs text-slate-400 leading-relaxed">
          Share this room code with friends to study synchronously with matching work & break intervals.
        </p>

        {/* Room Code Box */}
        <div className="flex items-center gap-2 p-3 rounded-2xl bg-white/5 border border-white/10">
          <div className="flex-1 font-mono font-black text-sm text-indigo-300 tracking-wider">
            {roomCode}
          </div>
          <button
            onClick={handleCopyRoom}
            className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-md"
          >
            {roomCopied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            {roomCopied ? "Copied!" : "Share Room"}
          </button>
        </div>

        {/* Peer Avatars */}
        <div className="flex items-center gap-2 pt-1">
          <div className="flex -space-x-2 overflow-hidden">
            <span className="inline-block h-8 w-8 rounded-full ring-2 ring-slate-900 bg-indigo-500/20 text-center leading-7 text-xs font-bold text-indigo-300">⚡</span>
            <span className="inline-block h-8 w-8 rounded-full ring-2 ring-slate-900 bg-purple-500/20 text-center leading-7 text-xs font-bold text-purple-300">🌟</span>
            <span className="inline-block h-8 w-8 rounded-full ring-2 ring-slate-900 bg-emerald-500/20 text-center leading-7 text-xs font-bold text-emerald-300">🎓</span>
          </div>
          <span className="text-xs text-slate-400 font-medium">
            Studying: <strong className="text-white">Class 10 Science</strong>
          </span>
        </div>
      </div>
    </div>
  );
}
