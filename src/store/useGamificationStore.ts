import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { getOrInitializeMissions } from '@/lib/xp';

export interface Mission {
  id: string;
  title: string;
  desc: string;
  xp: number;
  completed: boolean;
}

interface GamificationState {
  xp: number;
  level: number;
  streak: number;
  missions: Mission[];
  questsCelebratedToday: string | null;
  awardXP: (amount: number) => { newXp: number, newLevel: number, leveledUp: boolean };
  completeMission: (id: string) => void;
  setQuestsCelebratedToday: (dateStr: string) => void;
  incrementStreak: () => void;
  initializeMissions: () => void;
}

export const useGamificationStore = create<GamificationState>()(
  persist(
    (set, get) => ({
      xp: 0,
      level: 1,
      streak: 7,
      missions: [],
      questsCelebratedToday: null,
      
      initializeMissions: () => {
        if (typeof window !== 'undefined') {
          const initialMissions = getOrInitializeMissions();
          set({ missions: initialMissions });
        }
      },

      awardXP: (amount) => {
        const currentXp = get().xp;
        const currentLevel = get().level;
        
        const nextLevelXp = currentLevel * 200;
        let newXp = currentXp + amount;
        let newLevel = currentLevel;
        let leveledUp = false;

        if (newXp >= nextLevelXp) {
          newXp -= nextLevelXp;
          newLevel += 1;
          leveledUp = true;
        }

        set({ xp: newXp, level: newLevel });
        return { newXp, newLevel, leveledUp };
      },

      completeMission: (id) => {
        set((state) => ({
          missions: state.missions.map(m => 
            m.id === id ? { ...m, completed: true } : m
          )
        }));
      },

      setQuestsCelebratedToday: (dateStr) => {
        set({ questsCelebratedToday: dateStr });
      },

      incrementStreak: () => {
        set((state) => ({ streak: state.streak + 1 }));
      }
    }),
    {
      name: 'edutrack-gamification-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
