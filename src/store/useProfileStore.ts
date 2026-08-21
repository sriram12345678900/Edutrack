import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface ProfileState {
  userClass: number;
  userLanguage: string;
  nickname: string;
  setUserClass: (cls: number) => void;
  setUserLanguage: (lang: string) => void;
  setNickname: (nick: string) => void;
}

export const useProfileStore = create<ProfileState>()(
  persist(
    (set) => ({
      userClass: 10,
      userLanguage: 'Hinglish',
      nickname: '',
      setUserClass: (cls) => set({ userClass: cls }),
      setUserLanguage: (lang) => set({ userLanguage: lang }),
      setNickname: (nick) => set({ nickname: nick }),
    }),
    {
      name: 'edutrack-profile-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
