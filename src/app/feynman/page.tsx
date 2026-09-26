"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Brain, Sparkles, Send, HelpCircle, Award, RotateCcw, Lightbulb, 
  CheckCircle2, AlertTriangle, MessageSquare, ArrowRight, Trophy, Flame, User, Bot
} from "lucide-react";
import { awardXp } from "@/lib/xp";
import { cn } from "@/lib/utils";
import { SUPPORTED_LANGUAGES } from "@/lib/languages";

interface ConceptTopic {
  id: string;
  title: string;
  subject: string;
  summary: string;
  starterPrompt: string;
  jargonKeywords: string[];
  idealAnalogy: string;
}

const PRESET_TOPICS: ConceptTopic[] = [
  {
    id: "newton-3",
    title: "Newton's 3rd Law of Motion",
    subject: "Physics",
    summary: "Every action has an equal and opposite reaction.",
    starterPrompt: "Hi! I'm Leo. I heard in science class that when you push a wall, the wall pushes you back with the exact same strength! But why doesn't the wall move, and how does a rocket take off in empty space?",
    jargonKeywords: ["equilibrium", "orthogonal", "vector sum", "inertial frame", "momentum conservation"],
    idealAnalogy: "Like jumping off a skateboard: you push backward with your feet, and the board shoots backward while you leap forward!"
  },
  {
    id: "photosynthesis",
    title: "Photosynthesis & Solar Energy",
    subject: "Biology",
    summary: "How plants transform light energy, water, and CO2 into glucose.",
    starterPrompt: "Hey! Can you explain to me how a tree eats sunlight? My teacher said leaves are like solar panels, but how do they turn thin air into wood and sweet apples?",
    jargonKeywords: ["chloroplast", "thylakoid membrane", "photolysis", "NADPH", "Calvin cycle", "stomata"],
    idealAnalogy: "Like baking a cake in a solar kitchen: the recipe mixes water from roots and air from leaves, using sunlight as the oven heat to bake sweet sugar."
  },
  {
    id: "ohms-law",
    title: "Ohm's Law & Electric Current",
    subject: "Physics",
    summary: "Relationship between Voltage, Current, and Resistance (V = IR).",
    starterPrompt: "Hi! What actually is electricity? What's the difference between Volts and Amps, and why do thin wires get hot?",
    jargonKeywords: ["drift velocity", "potential difference", "resistivity", "electron flux", "Coulombs"],
    idealAnalogy: "Imagine water flowing through a garden pipe: Voltage is the water pressure pump, Current is how much water flows per second, and Resistance is how narrow the pipe is."
  },
  {
    id: "chemical-reaction",
    title: "Chemical Reactions & Conservation of Mass",
    subject: "Chemistry",
    summary: "How atoms rearrange without being created or destroyed.",
    starterPrompt: "When a piece of wood burns down to a tiny pile of ash, where did all that heavy wood go? Did the matter vanish into nothingness?",
    jargonKeywords: ["stoichiometry", "exothermic enthalpy", "activation energy", "molecular orbitals"],
    idealAnalogy: "Think of Lego bricks: you build a big spaceship, take it apart, and build tiny houses. You didn't lose any bricks—some just floated away as invisible smoke gas!"
  }
];

interface Message {
  sender: "student" | "ai";
  text: string;
  jargonFound?: string[];
  feedback?: string;
}

export default function FeynmanPage() {
  const [selectedTopic, setSelectedTopic] = useState<ConceptTopic>(PRESET_TOPICS[0]);
  const [feynmanLanguage, setFeynmanLanguage] = useState<string>("English");
  const [customTopic, setCustomTopic] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [simplicityScore, setSimplicityScore] = useState(70);
  const [jargonCount, setJargonCount] = useState(0);
  const [teachingRounds, setTeachingRounds] = useState(0);
  const [isMasteryReached, setIsMasteryReached] = useState(false);

  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const saved = localStorage.getItem("edutrack_language");
    if (saved) setFeynmanLanguage(saved);
  }, []);

  useEffect(() => {
    // Start session
    startSession(selectedTopic);
  }, [selectedTopic]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const startSession = (topic: ConceptTopic) => {
    setMessages([
      {
        sender: "ai",
        text: topic.starterPrompt
      }
    ]);
    setInputMessage("");
    setSimplicityScore(75);
    setJargonCount(0);
    setTeachingRounds(0);
    setIsMasteryReached(false);
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || isTyping) return;

    const userText = inputMessage.trim();
    setInputMessage("");

    // Detect jargon in user text
    const lower = userText.toLowerCase();
    const foundJargon = selectedTopic.jargonKeywords.filter(j => lower.includes(j.toLowerCase()));
    
    // Calculate simplicity impact
    let delta = 0;
    if (foundJargon.length > 0) {
      delta -= foundJargon.length * 10;
      setJargonCount(prev => prev + foundJargon.length);
    } else {
      delta += 8;
    }

    // Reward for simple analogies or relatable words
    if (lower.includes("like") || lower.includes("imagine") || lower.includes("think of") || lower.includes("for example") || lower.includes("jaise")) {
      delta += 12;
    }

    const nextScore = Math.min(100, Math.max(20, simplicityScore + delta));
    setSimplicityScore(nextScore);

    const userMsg: Message = {
      sender: "student",
      text: userText,
      jargonFound: foundJargon
    };

    setMessages(prev => [...prev, userMsg]);
    setIsTyping(true);
    const newRound = teachingRounds + 1;
    setTeachingRounds(newRound);

    // Call live AI endpoint
    try {
      const history = messages.slice(-4).map(m => ({
        role: m.sender === "student" ? "user" : "assistant",
        content: m.text
      }));

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [
            ...history,
            {
              role: "user",
              content: `[ROLEPLAY PROMPT: You are Leo, an inquisitive 10-year-old Indian student learning "${selectedTopic.title}" (${selectedTopic.subject}). The student is explaining it to you.
Student said: "${userText}".
${foundJargon.length > 0 ? `The student used textbook jargon: [${foundJargon.join(", ")}]. Call them out playfully and ask them to explain that big word using a fun everyday Indian analogy (cricket, chai, cycle, kite).` : `If this was clear and simple, celebrate and ask one fun curiosity question. If round is 3+, declare that you totally understood and love science!`}
Keep your response short (2-3 sentences max), friendly, and strictly in ${feynmanLanguage}!]`
            }
          ],
          language: feynmanLanguage,
          bookInfo: `${selectedTopic.subject}: ${selectedTopic.title}`
        })
      });

      const data = await res.json();
      if (data && data.reply) {
        setMessages(prev => [...prev, { sender: "ai", text: data.reply }]);
        if (newRound >= 3) {
          setIsMasteryReached(true);
          awardXp(100, "Feynman Mastery Achieved");
        }
        setIsTyping(false);
        return;
      }
    } catch (err) {
      console.warn("Feynman AI call fallback", err);
    }

    // Fallback if network/server is unavailable
    let aiReply = "";
    if (foundJargon.length > 0) {
      aiReply = `Wait, you said "${foundJargon[0]}"! What does that big word actually mean? Can you explain it to me using an everyday example I can touch or see at home?`;
    } else if (newRound >= 3) {
      aiReply = `Whoa, that makes so much sense now! Because of your explanation, I can totally visualize it. You explained "${selectedTopic.title}" so simply that even a 10-year-old like me gets it!`;
      setIsMasteryReached(true);
      awardXp(100, "Feynman Mastery Achieved");
    } else if (newRound === 1) {
      aiReply = `Ah, I see! But what happens if you increase the amount or change the surroundings? Can you give me a fun real-world example?`;
    } else {
      aiReply = `That's super interesting! So does this always happen every single time, or are there special cases where it breaks?`;
    }

    setMessages(prev => [...prev, { sender: "ai", text: aiReply }]);
    setIsTyping(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 p-4 md:p-8 font-sans">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-indigo-500/10 dark:from-emerald-900/40 dark:via-teal-900/40 dark:to-slate-900/60 border border-emerald-500/20 p-6 md:p-8 backdrop-blur-xl shadow-xl">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-black uppercase tracking-wider">
                <Brain className="w-3.5 h-3.5" />
                The Feynman Technique
              </div>
              <h1 className="text-3xl md:text-4xl font-black tracking-tight text-slate-900 dark:text-white">
                "Teach the AI" <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-500 dark:from-emerald-400 dark:to-teal-300">Mastery Lab</span>
              </h1>
              <p className="text-slate-600 dark:text-slate-300 text-xs md:text-sm max-w-xl">
                "If you can't explain it simply, you don't understand it well enough." Teach concepts to Leo, an inquisitive AI student. Strip away complex jargon and master deep intuition!
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="p-3 bg-white dark:bg-slate-900/80 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold block mb-1">LANGUAGE</span>
                <select
                  value={feynmanLanguage}
                  onChange={e => setFeynmanLanguage(e.target.value)}
                  className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl px-2.5 py-1 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500 cursor-pointer"
                >
                  {SUPPORTED_LANGUAGES.map(lang => (
                    <option key={lang.code} value={lang.code}>
                      {lang.label} {lang.nativeName !== lang.label ? `(${lang.nativeName})` : ""}
                    </option>
                  ))}
                </select>
              </div>

              <div className="p-3 bg-white dark:bg-slate-900/80 rounded-2xl border border-slate-200 dark:border-slate-800 text-center shadow-sm">
                <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold block">INTUITION XP</span>
                <span className="text-sm font-black text-emerald-600 dark:text-emerald-400 flex items-center gap-1 justify-center">
                  <Flame className="w-4 h-4" /> +100 XP
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left Column: Topic Selector & Intuition Metrics */}
          <div className="space-y-4">
            <div className="bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 space-y-4 shadow-sm">
              <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
                <Lightbulb className="w-4 h-4 text-amber-500" />
                Select Concept to Teach
              </h3>

              <div className="space-y-2">
                {PRESET_TOPICS.map((topic) => {
                  const isSelected = selectedTopic.id === topic.id;
                  return (
                    <button
                      key={topic.id}
                      onClick={() => setSelectedTopic(topic)}
                      className={cn(
                        "w-full text-left p-3.5 rounded-2xl border transition-all space-y-1 block",
                        isSelected
                          ? "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500 shadow-md shadow-emerald-500/10"
                          : "bg-slate-50 dark:bg-slate-950/60 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700"
                      )}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black text-emerald-600 dark:text-emerald-400">{topic.subject}</span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-bold">Concept</span>
                      </div>
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white">{topic.title}</h4>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1">{topic.summary}</p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Simplicity & Jargon Monitor */}
            <div className="bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 space-y-4 shadow-sm">
              <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
                <Brain className="w-4 h-4 text-indigo-500 dark:text-indigo-400" />
                Intuition & Simplicity Meter
              </h3>

              <div className="space-y-2">
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-slate-500 dark:text-slate-400">Simplicity Score</span>
                  <span className={cn(
                    "font-black",
                    simplicityScore >= 80 ? "text-emerald-600 dark:text-emerald-400" : simplicityScore >= 50 ? "text-amber-600 dark:text-amber-400" : "text-red-600 dark:text-red-400"
                  )}>
                    {simplicityScore}%
                  </span>
                </div>
                <div className="w-full h-3 bg-slate-100 dark:bg-slate-950 rounded-full overflow-hidden border border-slate-200 dark:border-slate-800">
                  <div 
                    className={cn(
                      "h-full transition-all duration-500",
                      simplicityScore >= 80 ? "bg-emerald-500" : simplicityScore >= 50 ? "bg-amber-500" : "bg-red-500"
                    )}
                    style={{ width: `${simplicityScore}%` }}
                  />
                </div>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 text-xs space-y-1.5">
                <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
                  <span>Jargon Words Flagged:</span>
                  <span className="font-bold text-amber-600 dark:text-amber-400">{jargonCount}</span>
                </div>
                <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
                  <span>Teaching Exchanges:</span>
                  <span className="font-bold text-slate-900 dark:text-white">{teachingRounds}</span>
                </div>
              </div>

              <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-500/20 rounded-2xl space-y-1">
                <span className="text-[10px] font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400 block">Pro Feynman Tip</span>
                <p className="text-xs text-slate-700 dark:text-slate-300">
                  {selectedTopic.idealAnalogy}
                </p>
              </div>
            </div>
          </div>

          {/* Right 2 Columns: Conversational Teaching Lab */}
          <div className="lg:col-span-2 bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 md:p-6 flex flex-col justify-between shadow-xl h-[650px]">
            
            {/* Top Bar */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-500/10 dark:bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-600 dark:text-amber-300">
                  <Bot className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900 dark:text-white">Leo (Curious 10-Year-Old)</h3>
                  <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">Ready to learn {selectedTopic.title}</p>
                </div>
              </div>

              <button
                onClick={() => startSession(selectedTopic)}
                className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white text-xs font-bold flex items-center gap-1 transition-colors"
                title="Restart teaching session"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Reset
              </button>
            </div>

            {/* Chat Thread */}
            <div className="flex-1 overflow-y-auto py-4 space-y-4 pr-2">
              {messages.map((msg, idx) => {
                const isStudent = msg.sender === "student";
                return (
                  <div
                    key={idx}
                    className={cn(
                      "flex gap-3 max-w-[85%]",
                      isStudent ? "ml-auto flex-row-reverse" : "mr-auto"
                    )}
                  >
                    <div className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-xs font-bold",
                      isStudent ? "bg-indigo-600 text-white" : "bg-amber-500/10 dark:bg-amber-500/20 text-amber-600 dark:text-amber-300 border border-amber-500/30"
                    )}>
                      {isStudent ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                    </div>

                    <div className="space-y-1.5">
                      <div className={cn(
                        "p-4 rounded-2xl text-xs md:text-sm leading-relaxed",
                        isStudent 
                          ? "bg-indigo-600 text-white rounded-tr-none shadow-md shadow-indigo-600/20"
                          : "bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 rounded-tl-none"
                      )}>
                        {msg.text}
                      </div>

                      {msg.jargonFound && msg.jargonFound.length > 0 && (
                        <div className="p-2 bg-amber-500/10 border border-amber-500/30 rounded-xl text-[11px] text-amber-700 dark:text-amber-300 flex items-center gap-1.5">
                          <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                          <span>Jargon Detected: <strong>{msg.jargonFound.join(", ")}</strong></span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}

              {isTyping && (
                <div className="flex items-center gap-2 text-xs text-slate-500 italic">
                  <Bot className="w-4 h-4 text-amber-500 animate-spin" />
                  Leo is thinking about your explanation...
                </div>
              )}

              {isMasteryReached && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="p-5 bg-gradient-to-r from-emerald-500/10 to-teal-500/10 dark:from-emerald-950/60 dark:to-teal-950/60 border border-emerald-500/40 rounded-2xl text-center space-y-2"
                >
                  <Trophy className="w-8 h-8 text-amber-500 mx-auto" />
                  <h4 className="text-sm font-black text-slate-900 dark:text-white">Concept Mastered via Feynman Method!</h4>
                  <p className="text-xs text-emerald-600 dark:text-emerald-300">You earned +100 XP for explaining without textbook jargon!</p>
                </motion.div>
              )}

              <div ref={chatEndRef} />
            </div>

            {/* Input form */}
            <form onSubmit={handleSendMessage} className="pt-3 border-t border-slate-200 dark:border-slate-800 flex gap-2">
              <input
                type="text"
                value={inputMessage}
                onChange={e => setInputMessage(e.target.value)}
                placeholder="Explain in simple words or use a metaphor (e.g. 'Think of it like...')..."
                className="flex-1 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl px-4 py-3 text-xs md:text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              />
              <button
                type="submit"
                disabled={!inputMessage.trim() || isTyping}
                className="px-6 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white font-black text-xs flex items-center gap-1.5 shadow-lg shadow-emerald-600/30 transition-all"
              >
                <Send className="w-4 h-4" />
                Teach
              </button>
            </form>
          </div>

        </div>
      </div>
    </div>
  );
}
