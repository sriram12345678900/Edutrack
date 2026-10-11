// EduTrack Study Break Planner & Refreshment Engine

export interface BreakActivity {
  id: string;
  category: "stretch" | "breathing" | "puzzle" | "walk" | "eyes";
  title: string;
  durationMinutes: number;
  emoji: string;
  description: string;
  instructions: string[];
}

export const BREAK_ACTIVITIES: BreakActivity[] = [
  {
    id: "desk_stretch",
    category: "stretch",
    title: "Postural Spine & Neck Decompress",
    durationMinutes: 5,
    emoji: "🧘",
    description: "Relieve neck and thoracic stiffness accumulated from textbook reading.",
    instructions: [
      "Interlock fingers behind your head and gently press elbows back for 20 seconds.",
      "Slowly roll your neck in gentle clockwise circles for 30 seconds, then reverse.",
      "Stand tall, reach toward the ceiling, then touch your toes holding for 15 seconds.",
      "Finish with 3 deep shoulder rolls backward."
    ]
  },
  {
    id: "box_breathing",
    category: "breathing",
    title: "4-4-4-4 Pranayama Box Breathing",
    durationMinutes: 3,
    emoji: "🌬️",
    description: "Resets cortisol and replenishes oxygen saturation to prefrontal cortex.",
    instructions: [
      "Inhale deeply through your nose for 4 seconds.",
      "Hold your breath gently with lungs full for 4 seconds.",
      "Slowly exhale through mouth for 4 seconds.",
      "Hold with lungs empty for 4 seconds.",
      "Repeat for 4 full cycles."
    ]
  },
  {
    id: "lateral_puzzle",
    category: "puzzle",
    title: "Micro-Lateral Thinking Riddle",
    durationMinutes: 3,
    emoji: "🧩",
    description: "Activates divergent neural pathways before returning to convergent study.",
    instructions: [
      "Riddle: A scientist discovered that a certain amoeba divides into two every minute. At 12:00 PM, a beaker had 1 amoeba. At 1:00 PM, the beaker was full. At what time was it exactly half full?",
      "Take 60 seconds to visualize without looking up the answer.",
      "Answer: 12:59 PM! Because in the final minute, the half beaker doubles to fill completely!"
    ]
  },
  {
    id: "eyes_202020",
    category: "eyes",
    title: "20-20-20 Visual Refresh Rule",
    durationMinutes: 2,
    emoji: "👁️",
    description: "Eliminates ciliary muscle spasm from screen and book proximity.",
    instructions: [
      "Look away from any screen or book.",
      "Focus your gaze on an object at least 20 feet (6 meters) away.",
      "Keep your gaze relaxed on this distant point for at least 20 seconds.",
      "Blink slowly 10 times to naturally rehydrate corneal moisture."
    ]
  },
  {
    id: "hydration_walk",
    category: "walk",
    title: "Glass of Water & Balcony Stroll",
    durationMinutes: 5,
    emoji: "🚶",
    description: "Get moving, rehydrate, and recalibrate your mental clarity.",
    instructions: [
      "Step away from your desk completely.",
      "Pour and slowly drink a full tall glass of fresh water.",
      "Step onto a balcony or by a window to take in fresh air.",
      "Stretch your calves before returning to your study desk."
    ]
  }
];

export function getRandomBreakActivity(): BreakActivity {
  return BREAK_ACTIVITIES[Math.floor(Math.random() * BREAK_ACTIVITIES.length)];
}
