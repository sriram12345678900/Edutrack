"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { 
  GraduationCap, 
  BookOpen, 
  Sparkles, 
  ArrowRight, 
  FlaskConical, 
  Calculator, 
  Globe2, 
  Languages,
  CheckCircle,
  Flame
} from "lucide-react";

interface SubjectData {
  name: string;
  iconName: "flask" | "calc" | "globe" | "lang";
  color: string;
  badgeColor: string;
  topicsCount: number;
  highYieldChapters: string[];
}

interface ClassData {
  grade: number;
  label: string;
  tagline: string;
  badge: string;
  subjects: SubjectData[];
}

const CURRICULUM_DATA: ClassData[] = [
  {
    grade: 10,
    label: "Class 10",
    tagline: "CBSE Board Examination Masterclass",
    badge: "Official CBSE Board Pattern 2025–26",
    subjects: [
      {
        name: "Science",
        iconName: "flask",
        color: "from-cyan-500 to-blue-600",
        badgeColor: "text-cyan-400 border-cyan-500/30 bg-cyan-500/10",
        topicsCount: 16,
        highYieldChapters: [
          "Chemical Reactions & Equations",
          "Acids, Bases & Salts",
          "Life Processes",
          "Light: Reflection & Refraction",
          "Electricity & Circuits",
          "Carbon & its Compounds"
        ]
      },
      {
        name: "Mathematics",
        iconName: "calc",
        color: "from-indigo-500 to-purple-600",
        badgeColor: "text-indigo-400 border-indigo-500/30 bg-indigo-500/10",
        topicsCount: 15,
        highYieldChapters: [
          "Real Numbers",
          "Polynomials",
          "Quadratic Equations",
          "Trigonometry & Identities",
          "Heights & Distances",
          "Surface Areas & Volumes"
        ]
      },
      {
        name: "Social Science",
        iconName: "globe",
        color: "from-amber-500 to-orange-600",
        badgeColor: "text-amber-400 border-amber-500/30 bg-amber-500/10",
        topicsCount: 20,
        highYieldChapters: [
          "Rise of Nationalism in Europe",
          "Nationalism in India",
          "Resources & Development",
          "Power Sharing & Federalism",
          "Money & Credit"
        ]
      },
      {
        name: "English",
        iconName: "lang",
        color: "from-pink-500 to-rose-600",
        badgeColor: "text-pink-400 border-pink-500/30 bg-pink-500/10",
        topicsCount: 14,
        highYieldChapters: [
          "A Letter to God",
          "Nelson Mandela: Long Walk to Freedom",
          "The Ball Poem",
          "Formal Letters & Analytical Paragraphs"
        ]
      }
    ]
  },
  {
    grade: 9,
    label: "Class 9",
    tagline: "Foundation for Senior Secondary & Olympiads",
    badge: "Core Science & Analytical Math",
    subjects: [
      {
        name: "Science",
        iconName: "flask",
        color: "from-cyan-500 to-blue-600",
        badgeColor: "text-cyan-400 border-cyan-500/30 bg-cyan-500/10",
        topicsCount: 12,
        highYieldChapters: [
          "Matter in Our Surroundings",
          "Atoms & Molecules",
          "The Fundamental Unit of Life",
          "Motion & Speed-Time Graphs",
          "Force & Laws of Motion",
          "Gravitation"
        ]
      },
      {
        name: "Mathematics",
        iconName: "calc",
        color: "from-indigo-500 to-purple-600",
        badgeColor: "text-indigo-400 border-indigo-500/30 bg-indigo-500/10",
        topicsCount: 12,
        highYieldChapters: [
          "Number Systems",
          "Polynomials & Factorisation",
          "Coordinate Geometry",
          "Lines, Angles & Triangles",
          "Heron's Formula",
          "Circles & Quadrilaterals"
        ]
      },
      {
        name: "Social Science",
        iconName: "globe",
        color: "from-amber-500 to-orange-600",
        badgeColor: "text-amber-400 border-amber-500/30 bg-amber-500/10",
        topicsCount: 16,
        highYieldChapters: [
          "The French Revolution",
          "Socialism in Europe",
          "India — Size & Location",
          "Constitutional Design",
          "The Story of Village Palampur"
        ]
      },
      {
        name: "English",
        iconName: "lang",
        color: "from-pink-500 to-rose-600",
        badgeColor: "text-pink-400 border-pink-500/30 bg-pink-500/10",
        topicsCount: 12,
        highYieldChapters: [
          "The Fun They Had",
          "The Sound of Music",
          "The Road Not Taken",
          "Story Writing & Grammar"
        ]
      }
    ]
  },
  {
    grade: 8,
    label: "Class 8",
    tagline: "Middle School Mastery & Conceptual Grounding",
    badge: "NCERT Rationalised 2025–26",
    subjects: [
      {
        name: "Science",
        iconName: "flask",
        color: "from-cyan-500 to-blue-600",
        badgeColor: "text-cyan-400 border-cyan-500/30 bg-cyan-500/10",
        topicsCount: 13,
        highYieldChapters: [
          "Crop Production & Management",
          "Microorganisms: Friend & Foe",
          "Coal & Petroleum",
          "Combustion & Flame",
          "Force & Pressure",
          "Sound Waves"
        ]
      },
      {
        name: "Mathematics",
        iconName: "calc",
        color: "from-indigo-500 to-purple-600",
        badgeColor: "text-indigo-400 border-indigo-500/30 bg-indigo-500/10",
        topicsCount: 13,
        highYieldChapters: [
          "Rational Numbers",
          "Linear Equations in One Variable",
          "Understanding Quadrilaterals",
          "Algebraic Expressions & Identities",
          "Mensuration & Volumes"
        ]
      },
      {
        name: "Social Science",
        iconName: "globe",
        color: "from-amber-500 to-orange-600",
        badgeColor: "text-amber-400 border-amber-500/30 bg-amber-500/10",
        topicsCount: 14,
        highYieldChapters: [
          "From Trade to Territory",
          "When People Rebel 1857",
          "Land, Soil, Water & Wildlife",
          "The Indian Constitution",
          "Understanding Secularism"
        ]
      },
      {
        name: "English",
        iconName: "lang",
        color: "from-pink-500 to-rose-600",
        badgeColor: "text-pink-400 border-pink-500/30 bg-pink-500/10",
        topicsCount: 10,
        highYieldChapters: [
          "The Best Christmas Present in the World",
          "The Tsunami",
          "Geography Lesson",
          "Diary Entry & Comprehension"
        ]
      }
    ]
  },
  {
    grade: 7,
    label: "Class 7",
    tagline: "Core Logic, Scientific Inquiry & Problem Solving",
    badge: "Interactive Foundations",
    subjects: [
      {
        name: "Science",
        iconName: "flask",
        color: "from-cyan-500 to-blue-600",
        badgeColor: "text-cyan-400 border-cyan-500/30 bg-cyan-500/10",
        topicsCount: 13,
        highYieldChapters: [
          "Nutrition in Plants & Animals",
          "Heat & Temperature",
          "Acids, Bases and Salts",
          "Physical & Chemical Changes",
          "Motion & Time"
        ]
      },
      {
        name: "Mathematics",
        iconName: "calc",
        color: "from-indigo-500 to-purple-600",
        badgeColor: "text-indigo-400 border-indigo-500/30 bg-indigo-500/10",
        topicsCount: 13,
        highYieldChapters: [
          "Integers & Operations",
          "Fractions & Decimals",
          "Simple Equations",
          "Lines & Angles",
          "Triangles & Its Properties",
          "Comparing Quantities"
        ]
      },
      {
        name: "Social Science",
        iconName: "globe",
        color: "from-amber-500 to-orange-600",
        badgeColor: "text-amber-400 border-amber-500/30 bg-amber-500/10",
        topicsCount: 12,
        highYieldChapters: [
          "Tracing Changes Through a Thousand Years",
          "New Kings and Kingdoms",
          "Our Environment",
          "On Equality"
        ]
      },
      {
        name: "English",
        iconName: "lang",
        color: "from-pink-500 to-rose-600",
        badgeColor: "text-pink-400 border-pink-500/30 bg-pink-500/10",
        topicsCount: 10,
        highYieldChapters: [
          "Three Questions",
          "A Gift of Chappals",
          "The Rebel",
          "Informal Letter & Vocabulary"
        ]
      }
    ]
  },
  {
    grade: 6,
    label: "Class 6",
    tagline: "Transition to Secondary — Fun, Engaging Concepts",
    badge: "Beginner-Friendly Interactive Labs",
    subjects: [
      {
        name: "Science",
        iconName: "flask",
        color: "from-cyan-500 to-blue-600",
        badgeColor: "text-cyan-400 border-cyan-500/30 bg-cyan-500/10",
        topicsCount: 11,
        highYieldChapters: [
          "Components of Food",
          "Sorting Materials into Groups",
          "Separation of Substances",
          "Getting to Know Plants",
          "Motion & Measurement of Distances",
          "Light, Shadows & Reflections"
        ]
      },
      {
        name: "Mathematics",
        iconName: "calc",
        color: "from-indigo-500 to-purple-600",
        badgeColor: "text-indigo-400 border-indigo-500/30 bg-indigo-500/10",
        topicsCount: 12,
        highYieldChapters: [
          "Knowing Our Numbers",
          "Whole Numbers & Factors",
          "Playing with Numbers",
          "Basic Geometrical Ideas",
          "Integers & Fractions",
          "Decimals & Data Handling"
        ]
      },
      {
        name: "Social Science",
        iconName: "globe",
        color: "from-amber-500 to-orange-600",
        badgeColor: "text-amber-400 border-amber-500/30 bg-amber-500/10",
        topicsCount: 12,
        highYieldChapters: [
          "What, Where, How and When?",
          "From Hunting-Gathering to Growing Food",
          "The Earth in the Solar System",
          "Globe: Latitudes and Longitudes",
          "Understanding Diversity"
        ]
      },
      {
        name: "English",
        iconName: "lang",
        color: "from-pink-500 to-rose-600",
        badgeColor: "text-pink-400 border-pink-500/30 bg-pink-500/10",
        topicsCount: 10,
        highYieldChapters: [
          "Who Did Patrick's Homework?",
          "How the Dog Found Himself a New Master!",
          "A House, A Home",
          "Paragraph Writing & Phonics"
        ]
      }
    ]
  }
];

function renderSubjectIcon(iconName: "flask" | "calc" | "globe" | "lang") {
  switch (iconName) {
    case "flask": return <FlaskConical className="w-4 h-4 text-white" />;
    case "calc": return <Calculator className="w-4 h-4 text-white" />;
    case "globe": return <Globe2 className="w-4 h-4 text-white" />;
    case "lang": return <Languages className="w-4 h-4 text-white" />;
    default: return <BookOpen className="w-4 h-4 text-white" />;
  }
}

export default function CurriculumSelector() {
  const [selectedGrade, setSelectedGrade] = useState<number>(10);
  const [selectedSubjectIndex, setSelectedSubjectIndex] = useState<number>(0);

  const currentClass = CURRICULUM_DATA.find((c) => c.grade === selectedGrade) || CURRICULUM_DATA[0];
  const activeSubject = currentClass.subjects[selectedSubjectIndex] || currentClass.subjects[0];

  return (
    <section 
      id="curriculum" 
      className="w-full max-w-6xl mx-auto px-4 sm:px-6 mb-32 relative z-20 scroll-mt-28"
      aria-label="CBSE Curriculum by Class"
    >
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.4 }}
        className="text-center mb-10"
      >
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 mb-5 shadow-[0_0_20px_rgba(6,182,212,0.2)]">
          <GraduationCap className="w-3.5 h-3.5 text-cyan-400" />
          <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-cyan-300">
            Tailored To Your Grade
          </span>
        </div>
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight">
          CBSE Curriculum for{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-indigo-400 to-purple-400">
            Every Standard
          </span>.
        </h2>
        <p className="text-slate-400 mt-4 max-w-xl mx-auto text-sm sm:text-base leading-relaxed">
          Switch your class to inspect high-yield NCERT chapters, sample exam blueprints, and personalized AI tutor modules.
        </p>
      </motion.div>

      {/* Class Selector Pills */}
      <div className="flex flex-wrap items-center justify-center gap-2.5 sm:gap-3 mb-8 sm:mb-10">
        {CURRICULUM_DATA.map((cls) => {
          const isSelected = selectedGrade === cls.grade;
          return (
            <button
              key={cls.grade}
              onClick={() => {
                setSelectedGrade(cls.grade);
                setSelectedSubjectIndex(0);
              }}
              className={`relative px-5 sm:px-6 py-2.5 rounded-full font-bold text-xs sm:text-sm transition-all duration-300 ${
                isSelected
                  ? "text-white shadow-[0_0_25px_rgba(99,102,241,0.4)]"
                  : "text-slate-400 bg-[#0c1026]/80 hover:text-white hover:bg-white/[0.08] border border-white/10"
              }`}
            >
              {isSelected && (
                <motion.div
                  layoutId="activeClassPill"
                  className="absolute inset-0 rounded-full bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600"
                  transition={{ type: "spring", stiffness: 350, damping: 28 }}
                />
              )}
              <span className="relative z-10 flex items-center gap-2">
                <span>{cls.label}</span>
                {cls.grade === 10 && (
                  <span className="hidden sm:inline-block px-1.5 py-0.2 text-[9px] font-extrabold uppercase bg-amber-400/20 text-amber-300 rounded border border-amber-400/40">
                    Boards
                  </span>
                )}
              </span>
            </button>
          );
        })}
      </div>

      {/* Curriculum Card Container */}
      <div className="relative bg-[#0c1026]/95 backdrop-blur-3xl border border-white/15 rounded-3xl p-6 sm:p-10 shadow-[0_25px_60px_rgba(0,0,0,0.75)] overflow-hidden">
        {/* Subtle top glare reflection */}
        <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/30 to-transparent pointer-events-none" />

        {/* Ambient glow */}
        <div className="absolute -top-32 -right-32 w-80 h-80 bg-indigo-600/15 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute -bottom-32 -left-32 w-80 h-80 bg-cyan-600/15 rounded-full blur-[100px] pointer-events-none" />

        {/* Class Banner Info */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/10 mb-8 relative z-10">
          <div>
            <div className="flex items-center gap-2.5 mb-1.5">
              <span className="text-xl sm:text-2xl font-black text-white">{currentClass.label}</span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/15 text-indigo-300 border border-indigo-500/30">
                {currentClass.badge}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-400 font-medium">
              {currentClass.tagline}
            </p>
          </div>

          <Link
            href="/ncert"
            className="self-start sm:self-auto inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] border border-white/10 text-xs font-bold text-white transition-all hover:scale-105 active:scale-95"
          >
            <BookOpen className="w-3.5 h-3.5 text-indigo-400" />
            <span>Open NCERT Reader</span>
            <ArrowRight className="w-3 h-3 text-slate-400" />
          </Link>
        </div>

        {/* Subject Switcher Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8 relative z-10">
          {currentClass.subjects.map((subj, idx) => {
            const isSubjActive = selectedSubjectIndex === idx;
            return (
              <button
                key={subj.name}
                onClick={() => setSelectedSubjectIndex(idx)}
                className={`relative text-left p-3.5 sm:p-4 rounded-2xl transition-all duration-200 border ${
                  isSubjActive
                    ? "bg-[#10163a] border-indigo-400/50 shadow-[0_0_20px_rgba(99,102,241,0.25)]"
                    : "bg-white/[0.03] border-white/[0.08] hover:bg-white/[0.06] hover:border-white/20"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className={`w-8 h-8 rounded-xl bg-gradient-to-br ${subj.color} flex items-center justify-center text-white shadow-md`}>
                    {renderSubjectIcon(subj.iconName)}
                  </div>
                  {isSubjActive && (
                    <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399] animate-pulse" />
                  )}
                </div>
                <h4 className="text-sm font-bold text-white mb-0.5">{subj.name}</h4>
                <p className="text-[11px] font-semibold text-slate-400">{subj.topicsCount} Key Units</p>
              </button>
            );
          })}
        </div>

        {/* Active Subject Chapters Display */}
        <AnimatePresence mode="wait">
          <motion.div
            key={`${currentClass.grade}-${activeSubject.name}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25 }}
            className="relative z-10"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Flame className="w-4 h-4 text-amber-400" />
                <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider">
                  High-Yield Board Chapters for {activeSubject.name}
                </h3>
              </div>
              <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${activeSubject.badgeColor}`}>
                AI Instant Tutor Ready
              </span>
            </div>

            {/* Chapters Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 mb-6">
              {activeSubject.highYieldChapters.map((chapter, i) => (
                <div
                  key={chapter}
                  className="group flex items-start gap-3 p-3.5 rounded-xl bg-white/[0.04] border border-white/[0.08] hover:border-indigo-500/30 hover:bg-white/[0.07] transition-all"
                >
                  <div className="w-6 h-6 rounded-lg bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center shrink-0 mt-0.5 text-[11px] font-extrabold text-indigo-300">
                    {i + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-white group-hover:text-indigo-200 transition-colors leading-snug">
                      {chapter}
                    </p>
                    <div className="flex items-center gap-2 mt-1.5">
                      <span className="text-[10px] text-slate-400 flex items-center gap-1">
                        <CheckCircle className="w-3 h-3 text-emerald-400" /> NCERT Notes
                      </span>
                      <span className="text-[10px] text-slate-400 flex items-center gap-1">
                        <Sparkles className="w-3 h-3 text-purple-400" /> Flashcards
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Action Bar */}
            <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-cyan-500/10 border border-white/10">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-indigo-600/20 border border-indigo-500/40 flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-indigo-300" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">Ask AI anything about {activeSubject.name}</h4>
                  <p className="text-[11px] text-slate-400">Get step-by-step NCERT solutions and conceptual derivations</p>
                </div>
              </div>

              <Link
                href="/tutor"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-bold text-xs shadow-md hover:shadow-indigo-500/25 transition-all hover:scale-105 active:scale-95"
              >
                <span>Launch {activeSubject.name} Tutor</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}
