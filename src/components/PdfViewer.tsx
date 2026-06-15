"use client";

import { useEffect, useRef, useState, useCallback } from 'react';

type Point = { x: number; y: number };
type Line = { points: Point[]; color: string; thickness: number; isEraser?: boolean };

export default function PdfViewer({ 
  file, 
  pageNumber, 
  pdfScale, 
  isDarkMode = false,
  isDrawMode = false,
  drawColor = "rgba(255, 235, 59, 0.5)", // Yellow highlighter by default
  drawThickness = 12,
  clearDrawingsSignal = 0,
  downloadSignal = 0,
  captureSignal = 0,
  onLoadSuccess,
  onTextExtracted,
  onCapture
}: { 
  file: string; 
  pageNumber: number; 
  pdfScale: number; 
  isDarkMode?: boolean;
  isDrawMode?: boolean;
  drawColor?: string;
  drawThickness?: number;
  clearDrawingsSignal?: number;
  downloadSignal?: number;
  captureSignal?: number;
  onLoadSuccess: (info: { numPages: number }) => void;
  onTextExtracted?: (text: string) => void;
  onCapture?: (dataUrl: string) => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawCanvasRef = useRef<HTMLCanvasElement>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const pdfDocRef = useRef<any>(null);
  const renderTaskRef = useRef<any>(null);

  // Drawing state mapped by page number
  const [drawings, setDrawings] = useState<Record<number, Line[]>>({});
  const [currentLine, setCurrentLine] = useState<Line | null>(null);
  const isDrawing = useRef(false);

  useEffect(() => {
    let isMounted = true;

    const loadPdfJs = async () => {
      if (!(window as any).pdfjsLib) {
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/build/pdf.min.js';
        script.async = true;
        
        await new Promise((resolve, reject) => {
          script.onload = resolve;
          script.onerror = () => reject(new Error('Failed to load PDF.js engine'));
          document.body.appendChild(script);
        });

        const pdfjsLib = (window as any).pdfjsLib;
        pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/build/pdf.worker.min.js';
      }

      if (!isMounted) return;

      try {
        setLoading(true);
        setError(null);
        const pdfjsLib = (window as any).pdfjsLib;
        
        const loadingTask = pdfjsLib.getDocument(file);
        const pdf = await loadingTask.promise;
        
        if (!isMounted) return;
        
        pdfDocRef.current = pdf;
        onLoadSuccess({ numPages: pdf.numPages });
        
        await renderPage(pageNumber, pdfScale);
      } catch (err: any) {
        console.error("PDF Load Error:", err);
        if (isMounted) setError(err.message || "Failed to load PDF.");
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadPdfJs();

    return () => {
      isMounted = false;
      if (renderTaskRef.current) {
        renderTaskRef.current.cancel();
      }
    };
  }, [file]);

  // Load Drawings from Local Storage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(`edutrack_drawings_${btoa(file).replace(/=/g, '')}`);
      if (saved) {
        setDrawings(JSON.parse(saved));
      } else {
        setDrawings({});
      }
    } catch (e) {
      console.error("Failed to load drawings", e);
    }
  }, [file]);

  // Save Drawings to Local Storage
  useEffect(() => {
    try {
      const key = `edutrack_drawings_${btoa(file).replace(/=/g, '')}`;
      if (Object.keys(drawings).length > 0) {
        localStorage.setItem(key, JSON.stringify(drawings));
      } else {
        localStorage.removeItem(key);
      }
    } catch (e) {}
  }, [drawings, file]);

  useEffect(() => {
    if (clearDrawingsSignal > 0) {
      setDrawings(prev => ({ ...prev, [pageNumber]: [] }));
    }
  }, [clearDrawingsSignal]);

  const getCombinedCanvasDataUrl = useCallback(() => {
    if (!canvasRef.current || !drawCanvasRef.current) return null;
    const combinedCanvas = document.createElement('canvas');
    combinedCanvas.width = canvasRef.current.width;
    combinedCanvas.height = canvasRef.current.height;
    const ctx = combinedCanvas.getContext('2d');
    if (!ctx) return null;
    
    // Draw background
    ctx.fillStyle = isDarkMode ? '#0f172a' : '#ffffff';
    ctx.fillRect(0, 0, combinedCanvas.width, combinedCanvas.height);
    
    // Draw PDF
    if (isDarkMode) {
      ctx.filter = 'invert(1) hue-rotate(180deg) contrast(0.9) brightness(1.2)';
    }
    ctx.drawImage(canvasRef.current, 0, 0);
    ctx.filter = 'none';
    
    // Draw overlays
    ctx.drawImage(drawCanvasRef.current, 0, 0);
    
    return combinedCanvas.toDataURL('image/png');
  }, [isDarkMode]);

  useEffect(() => {
    if (downloadSignal > 0) {
      const url = getCombinedCanvasDataUrl();
      if (url) {
        const a = document.createElement('a');
        a.href = url;
        a.download = `NCERT_Page_${pageNumber}.png`;
        a.click();
      }
    }
  }, [downloadSignal, getCombinedCanvasDataUrl, pageNumber]);

  useEffect(() => {
    if (captureSignal > 0 && onCapture) {
      const url = getCombinedCanvasDataUrl();
      if (url) onCapture(url);
    }
  }, [captureSignal, getCombinedCanvasDataUrl, onCapture]);

  useEffect(() => {
    if (pdfDocRef.current && !loading) {
      renderPage(pageNumber, pdfScale);
    }
  }, [pageNumber, pdfScale]);

  // Redraw canvas lines when drawings or page changes
  useEffect(() => {
    const dCanvas = drawCanvasRef.current;
    if (!dCanvas) return;
    const ctx = dCanvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, dCanvas.width, dCanvas.height);
    
    const lines = drawings[pageNumber] || [];
    const allLines = currentLine ? [...lines, currentLine] : lines;

    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    allLines.forEach(line => {
      if (line.points.length < 2) return;
      ctx.beginPath();
      
      if (line.isEraser) {
        ctx.globalCompositeOperation = 'destination-out';
        ctx.lineWidth = line.thickness * pdfScale; 
        ctx.strokeStyle = "rgba(0,0,0,1)"; // Must be solid for destination-out
      } else {
        ctx.globalCompositeOperation = 'source-over';
        ctx.strokeStyle = line.color;
        ctx.lineWidth = line.thickness * pdfScale;
      }

      ctx.moveTo(line.points[0].x, line.points[0].y);
      for (let i = 1; i < line.points.length; i++) {
        ctx.lineTo(line.points[i].x, line.points[i].y);
      }
      ctx.stroke();
    });
    
    // Reset composite operation
    ctx.globalCompositeOperation = 'source-over';
  }, [drawings, pageNumber, currentLine, pdfScale]);

  const extractPageText = async (page: any) => {
    if (!onTextExtracted) return;
    try {
      const textContent = await page.getTextContent();
      const textItems = textContent.items.map((item: any) => item.str);
      const fullText = textItems.join(' ');
      onTextExtracted(fullText);
    } catch (err) {
      console.error("Failed to extract text:", err);
    }
  };

  const renderPage = async (num: number, scale: number) => {
    if (!pdfDocRef.current || !canvasRef.current || !drawCanvasRef.current) return;
    
    if (renderTaskRef.current) {
      renderTaskRef.current.cancel();
    }

    try {
      const page = await pdfDocRef.current.getPage(num);
      const viewport = page.getViewport({ scale });
      const canvas = canvasRef.current;
      const dCanvas = drawCanvasRef.current;
      const context = canvas.getContext('2d');
      
      if (!context) return;

      const outputScale = window.devicePixelRatio || 1;
      
      canvas.width = Math.floor(viewport.width * outputScale);
      canvas.height = Math.floor(viewport.height * outputScale);
      canvas.style.width = Math.floor(viewport.width) + "px";
      canvas.style.height =  Math.floor(viewport.height) + "px";

      dCanvas.width = canvas.width;
      dCanvas.height = canvas.height;
      dCanvas.style.width = canvas.style.width;
      dCanvas.style.height = canvas.style.height;

      const transform = outputScale !== 1 
        ? [outputScale, 0, 0, outputScale, 0, 0] 
        : null;

      const renderContext = {
        canvasContext: context,
        transform: transform,
        viewport: viewport
      };

      const renderTask = page.render(renderContext);
      renderTaskRef.current = renderTask;
      await renderTask.promise;
      
      // Extract text after rendering
      extractPageText(page);

    } catch (err: any) {
      if (err.name !== 'RenderingCancelledException') {
        console.error("Page Render Error:", err);
      }
    }
  };

  // Drawing Handlers
  const getMousePos = (e: React.MouseEvent | React.TouchEvent) => {
    const dCanvas = drawCanvasRef.current;
    if (!dCanvas) return { x: 0, y: 0 };
    const rect = dCanvas.getBoundingClientRect();
    
    let clientX, clientY;
    if ('touches' in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = (e as React.MouseEvent).clientX;
      clientY = (e as React.MouseEvent).clientY;
    }

    const scaleX = dCanvas.width / rect.width;
    const scaleY = dCanvas.height / rect.height;

    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY
    };
  };

  const handlePointerDown = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawMode) return;
    isDrawing.current = true;
    const pos = getMousePos(e);
    const isEraser = drawColor === "eraser";
    
    // Eraser is naturally thicker than the pen for ease of use
    const actualThickness = isEraser ? drawThickness * 2.5 : drawThickness;
    
    setCurrentLine({ points: [pos], color: isEraser ? "transparent" : drawColor, thickness: actualThickness, isEraser });
  };

  const handlePointerMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawMode || !isDrawing.current || !currentLine) return;
    const pos = getMousePos(e);
    setCurrentLine(prev => prev ? { ...prev, points: [...prev.points, pos] } : null);
  };

  const handlePointerUp = () => {
    if (!isDrawMode || !isDrawing.current) return;
    isDrawing.current = false;
    if (currentLine) {
      setDrawings(prev => ({
        ...prev,
        [pageNumber]: [...(prev[pageNumber] || []), currentLine]
      }));
      setCurrentLine(null);
    }
  };

  // The Dark Mode CSS filter
  const filterStyle = isDarkMode ? "invert(90%) hue-rotate(180deg) contrast(110%)" : "none";

  return (
    <div className="relative flex flex-col items-center justify-center min-h-[500px] w-full" style={{ filter: filterStyle }}>
      {loading && (
        <div className="absolute inset-0 flex flex-col items-center justify-center z-10" style={{ filter: isDarkMode ? "invert(100%)" : "none" }}>
          <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4"></div>
          <span className="text-slate-500 font-medium animate-pulse">Loading PDF Engine...</span>
        </div>
      )}
      
      {error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center z-10 text-red-500 p-6 text-center">
          <div className="text-xl font-bold mb-2">Failed to load textbook</div>
          <div className="text-sm opacity-80">{error}</div>
        </div>
      )}
      
      {/* Wrapper for canvases to layer them perfectly */}
      <div className="relative" style={{ filter: "drop-shadow(0 25px 50px rgba(0,0,0,0.25))" }}>
        <canvas 
          ref={canvasRef} 
          className={`bg-white transition-opacity duration-300 ${loading ? 'opacity-0' : 'opacity-100'}`}
        />
        <canvas 
          ref={drawCanvasRef}
          onMouseDown={handlePointerDown}
          onMouseMove={handlePointerMove}
          onMouseUp={handlePointerUp}
          onMouseLeave={handlePointerUp}
          onTouchStart={handlePointerDown}
          onTouchMove={handlePointerMove}
          onTouchEnd={handlePointerUp}
          className={`absolute top-0 left-0 w-full h-full z-10 ${isDrawMode ? 'cursor-crosshair' : 'pointer-events-none'} transition-opacity duration-300 ${loading ? 'opacity-0' : 'opacity-100'}`}
        />
      </div>
    </div>
  );
}
