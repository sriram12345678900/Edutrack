const Presentation = require('pptxgenjs');

// Create a new presentation
const pptx = new Presentation();

// Use LAYOUT_WIDE which is 13.33" x 7.5" (standard widescreen slide dimensions)
pptx.layout = 'LAYOUT_WIDE';

// Define theme colors
const COLORS = {
  bg: '03050C',         // App dark background
  cardBg: '0C0F1D',     // Glassmorphic card fill
  border: '252B44',     // Premium card border
  textTitle: 'FFFFFF',  // Primary title text
  textBody: '94A3B8',   // Secondary body text
  accentIndigo: '6366F1', // Primary brand indigo
  accentEmerald: '10B981', // Secondary brand emerald
  accentAmber: 'F59E0B'    // Yellow/Amber accent
};

// Helper to add standard header to content slides
function addHeader(slide, titleText) {
  // Title
  slide.addText(titleText, {
    x: 0.5, y: 0.4, w: 9.0, h: 0.6,
    fontSize: 28, bold: true, color: COLORS.textTitle,
    fontFace: 'Arial'
  });
  // Premium bottom border line
  slide.addShape(pptx.shapes.RECTANGLE, {
    x: 0.5, y: 1.1, w: 12.33, h: 0.02,
    fill: { color: COLORS.accentIndigo }
  });
}

// ----------------------------------------------------
// SLIDE 1: Title Slide
// ----------------------------------------------------
const slide1 = pptx.addSlide();
slide1.background = { color: COLORS.bg };

// Corner accents using ISOSCELES_TRIANGLE
slide1.addShape(pptx.shapes.ISOSCELES_TRIANGLE, {
  x: -0.5, y: -0.5, w: 2.5, h: 2.5,
  fill: { color: COLORS.accentIndigo }, opacity: 15,
  flipV: true
});
slide1.addShape(pptx.shapes.ISOSCELES_TRIANGLE, {
  x: 11.33, y: 5.5, w: 2.5, h: 2.5,
  fill: { color: COLORS.accentEmerald }, opacity: 15,
  flipH: true
});

// Title & Subtitle block
slide1.addText("Basic Details of the Team and\nProblem Statement", {
  x: 0.8, y: 1.8, w: 11.5, h: 1.6,
  fontSize: 36, bold: true, color: COLORS.textTitle,
  fontFace: 'Arial', align: 'left'
});

// Horizontal line divider
slide1.addShape(pptx.shapes.RECTANGLE, {
  x: 0.8, y: 3.5, w: 5.0, h: 0.05,
  fill: { color: COLORS.accentIndigo }
});

// Info fields
const details = [
  { label: "Problem Statement Chosen", val: "Personalized Learning and Adaptive Education" },
  { label: "Class", val: "10" },
  { label: "Project Name", val: "EduTrack" },
  { label: "Team Leader Name", val: "Suwrat Korgaonkar" },
  { label: "School Name", val: "Bal Bharati Public School, Navi Mumbai" }
];

details.forEach((item, index) => {
  const yOffset = 3.8 + (index * 0.45);
  // Label
  slide1.addText(item.label + " : ", {
    x: 0.8, y: yOffset, w: 3.2, h: 0.4,
    fontSize: 16, bold: true, color: COLORS.accentIndigo,
    fontFace: 'Arial'
  });
  // Value
  slide1.addText(item.val, {
    x: 4.0, y: yOffset, w: 8.0, h: 0.4,
    fontSize: 16, bold: true, color: COLORS.textTitle,
    fontFace: 'Arial'
  });
});


// ----------------------------------------------------
// SLIDE 2: Describe your idea/Solution/Prototype
// ----------------------------------------------------
const slide2 = pptx.addSlide();
slide2.background = { color: COLORS.bg };
addHeader(slide2, "Describe your Idea / Solution / Prototype");

// Left column: Problem
slide2.addText("The Problem", {
  x: 0.5, y: 1.5, w: 5.5, h: 0.4,
  fontSize: 20, bold: true, color: COLORS.accentAmber,
  fontFace: 'Arial'
});
slide2.addText(
  "• CBSE students face extreme cognitive overload from jumping between disjointed study tools (textbook readers, timers, flashcard tools, group chats, test engines).\n\n" +
  "• Core learning materials (NCERT books) are static, lacking adaptive explanations or native translation support (Hinglish/English toggle).\n\n" +
  "• Revision lacks systematic feedback—students rarely use spacing techniques like Leitner boxes for active memory recall.",
  {
    x: 0.5, y: 2.0, w: 5.8, h: 4.6,
    fontSize: 13, color: COLORS.textBody,
    fontFace: 'Arial', lineSpacing: 22
  }
);

// Right column: Solution (Card background)
slide2.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
  x: 6.8, y: 1.4, w: 6.0, h: 5.2,
  fill: { color: COLORS.cardBg },
  line: { color: COLORS.border, width: 1.5 }
});

slide2.addText("The EduTrack Solution", {
  x: 7.1, y: 1.7, w: 5.4, h: 0.4,
  fontSize: 20, bold: true, color: COLORS.accentEmerald,
  fontFace: 'Arial'
});

slide2.addText(
  "• Unified Learning Space: Combines notes, AI flashcards, whiteboards, pomodoro, groups, and testing into one layout.\n\n" +
  "• Dynamic AI Textbook: Instantly simplifies textbook theories into readable, high-retention summaries with Hinglish language toggling.\n\n" +
  "• Spaced Leitner System: Automates box-based memory recall where students earn XP and level up as they master concepts.\n\n" +
  "• Real-Time peer StudyCircles: Encourages group work through secure, real-time message feeds and collaborative canvases.",
  {
    x: 7.1, y: 2.2, w: 5.4, h: 4.0,
    fontSize: 12, color: COLORS.textTitle,
    fontFace: 'Arial', lineSpacing: 20
  }
);


// ----------------------------------------------------
// SLIDE 3: Process Flow Chart
// ----------------------------------------------------
const slide3 = pptx.addSlide();
slide3.background = { color: COLORS.bg };
addHeader(slide3, "Process Flow Chart");

// Add 5 steps
const steps = [
  { num: "1", title: "Setup & Class Pick", desc: "User registers, sets class (6-10) and chooses Hinglish/English language preferences." },
  { num: "2", title: "Daily Study Path", desc: "AI maps chapters into steps. Workspace shows level dial, streaks, and active quests." },
  { num: "3", title: "Interactive Lab", desc: "Student reads simplified theory, generates revision sheets, and sketches on whiteboard." },
  { num: "4", title: "Leitner Spaced Cards", desc: "Promotes recall cards into higher Leitner boxes, automatically awarding XP on completion." },
  { num: "5", title: "StudyCircles & PYQs", desc: "Collabs in real-time chat circles, runs PYQ mock tests and receives detailed grading." }
];

steps.forEach((step, idx) => {
  const xPos = 0.5 + (idx * 2.5);
  
  // Card
  slide3.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
    x: xPos, y: 1.8, w: 2.3, h: 4.6,
    fill: { color: COLORS.cardBg },
    line: { color: COLORS.border, width: 1.5 }
  });

  // Step Number Badge
  slide3.addShape(pptx.shapes.OVAL, {
    x: xPos + 0.85, y: 1.3, w: 0.6, h: 0.6,
    fill: { color: COLORS.accentIndigo }
  });
  slide3.addText(step.num, {
    x: xPos + 0.85, y: 1.3, w: 0.6, h: 0.6,
    fontSize: 16, bold: true, color: 'FFFFFF',
    fontFace: 'Arial', align: 'center', valign: 'middle'
  });

  // Step Title
  slide3.addText(step.title, {
    x: xPos + 0.1, y: 2.1, w: 2.1, h: 0.5,
    fontSize: 13.5, bold: true, color: COLORS.textTitle,
    fontFace: 'Arial', align: 'center'
  });

  // Step Description
  slide3.addText(step.desc, {
    x: xPos + 0.1, y: 2.8, w: 2.1, h: 3.2,
    fontSize: 10.5, color: COLORS.textBody,
    fontFace: 'Arial', align: 'center', lineSpacing: 16
  });

  // Flow Arrow (except last)
  if (idx < 4) {
    slide3.addText("→", {
      x: xPos + 2.3, y: 3.5, w: 0.2, h: 0.5,
      fontSize: 22, bold: true, color: COLORS.accentIndigo,
      align: 'center'
    });
  }
});


// ----------------------------------------------------
// SLIDE 4: Describe your Technology Stack
// ----------------------------------------------------
const slide4 = pptx.addSlide();
slide4.background = { color: COLORS.bg };
addHeader(slide4, "Technology Stack");

const techStack = [
  { category: "Frontend Core", items: "React 18 / Next.js 14\nTypeScript\nTailwind CSS" },
  { category: "Interface & Animation", items: "Framer Motion\nLucide React Icons\nCustom CSS variables" },
  { category: "Backend Services", items: "Next.js App Router API Routes\nNode.js engine\nJSON Data caching" },
  { category: "Database & Live Solutions", items: "Firebase Auth\nCloud Firestore (Real-time)\nLiveKit (Video conferencing)" },
  { category: "AI Orchestration", items: "Gemini Pro / Flash models\nOpenRouter client integration\nStructured JSON Outputs" },
  { category: "Local Utilities & Cache", items: "localStorage persistence\nWindow CustomEvents\nSpaced-repetition Leitner box model" }
];

techStack.forEach((tech, idx) => {
  const row = Math.floor(idx / 3);
  const col = idx % 3;
  const xPos = 0.5 + (col * 4.2);
  const yPos = 1.5 + (row * 2.7);

  // Box
  slide4.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
    x: xPos, y: yPos, w: 3.9, h: 2.4,
    fill: { color: COLORS.cardBg },
    line: { color: COLORS.border, width: 1.5 }
  });

  // Category Title
  slide4.addText(tech.category, {
    x: xPos + 0.2, y: yPos + 0.2, w: 3.5, h: 0.4,
    fontSize: 15, bold: true, color: COLORS.accentIndigo,
    fontFace: 'Arial'
  });

  // Items
  slide4.addText(tech.items, {
    x: xPos + 0.2, y: yPos + 0.7, w: 3.5, h: 1.5,
    fontSize: 12, color: COLORS.textTitle,
    fontFace: 'Arial', lineSpacing: 18
  });
});


// ----------------------------------------------------
// SLIDE 5: Idea/Approach Details & USP
// ----------------------------------------------------
const slide5 = pptx.addSlide();
slide5.background = { color: COLORS.bg };
addHeader(slide5, "Idea / Approach Details & USP");

// Left Box: Technical Details
slide5.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
  x: 0.5, y: 1.5, w: 6.0, h: 5.2,
  fill: { color: COLORS.cardBg },
  line: { color: COLORS.border, width: 1.5 }
});
slide5.addText("Technical Architecture & Flow", {
  x: 0.8, y: 1.8, w: 5.4, h: 0.4,
  fontSize: 20, bold: true, color: COLORS.accentIndigo,
  fontFace: 'Arial'
});
slide5.addText(
  "• Modular Layout Architecture: Utilizes a shared SidebarLayout wrapper that handles route prefetching and automatic login/email-verification guards.\n\n" +
  "• State Synchronization: Employs React context for session storage, custom window event hooks (`edutrack_xp_updated`) for real-time XP updates, and Firebase snapshot listeners for real-time StudyCircles messaging.\n\n" +
  "• Local storage & Leitner Model: Client-side Leitner engine updates card boxes and resets daily quests automatically when a new day is detected.\n\n" +
  "• Generative Prompt Pipelines: Structures prompts to enforce CBSE guidelines, filtering out concepts (like the mole concept in basic classes) based on user profile.",
  {
    x: 0.8, y: 2.2, w: 5.4, h: 4.0,
    fontSize: 12, color: COLORS.textBody,
    fontFace: 'Arial', lineSpacing: 18
  }
);

// Right Box: Show Stopper / USP
slide5.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
  x: 6.8, y: 1.5, w: 6.0, h: 5.2,
  fill: { color: COLORS.cardBg },
  line: { color: COLORS.accentEmerald, width: 2 }
});
slide5.addText("Show Stopper / USP of Project", {
  x: 7.1, y: 1.8, w: 5.4, h: 0.4,
  fontSize: 22, bold: true, color: COLORS.accentEmerald,
  fontFace: 'Arial'
});
// Glow effect text / Big statement
slide5.addText(
  "The Unified CBSE Study Cockpit",
  {
    x: 7.1, y: 2.3, w: 5.4, h: 0.5,
    fontSize: 16, bold: true, color: 'FFFFFF',
    fontFace: 'Arial'
  }
);
slide5.addText(
  "Unlike existing tools that focus solely on videos, textbooks, or flashcards, EduTrack brings these together in a unified workspace:\n\n" +
  "1. AI tutor acts as an active companion, capable of adding flashcards directly into the student's Leitner boxes.\n\n" +
  "2. Progression is gamified—studying NCERT material, using flashcards, and taking PYQ tests automatically triggers XP awards, streaks, levels, and leaderboards.\n\n" +
  "3. StudyCircles integrate interactive sketching and text feeds, turning isolated studying into an online collaborative experience.",
  {
    x: 7.1, y: 2.8, w: 5.4, h: 3.6,
    fontSize: 12, color: COLORS.textTitle,
    fontFace: 'Arial', lineSpacing: 18
  }
);


// ----------------------------------------------------
// SLIDE 6: Team Member Details
// ----------------------------------------------------
const slide6 = pptx.addSlide();
slide6.background = { color: COLORS.bg };
addHeader(slide6, "Team Member Details");

// Define team data
const teamHeaders = [
  { text: "SL", options: { bold: true, color: 'FFFFFF', fill: { color: '4B5563' } } },
  { text: "Roll No", options: { bold: true, color: 'FFFFFF', fill: { color: '4B5563' } } },
  { text: "Name", options: { bold: true, color: 'FFFFFF', fill: { color: '4B5563' } } },
  { text: "Class/Section", options: { bold: true, color: 'FFFFFF', fill: { color: '4B5563' } } },
  { text: "Gender", options: { bold: true, color: 'FFFFFF', fill: { color: '4B5563' } } },
  { text: "Email Address", options: { bold: true, color: 'FFFFFF', fill: { color: '4B5563' } } }
];

const teamRows = [
  ["1", "40", "Suwrat Korgaonkar (Leader)", "10 C", "Male", "suwratkorg@gmail.com / 904263@nm.balbharati.org"],
  ["2", "41", "Suryansh Gupta", "10 C", "Male", "907685@nm.balbharati.org"],
  ["3", "02", "Abhimanyu Mukherjee", "10 C", "Male", "903974@nm.balbharati.org"],
  ["4", "44", "Revanth Vutukuru", "10 D", "Male", "Revanth.vutu09@gmail.com / 903878@nm.balbharati.org"]
];

// Combine headers & rows
const tableData = [
  teamHeaders.map(h => ({ text: h.text, options: h.options })),
  ...teamRows.map(row => row.map(cell => ({ 
    text: cell, 
    options: { color: COLORS.textTitle, fill: { color: COLORS.cardBg } } 
  })))
];

slide6.addTable(tableData, {
  x: 0.5, y: 1.6, w: 12.33, h: 4.2,
  colW: [0.8, 1.2, 3.2, 1.5, 1.2, 4.43],
  border: { color: COLORS.border, pt: 1 },
  fontFace: 'Arial',
  fontSize: 12,
  align: 'center',
  valign: 'middle'
});

// Additional text note
slide6.addText("School: Bal Bharati Public School, Navi Mumbai (Class 10 Student Team)", {
  x: 0.5, y: 6.3, w: 12.33, h: 0.4,
  fontSize: 14, bold: true, color: COLORS.accentIndigo,
  fontFace: 'Arial', align: 'center'
});


// ----------------------------------------------------
// SLIDE 7: Demo Video
// ----------------------------------------------------
const slide7 = pptx.addSlide();
slide7.background = { color: COLORS.bg };
addHeader(slide7, "Demo Video");

// Mock player shape
slide7.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
  x: 1.5, y: 1.5, w: 10.33, h: 4.8,
  fill: { color: COLORS.cardBg },
  line: { color: COLORS.border, width: 2 }
});

// Mock screen contents description
slide7.addText("EduTrack Portal Demo Video Showcase", {
  x: 2.0, y: 1.7, w: 9.33, h: 0.4,
  fontSize: 20, bold: true, color: COLORS.textTitle,
  fontFace: 'Arial', align: 'center'
});

// Video frame placeholder box
slide7.addShape(pptx.shapes.RECTANGLE, {
  x: 2.5, y: 2.3, w: 8.33, h: 3.2,
  fill: { color: '03050C' },
  line: { color: COLORS.accentIndigo, width: 1.5 }
});

// Play button in center
slide7.addShape(pptx.shapes.OVAL, {
  x: 6.16, y: 3.4, w: 1.0, h: 1.0,
  fill: { color: COLORS.accentIndigo }
});
slide7.addShape(pptx.shapes.RIGHT_TRIANGLE, {
  x: 6.56, y: 3.65, w: 0.3, h: 0.5,
  fill: { color: 'FFFFFF' }
});

slide7.addText("Interactive Walkthrough Highlights:\nDashboard Navigation • Dynamic AI Textbook Hinglish Explanations • Leitner Box Recalls • Peer Chat", {
  x: 2.5, y: 5.6, w: 8.33, h: 0.5,
  fontSize: 12, color: COLORS.textBody,
  fontFace: 'Arial', align: 'center', lineSpacing: 16
});


// ----------------------------------------------------
// SLIDE 8: Key Code Highlight
// ----------------------------------------------------
const slide8 = pptx.addSlide();
slide8.background = { color: COLORS.bg };
addHeader(slide8, "Key Code Highlight");

// Left side: Code container
slide8.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
  x: 0.5, y: 1.5, w: 7.2, h: 5.2,
  fill: { color: '010206' },
  line: { color: COLORS.border, width: 1.5 }
});

const codeText = 
  "// src/lib/xp.ts - Core XP & Gamification Engine\n" +
  "export function awardUserXP(amount: number): { newXp: number; newLevel: number; leveledUp: boolean } {\n" +
  "  if (typeof window === \"undefined\") return { newXp: 0, newLevel: 1, leveledUp: false };\n" +
  "  let xp = parseInt(localStorage.getItem(\"edutrack_xp\") || \"0\", 10);\n" +
  "  let level = parseInt(localStorage.getItem(\"edutrack_level\") || \"1\", 10);\n" +
  "  \n" +
  "  let newXp = xp + amount;\n" +
  "  let nextLvlThreshold = level * 200;\n" +
  "  let newLvl = level;\n" +
  "  let leveledUp = false;\n" +
  "\n" +
  "  while (newXp >= nextLvlThreshold) {\n" +
  "    newXp -= nextLvlThreshold;\n" +
  "    newLvl += 1;\n" +
  "    nextLvlThreshold = newLvl * 200;\n" +
  "    leveledUp = true;\n" +
  "  }\n" +
  "  localStorage.setItem(\"edutrack_xp\", newXp.toString());\n" +
  "  localStorage.setItem(\"edutrack_level\", newLvl.toString());\n" +
  "\n" +
  "  // Broadcast custom event to sync layouts instantly\n" +
  "  window.dispatchEvent(new CustomEvent(\"edutrack_xp_updated\", { detail: { xp: newXp, level: newLvl } }));\n" +
  "  return { newXp, newLevel: newLvl, leveledUp };\n" +
  "}";

slide8.addText(codeText, {
  x: 0.7, y: 1.7, w: 6.8, h: 4.7,
  fontSize: 10.5, color: 'D4D4D8', // tailwind zinc-300
  fontFace: 'Courier New',
  lineSpacing: 13
});

// Right side: Explanation box
slide8.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
  x: 8.0, y: 1.5, w: 4.83, h: 5.2,
  fill: { color: COLORS.cardBg },
  line: { color: COLORS.border, width: 1.5 }
});

slide8.addText("Feature Implementation Details", {
  x: 8.2, y: 1.8, w: 4.4, h: 0.4,
  fontSize: 18, bold: true, color: COLORS.accentIndigo,
  fontFace: 'Arial'
});

slide8.addText(
  "• Unified XP progression: Calculates levels dynamically with threshold multipliers ($L \\times 200$ XP per level).\n\n" +
  "• Client-side broadcast: Dispatches a CustomEvent (`edutrack_xp_updated`) to standard browsers, notifying sidebar layouts, dashboards, and profile components to reactively scale progress bars.\n\n" +
  "• Persistent Storage: Backed by browser local storage keys to ensure XP logs and Daily Streak history survive tab reloads without requiring continuous database hits.\n\n" +
  "• Modular Hook wrapper: Easily callable in NCERT textbooks (+50 XP), flashcard spaced review box promotions (+15 XP), or PYQ assessments.",
  {
    x: 8.2, y: 2.2, w: 4.4, h: 4.0,
    fontSize: 11.5, color: COLORS.textTitle,
    fontFace: 'Arial', lineSpacing: 18
  }
);


// Save the presentation
const presPath = 'Submission/EduTrack_Presentation_Fixed.pptx';
pptx.writeFile({ fileName: presPath })
  .then(fileName => {
    console.log(`Presentation generated successfully at: ${fileName}`);
  })
  .catch(err => {
    console.error('Error generating presentation:', err);
  });
