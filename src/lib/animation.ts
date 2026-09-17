import type { Variants, Transition } from "framer-motion";

/**
 * Mobile-optimized transitions (springy and responsive, low overhead)
 */
export const springTransition: Transition = {
  type: "spring",
  stiffness: 350,
  damping: 30,
};

export const quickTransition: Transition = {
  duration: 0.18,
  ease: [0.16, 1, 0.3, 1],
};

/**
 * Fade-in-up variant for list items & cards
 */
export const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.22,
      ease: "easeOut",
    },
  },
};

/**
 * Bottom-sheet / mobile drawer slide up variant
 */
export const bottomSheetVariants: Variants = {
  hidden: {
    y: "100%",
    opacity: 0.8,
    transition: {
      type: "spring",
      damping: 35,
      stiffness: 350,
    },
  },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: "spring",
      damping: 30,
      stiffness: 320,
    },
  },
  exit: {
    y: "100%",
    opacity: 0.6,
    transition: {
      duration: 0.2,
      ease: "easeInOut",
    },
  },
};

/**
 * Standard touch feedback for buttons and cards
 */
export const tapFeedback = {
  scale: 0.96,
  transition: { duration: 0.1 },
};

export const subtleTapFeedback = {
  scale: 0.98,
  transition: { duration: 0.1 },
};
