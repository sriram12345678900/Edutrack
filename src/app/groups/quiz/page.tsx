"use client";

import { useState, useEffect } from "react";
import { Users, Play, Trophy, XCircle, CheckCircle2, ChevronRight, Crown } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useProfile } from "@/hooks/useProfile";
import { db } from "@/lib/firebase";
import { doc, getDoc, setDoc, updateDoc, onSnapshot } from "firebase/firestore";
import Confetti from "@/components/Confetti";

const QUIZ_QUESTIONS = [
  { q: "What is the powerhouse of the cell?", options: ["Nucleus", "Mitochondria", "Ribosome", "Chloroplast"], a: 1 },
  { q: "In physics, what does 'v' typically represent?", options: ["Volume", "Velocity", "Voltage", "Viscosity"], a: 1 },
  { q: "Which gas is most abundant in Earth's atmosphere?", options: ["Oxygen", "Carbon Dioxide", "Nitrogen", "Hydrogen"], a: 2 },
  { q: "What is the chemical symbol for Gold?", options: ["Au", "Ag", "Fe", "Cu"], a: 0 },
];

export default function MultiplayerQuiz() {
  const { user } = useAuth();
  const { profile } = useProfile();
  
  const [roomId, setRoomId] = useState("");
  const [roomData, setRoomData] = useState<any>(null);
  const [hasJoined, setHasJoined] = useState(false);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    if (!roomId || !hasJoined) return;
    
    const unsub = onSnapshot(doc(db, "quiz_rooms", roomId), (docSnap: any) => {
      if (docSnap.exists()) {
        setRoomData(docSnap.data());
      }
    });
    return () => unsub();
  }, [roomId, hasJoined]);

  const createRoom = async () => {
    if (!user || !profile) return alert("Must be logged in");
    const newId = Math.random().toString(36).substring(2, 8).toUpperCase();
    
    await setDoc(doc(db, "quiz_rooms", newId), {
      status: "waiting",
      host: user.uid,
      players: [{ uid: user.uid, name: profile.displayName || "Player", score: 0 }],
      currentQuestion: 0
    });
    
    setRoomId(newId);
    setHasJoined(true);
  };

  const joinRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !profile || !roomId) return;
    
    const ref = doc(db, "quiz_rooms", roomId.toUpperCase());
    const snap = await getDoc(ref);
    
    if (snap.exists()) {
      const data = snap.data();
      if (data.status !== "waiting") return alert("Game already started");
      
      const pIdx = data.players.findIndex((p: any) => p.uid === user.uid);
      if (pIdx === -1) {
        await updateDoc(ref, {
          players: [...data.players, { uid: user.uid, name: profile.displayName || "Player", score: 0 }]
        });
      }
      setRoomId(roomId.toUpperCase());
      setHasJoined(true);
    } else {
      alert("Room not found");
    }
  };

  const startGame = async () => {
    if (roomData?.host !== user?.uid) return;
    await updateDoc(doc(db, "quiz_rooms", roomId), {
      status: "playing"
    });
  };

  const submitAnswer = async (optIdx: number) => {
    if (selectedOption !== null || !roomData) return;
    setSelectedOption(optIdx);
    
    const qIdx = roomData.currentQuestion;
    const isCorrect = optIdx === QUIZ_QUESTIONS[qIdx].a;
    
    if (isCorrect) {
      const newPlayers = roomData.players.map((p: any) => 
        p.uid === user?.uid ? { ...p, score: p.score + 10 } : p
      );
      await updateDoc(doc(db, "quiz_rooms", roomId), { players: newPlayers });
    }
  };

  const nextQuestion = async () => {
    if (roomData?.host !== user?.uid) return;
    setSelectedOption(null);
    
    const nextQ = roomData.currentQuestion + 1;
    if (nextQ >= QUIZ_QUESTIONS.length) {
      await updateDoc(doc(db, "quiz_rooms", roomId), { status: "finished" });
      setShowConfetti(true);
    } else {
      await updateDoc(doc(db, "quiz_rooms", roomId), { currentQuestion: nextQ });
    }
  };

  if (!hasJoined) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center p-6">
        <div className="premium-glass-panel p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-indigo-500/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Users className="w-8 h-8 text-indigo-500" />
          </div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white mb-2">Live Quiz Arena</h1>
          <p className="text-slate-500 mb-8 font-medium">Compete with friends in real-time</p>
          
          <button 
            onClick={createRoom}
            className="w-full py-4 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-bold rounded-xl shadow-lg transition-all mb-6"
          >
            Create New Room
          </button>
          
          <div className="flex items-center gap-4 mb-6">
            <div className="h-px bg-slate-200 dark:bg-slate-700 flex-1"></div>
            <span className="text-xs font-bold text-slate-400">OR</span>
            <div className="h-px bg-slate-200 dark:bg-slate-700 flex-1"></div>
          </div>
          
          <form onSubmit={joinRoom} className="flex gap-2">
            <input 
              type="text" 
              placeholder="Enter Room Code"
              value={roomId}
              onChange={(e) => setRoomId(e.target.value.toUpperCase())}
              className="flex-1 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 font-bold text-slate-900 dark:text-white"
            />
            <button type="submit" className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-6 font-bold rounded-xl hover:opacity-90 transition-opacity">
              Join
            </button>
          </form>
        </div>
      </div>
    );
  }

  if (!roomData) return <div className="text-center p-10 font-bold">Loading Room...</div>;

  const isHost = roomData.host === user?.uid;
  const currentQ = QUIZ_QUESTIONS[roomData.currentQuestion];

  return (
    <div className="max-w-4xl mx-auto p-6 min-h-[80vh]">
      <Confetti active={showConfetti} />
      
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white">Room: <span className="text-indigo-500">{roomId}</span></h1>
          <p className="text-sm font-bold text-slate-500">
            {roomData.status === "waiting" ? "Waiting for players..." : roomData.status === "finished" ? "Game Over!" : `Question ${roomData.currentQuestion + 1} of ${QUIZ_QUESTIONS.length}`}
          </p>
        </div>
        <div className="bg-slate-100 dark:bg-slate-800 px-4 py-2 rounded-xl font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
          <Users className="w-4 h-4" /> {roomData.players.length} Players
        </div>
      </div>

      {roomData.status === "waiting" && (
        <div className="premium-glass-panel p-10 text-center">
          <div className="animate-spin w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full mx-auto mb-6"></div>
          <h2 className="text-xl font-bold mb-8">Waiting for players to join...</h2>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-8 text-left">
            {roomData.players.map((p: any) => (
              <div key={p.uid} className="bg-white dark:bg-slate-800 p-4 rounded-xl font-bold flex items-center gap-3 border border-slate-200 dark:border-slate-700 shadow-sm">
                <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                  {p.name.charAt(0).toUpperCase()}
                </div>
                {p.name}
              </div>
            ))}
          </div>

          {isHost && (
            <button 
              onClick={startGame}
              className="bg-indigo-600 text-white px-8 py-3 rounded-xl font-bold flex items-center gap-2 mx-auto hover:bg-indigo-700 transition-colors"
            >
              <Play className="w-5 h-5" /> Start Game
            </button>
          )}
        </div>
      )}

      {roomData.status === "playing" && (
        <div className="grid md:grid-cols-3 gap-8">
          <div className="md:col-span-2 space-y-6">
            <div className="premium-glass-panel p-8">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">{currentQ.q}</h2>
              <div className="space-y-3">
                {currentQ.options.map((opt, i) => {
                  let stateClass = "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-indigo-500";
                  if (selectedOption !== null) {
                    if (i === currentQ.a) stateClass = "bg-emerald-50 dark:bg-emerald-900/20 border-emerald-500 text-emerald-700 dark:text-emerald-400 font-bold";
                    else if (i === selectedOption) stateClass = "bg-red-50 dark:bg-red-900/20 border-red-500 text-red-700 dark:text-red-400 font-bold";
                    else stateClass = "opacity-50";
                  }
                  
                  return (
                    <button 
                      key={i}
                      onClick={() => submitAnswer(i)}
                      disabled={selectedOption !== null}
                      className={`w-full text-left p-4 rounded-xl border-2 transition-all flex justify-between items-center ${stateClass}`}
                    >
                      <span>{opt}</span>
                      {selectedOption !== null && i === currentQ.a && <CheckCircle2 className="w-5 h-5 text-emerald-500" />}
                      {selectedOption !== null && i === selectedOption && i !== currentQ.a && <XCircle className="w-5 h-5 text-red-500" />}
                    </button>
                  );
                })}
              </div>
            </div>
            
            {isHost && selectedOption !== null && (
              <button 
                onClick={nextQuestion}
                className="w-full py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold rounded-xl flex justify-center items-center gap-2"
              >
                Next Question <ChevronRight className="w-5 h-5" />
              </button>
            )}
            {!isHost && selectedOption !== null && (
              <div className="text-center font-bold text-slate-500 p-4">Waiting for host to proceed...</div>
            )}
          </div>
          
          <div className="space-y-4">
            <div className="premium-glass-panel p-6">
              <h3 className="font-bold flex items-center gap-2 mb-4"><Trophy className="w-5 h-5 text-amber-500" /> Leaderboard</h3>
              <div className="space-y-3">
                {[...roomData.players].sort((a: any, b: any) => b.score - a.score).map((p: any, i: number) => (
                  <div key={p.uid} className="flex items-center justify-between bg-slate-50 dark:bg-slate-800/50 p-3 rounded-lg">
                    <div className="flex items-center gap-2 font-bold">
                      <span className="text-slate-400 w-4">{i + 1}.</span> {p.name}
                    </div>
                    <span className="font-black text-indigo-500">{p.score}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {roomData.status === "finished" && (
        <div className="premium-glass-panel p-10 text-center">
          <Crown className="w-16 h-16 text-amber-500 mx-auto mb-6" />
          <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-2">Quiz Finished!</h2>
          <p className="text-slate-500 font-bold mb-8">Final Results</p>
          
          <div className="max-w-md mx-auto space-y-4 text-left">
            {[...roomData.players].sort((a: any, b: any) => b.score - a.score).map((p: any, i: number) => (
              <div key={p.uid} className={`flex items-center justify-between p-4 rounded-xl font-bold ${i === 0 ? 'bg-amber-50 border border-amber-200 dark:bg-amber-900/20 dark:border-amber-700/50 text-amber-700 dark:text-amber-400 text-lg' : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300'}`}>
                <div className="flex items-center gap-3">
                  <span className="opacity-50 w-4">{i + 1}.</span> 
                  {p.name} {p.uid === user?.uid && "(You)"}
                </div>
                <span>{p.score} pts</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
