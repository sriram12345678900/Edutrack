// EduTrack Bilingual i18n Translation Dictionary (English / Hindi / Hinglish)

export const TRANSLATIONS: Record<string, Record<string, string>> = {
  English: {
    dashboard: "Dashboard",
    todaysFocus: "Today's Focus",
    exploreAiLabs: "Explore AI & Labs",
    classroomProgress: "Classroom & Progress",
    aiTutor: "AI Tutor",
    studyHub: "Study Hub",
    flashcards: "Flashcards",
    whiteboard: "Whiteboard",
    pomodoro: "Focus Timer",
    arena: "Multiplayer Arena",
    peerTeaching: "Peer Teaching",
    startStudying: "Start Studying",
    dailyQuestion: "Daily Challenge Question",
    surpriseMe: "Surprise Me",
    streak: "Streak",
    level: "Level",
    points: "Points",
  },
  Hindi: {
    dashboard: "डैशबोर्ड",
    todaysFocus: "आज का लक्ष्य",
    exploreAiLabs: "एआई लैब्स खोजें",
    classroomProgress: "कक्षा और प्रगति",
    aiTutor: "एआई शिक्षक",
    studyHub: "अध्ययन केंद्र",
    flashcards: "फ्लैशकार्ड्स",
    whiteboard: "व्हाइटबोर्ड",
    pomodoro: "फोकस टाइमर",
    arena: "प्रतियोगी अखाड़ा",
    peerTeaching: "सहपाठी शिक्षण",
    startStudying: "पढ़ाई शुरू करें",
    dailyQuestion: "दैनिक चुनौती प्रश्न",
    surpriseMe: "मुझे सुझाव दें",
    streak: "लगातार दिन",
    level: "स्तर",
    points: "अंक",
  },
  Hinglish: {
    dashboard: "Dashboard",
    todaysFocus: "Aaj Ka Focus",
    exploreAiLabs: "Explore AI Labs",
    classroomProgress: "Classroom & Progress",
    aiTutor: "AI Tutor",
    studyHub: "Study Hub",
    flashcards: "Flashcards",
    whiteboard: "Whiteboard",
    pomodoro: "Focus Timer",
    arena: "Quiz Arena",
    peerTeaching: "Peer Teaching",
    startStudying: "Padhai Shuru Karein",
    dailyQuestion: "Aaj Ka Challenge",
    surpriseMe: "Surprise Me",
    streak: "Streak",
    level: "Level",
    points: "XP Points",
  }
};

export function t(key: string, lang = "English"): string {
  const dict = TRANSLATIONS[lang] || TRANSLATIONS["English"];
  return dict[key] || TRANSLATIONS["English"][key] || key;
}
