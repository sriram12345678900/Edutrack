"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { BookOpen, Moon, Sun, Monitor, ArrowRight, ArrowLeft, CheckCircle2, Sparkles, GraduationCap, Globe } from "lucide-react";

export default function SignupWizard() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  
  // State
  const [nickname, setNickname] = useState<string>("");
  const [generatedCode, setGeneratedCode] = useState<string>("");
  const [selectedClass, setSelectedClass] = useState<number | null>(null);
  const [englishCurr, setEnglishCurr] = useState<string>("");
  const [sanskritCurr, setSanskritCurr] = useState<string>("");
  const [language, setLanguage] = useState<string>("English");
  const [theme, setTheme] = useState<string>("system");

  const isClass9or10 = selectedClass === 9 || selectedClass === 10;

  const handleNicknameChange = (val: string) => {
    const cleaned = val.trim().replace(/[^a-zA-Z0-9]/g, "");
    setNickname(cleaned);
    if (cleaned) {
      const suffix = Math.floor(1000 + Math.random() * 9000);
      setGeneratedCode(`${cleaned.toUpperCase()}#${suffix}`);
    } else {
      setGeneratedCode("");
    }
  };

  const nextStep = () => {
    if (currentStep === 0) {
      setCurrentStep(1); // Go to Class
    } else if (currentStep === 1 && isClass9or10) {
      setCurrentStep(2); // Go to Curriculum
    } else if (currentStep === 1) {
      setCurrentStep(3); // Skip curriculum, go to Language
    } else if (currentStep === 2) {
      setCurrentStep(3); // Go to Language
    } else if (currentStep === 3) {
      setCurrentStep(4); // Go to Theme
    } else {
      finishSetup();
    }
  };

  const prevStep = () => {
    if (currentStep === 4) {
      setCurrentStep(3); // Go to Language
    } else if (currentStep === 3 && !isClass9or10) {
      setCurrentStep(1); // Go to Class
    } else if (currentStep === 3) {
      setCurrentStep(2); // Go to Curriculum
    } else if (currentStep === 2) {
      setCurrentStep(1); // Go to Class
    } else {
      setCurrentStep(currentStep - 1);
    }
  };

  const finishSetup = () => {
    localStorage.setItem("edutrack_class", selectedClass?.toString() || "10");
    localStorage.setItem("edutrack_theme", theme);
    localStorage.setItem("edutrack_language", language);
    if (nickname) {
      localStorage.setItem("edutrack_nickname", nickname);
      localStorage.setItem("edutrack_friend_code", generatedCode || `${nickname.toUpperCase()}#${Math.floor(1000 + Math.random() * 9000)}`);
    }
    if (englishCurr) localStorage.setItem("edutrack_english_curr", englishCurr);
    if (sanskritCurr) localStorage.setItem("edutrack_sanskrit_curr", sanskritCurr);
    
    if (theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }

    router.push("/dashboard");
  };

  const variants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 50 : -50,
      opacity: 0
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? 50 : -50,
      opacity: 0
    })
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-6 overflow-hidden relative transition-colors duration-300">
      {/* Background blobs */}
      <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-purple-500/20 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] left-[-5%] w-[500px] h-[500px] bg-indigo-500/20 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="w-full max-w-2xl bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden relative z-10 p-8 md:p-12">
        
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-650 shadow-lg shadow-indigo-500/30 mb-6 border border-indigo-400/20">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl md:text-4xl font-black tracking-tight text-slate-900 dark:text-white mb-3">
            Set Up Your Profile
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm font-semibold">
            Let's customize EduTrack perfectly for you.
          </p>
        </div>

        {/* Steps Container */}
        <div className="relative min-h-[300px]">
          <AnimatePresence mode="wait" custom={1}>
            
            {/* STEP 0: NICKNAME & FRIEND CODE */}
            {currentStep === 0 && (
              <motion.div
                key="step0"
                custom={1}
                variants={variants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className="absolute w-full space-y-6"
              >
                <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200 mb-4 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-indigo-500" /> Choose your Study Nickname
                </h2>
                <div className="space-y-4">
                  <input
                    type="text"
                    value={nickname}
                    onChange={(e) => handleNicknameChange(e.target.value)}
                    placeholder="Enter a unique nickname..."
                    maxLength={12}
                    className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 font-bold text-lg text-slate-850 dark:text-white transition-all placeholder:font-normal"
                  />
                  {generatedCode && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-150 dark:border-indigo-900/60 p-4 rounded-2xl"
                    >
                      <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Your Assigned Unique Friend Code:</p>
                      <p className="text-lg font-black text-indigo-600 dark:text-indigo-400 font-mono tracking-wider mt-1">{generatedCode}</p>
                      <p className="text-[10px] text-slate-450 mt-1 leading-snug">Classmates can search this code to invite and message you directly!</p>
                    </motion.div>
                  )}
                </div>
              </motion.div>
            )}

            {/* STEP 1: CLASS */}
            {currentStep === 1 && (
              <motion.div
                key="step1"
                custom={1}
                variants={variants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className="absolute w-full"
              >
                <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200 mb-6 flex items-center gap-2">
                  <GraduationCap className="w-5 h-5 text-indigo-500" /> Which class are you in?
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {[6, 7, 8, 9, 10].map((cls) => (
                    <button
                      key={cls}
                      onClick={() => setSelectedClass(cls)}
                      className={`p-4 rounded-2xl border-2 transition-all duration-200 flex flex-col items-center gap-2 ${
                        selectedClass === cls 
                          ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 scale-[1.02]' 
                          : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:border-indigo-300 hover:shadow-md'
                      }`}
                    >
                      <span className="text-3xl font-black">{cls}</span>
                      <span className="text-sm font-medium">Class</span>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            {/* STEP 2: CURRICULUM (9 & 10 ONLY) */}
            {currentStep === 2 && (
              <motion.div
                key="step2"
                custom={1}
                variants={variants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className="absolute w-full space-y-8"
              >
                <div>
                  <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200 mb-4 flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-indigo-500" /> English Curriculum
                  </h2>
                  <div className="grid md:grid-cols-2 gap-4">
                    <button
                      onClick={() => setEnglishCurr("Language & Literature")}
                      className={`p-4 rounded-2xl border-2 text-left transition-all duration-200 ${
                        englishCurr === "Language & Literature" ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-500/10' : 'border-slate-200 dark:border-slate-700 hover:border-indigo-300'
                      }`}
                    >
                      <div className="font-bold text-slate-900 dark:text-white mb-1">Language & Literature</div>
                      <div className="text-sm text-slate-500">(Beehive, Moments, First Flight, etc.)</div>
                    </button>
                    <button
                      onClick={() => setEnglishCurr("Communicative")}
                      className={`p-4 rounded-2xl border-2 text-left transition-all duration-200 ${
                        englishCurr === "Communicative" ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-500/10' : 'border-slate-200 dark:border-slate-700 hover:border-indigo-300'
                      }`}
                    >
                      <div className="font-bold text-slate-900 dark:text-white mb-1">Communicative</div>
                      <div className="text-sm text-slate-500">(Literature Reader, Main Course Book)</div>
                    </button>
                  </div>
                </div>

                <div>
                  <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200 mb-4 flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-amber-500" /> Sanskrit Curriculum
                  </h2>
                  <div className="grid md:grid-cols-2 gap-4">
                    <button
                      onClick={() => setSanskritCurr("Regular")}
                      className={`p-4 rounded-2xl border-2 text-left transition-all duration-200 ${
                        sanskritCurr === "Regular" ? 'border-amber-500 bg-amber-50 dark:bg-amber-500/10' : 'border-slate-200 dark:border-slate-700 hover:border-amber-300'
                      }`}
                    >
                      <div className="font-bold text-slate-900 dark:text-white mb-1">Regular (Shemushi)</div>
                      <div className="text-sm text-slate-500">Standard Sanskrit syllabus</div>
                    </button>
                    <button
                      onClick={() => setSanskritCurr("Communicative")}
                      className={`p-4 rounded-2xl border-2 text-left transition-all duration-200 ${
                        sanskritCurr === "Communicative" ? 'border-amber-500 bg-amber-50 dark:bg-amber-500/10' : 'border-slate-200 dark:border-slate-700 hover:border-amber-300'
                      }`}
                    >
                      <div className="font-bold text-slate-900 dark:text-white mb-1">Communicative (Manika)</div>
                      <div className="text-sm text-slate-500">Communicative Sanskrit syllabus</div>
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

            {/* STEP 3: DEFAULT LANGUAGE */}
            {currentStep === 3 && (
              <motion.div
                key="stepLang"
                custom={1}
                variants={variants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className="absolute w-full"
              >
                <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200 mb-6 flex items-center gap-2">
                  <Globe className="w-5 h-5 text-indigo-500" /> Choose Your Default Study Language
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {[
                    { code: "English", label: "English", flag: "🇬🇧" },
                    { code: "Hinglish", label: "Hinglish", flag: "🇮🇳" },
                    { code: "Hindi", label: "Hindi (हिंदी)", flag: "🇮🇳" },
                    { code: "Tamil", label: "Tamil (தமிழ்)", flag: "🇮🇳" },
                    { code: "Telugu", label: "Telugu (తెలుగు)", flag: "🇮🇳" },
                    { code: "Marathi", label: "Marathi (मराठी)", flag: "🇮🇳" }
                  ].map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => setLanguage(lang.code)}
                      className={`p-4 rounded-2xl border-2 transition-all duration-200 flex flex-col items-center gap-2 ${
                        language === lang.code 
                          ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 scale-[1.02]' 
                          : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:border-indigo-300 hover:shadow-md'
                      }`}
                    >
                      <span className="text-3xl">{lang.flag}</span>
                      <span className="text-sm font-bold">{lang.label}</span>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            {/* STEP 4: THEME */}
            {currentStep === 4 && (
              <motion.div
                key="step3"
                custom={1}
                variants={variants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className="absolute w-full"
              >
                <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200 mb-6 flex items-center gap-2">
                  <Monitor className="w-5 h-5 text-indigo-500" /> Choose Your Theme
                </h2>
                <div className="grid md:grid-cols-3 gap-4">
                  <button
                    onClick={() => setTheme("light")}
                    className={`p-6 rounded-2xl border-2 flex flex-col items-center gap-3 transition-all duration-200 ${
                      theme === "light" ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-500/10' : 'border-slate-200 dark:border-slate-700 hover:border-indigo-300'
                    }`}
                  >
                    <Sun className="w-8 h-8 text-amber-500" />
                    <span className="font-bold text-slate-900 dark:text-white">Light Mode</span>
                  </button>
                  <button
                    onClick={() => setTheme("dark")}
                    className={`p-6 rounded-2xl border-2 flex flex-col items-center gap-3 transition-all duration-200 ${
                      theme === "dark" ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-500/10' : 'border-slate-200 dark:border-slate-700 hover:border-indigo-300'
                    }`}
                  >
                    <Moon className="w-8 h-8 text-indigo-400" />
                    <span className="font-bold text-slate-900 dark:text-white">Dark Mode</span>
                  </button>
                  <button
                    onClick={() => setTheme("system")}
                    className={`p-6 rounded-2xl border-2 flex flex-col items-center gap-3 transition-all duration-200 ${
                      theme === "system" ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-500/10' : 'border-slate-200 dark:border-slate-700 hover:border-indigo-300'
                    }`}
                  >
                    <Monitor className="w-8 h-8 text-slate-500" />
                    <span className="font-bold text-slate-900 dark:text-white">System</span>
                  </button>
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </div>

        {/* Footer Navigation */}
        <div className="mt-12 flex items-center justify-between border-t border-slate-200 dark:border-slate-800 pt-6">
          <button
            onClick={prevStep}
            disabled={currentStep === 0}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-full font-bold transition-colors ${
              currentStep === 0 ? 'opacity-0 pointer-events-none' : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <ArrowLeft className="w-5 h-5" /> Back
          </button>
          
          <button
            onClick={nextStep}
            disabled={(currentStep === 0 && !nickname.trim()) || (currentStep === 1 && !selectedClass)}
            className={`flex items-center gap-2 px-8 py-3 rounded-full font-bold text-white transition-all shadow-lg ${
              ((currentStep === 0 && !nickname.trim()) || (currentStep === 1 && !selectedClass)) ? 'bg-slate-300 dark:bg-slate-700 cursor-not-allowed shadow-none' : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:scale-105 shadow-indigo-500/30'
            }`}
          >
            {currentStep === 4 ? (
              <>Finish Setup <CheckCircle2 className="w-5 h-5" /></>
            ) : (
              <>Continue <ArrowRight className="w-5 h-5" /></>
            )}
          </button>
        </div>

      </div>
    </div>
  );
}
