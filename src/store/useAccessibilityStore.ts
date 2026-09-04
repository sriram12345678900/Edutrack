import { create } from "zustand";

interface AccessibilityState {
  bionicMode: boolean;
  highContrast: boolean;
  dyslexicFont: boolean;
  islSubtitles: boolean;
  udidVerified: boolean;
  udidDetails: { name: string; id: string; category: string } | null;
  toggleBionicMode: () => void;
  toggleHighContrast: () => void;
  toggleDyslexicFont: () => void;
  toggleIslSubtitles: () => void;
  verifyUdid: (name: string, id: string, category: string) => void;
  clearUdid: () => void;
  initialize: () => void;
}

export const useAccessibilityStore = create<AccessibilityState>((set, get) => ({
  bionicMode: false,
  highContrast: false,
  dyslexicFont: false,
  islSubtitles: false,
  udidVerified: false,
  udidDetails: null,

  initialize: () => {
    if (typeof window === "undefined") return;
    try {
      const bionic = localStorage.getItem("edutrack_acc_bionic") === "true";
      const contrast = localStorage.getItem("edutrack_acc_contrast") === "true";
      const dyslexic = localStorage.getItem("edutrack_acc_dyslexic") === "true";
      const isl = localStorage.getItem("edutrack_acc_isl") === "true";
      
      const udidVerified = localStorage.getItem("edutrack_acc_udid_verified") === "true";
      const rawDetails = localStorage.getItem("edutrack_acc_udid_details");
      const udidDetails = rawDetails ? JSON.parse(rawDetails) : null;

      // Apply classes to root element
      if (contrast) {
        document.documentElement.classList.add("high-contrast");
      } else {
        document.documentElement.classList.remove("high-contrast");
      }

      if (dyslexic) {
        document.documentElement.classList.add("font-dyslexic");
      } else {
        document.documentElement.classList.remove("font-dyslexic");
      }

      set({
        bionicMode: bionic,
        highContrast: contrast,
        dyslexicFont: dyslexic,
        islSubtitles: isl,
        udidVerified,
        udidDetails
      });
    } catch (e) {
      console.warn("Failed to load accessibility settings:", e);
    }
  },

  toggleBionicMode: () => {
    const next = !get().bionicMode;
    localStorage.setItem("edutrack_acc_bionic", String(next));
    set({ bionicMode: next });
  },

  toggleHighContrast: () => {
    const next = !get().highContrast;
    localStorage.setItem("edutrack_acc_contrast", String(next));
    if (typeof window !== "undefined") {
      if (next) {
        document.documentElement.classList.add("high-contrast");
      } else {
        document.documentElement.classList.remove("high-contrast");
      }
    }
    set({ highContrast: next });
  },

  toggleDyslexicFont: () => {
    const next = !get().dyslexicFont;
    localStorage.setItem("edutrack_acc_dyslexic", String(next));
    if (typeof window !== "undefined") {
      if (next) {
        document.documentElement.classList.add("font-dyslexic");
      } else {
        document.documentElement.classList.remove("font-dyslexic");
      }
    }
    set({ dyslexicFont: next });
  },

  toggleIslSubtitles: () => {
    const next = !get().islSubtitles;
    localStorage.setItem("edutrack_acc_isl", String(next));
    set({ islSubtitles: next });
  },

  verifyUdid: (name: string, id: string, category: string) => {
    localStorage.setItem("edutrack_acc_udid_verified", "true");
    const details = { name, id, category };
    localStorage.setItem("edutrack_acc_udid_details", JSON.stringify(details));
    set({ udidVerified: true, udidDetails: details });
  },

  clearUdid: () => {
    localStorage.removeItem("edutrack_acc_udid_verified");
    localStorage.removeItem("edutrack_acc_udid_details");
    set({ udidVerified: false, udidDetails: null });
  }
}));
