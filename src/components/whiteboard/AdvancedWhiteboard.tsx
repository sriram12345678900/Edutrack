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
  Maximize2, Minimize2, Sliders, Image as ImageIcon, Ruler, Mic, Volume2, Plus, ChevronLeft, Menu, Upload, FileUp, Link, Minus
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import jsPDF from "jspdf";
import katex from "katex";

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
  | "ruler"
  | "latex";

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
  opacity?: number; // 0.0 - 1.0
  text?: string; // Stores text content or base64 image data
}

interface LaserParticle {
  x: number;
  y: number;
  alpha: number;
  color: string;
  size?: number; // particle radius
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

  // Triangle detection: find sharp directional changes (corners)
  if (points.length >= 12 && w > 30 && h > 30) {
    const corners: Point[] = [];
    const step = Math.max(3, Math.floor(points.length / 20));
    for (let i = step; i < points.length - step; i += 2) {
      const prev = points[i - step];
      const curr = points[i];
      const next = points[i + step];
      const v1x = curr.x - prev.x, v1y = curr.y - prev.y;
      const v2x = next.x - curr.x, v2y = next.y - curr.y;
      const dot = v1x * v2x + v1y * v2y;
      const mag1 = Math.sqrt(v1x * v1x + v1y * v1y) || 1;
      const mag2 = Math.sqrt(v2x * v2x + v2y * v2y) || 1;
      const cosAngle = dot / (mag1 * mag2);
      if (cosAngle < 0.2) corners.push(curr); // sharp turn detected
    }
    if (corners.length >= 2 && corners.length <= 6) {
      return { type: "triangle", start: { x: minX, y: minY }, end: { x: maxX, y: maxY } };
    }
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
      const baseAlpha = stroke.opacity ?? 1.0;
      ctx.globalAlpha = stroke.tool === "highlighter" ? 0.35 * baseAlpha : baseAlpha;
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
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const pdfUploadInputRef = useRef<HTMLInputElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [tool, setTool] = useState<DrawTool>("pen");
  const [color, setColor] = useState("#6366f1");
  const [brushSize, setBrushSize] = useState(4);
  const [showThicknessMenu, setShowThicknessMenu] = useState(false);
  const [fillShapes, setFillShapes] = useState(false);
  const [snapToGrid, setSnapToGrid] = useState(false);
  const [pattern, setPattern] = useState<BackgroundPattern>("dots");
  const [canvasTheme, setCanvasTheme] = useState<CanvasTheme>("dark");
  const [zoomLevel, setZoomLevel] = useState(1);
  const [selectedStrokeIds, setSelectedStrokeIds] = useState<string[]>([]);
  const [showKeyShortcuts, setShowKeyShortcuts] = useState(false);

  // New: Opacity, Brush Popover, Page Title Editing
  const [strokeOpacity, setStrokeOpacity] = useState(100); // 0-100
  const [showBrushPopover, setShowBrushPopover] = useState(false);
  const [editingPageTitle, setEditingPageTitle] = useState<number | null>(null);
  const [liveSelectionCount, setLiveSelectionCount] = useState(0);

  // Lasso Animation Refs
  const lassoAnimRef = useRef<number | null>(null);
  const lassoOffsetRef = useRef(0);

  // Sticky Note Drag Ref
  const stickyDragRef = useRef<{ id: string; startMouseX: number; startMouseY: number; startNoteX: number; startNoteY: number } | null>(null);

  // Ruler State
  const [showRuler, setShowRuler] = useState(false);
  const [rulerPos, setRulerPos] = useState<{ x: number; y: number; angle: number }>({ x: 800, y: 600, angle: 0 });

  // Alignment Guides
  const [alignmentGuides, setAlignmentGuides] = useState<{axis: 'x' | 'y', pos: number}[]>([]);

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

  // Text & LaTeX Tool
  const [textInputPos, setTextInputPos] = useState<{ x: number; y: number } | null>(null);
  const [textValue, setTextValue] = useState("");
  const [isEditingLatex, setIsEditingLatex] = useState(false);

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

  const handlePdfImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    showToast("Processing PDF... Please wait.");
    
    if (!(window as any).pdfjsLib) {
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/build/pdf.min.js';
      script.async = true;
      await new Promise((resolve, reject) => {
        script.onload = resolve;
        script.onerror = reject;
        document.body.appendChild(script);
      });
      const pdfjsLib = (window as any).pdfjsLib;
      pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/build/pdf.worker.min.js';
    }

    const pdfjsLib = (window as any).pdfjsLib;
    
    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      const numPages = pdf.numPages;
      
      const newPages: WhiteboardPageData[] = [];

      for (let i = 1; i <= numPages; i++) {
        const page = await pdf.getPage(i);
        const viewport = page.getViewport({ scale: 1.5 });
        const tempCanvas = document.createElement('canvas');
        const context = tempCanvas.getContext('2d');
        if (!context) continue;

        tempCanvas.width = viewport.width;
        tempCanvas.height = viewport.height;

        await page.render({ canvasContext: context, viewport }).promise;
        const base64 = tempCanvas.toDataURL('image/jpeg', 0.8);

        const imgWidth = viewport.width;
        const imgHeight = viewport.height;
        const cx = 1000;
        const cy = 800;

        const imgStroke: Stroke = {
          id: Date.now().toString() + "_" + i,
          tool: "image",
          color: "#ffffff",
          brushSize: 1,
          points: [{ x: cx - imgWidth/2, y: cy - imgHeight/2 }, { x: cx + imgWidth/2, y: cy + imgHeight/2 }],
          text: base64
        };

        newPages.push({
          id: `page_pdf_${Date.now()}_${i}`,
          title: `PDF P${i}`,
          strokes: [imgStroke],
          stickyNotes: []
        });
      }

      setDeckPages(prev => [...prev, ...newPages]);
      setActivePageIndex(deckPages.length); 
      showToast(`Imported ${numPages} PDF pages successfully!`);
    } catch (err) {
      console.error("PDF Import Error:", err);
      showToast("Error processing PDF");
    }
  };

  // Laser Pointer Animation Loop — improved with gradient trail & glow
  useEffect(() => {
    const renderLaser = () => {
      const canvas = laserCanvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          laserParticlesRef.current = laserParticlesRef.current
            .map(p => ({ ...p, alpha: p.alpha - 0.022, size: (p.size ?? 8) * 0.985 }))
            .filter(p => p.alpha > 0);

          for (let i = 0; i < laserParticlesRef.current.length; i++) {
            const p = laserParticlesRef.current[i];
            const radius = (p.size ?? 8) * p.alpha * 1.8;
            const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, radius);
            gradient.addColorStop(0, `rgba(255, 50, 50, ${p.alpha})`);
            gradient.addColorStop(0.5, `rgba(255, 20, 20, ${p.alpha * 0.6})`);
            gradient.addColorStop(1, `rgba(220, 38, 38, 0)`);
            ctx.beginPath();
            ctx.arc(p.x, p.y, radius, 0, Math.PI * 2);
            ctx.fillStyle = gradient;
            ctx.fill();
          }

          // Draw bright glowing cursor at the most recent particle
          const last = laserParticlesRef.current[laserParticlesRef.current.length - 1];
          if (last && last.alpha > 0.5) {
            // Outer glow ring
            ctx.beginPath();
            ctx.arc(last.x, last.y, 20, 0, Math.PI * 2);
            ctx.fillStyle = "rgba(255, 60, 60, 0.12)";
            ctx.fill();
            // Middle ring
            ctx.beginPath();
            ctx.arc(last.x, last.y, 11, 0, Math.PI * 2);
            ctx.fillStyle = "rgba(255, 60, 60, 0.28)";
            ctx.fill();
            // Bright core dot
            ctx.beginPath();
            ctx.arc(last.x, last.y, 5, 0, Math.PI * 2);
            ctx.fillStyle = "#ff2020";
            ctx.shadowBlur = 28;
            ctx.shadowColor = "#ff0000";
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

  // Lasso Marching Ants Animation
  useEffect(() => {
    if (tool !== 'lasso') {
      if (lassoAnimRef.current) cancelAnimationFrame(lassoAnimRef.current);
      return;
    }
    const animate = () => {
      lassoOffsetRef.current = (lassoOffsetRef.current + 0.4) % 40;
      lassoAnimRef.current = requestAnimationFrame(animate);
    };
    lassoAnimRef.current = requestAnimationFrame(animate);
    return () => { if (lassoAnimRef.current) cancelAnimationFrame(lassoAnimRef.current); };
  }, [tool]);

  // Sticky Note Drag: global mouse move/up
  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (!stickyDragRef.current) return;
      const { id, startMouseX, startMouseY, startNoteX, startNoteY } = stickyDragRef.current;
      const dx = e.clientX - startMouseX;
      const dy = e.clientY - startMouseY;
      
      let newX = startNoteX + dx / zoomLevel;
      let newY = startNoteY + dy / zoomLevel;

      if (snapToGrid) {
        newX = Math.round(newX / 20) * 20;
        newY = Math.round(newY / 20) * 20;
      }

      // Calculate alignment guides
      const guides: {axis: 'x' | 'y', pos: number}[] = [];
      const threshold = 5 / zoomLevel;
      
      // Sticky notes are 176px (44 * 4) by 176px roughly. 
      // Let's just align the top-left corner and center for simplicity.
      const w = 176; const h = 176;
      const myCenter = { x: newX + w / 2, y: newY + h / 2 };

      // Check against other sticky notes
      stickyNotes.forEach(n => {
        if (n.id === id) return;
        const nCenter = { x: n.x + w / 2, y: n.y + h / 2 };
        if (Math.abs(newX - n.x) < threshold) { newX = n.x; guides.push({ axis: 'x', pos: newX }); }
        if (Math.abs(newY - n.y) < threshold) { newY = n.y; guides.push({ axis: 'y', pos: newY }); }
        if (Math.abs(myCenter.x - nCenter.x) < threshold) { newX = nCenter.x - w / 2; guides.push({ axis: 'x', pos: nCenter.x }); }
        if (Math.abs(myCenter.y - nCenter.y) < threshold) { newY = nCenter.y - h / 2; guides.push({ axis: 'y', pos: nCenter.y }); }
      });

      setAlignmentGuides(guides);
      setStickyNotes((prev: any[]) => prev.map((n: any) => n.id === id ? { ...n, x: newX, y: newY } : n));
    };
    const onUp = () => { 
      stickyDragRef.current = null; 
      setAlignmentGuides([]);
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
  }, [zoomLevel, snapToGrid, stickyNotes]);

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
      else if (key === 'f') setFillShapes(f => !f);
      else if (key === 'g') setSnapToGrid(g => !g);
      else if (key === '=' || key === '+') setZoomLevel(z => Math.min(3, parseFloat((z + 0.25).toFixed(2))));
      else if (key === '-') setZoomLevel(z => Math.max(0.25, parseFloat((z - 0.25).toFixed(2))));
      else if (key === '0') setZoomLevel(1);
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

  const exportToPdf = async () => {
    showToast("Generating PDF... Please wait.");
    try {
      const pdf = new jsPDF({ orientation: "landscape", unit: "px", format: [canvasSize.width, canvasSize.height] });
      
      for (let i = 0; i < deckPages.length; i++) {
        if (i > 0) pdf.addPage([canvasSize.width, canvasSize.height], "landscape");
        
        const tempCanvas = document.createElement("canvas");
        tempCanvas.width = canvasSize.width;
        tempCanvas.height = canvasSize.height;
        
        const ctx = tempCanvas.getContext("2d");
        if (ctx) {
          ctx.fillStyle = canvasTheme === "dark" ? "#020617" : "#f8fafc";
          ctx.fillRect(0, 0, canvasSize.width, canvasSize.height);
          
          redrawCanvas(tempCanvas, deckPages[i].strokes, [], false, { x: 0, y: 0, angle: 0 });
          
          const imgData = tempCanvas.toDataURL("image/jpeg", 0.85);
          pdf.addImage(imgData, "JPEG", 0, 0, canvasSize.width, canvasSize.height);
        }
      }
      
      pdf.save(`edutrack-whiteboard-${roomId}.pdf`);
      showToast("Downloaded PDF Export ");
    } catch (err) {
      console.error("PDF Export Error:", err);
      showToast("Error generating PDF");
    }
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
          prompt: `You are an expert math and science tutor reviewing a student's whiteboard.
Analyze the image carefully and provide a detailed response structured as:

1. WHAT I SEE: Describe the equations, expressions, diagrams or problems visible.
2. STEP-BY-STEP SOLUTION: Solve it step by step with clear reasoning.
3. FINAL ANSWER: State the answer clearly and concisely.
4. KEY CONCEPTS: Briefly mention the math/science concept being used.

If it's a diagram (geometry, physics, chemistry), explain what it represents.
Be thorough but easy to understand for a student. Use plain text, no markdown symbols.`,
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
    } else if (type === "number_line") {
      const y = cy;
      const ticks = Array.from({ length: 7 }, (_, i): Stroke => ({
        id: `${Date.now()}_tick${i}`, tool: "line", color: colorToUse, brushSize: 2,
        points: [{ x: cx + (i - 3) * 90, y: y - 16 }, { x: cx + (i - 3) * 90, y: y + 16 }]
      }));
      const nums = Array.from({ length: 7 }, (_, i): Stroke => ({
        id: `${Date.now()}_num${i}`, tool: "text", color: colorToUse, brushSize: 3,
        points: [{ x: cx + (i - 3) * 90 - 5, y: y + 35 }], text: `${i - 3}`
      }));
      newStrokes = [
        { id: `${Date.now()}_base`, tool: "line", color: colorToUse, brushSize: 3, points: [{ x: cx - 320, y }, { x: cx + 320, y }] },
        ...ticks,
        ...nums,
        { id: `${Date.now()}_zero`, tool: "text", color: colorToUse, brushSize: 4, points: [{ x: cx - 4, y: y - 35 }], text: "0" }
      ];
    } else if (type === "right_triangle") {
      newStrokes = [
        { id: `${Date.now()}_base`, tool: "line", color: colorToUse, brushSize: 3, points: [{ x: cx - 150, y: cy + 130 }, { x: cx + 150, y: cy + 130 }] },
        { id: `${Date.now()}_height`, tool: "line", color: colorToUse, brushSize: 3, points: [{ x: cx + 150, y: cy + 130 }, { x: cx + 150, y: cy - 120 }] },
        { id: `${Date.now()}_hyp`, tool: "line", color: colorToUse, brushSize: 3, points: [{ x: cx - 150, y: cy + 130 }, { x: cx + 150, y: cy - 120 }] },
        { id: `${Date.now()}_la`, tool: "text", color: colorToUse, brushSize: 4, points: [{ x: cx - 10, y: cy + 160 }], text: "a" },
        { id: `${Date.now()}_lb`, tool: "text", color: colorToUse, brushSize: 4, points: [{ x: cx + 165, y: cy + 5 }], text: "b" },
        { id: `${Date.now()}_lc`, tool: "text", color: colorToUse, brushSize: 4, points: [{ x: cx - 50, y: cy - 20 }], text: "c" },
        { id: `${Date.now()}_90`, tool: "text", color: colorToUse, brushSize: 3, points: [{ x: cx + 110, y: cy + 100 }], text: "90°" },
        { id: `${Date.now()}_formula`, tool: "text", color: colorToUse, brushSize: 3, points: [{ x: cx - 80, y: cy + 200 }], text: "a² + b² = c²" }
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
  const getCoordinates = (e: any): Point => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    let clientX, clientY;
    if (e.touches && e.touches.length > 0) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }
    const scaleX = canvas.width / (rect.width || 1);
    const scaleY = canvas.height / (rect.height || 1);
    let x = ((clientX - rect.left) * scaleX) / zoomLevel;
    let y = ((clientY - rect.top) * scaleY) / zoomLevel;
    
    // Snap to Grid (20px) for drawing shapes
    if (snapToGrid) {
      if (['rect', 'circle', 'line', 'arrow', 'triangle'].includes(tool)) {
        x = Math.round(x / 20) * 20;
        y = Math.round(y / 20) * 20;
      }
    }

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
    
    if (tool === "text" || tool === "latex" || tool === "sticky") return;
    
    setIsDrawing(true);
    isDrawingRef.current = true;
    lastPointRef.current = coords;
    strokePointsRef.current = [coords];

    if (tool === "laser") {
      laserParticlesRef.current.push({ x: coords.x, y: coords.y, alpha: 1.0, color, size: 8 });
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
      let dx = coords.x - selectionDragStartRef.current.x;
      let dy = coords.y - selectionDragStartRef.current.y;

      if (snapToGrid) {
        dx = Math.round(dx / 20) * 20;
        dy = Math.round(dy / 20) * 20;
      }

      let nextStrokes = strokes;
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
        nextStrokes = next;
        return next;
      });

      // Alignment check
      if (!snapToGrid) {
        const guides: {axis: 'x' | 'y', pos: number}[] = [];
        const threshold = 5 / zoomLevel;
        const selectedGroup = nextStrokes.filter(s => selectedStrokeIds.includes(s.id));
        const unselectedGroup = nextStrokes.filter(s => !selectedStrokeIds.includes(s.id));
        
        if (selectedGroup.length > 0 && unselectedGroup.length > 0) {
          const myBox = getBoundingBox(selectedGroup.flatMap(s => s.points));
          const myCenterX = (myBox.minX + myBox.maxX) / 2;
          const myCenterY = (myBox.minY + myBox.maxY) / 2;

          for (const other of unselectedGroup) {
            const oBox = getBoundingBox(other.points);
            const oCenterX = (oBox.minX + oBox.maxX) / 2;
            const oCenterY = (oBox.minY + oBox.maxY) / 2;

            if (Math.abs(myBox.minX - oBox.minX) < threshold) { dx += (oBox.minX - myBox.minX); guides.push({ axis: 'x', pos: oBox.minX }); break; }
            if (Math.abs(myBox.minY - oBox.minY) < threshold) { dy += (oBox.minY - myBox.minY); guides.push({ axis: 'y', pos: oBox.minY }); break; }
            if (Math.abs(myCenterX - oCenterX) < threshold) { dx += (oCenterX - myCenterX); guides.push({ axis: 'x', pos: oCenterX }); break; }
            if (Math.abs(myCenterY - oCenterY) < threshold) { dy += (oCenterY - myCenterY); guides.push({ axis: 'y', pos: oCenterY }); break; }
          }
          setAlignmentGuides(guides);

          if (guides.length > 0) {
            // Re-apply snapped dx/dy
            nextStrokes = nextStrokes.map(s => {
              const init = selectionInitialPointsRef.current.find(item => item.strokeId === s.id);
              if (init) return { ...s, points: init.points.map(pt => ({ x: pt.x + dx, y: pt.y + dy })) };
              return s;
            });
            setStrokes(nextStrokes);
          }
        }
      }
      const canvas = canvasRef.current;
      if (canvas) redrawCanvas(canvas, nextStrokes, selectedStrokeIds, showRuler, rulerPos);
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
      laserParticlesRef.current.push({ x: coords.x, y: coords.y, alpha: 1.0, color, size: 8 });
      return;
    }
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    if (tool === "lasso") {
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      redrawCanvas(canvas, strokes, selectedStrokeIds, showRuler, rulerPos);

      const pts = strokePointsRef.current;
      if (pts.length < 2) return;

      // Compute live selection count
      const inside = strokes.filter(s => isStrokeInLasso(s, pts));
      setLiveSelectionCount(inside.length);
      const hasHits = inside.length > 0;

      // Marching ants outer shadow stroke
      ctx.save();
      ctx.setLineDash([8, 5]);
      ctx.lineDashOffset = -lassoOffsetRef.current;
      ctx.beginPath();
      ctx.moveTo(pts[0].x, pts[0].y);
      for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i].x, pts[i].y);
      ctx.closePath();

      // Semi-transparent fill
      ctx.fillStyle = hasHits ? "rgba(99,102,241,0.10)" : "rgba(148,163,184,0.06)";
      ctx.fill();

      // Outer dark outline
      ctx.strokeStyle = "rgba(0,0,0,0.35)";
      ctx.lineWidth = 3;
      ctx.stroke();

      // Colored inner animated dashes
      ctx.strokeStyle = hasHits ? "#6366f1" : "#94a3b8";
      ctx.lineWidth = 1.5;
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.restore();
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
      setAlignmentGuides([]);
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
      fill: fillShapes,
      opacity: strokeOpacity / 100,
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
          const len = Math.round(Math.sqrt(Math.pow(detected.end.x - detected.start.x, 2) + Math.pow(detected.end.y - detected.start.y, 2)));
          cleanStroke = { id: Date.now().toString(), tool: "line", color, brushSize, opacity: strokeOpacity / 100, points: [detected.start, detected.end] };
          showToast(`✨ Snapped to Line (${len}px)`);
        } else if (detected.type === "circle") {
          const { cx, cy, r } = detected;
          cleanStroke = { id: Date.now().toString(), tool: "circle", color, brushSize, fill: fillShapes, opacity: strokeOpacity / 100, points: [{ x: cx, y: cy }, { x: cx + r, y: cy }] };
          showToast(`✨ Snapped to Circle (r≈${Math.round(r)}px)`);
        } else if (detected.type === "rectangle") {
          const { x, y, w, h } = detected;
          cleanStroke = { id: Date.now().toString(), tool: "rect", color, brushSize, fill: fillShapes, opacity: strokeOpacity / 100, points: [{ x, y }, { x: x + w, y: y + h }] };
          showToast(`✨ Snapped to Rectangle (${Math.round(w)}×${Math.round(h)}px)`);
        } else if (detected.type === "triangle") {
          cleanStroke = { id: Date.now().toString(), tool: "triangle", color, brushSize, fill: fillShapes, opacity: strokeOpacity / 100, points: [detected.start, detected.end] };
          showToast("✨ Snapped to Triangle");
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
        showToast("Smart Pen: keeping freehand stroke");
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
    if (tool === "text" || tool === "latex") {
      const coords = getCoordinates(e);
      setTextInputPos(coords);
      setIsEditingLatex(tool === "latex");
      setTextValue("");
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
        tool: isEditingLatex ? "latex" : "text",
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

  const copyShareLink = () => {
    const url = `${window.location.origin}/whiteboard?roomId=${roomId}`;
    navigator.clipboard.writeText(url);
    showToast("Shareable Link Copied! ");
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
      <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.8/dist/katex.min.css" />
      {/* Animated Dot Grid Background */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-[0.15] dark:opacity-[0.05]" 
        style={{ 
          backgroundImage: "radial-gradient(circle, currentColor 1.5px, transparent 1.5px)", 
          backgroundSize: "24px 24px" 
        }} 
      />
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

      {/* Top Floating Pill Header */}
      <header className="absolute top-6 left-1/2 -translate-x-1/2 z-40 flex items-center justify-between pointer-events-none">
        <div className="flex items-center gap-4 px-2 py-1.5 dark:bg-slate-900/80 bg-white/90 backdrop-blur-2xl border border-slate-700/50 shadow-2xl rounded-full pointer-events-auto transition-all">
          
          {/* Logo / Title */}
          <div className="flex items-center gap-2 pl-3">
            <div className="p-1.5 bg-gradient-to-tr from-indigo-500 to-cyan-400 rounded-full text-white shadow-md">
              <Zap className="w-4 h-4" />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-xs font-bold tracking-wide bg-gradient-to-r from-indigo-500 to-cyan-500 dark:from-indigo-300 dark:to-cyan-200 bg-clip-text text-transparent">
                {isEmbedded ? "Co-Op Board" : "Pro Whiteboard"}
              </h1>
            </div>
          </div>

          <div className="w-[1px] h-6 bg-slate-300 dark:bg-slate-700/50"></div>

          {/* Slide Deck Switcher — with editable title */}
          <div className="flex items-center gap-1">
            <button onClick={() => setActivePageIndex(prev => Math.max(0, prev - 1))} disabled={activePageIndex === 0} className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full dark:text-slate-300 text-slate-700 disabled:opacity-40 transition-colors">
              <ChevronLeft className="w-4 h-4" />
            </button>
            {editingPageTitle === activePageIndex ? (
              <input
                autoFocus
                value={activePage.title}
                onChange={(e) => setDeckPages(prev => prev.map((p, i) => i === activePageIndex ? { ...p, title: e.target.value } : p))}
                onBlur={() => setEditingPageTitle(null)}
                onKeyDown={(e) => { if (e.key === 'Enter') setEditingPageTitle(null); }}
                className="w-20 bg-transparent border-b border-indigo-500 text-xs font-semibold text-center focus:outline-none dark:text-indigo-300 text-indigo-700"
              />
            ) : (
              <span
                onClick={() => setEditingPageTitle(activePageIndex)}
                title={`${activePage.title} — click to rename`}
                className="font-mono text-xs font-semibold max-w-[80px] text-center dark:text-indigo-300 text-indigo-700 cursor-pointer hover:underline truncate"
              >
                {activePage.title} ({activePageIndex + 1}/{deckPages.length})
              </span>
            )}
            <button onClick={() => setActivePageIndex(prev => Math.min(deckPages.length - 1, prev + 1))} disabled={activePageIndex === deckPages.length - 1} className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full dark:text-slate-300 text-slate-700 disabled:opacity-40 transition-colors">
              <ChevronRight className="w-4 h-4" />
            </button>
            <button onClick={addNewPage} className="p-1.5 bg-indigo-100 dark:bg-indigo-900/50 hover:bg-indigo-200 dark:hover:bg-indigo-800 text-indigo-600 dark:text-indigo-300 rounded-full transition-all ml-1" title="Add Slide">
              <Plus className="w-4 h-4" />
            </button>
          </div>

          <div className="w-[1px] h-6 bg-slate-300 dark:bg-slate-700/50"></div>

          {/* Actions */}
          <div className="flex items-center gap-1">
            <button onClick={() => imageUploadInputRef.current?.click()} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full text-slate-600 dark:text-slate-300 transition-colors" title="Import Image">
              <ImageIcon className="w-4 h-4" />
            </button>
            <button onClick={() => setShowRuler(!showRuler)} className={`p-2 rounded-full transition-colors ${showRuler ? "bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-300" : "hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300"}`} title="Toggle Ruler">
              <Ruler className="w-4 h-4" />
            </button>
            <button onClick={() => setShowPresetBank(true)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full text-slate-600 dark:text-slate-300 transition-colors" title="Diagram Presets">
              <Library className="w-4 h-4" />
            </button>
            <button onClick={solveWhiteboardWithAI} disabled={solvingAI} className="px-3 py-1.5 ml-1 bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white rounded-full text-xs font-semibold shadow-md flex items-center gap-1.5 transition-all disabled:opacity-50">
              {solvingAI ? <Sparkles className="w-3.5 h-3.5 animate-spin" /> : <Calculator className="w-3.5 h-3.5" />}
              <span className="hidden sm:inline">{solvingAI ? "Solving..." : "AI Solve"}</span>
            </button>
          </div>

          <div className="w-[1px] h-6 bg-slate-300 dark:bg-slate-700/50"></div>

          {/* Utils — with Zoom Controls */}
          <div className="flex items-center gap-0.5 pr-1">
            {/* Zoom */}
            <button onClick={() => setZoomLevel(z => Math.min(3, parseFloat((z + 0.25).toFixed(2))))} className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg dark:text-slate-300 text-slate-600 transition-colors" title="Zoom In (+)">
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <span onClick={() => setZoomLevel(1)} className="font-mono text-[10px] font-bold dark:text-indigo-300 text-indigo-700 w-9 text-center cursor-pointer hover:underline" title="Reset Zoom (0)">
              {Math.round(zoomLevel * 100)}%
            </span>
            <button onClick={() => setZoomLevel(z => Math.max(0.25, parseFloat((z - 0.25).toFixed(2))))} className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg dark:text-slate-300 text-slate-600 transition-colors" title="Zoom Out (-)">
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <div className="w-[1px] h-5 bg-slate-200 dark:bg-slate-700 mx-0.5" />
            <button onClick={downloadCanvas} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full text-slate-600 dark:text-slate-300 transition-colors" title="Download PNG">
              <Download className="w-4 h-4" />
            </button>
            <button onClick={() => setCanvasTheme(t => t === "dark" ? "light" : "dark")} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full text-slate-600 dark:text-slate-300 transition-colors" title="Toggle Theme">
              {canvasTheme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
            <button onClick={() => setShowKeyShortcuts(true)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full text-slate-600 dark:text-slate-300 transition-colors" title="Keyboard Shortcuts">
              <Keyboard className="w-4 h-4" />
            </button>
          </div>
          
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
            : pattern === "isometric"
            ? `linear-gradient(30deg, ${canvasTheme === "dark" ? "#1e293b" : "#e2e8f0"} 1px, transparent 1px), linear-gradient(150deg, ${canvasTheme === "dark" ? "#1e293b" : "#e2e8f0"} 1px, transparent 1px), linear-gradient(to bottom, ${canvasTheme === "dark" ? "#1e293b" : "#e2e8f0"} 1px, transparent 1px)`
            : "none",
          backgroundSize: pattern === "dots" ? "24px 24px" : pattern === "grid" ? "32px 32px" : pattern === "ruled" ? "100% 32px" : pattern === "isometric" ? "34.64px 60px, 34.64px 60px, 17.32px 30px" : "auto"
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

          {/* Alignment Guides Overlay */}
          {alignmentGuides.map((guide, idx) => (
            <div
              key={idx}
              className="absolute bg-pink-500/60 pointer-events-none z-30"
              style={{
                left: guide.axis === 'x' ? guide.pos : 0,
                top: guide.axis === 'y' ? guide.pos : 0,
                width: guide.axis === 'y' ? '100%' : '1px',
                height: guide.axis === 'x' ? '100%' : '1px',
              }}
            />
          ))}

          {/* Text Input Popup */}
          {textInputPos && (
            <div
              className="absolute z-30 transform -translate-y-1/2 flex flex-col gap-2 min-w-[240px] max-w-[280px]"
              style={{ left: textInputPos.x, top: textInputPos.y }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* LaTeX Live Preview Box */}
              {isEditingLatex && textValue.trim().length > 0 && (
                <div 
                  className="bg-slate-900/95 border border-indigo-500/50 p-2.5 rounded-xl text-center text-white text-xs shadow-xl min-h-[44px] flex items-center justify-center overflow-x-auto select-none"
                  dangerouslySetInnerHTML={{
                    __html: (() => {
                      try {
                        return katex.renderToString(textValue, { throwOnError: false, displayMode: true });
                      } catch (err) {
                        return `<span class="text-rose-500 font-sans text-[10px]">Syntax Error</span>`;
                      }
                    })()
                  }}
                />
              )}

              <form onSubmit={handleTextSubmit} className="flex items-center gap-1 dark:bg-slate-900/95 bg-slate-200/95 border border-indigo-500 rounded-xl p-1.5 shadow-2xl backdrop-blur-md">
                <input
                  type="text"
                  autoFocus
                  value={textValue}
                  onChange={(e) => setTextValue(e.target.value)}
                  placeholder={isEditingLatex ? "Enter LaTeX (e.g. E=mc^2)" : "Type on whiteboard..."}
                  className="bg-transparent dark:text-white text-slate-900 text-sm px-2 focus:outline-none w-full font-medium"
                />
                <button type="submit" className="p-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg shrink-0">
                  <Check className="w-4 h-4" />
                </button>
              </form>

              {/* LaTeX Quick Template Buttons Helper */}
              {isEditingLatex && (
                <div className="p-2 dark:bg-slate-900/95 bg-slate-200/95 border border-slate-200 dark:border-white/10 rounded-xl shadow-xl flex flex-wrap gap-1 justify-center max-w-full backdrop-blur-md select-none">
                  {[
                    { label: "½", code: "\\frac{a}{b}" },
                    { label: "x²", code: "x^{y}" },
                    { label: "√x", code: "\\sqrt{x}" },
                    { label: "π", code: "\\pi" },
                    { label: "θ", code: "\\theta" },
                    { label: "Δ", code: "\\Delta" },
                    { label: "±", code: "\\pm" },
                    { label: "→", code: "\\rightarrow" },
                    { label: "∑", code: "\\sum_{i=1}^{n}" },
                    { label: "∫", code: "\\int" }
                  ].map((tpl) => (
                    <button
                      key={tpl.code}
                      onMouseDown={(e) => {
                        e.preventDefault(); // prevents input focus loss
                        setTextValue(prev => prev + tpl.code);
                      }}
                      className="px-2 py-1 bg-white/5 hover:bg-white/10 dark:text-slate-300 text-slate-700 hover:text-white border border-transparent hover:border-slate-500/30 text-[10px] font-black rounded-lg transition-all"
                    >
                      {tpl.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Sticky Notes Render */}
          {stickyNotes.map((note) => {
            const theme = stickyColors.find(c => c.name === note.color) || stickyColors[0];
            return (
              <div
                key={note.id}
                className={`absolute z-20 w-44 rounded-2xl border shadow-xl backdrop-blur-md flex flex-col ${theme.bg}`}
                style={{ left: note.x, top: note.y }}
              >
                {/* Drag Handle */}
                <div
                  className="flex items-center justify-center h-5 cursor-move opacity-40 hover:opacity-80 transition-opacity rounded-t-2xl shrink-0 select-none"
                  onMouseDown={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    stickyDragRef.current = { id: note.id, startMouseX: e.clientX, startMouseY: e.clientY, startNoteX: note.x, startNoteY: note.y };
                  }}
                >
                  <div className="flex gap-0.5">
                    <div className="w-6 h-0.5 rounded bg-current opacity-50" />
                    <div className="w-6 h-0.5 rounded bg-current opacity-50" />
                  </div>
                </div>
                <div className="px-3 pb-3 flex flex-col flex-1 gap-1">
                <div className="flex-1 overflow-hidden flex flex-col gap-1">
                  <textarea
                    value={note.text}
                    onChange={(e) => {
                      const text = e.target.value;
                      setStickyNotes(prev => prev.map(n => n.id === note.id ? { ...n, text } : n));
                    }}
                    placeholder="Write sticky note..."
                    className="w-full h-full bg-transparent resize-none focus:outline-none text-xs font-semibold leading-relaxed"
                  />
                  {note.audioUrl && (
                    <div className="flex items-center gap-2 p-1.5 bg-black/5 dark:bg-white/10 rounded-lg shrink-0">
                      <Volume2 className="w-3.5 h-3.5 opacity-70" />
                      <div className="h-1 flex-1 bg-black/10 dark:bg-white/20 rounded-full overflow-hidden">
                        <div className="w-1/3 h-full bg-indigo-500 rounded-full" />
                      </div>
                    </div>
                  )}
                </div>
                <div className="flex items-center justify-between border-t border-black/10 dark:border-white/10 pt-2 mt-1 shrink-0">
                  <div className="flex items-center gap-1">
                    {stickyColors.map(c => (
                      <button
                        key={c.name}
                        onClick={() => setStickyNotes(prev => prev.map(n => n.id === note.id ? { ...n, color: c.name } : n))}
                        className={`w-3 h-3 rounded-full ${c.name === "yellow" ? "bg-amber-400" : c.name === "cyan" ? "bg-cyan-400" : c.name === "pink" ? "bg-pink-400" : c.name === "green" ? "bg-emerald-400" : "bg-purple-400"}`}
                      />
                    ))}
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => {
                        const hasAudio = !!note.audioUrl;
                        setStickyNotes(prev => prev.map(n => n.id === note.id ? { ...n, audioUrl: hasAudio ? undefined : "blob:mock-audio" } : n));
                        showToast(hasAudio ? "Audio removed" : "Voice note recorded ");
                      }}
                      className={`p-1 rounded-lg transition-all ${note.audioUrl ? "bg-rose-500/20 text-rose-600 dark:text-rose-400" : "hover:bg-black/10 dark:hover:bg-white/10"}`}
                      title="Toggle Voice Note"
                    >
                      <Mic className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setStickyNotes(prev => prev.filter(n => n.id !== note.id))}
                      className="p-1 hover:bg-black/10 dark:hover:bg-white/10 rounded-lg transition-all"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
                </div>
              </div>
            );
          })}

          {/* LaTeX Rendering Overlays */}
          {strokes.filter(s => s.tool === "latex").map(s => {
            const start = s.points[0];
            return (
              <div
                key={s.id}
                className="absolute pointer-events-none z-10"
                style={{
                  left: start.x,
                  top: start.y,
                  color: s.color,
                  transform: `scale(${Math.max(1, s.brushSize / 4)})`,
                  transformOrigin: 'top left',
                  opacity: s.opacity ?? 1.0
                }}
                dangerouslySetInnerHTML={{
                  __html: (() => {
                    try {
                      return katex.renderToString(s.text || "", { throwOnError: false, displayMode: true });
                    } catch (e) {
                      return `<span class="text-rose-500 font-sans text-xs">Invalid LaTeX</span>`;
                    }
                  })()
                }}
              />
            );
          })}
        </div>
      </div>
      {/* Floating Bottom Toolbar */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-50 pointer-events-none">
        {/* Lasso Live Count Badge */}
        <AnimatePresence>
          {tool === 'lasso' && isDrawing && liveSelectionCount > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 6 }}
              className="absolute -top-9 left-1/2 -translate-x-1/2 px-3 py-1 bg-indigo-600 text-white text-xs font-bold rounded-full shadow-lg whitespace-nowrap pointer-events-none"
            >
              {liveSelectionCount} element{liveSelectionCount !== 1 ? 's' : ''} selected
            </motion.div>
          )}
        </AnimatePresence>

        <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-3xl border border-slate-200/80 dark:border-white/10 p-2.5 rounded-[1.5rem] shadow-[0_20px_50px_-10px_rgba(0,0,0,0.3)] dark:shadow-[0_20px_50px_-10px_rgba(0,0,0,0.6)] flex items-center gap-1.5 pointer-events-auto">
          
          <ToolButton active={tool === "hand"} onClick={() => setTool("hand")} icon={Hand} label="Pan (H)" />
          <div className="w-[1px] h-8 bg-slate-200 dark:bg-slate-700/50 mx-1"></div>
          
          <ToolButton active={tool === "pen"} onClick={() => setTool("pen")} icon={PenTool} label="Pen (P)" />
          <ToolButton active={tool === "smart_pen"} onClick={() => setTool("smart_pen")} icon={Sparkles} label="Smart Pen (S)" extraClass={tool === "smart_pen" ? "bg-indigo-500 text-white shadow-[0_0_20px_rgba(99,102,241,0.5)] scale-105" : "hover:text-indigo-600 dark:hover:text-indigo-400"} />
          <ToolButton active={tool === "highlighter"} onClick={() => setTool("highlighter")} icon={Highlighter} label="Highlighter" />
          <ToolButton active={tool === "laser"} onClick={() => setTool("laser")} icon={Crosshair} label="Laser Pointer (X)" extraClass={tool === "laser" ? "bg-rose-600 text-white shadow-[0_0_20px_rgba(225,29,72,0.5)] scale-105" : "hover:text-rose-500"} />
          
          <div className="w-[1px] h-8 bg-slate-200 dark:bg-slate-700/50 mx-1"></div>

          <ToolButton active={tool === "rect"} onClick={() => setTool("rect")} icon={Square} label="Rectangle (R)" />
          <ToolButton active={tool === "circle"} onClick={() => setTool("circle")} icon={Circle} label="Circle (C)" />
          <ToolButton active={tool === "triangle"} onClick={() => setTool("triangle")} icon={Triangle} label="Triangle" />
          <ToolButton active={tool === "arrow"} onClick={() => setTool("arrow")} icon={ArrowRight} label="Arrow" />
          <ToolButton active={tool === "line"} onClick={() => setTool("line")} icon={Minus} label="Line" />
          <ToolButton active={tool === "text"} onClick={() => setTool("text")} icon={Type} label="Text (T)" />
          <ToolButton active={tool === "latex"} onClick={() => setTool("latex")} icon={Calculator} label="LaTeX Equation" />
          <ToolButton active={tool === "sticky"} onClick={() => setTool("sticky")} icon={FileText} label="Sticky" />
          <ToolButton active={tool === "lasso"} onClick={() => setTool("lasso")} icon={LassoSelect} label="Lasso (L)" />
          
          <div className="w-[1px] h-8 bg-slate-200 dark:bg-slate-700/50 mx-1"></div>
          
          <ToolButton active={tool === "eraser"} onClick={() => setTool("eraser")} icon={Eraser} label="Eraser (E)" />
          <ToolButton active={tool === "stroke_eraser"} onClick={() => setTool("stroke_eraser")} icon={Layers} label="Stroke Eraser (cross to erase)" extraClass={tool === "stroke_eraser" ? "" : "hover:text-orange-500"} />

          <div className="w-[1px] h-8 bg-slate-200 dark:bg-slate-700/50 mx-1"></div>

          {/* Brush Size Popover */}
          <div className="relative">
            <button
              onClick={() => setShowBrushPopover(!showBrushPopover)}
              title="Brush Size"
              className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${showBrushPopover ? 'bg-slate-900 dark:bg-white' : 'hover:bg-slate-100 dark:hover:bg-slate-800'}`}
            >
              <div
                className={`rounded-full ${showBrushPopover ? 'bg-white dark:bg-slate-900' : 'bg-slate-700 dark:bg-slate-300'}`}
                style={{ width: `${Math.min(22, Math.max(4, brushSize))}px`, height: `${Math.min(22, Math.max(4, brushSize))}px` }}
              />
            </button>
            <AnimatePresence>
              {showBrushPopover && (
                <motion.div
                  initial={{ opacity: 0, y: 8, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.95 }}
                  className="absolute bottom-[calc(100%+12px)] left-1/2 -translate-x-1/2 dark:bg-slate-900 bg-white border border-slate-200 dark:border-slate-700 rounded-2xl p-3 shadow-2xl flex items-end gap-3 z-50"
                >
                  {[2, 4, 8, 14, 24, 36].map(sz => (
                    <button key={sz} onClick={() => { setBrushSize(sz); setShowBrushPopover(false); }}
                      className={`flex flex-col items-center gap-1 transition-all ${brushSize === sz ? 'scale-110 opacity-100' : 'opacity-40 hover:opacity-100'}`}
                    >
                      <div className="bg-slate-800 dark:bg-slate-200 rounded-full" style={{ width: `${Math.min(22, Math.max(4, sz / 1.5))}px`, height: `${Math.min(22, Math.max(4, sz / 1.5))}px` }} />
                      <span className="text-[9px] font-mono dark:text-slate-400 text-slate-600">{sz}</span>
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

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


      {/* Hidden File Input for PDF Import */}
      <input
        ref={pdfUploadInputRef}
        type="file"
        accept="application/pdf"
        onChange={handlePdfImport}
        className="hidden"
      />

      {/* Animated Sidebar */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div
            initial={{ x: -300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -300, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="absolute top-0 left-0 h-full w-72 z-50 dark:bg-slate-900/95 bg-white/95 backdrop-blur-3xl border-r border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col"
          >
            <div className="p-5 flex items-center justify-between border-b border-slate-200 dark:border-slate-800">
              <h2 className="text-lg font-black bg-gradient-to-r from-indigo-500 to-cyan-400 bg-clip-text text-transparent flex items-center gap-2">
                <Palette className="w-5 h-5 text-indigo-500" /> 
                Studio Tools
              </h2>
              <button onClick={() => setIsSidebarOpen(false)} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 transition-colors">
                <ChevronLeft className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-5 space-y-8 custom-scrollbar">
              
              {/* Colors */}
              <div>
                <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-3 uppercase tracking-wider">Colors</h3>
                <div className="flex flex-wrap gap-3 mb-4">
                  {paletteColors.map((c) => (
                    <button
                      key={c}
                      onClick={() => { setColor(c); if (selectedStrokeIds.length > 0) recolorSelectedStrokes(c); }}
                      className={`w-8 h-8 rounded-full transition-all ${color === c ? "scale-125 ring-2 ring-offset-2 dark:ring-offset-slate-900 ring-indigo-500 shadow-lg" : "hover:scale-110 shadow-sm border border-black/10 dark:border-white/10"}`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                  {/* Custom Color Picker */}
                  <label className="relative w-8 h-8 rounded-full overflow-hidden cursor-pointer hover:scale-110 transition-all shadow-sm border-2 border-dashed border-slate-300 dark:border-slate-600 flex items-center justify-center" title="Custom Color">
                    <div className="w-full h-full rounded-full" style={{ backgroundColor: color }} />
                    <span className="absolute text-[8px] font-bold text-white mix-blend-difference">+</span>
                    <input
                      type="color"
                      value={color}
                      onChange={(e) => { setColor(e.target.value); if (selectedStrokeIds.length > 0) recolorSelectedStrokes(e.target.value); }}
                      className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                    />
                  </label>
                </div>
                
                <div className="flex flex-col gap-3">
                  <label className="flex items-center gap-2 cursor-pointer group">
                    <div className={`w-5 h-5 rounded-md flex items-center justify-center transition-colors border ${fillShapes ? "bg-indigo-500 border-indigo-500" : "bg-transparent border-slate-300 dark:border-slate-700"}`}>
                      {fillShapes && <Check className="w-3.5 h-3.5 text-white" />}
                    </div>
                    <input type="checkbox" className="hidden" checked={fillShapes} onChange={(e) => setFillShapes(e.target.checked)} />
                    <span className="text-sm font-semibold text-slate-700 dark:text-slate-300 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">Fill Shapes (F)</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer group">
                    <div className={`w-5 h-5 rounded-md flex items-center justify-center transition-colors border ${snapToGrid ? "bg-indigo-500 border-indigo-500" : "bg-transparent border-slate-300 dark:border-slate-700"}`}>
                      {snapToGrid && <Check className="w-3.5 h-3.5 text-white" />}
                    </div>
                    <input type="checkbox" className="hidden" checked={snapToGrid} onChange={(e) => setSnapToGrid(e.target.checked)} />
                    <span className="text-sm font-semibold text-slate-700 dark:text-slate-300 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">Snap to Grid (G)</span>
                  </label>
                </div>
              </div>

              {/* Thickness */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Thickness</h3>
                  <span className="font-mono text-xs dark:text-indigo-400 text-indigo-600 font-bold">{brushSize}px</span>
                </div>
                <input
                  type="range" min="1" max="40" value={brushSize}
                  onChange={(e) => setBrushSize(Number(e.target.value))}
                  className="w-full h-2 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500 mb-4"
                />
                <div className="flex justify-between items-end px-1">
                  {[2, 4, 8, 14, 24].map(sz => (
                    <button
                      key={sz}
                      onClick={() => setBrushSize(sz)}
                      className={`flex flex-col items-center gap-1.5 transition-all ${brushSize === sz ? "scale-110" : "opacity-50 hover:opacity-100"}`}
                    >
                      <div className="bg-slate-800 dark:bg-slate-200 rounded-full" style={{ width: `${Math.min(14, Math.max(4, sz / 1.5))}px`, height: `${Math.min(14, Math.max(4, sz / 1.5))}px` }} />
                    </button>
                  ))}
                </div>
              </div>

              {/* Opacity */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Opacity</h3>
                  <span className="font-mono text-xs dark:text-indigo-400 text-indigo-600 font-bold">{strokeOpacity}%</span>
                </div>
                <input
                  type="range" min="10" max="100" value={strokeOpacity}
                  onChange={(e) => setStrokeOpacity(Number(e.target.value))}
                  className="w-full h-2 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                />
                <div className="flex justify-between text-[10px] font-mono dark:text-slate-500 text-slate-400 mt-1 px-0.5">
                  <span>Ghost</span><span>Full</span>
                </div>
              </div>

              {/* Background Patterns */}
              <div>
                <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-3 uppercase tracking-wider">Background</h3>
                <div className="grid grid-cols-2 gap-2">
                  {(["blank", "dots", "grid", "ruled", "isometric"] as BackgroundPattern[]).map(p => (
                    <button
                      key={p}
                      onClick={() => setPattern(p)}
                      className={`p-2 rounded-xl text-xs font-semibold capitalize border transition-all ${pattern === p ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 shadow-sm" : "border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400"}`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div>
                <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-3 uppercase tracking-wider">File & Share</h3>
                <div className="space-y-2">
                  <button onClick={copyShareLink} className="w-full p-3 rounded-xl flex items-center justify-between bg-indigo-50 dark:bg-indigo-500/10 hover:bg-indigo-100 dark:hover:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 transition-all font-semibold text-sm border border-indigo-200 dark:border-indigo-500/30">
                    <div className="flex items-center gap-2">
                      <Link className="w-4 h-4" /> Share Link
                    </div>
                    <ChevronRight className="w-4 h-4 opacity-50" />
                  </button>
                  
                  <button onClick={() => pdfUploadInputRef.current?.click()} className="w-full p-3 rounded-xl flex items-center justify-between hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-all font-semibold text-sm border border-slate-200 dark:border-slate-700">
                    <div className="flex items-center gap-2">
                      <FileUp className="w-4 h-4" /> Upload PDF
                    </div>
                    <Upload className="w-4 h-4 opacity-50" />
                  </button>

                  <button onClick={exportToPdf} className="w-full p-3 rounded-xl flex items-center justify-between hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-all font-semibold text-sm border border-slate-200 dark:border-slate-700">
                    <div className="flex items-center gap-2">
                      <Download className="w-4 h-4" /> Export as PDF
                    </div>
                    <ChevronRight className="w-4 h-4 opacity-50" />
                  </button>
                </div>
              </div>
              
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sidebar Toggle Button (when closed) */}
      <AnimatePresence>
        {!isSidebarOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            onClick={() => setIsSidebarOpen(true)}
            className="absolute top-1/2 -translate-y-1/2 left-4 z-40 p-3 bg-white dark:bg-slate-800 text-slate-800 dark:text-white rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 hover:scale-110 transition-transform"
          >
            <Menu className="w-6 h-6" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* AI Solution Side Panel — improved */}
      <AnimatePresence>
        {aiSolution && (
          <motion.div
            initial={{ opacity: 0, x: 300 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 300 }}
            className="absolute top-20 right-6 w-[400px] max-h-[78vh] overflow-hidden z-50 dark:bg-slate-900/98 bg-white border border-indigo-500/30 rounded-3xl shadow-2xl backdrop-blur-2xl dark:text-slate-100 text-slate-900 flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 pb-3 border-b border-slate-200 dark:border-slate-800 shrink-0">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-gradient-to-tr from-indigo-600 to-cyan-500 rounded-xl text-white">
                  <Calculator className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold">AI Math & Science Solution</h3>
                  <p className="text-[10px] dark:text-slate-400 text-slate-500">Powered by Gemini Vision</p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => navigator.clipboard.writeText(aiSolution || '').then(() => showToast('Solution copied! 📋'))}
                  className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg dark:text-slate-400 text-slate-600 transition-all"
                  title="Copy Solution"
                >
                  <Copy className="w-3.5 h-3.5" />
                </button>
                <button onClick={() => setAiSolution(null)} className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg dark:text-slate-400 text-slate-600 transition-all">
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
            {/* Solution content */}
            <div className="flex-1 overflow-y-auto p-4 text-xs dark:text-slate-300 text-slate-700 whitespace-pre-line leading-relaxed font-sans custom-scrollbar">
              {aiSolution}
            </div>
            {/* Footer */}
            <div className="px-4 py-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between shrink-0">
              <button
                onClick={solveWhiteboardWithAI}
                disabled={solvingAI}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white rounded-xl text-xs font-semibold disabled:opacity-50 transition-all"
              >
                {solvingAI ? <Sparkles className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                {solvingAI ? 'Re-solving...' : 'Re-solve'}
              </button>
              <span className="text-[10px] dark:text-slate-500 text-slate-400">Draw more & re-solve to update</span>
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
                <button
                  onClick={() => insertPresetDiagram("number_line")}
                  className="p-4 bg-slate-950/60 hover:bg-indigo-950/40 border border-slate-800 hover:border-indigo-500/50 rounded-2xl text-left transition-all group"
                >
                  <Minus className="w-5 h-5 dark:text-green-400 text-green-700 mb-2 group-hover:scale-110 transition-transform" />
                  <h4 className="text-xs font-bold dark:text-slate-200 text-slate-800">Number Line</h4>
                  <p className="text-[10px] dark:text-slate-400 text-slate-600 mt-1">Labeled number line -3 to +3</p>
                </button>
                <button
                  onClick={() => insertPresetDiagram("right_triangle")}
                  className="p-4 bg-slate-950/60 hover:bg-indigo-950/40 border border-slate-800 hover:border-indigo-500/50 rounded-2xl text-left transition-all group"
                >
                  <Triangle className="w-5 h-5 dark:text-yellow-400 text-yellow-600 mb-2 group-hover:scale-110 transition-transform" />
                  <h4 className="text-xs font-bold dark:text-slate-200 text-slate-800">Pythagoras Triangle</h4>
                  <p className="text-[10px] dark:text-slate-400 text-slate-600 mt-1">Right-angle triangle with a² + b² = c²</p>
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
