"use client";

import React, { useState, useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Bot, X, Send, Sparkles, Map, MessageSquare, 
  ChevronRight, Play, Loader2
} from "lucide-react";

interface GuideMessage {
  role: "user" | "assistant";
  content: string;
}

export default function InteractiveAiGuide() {
  const pathname = usePathname() || "/dashboard";
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<GuideMessage[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [hasUnread, setHasUnread] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isOpen, isLoading]);

  // Provide contextual intro when pathname changes
  useEffect(() => {
    let intro = "Hi! I'm Sparky, your AI Guide. How can I help you today?";
    
    if (pathname.includes("/dashboard")) {
      intro = "Welcome to your Dashboard! Here you can track your daily streaks and level progressions. Need a quick tour?";
    } else if (pathname.includes("/tutor")) {
      intro = "This is the AI Tutor room! You can upload homework or ask doubts here. Need any help?";
    } else if (pathname.includes("/flashcards")) {
      intro = "Welcome to Flashcards! We use Spaced Repetition here. Swipe right to master, left to review. Want to know more?";
    } else if (pathname.includes("/sandbox")) {
      intro = "Welcome to the Simulations Lab! You can run virtual experiments here. What would you like to explore?";
    } else if (pathname.includes("/pomodoro")) {
      intro = "Focus mode activated! This is the Pomodoro timer. Try the ambient sounds!";
    }

    setMessages([
      { role: "assistant", content: intro }
    ]);
    
    if (!isOpen) {
      setHasUnread(true);
    }
  }, [pathname, isOpen]);

  const handleOpenTour = () => {
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("edutrack_open_feature_tour", { detail: { stepIndex: 0 } }));
      setIsOpen(false);
    }
  };

  const handleSend = async (text: string) => {
    if (!text.trim() || isLoading) return;
    
    const userMsg: GuideMessage = { role: "user", content: text };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInputValue("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/guide", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: newMessages,
          pathname
        })
      });
      const data = await res.json();
      if (data.reply) {
        setMessages(prev => [...prev, { role: "assistant", content: data.reply }]);
      } else {
        throw new Error("No reply");
      }
    } catch (e) {
      console.error(e);
      setMessages(prev => [...prev, { role: "assistant", content: "Oops, I'm having trouble connecting right now." }]);
    } finally {
      setIsLoading(false);
    }
  };

  // Quick Action Prompts based on pathname
  const quickActions = (() => {
    if (pathname.includes("/dashboard")) {
      return ["What are daily quests?", "How do I gain XP?"];
    } else if (pathname.includes("/tutor")) {
      return ["How do I use AI Lens?", "Change tutor language"];
    } else if (pathname.includes("/flashcards")) {
      return ["What is Leitner box?", "How to make a deck?"];
    }
    return ["What can I do here?", "Give me a study tip"];
  })();

  return (
    <div className="fixed bottom-24 right-4 md:bottom-8 md:right-8 z-[90] flex flex-col items-end">
      
      {/* Expanded Chat Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="mb-4 w-[320px] sm:w-[360px] h-[480px] max-h-[70vh] bg-white dark:bg-[#080b18] border border-indigo-500/20 rounded-2xl shadow-[0_10px_40px_rgba(99,102,241,0.2)] flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="px-4 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 flex items-center justify-between text-white shrink-0">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                  <Bot className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h3 className="text-sm font-black tracking-wide">Sparky Guide</h3>
                  <p className="text-[10px] text-indigo-100 font-medium opacity-90 uppercase tracking-widest">
                    AI Study Companion
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg hover:bg-white/20 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Context Actions */}
            <div className="px-4 py-2 bg-indigo-50 dark:bg-indigo-950/30 border-b border-indigo-100 dark:border-indigo-500/20 flex flex-wrap gap-2 shrink-0">
              <button 
                onClick={handleOpenTour}
                className="text-[10px] font-bold px-2 py-1 bg-white dark:bg-indigo-900/50 border border-indigo-200 dark:border-indigo-400/30 text-indigo-700 dark:text-indigo-300 rounded flex items-center gap-1 hover:bg-indigo-100 dark:hover:bg-indigo-800 transition-colors shadow-sm"
              >
                <Map className="w-3 h-3" />
                Start Page Tour
              </button>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
              {messages.map((m, idx) => (
                <div key={idx} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm ${
                    m.role === "user" 
                      ? "bg-indigo-600 text-white rounded-br-sm" 
                      : "bg-slate-100 dark:bg-white/5 text-slate-800 dark:text-slate-200 rounded-bl-sm border border-slate-200 dark:border-white/10"
                  }`}>
                    {m.content}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-slate-100 dark:bg-white/5 rounded-2xl rounded-bl-sm px-4 py-3 flex items-center gap-2 border border-slate-200 dark:border-white/10">
                    <Loader2 className="w-4 h-4 text-indigo-500 animate-spin" />
                    <span className="text-xs text-slate-500 dark:text-slate-400">Sparky is typing...</span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Actions (Suggestions) */}
            <div className="px-4 py-2 flex gap-2 overflow-x-auto custom-scrollbar shrink-0">
              {quickActions.map((action, i) => (
                <button
                  key={i}
                  onClick={() => handleSend(action)}
                  className="whitespace-nowrap text-[10px] font-bold px-3 py-1.5 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-full text-indigo-600 dark:text-indigo-300 hover:bg-indigo-50 dark:hover:bg-indigo-500/20 transition-colors"
                >
                  {action}
                </button>
              ))}
            </div>

            {/* Input Form */}
            <form 
              onSubmit={(e) => { e.preventDefault(); handleSend(inputValue); }}
              className="p-3 border-t border-slate-200 dark:border-white/10 bg-white dark:bg-[#040614] shrink-0"
            >
              <div className="relative flex items-center">
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="Ask Sparky..."
                  className="w-full pl-4 pr-10 py-2.5 bg-slate-50 dark:bg-black/50 border border-slate-200 dark:border-white/10 rounded-xl text-sm focus:outline-none focus:border-indigo-500 dark:focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 dark:text-white"
                />
                <button
                  type="submit"
                  disabled={!inputValue.trim() || isLoading}
                  className="absolute right-2 p-1.5 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/50 rounded-lg disabled:opacity-50 transition-colors"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </form>

          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Toggle Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => {
          setIsOpen(!isOpen);
          setHasUnread(false);
        }}
        className="w-14 h-14 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white flex items-center justify-center shadow-[0_10px_25px_rgba(99,102,241,0.4)] border-2 border-indigo-300/30 relative"
      >
        {/* Glow effect */}
        <div className="absolute inset-0 rounded-full bg-indigo-500 blur-md opacity-40 animate-pulse pointer-events-none" />
        
        {isOpen ? (
          <X className="w-6 h-6 relative z-10" />
        ) : (
          <Sparkles className="w-6 h-6 relative z-10" />
        )}
        
        {/* Unread badge indicator */}
        {!isOpen && hasUnread && (
          <span className="absolute top-0 right-0 w-3.5 h-3.5 bg-rose-500 border-2 border-white dark:border-[#080b18] rounded-full" />
        )}
      </motion.button>

    </div>
  );
}
