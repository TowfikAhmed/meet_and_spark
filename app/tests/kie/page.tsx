"use client";

import React, { useEffect, useRef, useState } from "react";

type Tool = "select" | "brush" | "pen" | "circle" | "rect";

type Point = { x: number; y: number };
type ShapeType = "brush" | "rect" | "circle" | "polygon";
type Shape = {
  id: number;
  type: ShapeType;
  points?: Point[]; // brush path or polygon points
  rect?: { x: number; y: number; w: number; h: number };
  circle?: { cx: number; cy: number; r: number };
  brushSize?: number;
  // Transform applied around center
  transform: { tx: number; ty: number; scaleX: number; scaleY: number; rotation: number; cx: number; cy: number };
};

export default function Page() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const maskCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const [tool, setTool] = useState<Tool>("brush");
  const [brushSize, setBrushSize] = useState<number>(24);
  const [isDrawing, setIsDrawing] = useState<boolean>(false);
  const startPosRef = useRef<{ x: number; y: number } | null>(null);
  const lastPosRef = useRef<{ x: number; y: number } | null>(null);
  const previewPosRef = useRef<{ x: number; y: number } | null>(null);
  const penPointsRef = useRef<Array<{ x: number; y: number }>>([]);
  const penActiveRef = useRef<boolean>(false);
  const [penIsEditing, setPenIsEditing] = useState<boolean>(false);
  const shapesRef = useRef<Shape[]>([]);
  const nextShapeIdRef = useRef<number>(1);
  const selectedShapeIdRef = useRef<number | null>(null);
  const selectModeRef = useRef<null | { kind: "move" | "rotate" | "resize"; handle?: string; start: Point; initial: Shape }>(null);
  const brushTempPointsRef = useRef<Point[] | null>(null);
  const hoverHandleRef = useRef<null | { name: string; kind: "rotate" | "resize" | "move" }>(null);
  const [exportSize, setExportSize] = useState<{ w: number; h: number }>({ w: 0, h: 0 });
  const bgImageRef = useRef<HTMLImageElement | null>(null);

  const finishPen = () => {
    const points = [...penPointsRef.current];
    if (points.length >= 3) {
      fillPolygonMask(points);
    }
    penPointsRef.current = [];
    penActiveRef.current = false;
    setPenIsEditing(false);
    previewPosRef.current = null;
    startPosRef.current = null;
    lastPosRef.current = null;
    setIsDrawing(false);
    render();
  };

  const cancelPen = () => {
    penPointsRef.current = [];
    penActiveRef.current = false;
    setPenIsEditing(false);
    previewPosRef.current = null;
    startPosRef.current = null;
    lastPosRef.current = null;
    setIsDrawing(false);
    render();
  };

  // Initialize offscreen mask canvas
  useEffect(() => {
    if (!maskCanvasRef.current) {
      maskCanvasRef.current = document.createElement("canvas");
    }
    // Ensure initial sizing runs once the mask canvas exists
    try {
      window.dispatchEvent(new Event("resize"));
    } catch {}
  }, []);


  // Resize canvases to container and respect devicePixelRatio
  useEffect(() => {
    const resize = () => {
      const canvas = canvasRef.current;
      const container = containerRef.current;
      const maskCanvas = maskCanvasRef.current;
      if (!canvas || !container || !maskCanvas) return;

      const rect = container.getBoundingClientRect();
      // Use CSS pixel sizing for simplicity and reliable coordinates

      // Preserve mask content when resizing
      const oldMask = document.createElement("canvas");
      oldMask.width = maskCanvas.width;
      oldMask.height = maskCanvas.height;
      const oldCtx = oldMask.getContext("2d");
      const maskCtx = maskCanvas.getContext("2d");
      if (oldCtx && maskCtx) {
        oldCtx.drawImage(maskCanvas, 0, 0);
      }

      canvas.width = Math.max(1, Math.floor(rect.width));
      canvas.height = Math.max(1, Math.floor(rect.height));
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;

      maskCanvas.width = canvas.width;
      maskCanvas.height = canvas.height;
      maskCanvas.style.width = canvas.style.width;
      maskCanvas.style.height = canvas.style.height;

      // Restore mask scaled to new size
      const restoreCtx = maskCanvas.getContext("2d");
      if (restoreCtx && oldMask.width && oldMask.height) {
        restoreCtx.clearRect(0, 0, canvas.width, canvas.height);
        restoreCtx.drawImage(oldMask, 0, 0, oldMask.width, oldMask.height, 0, 0, canvas.width, canvas.height);
      }

      // Initialize export size to current canvas resolution if not set
      setExportSize((prev) => (prev.w && prev.h ? prev : { w: canvas.width, h: canvas.height }));

      render();
    };

    resize();
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getPos = (e: React.PointerEvent<HTMLCanvasElement>) => {
    // Compute coordinates relative to the canvas using clientX/Y and bounding rect
    const rect = e.currentTarget.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  const render = () => {
    const canvas = canvasRef.current;
    const maskCanvas = maskCanvasRef.current;
    if (!canvas || !maskCanvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;
    ctx.clearRect(0, 0, w, h);

    // First: draw tinted mask overlay (red) using source-in
    // Ensure mask canvas reflects shapes
    renderMask();
    ctx.save();
    ctx.drawImage(maskCanvas, 0, 0, w, h);
    ctx.globalCompositeOperation = "source-in";
    ctx.fillStyle = "rgba(255,0,0,0.35)";
    ctx.fillRect(0, 0, w, h);
    ctx.restore();

    // Then: draw checkerboard background behind existing content
    ctx.save();
    ctx.globalCompositeOperation = "destination-over";
    const bg = bgImageRef.current;
    if (bg) {
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";
      ctx.drawImage(bg, 0, 0, w, h);
    } else {
      drawCheckerboard(ctx, w, h);
    }
    ctx.restore();

    // Preview shape while dragging
    if (isDrawing && startPosRef.current && previewPosRef.current) {
      ctx.save();
      ctx.strokeStyle = "#00a2ff";
      ctx.setLineDash([6, 6]);
      ctx.lineWidth = 1.5;
      const a = startPosRef.current;
      const b = previewPosRef.current;
      if (tool === "rect") {
        const x = Math.min(a.x, b.x);
        const y = Math.min(a.y, b.y);
        const w2 = Math.abs(a.x - b.x);
        const h2 = Math.abs(a.y - b.y);
        ctx.strokeRect(x, y, w2, h2);
      } else if (tool === "circle") {
        const dx = b.x - a.x;
        const dy = b.y - a.y;
        const r = Math.sqrt(dx * dx + dy * dy);
        ctx.beginPath();
        ctx.arc(a.x, a.y, r, 0, Math.PI * 2);
        ctx.stroke();
      }
      ctx.restore();
    }

    // Live filled preview for pen tool: show polygon fill and outline
    if (tool === "pen" && penActiveRef.current && penPointsRef.current.length > 0) {
      const points = [...penPointsRef.current];
      if (previewPosRef.current) points.push(previewPosRef.current);
      if (points.length >= 2) {
        ctx.save();
        ctx.setLineDash([]);
        ctx.lineWidth = 1.5;
        ctx.strokeStyle = "#00a2ff";
        ctx.fillStyle = "rgba(255,0,0,0.25)"; // UI preview fill
        ctx.beginPath();
        ctx.moveTo(points[0].x, points[0].y);
        for (let i = 1; i < points.length; i++) {
          ctx.lineTo(points[i].x, points[i].y);
        }
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        ctx.restore();
      }
    }

    // Selection overlay
    if (tool === "select" && selectedShapeIdRef.current != null) {
      const s = shapesRef.current.find((sh) => sh.id === selectedShapeIdRef.current);
      if (s) {
        const bb = shapeBoundsScreen(s);
        if (bb) {
          const { x, y, w: bw, h: bh } = bb;
          ctx.save();
          ctx.setLineDash([6, 6]);
          ctx.strokeStyle = "#00a2ff";
          ctx.lineWidth = 1.5;
          ctx.strokeRect(x, y, bw, bh);
          // draw handles: corners and sides
          const hs = 14;
          const handles = [
            { x: x, y: y },
            { x: x + bw / 2, y: y },
            { x: x + bw, y: y },
            { x: x, y: y + bh / 2 },
            { x: x + bw, y: y + bh / 2 },
            { x: x, y: y + bh },
            { x: x + bw / 2, y: y + bh },
            { x: x + bw, y: y + bh },
          ];
          ctx.setLineDash([]);
          handles.forEach((h, idx) => {
            const names = [
              "tl", "tm", "tr",
              "ml", "mr",
              "bl", "bm", "br",
            ];
            const name = names[idx];
            const isHover = hoverHandleRef.current && hoverHandleRef.current.name === name;
            ctx.fillStyle = isHover ? "#00a2ff" : "#ffffff";
            ctx.strokeStyle = isHover ? "#005eaa" : "#00a2ff";
            ctx.beginPath();
            ctx.rect(h.x - hs / 2, h.y - hs / 2, hs, hs);
            ctx.fill();
            ctx.stroke();
          });
          ctx.restore();
        }
      }
    }

    // Brush size cursor
    if (tool === "brush" && previewPosRef.current) {
      ctx.save();
      ctx.setLineDash([4, 4]);
      ctx.strokeStyle = "#00a2ff";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(previewPosRef.current.x, previewPosRef.current.y, Math.max(1, brushSize / 2), 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }
  };

  const renderMask = () => {
    const maskCanvas = maskCanvasRef.current;
    if (!maskCanvas) return;
    const mctx = maskCanvas.getContext("2d");
    if (!mctx) return;
    const w = maskCanvas.width;
    const h = maskCanvas.height;
    mctx.clearRect(0, 0, w, h);
    shapesRef.current.forEach((s) => drawShapeOnMask(mctx, s));
    // Live brush stroke preview
    if (
      tool === "brush" &&
      isDrawing &&
      startPosRef.current &&
      brushTempPointsRef.current &&
      brushTempPointsRef.current.length
    ) {
      mctx.save();
      mctx.globalCompositeOperation = "source-over";
      mctx.strokeStyle = "white";
      mctx.lineCap = "round";
      mctx.lineJoin = "round";
      mctx.lineWidth = brushSize;
      mctx.beginPath();
      mctx.moveTo(startPosRef.current.x, startPosRef.current.y);
      for (let i = 0; i < brushTempPointsRef.current.length; i++) {
        const p = brushTempPointsRef.current[i];
        mctx.lineTo(p.x, p.y);
      }
      mctx.stroke();
      mctx.restore();
    }
  };

  const drawShapeOnMask = (mctx: CanvasRenderingContext2D, s: Shape) => {
    mctx.save();
    const t = s.transform;
    mctx.translate(t.tx + t.cx, t.ty + t.cy);
    mctx.rotate(t.rotation);
    mctx.scale(t.scaleX, t.scaleY);
    mctx.translate(-t.cx, -t.cy);
    mctx.fillStyle = "white";
    mctx.strokeStyle = "white";
    if (s.type === "rect" && s.rect) {
      mctx.fillRect(s.rect.x, s.rect.y, s.rect.w, s.rect.h);
    } else if (s.type === "circle" && s.circle) {
      mctx.beginPath();
      mctx.arc(s.circle.cx, s.circle.cy, s.circle.r, 0, Math.PI * 2);
      mctx.fill();
    } else if (s.type === "polygon" && s.points) {
      mctx.beginPath();
      mctx.moveTo(s.points[0].x, s.points[0].y);
      for (let i = 1; i < s.points.length; i++) mctx.lineTo(s.points[i].x, s.points[i].y);
      mctx.closePath();
      mctx.fill();
    } else if (s.type === "brush" && s.points && s.brushSize) {
      mctx.lineCap = "round";
      mctx.lineJoin = "round";
      mctx.lineWidth = s.brushSize;
      mctx.beginPath();
      mctx.moveTo(s.points[0].x, s.points[0].y);
      for (let i = 1; i < s.points.length; i++) mctx.lineTo(s.points[i].x, s.points[i].y);
      mctx.stroke();
    }
    mctx.restore();
  };

  const shapeBoundsScreen = (s: Shape): { x: number; y: number; w: number; h: number } | null => {
    // Approximate by transforming local bounds and computing AABB
    const pts: Point[] = [];
    if (s.type === "rect" && s.rect) {
      const { x, y, w, h } = s.rect;
      pts.push({ x, y }, { x: x + w, y }, { x: x + w, y: y + h }, { x, y: y + h });
    } else if (s.type === "circle" && s.circle) {
      const { cx, cy, r } = s.circle;
      const steps = 12;
      for (let i = 0; i < steps; i++) {
        const a = (i / steps) * Math.PI * 2;
        pts.push({ x: cx + Math.cos(a) * r, y: cy + Math.sin(a) * r });
      }
    } else if ((s.type === "polygon" || s.type === "brush") && s.points) {
      pts.push(...s.points);
    }
    if (!pts.length) return null;
    const t = s.transform;
    const xform = (p: Point): Point => {
      // apply transform
      const px = p.x - t.cx;
      const py = p.y - t.cy;
      const rx = px * Math.cos(t.rotation) - py * Math.sin(t.rotation);
      const ry = px * Math.sin(t.rotation) + py * Math.cos(t.rotation);
      return { x: t.tx + t.cx + rx * t.scaleX, y: t.ty + t.cy + ry * t.scaleY };
    };
    const tp = pts.map(xform);
    const minX = Math.min(...tp.map((p) => p.x));
    const maxX = Math.max(...tp.map((p) => p.x));
    const minY = Math.min(...tp.map((p) => p.y));
    const maxY = Math.max(...tp.map((p) => p.y));
    return { x: minX, y: minY, w: maxX - minX, h: maxY - minY };
  };

  const drawFreehand = (from: { x: number; y: number }, to: { x: number; y: number }) => {
    // accumulate for shape storage
    if (!brushTempPointsRef.current) brushTempPointsRef.current = [];
    brushTempPointsRef.current.push(to);
  };

  const fillRectMask = (a: { x: number; y: number }, b: { x: number; y: number }) => {
    const x = Math.min(a.x, b.x);
    const y = Math.min(a.y, b.y);
    const w = Math.abs(a.x - b.x);
    const h = Math.abs(a.y - b.y);
    const cx = x + w / 2;
    const cy = y + h / 2;
    const sh: Shape = {
      id: nextShapeIdRef.current++,
      type: "rect",
      rect: { x, y, w, h },
      transform: { tx: 0, ty: 0, scaleX: 1, scaleY: 1, rotation: 0, cx, cy },
    };
    shapesRef.current.push(sh);
  };

  const fillCircleMask = (a: { x: number; y: number }, b: { x: number; y: number }) => {
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    const r = Math.sqrt(dx * dx + dy * dy);
    const sh: Shape = {
      id: nextShapeIdRef.current++,
      type: "circle",
      circle: { cx: a.x, cy: a.y, r },
      transform: { tx: 0, ty: 0, scaleX: 1, scaleY: 1, rotation: 0, cx: a.x, cy: a.y },
    };
    shapesRef.current.push(sh);
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {}
    const pos = getPos(e);
    // Selection tool interactions
    if (tool === "select") {
      // If a shape is already selected, give priority to handles and its bbox
      if (selectedShapeIdRef.current != null) {
        const s = shapesRef.current.find((sh) => sh.id === selectedShapeIdRef.current);
        if (s) {
          const hh = hitHandle(pos, s);
          if (hh) {
            selectModeRef.current = { kind: hh.kind, handle: hh.name, start: pos, initial: deepCopyShape(s) };
            setIsDrawing(true);
            render();
            return;
          }
          const bb = shapeBoundsScreen(s);
          if (bb && pos.x >= bb.x && pos.x <= bb.x + bb.w && pos.y >= bb.y && pos.y <= bb.y + bb.h) {
            selectModeRef.current = { kind: "move", start: pos, initial: deepCopyShape(s) };
            setIsDrawing(true);
            render();
            return;
          }
        }
      }
      // Otherwise, test shapes under cursor (topmost)
      const hit = hitTestShapes(pos);
      if (hit) {
        selectedShapeIdRef.current = hit.shape.id;
        const handle = hitHandle(pos, hit.shape);
        const initial = deepCopyShape(hit.shape);
        if (handle) {
          selectModeRef.current = { kind: handle.kind, handle: handle.name, start: pos, initial };
        } else {
          selectModeRef.current = { kind: "move", start: pos, initial };
        }
        setIsDrawing(true);
        render();
        return;
      }
      // Clicked empty space: deselect
      selectedShapeIdRef.current = null;
      render();
      return;
    }
    if (tool === "pen") {
      // Begin or continue polygon editing
      penActiveRef.current = true;
      // If clicking near the first point, close and commit
      if (penPointsRef.current.length >= 2) {
        const fp = penPointsRef.current[0];
        const dx = pos.x - fp.x;
        const dy = pos.y - fp.y;
        const th = 8; // pixel threshold to close
        if (dx * dx + dy * dy <= th * th) {
          finishPen();
          return;
        }
      }
      penPointsRef.current.push(pos);
      previewPosRef.current = pos;
      setPenIsEditing(true);
      setIsDrawing(true);
      render();
      return;
    }
    setIsDrawing(true);
    startPosRef.current = pos;
    lastPosRef.current = pos;
    previewPosRef.current = pos;
    if (tool === "brush") {
      brushTempPointsRef.current = [pos];
      drawFreehand(pos, pos);
      render();
    }
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const pos = getPos(e);
    previewPosRef.current = pos;
    // Hover feedback for selection when not dragging
    if (!isDrawing && tool === "select") {
      const canvas = canvasRef.current;
      const sId = selectedShapeIdRef.current;
      let cursor = "default";
      if (sId != null) {
        const s = shapesRef.current.find((sh) => sh.id === sId);
        if (s) {
          const hh = hitHandle(pos, s);
          if (hh) {
            hoverHandleRef.current = { name: hh.name, kind: hh.kind };
            if (["tl", "br"].includes(hh.name)) cursor = "nwse-resize";
            else if (["tr", "bl"].includes(hh.name)) cursor = "nesw-resize";
            else if (["ml", "mr"].includes(hh.name)) cursor = "ew-resize";
            else if (["tm", "bm"].includes(hh.name)) cursor = "ns-resize";
          } else {
            const bb = s && shapeBoundsScreen(s);
            if (bb && pos.x >= bb.x && pos.x <= bb.x + bb.w && pos.y >= bb.y && pos.y <= bb.y + bb.h) {
              hoverHandleRef.current = { name: "center", kind: "move" };
              cursor = "move";
            } else {
              hoverHandleRef.current = null;
            }
          }
          render();
        }
      }
      if (canvas) canvas.style.cursor = cursor;
    }
    if (!isDrawing) {
      if (tool === "brush") {
        // Show brush cursor even when idle
        render();
      }
      return;
    }
    if (tool === "select" && selectModeRef.current && selectedShapeIdRef.current != null) {
      const s = shapesRef.current.find((sh) => sh.id === selectedShapeIdRef.current);
      const mode = selectModeRef.current;
      if (s && mode) {
        const dx = pos.x - mode.start.x;
        const dy = pos.y - mode.start.y;
        // reset to initial
        s.transform = { ...mode.initial.transform };
        if (mode.kind === "move") {
          s.transform.tx = mode.initial.transform.tx + dx;
          s.transform.ty = mode.initial.transform.ty + dy;
        } else if (mode.kind === "resize") {
          // Keep aspect ratio and reduce sensitivity
          const bb0 = shapeBoundsScreen(mode.initial);
          if (bb0) {
            const cx = bb0.x + bb0.w / 2;
            const cy = bb0.y + bb0.h / 2;
            const v0x = mode.start.x - cx;
            const v0y = mode.start.y - cy;
            const v1x = pos.x - cx;
            const v1y = pos.y - cy;
            let ratio = 1;
            const name = mode.handle || "";
            if (name === "ml" || name === "mr") {
              // horizontal sides
              const ax = Math.max(1e-3, Math.abs(v0x));
              ratio = Math.abs(v1x) / ax;
            } else if (name === "tm" || name === "bm") {
              // vertical sides
              const ay = Math.max(1e-3, Math.abs(v0y));
              ratio = Math.abs(v1y) / ay;
            } else {
              // default: uniform radial for other handles
              const r0 = Math.max(1e-3, Math.hypot(v0x, v0y));
              const r1 = Math.hypot(v1x, v1y);
              ratio = r1 / r0;
            }
            // reduce increase rate (smoothing)
            const k = 0.35; // sensitivity factor
            let sUniform = 1 + (ratio - 1) * k;
            // clamp to avoid extreme scaling
            sUniform = Math.max(0.1, Math.min(10, sUniform));
            s.transform.scaleX = mode.initial.transform.scaleX * sUniform;
            s.transform.scaleY = mode.initial.transform.scaleY * sUniform;
          }
        } else if (mode.kind === "rotate") {
          const bb0 = shapeBoundsScreen(mode.initial);
          if (bb0) {
            const cx = bb0.x + bb0.w / 2;
            const cy = bb0.y + bb0.h / 2;
            const a0 = Math.atan2(mode.start.y - cy, mode.start.x - cx);
            const a1 = Math.atan2(pos.y - cy, pos.x - cx);
            const da = a1 - a0;
            s.transform.rotation = mode.initial.transform.rotation + da;
          }
        }
        render();
        return;
      }
    }
    if (tool === "brush") {
      const from = lastPosRef.current ?? pos;
      drawFreehand(from, pos);
      lastPosRef.current = pos;
    } else if (tool === "pen") {
      // While dragging, add points to the polygon path for smoother shapes
      if ((e.buttons & 1) === 1) {
        penPointsRef.current.push(pos);
      }
    }
    render();
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {}
    if (!isDrawing) return;
    const end = getPos(e);
    if (tool === "select") {
      selectModeRef.current = null;
      setIsDrawing(false);
      renderMask();
      render();
      return;
    }
    if (tool === "pen") {
      // End of a drag; keep editing active for more clicks
      setIsDrawing(false);
      lastPosRef.current = null;
      startPosRef.current = null;
      previewPosRef.current = null;
      render();
      return;
    }
    if (startPosRef.current) {
      if (tool === "rect") fillRectMask(startPosRef.current, end);
      if (tool === "circle") fillCircleMask(startPosRef.current, end);
    }
    if (tool === "brush" && brushTempPointsRef.current && brushTempPointsRef.current.length) {
      const pts = [startPosRef.current!, ...brushTempPointsRef.current];
      const cx = pts.reduce((a, p) => a + p.x, 0) / pts.length;
      const cy = pts.reduce((a, p) => a + p.y, 0) / pts.length;
      const sh: Shape = {
        id: nextShapeIdRef.current++,
        type: "brush",
        points: pts.map((p) => ({ x: p.x, y: p.y })),
        brushSize,
        transform: { tx: 0, ty: 0, scaleX: 1, scaleY: 1, rotation: 0, cx, cy },
      };
      shapesRef.current.push(sh);
      brushTempPointsRef.current = null;
    }
    setIsDrawing(false);
    startPosRef.current = null;
    lastPosRef.current = null;
    previewPosRef.current = null;
    renderMask();
    render();
  };

  const deepCopyShape = (s: Shape): Shape => JSON.parse(JSON.stringify(s));

  const hitTestShapes = (p: Point): { shape: Shape } | null => {
    // naive: test in reverse draw order (topmost last)
    for (let i = shapesRef.current.length - 1; i >= 0; i--) {
      const s = shapesRef.current[i];
      if (pointInShape(p, s)) return { shape: s };
    }
    return null;
  };

  const pointInShape = (p: Point, s: Shape): boolean => {
    // inverse transform into local space
    const t = s.transform;
    const lx = p.x - (t.tx + t.cx);
    const ly = p.y - (t.ty + t.cy);
    const cos = Math.cos(-t.rotation);
    const sin = Math.sin(-t.rotation);
    const rx = (lx * cos - ly * sin) / (t.scaleX || 1) + t.cx;
    const ry = (lx * sin + ly * cos) / (t.scaleY || 1) + t.cy;
    if (s.type === "rect" && s.rect) {
      return rx >= s.rect.x && ry >= s.rect.y && rx <= s.rect.x + s.rect.w && ry <= s.rect.y + s.rect.h;
    } else if (s.type === "circle" && s.circle) {
      const dx = rx - s.circle.cx;
      const dy = ry - s.circle.cy;
      return dx * dx + dy * dy <= s.circle.r * s.circle.r;
    } else if (s.type === "polygon" && s.points) {
      let inside = false;
      for (let i = 0, j = s.points.length - 1; i < s.points.length; j = i++) {
        const xi = s.points[i].x, yi = s.points[i].y;
        const xj = s.points[j].x, yj = s.points[j].y;
        const intersect = yi > ry !== yj > ry && rx < ((xj - xi) * (ry - yi)) / (yj - yi) + xi;
        if (intersect) inside = !inside;
      }
      return inside;
    } else if (s.type === "brush" && s.points && s.brushSize) {
      const r = s.brushSize / 2;
      for (let i = 1; i < s.points.length; i++) {
        const a = s.points[i - 1];
        const b = s.points[i];
        const d = pointSegDist({ x: rx, y: ry }, a, b);
        if (d <= r) return true;
      }
      return false;
    }
    return false;
  };

  const pointSegDist = (p: Point, a: Point, b: Point): number => {
    const vx = b.x - a.x, vy = b.y - a.y;
    const wx = p.x - a.x, wy = p.y - a.y;
    const c1 = vx * wx + vy * wy;
    if (c1 <= 0) return Math.hypot(p.x - a.x, p.y - a.y);
    const c2 = vx * vx + vy * vy;
    if (c2 <= c1) return Math.hypot(p.x - b.x, p.y - b.y);
    const t = c1 / c2;
    const projx = a.x + t * vx, projy = a.y + t * vy;
    return Math.hypot(p.x - projx, p.y - projy);
  };

  const handleNames = [
    "tl", "tm", "tr",
    "ml", /*center ignored*/ "mr",
    "bl", "bm", "br",
  ];

  const hitHandle = (p: Point, s: Shape): null | { name: string; kind: "rotate" | "resize" } => {
    const bb = shapeBoundsScreen(s);
    if (!bb) return null;
    const hs = 16; // visual size
    const tol = 10; // edge tolerance
    const pts = [
      { x: bb.x, y: bb.y, name: "tl" },
      { x: bb.x + bb.w / 2, y: bb.y, name: "tm" },
      { x: bb.x + bb.w, y: bb.y, name: "tr" },
      { x: bb.x, y: bb.y + bb.h / 2, name: "ml" },
      { x: bb.x + bb.w, y: bb.y + bb.h / 2, name: "mr" },
      { x: bb.x, y: bb.y + bb.h, name: "bl" },
      { x: bb.x + bb.w / 2, y: bb.y + bb.h, name: "bm" },
      { x: bb.x + bb.w, y: bb.y + bb.h, name: "br" },
    ];
    for (const h of pts) {
      if (Math.abs(p.x - h.x) <= hs && Math.abs(p.y - h.y) <= hs) {
        // corners rotate, sides resize
        const kind = ["tl", "tr", "bl", "br"].includes(h.name) ? "rotate" : "resize";
        return { name: h.name, kind };
      }
    }
    // Edge hit-testing to make grabbing sides easier
    if (p.y >= bb.y - tol && p.y <= bb.y + tol && p.x >= bb.x && p.x <= bb.x + bb.w) return { name: "tm", kind: "resize" };
    if (p.y >= bb.y + bb.h - tol && p.y <= bb.y + bb.h + tol && p.x >= bb.x && p.x <= bb.x + bb.w) return { name: "bm", kind: "resize" };
    if (p.x >= bb.x - tol && p.x <= bb.x + tol && p.y >= bb.y && p.y <= bb.y + bb.h) return { name: "ml", kind: "resize" };
    if (p.x >= bb.x + bb.w - tol && p.x <= bb.x + bb.w + tol && p.y >= bb.y && p.y <= bb.y + bb.h) return { name: "mr", kind: "resize" };
    return null;
  };

  const fillPolygonMask = (points: Array<{ x: number; y: number }>) => {
    if (points.length < 3) return;
    // compute center
    const cx = points.reduce((a, p) => a + p.x, 0) / points.length;
    const cy = points.reduce((a, p) => a + p.y, 0) / points.length;
    const sh: Shape = {
      id: nextShapeIdRef.current++,
      type: "polygon",
      points: points.map((p) => ({ x: p.x, y: p.y })),
      transform: { tx: 0, ty: 0, scaleX: 1, scaleY: 1, rotation: 0, cx, cy },
    };
    shapesRef.current.push(sh);
  };

  // Keyboard shortcuts for pen tool: Enter to finish, Esc to cancel
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (tool !== "pen" || !penActiveRef.current) return;
      if (e.key === "Enter") {
        e.preventDefault();
        finishPen();
      } else if (e.key === "Escape") {
        e.preventDefault();
        cancelPen();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tool]);

  // If user switches away from Pen, treat it as finish
  useEffect(() => {
    if (tool !== "pen" && penActiveRef.current) {
      finishPen();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tool]);

  const clearMask = () => {
    const maskCanvas = maskCanvasRef.current;
    if (!maskCanvas) return;
    const mctx = maskCanvas.getContext("2d");
    if (!mctx) return;
    shapesRef.current = [];
    const w = maskCanvas.width;
    const h = maskCanvas.height;
    mctx.clearRect(0, 0, w, h);
    render();
  };

  const exportMask = () => {
    const maskCanvas = maskCanvasRef.current;
    if (!maskCanvas) return;
    const out = document.createElement("canvas");
    out.width = Math.max(1, exportSize.w || maskCanvas.width);
    out.height = Math.max(1, exportSize.h || maskCanvas.height);
    const octx = out.getContext("2d");
    if (!octx) return;
    // Fill solid black background
    octx.fillStyle = "#000000";
    octx.fillRect(0, 0, out.width, out.height);
    // Scale shapes to export resolution and draw them in white
    const sx = out.width / maskCanvas.width;
    const sy = out.height / maskCanvas.height;
    octx.save();
    octx.scale(sx, sy);
    shapesRef.current.forEach((s) => drawShapeOnMask(octx, s));
    octx.restore();
    const dataUrl = out.toDataURL("image/png");
    const a = document.createElement("a");
    a.href = dataUrl;
    a.download = `mask_${out.width}x${out.height}.png`;
    a.click();
  };

  // Draw checkerboard background
  const drawCheckerboard = (ctx: CanvasRenderingContext2D, w: number, h: number) => {
    const size = 16;
    ctx.save();
    for (let y = 0; y < h; y += size) {
      for (let x = 0; x < w; x += size) {
        const even = ((x / size) + (y / size)) % 2 === 0;
        const lightA = "#eeeeee";
        const lightB = "#cccccc";
        ctx.fillStyle = even ? lightA : lightB;
        ctx.fillRect(x, y, size, size);
      }
    }
    ctx.restore();
  };

  useEffect(() => {
    render();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [brushSize, tool]);

  // Apply chosen export size to on-screen canvas and mask, keep centered
  useEffect(() => {
    const canvas = canvasRef.current;
    const maskCanvas = maskCanvasRef.current;
    if (!canvas || !maskCanvas) return;

    const targetW = Math.max(1, Math.floor(exportSize.w || canvas.width || 1));
    const targetH = Math.max(1, Math.floor(exportSize.h || canvas.height || 1));

    // Preserve mask content when resizing
    const oldMask = document.createElement("canvas");
    oldMask.width = maskCanvas.width;
    oldMask.height = maskCanvas.height;
    const oldCtx = oldMask.getContext("2d");
    const maskCtx = maskCanvas.getContext("2d");
    if (oldCtx && maskCtx) {
      oldCtx.drawImage(maskCanvas, 0, 0);
    }

    // Set intrinsic and CSS size to chosen export size
    canvas.width = targetW;
    canvas.height = targetH;
    canvas.style.width = `${targetW}px`;
    canvas.style.height = `${targetH}px`;

    maskCanvas.width = targetW;
    maskCanvas.height = targetH;
    maskCanvas.style.width = `${targetW}px`;
    maskCanvas.style.height = `${targetH}px`;

    // Restore mask scaled to new size
    const restoreCtx = maskCanvas.getContext("2d");
    if (restoreCtx && oldMask.width && oldMask.height) {
      restoreCtx.clearRect(0, 0, targetW, targetH);
      restoreCtx.drawImage(oldMask, 0, 0, oldMask.width, oldMask.height, 0, 0, targetW, targetH);
    }

    render();
  }, [exportSize]);

  return (
    <div className="w-full h-screen flex flex-col" data-lk-theme="default">
      <header className="flex items-center gap-3 px-4 py-2 border-b bg-white/70 border-gray-300 backdrop-blur">
        <span className="text-sm text-gray-600 dark:text-gray-300">Tool:</span>
        <div className="flex items-center gap-2">
          <button
            className={`px-3 py-1 rounded border transition-colors ${
              tool === "select"
                ? "bg-blue-600 text-white hover:bg-blue-700 border-blue-600"
                : "bg-white text-gray-900 hover:bg-gray-100 border-gray-300 dark:bg-neutral-800 dark:text-gray-100 dark:hover:bg-neutral-700 dark:border-neutral-700"
            }`}
            onClick={() => setTool("select")}
          >
            Select
          </button>
          <button
            className={`px-3 py-1 rounded border transition-colors ${
              tool === "brush"
                ? "bg-blue-600 text-white hover:bg-blue-700 border-blue-600"
                : "bg-white text-gray-900 hover:bg-gray-100 border-gray-300 dark:bg-neutral-800 dark:text-gray-100 dark:hover:bg-neutral-700 dark:border-neutral-700"
            }`}
            onClick={() => setTool("brush")}
          >
            Brush
          </button>
          <button
            className={`px-3 py-1 rounded border transition-colors ${
              tool === "pen"
                ? "bg-blue-600 text-white hover:bg-blue-700 border-blue-600"
                : "bg-white text-gray-900 hover:bg-gray-100 border-gray-300 dark:bg-neutral-800 dark:text-gray-100 dark:hover:bg-neutral-700 dark:border-neutral-700"
            }`}
            onClick={() => setTool("pen")}
          >
            Pen
          </button>
          <button
            className={`px-3 py-1 rounded border transition-colors ${
              tool === "circle"
                ? "bg-blue-600 text-white hover:bg-blue-700 border-blue-600"
                : "bg-white text-gray-900 hover:bg-gray-100 border-gray-300 dark:bg-neutral-800 dark:text-gray-100 dark:hover:bg-neutral-700 dark:border-neutral-700"
            }`}
            onClick={() => setTool("circle")}
          >
            Circle
          </button>
          <button
            className={`px-3 py-1 rounded border transition-colors ${
              tool === "rect"
                ? "bg-blue-600 text-white hover:bg-blue-700 border-blue-600"
                : "bg-white text-gray-900 hover:bg-gray-100 border-gray-300 dark:bg-neutral-800 dark:text-gray-100 dark:hover:bg-neutral-700 dark:border-neutral-700"
            }`}
            onClick={() => setTool("rect")}
          >
            Rectangle
          </button>
        </div>
        <div className="flex items-center gap-2 ml-6">
          <label className="text-sm text-gray-600">Background</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              const url = URL.createObjectURL(file);
              const img = new Image();
              img.onload = () => {
                bgImageRef.current = img;
                setExportSize({ w: img.naturalWidth || img.width, h: img.naturalHeight || img.height });
                render();
                URL.revokeObjectURL(url);
              };
              img.onerror = () => {
                try { URL.revokeObjectURL(url); } catch {}
              };
              img.src = url;
            }}
          />
          <button
            className="px-3 py-1 rounded border bg-white text-gray-900 hover:bg-gray-100 border-gray-300"
            onClick={() => { bgImageRef.current = null; render(); }}
          >
            Clear BG
          </button>
        </div>
        <div className="flex items-center gap-2 ml-6">
          <label className="text-sm text-gray-600">Size</label>
          <input
            type="range"
            min={1}
            max={128}
            value={brushSize}
            onChange={(e) => setBrushSize(parseInt(e.target.value))}
          />
          <span className="text-sm w-8 text-center text-gray-700">{brushSize}</span>
        </div>
        <div className="flex items-center gap-2 ml-6">
          <label className="text-sm text-gray-600">Canvas W</label>
          <input
            className="w-20 px-2 py-1 border rounded"
            type="number"
            min={64}
            max={4096}
            value={exportSize.w}
            onChange={(e) => setExportSize((s) => ({ ...s, w: Math.max(64, Math.min(4096, parseInt(e.target.value || "0"))) }))}
          />
          <label className="text-sm text-gray-600">H</label>
          <input
            className="w-20 px-2 py-1 border rounded"
            type="number"
            min={64}
            max={4096}
            value={exportSize.h}
            onChange={(e) => setExportSize((s) => ({ ...s, h: Math.max(64, Math.min(4096, parseInt(e.target.value || "0"))) }))}
          />
        </div>
        {tool === "pen" && penIsEditing && (
          <div className="flex items-center gap-2 ml-4">
            <button
              className="px-3 py-1 rounded border bg-white text-gray-900 hover:bg-gray-100 border-gray-300 dark:bg-neutral-800 dark:text-gray-100 dark:hover:bg-neutral-700 dark:border-neutral-700"
              onClick={finishPen}
            >
              Finish
            </button>
            <button
              className="px-3 py-1 rounded border bg-white text-gray-900 hover:bg-gray-100 border-gray-300 dark:bg-neutral-800 dark:text-gray-100 dark:hover:bg-neutral-700 dark:border-neutral-700"
              onClick={cancelPen}
            >
              Cancel
            </button>
          </div>
        )}
        <div className="flex-1" />
        <button
          className="px-3 py-1 rounded border bg-white text-gray-900 hover:bg-gray-100 border-gray-300"
          onClick={clearMask}
        >
          Clear
        </button>
        <button
          className="px-3 py-1 rounded border bg-white text-gray-900 hover:bg-gray-100 border-gray-300"
          onClick={exportMask}
        >
          Export
        </button>
      </header>

      <main ref={containerRef} className="flex-1 flex items-center justify-center bg-neutral-100">
        <canvas
          ref={canvasRef}
          className="touch-none cursor-crosshair"
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePointerUp}
          onDoubleClick={(e) => {
            if (tool !== "pen") return;
            e.preventDefault();
            finishPen();
          }}
          onContextMenu={(e) => e.preventDefault()}
        />
      </main>
    </div>
  );
}
