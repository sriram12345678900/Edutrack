// EduTrack Offline IndexedDB Storage Engine
// Provides zero-bandwidth offline caching for NCERT Study Packs and queues offline assessment attempts

export interface OfflineStudyPack {
  id: string;
  subject: 'Science' | 'Mathematics' | 'Social Science' | 'English';
  chapter: string;
  classLevel: number;
  downloadedAt: number;
  sizeKb: number;
  summary: string;
  keyFormulas: string[];
  keyDefinitions: { term: string; definition: string }[];
  practiceQuestions: { question: string; answer: string; marks: number }[];
}

export interface OfflineAttempt {
  id: string;
  quizId: string;
  score: number;
  total: number;
  timestamp: number;
  answers: Record<string, string>;
  synced: boolean;
}

const DB_NAME = 'edutrack_offline_db';
const DB_VERSION = 1;
const STORE_PACKS = 'study_packs';
const STORE_ATTEMPTS = 'offline_attempts';

export const DEFAULT_OFFLINE_PACKS: OfflineStudyPack[] = [
  {
    id: 'pack_sci_chem_rxn',
    subject: 'Science',
    chapter: 'Chemical Reactions and Equations',
    classLevel: 10,
    downloadedAt: Date.now(),
    sizeKb: 142,
    summary: 'A complete chemical equation represents reactants, products and physical states. Law of Conservation of Mass dictates balancing equations. Covers combination, decomposition, displacement, double displacement, redox, and corrosion/rancidity.',
    keyFormulas: [
      'CaO + H₂O → Ca(OH)₂ + Heat (Quicklime to Slaked Lime)',
      '2FeSO₄(s) --(Heat)--> Fe₂O₃(s) + SO₂(g) + SO₃(g)',
      'Zn(s) + CuSO₄(aq) → ZnSO₄(aq) + Cu(s) (Displacement)',
      'Na₂SO₄(aq) + BaCl₂(aq) → BaSO₄(s)↓ + 2NaCl(aq) (Double Displacement)'
    ],
    keyDefinitions: [
      { term: 'Exothermic Reaction', definition: 'Reactions in which heat is released along with the formation of products (e.g., respiration, burning of natural gas).' },
      { term: 'Redox Reaction', definition: 'A reaction where oxidation (loss of electrons / gain of O) and reduction (gain of electrons / loss of O) occur simultaneously.' },
      { term: 'Rancidity', definition: 'The oxidation of fats and oils in food left for a long time, causing change in smell and taste.' }
    ],
    practiceQuestions: [
      { question: 'Why should a magnesium ribbon be cleaned before burning in air?', answer: 'To remove the protective layer of basic magnesium carbonate (or oxide) formed by reaction with moist air.', marks: 2 },
      { question: 'Identify the substance oxidized and reduced: 4Na(s) + O₂(g) → 2Na₂O(s)', answer: 'Sodium (Na) is oxidized to Na₂O, and Oxygen (O₂) is reduced.', marks: 2 },
      { question: 'Write a balanced chemical equation with state symbols for: Barium chloride reacts with aluminium sulphate to give aluminium chloride and a precipitate of barium sulphate.', answer: '3BaCl₂(aq) + Al₂(SO₄)₃(aq) → 3BaSO₄(s)↓ + 2AlCl₃(aq)', marks: 3 }
    ]
  },
  {
    id: 'pack_sci_electricity',
    subject: 'Science',
    chapter: 'Electricity',
    classLevel: 10,
    downloadedAt: Date.now(),
    sizeKb: 185,
    summary: 'Electric current is the rate of flow of electric charges. Ohm’s Law states V = IR at constant temperature. Resistors can be connected in series or parallel. Joule’s Heating Law explains thermal power dissipation.',
    keyFormulas: [
      'I = Q / t (Current = Charge / Time)',
      'V = W / Q (Potential Difference = Work / Charge)',
      'V = I · R (Ohm\'s Law)',
      'R = ρ · (L / A) (Resistance & Resistivity)',
      'R_series = R₁ + R₂ + R₃',
      '1 / R_parallel = 1/R₁ + 1/R₂ + 1/R₃',
      'H = I² · R · t (Joule\'s Heating Effect)',
      'P = V · I = I² · R = V² / R'
    ],
    keyDefinitions: [
      { term: '1 Ampere', definition: 'Flow of 1 Coulomb of charge per second across a cross-section of a conductor.' },
      { term: '1 Volt', definition: 'Potential difference when 1 Joule of work is done to move a charge of 1 Coulomb.' },
      { term: 'Resistivity', definition: 'Characteristic property of a material measuring its intrinsic opposition to current flow, measured in Ohm-meters (Ω·m).' }
    ],
    practiceQuestions: [
      { question: 'Why are coils of electric toasters and electric irons made of an alloy rather than a pure metal?', answer: 'Alloys have higher resistivity than pure metals and do not oxidize (burn) easily at high temperatures.', marks: 2 },
      { question: 'Two resistors of 10 Ω and 20 Ω are connected in parallel to a 6 V battery. Calculate effective resistance and current through the battery.', answer: '1/R = 1/10 + 1/20 = 3/20 ⇒ R = 20/3 Ω ≈ 6.67 Ω. Total current I = V / R = 6 / (20/3) = 0.9 A.', marks: 3 }
    ]
  },
  {
    id: 'pack_math_quadratic',
    subject: 'Mathematics',
    chapter: 'Quadratic Equations',
    classLevel: 10,
    downloadedAt: Date.now(),
    sizeKb: 120,
    summary: 'A quadratic equation in variable x is of the form ax² + bx + c = 0, where a ≠ 0. Roots are found by factorisation or Quadratic Formula. The discriminant D = b² - 4ac determines nature of roots.',
    keyFormulas: [
      'Standard Form: ax² + bx + c = 0 (a ≠ 0)',
      'Quadratic Formula: x = [-b ± √(b² - 4ac)] / (2a)',
      'Discriminant: D = b² - 4ac',
      'If D > 0: Two distinct real roots',
      'If D = 0: Two equal real roots (-b / 2a)',
      'If D < 0: No real roots'
    ],
    keyDefinitions: [
      { term: 'Roots of Quadratic Equation', definition: 'Values of x that satisfy the equation ax² + bx + c = 0; geometrically, the x-intercepts of the parabola y = ax² + bx + c.' },
      { term: 'Discriminant', definition: 'The quantity b² - 4ac under the radical sign in the quadratic formula that dictates root nature.' }
    ],
    practiceQuestions: [
      { question: 'Find the discriminant of the equation 2x² - 4x + 3 = 0, and hence find the nature of its roots.', answer: 'D = (-4)² - 4(2)(3) = 16 - 24 = -8. Since D < 0, the equation has no real roots.', marks: 2 },
      { question: 'Find two consecutive positive integers, sum of whose squares is 365.', answer: 'Let integers be x and x + 1. x² + (x + 1)² = 365 ⇒ 2x² + 2x - 364 = 0 ⇒ x² + x - 182 = 0 ⇒ (x + 14)(x - 13) = 0. Positive integer x = 13. Consecutive numbers are 13 and 14.', marks: 3 }
    ]
  }
];

class OfflineStorageService {
  private dbPromise: Promise<IDBDatabase> | null = null;

  private getDB(): Promise<IDBDatabase> {
    if (typeof window === 'undefined') {
      return Promise.reject(new Error('IndexedDB is only supported in browser environment'));
    }

    if (!this.dbPromise) {
      this.dbPromise = new Promise((resolve, reject) => {
        const req = indexedDB.open(DB_NAME, DB_VERSION);

        req.onupgradeneeded = (e) => {
          const db = (e.target as IDBOpenDBRequest).result;
          if (!db.objectStoreNames.contains(STORE_PACKS)) {
            db.createObjectStore(STORE_PACKS, { keyPath: 'id' });
          }
          if (!db.objectStoreNames.contains(STORE_ATTEMPTS)) {
            db.createObjectStore(STORE_ATTEMPTS, { keyPath: 'id' });
          }
        };

        req.onsuccess = () => resolve(req.result);
        req.onerror = () => reject(req.error);
      });
    }

    return this.dbPromise;
  }

  public async getStudyPacks(): Promise<OfflineStudyPack[]> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_PACKS, 'readonly');
      const store = tx.objectStore(STORE_PACKS);
      const req = store.getAll();

      req.onsuccess = async () => {
        const results = req.result as OfflineStudyPack[];
        if (results.length === 0) {
          // Auto-seed default packs if empty
          await this.cacheDefaultPacks();
          resolve(DEFAULT_OFFLINE_PACKS);
        } else {
          resolve(results);
        }
      };
      req.onerror = () => reject(req.error);
    });
  }

  public async saveStudyPack(pack: OfflineStudyPack): Promise<void> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_PACKS, 'readwrite');
      const store = tx.objectStore(STORE_PACKS);
      const req = store.put(pack);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  }

  public async deleteStudyPack(id: string): Promise<void> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_PACKS, 'readwrite');
      const store = tx.objectStore(STORE_PACKS);
      const req = store.delete(id);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  }

  public async cacheDefaultPacks(): Promise<void> {
    const db = await this.getDB();
    const tx = db.transaction(STORE_PACKS, 'readwrite');
    const store = tx.objectStore(STORE_PACKS);
    for (const pack of DEFAULT_OFFLINE_PACKS) {
      store.put(pack);
    }
  }

  public async queueOfflineAttempt(attempt: Omit<OfflineAttempt, 'id' | 'synced'>): Promise<OfflineAttempt> {
    const db = await this.getDB();
    const fullAttempt: OfflineAttempt = {
      ...attempt,
      id: `attempt_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      synced: false
    };

    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_ATTEMPTS, 'readwrite');
      const store = tx.objectStore(STORE_ATTEMPTS);
      const req = store.put(fullAttempt);
      req.onsuccess = () => resolve(fullAttempt);
      req.onerror = () => reject(req.error);
    });
  }

  public async getPendingAttempts(): Promise<OfflineAttempt[]> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_ATTEMPTS, 'readonly');
      const store = tx.objectStore(STORE_ATTEMPTS);
      const req = store.getAll();
      req.onsuccess = () => resolve(req.result || []);
      req.onerror = () => reject(req.error);
    });
  }

  public async clearPendingAttempts(): Promise<void> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_ATTEMPTS, 'readwrite');
      const store = tx.objectStore(STORE_ATTEMPTS);
      const req = store.clear();
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  }

  public isOnline(): boolean {
    if (typeof window === 'undefined') return true;
    return navigator.onLine;
  }
}

export const offlineStorage = new OfflineStorageService();
