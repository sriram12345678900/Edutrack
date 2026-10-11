// EduTrack Night Study Mode Engine
// Auto-detects 21:00 - 06:00 window, applies warm comfort filter and gentle bedtime reminders.

export interface NightModeConfig {
  enabled: boolean;
  startHour: number; // e.g. 21 (9 PM)
  endHour: number;   // e.g. 6 (6 AM)
  temperature: "warm" | "deep-warm" | "amber";
  bedtimeReminder: boolean;
}

export const DEFAULT_NIGHT_CONFIG: NightModeConfig = {
  enabled: true,
  startHour: 21,
  endHour: 6,
  temperature: "warm",
  bedtimeReminder: true,
};

export function getNightModeConfig(): NightModeConfig {
  if (typeof window === "undefined") return DEFAULT_NIGHT_CONFIG;
  try {
    const raw = localStorage.getItem("edutrack_night_mode_config");
    return raw ? { ...DEFAULT_NIGHT_CONFIG, ...JSON.parse(raw) } : DEFAULT_NIGHT_CONFIG;
  } catch {
    return DEFAULT_NIGHT_CONFIG;
  }
}

export function saveNightModeConfig(config: NightModeConfig) {
  if (typeof window === "undefined") return;
  localStorage.setItem("edutrack_night_mode_config", JSON.stringify(config));
  window.dispatchEvent(new CustomEvent("edutrack_night_mode_toggle", { detail: config }));
}

export function isCurrentlyNightTime(config = getNightModeConfig()): boolean {
  if (!config.enabled) return false;
  const currentHour = new Date().getHours();
  if (config.startHour > config.endHour) {
    // Over midnight (e.g. 21:00 to 06:00)
    return currentHour >= config.startHour || currentHour < config.endHour;
  }
  return currentHour >= config.startHour && currentHour < config.endHour;
}
