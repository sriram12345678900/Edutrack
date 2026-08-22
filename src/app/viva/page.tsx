"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Mic, MicOff, Volume2, VolumeX, Sparkles, Award, Play, RotateCcw, 
  CheckCircle2, AlertCircle, ChevronRight, User, Bot, HelpCircle, 
  BookOpen, Star, Trophy, ShieldCheck, Flame, FastForward
} from "lucide-react";
import { awardXp } from "@/lib/xp";
import { cn } from "@/lib/utils";

interface VivaQuestion {
  id: number;
  question: string;
  expectedKeywords: string[];
  idealAnswerSummary: string;
  subject: string;
  chapter: string;
}

const VIVA_QUESTION_BANKS: { [key: string]: VivaQuestion[] } = {
  "Physics - Light & Optics": [
    {
      id: 1,
      question: "Can you state Snell's law of refraction and explain what the refractive index physically represents regarding the speed of light?",
      expectedKeywords: ["ratio", "sine of angle of incidence", "sine of angle of refraction", "constant", "speed of light in vacuum", "speed of light in medium"],
      idealAnswerSummary: "Snell's law states that the ratio of sin(i) to sin(r) is a constant for a given pair of media. The absolute refractive index n = c/v, representing how much the speed of light slows down in that medium compared to vacuum.",
      subject: "Physics",
      chapter: "Light - Reflection & Refraction"
    },
    {
      id: 2,
      question: "Why does a concave mirror form a virtual, erect, and magnified image only when an object is placed between the Pole and Principal Focus?",
      expectedKeywords: ["diverging reflected rays", "behind the mirror", "apparent intersection", "pole", "focus", "virtual erect magnified"],
      idealAnswerSummary: "When placed between P and F, the reflected rays diverge after reflection. When extended backward behind the mirror, they appear to intersect, producing a virtual, erect, and magnified image.",
      subject: "Physics",
      chapter: "Light - Reflection & Refraction"
    },
    {
      id: 3,
      question: "What is power of a lens? If a doctor prescribes a lens of power -2.0 Dioptres, what type of lens is it and what is its focal length?",
      expectedKeywords: ["reciprocal of focal length in metres", "concave lens", "diverging", "myopia", "-0.5 metres", "50 cm"],
      idealAnswerSummary: "Power is the reciprocal of focal length in metres (P = 1/f). A power of -2.0 D means it is a concave lens (used for myopia) with focal length f = 1 / (-2.0) = -0.5 m or -50 cm.",
      subject: "Physics",
      chapter: "Light - Reflection & Refraction"
    }
  ],
  "Chemistry - Acids, Bases & Salts": [
    {
      id: 1,
      question: "Explain what happens when excess carbon dioxide gas is passed through lime water. State both the initial observation and the change on prolonged bubbling.",
      expectedKeywords: ["calcium carbonate", "milky", "calcium hydrogen carbonate", "soluble", "clears", "precipitate"],
      idealAnswerSummary: "Initially, lime water turns milky due to the formation of insoluble calcium carbonate precipitate. On passing excess CO2, soluble calcium hydrogen carbonate (calcium bicarbonate) forms, causing the solution to turn clear again.",
      subject: "Chemistry",
      chapter: "Acids, Bases & Salts"
    },
    {
      id: 2,
      question: "Why does dry hydrogen chloride gas not change the colour of dry litmus paper, but moist litmus paper turns red?",
      expectedKeywords: ["hydrogen ions", "H+ ions", "hydronium ions", "H3O+", "water present", "acidic properties in aqueous solution"],
      idealAnswerSummary: "Acids produce H+ (hydronium) ions only in the presence of water. Dry HCl gas has no dissolved hydronium ions, so it shows no acidic character until it encounters the moisture on wet litmus paper.",
      subject: "Chemistry",
      chapter: "Acids, Bases & Salts"
    }
  ],
  "Biology - Life Processes": [
    {
      id: 1,
      question: "Why are the walls of the ventricles considerably thicker and more muscular than the walls of the atria in the human heart?",
      expectedKeywords: ["pump blood", "higher pressure", "distance", "body organs", "lungs", "thicker myocardium"],
      idealAnswerSummary: "Ventricles must pump blood out to entire distant organ systems (systemic circulation via left ventricle) under much higher hydrostatic pressure, whereas atria only pump blood a short distance into adjacent ventricles.",
      subject: "Biology",
      chapter: "Life Processes - Circulation"
    },
    {
      id: 2,
      question: "Explain the role of bile juice in lipid digestion. Why does bile not contain any digestive enzymes yet is indispensable?",
      expectedKeywords: ["emulsification", "large fat globules", "small globules", "alkaline medium", "pancreatic lipase action", "surface area"],
      idealAnswerSummary: "Bile emulsifies large fat droplets into tiny micro-droplets, vastly increasing surface area for pancreatic lipase to act. It also creates an alkaline pH required for intestinal enzymes.",
      subject: "Biology",
      chapter: "Life Processes - Nutrition"
    }
  ]
};

export default function VivaPage() {
  const [selectedTopic, setSelectedTopic] = useState<string>("Physics - Light & Optics");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isExamActive, setIsExamActive] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [isSpeaking, setIsSpeaking] = useState(false);
  
  // Results
  const [evaluations, setEvaluations] = useState<{
    questionId: number;
    score: number;
    feedback: string;
    detectedKeywords: string[];
    missingKeywords: string[];
  }[]>([]);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [isFinished, setIsFinished] = useState(false);

  const recognitionRef = useRef<any>(null);

  const questions = VIVA_QUESTION_BANKS[selectedTopic] || [];
  const currentQuestion = questions[currentIndex];

  // Initialize Speech Recognition
  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recog = new SpeechRecognition();
        recog.continuous = true;
        recog.interimResults = true;
        recog.lang = "en-US";

        recog.onresult = (event: any) => {
          let currentTranscript = "";
          for (let i = 0; i < event.results.length; i++) {
            currentTranscript += event.results[i][0].transcript;
          }
          setTranscript(currentTranscript);
        };

        recog.onerror = (e: any) => {
          console.error("Speech recognition error:", e);
          setIsListening(false);
        };

        recog.onend = () => {
          setIsListening(false);
        };

        recognitionRef.current = recog;
      }
    }
  }, []);

  const speakText = (text: string) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.95;
    utterance.pitch = 1.0;
    
    // Choose natural voice if available
    const voices = window.speechSynthesis.getVoices();
    const englishVoice = voices.find(v => v.lang.includes("en-US") || v.lang.includes("en-GB"));
    if (englishVoice) utterance.voice = englishVoice;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  };

  const handleStartExam = () => {
    setIsExamActive(true);
    setCurrentIndex(0);
    setEvaluations([]);
    setIsFinished(false);
    setTranscript("");
    
    setTimeout(() => {
      if (questions[0]) {
        speakText(`Hello! Welcome to your oral viva on ${selectedTopic}. Here is your first question: ${questions[0].question}`);
      }
    }, 400);
  };

  const toggleListening = () => {
    if (!recognitionRef.current) {
      alert("Speech recognition is not supported in this browser. Please use Chrome/Edge or type your answer!");
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      setTranscript("");
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleEvaluateAnswer = () => {
    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }

    if (!transcript.trim()) {
      alert("Please speak or write your answer first!");
      return;
    }

    setIsEvaluating(true);

    setTimeout(() => {
      const lowerTranscript = transcript.toLowerCase();
      const detected = currentQuestion.expectedKeywords.filter(k => 
        lowerTranscript.includes(k.toLowerCase()) || 
        k.split(" ").some(word => word.length > 3 && lowerTranscript.includes(word.toLowerCase()))
      );
      const missing = currentQuestion.expectedKeywords.filter(k => !detected.includes(k));

      // Calculate score based on keywords & length
      const ratio = detected.length / (currentQuestion.expectedKeywords.length || 1);
      let calculatedScore = Math.min(10, Math.max(3, Math.round(ratio * 9 + (transcript.length > 50 ? 1 : 0))));
      if (detected.length === 0) calculatedScore = 4;

      const evalFeedback = 
        calculatedScore >= 8 
          ? "Excellent conceptual depth! You clearly articulated the core physics/scientific principles and covered necessary key terms."
          : calculatedScore >= 6
          ? "Good attempt! You understood the basic concept, but you missed a few key scientific terminologies in your explanation."
          : "Needs revision. You touched on the topic, but the explanation lacked precision and vital keywords.";

      const newEval = {
        questionId: currentQuestion.id,
        score: calculatedScore,
        feedback: evalFeedback,
        detectedKeywords: detected,
        missingKeywords: missing
      };

      setEvaluations(prev => [...prev, newEval]);
      setIsEvaluating(false);

      // Voice examiner verdict
      speakText(`Thank you. You scored ${calculatedScore} out of 10. ${evalFeedback}`);
    }, 1000);
  };

  const handleNextQuestion = () => {
    if (currentIndex + 1 < questions.length) {
      const nextIdx = currentIndex + 1;
      setCurrentIndex(nextIdx);
      setTranscript("");
      setTimeout(() => {
        speakText(`Question ${nextIdx + 1}: ${questions[nextIdx].question}`);
      }, 300);
    } else {
      setIsFinished(true);
      awardXp(120, "Completed Oral Viva Exam");
    }
  };

  const totalScore = evaluations.reduce((acc, curr) => acc + curr.score, 0);
  const maxPossibleScore = evaluations.length * 10;
  const currentEval = evaluations.find(e => e.questionId === currentQuestion?.id);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 md:p-8 font-sans">
      <div className="max-w-5xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-purple-900/40 via-indigo-900/40 to-slate-900/60 border border-purple-500/20 p-6 md:p-8 backdrop-blur-xl shadow-2xl">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-400 text-xs font-black uppercase tracking-wider">
                <Mic className="w-3.5 h-3.5 animate-pulse" />
                Conversational AI Oral Examiner
              </div>
              <h1 className="text-3xl md:text-4xl font-black tracking-tight text-white">
                AI Voice <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-300">Viva Simulator</span>
              </h1>
              <p className="text-slate-300 text-xs md:text-sm max-w-xl">
                Test your conceptual clarity, oral articulation, and quick thinking with an interactive AI examiner simulating official board practical viva exams.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="p-3 bg-slate-900/80 rounded-2xl border border-slate-800 text-center">
                <span className="text-[10px] text-slate-400 font-bold block">REWARD</span>
                <span className="text-sm font-black text-amber-400 flex items-center gap-1 justify-center">
                  <Flame className="w-4 h-4" /> +120 XP
                </span>
              </div>
            </div>
          </div>
        </div>

        {!isExamActive ? (
          /* Topic Selection Screen */
          <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 md:p-8 space-y-6 shadow-xl">
            <div>
              <h2 className="text-xl font-black text-white flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-indigo-400" />
                Select Viva Subject & Topic
              </h2>
              <p className="text-xs text-slate-400 mt-1">Choose an exam topic to begin your oral questioning round with the AI examiner.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {Object.keys(VIVA_QUESTION_BANKS).map((topicKey) => {
                const isSelected = selectedTopic === topicKey;
                return (
                  <div
                    key={topicKey}
                    onClick={() => setSelectedTopic(topicKey)}
                    className={cn(
                      "p-5 rounded-2xl border cursor-pointer transition-all space-y-3",
                      isSelected
                        ? "bg-indigo-950/40 border-indigo-500 shadow-lg shadow-indigo-950/50 scale-[1.02]"
                        : "bg-slate-950/60 border-slate-800 hover:border-slate-700"
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black text-indigo-400">{topicKey.split(" - ")[0]}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 font-bold">
                        {VIVA_QUESTION_BANKS[topicKey].length} Questions
                      </span>
                    </div>
                    <h3 className="text-sm font-bold text-white">{topicKey.split(" - ")[1]}</h3>
                    <p className="text-xs text-slate-400">Board practicals & oral viva coverage</p>
                  </div>
                );
              })}
            </div>

            <div className="flex justify-end pt-4 border-t border-slate-800">
              <button
                onClick={handleStartExam}
                className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-black text-sm flex items-center gap-2 shadow-xl shadow-indigo-600/30 transition-all hover:scale-105 active:scale-95"
              >
                <Play className="w-4 h-4 fill-white" />
                Start Viva Examination
              </button>
            </div>
          </div>
        ) : isFinished ? (
          /* Finished Scorecard */
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 space-y-6 shadow-2xl text-center"
          >
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center mx-auto text-emerald-400">
              <Trophy className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl font-black text-white">Viva Examination Complete!</h2>
              <p className="text-xs text-slate-400">Here is your official oral performance summary:</p>
            </div>

            <div className="inline-flex items-center gap-4 p-4 rounded-2xl bg-slate-950 border border-slate-800">
              <div>
                <span className="text-xs text-slate-400 block font-bold">Total Viva Score</span>
                <span className="text-3xl font-black text-emerald-400">{totalScore} / {maxPossibleScore}</span>
              </div>
              <div className="w-[1px] h-10 bg-slate-800" />
              <div>
                <span className="text-xs text-slate-400 block font-bold">Accuracy Rating</span>
                <span className="text-3xl font-black text-indigo-400">{Math.round((totalScore / maxPossibleScore) * 100)}%</span>
              </div>
            </div>

            <div className="space-y-3 text-left max-w-2xl mx-auto">
              {evaluations.map((ev, i) => (
                <div key={i} className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-300">Question {i + 1}</span>
                    <span className="text-xs font-black text-amber-400">{ev.score}/10 Marks</span>
                  </div>
                  <p className="text-xs text-slate-400">{ev.feedback}</p>
                </div>
              ))}
            </div>

            <div className="flex justify-center gap-3 pt-4">
              <button
                onClick={() => setIsExamActive(false)}
                className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-2"
              >
                <RotateCcw className="w-4 h-4" /> Try Another Topic
              </button>
            </div>
          </motion.div>
        ) : (
          /* Live Viva Examination Screen */
          <div className="space-y-6">
            {/* Progress bar */}
            <div className="flex items-center justify-between text-xs text-slate-400 font-bold px-1">
              <span>Question {currentIndex + 1} of {questions.length}</span>
              <span>Topic: {selectedTopic}</span>
            </div>

            <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
              <div 
                className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 transition-all duration-300"
                style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
              />
            </div>

            {/* Examiner Character Card */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 md:p-8 space-y-6 shadow-xl relative overflow-hidden">
              <div className="flex items-start gap-4">
                <div className="relative">
                  <div className="w-14 h-14 rounded-2xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-300 shadow-inner">
                    <Bot className="w-8 h-8" />
                  </div>
                  {isSpeaking && (
                    <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 ring-4 ring-slate-900 animate-pulse" />
                  )}
                </div>

                <div className="space-y-2 flex-1">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-black text-white">Professor Sophia</h3>
                      <p className="text-[10px] text-purple-400 font-bold uppercase tracking-wider">Senior Academic Examiner</p>
                    </div>

                    <button
                      onClick={() => speakText(currentQuestion.question)}
                      className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold flex items-center gap-1.5 transition-colors"
                    >
                      <Volume2 className="w-4 h-4 text-purple-400" />
                      Repeat Question
                    </button>
                  </div>

                  <div className="p-4 bg-slate-950/80 rounded-2xl border border-slate-800/80 text-sm md:text-base font-medium text-slate-100 leading-relaxed shadow-inner">
                    "{currentQuestion.question}"
                  </div>
                </div>
              </div>

              {/* Student Voice Input Area */}
              <div className="pt-4 border-t border-slate-800 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-400 flex items-center gap-2">
                    <User className="w-4 h-4 text-indigo-400" />
                    Your Spoken Response:
                  </span>
                  {isListening && (
                    <span className="text-xs font-bold text-red-400 flex items-center gap-1.5 animate-pulse">
                      <span className="w-2 h-2 rounded-full bg-red-500" />
                      Recording Audio...
                    </span>
                  )}
                </div>

                <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 min-h-[100px] flex flex-col justify-between">
                  <textarea
                    value={transcript}
                    onChange={e => setTranscript(e.target.value)}
                    placeholder="Click the microphone and speak your answer clearly, or type here directly..."
                    className="w-full bg-transparent text-sm text-slate-200 placeholder-slate-600 focus:outline-none resize-none"
                    rows={3}
                  />

                  <div className="flex items-center justify-between pt-3 border-t border-slate-900">
                    <button
                      onClick={toggleListening}
                      className={cn(
                        "px-4 py-2 rounded-xl text-xs font-black flex items-center gap-2 transition-all",
                        isListening
                          ? "bg-red-500/20 text-red-400 border border-red-500/40 animate-pulse"
                          : "bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/30"
                      )}
                    >
                      {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                      {isListening ? "Stop Speaking" : "Start Speaking Answer"}
                    </button>

                    <button
                      onClick={handleEvaluateAnswer}
                      disabled={isEvaluating || !transcript.trim()}
                      className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-40 text-white text-xs font-black flex items-center gap-2 transition-all"
                    >
                      <Sparkles className="w-4 h-4" />
                      {isEvaluating ? "Grading..." : "Submit Answer to Examiner"}
                    </button>
                  </div>
                </div>
              </div>

              {/* Evaluation Feedback Panel */}
              <AnimatePresence>
                {currentEval && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-5 rounded-2xl bg-indigo-950/30 border border-indigo-500/30 space-y-4 shadow-lg"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Award className="w-5 h-5 text-amber-400" />
                        <h4 className="text-sm font-black text-white">Examiner Score:</h4>
                        <span className="text-base font-black text-amber-400">{currentEval.score} / 10</span>
                      </div>

                      <button
                        onClick={handleNextQuestion}
                        className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-black flex items-center gap-1.5"
                      >
                        Next Question <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>

                    <p className="text-xs text-slate-300 leading-relaxed">{currentEval.feedback}</p>

                    <div className="space-y-2 pt-2 border-t border-indigo-900/50">
                      <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
                        <span className="text-slate-400 font-bold">Keywords Detected:</span>
                        {currentEval.detectedKeywords.length > 0 ? (
                          currentEval.detectedKeywords.map(k => (
                            <span key={k} className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3" /> {k}
                            </span>
                          ))
                        ) : (
                          <span className="text-slate-500">None detected</span>
                        )}
                      </div>

                      {currentEval.missingKeywords.length > 0 && (
                        <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
                          <span className="text-slate-400 font-bold">Suggested Terms:</span>
                          {currentEval.missingKeywords.map(k => (
                            <span key={k} className="px-2 py-0.5 rounded bg-slate-800 text-slate-400 font-medium">
                              {k}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
