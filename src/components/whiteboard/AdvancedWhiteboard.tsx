"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/firebase";
import { doc, setDoc, onSnapshot } from "firebase/firestore";
import { 
  Palette, Eraser, Trash2, Download, Users, Share2, 
  Sparkles, Check, ChevronRight, Copy, CheckCheck, 
  Square, Circle, Type, Undo2, Redo2, Grid, Sparkle,
  PenTool, Highlighter, ChevronDown, FileText, X, Hand, Move, LassoSelect, 
  Triangle, ArrowRight, ZoomIn, ZoomOut, RotateCcw, Keyboard,
  Zap, Sun, Moon, Layers, Crosshair, Calculator, Library, Compass,
  Maximize2, Minimize2, Sliders, Image as ImageIcon, Ruler, Mic, Volume2, Plus, ChevronLeft
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

type DrawTool = 
  | "pen" 
  | "highlighter" 
  | "eraser" 
  | "line" 
  | "rect" 
  | "circle" 
  | "triangle" 
  | "arrow" 
  | "text" 
  | "sticky" 
  | "hand" 
  | "stroke_eraser" 
  | "smart_pen" 
  | "lasso" 
  | "laser"
  | "image"
  | "ruler";

type BackgroundPattern = "dots" | "grid" | "ruled" | "isometric" | "blank";
type CanvasTheme = "dark" | "light";

interface StickyNote {
  id: string;
  x: number;
  y: number;
  text: string;
  color: string;
  audioUrl?: string;
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
  text?: string; // Stores text content or base64 image data
}

interface LaserParticle {
  x: number;
  y: number;
  alpha: number;
  color: string;
}

interface WhiteboardPageData {
  id: string;
  title: string;
  strokes: Stroke[];
  stickyNotes: StickyNote[];
}

// Global Image Cache for Canvas Performance
const imageCache = new Map<string, HTMLImageElement>();
function getCachedImage(src: string): HTMLImageElement {
  if (imageCache.has(src)) {
    return imageCache.get(src)!;
  }
  const img = new Image();
  img.src = src;
  imageCache.set(src, img);
  return img;
}

// Intersect math helpers
function segmentsIntersect(p1: Point, p2: Point, p3: Point, p4: Point) {
  const ccw = (A: Point, B: Point, C: Point) => (C.y - A.y) * (B.x - A.x) > (B.y - A.y) * (C.x - A.x);
  return ccw(p1, p3, p4) !== ccw(p2, p3, p4) && ccw(p1, p2, p3) !== ccw(p1, p2, p4);
}

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
  return (insideCount / stroke.points.length) >= 0.15;
}

type DetectedShape =
  | { type: "line"; start: Point; end: Point }
  | { type: "circle"; cx: number; cy: number; r: number }
  | { type: "rectangle"; x: number; y: number; w: number; h: number }
  | { type: "triangle"; start: Point; end: Point }
  | null;

function detectShapeOrLetter(points: Point[]): DetectedShape {
  if (points.length < 5) return null;

  const startPt = points[0];
  const endPt = points[points.length - 1];
  const startEndDist = Math.sqrt(Math.pow(endPt.x - startPt.x, 2) + Math.pow(endPt.y - startPt.y, 2));

  let totalLength = 0;
  for (let i = 0; i < points.length - 1; i++) {
    totalLength += Math.sqrt(Math.pow(points[i+1].x - points[i].x, 2) + Math.pow(points[i+1].y - points[i].y, 2));
  }
  const straightRatio = startEndDist / (totalLength || 1);
  if (straightRatio > 0.85 && startEndDist > 25) {
    return { type: "line", start: startPt, end: endPt };
  }

  if (points.length < 8) return null;

  const { minX, maxX, minY, maxY } = getBoundingBox(points);
  const w = maxX - minX;
  const h = maxY - minY;
  if (w < 15 || h < 15) return null;

  const avgX = points.reduce((sum, p) => sum + p.x, 0) / points.length;
  const avgY = points.reduce((sum, p) => sum + p.y, 0) / points.length;
  const radii = points.map(p => Math.sqrt(Math.pow(p.x - avgX, 2) + Math.pow(p.y - avgY, 2)));
  const avgRadius = radii.reduce((sum, r) => sum + r, 0) / radii.length;
  const radiusVariance = radii.reduce((sum, r) => sum + Math.pow(r - avgRadius, 2), 0) / radii.length;
  const radiusStdDev = Math.sqrt(radiusVariance);
  const coefOfVariation = radiusStdDev / avgRadius;

  const isCircle = coefOfVariation < 0.25;
  if (isCircle && startEndDist < Math.max(w, h) * 0.6) {
    return { type: "circle", cx: avgX, cy: avgY, r: avgRadius };
  }

  let rectDistSum = 0;
  for (const p of points) {
    const distToLeft = Math.abs(p.x - minX);
    const distToRight = Math.abs(p.x - maxX);
    const distToTop = Math.abs(p.y - minY);
    const distToBottom = Math.abs(p.y - maxY);
    rectDistSum += Math.min(distToLeft, distToRight, distToTop, distToBottom);
  }
  const avgRectDist = rectDistSum / points.length;
  if (avgRectDist < Math.min(w, h) * 0.25 && startEndDist < Math.max(w, h) * 0.55) {
    return { type: "rectangle", x: minX, y: minY, w, h };
  }

  return null;
}

// Continuous Smooth Path Renderer (Quad-Midpoint Interpolation)
function renderSmoothPath(ctx: CanvasRenderingContext2D, points: Point[]) {
  if (points.length === 0) return;

  if (points.length === 1) {
    ctx.beginPath();
    ctx.arc(points[0].x, points[0].y, ctx.lineWidth / 2, 0, Math.PI * 2);
    ctx.fill();
    return;
  }

  if (points.length === 2) {
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    ctx.lineTo(points[1].x, points[1].y);
    ctx.stroke();
    return;
  }

  ctx.beginPath();
  ctx.moveTo(points[0].x, points[0].y);

  for (let i = 1; i < points.length - 1; i++) {
    const midX = (points[i].x + points[i + 1].x) / 2;
    const midY = (points[i].y + points[i + 1].y) / 2;
    ctx.quadraticCurveTo(points[i].x, points[i].y, midX, midY);
  }

  const last = points[points.length - 1];
  ctx.lineTo(last.x, last.y);
  ctx.stroke();
}

// Canvas Redraw Engine with Image & Interactive Ruler Rendering
const redrawCanvas = (
  canvas: HTMLCanvasElement, 
  strokesList: Stroke[], 
  selectedIds: string[] = [],
  showRuler: boolean = false,
  rulerPos: { x: number; y: number; angle: number } = { x: 500, y: 500, angle: 0 }
) => {
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
      ctx.globalAlpha = stroke.tool === "highlighter" ? 0.35 : 1.0;
    }

    if (stroke.points.length === 0) continue;

    if (stroke.tool === "image" && stroke.text) {
      const img = getCachedImage(stroke.text);
      const start = stroke.points[0];
      const end = stroke.points[stroke.points.length - 1];
      const w = end.x - start.x;
      const h = end.y - start.y;
      if (img.complete) {
        ctx.drawImage(img, start.x, start.y, w, h);
      } else {
        img.onload = () => {
          ctx.drawImage(img, start.x, start.y, w, h);
        };
      }
    } else if (stroke.tool === "pen" || stroke.tool === "smart_pen" || stroke.tool === "highlighter" || stroke.tool === "eraser") {
      renderSmoothPath(ctx, stroke.points);
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
      ctx.font = `${stroke.brushSize * 3 + 22}px Outfit, Inter, sans-serif`;
      ctx.fillText(stroke.text || "", start.x, start.y);
    }
  }

  // Draw Selection Box & Handles for Selected Items
  if (selectedIds.length > 0) {
    const selectedStrokes = strokesList.filter(s => selectedIds.includes(s.id));
    const allPts = selectedStrokes.flatMap(s => s.points);
    if (allPts.length > 0) {
      const box = getBoundingBox(allPts);
      const p = 12;
      const x = box.minX - p;
      const y = box.minY - p;
      const w = box.maxX - box.minX + 2 * p;
      const h = box.maxY - box.minY + 2 * p;

      ctx.save();
      ctx.strokeStyle = "#6366f1";
      ctx.lineWidth = 2;
      ctx.setLineDash([6, 4]);
      ctx.strokeRect(x, y, w, h);

      ctx.fillStyle = "rgba(99, 102, 241, 0.08)";
      ctx.fillRect(x, y, w, h);

      const handles = [
        { x, y },
        { x: x + w, y },
        { x, y: y + h },
        { x: x + w, y: y + h }
      ];

      ctx.setLineDash([]);
      ctx.fillStyle = "#ffffff";
      ctx.strokeStyle = "#6366f1";
      ctx.lineWidth = 2;

      for (const hPos of handles) {
        ctx.beginPath();
        ctx.arc(hPos.x, hPos.y, 6, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      }
      ctx.restore();
    }
  }

  // Render Interactive Metric Ruler Overlay
  if (showRuler) {
    ctx.save();
    ctx.translate(rulerPos.x, rulerPos.y);
    ctx.rotate((rulerPos.angle * Math.PI) / 180);

    const rulerW = 600;
    const rulerH = 80;

    // Translucent glass body
    ctx.fillStyle = "rgba(30, 41, 59, 0.85)";
    ctx.strokeStyle = "#6366f1";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(-rulerW / 2, -rulerH / 2, rulerW, rulerH, 12);
    ctx.fill();
    ctx.stroke();

    // Centimeter ticks & numbers
    ctx.strokeStyle = "#94a3b8";
    ctx.fillStyle = "#cbd5e1";
    ctx.font = "10px Outfit, sans-serif";
    ctx.textAlign = "center";

    const cmPx = 40; // 40px per cm
    const totalCm = Math.floor(rulerW / cmPx);

    for (let i = 0; i <= totalCm; i++) {
      const tx = -rulerW / 2 + i * cmPx + 20;
      // Main cm tick
      ctx.beginPath();
      ctx.moveTo(tx, -rulerH / 2);
      ctx.lineTo(tx, -rulerH / 2 + 18);
      ctx.stroke();
      ctx.fillText(`${i} cm`, tx, -rulerH / 2 + 30);

      // Half cm tick
      if (i < totalCm) {
        ctx.beginPath();
        ctx.moveTo(tx + cmPx / 2, -rulerH / 2);
        ctx.lineTo(tx + cmPx / 2, -rulerH / 2 + 10);
        ctx.stroke();
      }
    }
    ctx.restore();
  }

  ctx.globalAlpha = 1.0;
  ctx.globalCompositeOperation = "source-over";
};

export default function AdvancedWhiteboard({ roomId: propRoomId, isEmbedded = false }: { roomId?: string; isEmbedded?: boolean }) {
  const { user } = useAuth();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const laserCanvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Dynamic Canvas Dimensions State
  const [canvasSize, setCanvasSize] = useState<{ width: number; height: number }>({
    width: 3200,
    height: 2400
  });

  // Multi-Page Deck State
  const [deckPages, setDeckPages] = useState<WhiteboardPageData[]>([
    { id: "page_1", title: "Page 1", strokes: [], stickyNotes: [] }
  ]);
  const [activePageIndex, setActivePageIndex] = useState(0);

  const imageUploadInputRef = useRef<HTMLInputElement>(null);

  const isDrawingRef = useRef(false);
  const isMovingSelectionRef = useRef(false);
  const selectionDragStartRef = useRef<Point | null>(null);
  const selectionInitialPointsRef = useRef<{ strokeId: string; points: Point[] }[]>([]);

  const lastPointRef = useRef<Point | null>(null);
  const strokePointsRef = useRef<Point[]>([]);
  const laserParticlesRef = useRef<LaserParticle[]>([]);
  const animFrameRef = useRef<number | null>(null);

  const paletteColors = [
    "#6366f1", "#000000", "#ef4444", "#f97316", "#f59e0b", 
    "#10b981", "#06b6d4", "#3b82f6", "#a855f7", "#ec4899", "#ffffff"
  ];

  const stickyColors = [
    { name: "yellow", bg: "bg-amber-100 dark:bg-amber-900/40 text-amber-900 dark:text-amber-100 border-amber-300 dark:border-amber-700" },
    { name: "cyan", bg: "bg-cyan-100 dark:bg-cyan-900/40 text-cyan-900 dark:text-cyan-100 border-cyan-300 dark:border-cyan-700" },
    { name: "pink", bg: "bg-pink-100 dark:bg-pink-900/40 text-pink-900 dark:text-pink-100 border-pink-300 dark:border-pink-700" },
    { name: "green", bg: "bg-emerald-100 dark:bg-emerald-900/40 text-emerald-900 dark:text-emerald-100 border-emerald-300 dark:border-emerald-700" },
    { name: "purple", bg: "bg-purple-100 dark:bg-purple-900/40 text-purple-900 dark:text-purple-100 border-purple-300 dark:border-purple-700" }
  ];

  // Primary Tool States
  const [isDrawing, setIsDrawing] = useState(false);
  const [tool, setTool] = useState<DrawTool>("pen");
  const [color, setColor] = useState("#6366f1");
  const [brushSize, setBrushSize] = useState(4);
  const [showThicknessMenu, setShowThicknessMenu] = useState(false);
  const [fillShapes, setFillShapes] = useState(false);
  const [pattern, setPattern] = useState<BackgroundPattern>("dots");
  const [canvasTheme, setCanvasTheme] = useState<CanvasTheme>("dark");
  const [zoomLevel, setZoomLevel] = useState(1);
  const [selectedStrokeIds, setSelectedStrokeIds] = useState<string[]>([]);
  const [showKeyShortcuts, setShowKeyShortcuts] = useState(false);

  // Ruler State
  const [showRuler, setShowRuler] = useState(false);
  const [rulerPos, setRulerPos] = useState<{ x: number; y: number; angle: number }>({ x: 800, y: 600, angle: 0 });

  // Modals & Panels
  const [showPresetBank, setShowPresetBank] = useState(false);
  const [solvingAI, setSolvingAI] = useState(false);
  const [aiSolution, setAiSolution] = useState<string | null>(null);

  // Active Page Shortcuts
  const activePage = deckPages[activePageIndex] || deckPages[0];
  const strokes = activePage.strokes;
  const stickyNotes = activePage.stickyNotes;

  const setStrokes = (action: Stroke[] | ((prev: Stroke[]) => Stroke[])) => {
    setDeckPages(prev => prev.map((pg, idx) => {
      if (idx === activePageIndex) {
        const nextStrokes = typeof action === "function" ? action(pg.strokes) : action;
        return { ...pg, strokes: nextStrokes };
      }
      return pg;
    }));
  };

  const setStickyNotes = (action: StickyNote[] | ((prev: StickyNote[]) => StickyNote[])) => {
    setDeckPages(prev => prev.map((pg, idx) => {
      if (idx === activePageIndex) {
        const nextNotes = typeof action === "function" ? action(pg.stickyNotes) : action;
        return { ...pg, stickyNotes: nextNotes };
      }
      return pg;
    }));
  };

  const [accumulatedSmartStrokes, setAccumulatedSmartStrokes] = useState<Stroke[]>([]);
  const [isRecognizing, setIsRecognizing] = useState(false);
  const smartPenTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Panning States
  const [startScrollLeft, setStartScrollLeft] = useState(0);
  const [startScrollTop, setStartScrollTop] = useState(0);
  const [startX, setStartX] = useState(0);
  const [startY, setStartY] = useState(0);

  // Notifications
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 2500);
  };

  // Collaboration Room
  const [roomId, setRoomId] = useState("");
  const [roomInput, setRoomInput] = useState("");
  const [joined, setJoined] = useState(false);
  const [copied, setCopied] = useState(false);

  // Text Tool
  const [textInputPos, setTextInputPos] = useState<{ x: number; y: number } | null>(null);
  const [textValue, setTextValue] = useState("");

  // History Stack
  const [history, setHistory] = useState<string[]>([]);
  const [historyStep, setHistoryStep] = useState(-1);

  const nickname = (typeof window !== "undefined" ? localStorage.getItem("edutrack_nickname") : null) || (user as any)?.displayName?.split(" ")[0] || (user as any)?.name?.split(" ")[0] || (user as any)?.email?.split("@")[0] || "User";

  // Dynamic Window / Container Sizing Listener
  useEffect(() => {
    const handleResize = () => {
      if (typeof window !== "undefined") {
        const width = Math.max(window.innerWidth, 3200);
        const height = Math.max(window.innerHeight, 2400);
        setCanvasSize({ width, height });
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      redrawCanvas(canvas, strokes, selectedStrokeIds, showRuler, rulerPos);
    }
  }, [canvasSize, strokes, selectedStrokeIds, showRuler, rulerPos, activePageIndex]);

  useEffect(() => {
    if (propRoomId) {
      setRoomId(propRoomId);
      setRoomInput(propRoomId);
      setJoined(true);
    } else {
      const randomNum = Math.floor(1000 + Math.random() * 9000);
      setRoomId(`ROOM-${randomNum}`);
      setRoomInput(`ROOM-${randomNum}`);
    }
  }, [propRoomId]);

  // Page Management Functions
  const addNewPage = () => {
    const newPgNumber = deckPages.length + 1;
    const newPg: WhiteboardPageData = {
      id: `page_${Date.now()}`,
      title: `Page ${newPgNumber}`,
      strokes: [],
      stickyNotes: []
    };
    setDeckPages(prev => [...prev, newPg]);
    setActivePageIndex(deckPages.length);
    setSelectedStrokeIds([]);
    showToast(`Created Page ${newPgNumber} `);
  };

  // Image Upload / Import Handler
  const handleImageImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64 = event.target?.result as string;
        const img = new Image();
        img.onload = () => {
          const cx = 1000;
          const cy = 800;
          const aspect = img.height / (img.width || 1);
          const w = Math.min(600, img.width || 400);
          const h = w * aspect;

          const newStroke: Stroke = {
            id: Date.now().toString(),
            tool: "image",
            color: "#ffffff",
            brushSize: 1,
            points: [{ x: cx - w/2, y: cy - h/2 }, { x: cx + w/2, y: cy + h/2 }],
            text: base64
          };

          setStrokes(prev => [...prev, newStroke]);
          setSelectedStrokeIds([newStroke.id]);
          showToast("Imported Image to Canvas ️");
          pushToHistory();
          syncCanvas();
        };
        img.src = base64;
      };
      reader.readAsDataURL(file);
    }
  };

  // Laser Pointer Animation Loop
  useEffect(() => {
    const renderLaser = () => {
      const canvas = laserCanvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          laserParticlesRef.current = laserParticlesRef.current
            .map(p => ({ ...p, alpha: p.alpha - 0.04 }))
            .filter(p => p.alpha > 0);

          for (const p of laserParticlesRef.current) {
            ctx.beginPath();
            ctx.arc(p.x, p.y, 6 * p.alpha, 0, Math.PI * 2);
            ctx.fillStyle = p.color === "#ffffff" ? `rgba(6, 182, 212, ${p.alpha})` : `rgba(239, 68, 68, ${p.alpha})`;
            ctx.shadowBlur = 12;
            ctx.shadowColor = p.color;
            ctx.fill();
            ctx.shadowBlur = 0;
          }
        }
      }
      animFrameRef.current = requestAnimationFrame(renderLaser);
    };

    animFrameRef.current = requestAnimationFrame(renderLaser);
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
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

  // Keyboard Shortcuts Listener
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
      } else if (key === 'p') setTool("pen");
      else if (key === 's') setTool("smart_pen");
      else if (key === 'e') setTool("eraser");
      else if (key === 'l') setTool("lasso");
      else if (key === 'h') setTool("hand");
      else if (key === 'r') setTool("rect");
      else if (key === 'c') setTool("circle");
      else if (key === 't') setTool("text");
      else if (key === 'x') setTool("laser");
      else if (key === 'delete' || key === 'backspace') {
        if (selectedStrokeIds.length > 0) deleteSelectedStrokes();
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
    setSelectedStrokeIds([]);
    pushToHistory();
    syncCanvas([]);
    showToast("Canvas Cleared ");
  };

  const downloadCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = `edutrack-whiteboard-${roomId}-page${activePageIndex + 1}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
    showToast("Downloaded PNG Export ");
  };

  const solveWhiteboardWithAI = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    setSolvingAI(true);
    try {
      const dataUrl = canvas.toDataURL("image/png");
      const strokesText = strokes
        .filter(s => s.text)
        .map(s => s.text)
        .join(" ");

      const res = await fetch("/api/whiteboard/solve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          image: dataUrl,
          prompt: strokesText || "log_10(1) + log_10(10) =",
          strokesText
        })
      });
      const data = await res.json();
      setAiSolution(data.solution || "No solution returned.");
    } catch (e: any) {
      setAiSolution("Failed to solve whiteboard. Please check connection.");
    }
    setSolvingAI(false);
  };

  // Educational Preset Diagram Generators
  const insertPresetDiagram = (type: string) => {
    const cx = 800;
    const cy = 600;
    const colorToUse = color || "#6366f1";
    let newStrokes: Stroke[] = [];

    if (type === "axes") {
      newStrokes = [
        { id: Date.now().toString() + "_1", tool: "line", color: colorToUse, brushSize: 3, points: [{ x: cx - 300, y: cy }, { x: cx + 300, y: cy }] },
        { id: Date.now().toString() + "_2", tool: "line", color: colorToUse, brushSize: 3, points: [{ x: cx, y: cy - 250 }, { x: cx, y: cy + 250 }] },
        { id: Date.now().toString() + "_3", tool: "text", color: colorToUse, brushSize: 4, points: [{ x: cx + 310, y: cy + 10 }], text: "X" },
        { id: Date.now().toString() + "_4", tool: "text", color: colorToUse, brushSize: 4, points: [{ x: cx - 15, y: cy - 260 }], text: "Y" },
        { id: Date.now().toString() + "_5", tool: "text", color: colorToUse, brushSize: 3, points: [{ x: cx - 25, y: cy + 25 }], text: "(0,0)" }
      ];
    } else if (type === "triangle") {
      newStrokes = [
        { id: Date.now().toString() + "_1", tool: "triangle", color: colorToUse, brushSize: 3, points: [{ x: cx - 150, y: cy - 150 }, { x: cx + 150, y: cy + 150 }] },
        { id: Date.now().toString() + "_2", tool: "text", color: colorToUse, brushSize: 4, points: [{ x: cx - 180, y: cy + 160 }], text: "A" },
        { id: Date.now().toString() + "_3", tool: "text", color: colorToUse, brushSize: 4, points: [{ x: cx + 160, y: cy + 160 }], text: "B" },
        { id: Date.now().toString() + "_4", tool: "text", color: colorToUse, brushSize: 4, points: [{ x: cx - 10, y: cy - 170 }], text: "C" }
      ];
    } else if (type === "unit_circle") {
      newStrokes = [
        { id: Date.now().toString() + "_1", tool: "circle", color: colorToUse, brushSize: 3, points: [{ x: cx, y: cy }, { x: cx + 180, y: cy }] },
        { id: Date.now().toString() + "_2", tool: "line", color: colorToUse, brushSize: 2, points: [{ x: cx - 220, y: cy }, { x: cx + 220, y: cy }] },
        { id: Date.now().toString() + "_3", tool: "line", color: colorToUse, brushSize: 2, points: [{ x: cx, y: cy - 220 }, { x: cx, y: cy + 220 }] },
        { id: Date.now().toString() + "_4", tool: "text", color: colorToUse, brushSize: 3, points: [{ x: cx + 190, y: cy - 10 }], text: "0°" },
        { id: Date.now().toString() + "_5", tool: "text", color: colorToUse, brushSize: 3, points: [{ x: cx - 15, y: cy - 230 }], text: "90°" }
      ];
    } else if (type === "venn") {
      newStrokes = [
        { id: Date.now().toString() + "_1", tool: "circle", color: "#3b82f6", brushSize: 3, points: [{ x: cx - 80, y: cy }, { x: cx + 70, y: cy }] },
        { id: Date.now().toString() + "_2", tool: "circle", color: "#ec4899", brushSize: 3, points: [{ x: cx + 80, y: cy }, { x: cx + 230, y: cy }] },
        { id: Date.now().toString() + "_3", tool: "text", color: "#3b82f6", brushSize: 4, points: [{ x: cx - 160, y: cy - 140 }], text: "Set A" },
        { id: Date.now().toString() + "_4", tool: "text", color: "#ec4899", brushSize: 4, points: [{ x: cx + 140, y: cy - 140 }], text: "Set B" }
      ];
    }

    setStrokes(prev => {
      const next = [...prev, ...newStrokes];
      const canvas = canvasRef.current;
      if (canvas) redrawCanvas(canvas, next, selectedStrokeIds, showRuler, rulerPos);
      return next;
    });
    setShowPresetBank(false);
    showToast(`Inserted ${type.replace("_", " ")} preset `);
  };

  // Selection Manipulation Actions
  const duplicateSelectedStrokes = () => {
    if (selectedStrokeIds.length === 0) return;
    const selectedStrokes = strokes.filter(s => selectedStrokeIds.includes(s.id));
    const newStrokes: Stroke[] = selectedStrokes.map(s => ({
      ...s,
      id: Date.now().toString() + "_" + Math.random().toString(36).substring(2, 6),
      points: s.points.map(p => ({ x: p.x + 30, y: p.y + 30 }))
    }));

    const newIds = newStrokes.map(s => s.id);
    setStrokes(prev => [...prev, ...newStrokes]);
    setSelectedStrokeIds(newIds);
    showToast(`Duplicated ${newStrokes.length} element${newStrokes.length > 1 ? "s" : ""} `);
    pushToHistory();
    syncCanvas();
  };

  const recolorSelectedStrokes = (newColor: string) => {
    if (selectedStrokeIds.length === 0) return;
    setColor(newColor);
    setStrokes(prev => {
      const next = prev.map(s => selectedStrokeIds.includes(s.id) ? { ...s, color: newColor } : s);
      const canvas = canvasRef.current;
      if (canvas) redrawCanvas(canvas, next, selectedStrokeIds, showRuler, rulerPos);
      return next;
    });
    showToast("Recolored selected elements ");
    pushToHistory();
    syncCanvas();
  };

  const scaleSelectedStrokes = (scaleFactor: number) => {
    if (selectedStrokeIds.length === 0) return;
    const selectedStrokes = strokes.filter(s => selectedStrokeIds.includes(s.id));
    const box = getBoundingBox(selectedStrokes.flatMap(s => s.points));
    const cx = (box.minX + box.maxX) / 2;
    const cy = (box.minY + box.maxY) / 2;

    setStrokes(prev => {
      const next = prev.map(s => {
        if (selectedStrokeIds.includes(s.id)) {
          return {
            ...s,
            points: s.points.map(p => ({
              x: cx + (p.x - cx) * scaleFactor,
              y: cy + (p.y - cy) * scaleFactor
            }))
          };
        }
        return s;
      });
      const canvas = canvasRef.current;
      if (canvas) redrawCanvas(canvas, next, selectedStrokeIds, showRuler, rulerPos);
      return next;
    });
    showToast(`Scaled elements (${scaleFactor > 1 ? "Enlarged" : "Shrunk"}) `);
    pushToHistory();
    syncCanvas();
  };

  // Precise Canvas Coordinate Scaling Calculation
  const getCoordinates = (e: any) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    let clientX = e.clientX;
    let clientY = e.clientY;
    if (e.touches && e.touches.length > 0) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    }
    const scaleX = canvas.width / (rect.width || 1);
    const scaleY = canvas.height / (rect.height || 1);
    const x = ((clientX - rect.left) * scaleX) / zoomLevel;
    const y = ((clientY - rect.top) * scaleY) / zoomLevel;
    return { x, y };
  };

  const processSmartPen = async () => {
    if (accumulatedSmartStrokes.length === 0) return;
    setIsRecognizing(true);
    try {
      const tempCanvas = document.createElement("canvas");
      tempCanvas.width = canvasRef.current?.width || canvasSize.width;
      tempCanvas.height = canvasRef.current?.height || canvasSize.height;
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
         setStrokes(prev => [...prev, ...accumulatedSmartStrokes]);
      }
    } catch (e) {
      setStrokes(prev => [...prev, ...accumulatedSmartStrokes]);
    }
    setAccumulatedSmartStrokes([]);
    setIsRecognizing(false);
  };

  const startDrawing = (e: any) => {
    const coords = getCoordinates(e);

    // If selection exists and user clicks inside selection box, initiate Move Selection
    if (selectedStrokeIds.length > 0) {
      const selectedStrokes = strokes.filter(s => selectedStrokeIds.includes(s.id));
      const box = getBoundingBox(selectedStrokes.flatMap(s => s.points));
      const p = 15;
      if (coords.x >= box.minX - p && coords.x <= box.maxX + p && coords.y >= box.minY - p && coords.y <= box.maxY + p) {
        isMovingSelectionRef.current = true;
        selectionDragStartRef.current = coords;
        selectionInitialPointsRef.current = selectedStrokes.map(s => ({
          strokeId: s.id,
          points: s.points.map(pt => ({ x: pt.x, y: pt.y }))
        }));
        return;
      }
    }

    if (tool === "hand") {
      setIsDrawing(true);
      isDrawingRef.current = true;
      setStartScrollLeft(containerRef.current?.scrollLeft || 0);
      setStartScrollTop(containerRef.current?.scrollTop || 0);
      setStartX(coords.x * zoomLevel);
      setStartY(coords.y * zoomLevel);
      return;
    }
    
    if (tool === "text" || tool === "sticky") return;
    
    setIsDrawing(true);
    isDrawingRef.current = true;
    lastPointRef.current = coords;
    strokePointsRef.current = [coords];

    if (tool === "laser") {
      laserParticlesRef.current.push({ x: coords.x, y: coords.y, alpha: 1.0, color });
    }
    
    if (smartPenTimerRef.current) {
      clearTimeout(smartPenTimerRef.current);
      smartPenTimerRef.current = null;
    }
  };

  const draw = (e: any) => {
    const coords = getCoordinates(e);

    // Handle Dragging / Moving Selected Elements
    if (isMovingSelectionRef.current && selectionDragStartRef.current) {
      const dx = coords.x - selectionDragStartRef.current.x;
      const dy = coords.y - selectionDragStartRef.current.y;

      setStrokes(prev => {
        const next = prev.map(s => {
          const init = selectionInitialPointsRef.current.find(item => item.strokeId === s.id);
          if (init) {
            return {
              ...s,
              points: init.points.map(pt => ({ x: pt.x + dx, y: pt.y + dy }))
            };
          }
          return s;
        });
        const canvas = canvasRef.current;
        if (canvas) redrawCanvas(canvas, next, selectedStrokeIds, showRuler, rulerPos);
        return next;
      });
      return;
    }

    if (!isDrawingRef.current) return;
    
    if (tool === "hand") {
      const dx = coords.x * zoomLevel - startX;
      const dy = coords.y * zoomLevel - startY;
      if (containerRef.current) {
        containerRef.current.scrollLeft = startScrollLeft - dx;
        containerRef.current.scrollTop = startScrollTop - dy;
      }
      return;
    }

    const lastPt = strokePointsRef.current[strokePointsRef.current.length - 1];
    if (lastPt) {
      const dist = Math.hypot(coords.x - lastPt.x, coords.y - lastPt.y);
      if (dist < 2) return;
    }

    strokePointsRef.current.push(coords);

    if (tool === "laser") {
      laserParticlesRef.current.push({ x: coords.x, y: coords.y, alpha: 1.0, color });
      return;
    }
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    if (tool === "lasso") {
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      redrawCanvas(canvas, strokes, selectedStrokeIds, showRuler, rulerPos);
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

    const liveStroke: Stroke = {
      id: "live_preview",
      tool,
      color,
      brushSize,
      fill: fillShapes,
      points: [...strokePointsRef.current]
    };

    redrawCanvas(canvas, [...strokes, liveStroke], selectedStrokeIds, showRuler, rulerPos);
    lastPointRef.current = coords;
  };

  const stopDrawing = () => {
    if (isMovingSelectionRef.current) {
      isMovingSelectionRef.current = false;
      selectionDragStartRef.current = null;
      selectionInitialPointsRef.current = [];
      pushToHistory();
      syncCanvas();
      return;
    }

    if (!isDrawingRef.current) return;
    setIsDrawing(false);
    isDrawingRef.current = false;
    
    if (tool === "hand" || tool === "laser") return;

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
        if (canvas) redrawCanvas(canvas, next, selectedStrokeIds, showRuler, rulerPos);
        return next;
      });
    } else if (tool === "smart_pen") {
      const detected = detectShapeOrLetter(points);
      if (detected) {
        let cleanStroke: Stroke | null = null;
        if (detected.type === "line") {
          cleanStroke = { id: Date.now().toString(), tool: "line", color, brushSize, points: [detected.start, detected.end] };
          showToast("Snapped to Line ");
        } else if (detected.type === "circle") {
          const { cx, cy, r } = detected;
          cleanStroke = { id: Date.now().toString(), tool: "circle", color, brushSize, fill: fillShapes, points: [{ x: cx, y: cy }, { x: cx + r, y: cy }] };
          showToast("Snapped to Circle ");
        } else if (detected.type === "rectangle") {
          const { x, y, w, h } = detected;
          cleanStroke = { id: Date.now().toString(), tool: "rect", color, brushSize, fill: fillShapes, points: [{ x, y }, { x: x + w, y: y + h }] };
          showToast("Snapped to Rectangle ");
        } else if (detected.type === "triangle") {
          cleanStroke = { id: Date.now().toString(), tool: "triangle", color, brushSize, fill: fillShapes, points: [detected.start, detected.end] };
          showToast("Snapped to Triangle ");
        }

        if (cleanStroke) {
          setStrokes(prev => {
            const next = [...prev, cleanStroke];
            const canvas = canvasRef.current;
            if (canvas) redrawCanvas(canvas, next, selectedStrokeIds, showRuler, rulerPos);
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
        showToast(`Selected ${selected.length} element${selected.length > 1 ? "s" : ""} `);
      } else {
        setSelectedStrokeIds([]);
      }
      const canvas = canvasRef.current;
      if (canvas) redrawCanvas(canvas, strokes, selected, showRuler, rulerPos);
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
      if (canvas) redrawCanvas(canvas, next, [], showRuler, rulerPos);
      return next;
    });
    setSelectedStrokeIds([]);
    showToast("Deleted selected elements ️");
    pushToHistory();
    syncCanvas();
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
      showToast(`Joined Room ${roomInput.toUpperCase()} `);
    }
  };

  // Selected Bounding Box Calculation for Floating Toolbar
  const selectedStrokes = strokes.filter(s => selectedStrokeIds.includes(s.id));
  const selectedPts = selectedStrokes.flatMap(s => s.points);
  const selBox = selectedPts.length > 0 ? getBoundingBox(selectedPts) : null;

  return (
    <div className={`relative w-full h-screen overflow-hidden select-none ${canvasTheme === "dark" ? "bg-slate-950 text-slate-100" : "bg-slate-50 text-slate-900"}`}>
      {/* Hidden File Input for Image Import */}
      <input
        ref={imageUploadInputRef}
        type="file"
        accept="image/*"
        onChange={handleImageImport}
        className="hidden"
      />

      {/* Toast Notification */}
      <AnimatePresence>
        {toastMsg && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-20 left-1/2 -translate-x-1/2 z-50 px-4 py-2 dark:bg-slate-900/90 bg-slate-200/90 dark:text-slate-100 text-slate-900 border border-slate-700/60 rounded-full shadow-2xl backdrop-blur-md text-xs font-semibold flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4 dark:text-amber-400 text-amber-700" />
            <span>{toastMsg}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Selection Toolbar */}
      <AnimatePresence>
        {selBox && selectedStrokeIds.length > 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="absolute z-50 transform -translate-x-1/2 flex items-center gap-1.5 p-1.5 dark:bg-slate-900/95 bg-slate-200/95 border border-indigo-500/50 rounded-2xl shadow-2xl backdrop-blur-2xl dark:text-slate-100 text-slate-900"
            style={{
              left: Math.max(160, Math.min(window.innerWidth - 160, (selBox.minX + selBox.maxX) / 2)),
              top: Math.max(80, selBox.minY - 55)
            }}
          >
            <button
              onClick={duplicateSelectedStrokes}
              className="p-2 hover:bg-slate-800 rounded-xl dark:text-slate-200 text-slate-800 hover:dark:text-white text-slate-900 transition-all flex items-center gap-1 text-xs font-semibold"
              title="Duplicate (Clone)"
            >
              <Copy className="w-3.5 h-3.5 dark:text-indigo-400 text-indigo-700" />
              <span>Duplicate</span>
            </button>

            <button
              onClick={() => scaleSelectedStrokes(1.2)}
              className="p-2 hover:bg-slate-800 rounded-xl dark:text-slate-200 text-slate-800 hover:dark:text-white text-slate-900 transition-all flex items-center gap-1 text-xs font-semibold"
              title="Enlarge"
            >
              <Maximize2 className="w-3.5 h-3.5 dark:text-cyan-400 text-cyan-700" />
            </button>

            <button
              onClick={() => scaleSelectedStrokes(0.8)}
              className="p-2 hover:bg-slate-800 rounded-xl dark:text-slate-200 text-slate-800 hover:dark:text-white text-slate-900 transition-all flex items-center gap-1 text-xs font-semibold"
              title="Shrink"
            >
              <Minimize2 className="w-3.5 h-3.5 dark:text-cyan-400 text-cyan-700" />
            </button>

            <div className="w-px h-4 bg-slate-800 my-auto" />

            {paletteColors.slice(0, 4).map(c => (
              <button
                key={c}
                onClick={() => recolorSelectedStrokes(c)}
                className="w-4 h-4 rounded-full border border-slate-700 hover:scale-110 transition-transform"
                style={{ backgroundColor: c }}
              />
            ))}

            <div className="w-px h-4 bg-slate-800 my-auto" />

            <button
              onClick={deleteSelectedStrokes}
              className="p-2 hover:bg-rose-500/20 text-rose-400 rounded-xl transition-all"
              title="Delete Selected"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={() => setSelectedStrokeIds([])}
              className="p-2 hover:bg-slate-800 rounded-xl dark:text-slate-400 text-slate-600 hover:dark:text-white text-slate-900 transition-all"
              title="Deselect"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Top Floating Bar */}
      <header className="absolute top-4 left-4 right-4 z-40 flex items-center justify-between pointer-events-none">
        <div className="flex items-center gap-3 pointer-events-auto">
          <div className="px-3 py-2 dark:bg-slate-900/80 bg-slate-200/80 backdrop-blur-xl border border-slate-800 rounded-2xl shadow-xl flex items-center gap-2">
            <div className="p-1.5 bg-gradient-to-tr from-indigo-500 to-cyan-400 rounded-xl text-white shadow-md">
              <Zap className="w-4 h-4" />
            </div>
            <div>
              <h1 className="text-xs font-bold tracking-wide bg-gradient-to-r from-indigo-300 via-cyan-200 to-white bg-clip-text text-transparent">
                {isEmbedded ? "Co-Op Board" : "EduTrack Pro Whiteboard"}
              </h1>
              <p className="text-[10px] dark:text-slate-400 text-slate-600 font-medium">{isEmbedded ? "Live Collaborative Canvas" : "Infinite Canvas & Multi-Page Deck"}</p>
            </div>
          </div>

          {/* Multi-Page Slide Deck Switcher */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 dark:bg-slate-900/80 bg-slate-200/80 backdrop-blur-xl border border-slate-800 rounded-2xl shadow-xl text-xs font-semibold">
            <button
              onClick={() => setActivePageIndex(prev => Math.max(0, prev - 1))}
              disabled={activePageIndex === 0}
              className="p-1 hover:bg-slate-800 rounded-lg dark:text-slate-300 text-slate-700 disabled:opacity-40"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <span className="font-mono dark:text-indigo-300 text-indigo-700">
              {activePageIndex + 1} / {deckPages.length}
            </span>
            <button
              onClick={() => setActivePageIndex(prev => Math.min(deckPages.length - 1, prev + 1))}
              disabled={activePageIndex === deckPages.length - 1}
              className="p-1 hover:bg-slate-800 rounded-lg dark:text-slate-300 text-slate-700 disabled:opacity-40"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={addNewPage}
              className="p-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-all ml-1"
              title="Add New Slide Page"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Theme Toggle */}
          <button
            onClick={() => setCanvasTheme(t => t === "dark" ? "light" : "dark")}
            className="p-2.5 dark:bg-slate-900/80 bg-slate-200/80 hover:bg-slate-800 backdrop-blur-xl border border-slate-800 rounded-2xl shadow-xl dark:text-slate-300 text-slate-700 transition-all"
            title="Toggle Canvas Theme"
          >
            {canvasTheme === "dark" ? <Sun className="w-4 h-4 dark:text-amber-400 text-amber-700" /> : <Moon className="w-4 h-4 dark:text-indigo-400 text-indigo-700" />}
          </button>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 pointer-events-auto">
          {/* Import Image */}
          <button
            onClick={() => imageUploadInputRef.current?.click()}
            className="px-3 py-2 dark:bg-slate-900/80 bg-slate-200/80 hover:bg-slate-800 border border-slate-800 dark:text-slate-200 text-slate-800 rounded-2xl text-xs font-semibold backdrop-blur-xl shadow-lg flex items-center gap-1.5 transition-all"
            title="Import Image to Canvas"
          >
            <ImageIcon className="w-4 h-4 dark:text-emerald-400 text-emerald-700" />
            <span>Import Image</span>
          </button>

          {/* Metric Ruler Toggle */}
          <button
            onClick={() => {
              setShowRuler(!showRuler);
              showToast(showRuler ? "Hidden Metric Ruler" : "Metric Ruler Active ");
            }}
            className={`px-3 py-2 border rounded-2xl text-xs font-semibold backdrop-blur-xl shadow-lg flex items-center gap-1.5 transition-all ${
              showRuler ? "bg-indigo-600 border-indigo-500 text-white" : "dark:bg-slate-900/80 bg-slate-200/80 hover:bg-slate-800 border-slate-800 text-slate-200"
            }`}
            title="Toggle Metric Ruler"
          >
            <Ruler className="w-4 h-4 dark:text-amber-400 text-amber-700" />
            <span>Ruler</span>
          </button>

          {/* AI Math Solve */}
          <button
            onClick={solveWhiteboardWithAI}
            disabled={solvingAI}
            className="px-3 py-2 bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white rounded-2xl text-xs font-semibold shadow-lg shadow-indigo-500/25 flex items-center gap-1.5 transition-all disabled:opacity-50"
          >
            {solvingAI ? <Sparkles className="w-4 h-4 animate-spin" /> : <Calculator className="w-4 h-4 dark:text-cyan-200 text-cyan-800" />}
            <span>{solvingAI ? "Solving..." : "AI Math Solve"}</span>
          </button>

          {/* Preset Diagrams */}
          <button
            onClick={() => setShowPresetBank(true)}
            className="px-3 py-2 dark:bg-slate-900/80 bg-slate-200/80 hover:bg-slate-800 border border-slate-800 dark:text-slate-200 text-slate-800 rounded-2xl text-xs font-semibold backdrop-blur-xl shadow-lg flex items-center gap-1.5 transition-all"
          >
            <Library className="w-4 h-4 dark:text-indigo-400 text-indigo-700" />
            <span>Diagram Presets</span>
          </button>

          {/* Export PNG */}
          <button
            onClick={downloadCanvas}
            className="p-2.5 dark:bg-slate-900/80 bg-slate-200/80 hover:bg-slate-800 backdrop-blur-xl border border-slate-800 rounded-2xl dark:text-slate-300 text-slate-700 hover:dark:text-white text-slate-900 transition-all shadow-lg"
            title="Download PNG"
          >
            <Download className="w-4 h-4" />
          </button>

          {/* Shortcuts */}
          <button
            onClick={() => setShowKeyShortcuts(true)}
            className="p-2.5 dark:bg-slate-900/80 bg-slate-200/80 hover:bg-slate-800 backdrop-blur-xl border border-slate-800 rounded-2xl dark:text-slate-300 text-slate-700 hover:dark:text-white text-slate-900 transition-all shadow-lg"
            title="Keyboard Shortcuts"
          >
            <Keyboard className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Main Canvas Scroll Viewport */}
      <div
        ref={containerRef}
        className="w-full h-full overflow-auto cursor-crosshair relative"
        style={{
          backgroundImage: pattern === "dots" 
            ? `radial-gradient(${canvasTheme === "dark" ? "#334155" : "#cbd5e1"} 1px, transparent 1px)`
            : pattern === "grid"
            ? `linear-gradient(to right, ${canvasTheme === "dark" ? "#1e293b" : "#e2e8f0"} 1px, transparent 1px), linear-gradient(to bottom, ${canvasTheme === "dark" ? "#1e293b" : "#e2e8f0"} 1px, transparent 1px)`
            : pattern === "ruled"
            ? `linear-gradient(to bottom, ${canvasTheme === "dark" ? "#1e293b" : "#e2e8f0"} 1px, transparent 1px)`
            : "none",
          backgroundSize: pattern === "dots" ? "24px 24px" : pattern === "grid" ? "32px 32px" : pattern === "ruled" ? "32px 32px" : "auto"
        }}
      >
        <div
          className="relative transition-transform duration-75 origin-top-left"
          style={{ transform: `scale(${zoomLevel})`, width: `${canvasSize.width}px`, height: `${canvasSize.height}px` }}
          onClick={handleCanvasClick}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
        >
          {/* Main Drawing Canvas */}
          <canvas
            ref={canvasRef}
            width={canvasSize.width}
            height={canvasSize.height}
            style={{ width: `${canvasSize.width}px`, height: `${canvasSize.height}px` }}
            className="block touch-none"
          />

          {/* Laser Pointer Overlay Canvas */}
          <canvas
            ref={laserCanvasRef}
            width={canvasSize.width}
            height={canvasSize.height}
            style={{ width: `${canvasSize.width}px`, height: `${canvasSize.height}px` }}
            className="absolute top-0 left-0 pointer-events-none z-20 touch-none"
          />

          {/* Text Input Popup */}
          {textInputPos && (
            <div
              className="absolute z-30 transform -translate-y-1/2"
              style={{ left: textInputPos.x, top: textInputPos.y }}
            >
              <form onSubmit={handleTextSubmit} className="flex items-center gap-1 dark:bg-slate-900/90 bg-slate-200/90 border border-indigo-500 rounded-xl p-1.5 shadow-2xl backdrop-blur-md">
                <input
                  type="text"
                  autoFocus
                  value={textValue}
                  onChange={(e) => setTextValue(e.target.value)}
                  placeholder="Type on whiteboard..."
                  className="bg-transparent dark:text-white text-slate-900 text-sm px-2 focus:outline-none w-48 font-medium"
                />
                <button type="submit" className="p-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg">
                  <Check className="w-4 h-4" />
                </button>
              </form>
            </div>
          )}

          {/* Sticky Notes Render */}
          {stickyNotes.map((note) => {
            const theme = stickyColors.find(c => c.name === note.color) || stickyColors[0];
            return (
              <div
                key={note.id}
                className={`absolute z-20 w-44 h-44 p-3 rounded-2xl border shadow-xl backdrop-blur-md flex flex-col justify-between ${theme.bg}`}
                style={{ left: note.x, top: note.y }}
              >
                <textarea
                  value={note.text}
                  onChange={(e) => {
                    const text = e.target.value;
                    setStickyNotes(prev => prev.map(n => n.id === note.id ? { ...n, text } : n));
                  }}
                  placeholder="Write sticky note..."
                  className="w-full h-full bg-transparent resize-none focus:outline-none text-xs font-semibold leading-relaxed"
                />
                <div className="flex items-center justify-between border-t border-black/10 dark:border-white/10 pt-2 mt-1">
                  <div className="flex items-center gap-1">
                    {stickyColors.map(c => (
                      <button
                        key={c.name}
                        onClick={() => setStickyNotes(prev => prev.map(n => n.id === note.id ? { ...n, color: c.name } : n))}
                        className={`w-3 h-3 rounded-full ${c.name === "yellow" ? "bg-amber-400" : c.name === "cyan" ? "bg-cyan-400" : c.name === "pink" ? "bg-pink-400" : c.name === "green" ? "bg-emerald-400" : "bg-purple-400"}`}
                      />
                    ))}
                  </div>
                  <button
                    onClick={() => setStickyNotes(prev => prev.filter(n => n.id !== note.id))}
                    className="p-1 hover:bg-black/10 dark:hover:bg-white/10 rounded-lg transition-all"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      {/* Floating Bottom Toolbar */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-50 pointer-events-none">
        <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-3xl border border-slate-200/80 dark:border-white/10 p-2.5 rounded-[1.5rem] shadow-[0_20px_50px_-10px_rgba(0,0,0,0.3)] dark:shadow-[0_20px_50px_-10px_rgba(0,0,0,0.6)] flex items-center gap-1.5 pointer-events-auto">
          
          <ToolButton active={tool === "hand"} onClick={() => setTool("hand")} icon={Hand} label="Pan (H)" />
          <div className="w-[1px] h-8 bg-slate-200 dark:bg-slate-700/50 mx-1"></div>
          
          <ToolButton active={tool === "pen"} onClick={() => setTool("pen")} icon={PenTool} label="Pen (P)" />
          <ToolButton active={tool === "smart_pen"} onClick={() => setTool("smart_pen")} icon={Sparkles} label="Smart Pen (S)" extraClass={tool === "smart_pen" ? "bg-indigo-500 text-white shadow-[0_0_20px_rgba(99,102,241,0.5)] scale-105" : "hover:text-indigo-600 dark:hover:text-indigo-400"} />
          <ToolButton active={tool === "highlighter"} onClick={() => setTool("highlighter")} icon={Highlighter} label="Highlighter" />
          <ToolButton active={tool === "laser"} onClick={() => setTool("laser")} icon={Crosshair} label="Laser Pointer (X)" extraClass={tool === "laser" ? "bg-rose-600 text-white shadow-[0_0_20px_rgba(225,29,72,0.5)] scale-105" : "hover:text-rose-500"} />
          
          <div className="w-[1px] h-8 bg-slate-200 dark:bg-slate-700/50 mx-1"></div>

          {/* Thickness Control */}
          <div className="relative">
            <ToolButton active={showThicknessMenu} onClick={() => setShowThicknessMenu(!showThicknessMenu)} icon={Sliders} label="Thickness" />
            
            <AnimatePresence>
              {showThicknessMenu && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="absolute bottom-16 left-1/2 -translate-x-1/2 z-50 p-3.5 dark:bg-slate-900/95 bg-white/95 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl backdrop-blur-xl w-52 dark:text-slate-200 text-slate-800"
                >
                  <div className="flex items-center justify-between text-[11px] font-bold dark:text-slate-400 text-slate-600 mb-2">
                    <span>Brush Thickness</span>
                    <span className="font-mono dark:text-indigo-400 text-indigo-700">{brushSize}px</span>
                  </div>
                  <input
                    type="range" min="1" max="40" value={brushSize}
                    onChange={(e) => setBrushSize(Number(e.target.value))}
                    className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500 mb-3"
                  />
                  <div className="flex items-center justify-between gap-1">
                    {[2, 4, 8, 14, 24].map(sz => (
                      <button
                        key={sz}
                        onClick={() => { setBrushSize(sz); setShowThicknessMenu(false); }}
                        className={`p-1.5 rounded-xl border text-[10px] font-mono transition-all flex flex-col items-center gap-1 ${brushSize === sz ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300" : "border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400"}`}
                      >
                        <div className="rounded-full bg-current" style={{ width: `${Math.min(10, Math.max(2, sz / 2))}px`, height: `${Math.min(10, Math.max(2, sz / 2))}px` }} />
                        <span>{sz}p</span>
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="w-[1px] h-8 bg-slate-200 dark:bg-slate-700/50 mx-1"></div>
          
          <ToolButton active={tool === "rect"} onClick={() => setTool("rect")} icon={Square} label="Rectangle (R)" />
          <ToolButton active={tool === "circle"} onClick={() => setTool("circle")} icon={Circle} label="Circle (C)" />
          <ToolButton active={tool === "arrow"} onClick={() => setTool("arrow")} icon={ArrowRight} label="Arrow" />
          <ToolButton active={tool === "text"} onClick={() => setTool("text")} icon={Type} label="Text (T)" />
          <ToolButton active={tool === "sticky"} onClick={() => setTool("sticky")} icon={FileText} label="Sticky" />
          <ToolButton active={tool === "lasso"} onClick={() => setTool("lasso")} icon={LassoSelect} label="Lasso (L)" />
          
          <div className="w-[1px] h-8 bg-slate-200 dark:bg-slate-700/50 mx-1"></div>
          
          <ToolButton active={tool === "eraser"} onClick={() => setTool("eraser")} icon={Eraser} label="Eraser (E)" />

          <div className="w-[1px] h-8 bg-slate-200 dark:bg-slate-700/50 mx-1"></div>

          {/* Colors */}
          <div className="flex items-center gap-1 px-1">
            {paletteColors.slice(0, 5).map((c) => (
              <button
                key={c}
                onClick={() => { setColor(c); if (selectedStrokeIds.length > 0) recolorSelectedStrokes(c); }}
                className={`w-6 h-6 rounded-full transition-transform ${color === c ? "scale-125 ring-2 ring-indigo-400" : "hover:scale-110 shadow-sm border border-black/10 dark:border-white/10"}`}
                style={{ backgroundColor: c }}
              />
            ))}
          </div>

          <div className="w-[1px] h-8 bg-slate-200 dark:bg-slate-700/50 mx-1"></div>

          <button onClick={handleUndo} disabled={historyStep <= 0} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl disabled:opacity-40">
            <Undo2 className="w-5 h-5 dark:text-slate-300 text-slate-700" />
          </button>
          <button onClick={handleRedo} disabled={historyStep >= history.length - 1} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl disabled:opacity-40">
            <Redo2 className="w-5 h-5 dark:text-slate-300 text-slate-700" />
          </button>
          <button onClick={clearCanvas} className="p-2 hover:bg-rose-50 dark:hover:bg-rose-500/20 text-rose-500 rounded-xl transition-all" title="Clear Canvas">
            <Trash2 className="w-5 h-5" />
          </button>

        </div>
      </div>

      {/* AI Solution Side Panel */}
      <AnimatePresence>
        {aiSolution && (
          <motion.div
            initial={{ opacity: 0, x: 300 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 300 }}
            className="absolute top-20 right-6 w-96 max-h-[80vh] overflow-y-auto z-50 dark:bg-slate-900/95 bg-slate-200/95 border border-indigo-500/40 rounded-3xl p-5 shadow-2xl backdrop-blur-2xl dark:text-slate-100 text-slate-900"
          >
            <div className="flex items-center justify-between mb-3 pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-indigo-600 rounded-xl text-white">
                  <Calculator className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold">AI Math & Science Solution</h3>
              </div>
              <button onClick={() => setAiSolution(null)} className="p-1 hover:bg-slate-800 rounded-lg dark:text-slate-400 text-slate-600 hover:dark:text-white text-slate-900">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="text-xs dark:text-slate-300 text-slate-700 whitespace-pre-line leading-relaxed font-sans">
              {aiSolution}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Diagram Presets Modal */}
      <AnimatePresence>
        {showPresetBank && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-lg dark:bg-slate-900 bg-slate-100 border border-slate-800 rounded-3xl p-6 shadow-2xl"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Library className="w-5 h-5 dark:text-indigo-400 text-indigo-700" />
                  <h3 className="text-base font-bold">Educational Diagram Presets</h3>
                </div>
                <button onClick={() => setShowPresetBank(false)} className="p-1 hover:bg-slate-800 rounded-lg dark:text-slate-400 text-slate-600 hover:dark:text-white text-slate-900">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => insertPresetDiagram("axes")}
                  className="p-4 bg-slate-950/60 hover:bg-indigo-950/40 border border-slate-800 hover:border-indigo-500/50 rounded-2xl text-left transition-all group"
                >
                  <Compass className="w-5 h-5 dark:text-indigo-400 text-indigo-700 mb-2 group-hover:scale-110 transition-transform" />
                  <h4 className="text-xs font-bold dark:text-slate-200 text-slate-800">X-Y Coordinate Axes</h4>
                  <p className="text-[10px] dark:text-slate-400 text-slate-600 mt-1">2D Graph plane with origin & axes</p>
                </button>
                <button
                  onClick={() => insertPresetDiagram("triangle")}
                  className="p-4 bg-slate-950/60 hover:bg-indigo-950/40 border border-slate-800 hover:border-indigo-500/50 rounded-2xl text-left transition-all group"
                >
                  <Triangle className="w-5 h-5 dark:text-cyan-400 text-cyan-700 mb-2 group-hover:scale-110 transition-transform" />
                  <h4 className="text-xs font-bold dark:text-slate-200 text-slate-800">Labeled Triangle</h4>
                  <p className="text-[10px] dark:text-slate-400 text-slate-600 mt-1">Geometric triangle with vertices A, B, C</p>
                </button>
                <button
                  onClick={() => insertPresetDiagram("unit_circle")}
                  className="p-4 bg-slate-950/60 hover:bg-indigo-950/40 border border-slate-800 hover:border-indigo-500/50 rounded-2xl text-left transition-all group"
                >
                  <Circle className="w-5 h-5 dark:text-amber-400 text-amber-700 mb-2 group-hover:scale-110 transition-transform" />
                  <h4 className="text-xs font-bold dark:text-slate-200 text-slate-800">Trig Unit Circle</h4>
                  <p className="text-[10px] dark:text-slate-400 text-slate-600 mt-1">Unit circle marked with 0° & 90° angles</p>
                </button>
                <button
                  onClick={() => insertPresetDiagram("venn")}
                  className="p-4 bg-slate-950/60 hover:bg-indigo-950/40 border border-slate-800 hover:border-indigo-500/50 rounded-2xl text-left transition-all group"
                >
                  <Layers className="w-5 h-5 dark:text-pink-400 text-pink-700 mb-2 group-hover:scale-110 transition-transform" />
                  <h4 className="text-xs font-bold dark:text-slate-200 text-slate-800">Venn Diagram</h4>
                  <p className="text-[10px] dark:text-slate-400 text-slate-600 mt-1">Two overlapping set circles</p>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Keyboard Shortcuts Modal */}
      <AnimatePresence>
        {showKeyShortcuts && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-md dark:bg-slate-900 bg-slate-100 border border-slate-800 rounded-3xl p-6 shadow-2xl"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-bold flex items-center gap-2">
                  <Keyboard className="w-5 h-5 dark:text-indigo-400 text-indigo-700" />
                  Whiteboard Shortcuts
                </h3>
                <button onClick={() => setShowKeyShortcuts(false)} className="p-1 hover:bg-slate-800 rounded-lg dark:text-slate-400 text-slate-600 hover:dark:text-white text-slate-900">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between py-1.5 border-b border-slate-800"><span>Pen / Smart Pen</span><span className="font-mono dark:text-indigo-400 text-indigo-700">P / S</span></div>
                <div className="flex justify-between py-1.5 border-b border-slate-800"><span>Laser Pointer</span><span className="font-mono dark:text-rose-400 text-rose-700">X</span></div>
                <div className="flex justify-between py-1.5 border-b border-slate-800"><span>Rectangle / Circle / Text</span><span className="font-mono dark:text-indigo-400 text-indigo-700">R / C / T</span></div>
                <div className="flex justify-between py-1.5 border-b border-slate-800"><span>Eraser / Lasso Select</span><span className="font-mono dark:text-indigo-400 text-indigo-700">E / L</span></div>
                <div className="flex justify-between py-1.5 border-b border-slate-800"><span>Pan Hand</span><span className="font-mono dark:text-indigo-400 text-indigo-700">H</span></div>
                <div className="flex justify-between py-1.5 border-b border-slate-800"><span>Undo / Redo</span><span className="font-mono dark:text-indigo-400 text-indigo-700">Ctrl+Z / Ctrl+Y</span></div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
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
      <div className="absolute bottom-[calc(100%+14px)] left-1/2 -translate-x-1/2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-[10px] font-bold px-2 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap shadow-xl z-50">
        {label}
        <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 border-[5px] border-transparent border-t-slate-900 dark:border-t-white"></div>
      </div>
    </button>
  );
}
