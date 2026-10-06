import { Capacitor } from '@capacitor/core';

export interface LockscreenMCQ {
  id: string;
  question: string;
  subject: 'Science' | 'Mathematics' | 'Social Science';
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface StudyAlarm {
  id: string;
  time: string; // "HH:MM" 24h
  label: string;
  enabled: boolean;
  days: number[]; // 0=Sun, 1=Mon, ..., 6=Sat
  requiresMCQToDismiss: boolean;
}

export const RAPID_FIRE_CBSE_MCQS: LockscreenMCQ[] = [
  {
    id: 'mcq-1',
    question: 'What is the chemical formula of Plaster of Paris?',
    subject: 'Science',
    options: ['CaSO₄ · 2H₂O', 'CaSO₄ · ½H₂O', 'CaCO₃ · H₂O', 'CaCl₂ · 2H₂O'],
    correctIndex: 1,
    explanation: 'Plaster of Paris is Calcium Sulphate Hemihydrate (CaSO₄ · ½H₂O).'
  },
  {
    id: 'mcq-2',
    question: 'In the human eye, where is the image of an object focused?',
    subject: 'Science',
    options: ['Cornea', 'Iris', 'Retina', 'Ciliary muscles'],
    correctIndex: 2,
    explanation: 'The crystalline lens focuses real and inverted light rays directly onto the retina.'
  },
  {
    id: 'mcq-3',
    question: 'If the discriminant b² - 4ac > 0 and not a perfect square, the roots of the quadratic equation are:',
    subject: 'Mathematics',
    options: ['Real and equal', 'Real, unequal and irrational', 'Complex and imaginary', 'Zero'],
    correctIndex: 1,
    explanation: 'When D > 0 and not a square, the quadratic formula yields two distinct real irrational roots.'
  },
  {
    id: 'mcq-4',
    question: 'Which gas is evolved when zinc granules react with dilute sulphuric acid?',
    subject: 'Science',
    options: ['Oxygen (O₂)', 'Carbon dioxide (CO₂)', 'Hydrogen (H₂)', 'Sulphur dioxide (SO₂)'],
    correctIndex: 2,
    explanation: 'Zn + H₂SO₄ → ZnSO₄ + H₂↑ (burns with a characteristic pop sound).'
  },
  {
    id: 'mcq-5',
    question: 'The lengths of tangents drawn from an external point to a circle are:',
    subject: 'Mathematics',
    options: ['Unequal', 'Equal', 'Perpendicular', 'Parallel'],
    correctIndex: 1,
    explanation: 'By CBSE Class 10 Theorem 10.2, tangents drawn from an external point to a circle are equal (PA = PB).'
  },
  {
    id: 'mcq-6',
    question: 'What is the SI unit of electric potential difference (Voltage)?',
    subject: 'Science',
    options: ['Ampere (A)', 'Ohm (Ω)', 'Volt (V)', 'Watt (W)'],
    correctIndex: 2,
    explanation: 'Potential difference is measured in Volts (V = Work / Charge = Joules / Coulomb).'
  }
];

class AlarmManagerService {
  private alarmsKey = 'edutrack_study_alarms';
  private audioCtx: AudioContext | null = null;
  private oscillator: OscillatorNode | null = null;
  private gainNode: GainNode | null = null;
  private isAlarmRinging = false;

  constructor() {
    if (typeof window !== 'undefined') {
      this.initAlarmWatcher();
    }
  }

  // Retrieve saved alarms
  public getAlarms(): StudyAlarm[] {
    if (typeof window === 'undefined') return [];
    try {
      const data = localStorage.getItem(this.alarmsKey);
      if (!data) {
        // Seed default 6:00 AM Class 10 Board Alarm
        const defaultAlarms: StudyAlarm[] = [
          {
            id: 'alarm_default_1',
            time: '06:00',
            label: 'CBSE Class 10 Morning Revision',
            enabled: true,
            days: [1, 2, 3, 4, 5, 6],
            requiresMCQToDismiss: true
          }
        ];
        this.saveAlarms(defaultAlarms);
        return defaultAlarms;
      }
      return JSON.parse(data);
    } catch {
      return [];
    }
  }

  public saveAlarms(alarms: StudyAlarm[]): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(this.alarmsKey, JSON.stringify(alarms));
  }

  public addAlarm(alarm: Omit<StudyAlarm, 'id'>): StudyAlarm {
    const alarms = this.getAlarms();
    const newAlarm: StudyAlarm = {
      ...alarm,
      id: `alarm_${Date.now()}`
    };
    alarms.push(newAlarm);
    this.saveAlarms(alarms);
    return newAlarm;
  }

  public toggleAlarm(id: string): void {
    const alarms = this.getAlarms();
    const updated = alarms.map(a => a.id === id ? { ...a, enabled: !a.enabled } : a);
    this.saveAlarms(updated);
  }

  public deleteAlarm(id: string): void {
    const alarms = this.getAlarms().filter(a => a.id !== id);
    this.saveAlarms(alarms);
  }

  public getRandomChallenge(): LockscreenMCQ {
    const idx = Math.floor(Math.random() * RAPID_FIRE_CBSE_MCQS.length);
    return RAPID_FIRE_CBSE_MCQS[idx];
  }

  // Synthesized pulsating wake-up siren via Web Audio API
  public startAlarmSound(): void {
    if (this.isAlarmRinging) return;
    this.isAlarmRinging = true;

    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.audioCtx = new AudioCtx();
      this.gainNode = this.audioCtx.createGain();
      this.gainNode.gain.setValueAtTime(0.3, this.audioCtx.currentTime);
      this.gainNode.connect(this.audioCtx.destination);

      this.oscillator = this.audioCtx.createOscillator();
      this.oscillator.type = 'triangle';
      this.oscillator.frequency.setValueAtTime(880, this.audioCtx.currentTime); // A5

      // Pulsing frequency alarm modulation
      const now = this.audioCtx.currentTime;
      for (let i = 0; i < 60; i++) {
        this.oscillator.frequency.setValueAtTime(880, now + i * 0.8);
        this.oscillator.frequency.setValueAtTime(1200, now + i * 0.8 + 0.4);
      }

      this.oscillator.connect(this.gainNode);
      this.oscillator.start();
    } catch (err) {
      console.warn('AudioContext alarm autoplay restricted:', err);
    }
  }

  public stopAlarmSound(): void {
    if (!this.isAlarmRinging) return;
    this.isAlarmRinging = false;
    try {
      if (this.oscillator) {
        this.oscillator.stop();
        this.oscillator.disconnect();
        this.oscillator = null;
      }
      if (this.gainNode) {
        this.gainNode.disconnect();
        this.gainNode = null;
      }
      if (this.audioCtx) {
        this.audioCtx.close();
        this.audioCtx = null;
      }
    } catch (err) {
      console.error('Error stopping alarm sound:', err);
    }
  }

  public isNative(): boolean {
    return Capacitor.isNativePlatform();
  }

  // Periodic watcher checking every 15 seconds if an active alarm matches current HH:MM
  private initAlarmWatcher(): void {
    setInterval(() => {
      const now = new Date();
      const currentHours = String(now.getHours()).padStart(2, '0');
      const currentMinutes = String(now.getMinutes()).padStart(2, '0');
      const currentTimeStr = `${currentHours}:${currentMinutes}`;
      const currentDay = now.getDay();

      const alarms = this.getAlarms();
      const matchingAlarm = alarms.find(a => 
        a.enabled && 
        a.time === currentTimeStr && 
        a.days.includes(currentDay)
      );

      if (matchingAlarm && !this.isAlarmRinging) {
        window.dispatchEvent(new CustomEvent('edutrack:alarm-triggered', { detail: matchingAlarm }));
        this.startAlarmSound();
      }
    }, 15000);
  }
}

export const nativeAlarmService = new AlarmManagerService();
