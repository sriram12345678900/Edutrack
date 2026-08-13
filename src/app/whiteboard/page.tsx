"use client";

import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/firebase";
import { doc, setDoc, onSnapshot } from "firebase/firestore";
import { 
  Palette, Eraser, Trash2, Download, Users, Share2, 
  Sparkles, Check, ChevronRight, Copy, CheckCheck, 
  Square, Circle, Type, Undo2, Redo2, Grid, Sparkle,
  PenTool, Highlighter, ChevronDown, FileText, X, Hand, Move, LassoSelect, 
  Triangle, ArrowRight, ZoomIn, ZoomOut, RotateCcw, Keyboard
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

type DrawTool = "pen" | "highlighter" | "eraser" | "line" | "rect" | "circle" | "triangle" | "arrow" | "text" | "sticky" | "hand" | "stroke_eraser" | "smart_pen" | "lasso";
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

// Check if two line segments intersect
function segmentsIntersect(p1: Point, p2: Point, p3: Point, p4: Point) {
  const ccw = (A: Point, B: Point, C: Point) => (C.y - A.y) * (B.x - A.x) > (B.y - A.y) * (C.x - A.x);
  return ccw(p1, p3, p4) !== ccw(p2, p3, p4) && ccw(p1, p2, p3) !== ccw(p1, p2, p4);
}

// Calculate bounding box of points
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

function doBoxesOverlap(a: any, b: any) {
  return !(a.maxX < b.minX || a.minX > b.maxX || a.maxY < b.minY || a.minY > b.maxY);
}

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

function isPointInPolygon(p: Point, polygon: Point[]) {
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i].x, yi = polygon[i].y;
    const xj = polygon[j].x, yj = polygon[j].y;
    const intersect = ((yi > p.y) !== (yj > p.y)) && (p.x < (xj - xi) * (p.y - yi) / (yj - yi) + xi);
    if (intersect) inside = !inside;
  }
  return inside;
}

function isStrokeInLasso(stroke: Stroke, lassoPolygon: Point[]) {
  if (lassoPolygon.length < 3) return false;
  const box = getBoundingBox(lassoPolygon);
  const strokeBox = getBoundingBox(stroke.points);
  if (!doBoxesOverlap(box, strokeBox)) return false;

  let insideCount = 0;
  for (const pt of stroke.points) {
    if (isPointInPolygon(pt, lassoPolygon)) insideCount++;
  }
  return (insideCount / stroke.points.length) >= 0.3;
}

type DetectedShape =
  | { type: "line"; start: Point; end: Point }
  | { type: "circle"; cx: number; cy: number; r: number }
  | { type: "rectangle"; x: number; y: number; w: number; h: number }
  | { type: "triangle"; start: Point; end: Point }
  | { type: "arrow"; start: Point; end: Point }
  | { type: "letter"; value: string; x: number; y: number }
  | null;

function detectShapeOrLetter(points: Point[]): DetectedShape {
  if (points.length < 5) return null;

  const startPt = points[0];
  const endPt = points[points.length - 1];
  const startEndDist = Math.sqrt(Math.pow(endPt.x - startPt.x, 2) + Math.pow(endPt.y - startPt.y, 2));

  // Straight line or arrow
  let totalLength = 0;
  for (let i = 0; i < points.length - 1; i++) {
    totalLength += Math.sqrt(Math.pow(points[i+1].x - points[i].x, 2) + Math.pow(points[i+1].y - points[i].y, 2));
  }
  const straightRatio = startEndDist / (totalLength || 1);
  if (straightRatio > 0.86 && startEndDist > 30) {
    return { type: "line", start: startPt, end: endPt };
  }

  if (points.length < 10) return null;

  const { minX, maxX, minY, maxY } = getBoundingBox(points);
  const w = maxX - minX;
  const h = maxY - minY;
  if (w < 20 || h < 20) return null;

  const cx = minX + w / 2;
  const cy = minY + h / 2;

  // Circle Check
  const avgX = points.reduce((sum, p) => sum + p.x, 0) / points.length;
  const avgY = points.reduce((sum, p) => sum + p.y, 0) / points.length;
  const radii = points.map(p => Math.sqrt(Math.pow(p.x - avgX, 2) + Math.pow(p.y - avgY, 2)));
  const avgRadius = radii.reduce((sum, r) => sum + r, 0) / radii.length;
  const radiusVariance = radii.reduce((sum, r) => sum + Math.pow(r - avgRadius, 2), 0) / radii.length;
  const radiusStdDev = Math.sqrt(radiusVariance);
  const coefOfVariation = radiusStdDev / avgRadius;

  const isCircle = coefOfVariation < 0.24;
  if (isCircle && startEndDist < Math.max(w, h) * 0.6) {
    return { type: "circle", cx: avgX, cy: avgY, r: avgRadius };
  }

  // Rectangle Check
  let rectDistSum = 0;
  for (const p of points) {
    const distToLeft = Math.abs(p.x - minX);
    const distToRight = Math.abs(p.x - maxX);
    const distToTop = Math.abs(p.y - minY);
    const distToBottom = Math.abs(p.y - maxY);
    rectDistSum += Math.min(distToLeft, distToRight, distToTop, distToBottom);
  }
  const avgRectDist = rectDistSum / points.length;
  if (avgRectDist < Math.min(w, h) * 0.22 && startEndDist < Math.max(w, h) * 0.5) {
    return { type: "rectangle", x: minX, y: minY, w, h };
  }

  // Triangle Check (Top peak with bottom flat base)
  let topPoint = points[0];
  for (const p of points) {
    if (p.y < topPoint.y) topPoint = p;
  }
  const peakCentroidDist = Math.abs(topPoint.x - cx) / w;
  if (peakCentroidDist < 0.35 && startEndDist < Math.max(w, h) * 0.45) {
    return { type: "triangle", start: { x: minX, y: minY }, end: { x: maxX, y: maxY } };
  }

  return null;
}

// Render canvas with smooth quadratic Bézier curves
const redrawCanvas = (canvas: HTMLCanvasElement, strokesList: Stroke[]) => {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  if (canvas.width !== 3000 || canvas.height !== 2500) {
    canvas.width = 3000;
    canvas.height = 2500;
  }

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
      ctx.globalAlpha = stroke.tool === "highlighter" ? 0.35 : 1.0;
    }

    if (stroke.points.length === 0) continue;

    if (stroke.tool === "pen" || stroke.tool === "smart_pen" || stroke.tool === "highlighter" || stroke.tool === "eraser") {
      if (stroke.points.length === 1) {
        ctx.beginPath();
        ctx.arc(stroke.points[0].x, stroke.points[0].y, stroke.brushSize / 2, 0, Math.PI * 2);
        ctx.fill();
      } else if (stroke.points.length === 2) {
        ctx.beginPath();
        ctx.moveTo(stroke.points[0].x, stroke.points[0].y);
        ctx.lineTo(stroke.points[1].x, stroke.points[1].y);
        ctx.stroke();
      } else {
        // Smooth Quadratic Bézier interpolation
        ctx.beginPath();
        ctx.moveTo(stroke.points[0].x, stroke.points[0].y);
        for (let i = 1; i < stroke.points.length - 1; i++) {
          const xc = (stroke.points[i].x + stroke.points[i + 1].x) / 2;
          const yc = (stroke.points[i].y + stroke.points[i + 1].y) / 2;
          ctx.quadraticCurveTo(stroke.points[i].x, stroke.points[i].y, xc, yc);
        }
        ctx.lineTo(stroke.points[stroke.points.length - 1].x, stroke.points[stroke.points.length - 1].y);
        ctx.stroke();
      }
    } else if (stroke.tool === "line") {
      const start = stroke.points[0];
      const end = stroke.points[stroke.points.length - 1];
      ctx.beginPath();
      ctx.moveTo(start.x, start.y);
      ctx.lineTo(end.x, end.y);
      ctx.stroke();
    } else if (stroke.tool === "arrow") {
      const start = stroke.points[0];
      const end = stroke.points[stroke.points.length - 1];
      const angle = Math.atan2(end.y - start.y, end.x - start.x);
      const headLen = Math.max(16, stroke.brushSize * 3.5);
      
      ctx.beginPath();
      ctx.moveTo(start.x, start.y);
      ctx.lineTo(end.x, end.y);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(end.x, end.y);
      ctx.lineTo(end.x - headLen * Math.cos(angle - Math.PI / 6), end.y - headLen * Math.sin(angle - Math.PI / 6));
      ctx.lineTo(end.x - headLen * Math.cos(angle + Math.PI / 6), end.y - headLen * Math.sin(angle + Math.PI / 6));
      ctx.closePath();
      ctx.fill();
    } else if (stroke.tool === "rect") {
      const start = stroke.points[0];
      const end = stroke.points[stroke.points.length - 1];
      ctx.beginPath();
      ctx.rect(start.x, start.y, end.x - start.x, end.y - start.y);
      if (stroke.fill) ctx.fill();
      else ctx.stroke();
    } else if (stroke.tool === "triangle") {
      const start = stroke.points[0];
      const end = stroke.points[stroke.points.length - 1];
      const topX = (start.x + end.x) / 2;
      ctx.beginPath();
      ctx.moveTo(topX, start.y);
      ctx.lineTo(end.x, end.y);
      ctx.lineTo(start.x, end.y);
      ctx.closePath();
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
      ctx.font = `${stroke.brushSize * 3 + 24}px Outfit, Inter, sans-serif`;
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

  const isDrawingRef = useRef(false);
  const lastPointRef = useRef<Point | null>(null);
  const strokePointsRef = useRef<Point[]>([]);

  const paletteColors = [
    "#6366f1", "#000000", "#ef4444", "#f97316", "#f59e0b", 
    "#10b981", "#06b6d4", "#3b82f6", "#a855f7", "#ec4899"
  ];

  // States
  const [isDrawing, setIsDrawing] = useState(false);
  const [tool, setTool] = useState<DrawTool>("pen");
  const [color, setColor] = useState("#6366f1");
  const [brushSize, setBrushSize] = useState(4);
  const [fillShapes, setFillShapes] = useState(false);
  const [pattern, setPattern] = useState<BackgroundPattern>("dots");
  const [zoomLevel, setZoomLevel] = useState(1);
  const [selectedStrokeIds, setSelectedStrokeIds] = useState<string[]>([]);
  const [stickyNotes, setStickyNotes] = useState<StickyNote[]>([]);
  const [showKeyShortcuts, setShowKeyShortcuts] = useState(false);
  
  // Vector stroke tracking states
  const [strokes, setStrokes] = useState<Stroke[]>([]);
  const [accumulatedSmartStrokes, setAccumulatedSmartStrokes] = useState<Stroke[]>([]);
  const [isRecognizing, setIsRecognizing] = useState(false);
  const smartPenTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Panning states
  const [startScrollLeft, setStartScrollLeft] = useState(0);
  const [startScrollTop, setStartScrollTop] = useState(0);
  const [startX, setStartX] = useState(0);
  const [startY, setStartY] = useState(0);

  // Toast notifications
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 2500);
  };

  // Room states
  const [roomId, setRoomId] = useState("");
  const [roomInput, setRoomInput] = useState("");
  const [joined, setJoined] = useState(false);
  const [copied, setCopied] = useState(false);

  // Text Tool Placement State
  const [textInputPos, setTextInputPos] = useState<{ x: number; y: number } | null>(null);
  const [textValue, setTextValue] = useState("");

  // History Stack
  const [history, setHistory] = useState<string[]>([]);
  const [historyStep, setHistoryStep] = useState(-1);

  const nickname = user?.displayName?.split(" ")[0] || user?.email?.split("@")[0] || "User";

  useEffect(() => {
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    setRoomId(`ROOM-${randomNum}`);
    setRoomInput(`ROOM-${randomNum}`);
  }, []);

  const pushToHistory = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dataUrl = canvas.toDataURL("image/png");
    const nextHistory = history.slice(0, historyStep + 1);
    nextHistory.push(dataUrl);
    setHistory(nextHistory);
    setHistoryStep(nextHistory.length - 1);
  };

  const syncCanvas = async (notes = stickyNotes) => {
    const canvas = canvasRef.current;
    if (!canvas || !db || !joined) return;
    if (user?.uid?.startsWith("mock-")) return;
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

  useEffect(() => {
    if (!db || !joined || !roomId) return;
    if (user?.uid?.startsWith("mock-")) return;

    const unsub = onSnapshot(doc(db, "edutrack_messages", `wb_${roomId}`), (docSnap: any) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data.stickyNotes) setStickyNotes(data.stickyNotes);
        if (data.lastUpdatedBy !== nickname) {
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

  // Global Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      const key = e.key.toLowerCase();
      if ((e.ctrlKey || e.metaKey) && key === 'z') {
        e.preventDefault();
        if (e.shiftKey) handleRedo();
        else handleUndo();
      } else if ((e.ctrlKey || e.metaKey) && key === 'y') {
        e.preventDefault();
        handleRedo();
      } else if (key === 'p') {
        setTool("pen");
      } else if (key === 's') {
        setTool("smart_pen");
      } else if (key === 'e') {
        setTool("eraser");
      } else if (key === 'l') {
        setTool("lasso");
      } else if (key === 'h') {
        setTool("hand");
      } else if (key === 'r') {
        setTool("rect");
      } else if (key === 'c') {
        setTool("circle");
      } else if (key === 't') {
        setTool("text");
      } else if (key === 'delete' || key === 'backspace') {
        if (selectedStrokeIds.length > 0) {
          deleteSelectedStrokes();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [historyStep, history, selectedStrokeIds]);

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

  const getCoordinates = (e: any) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    let x, y;
    if (e.touches && e.touches.length > 0) {
      x = (e.touches[0].clientX - rect.left) / zoomLevel;
      y = (e.touches[0].clientY - rect.top) / zoomLevel;
    } else {
      x = (e.clientX - rect.left) / zoomLevel;
      y = (e.clientY - rect.top) / zoomLevel;
    }
    return { x, y };
  };

  const processSmartPen = async () => {
    if (accumulatedSmartStrokes.length === 0) return;
    setIsRecognizing(true);
    try {
      const tempCanvas = document.createElement("canvas");
      tempCanvas.width = canvasRef.current?.width || 3000;
      tempCanvas.height = canvasRef.current?.height || 2500;
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
            points: data.type === "circle" ? [{ x: cx, y: cy }, { x: cx + r, y: cy }] : [{ x: box.minX, y: box.minY }, { x: box.maxX, y: box.maxY }],
            text: data.type === "text" ? data.value : ""
         };
         setStrokes(prev => [...prev, newStroke]);
      } else {
         showToast("Unrecognized shape, keeping strokes.");
         setStrokes(prev => [...prev, ...accumulatedSmartStrokes]);
      }
    } catch (e) {
      setStrokes(prev => [...prev, ...accumulatedSmartStrokes]);
    }
    setAccumulatedSmartStrokes([]);
    setIsRecognizing(false);
  };

  const startDrawing = (e: any) => {
    if (tool === "hand") {
      setIsDrawing(true);
      isDrawingRef.current = true;
      const coords = getCoordinates(e);
      setStartScrollLeft(containerRef.current?.scrollLeft || 0);
      setStartScrollTop(containerRef.current?.scrollTop || 0);
      setStartX(coords.x * zoomLevel);
      setStartY(coords.y * zoomLevel);
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

  const draw = (e: any) => {
    if (!isDrawingRef.current) return;
    
    if (tool === "hand") {
      const coords = getCoordinates(e);
      const dx = coords.x * zoomLevel - startX;
      const dy = coords.y * zoomLevel - startY;
      if (containerRef.current) {
        containerRef.current.scrollLeft = startScrollLeft - dx;
        containerRef.current.scrollTop = startScrollTop - dy;
      }
      return;
    }

    const coords = getCoordinates(e);
    strokePointsRef.current.push(coords);
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    
    if (tool === "lasso") {
      redrawCanvas(canvas, strokes);
      ctx.lineWidth = 2;
      ctx.strokeStyle = "#6366f1";
      ctx.fillStyle = "rgba(99, 102, 241, 0.15)";
      ctx.setLineDash([6, 6]);
      ctx.beginPath();
      ctx.moveTo(strokePointsRef.current[0].x, strokePointsRef.current[0].y);
      for (let i = 1; i < strokePointsRef.current.length; i++) {
        ctx.lineTo(strokePointsRef.current[i].x, strokePointsRef.current[i].y);
      }
      ctx.closePath();
      ctx.stroke();
      ctx.fill();
      ctx.setLineDash([]);
      return;
    }

    if (["line", "rect", "circle", "triangle", "arrow"].includes(tool)) {
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
      } else if (tool === "arrow") {
        const angle = Math.atan2(coords.y - start.y, coords.x - start.x);
        const headLen = Math.max(16, brushSize * 3.5);
        ctx.beginPath();
        ctx.moveTo(start.x, start.y);
        ctx.lineTo(coords.x, coords.y);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(coords.x, coords.y);
        ctx.lineTo(coords.x - headLen * Math.cos(angle - Math.PI / 6), coords.y - headLen * Math.sin(angle - Math.PI / 6));
        ctx.lineTo(coords.x - headLen * Math.cos(angle + Math.PI / 6), coords.y - headLen * Math.sin(angle + Math.PI / 6));
        ctx.closePath();
        ctx.fill();
      } else if (tool === "rect") {
        ctx.beginPath();
        ctx.rect(start.x, start.y, coords.x - start.x, coords.y - start.y);
        if (fillShapes) ctx.fill();
        else ctx.stroke();
      } else if (tool === "triangle") {
        const topX = (start.x + coords.x) / 2;
        ctx.beginPath();
        ctx.moveTo(topX, start.y);
        ctx.lineTo(coords.x, coords.y);
        ctx.lineTo(start.x, coords.y);
        ctx.closePath();
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
      // Live smooth Bézier stroke preview
      ctx.lineWidth = brushSize;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      
      if (tool === "eraser" || tool === "stroke_eraser") {
        ctx.globalCompositeOperation = "destination-out";
        ctx.strokeStyle = "rgba(0,0,0,1)";
        ctx.globalAlpha = 1.0;
      } else {
        ctx.globalCompositeOperation = "source-over";
        ctx.strokeStyle = color;
        ctx.globalAlpha = tool === "highlighter" ? 0.35 : 1.0;
      }
      
      const pts = strokePointsRef.current;
      if (pts.length > 2) {
        ctx.beginPath();
        const p1 = pts[pts.length - 3];
        const p2 = pts[pts.length - 2];
        const p3 = pts[pts.length - 1];
        const xc = (p2.x + p3.x) / 2;
        const yc = (p2.y + p3.y) / 2;
        ctx.moveTo(p1.x, p1.y);
        ctx.quadraticCurveTo(p2.x, p2.y, xc, yc);
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
      const detected = detectShapeOrLetter(points);
      if (detected) {
        let cleanStroke: Stroke | null = null;
        if (detected.type === "line") {
          cleanStroke = { id: Date.now().toString(), tool: "line", color, brushSize, points: [detected.start, detected.end] };
          showToast("Snapped to Line ✨");
        } else if (detected.type === "circle") {
          const { cx, cy, r } = detected;
          cleanStroke = { id: Date.now().toString(), tool: "circle", color, brushSize, fill: fillShapes, points: [{ x: cx, y: cy }, { x: cx + r, y: cy }] };
          showToast("Snapped to Circle ✨");
        } else if (detected.type === "rectangle") {
          const { x, y, w, h } = detected;
          cleanStroke = { id: Date.now().toString(), tool: "rect", color, brushSize, fill: fillShapes, points: [{ x, y }, { x: x + w, y: y + h }] };
          showToast("Snapped to Rectangle ✨");
        } else if (detected.type === "triangle") {
          cleanStroke = { id: Date.now().toString(), tool: "triangle", color, brushSize, fill: fillShapes, points: [detected.start, detected.end] };
          showToast("Snapped to Triangle ✨");
        }

        if (cleanStroke) {
          setStrokes(prev => {
            const next = [...prev, cleanStroke];
            const canvas = canvasRef.current;
            if (canvas) redrawCanvas(canvas, next);
            return next;
          });
        } else {
          setStrokes(prev => [...prev, newStroke]);
        }
      } else {
        setAccumulatedSmartStrokes(prev => [...prev, newStroke]);
        smartPenTimerRef.current = setTimeout(processSmartPen, 400);
      }
    } else if (tool === "lasso") {
      const selected = strokes.filter(s => isStrokeInLasso(s, points)).map(s => s.id);
      setSelectedStrokeIds(selected);
      if (selected.length > 0) {
        showToast(`Selected ${selected.length} element${selected.length > 1 ? "s" : ""} 🎯`);
      } else {
        setSelectedStrokeIds([]);
      }
      const canvas = canvasRef.current;
      if (canvas) redrawCanvas(canvas, strokes);
    } else {
      setStrokes(prev => [...prev, newStroke]);
    }
    
    strokePointsRef.current = [];
    lastPointRef.current = null;
    
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

  const deleteSelectedStrokes = () => {
    if (selectedStrokeIds.length === 0) return;
    setStrokes(prev => {
      const next = prev.filter(s => !selectedStrokeIds.includes(s.id));
      const canvas = canvasRef.current;
      if (canvas) redrawCanvas(canvas, next);
      return next;
    });
    setSelectedStrokeIds([]);
    showToast("Deleted selected elements");
    pushToHistory();
    syncCanvas();
  };

  const recolorSelectedStrokes = (newColor: string) => {
    if (selectedStrokeIds.length === 0) return;
    setColor(newColor);
    setStrokes(prev => {
      const next = prev.map(s => selectedStrokeIds.includes(s.id) ? { ...s, color: newColor } : s);
      const canvas = canvasRef.current;
      if (canvas) redrawCanvas(canvas, next);
      return next;
    });
    showToast("Recolored selected elements");
    pushToHistory();
    syncCanvas();
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

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      if (canvas.width !== 3000 || canvas.height !== 2500) {
        canvas.width = 3000;
        canvas.height = 2500;
      }
      redrawCanvas(canvas, strokes);
    }
  }, [strokes, joined]);

  const stickyColors = {
    yellow: "premium-glass-panel !bg-amber-500/20 text-amber-100 !border-amber-500/30",
    pink: "premium-glass-panel !bg-pink-500/20 text-pink-100 !border-pink-500/30",
    blue: "premium-glass-panel !bg-blue-500/20 text-blue-100 !border-blue-500/30",
    green: "premium-glass-panel !bg-emerald-500/20 text-emerald-100 !border-emerald-500/30"
  };

  return (
    <div className="w-full h-full relative font-sans flex flex-col items-center justify-center min-h-[600px] bg-slate-50 dark:bg-[#02040a]">
      {/* Background Mesh */}
      <div className="premium-mesh-bg">
        <div className="premium-mesh-blob-1"></div>
        <div className="premium-mesh-blob-2"></div>
        <div className="premium-mesh-blob-3"></div>
      </div>
      
      {!joined ? (
        <div className="flex-1 flex flex-col items-center justify-center w-full max-w-md mx-auto p-6 z-10 relative">
          <button 
             onClick={() => window.history.back()}
             className="absolute top-4 left-4 p-2 text-slate-500 hover:text-slate-800 dark:hover:text-white font-bold"
          >
             &larr; Back
          </button>
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="premium-glass-panel premium-glow-border p-8 w-full text-center relative overflow-hidden shadow-2xl"
          >
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div>
            <div className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-650 rounded-[1.5rem] flex items-center justify-center text-white mx-auto shadow-lg shadow-indigo-500/30 mb-6 border border-white/20 rotate-3 hover:rotate-6 transition-transform">
              <Palette className="w-10 h-10" />
            </div>
            <h2 className="text-3xl font-black premium-text-gradient mb-3 tracking-tight">Studio Whiteboard</h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm font-medium leading-relaxed mb-8 px-4">
              Enter a custom room ID to join classmates, or continue with the generated studio code.
            </p>

            <div className="space-y-4">
              <input 
                type="text" 
                value={roomInput}
                onChange={(e) => setRoomInput(e.target.value.toUpperCase())}
                placeholder="ROOM-1234"
                className="w-full px-6 py-4 rounded-2xl border border-slate-200 dark:border-white/10 bg-white/80 dark:bg-black/40 font-black text-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/50 text-slate-900 dark:text-white text-center uppercase tracking-[0.2em] shadow-inner transition-all placeholder:font-medium placeholder:tracking-normal placeholder:text-slate-400"
              />
              <button 
                onClick={joinRoom}
                className="w-full py-4 bg-indigo-600 dark:bg-[#0d1127] text-white font-extrabold text-sm uppercase tracking-widest rounded-2xl transition-all flex items-center justify-center gap-2 micro-hover-lift premium-glow-border shadow-[0_0_20px_rgba(99,102,241,0.3)]"
              >
                <span>Enter Studio</span>
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </motion.div>
        </div>
      ) : (
        <div className="absolute inset-0 overflow-hidden flex flex-col select-none">
          
          {/* FLOATING TOP BAR */}
          <div className="absolute top-6 left-6 right-6 z-40 flex justify-between items-start pointer-events-none">
            
            {/* Properties Panel (Left) */}
            <div className="pointer-events-auto premium-glass-panel p-5 w-[280px] flex flex-col gap-5 transition-all hover:shadow-2xl">
              
              <div className="flex items-center gap-3 pb-3.5 border-b border-slate-200/50 dark:border-white/10 relative">
                <button 
                  onClick={() => setJoined(false)}
                  className="absolute right-0 top-0 p-1.5 text-slate-400 hover:text-slate-800 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  title="Leave Room"
                >
                  <X className="w-4 h-4" />
                </button>
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/30 text-white">
                  <Palette className="w-4.5 h-4.5" />
                </div>
                <div>
                  <h2 className="font-black text-sm tracking-tight text-slate-900 dark:text-white leading-none mb-1">Studio Board</h2>
                  <div className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-500/10 inline-block px-2 py-0.5 rounded-md">
                    {roomId}
                  </div>
                </div>
              </div>

              {/* Color Palette Swatches */}
              {tool !== "eraser" && tool !== "sticky" && tool !== "hand" && (
                <div className="space-y-2.5">
                  <h3 className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Colors</h3>
                  <div className="grid grid-cols-5 gap-2">
                    {paletteColors.map((c) => (
                      <button 
                        key={c}
                        onClick={() => setColor(c)}
                        className={`w-9 h-9 rounded-xl shadow-sm flex items-center justify-center transition-all duration-200 ${
                          color === c ? "scale-110 ring-[3px] ring-indigo-500 shadow-md z-10" : "hover:scale-105 opacity-90 border border-black/5 dark:border-white/5"
                        }`}
                        style={{ backgroundColor: c }}
                      >
                        {color === c && <Check className="w-4 h-4 text-white drop-shadow-md" />}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Stroke Size Slider */}
              {tool !== "sticky" && tool !== "hand" && (
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                    <span>{tool === "eraser" || tool === "stroke_eraser" ? "Eraser Size" : "Stroke Size"}</span>
                    <span className="text-indigo-600 dark:text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-md font-bold">{brushSize}px</span>
                  </div>
                  <input 
                    type="range" 
                    min="1" 
                    max="40" 
                    value={brushSize}
                    onChange={(e) => setBrushSize(parseInt(e.target.value))}
                    className="w-full accent-indigo-500 dark:accent-indigo-400 bg-slate-200 dark:bg-slate-800 h-2 rounded-full cursor-pointer"
                  />
                </div>
              )}

              {/* Fill Shapes Toggle */}
              {["rect", "circle", "triangle"].includes(tool) && (
                <div className="flex items-center justify-between p-2.5 bg-slate-100 dark:bg-slate-800/50 rounded-xl border border-slate-200/60 dark:border-slate-700/50 cursor-pointer" onClick={() => setFillShapes(!fillShapes)}>
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Fill Shape</span>
                  <div className={`w-9 h-5 rounded-full transition-all relative p-0.5 ${fillShapes ? "bg-indigo-500" : "bg-slate-300 dark:bg-slate-600"}`}>
                    <div className={`w-4 h-4 bg-white rounded-full transition-all shadow-sm ${fillShapes ? "ml-4" : "ml-0"}`} />
                  </div>
                </div>
              )}

              {/* Canvas Background Patterns */}
              <div className="space-y-2">
                <h3 className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Grid Style</h3>
                <div className="grid grid-cols-2 gap-1.5">
                  {(["blank", "dots", "grid", "ruled"] as BackgroundPattern[]).map((p) => (
                    <button 
                      key={p}
                      onClick={() => setPattern(p)}
                      className={`py-1.5 rounded-xl text-xs font-bold capitalize transition-all border ${
                        pattern === p
                          ? "bg-indigo-500/10 border-indigo-500/30 text-indigo-600 dark:text-indigo-400 shadow-sm"
                          : "bg-slate-100 dark:bg-slate-800/50 border-slate-200/60 dark:border-slate-700 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>

              {/* Keyboard Shortcuts Hint */}
              <button
                onClick={() => setShowKeyShortcuts(!showKeyShortcuts)}
                className="flex items-center justify-center gap-1.5 text-[10px] font-bold text-slate-400 hover:text-indigo-500 pt-1"
              >
                <Keyboard className="w-3.5 h-3.5" />
                <span>Shortcuts (P, E, L, S, Z, Y)</span>
              </button>
              
            </div>

            {/* Top Right Action Tools & Zoom */}
            <div className="pointer-events-auto flex flex-col gap-3">
              <div className="premium-glass-panel p-2 flex items-center gap-1 hover:shadow-2xl transition-shadow">
                
                {/* Zoom Controls */}
                <button 
                  onClick={() => setZoomLevel(prev => Math.max(0.5, prev - 0.15))}
                  className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/10 transition-all"
                  title="Zoom Out (-)"
                >
                  <ZoomOut className="w-4 h-4" />
                </button>
                <span className="text-[10px] font-extrabold px-1.5 text-slate-600 dark:text-slate-300 min-w-[36px] text-center">
                  {Math.round(zoomLevel * 100)}%
                </span>
                <button 
                  onClick={() => setZoomLevel(prev => Math.min(2.0, prev + 0.15))}
                  className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/10 transition-all"
                  title="Zoom In (+)"
                >
                  <ZoomIn className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => setZoomLevel(1)}
                  className="p-2 rounded-xl text-slate-400 hover:text-indigo-500 hover:bg-slate-100 dark:hover:bg-white/10 transition-all text-xs"
                  title="Reset Zoom"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>

                <div className="w-[1px] h-6 bg-slate-200 dark:bg-white/10 mx-1"></div>

                <button 
                  onClick={handleUndo}
                  disabled={historyStep <= 0}
                  className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/10 disabled:opacity-30 flex items-center justify-center transition-all"
                  title="Undo (Ctrl+Z)"
                >
                  <Undo2 className="w-4 h-4" />
                </button>
                <button 
                  onClick={handleRedo}
                  disabled={historyStep >= history.length - 1}
                  className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/10 disabled:opacity-30 flex items-center justify-center transition-all"
                  title="Redo (Ctrl+Y)"
                >
                  <Redo2 className="w-4 h-4" />
                </button>
                
                <div className="w-[1px] h-6 bg-slate-200 dark:bg-white/10 mx-1"></div>

                <button 
                  onClick={clearCanvas}
                  className="p-2 rounded-xl text-rose-500 hover:bg-rose-500/20 flex items-center justify-center transition-all"
                  title="Clear Board"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                <button 
                  onClick={downloadCanvas}
                  className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/10 flex items-center justify-center transition-all"
                  title="Export PNG"
                >
                  <Download className="w-4 h-4" />
                </button>
              </div>

              <div className="flex justify-end">
                <button 
                  onClick={copyRoomCode}
                  className="premium-glow-border px-4 py-2.5 rounded-xl shadow-lg font-bold text-xs tracking-wide flex items-center gap-2 transition-all micro-hover-lift bg-indigo-600 dark:bg-[#0d1127] text-white"
                >
                  {copied ? <CheckCheck className="w-4 h-4" /> : <Users className="w-4 h-4" />}
                  <span>{copied ? "Copied" : "Invite"}</span>
                </button>
              </div>
            </div>

          </div>

          {/* KEYBOARD SHORTCUTS MODAL OVERLAY */}
          <AnimatePresence>
            {showKeyShortcuts && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="absolute top-24 right-6 z-50 premium-glass-panel p-5 w-64 shadow-2xl text-slate-900 dark:text-white"
              >
                <div className="flex justify-between items-center pb-2 border-b border-slate-200 dark:border-white/10 mb-3">
                  <h4 className="font-extrabold text-xs">Keyboard Shortcuts</h4>
                  <button onClick={() => setShowKeyShortcuts(false)} className="text-slate-400 hover:text-slate-600"><X className="w-4 h-4" /></button>
                </div>
                <div className="space-y-1.5 text-[11px] font-medium text-slate-600 dark:text-slate-300">
                  <div className="flex justify-between"><span>Pen Tool</span><kbd className="px-1.5 py-0.5 bg-slate-200 dark:bg-white/10 rounded font-mono text-[9px]">P</kbd></div>
                  <div className="flex justify-between"><span>Smart AI Pen</span><kbd className="px-1.5 py-0.5 bg-slate-200 dark:bg-white/10 rounded font-mono text-[9px]">S</kbd></div>
                  <div className="flex justify-between"><span>Eraser</span><kbd className="px-1.5 py-0.5 bg-slate-200 dark:bg-white/10 rounded font-mono text-[9px]">E</kbd></div>
                  <div className="flex justify-between"><span>Lasso Select</span><kbd className="px-1.5 py-0.5 bg-slate-200 dark:bg-white/10 rounded font-mono text-[9px]">L</kbd></div>
                  <div className="flex justify-between"><span>Hand / Pan</span><kbd className="px-1.5 py-0.5 bg-slate-200 dark:bg-white/10 rounded font-mono text-[9px]">H</kbd></div>
                  <div className="flex justify-between"><span>Rectangle</span><kbd className="px-1.5 py-0.5 bg-slate-200 dark:bg-white/10 rounded font-mono text-[9px]">R</kbd></div>
                  <div className="flex justify-between"><span>Circle</span><kbd className="px-1.5 py-0.5 bg-slate-200 dark:bg-white/10 rounded font-mono text-[9px]">C</kbd></div>
                  <div className="flex justify-between"><span>Text Tool</span><kbd className="px-1.5 py-0.5 bg-slate-200 dark:bg-white/10 rounded font-mono text-[9px]">T</kbd></div>
                  <div className="flex justify-between"><span>Undo</span><kbd className="px-1.5 py-0.5 bg-slate-200 dark:bg-white/10 rounded font-mono text-[9px]">Ctrl+Z</kbd></div>
                  <div className="flex justify-between"><span>Redo</span><kbd className="px-1.5 py-0.5 bg-slate-200 dark:bg-white/10 rounded font-mono text-[9px]">Ctrl+Y</kbd></div>
                  <div className="flex justify-between"><span>Delete Selected</span><kbd className="px-1.5 py-0.5 bg-slate-200 dark:bg-white/10 rounded font-mono text-[9px]">Del</kbd></div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* CANVAS CONTAINER */}
          <div 
            ref={containerRef}
            className="absolute inset-0 overflow-auto select-none"
            style={{ touchAction: 'none' }}
          >
            <div
              ref={boardRef}
              style={{
                width: "3000px",
                height: "2500px",
                position: "relative",
                transform: `scale(${zoomLevel})`,
                transformOrigin: "top left",
                cursor: tool === "hand" ? (isDrawing ? "grabbing" : "grab") : tool === "eraser" || tool === "stroke_eraser" ? "cell" : tool === "text" ? "text" : "crosshair"
              }}
            >
              {/* Background Pattern Rendering */}
              <div className={`absolute inset-0 pointer-events-none transition-opacity duration-500 ${
                pattern === "dots" 
                  ? "bg-[radial-gradient(#94a3b8_1.5px,transparent_1.5px)] dark:bg-[radial-gradient(#334155_1.5px,transparent_1.5px)] [background-size:32px_32px] opacity-70"
                  : pattern === "grid"
                  ? "bg-[linear-gradient(to_right,#cbd5e1_1px,transparent_1px),linear-gradient(to_bottom,#cbd5e1_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] [background-size:32px_32px] opacity-50"
                  : pattern === "ruled"
                  ? "bg-[linear-gradient(to_bottom,#cbd5e1_1.5px,transparent_1.5px)] dark:bg-[linear-gradient(to_bottom,#334155_1.5px,transparent_1.5px)] [background-size:100%_32px] opacity-60"
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

              {/* STICKY NOTES OVERLAYS */}
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
                  className={`w-56 h-56 border p-4 rounded-2xl shadow-2xl flex flex-col justify-between select-text cursor-default backdrop-blur-md ${
                    stickyColors[note.color as keyof typeof stickyColors] || stickyColors.yellow
                  }`}
                >
                  <div className="flex items-center justify-between border-b border-black/10 dark:border-white/10 pb-2 cursor-move">
                    <div className="flex gap-2">
                      {(["yellow", "pink", "blue", "green"] as const).map((colorName) => (
                        <button
                          key={colorName}
                          onClick={() => updateNoteColor(note.id, colorName)}
                          className={`w-3.5 h-3.5 rounded-full border border-black/5 hover:scale-110 transition-transform ${
                            colorName === "yellow" ? "bg-amber-300" : 
                            colorName === "pink" ? "bg-pink-300" :
                            colorName === "blue" ? "bg-blue-300" : "bg-emerald-350"
                          } ${note.color === colorName ? "ring-2 ring-indigo-500 scale-110" : ""}`}
                        />
                      ))}
                    </div>
                    <button 
                      onClick={() => deleteNote(note.id)}
                      className="p-1 rounded hover:bg-black/10 dark:hover:bg-white/10 text-black/50 dark:text-white/50 hover:text-red-500"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <textarea
                    value={note.text}
                    onChange={(e) => updateNoteText(note.id, e.target.value)}
                    placeholder="Type note..."
                    className="flex-1 bg-transparent resize-none border-none outline-none text-sm font-semibold leading-relaxed mt-2 placeholder-black/30 dark:placeholder-white/30 overflow-y-auto select-text cursor-text"
                  />
                </motion.div>
              ))}

              {/* FLOATING TEXT TOOL OVERLAY */}
              <AnimatePresence>
                {textInputPos && (
                  <motion.form 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
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
                      placeholder="Type text..."
                      className="px-4 py-2 rounded-xl border-2 bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-2xl focus:outline-none font-bold select-text"
                      style={{ 
                        borderColor: color,
                        fontSize: `${Math.max(14, brushSize * 1.5 + 10)}px`
                      }}
                    />
                  </motion.form>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* FLOATING BOTTOM TOOLBAR */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-50 pointer-events-none">
            <div className="premium-glass-panel p-2 flex items-center gap-1 pointer-events-auto shadow-[0_20px_50px_-10px_rgba(0,0,0,0.5)]">
              
              <ToolButton active={tool === "hand"} onClick={() => setTool("hand")} icon={Hand} label="Pan (H)" />
              <div className="w-[1px] h-7 bg-slate-200 dark:bg-white/10 mx-0.5"></div>
              
              <ToolButton active={tool === "pen"} onClick={() => setTool("pen")} icon={PenTool} label="Pen (P)" />
              <ToolButton active={tool === "lasso"} onClick={() => setTool("lasso")} icon={LassoSelect} label="Lasso Select (L)" extraClass="text-indigo-500 dark:text-indigo-400" />
              
              <button 
                onClick={() => setTool("smart_pen")}
                className={`group relative w-11 h-11 rounded-xl flex items-center justify-center transition-all duration-300 ${
                  tool === "smart_pen"
                    ? "bg-gradient-to-br from-indigo-500 to-purple-500 text-white shadow-[0_0_20px_rgba(99,102,241,0.5)] scale-105"
                    : "text-slate-500 dark:text-slate-400 hover:bg-indigo-500/20 hover:text-indigo-500"
                }`}
                title="Smart AI Pen (S)"
              >
                {tool === "smart_pen" && (
                   <motion.div layoutId="activeTool" className="absolute inset-0 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl shadow-[0_0_15px_rgba(99,102,241,0.5)]" style={{ zIndex: -1 }} />
                )}
                <Sparkles className={`w-4.5 h-4.5 relative z-10 ${isRecognizing ? 'animate-spin text-white' : ''}`} />
                
                <div className="absolute bottom-[calc(100%+12px)] left-1/2 -translate-x-1/2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-[10px] font-bold px-2 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap shadow-xl z-50">
                  Smart AI Pen (S)
                  <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 border-[4px] border-transparent border-t-slate-900 dark:border-t-white"></div>
                </div>
              </button>
              
              <ToolButton active={tool === "highlighter"} onClick={() => setTool("highlighter")} icon={Highlighter} label="Highlighter" />
              <ToolButton active={tool === "eraser"} onClick={() => setTool("eraser")} icon={Eraser} label="Eraser (E)" />
              <ToolButton active={tool === "stroke_eraser"} onClick={() => setTool("stroke_eraser")} icon={Eraser} label="Stroke Eraser" extraClass="text-rose-500" />
              
              <div className="w-[1px] h-7 bg-slate-200 dark:bg-white/10 mx-0.5"></div>
              
              <ToolButton active={tool === "line"} onClick={() => setTool("line")} icon={() => <div className="w-4 h-4 border-t-2 border-current rotate-45 transform origin-center" />} label="Line" />
              <ToolButton active={tool === "arrow"} onClick={() => setTool("arrow")} icon={ArrowRight} label="Arrow (A)" />
              <ToolButton active={tool === "rect"} onClick={() => setTool("rect")} icon={Square} label="Rectangle (R)" />
              <ToolButton active={tool === "triangle"} onClick={() => setTool("triangle")} icon={Triangle} label="Triangle" />
              <ToolButton active={tool === "circle"} onClick={() => setTool("circle")} icon={Circle} label="Circle (C)" />
              
              <div className="w-[1px] h-7 bg-slate-200 dark:bg-white/10 mx-0.5"></div>
              
              <ToolButton active={tool === "text"} onClick={() => setTool("text")} icon={Type} label="Text (T)" />
              <ToolButton active={tool === "sticky"} onClick={() => setTool("sticky")} icon={FileText} label="Sticky Note" />

            </div>
          </div>

          {/* LASSO HUD */}
          <AnimatePresence>
            {selectedStrokeIds.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 20, scale: 0.9 }}
                className="absolute top-20 left-1/2 -translate-x-1/2 z-50 premium-glass-panel px-4 py-2.5 rounded-2xl shadow-2xl flex items-center gap-3 text-slate-900 dark:text-white"
              >
                <div className="flex items-center gap-2 border-r border-slate-200 dark:border-white/10 pr-3">
                  <LassoSelect className="w-4 h-4 text-indigo-500" />
                  <span className="text-xs font-extrabold">{selectedStrokeIds.length} Selected</span>
                </div>

                <div className="flex items-center gap-1 border-r border-slate-200 dark:border-white/10 pr-3">
                  {paletteColors.slice(0, 4).map(c => (
                    <button
                      key={c}
                      onClick={() => recolorSelectedStrokes(c)}
                      className="w-5 h-5 rounded-full hover:scale-110 transition-transform shadow-sm border border-white/20"
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>

                <button
                  onClick={deleteSelectedStrokes}
                  className="p-1.5 rounded-xl bg-rose-500/20 text-rose-500 hover:bg-rose-500/30 font-bold text-xs flex items-center gap-1 transition-all"
                  title="Delete Selection (Del)"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete</span>
                </button>

                <button
                  onClick={() => setSelectedStrokeIds([])}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white"
                  title="Clear Selection"
                >
                  <X className="w-4 h-4" />
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* TOAST NOTIFICATION */}
          <AnimatePresence>
            {toastMsg && (
              <motion.div
                initial={{ opacity: 0, y: 20, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 20, scale: 0.9 }}
                className="absolute bottom-24 left-1/2 -translate-x-1/2 z-50 bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-2.5 font-extrabold text-xs tracking-wide shadow-indigo-500/20"
              >
                <Sparkles className="w-4 h-4 text-indigo-400 dark:text-indigo-600 animate-pulse" />
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
      className={`group relative w-11 h-11 rounded-xl flex items-center justify-center transition-all duration-300 ${
        active
          ? "bg-indigo-600 text-white dark:bg-white dark:text-slate-900 shadow-[0_0_15px_rgba(99,102,241,0.4)] scale-105"
          : `text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/10 ${extraClass}`
      }`}
    >
      {active && (
         <motion.div layoutId="activeTool" className="absolute inset-0 bg-indigo-600 dark:bg-white rounded-xl" style={{ zIndex: -1 }} />
      )}
      <Icon className="w-4.5 h-4.5 relative z-10" />
      <div className="absolute bottom-[calc(100%+12px)] left-1/2 -translate-x-1/2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-[10px] font-bold px-2 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap shadow-xl z-50">
        {label}
        <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 border-[4px] border-transparent border-t-slate-900 dark:border-t-white"></div>
      </div>
    </button>
  );
}
