"use client";

import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/firebase";
import { doc, setDoc, onSnapshot } from "firebase/firestore";
import { 
  Palette, Eraser, Trash2, Download, Users, Share2, 
  Sparkles, Check, ChevronRight, Copy, CheckCheck, 
  Square, Circle, Type, Undo2, Redo2, Grid, Sparkle,
  PenTool, Highlighter, ChevronDown, FileText, X, Hand, Move
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

type DrawTool = "pen" | "highlighter" | "eraser" | "line" | "rect" | "circle" | "text" | "sticky" | "hand" | "stroke_eraser" | "smart_pen";
type BackgroundPattern = "dots" | "grid" | "ruled" | "blank";

interface StickyNote {
  id: string;
  x: number;
  y: number;
  text: string;
  color: string;
}

interface Point {
  x: number;
  y: number;
}

interface Stroke {
  id: string;
  points: Point[];
  color: string;
  brushSize: number;
  tool: DrawTool;
  fill?: boolean;
  text?: string;
}

// Check if two line segments (p1-p2) and (p3-p4) intersect
function segmentsIntersect(p1: Point, p2: Point, p3: Point, p4: Point) {
  const ccw = (A: Point, B: Point, C: Point) => (C.y - A.y) * (B.x - A.x) > (B.y - A.y) * (C.x - A.x);
  return ccw(p1, p3, p4) !== ccw(p2, p3, p4) && ccw(p1, p2, p3) !== ccw(p1, p2, p4);
}

// Find intersection coordinate
function segmentsIntersection(p1: Point, p2: Point, p3: Point, p4: Point) {
  const denominator = (p4.y - p3.y) * (p2.x - p1.x) - (p4.x - p3.x) * (p2.y - p1.y);
  if (denominator === 0) return null;
  const ua = ((p4.x - p3.x) * (p1.y - p3.y) - (p4.y - p3.y) * (p1.x - p3.x)) / denominator;
  return {
    x: p1.x + ua * (p2.x - p1.x),
    y: p1.y + ua * (p2.y - p1.y)
  };
}

// Calculate bounding box of a list of points
function getBoundingBox(pts: Point[]) {
  let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
  for (const p of pts) {
    if (p.x < minX) minX = p.x;
    if (p.x > maxX) maxX = p.x;
    if (p.y < minY) minY = p.y;
    if (p.y > maxY) maxY = p.y;
  }
  return { minX, maxX, minY, maxY };
}

// Check if two bounding boxes overlap
function doBoxesOverlap(a: any, b: any) {
  return !(a.maxX < b.minX || a.minX > b.maxX || a.maxY < b.minY || a.minY > b.maxY);
}

// Check if two strokes intersect
function doStrokesIntersect(strokeA: Stroke, strokeB: Stroke) {
  const ptsA = strokeA.points;
  const ptsB = strokeB.points;
  if (ptsA.length < 2 || ptsB.length < 2) return false;

  const boxA = getBoundingBox(ptsA);
  const boxB = getBoundingBox(ptsB);
  if (!doBoxesOverlap(boxA, boxB)) return false;

  for (let i = 0; i < ptsA.length - 1; i++) {
    for (let j = 0; j < ptsB.length - 1; j++) {
      if (segmentsIntersect(ptsA[i], ptsA[i+1], ptsB[j], ptsB[j+1])) {
        return true;
      }
    }
  }
  return false;
}

// Heuristic recognizer for shapes and basic letters
function detectShapeOrLetter(points: Point[]) {
  if (points.length < 10) return null;

  const { minX, maxX, minY, maxY } = getBoundingBox(points);
  const w = maxX - minX;
  const h = maxY - minY;
  if (w < 20 || h < 20) return null;

  const cx = minX + w / 2;
  const cy = minY + h / 2;

  // Closed shape check
  const startPt = points[0];
  const endPt = points[points.length - 1];
  const startEndDist = Math.sqrt(Math.pow(endPt.x - startPt.x, 2) + Math.pow(endPt.y - startPt.y, 2));

  // 1. Circle Check: constant distance of points from center of mass, points far from bounding box corners
  const avgX = points.reduce((sum, p) => sum + p.x, 0) / points.length;
  const avgY = points.reduce((sum, p) => sum + p.y, 0) / points.length;
  const radii = points.map(p => Math.sqrt(Math.pow(p.x - avgX, 2) + Math.pow(p.y - avgY, 2)));
  const avgRadius = radii.reduce((sum, r) => sum + r, 0) / radii.length;
  const radiusVariance = radii.reduce((sum, r) => sum + Math.pow(r - avgRadius, 2), 0) / radii.length;
  const radiusStdDev = Math.sqrt(radiusVariance);
  const coefOfVariation = radiusStdDev / avgRadius;

  const tlDist = Math.min(...points.map(p => Math.sqrt(Math.pow(p.x - minX, 2) + Math.pow(p.y - minY, 2))));
  const trDist = Math.min(...points.map(p => Math.sqrt(Math.pow(p.x - maxX, 2) + Math.pow(p.y - minY, 2))));
  const blDist = Math.min(...points.map(p => Math.sqrt(Math.pow(p.x - minX, 2) + Math.pow(p.y - maxY, 2))));
  const brDist = Math.min(...points.map(p => Math.sqrt(Math.pow(p.x - maxX, 2) + Math.pow(p.y - maxY, 2))));
  const minCornerDist = Math.min(tlDist, trDist, blDist, brDist);

  const isCircle = coefOfVariation < 0.24 && minCornerDist > Math.max(w, h) * 0.12;

  if (isCircle && startEndDist < Math.max(w, h) * 0.6) {
    return { type: "circle", cx: avgX, cy: avgY, r: avgRadius };
  }

  // 2. Rectangle Check: points close to boundaries
  let rectDistSum = 0;
  for (const p of points) {
    const distToLeft = Math.abs(p.x - minX);
    const distToRight = Math.abs(p.x - maxX);
    const distToTop = Math.abs(p.y - minY);
    const distToBottom = Math.abs(p.y - maxY);
    rectDistSum += Math.min(distToLeft, distToRight, distToTop, distToBottom);
  }
  const avgRectDist = rectDistSum / points.length;
  const isRectangle = avgRectDist < Math.min(w, h) * 0.22;

  if (isRectangle && startEndDist < Math.max(w, h) * 0.5) {
    return { type: "rectangle", x: minX, y: minY, w, h };
  }

  // 3. Loop/Crossbar Check for letter 'A':
  let selfIntersects = false;
  let intersectionPoint = null;
  for (let i = 0; i < points.length - 4; i++) {
    for (let j = i + 4; j < points.length - 1; j++) {
      if (segmentsIntersect(points[i], points[i+1], points[j], points[j+1])) {
        selfIntersects = true;
        intersectionPoint = segmentsIntersection(points[i], points[i+1], points[j], points[j+1]);
        break;
      }
    }
    if (selfIntersects) break;
  }

  if (selfIntersects && intersectionPoint) {
    const relativeY = (intersectionPoint.y - minY) / h;
    // Intersection should be in the middle of Y range (crossbar)
    if (relativeY > 0.15 && relativeY < 0.85) {
      // Find peak point (point with minimum Y)
      let peakPt = points[0];
      for (const p of points) {
        if (p.y < peakPt.y) peakPt = p;
      }
      // Check if peak is near horizontal center
      const peakNearCenter = Math.abs(peakPt.x - cx) / w < 0.35;
      
      // Check if there are points extending to bottom-left and bottom-right
      const leftLegExists = points.some(p => p.y > cy && (p.x - minX) / w < 0.3);
      const rightLegExists = points.some(p => p.y > cy && (maxX - p.x) / w < 0.3);

      if (peakNearCenter && leftLegExists && rightLegExists) {
        return { type: "letter", value: "A", x: cx, y: cy };
      }
    }
  }

  // 4. Letter 'C' / 'O' / 'U' gestures
  if (startEndDist >= Math.max(w, h) * 0.45) {
    // Check if the path sweeps left and back right (C-like)
    const quadrants = points.map(p => {
      const isRight = p.x > cx;
      const isBottom = p.y > cy;
      if (isRight && !isBottom) return 0; // TR
      if (!isRight && !isBottom) return 1; // TL
      if (!isRight && isBottom) return 2; // BL
      if (isRight && isBottom) return 3; // BR
      return 0;
    });
    let currentQuad = quadrants[0];
    let visited = [currentQuad];
    for (let q of quadrants) {
      if (q !== currentQuad) {
        currentQuad = q;
        visited.push(q);
      }
    }
    const visitedStr = visited.join("");
    if (visitedStr.includes("0123") || visitedStr.includes("123") || visitedStr.includes("012")) {
      return { type: "letter", value: "C", x: cx, y: cy };
    }
  }

  return null;
}

// Redraw canvas with all local vector strokes
const redrawCanvas = (canvas: HTMLCanvasElement, strokesList: Stroke[]) => {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  for (const stroke of strokesList) {
    ctx.lineWidth = stroke.brushSize;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.strokeStyle = stroke.color;
    ctx.fillStyle = stroke.color;

    if (stroke.tool === "eraser") {
      ctx.globalCompositeOperation = "destination-out";
      ctx.globalAlpha = 1.0;
    } else {
      ctx.globalCompositeOperation = "source-over";
      if (stroke.tool === "highlighter") {
        ctx.globalAlpha = 0.35;
      } else {
        ctx.globalAlpha = 1.0;
      }
    }

    if (stroke.points.length === 0) continue;

    if (stroke.tool === "pen" || stroke.tool === "smart_pen" || stroke.tool === "highlighter" || stroke.tool === "eraser") {
      ctx.beginPath();
      ctx.moveTo(stroke.points[0].x, stroke.points[0].y);
      for (let i = 1; i < stroke.points.length; i++) {
        ctx.lineTo(stroke.points[i].x, stroke.points[i].y);
      }
      ctx.stroke();
    } else if (stroke.tool === "line") {
      const start = stroke.points[0];
      const end = stroke.points[stroke.points.length - 1];
      ctx.beginPath();
      ctx.moveTo(start.x, start.y);
      ctx.lineTo(end.x, end.y);
      ctx.stroke();
    } else if (stroke.tool === "rect") {
      const start = stroke.points[0];
      const end = stroke.points[stroke.points.length - 1];
      ctx.beginPath();
      ctx.rect(start.x, start.y, end.x - start.x, end.y - start.y);
      if (stroke.fill) ctx.fill();
      else ctx.stroke();
    } else if (stroke.tool === "circle") {
      const start = stroke.points[0];
      const end = stroke.points[stroke.points.length - 1];
      const radius = Math.sqrt(Math.pow(end.x - start.x, 2) + Math.pow(end.y - start.y, 2));
      ctx.beginPath();
      ctx.arc(start.x, start.y, radius, 0, 2 * Math.PI);
      if (stroke.fill) ctx.fill();
      else ctx.stroke();
    } else if (stroke.tool === "text") {
      const start = stroke.points[0];
      ctx.font = `${stroke.brushSize * 3 + 24}px Inter, sans-serif`;
      ctx.fillText(stroke.text || "", start.x, start.y);
    }
  }

  ctx.globalAlpha = 1.0;
  ctx.globalCompositeOperation = "source-over";
};

export default function WhiteboardPage() {
  const { user } = useAuth();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const boardRef = useRef<HTMLDivElement>(null);
  const snapshotRef = useRef<ImageData | null>(null);

  const isDrawingRef = useRef(false);
  const lastPointRef = useRef<Point | null>(null);
  const strokePointsRef = useRef<Point[]>([]);


  const paletteColors = [
    "#000000", "#ef4444", "#f97316", "#f59e0b", 
    "#84cc16", "#22c55e", "#06b6d4", "#3b82f6", 
    "#6366f1", "#a855f7", "#ec4899", "#f43f5e"
  ];

  // States
  const [isDrawing, setIsDrawing] = useState(false);
  const [tool, setTool] = useState<DrawTool>("pen");
  const [color, setColor] = useState("#6366f1");
  const [brushSize, setBrushSize] = useState(4);
  const [fillShapes, setFillShapes] = useState(false);
  const [pattern, setPattern] = useState<BackgroundPattern>("dots");
  const [stickyNotes, setStickyNotes] = useState<StickyNote[]>([]);
  
  // Vector stroke tracking states
  const [strokes, setStrokes] = useState<Stroke[]>([]);
  const [currentStrokePoints, setCurrentStrokePoints] = useState<Point[]>([]);

  // Smart Pen states
  const [accumulatedSmartStrokes, setAccumulatedSmartStrokes] = useState<Stroke[]>([]);
  const [isRecognizing, setIsRecognizing] = useState(false);
  const smartPenTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Panning/scrolling states
  const [startScrollLeft, setStartScrollLeft] = useState(0);
  const [startScrollTop, setStartScrollTop] = useState(0);

  // Toast notifications for auto-detection
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 2500);
  };

  // Room code states
  const [roomId, setRoomId] = useState("");
  const [roomInput, setRoomInput] = useState("");
  const [joined, setJoined] = useState(false);
  const [copied, setCopied] = useState(false);
  const [lastUser, setLastUser] = useState("");

  // Coordinates
  const [startX, setStartX] = useState(0);
  const [startY, setStartY] = useState(0);

  // Text Tool Placement State
  const [textInputPos, setTextInputPos] = useState<{ x: number; y: number } | null>(null);
  const [textValue, setTextValue] = useState("");

  // History Stack for Local Undo/Redo
  const [history, setHistory] = useState<string[]>([]);
  const [historyStep, setHistoryStep] = useState(-1);

  const nickname = user?.displayName?.split(" ")[0] || user?.email?.split("@")[0] || "User";

  // Generate random room code
  useEffect(() => {
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    setRoomId(`ROOM-${randomNum}`);
    setRoomInput(`ROOM-${randomNum}`);
  }, []);

  // Save current canvas to history
  const pushToHistory = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dataUrl = canvas.toDataURL("image/png");
    const nextHistory = history.slice(0, historyStep + 1);
    nextHistory.push(dataUrl);
    setHistory(nextHistory);
    setHistoryStep(nextHistory.length - 1);
  };

  // Synchronize whiteboard state to Firebase (Includes canvas drawings & sticky notes)
  const syncCanvas = async (notes = stickyNotes) => {
    const canvas = canvasRef.current;
    if (!canvas || !db || !joined) return;
    if (user?.uid?.startsWith("mock-")) return; // Bypass Firestore sync for mock sessions
    const dataUrl = canvas.toDataURL("image/png");
    try {
      await setDoc(doc(db, "edutrack_messages", `wb_${roomId}`), {
        image: dataUrl,
        stickyNotes: notes,
        lastUpdatedBy: nickname,
        timestamp: new Date(),
        type: "whiteboard_state"
      });
    } catch (e) {
      console.error("Whiteboard sync error:", e);
    }
  };

  // Real-time updates subscription
  useEffect(() => {
    if (!db || !joined || !roomId) return;
    if (user?.uid?.startsWith("mock-")) return; // Bypass Firestore sync for mock sessions

    const unsub = onSnapshot(doc(db, "edutrack_messages", `wb_${roomId}`), (docSnap: any) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        
        // Sync notes
        if (data.stickyNotes) {
          setStickyNotes(data.stickyNotes);
        }

        // Sync drawing only if modified by someone else
        if (data.lastUpdatedBy !== nickname) {
          setLastUser(data.lastUpdatedBy);
          const img = new Image();
          img.onload = () => {
            const canvas = canvasRef.current;
            if (canvas) {
              const ctx = canvas.getContext("2d");
              if (ctx) {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
              }
            }
          };
          img.src = data.image;
        }
      }
    });

    return () => unsub();
  }, [joined, roomId, nickname, user]);

  // Missing functions reconstructed

  // Undo/Redo logic
  const handleUndo = () => {
    if (historyStep > 0) {
      setHistoryStep(historyStep - 1);
      const img = new Image();
      img.onload = () => {
        const canvas = canvasRef.current;
        if (canvas) {
          const ctx = canvas.getContext("2d");
          if (ctx) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            syncCanvas();
          }
        }
      };
      img.src = history[historyStep - 1];
    }
  };

  const handleRedo = () => {
    if (historyStep < history.length - 1) {
      setHistoryStep(historyStep + 1);
      const img = new Image();
      img.onload = () => {
        const canvas = canvasRef.current;
        if (canvas) {
          const ctx = canvas.getContext("2d");
          if (ctx) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            syncCanvas();
          }
        }
      };
      img.src = history[historyStep + 1];
    }
  };

  // Canvas Actions
  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setStrokes([]);
    setStickyNotes([]);
    pushToHistory();
    syncCanvas([]);
  };

  const downloadCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = `whiteboard-${roomId}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  };

  const copyRoomCode = () => {
    navigator.clipboard.writeText(roomId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const joinRoom = () => {
    if (roomInput.trim()) {
      setRoomId(roomInput.toUpperCase());
      setJoined(true);
      setTimeout(() => pushToHistory(), 500);
    }
  };

  // Coordinates extraction
  const getCoordinates = (e: React.MouseEvent | React.TouchEvent | any) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    let x, y;
    if (e.touches && e.touches.length > 0) {
      x = e.touches[0].clientX - rect.left;
      y = e.touches[0].clientY - rect.top;
    } else {
      x = e.clientX - rect.left;
      y = e.clientY - rect.top;
    }
    return { x, y };
  };

  // Smart pen processing
  const processSmartPen = async () => {
    if (accumulatedSmartStrokes.length === 0) return;
    setIsRecognizing(true);
    
    try {
      // Create offscreen canvas with strokes
      const tempCanvas = document.createElement("canvas");
      tempCanvas.width = canvasRef.current?.width || 800;
      tempCanvas.height = canvasRef.current?.height || 600;
      redrawCanvas(tempCanvas, accumulatedSmartStrokes);
      
      const imgData = tempCanvas.toDataURL("image/png");
      const res = await fetch("/api/whiteboard/smart-pen", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: imgData })
      });
      
      const data = await res.json();
      
      if (data && data.type && data.type !== "unknown") {
         showToast(`Recognized ${data.type}: ${data.value || ""}`);
         const box = getBoundingBox(accumulatedSmartStrokes.flatMap(s => s.points));
         const cx = (box.minX + box.maxX) / 2;
         const cy = (box.minY + box.maxY) / 2;
         const w = box.maxX - box.minX;
         const h = box.maxY - box.minY;
         const r = Math.max(w, h) / 2;
         
         const newStroke: Stroke = {
            id: Date.now().toString(),
            tool: data.type === "text" ? "text" : data.type,
            color,
            brushSize,
            fill: fillShapes,
            points: data.type === "circle" ? [
              { x: cx, y: cy },
              { x: cx + r, y: cy }
            ] : [
              { x: box.minX, y: box.minY },
              { x: box.maxX, y: box.maxY }
            ],
            text: data.type === "text" ? data.value : ""
         };
         
         setStrokes(prev => [...prev, newStroke]);
      } else {
         showToast("Unrecognized shape, keeping strokes.");
         setStrokes(prev => [...prev, ...accumulatedSmartStrokes]);
      }
    } catch (e) {
      console.error(e);
      setStrokes(prev => [...prev, ...accumulatedSmartStrokes]);
    }
    
    setAccumulatedSmartStrokes([]);
    setIsRecognizing(false);
  };

  // Drawing event handlers
  const startDrawing = (e: React.MouseEvent | React.TouchEvent | any) => {
    if (tool === "hand") {
      setIsDrawing(true);
      isDrawingRef.current = true;
      const coords = getCoordinates(e);
      setStartScrollLeft(containerRef.current?.scrollLeft || 0);
      setStartScrollTop(containerRef.current?.scrollTop || 0);
      setStartX(coords.x);
      setStartY(coords.y);
      return;
    }
    
    if (tool === "text" || tool === "sticky") return;
    
    setIsDrawing(true);
    isDrawingRef.current = true;
    const coords = getCoordinates(e);
    
    lastPointRef.current = coords;
    strokePointsRef.current = [coords];
    
    if (smartPenTimerRef.current) {
      clearTimeout(smartPenTimerRef.current);
      smartPenTimerRef.current = null;
    }
  };

  const draw = (e: React.MouseEvent | React.TouchEvent | any) => {
    if (!isDrawingRef.current) return;
    
    if (tool === "hand") {
      const coords = getCoordinates(e);
      const dx = coords.x - startX;
      const dy = coords.y - startY;
      if (containerRef.current) {
        containerRef.current.scrollLeft = startScrollLeft - dx;
        containerRef.current.scrollTop = startScrollTop - dy;
      }
      return;
    }

    const coords = getCoordinates(e);
    strokePointsRef.current.push(coords);
    
    // Fast local redraw
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    
    if (tool === "line" || tool === "rect" || tool === "circle") {
      redrawCanvas(canvas, strokes);
      
      ctx.lineWidth = brushSize;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.strokeStyle = color;
      ctx.fillStyle = color;
      ctx.globalAlpha = 1.0;
      ctx.globalCompositeOperation = "source-over";
      
      const start = strokePointsRef.current[0];
      if (tool === "line") {
        ctx.beginPath();
        ctx.moveTo(start.x, start.y);
        ctx.lineTo(coords.x, coords.y);
        ctx.stroke();
      } else if (tool === "rect") {
        ctx.beginPath();
        ctx.rect(start.x, start.y, coords.x - start.x, coords.y - start.y);
        if (fillShapes) ctx.fill();
        else ctx.stroke();
      } else if (tool === "circle") {
        const radius = Math.sqrt(Math.pow(coords.x - start.x, 2) + Math.pow(coords.y - start.y, 2));
        ctx.beginPath();
        ctx.arc(start.x, start.y, radius, 0, 2 * Math.PI);
        if (fillShapes) ctx.fill();
        else ctx.stroke();
      }
    } else {
      ctx.lineWidth = brushSize;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.strokeStyle = color;
      
      if (tool === "eraser" || tool === "stroke_eraser") {
        ctx.globalCompositeOperation = "destination-out";
        ctx.strokeStyle = "rgba(0,0,0,1)";
        ctx.globalAlpha = 1.0;
      } else {
        ctx.globalCompositeOperation = "source-over";
        if (tool === "highlighter") {
          ctx.strokeStyle = color;
          ctx.globalAlpha = 0.35;
        } else {
          ctx.globalAlpha = 1.0;
        }
      }
      
      const lastPoint = lastPointRef.current;
      if (lastPoint) {
        ctx.beginPath();
        ctx.moveTo(lastPoint.x, lastPoint.y);
        ctx.lineTo(coords.x, coords.y);
        ctx.stroke();
      }
    }
    
    lastPointRef.current = coords;
  };

  const stopDrawing = () => {
    if (!isDrawingRef.current) return;
    setIsDrawing(false);
    isDrawingRef.current = false;
    
    if (tool === "hand") return;

    const points = strokePointsRef.current;
    if (points.length === 0) return;

    const newStroke: Stroke = {
      id: Date.now().toString(),
      tool,
      color,
      brushSize,
      points: points,
      fill: fillShapes
    };
    
    if (tool === "stroke_eraser") {
      setStrokes(prev => {
        const next = prev.filter(s => !doStrokesIntersect(s, newStroke));
        const canvas = canvasRef.current;
        if (canvas) redrawCanvas(canvas, next);
        return next;
      });
    } else if (tool === "smart_pen") {
      setAccumulatedSmartStrokes(prev => [...prev, newStroke]);
      smartPenTimerRef.current = setTimeout(processSmartPen, 600);
    } else {
      setStrokes(prev => [...prev, newStroke]);
    }
    
    strokePointsRef.current = [];
    lastPointRef.current = null;
    
    // Push history and sync
    setTimeout(() => {
      pushToHistory();
      syncCanvas();
    }, 50);
  };

  const handleCanvasClick = (e: React.MouseEvent) => {
    if (tool === "text") {
      const coords = getCoordinates(e);
      setTextInputPos(coords);
      setTextValue("");
    } else if (tool === "sticky") {
      const coords = getCoordinates(e);
      const newNote: StickyNote = {
        id: Date.now().toString(),
        x: coords.x,
        y: coords.y,
        color: "yellow",
        text: ""
      };
      setStickyNotes(prev => {
        const next = [...prev, newNote];
        syncCanvas(next);
        return next;
      });
      setTool("pen");
    }
  };

  const handleTextSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (textInputPos && textValue.trim()) {
      const newStroke: Stroke = {
        id: Date.now().toString(),
        tool: "text",
        color,
        brushSize,
        points: [textInputPos],
        text: textValue
      };
      setStrokes(prev => [...prev, newStroke]);
      setTimeout(() => {
        pushToHistory();
        syncCanvas();
      }, 50);
    }
    setTextInputPos(null);
  };

  const updateNoteText = (id: string, text: string) => {
    setStickyNotes(prev => {
      const next = prev.map(n => n.id === id ? { ...n, text } : n);
      syncCanvas(next);
      return next;
    });
  };

  const updateNoteColor = (id: string, color: string) => {
    setStickyNotes(prev => {
      const next = prev.map(n => n.id === id ? { ...n, color } : n);
      syncCanvas(next);
      return next;
    });
  };

  const deleteNote = (id: string) => {
    setStickyNotes(prev => {
      const next = prev.filter(n => n.id !== id);
      syncCanvas(next);
      return next;
    });
  };

  const handleDragEnd = (id: string, info: any) => {
    setStickyNotes(prev => {
      const next = prev.map(n => {
        if (n.id === id) {
           return { ...n, x: n.x + info.offset.x, y: n.y + info.offset.y };
        }
        return n;
      });
      syncCanvas(next);
      return next;
    });
  };

  // Effect to redraw canvas when strokes change
  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) redrawCanvas(canvas, strokes);
  }, [strokes]);

  // Effect to handle window resize
  useEffect(() => {
    const handleResize = () => {
      const canvas = canvasRef.current;
      if (canvas) {
        // Just keep the size large enough
        canvas.width = 3000;
        canvas.height = 2500;
        redrawCanvas(canvas, strokes);
      }
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const stickyColors = {
    yellow: "bg-amber-200/80 text-amber-900 border-amber-300",
    pink: "bg-pink-200/80 text-pink-900 border-pink-300",
    blue: "bg-blue-200/80 text-blue-900 border-blue-300",
    green: "bg-emerald-200/80 text-emerald-900 border-emerald-300"
  };


  return (
    <div className="w-full h-full relative font-sans flex flex-col items-center justify-center min-h-[600px] bg-white dark:bg-slate-900">
      <style>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
      
      {!joined ? (
        <div className="flex-1 flex flex-col items-center justify-center w-full max-w-md mx-auto p-6 z-10 relative">
          <button 
             onClick={() => window.history.back()}
             className="absolute top-4 left-4 p-2 text-slate-500 hover:text-slate-800 font-bold"
          >
             &larr; Back
          </button>
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/80 dark:bg-slate-900/60 backdrop-blur-xl border border-slate-200/50 dark:border-slate-800/50 p-8 rounded-[2rem] shadow-2xl w-full text-center relative overflow-hidden"
          >
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div>
            <div className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-650 rounded-[1.5rem] flex items-center justify-center text-white mx-auto shadow-lg shadow-indigo-500/30 mb-6 border border-white/20 rotate-3 hover:rotate-6 transition-transform">
              <Palette className="w-10 h-10" />
            </div>
            <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-3 tracking-tight">Studio Whiteboard</h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm font-medium leading-relaxed mb-8 px-4">
              Enter a custom room ID to join classmates, or continue with the generated code.
            </p>

            <div className="space-y-4">
              <input 
                type="text" 
                value={roomInput}
                onChange={(e) => setRoomInput(e.target.value.toUpperCase())}
                placeholder="ROOM-1234"
                className="w-full px-6 py-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 font-black text-lg focus:outline-none focus:ring-4 focus:ring-indigo-500/20 text-center uppercase tracking-[0.2em] shadow-inner transition-all placeholder:font-medium placeholder:tracking-normal"
              />
              <button 
                onClick={joinRoom}
                className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-sm uppercase tracking-widest rounded-2xl transition-all shadow-xl shadow-indigo-500/20 flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98]"
              >
                <span>Enter Studio</span>
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </motion.div>
        </div>
      ) : (
        <div className="absolute inset-0 bg-[#f8fafc] dark:bg-[#0B0D17] overflow-hidden rounded-none shadow-2xl flex flex-col">
          
          {/* FLOATING TOP BAR (Left: Status, Right: Actions) */}
          <div className="absolute top-6 left-6 right-6 z-40 flex justify-between items-start pointer-events-none">
            
            {/* Properties Panel (Left) */}
            <div className="pointer-events-auto bg-white/85 dark:bg-slate-900/85 backdrop-blur-2xl border border-slate-200 dark:border-white/10 p-5 rounded-3xl shadow-xl w-[280px] flex flex-col gap-6 transition-all hover:shadow-2xl">
              
              <div className="flex items-center gap-3 pb-4 border-b border-slate-100 dark:border-slate-800 relative">
                <button 
                  onClick={() => setJoined(false)}
                  className="absolute right-0 top-0 p-1.5 text-slate-400 hover:text-slate-800 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  title="Leave Room"
                >
                  <X className="w-4 h-4" />
                </button>
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/30 text-white">
                  <Palette className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="font-black text-sm tracking-tight text-slate-900 dark:text-white leading-none mb-1">Studio Board</h2>
                  <div className="text-[10px] font-bold text-indigo-500 uppercase tracking-wider bg-indigo-500/10 inline-block px-2 py-0.5 rounded-md">
                    {roomId}
                  </div>
                </div>
              </div>

              {/* Colors */}
              {tool !== "eraser" && tool !== "sticky" && tool !== "hand" && (
                <div className="space-y-3">
                  <h3 className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Colors</h3>
                  <div className="grid grid-cols-4 gap-3">
                    {paletteColors.map((c) => (
                      <button 
                        key={c}
                        onClick={() => setColor(c)}
                        className={`w-10 h-10 rounded-xl shadow-sm flex items-center justify-center transition-all duration-200 ${
                          color === c ? "scale-110 ring-[3px] ring-indigo-500 shadow-md z-10" : "hover:scale-105 opacity-90 hover:opacity-100 border border-black/5 dark:border-white/5"
                        }`}
                        style={{ backgroundColor: c }}
                      >
                        {color === c && <Check className="w-5 h-5 text-white drop-shadow-md" />}
                      </button>
                    ))}
                    <div className="relative w-10 h-10 rounded-xl overflow-hidden hover:scale-105 transition-transform shadow-sm border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 group">
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none group-hover:bg-slate-50 dark:group-hover:bg-slate-700 transition-colors">
                        <Palette className="w-5 h-5 text-slate-400" />
                      </div>
                      <input 
                        type="color" 
                        value={color}
                        onChange={(e) => setColor(e.target.value)}
                        className="absolute inset-0 w-16 h-16 -translate-x-3 -translate-y-3 cursor-pointer opacity-0"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Stroke Size */}
              {tool !== "sticky" && tool !== "hand" && (
                <div className="space-y-3">
                  <div className="flex justify-between items-center text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                    <span>{tool === "eraser" || tool === "stroke_eraser" ? "Eraser Size" : "Stroke Size"}</span>
                    <span className="text-indigo-500 bg-indigo-500/10 px-2 py-0.5 rounded-md font-bold">{brushSize}px</span>
                  </div>
                  <input 
                    type="range" 
                    min="1" 
                    max="40" 
                    value={brushSize}
                    onChange={(e) => setBrushSize(parseInt(e.target.value))}
                    className="w-full accent-indigo-500 dark:accent-indigo-400 bg-slate-200 dark:bg-slate-800 h-2.5 rounded-full cursor-pointer appearance-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:border-[3px] [&::-webkit-slider-thumb]:border-indigo-500 [&::-webkit-slider-thumb]:rounded-full shadow-inner transition-all hover:[&::-webkit-slider-thumb]:scale-110"
                  />
                </div>
              )}

              {/* Fill shapes */}
              {["rect", "circle"].includes(tool) && (
                <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200/60 dark:border-slate-700/50 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors" onClick={() => setFillShapes(!fillShapes)}>
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Fill Shapes</span>
                  <div className={`w-10 h-6 rounded-full transition-all relative p-1 ${fillShapes ? "bg-indigo-500" : "bg-slate-300 dark:bg-slate-600"}`}>
                    <div className={`w-4 h-4 bg-white rounded-full transition-all shadow-sm ${fillShapes ? "ml-4 shadow-sm" : "ml-0"}`} />
                  </div>
                </div>
              )}

              {/* Grid Types */}
              <div className="space-y-3">
                <h3 className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Canvas Background</h3>
                <div className="grid grid-cols-2 gap-2">
                  {(["blank", "dots", "grid", "ruled"] as BackgroundPattern[]).map((p) => (
                    <button 
                      key={p}
                      onClick={() => setPattern(p)}
                      className={`py-2 rounded-xl text-xs font-bold capitalize transition-all border ${
                        pattern === p
                          ? "bg-indigo-500/10 border-indigo-500/30 text-indigo-600 dark:text-indigo-400 shadow-sm"
                          : "bg-slate-50 dark:bg-slate-800/50 border-slate-200/60 dark:border-slate-700 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>
              
            </div>

            {/* Top Right Actions */}
            <div className="pointer-events-auto flex flex-col gap-3">
              <div className="bg-white/85 dark:bg-slate-900/85 backdrop-blur-2xl border border-slate-200 dark:border-white/10 p-2 rounded-2xl shadow-xl flex items-center gap-1 hover:shadow-2xl transition-shadow">
                <button 
                  onClick={handleUndo}
                  disabled={historyStep <= 0}
                  className="w-10 h-10 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 disabled:hover:bg-transparent flex items-center justify-center transition-all hover:scale-105 active:scale-95"
                  title="Undo"
                >
                  <Undo2 className="w-5 h-5" />
                </button>
                <button 
                  onClick={handleRedo}
                  disabled={historyStep >= history.length - 1}
                  className="w-10 h-10 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 disabled:hover:bg-transparent flex items-center justify-center transition-all hover:scale-105 active:scale-95"
                  title="Redo"
                >
                  <Redo2 className="w-5 h-5" />
                </button>
                <div className="w-[1px] h-6 bg-slate-200 dark:bg-slate-800 mx-1"></div>
                <button 
                  onClick={clearCanvas}
                  className="w-10 h-10 rounded-xl text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 flex items-center justify-center transition-all hover:scale-105 active:scale-95"
                  title="Clear Canvas"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
                <button 
                  onClick={downloadCanvas}
                  className="w-10 h-10 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center transition-all hover:scale-105 active:scale-95"
                  title="Export PNG"
                >
                  <Download className="w-5 h-5" />
                </button>
              </div>

              <div className="flex justify-end">
                <button 
                  onClick={copyRoomCode}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-xl shadow-lg shadow-indigo-500/20 font-bold text-xs tracking-wide flex items-center gap-2 transition-all hover:scale-105 active:scale-95"
                >
                  {copied ? <CheckCheck className="w-4 h-4" /> : <Users className="w-4 h-4" />}
                  <span>{copied ? "Link Copied" : "Invite"}</span>
                </button>
              </div>
            </div>

          </div>

          {/* CANVAS AREA CONTAINER */}
          <div 
            ref={containerRef}
            className="absolute inset-0 overflow-auto no-scrollbar select-none"
            style={{ touchAction: 'none' }}
          >
            {/* VIRTUAL INFINITE BOARD */}
            <div
              ref={boardRef}
              style={{
                width: "3000px",
                height: "2500px",
                position: "relative",
                cursor: tool === "hand" ? (isDrawing ? "grabbing" : "grab") : "crosshair"
              }}
            >
              {/* Background Grid Pattern Rendering */}
              <div className={`absolute inset-0 pointer-events-none transition-opacity duration-500 ${
                pattern === "dots" 
                  ? "bg-[radial-gradient(#cbd5e1_1.5px,transparent_1.5px)] dark:bg-[radial-gradient(#334155_1.5px,transparent_1.5px)] [background-size:32px_32px] opacity-70"
                  : pattern === "grid"
                  ? "bg-[linear-gradient(to_right,#cbd5e1_1px,transparent_1px),linear-gradient(to_bottom,#cbd5e1_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] [background-size:32px_32px] opacity-40"
                  : pattern === "ruled"
                  ? "bg-[linear-gradient(to_bottom,#e2e8f0_1.5px,transparent_1.5px)] dark:bg-[linear-gradient(to_bottom,#334155_1.5px,transparent_1.5px)] [background-size:100%_32px] opacity-60"
                  : "opacity-0"
              }`} />

              <canvas
                ref={canvasRef}
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
                onTouchStart={startDrawing}
                onTouchMove={draw}
                onTouchEnd={stopDrawing}
                onClick={handleCanvasClick}
                className="absolute inset-0 w-full h-full block"
              />

              {/* COLLABORATIVE DRAGGABLE STICKY NOTES INTERACTIVE OVERLAYS */}
              {stickyNotes.map((note) => (
                <motion.div
                  key={note.id}
                  drag
                  dragMomentum={false}
                  dragElastic={0}
                  onDragEnd={(e, info) => handleDragEnd(note.id, info)}
                  dragConstraints={boardRef}
                  initial={{ opacity: 0, scale: 0.8, x: note.x, y: note.y }}
                  animate={{ opacity: 1, scale: 1, x: note.x, y: note.y }}
                  style={{ position: "absolute", zIndex: 20 }}
                  className={`w-56 h-56 border p-5 rounded-[1.5rem] shadow-2xl flex flex-col justify-between select-text cursor-default transition-shadow duration-200 hover:z-30 backdrop-blur-md ${
                    stickyColors[note.color as keyof typeof stickyColors] || stickyColors.yellow
                  }`}
                >
                  <div className="flex items-center justify-between border-b border-black/10 dark:border-white/10 pb-2 cursor-move">
                    <div className="flex gap-2">
                      {(["yellow", "pink", "blue", "green"] as const).map((colorName) => (
                        <button
                          key={colorName}
                          onClick={() => updateNoteColor(note.id, colorName)}
                          className={`w-4 h-4 rounded-full border border-black/5 hover:scale-110 transition-transform ${
                            colorName === "yellow" ? "bg-amber-300" : 
                            colorName === "pink" ? "bg-pink-300" :
                            colorName === "blue" ? "bg-blue-300" : "bg-emerald-350"
                          } ${note.color === colorName ? "ring-2 ring-indigo-500/60 dark:ring-indigo-400 scale-110 shadow-sm" : ""}`}
                        />
                      ))}
                    </div>
                    <button 
                      onClick={() => deleteNote(note.id)}
                      className="p-1.5 rounded-lg hover:bg-black/10 dark:hover:bg-white/10 text-black/50 dark:text-white/50 hover:text-red-500 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <textarea
                    value={note.text}
                    onChange={(e) => updateNoteText(note.id, e.target.value)}
                    placeholder="Note..."
                    className="flex-1 bg-transparent resize-none border-none outline-none text-sm font-semibold leading-relaxed mt-3 placeholder-black/30 dark:placeholder-white/30 overflow-y-auto select-text cursor-text"
                  />
                </motion.div>
              ))}

              {/* FLOATING TEXT TOOL OVERLAY CONTAINER */}
              <AnimatePresence>
                {textInputPos && (
                  <motion.form 
                    initial={{ opacity: 0, scale: 0.9, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 10 }}
                    onSubmit={handleTextSubmit}
                    onClick={(e) => e.stopPropagation()}
                    onMouseDown={(e) => e.stopPropagation()}
                    className="absolute z-30"
                    style={{ left: textInputPos.x, top: textInputPos.y - 12 }}
                  >
                    <input
                      type="text"
                      value={textValue}
                      onChange={(e) => setTextValue(e.target.value)}
                      onBlur={() => handleTextSubmit()}
                      autoFocus
                      placeholder="Type..."
                      className="px-4 py-2 rounded-xl border-2 bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-2xl focus:outline-none font-bold select-text"
                      style={{ 
                        borderColor: color,
                        fontSize: `${Math.max(14, brushSize * 1.5 + 10)}px`,
                        boxShadow: `0 10px 25px -5px ${color}40`
                      }}
                    />
                  </motion.form>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* FLOATING BOTTOM TOOLBAR */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-50 pointer-events-none">
            <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-3xl border border-slate-200/80 dark:border-white/10 p-2.5 rounded-[1.5rem] shadow-[0_20px_50px_-10px_rgba(0,0,0,0.3)] dark:shadow-[0_20px_50px_-10px_rgba(0,0,0,0.6)] flex items-center gap-1.5 pointer-events-auto">
              
              <ToolButton active={tool === "hand"} onClick={() => setTool("hand")} icon={Hand} label="Pan" />
              <div className="w-[1px] h-8 bg-slate-200 dark:bg-slate-700/50 mx-1"></div>
              
              <ToolButton active={tool === "pen"} onClick={() => setTool("pen")} icon={PenTool} label="Pen" />
              <button 
                onClick={() => setTool("smart_pen")}
                className={`group relative w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 ${
                  tool === "smart_pen"
                    ? "bg-indigo-500 text-white shadow-[0_0_20px_rgba(99,102,241,0.5)] scale-105"
                    : "text-slate-500 dark:text-slate-400 hover:bg-indigo-50 hover:text-indigo-600 dark:hover:bg-indigo-500/20 dark:hover:text-indigo-300"
                }`}
                title="Smart Pen (AI shapes & text)"
              >
                {tool === "smart_pen" && (
                   <motion.div layoutId="activeTool" className="absolute inset-0 bg-indigo-500 rounded-xl" style={{ zIndex: -1 }} />
                )}
                <Sparkles className={`w-5 h-5 relative z-10 ${isRecognizing ? 'animate-spin text-white' : ''}`} />
                {isRecognizing && <div className="absolute inset-0 border-2 border-white/50 rounded-xl animate-pulse"></div>}
                
                {/* Tooltip */}
                <div className="absolute bottom-[calc(100%+14px)] left-1/2 -translate-x-1/2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-[10px] font-bold px-2 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap shadow-xl z-50">
                  Smart Pen
                  <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 border-[5px] border-transparent border-t-slate-900 dark:border-t-white"></div>
                </div>
              </button>
              
              <ToolButton active={tool === "highlighter"} onClick={() => setTool("highlighter")} icon={Highlighter} label="Highlighter" />
              <ToolButton active={tool === "eraser"} onClick={() => setTool("eraser")} icon={Eraser} label="Eraser" />
              <ToolButton active={tool === "stroke_eraser"} onClick={() => setTool("stroke_eraser")} icon={Eraser} label="Stroke Eraser" extraClass="text-rose-500 dark:text-rose-400" />
              
              <div className="w-[1px] h-8 bg-slate-200 dark:bg-slate-700/50 mx-1"></div>
              
              <ToolButton active={tool === "line"} onClick={() => setTool("line")} icon={() => <div className="w-5 h-5 border-t-2 border-current rotate-45 transform origin-center" />} label="Line" />
              <ToolButton active={tool === "rect"} onClick={() => setTool("rect")} icon={Square} label="Rectangle" />
              <ToolButton active={tool === "circle"} onClick={() => setTool("circle")} icon={Circle} label="Circle" />
              
              <div className="w-[1px] h-8 bg-slate-200 dark:bg-slate-700/50 mx-1"></div>
              
              <ToolButton active={tool === "text"} onClick={() => setTool("text")} icon={Type} label="Text" />
              <ToolButton active={tool === "sticky"} onClick={() => setTool("sticky")} icon={FileText} label="Sticky Note" />

            </div>
          </div>

          {/* TOAST NOTIFICATION FOR AUTO-DETECTION */}
          <AnimatePresence>
            {toastMsg && (
              <motion.div
                initial={{ opacity: 0, y: 20, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 20, scale: 0.9 }}
                className="absolute bottom-28 left-1/2 -translate-x-1/2 z-50 bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-6 py-3.5 rounded-2xl shadow-2xl flex items-center gap-3 font-extrabold text-sm tracking-wide shadow-indigo-500/20"
              >
                <div className="bg-indigo-500 p-1.5 rounded-full">
                   <Sparkles className="w-4 h-4 text-white animate-pulse" />
                </div>
                <span>{toastMsg}</span>
              </motion.div>
            )}
          </AnimatePresence>

        </div>
      )}
    </div>
  );
}

function ToolButton({ active, onClick, icon: Icon, label, extraClass = "" }: any) {
  return (
    <button 
      onClick={onClick}
      title={label}
      className={`group relative w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 ${
        active
          ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-lg scale-105"
          : `text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 ${extraClass}`
      }`}
    >
      {active && (
         <motion.div layoutId="activeTool" className="absolute inset-0 bg-slate-900 dark:bg-white rounded-xl" style={{ zIndex: -1 }} />
      )}
      <Icon className="w-5 h-5 relative z-10" />
      {/* Tooltip */}
      <div className="absolute bottom-[calc(100%+14px)] left-1/2 -translate-x-1/2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-[10px] font-bold px-2 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap shadow-xl z-50">
        {label}
        <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 border-[5px] border-transparent border-t-slate-900 dark:border-t-white"></div>
      </div>
    </button>
  );
}
