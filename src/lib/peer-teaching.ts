// EduTrack Peer Teaching & Collaborative Mentorship Engine
// Enables student experts to explain concepts to peers, earning 2x bonus XP.

export interface PeerTutorProfile {
  id: string;
  name: string;
  className: number;
  expertSubject: string;
  expertChapter: string;
  rating: number; // e.g. 4.9
  sessionsCompleted: number;
  avatarInitials: string;
  color: string;
}

export const INITIAL_PEER_TUTORS: PeerTutorProfile[] = [
  {
    id: "peer_1",
    name: "Aditya Sharma",
    className: 10,
    expertSubject: "Science",
    expertChapter: "Chemical Reactions & Equations",
    rating: 4.9,
    sessionsCompleted: 14,
    avatarInitials: "AS",
    color: "from-blue-500 to-indigo-600",
  },
  {
    id: "peer_2",
    name: "Priya Nair",
    className: 10,
    expertSubject: "Mathematics",
    expertChapter: "Quadratic Equations",
    rating: 5.0,
    sessionsCompleted: 19,
    avatarInitials: "PN",
    color: "from-emerald-400 to-teal-500",
  },
  {
    id: "peer_3",
    name: "Rohan Das",
    className: 10,
    expertSubject: "Science",
    expertChapter: "Electricity & Ohm's Law",
    rating: 4.8,
    sessionsCompleted: 8,
    avatarInitials: "RD",
    color: "from-purple-500 to-pink-500",
  },
  {
    id: "peer_4",
    name: "Sneha Patel",
    className: 10,
    expertSubject: "Social Science",
    expertChapter: "Nationalism in India",
    rating: 4.9,
    sessionsCompleted: 11,
    avatarInitials: "SP",
    color: "from-amber-400 to-orange-500",
  },
];

export function getStoredPeerTutors(): PeerTutorProfile[] {
  if (typeof window === "undefined") return INITIAL_PEER_TUTORS;
  try {
    const raw = localStorage.getItem("edutrack_peer_tutors");
    return raw ? JSON.parse(raw) : INITIAL_PEER_TUTORS;
  } catch {
    return INITIAL_PEER_TUTORS;
  }
}

export function registerAsPeerTutor(tutor: Omit<PeerTutorProfile, "id" | "rating" | "sessionsCompleted">): PeerTutorProfile {
  const current = getStoredPeerTutors();
  const newTutor: PeerTutorProfile = {
    ...tutor,
    id: `peer_${Date.now()}`,
    rating: 5.0,
    sessionsCompleted: 0,
  };
  const updated = [newTutor, ...current];
  if (typeof window !== "undefined") {
    localStorage.setItem("edutrack_peer_tutors", JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent("edutrack_peer_tutors_updated"));
  }
  return newTutor;
}
