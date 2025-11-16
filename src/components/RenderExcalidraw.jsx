"use client";

import "@/styles/excalidraw.css";
import { Button } from "./ui/button";
import { ZoomIn, ZoomOut, RotateCcw } from "lucide-react";
import { useRef, useState, useEffect } from "react";

export function RenderExcalidraw({ src }) {
  const [svg, setSvg] = useState(null);

  const containerRef = useRef(null);
  const contentRef = useRef(null);
  const [transform, setTransform] = useState({ scale: 1, x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [lastTouchDistance, setLastTouchDistance] = useState(null);

  useEffect(() => {
    const fetchSvg = async () => {
      const res = await fetch(src);
      const data = await res.text();
      if (data) {
        setSvg(data);
      }
    };
    fetchSvg();
  }, [src]);

  useEffect(() => {
    if (svg && containerRef.current && contentRef.current) {
      const svgElement = contentRef.current.querySelector("svg");
      if (svgElement) {
        svgElement.style.width = "100%";
        svgElement.style.height = "100%";
        svgElement.style.display = "block";
      }
    }
  }, [svg]);

  // Reset zoom/pan on Escape
  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === "Escape") {
        setTransform({ scale: 1, x: 0, y: 0 });
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const handleWheel = (e) => {
    // Hanya intercept saat zoom dengan Ctrl/Cmd
    if (!e.shiftKey && !e.metaKey) return;

    e.preventDefault();
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    const newScale = Math.max(0.5, transform.scale * delta);

    const scaleRatio = newScale / transform.scale;
    const newX = x - (x - transform.x) * scaleRatio;
    const newY = y - (y - transform.y) * scaleRatio;

    setTransform({ scale: newScale, x: newX, y: newY });
  };

  const handleMouseDown = (e) => {
    if (e.button === 0) {
      setIsPanning(true);
      setStartPos({ x: e.clientX - transform.x, y: e.clientY - transform.y });
    }
  };

  const handleMouseMove = (e) => {
    if (isPanning) {
      setTransform({
        ...transform,
        x: e.clientX - startPos.x,
        y: e.clientY - startPos.y
      });
    }
  };

  const handleMouseUp = () => {
    setIsPanning(false);
  };

  const getTouchDistance = (touches) => {
    const dx = touches[0].clientX - touches[1].clientX;
    const dy = touches[0].clientY - touches[1].clientY;
    return Math.sqrt(dx * dx + dy * dy);
  };

  const getTouchCenter = (touches) => {
    return {
      x: (touches[0].clientX + touches[1].clientX) / 2,
      y: (touches[0].clientY + touches[1].clientY) / 2
    };
  };

  const handleTouchStart = (e) => {
    if (e.touches.length === 2) {
      e.preventDefault();
      setLastTouchDistance(getTouchDistance(e.touches));
    } else if (e.touches.length === 1) {
      const rect = containerRef.current.getBoundingClientRect();
      setIsPanning(true);
      setStartPos({
        x: e.touches[0].clientX - rect.left - transform.x,
        y: e.touches[0].clientY - rect.top - transform.y
      });
    }
  };

  const handleTouchMove = (e) => {
    if (e.touches.length === 2 && lastTouchDistance) {
      e.preventDefault();
      const currentDistance = getTouchDistance(e.touches);
      const rect = containerRef.current.getBoundingClientRect();
      const center = getTouchCenter(e.touches);
      const x = center.x - rect.left;
      const y = center.y - rect.top;

      const delta = currentDistance / lastTouchDistance;
      const newScale = Math.max(0.5, transform.scale * delta);

      const scaleRatio = newScale / transform.scale;
      const newX = x - (x - transform.x) * scaleRatio;
      const newY = y - (y - transform.y) * scaleRatio;

      setTransform({ scale: newScale, x: newX, y: newY });
      setLastTouchDistance(currentDistance);
    } else if (e.touches.length === 1 && isPanning) {
      const rect = containerRef.current.getBoundingClientRect();
      setTransform({
        ...transform,
        x: e.touches[0].clientX - rect.left - startPos.x,
        y: e.touches[0].clientY - rect.top - startPos.y
      });
    }
  };

  const handleTouchEnd = () => {
    setIsPanning(false);
    setLastTouchDistance(null);
  };

  const applyZoom = (factor, pivotX, pivotY) => {
    setTransform((prev) => {
      const newScale = Math.max(0.5, prev.scale * factor);
      const scaleRatio = newScale / prev.scale;
      const newX = pivotX - (pivotX - prev.x) * scaleRatio;
      const newY = pivotY - (pivotY - prev.y) * scaleRatio;
      return { scale: newScale, x: newX, y: newY };
    });
  };

  const handleZoomIn = (e) => {
    e?.preventDefault?.();
    e?.stopPropagation?.();
    if (!containerRef.current) return;
    const { width, height } = containerRef.current.getBoundingClientRect();
    applyZoom(1.2, width / 2, height / 2);
  };

  const handleZoomOut = (e) => {
    e?.preventDefault?.();
    e?.stopPropagation?.();
    if (!containerRef.current) return;
    const { width, height } = containerRef.current.getBoundingClientRect();
    applyZoom(1 / 1.2, width / 2, height / 2);
  };

  const handleReset = (e) => {
    e?.preventDefault?.();
    e?.stopPropagation?.();
    setTransform({ scale: 1, x: 0, y: 0 });
  };

  return (
    <div
      ref={containerRef}
      className="excalidraw-container"
      onWheel={handleWheel}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <p className="mt-1! ml-1! hidden w-full text-sm! text-yellow-900 xl:block">
        Shift + wheel to zoom. Esc to reset.
      </p>
      <div
        ref={contentRef}
        className="excalidraw-content"
        style={{
          transform: `translate(${transform.x}px, ${transform.y}px) scale(${transform.scale})`,
          transformOrigin: "0 0",
          cursor: isPanning ? "grabbing" : "grab"
        }}
        dangerouslySetInnerHTML={{ __html: svg || "" }}
      />
      <div className="absolute top-2 right-2 z-10 flex flex-col gap-2">
        <Button
          size="icon-sm"
          variant="outline"
          aria-label="Zoom in"
          onMouseDown={(e) => e.stopPropagation()}
          onClick={handleZoomIn}
        >
          <ZoomIn className="size-4" />
        </Button>
        <Button
          size="icon-sm"
          variant="outline"
          aria-label="Zoom out"
          onMouseDown={(e) => e.stopPropagation()}
          onClick={handleZoomOut}
        >
          <ZoomOut className="size-4" />
        </Button>
        <Button
          size="icon-sm"
          variant="outline"
          aria-label="Reset"
          onMouseDown={(e) => e.stopPropagation()}
          onClick={handleReset}
        >
          <RotateCcw className="size-4" />
        </Button>
      </div>
    </div>
  );
}
