"use client";

import { useRef, useState, useEffect } from "react";
import { useImageStore } from "@/AxiosApi/ZustandImageStore";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Eraser, Pencil, Undo2, Redo2, Download, Circle } from "lucide-react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";

interface Point {
  x: number;
  y: number;
}

interface Line {
  tool: "pen" | "eraser";
  points: Point[];
  brushSize: number;
  color: string;
}

export default function Inpainting() {
  const { selectedImageId, images } = useImageStore();
  const { toast } = useToast();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [originalImageSize, setOriginalImageSize] = useState({ width: 0, height: 0 });
  const [lines, setLines] = useState<Line[]>([]);
  const [history, setHistory] = useState<Line[][]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [tool, setTool] = useState<"pen" | "eraser">("pen");
  const [brushSize, setBrushSize] = useState(5);
  const [isDrawing, setIsDrawing] = useState(false);
  const [dimensions, setDimensions] = useState({ width: 500, height: 400 });
  const [cursorStyle, setCursorStyle] = useState<string>("default");
  const [mousePos, setMousePos] = useState<Point | null>(null);

  const selectedImage = images.find((img) => img.id === selectedImageId);

  useEffect(() => {
    if (!selectedImage) return;

    const img = new window.Image();
    img.src = selectedImage.url;
    img.onload = () => {
      setImage(img);
      setOriginalImageSize({ width: img.width, height: img.height });
      const maxWidth = 500;
      const maxHeight = 400;
      const ratio = Math.min(maxWidth / img.width, maxHeight / img.height);
      setDimensions({
        width: img.width * ratio,
        height: img.height * ratio,
      });
    };
  }, [selectedImage]);

  useEffect(() => {
    drawCanvas();
  }, [image, lines, dimensions]);

  const drawCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas || !image) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.drawImage(image, 0, 0, dimensions.width, dimensions.height);

    ctx.fillStyle = "rgba(0, 0, 0, 0.3)";
    ctx.fillRect(0, 0, dimensions.width, dimensions.height);

    lines.forEach((line) => {
      if (line.points.length < 2) return;

      ctx.beginPath();
      ctx.moveTo(line.points[0].x, line.points[0].y);

      for (let i = 1; i < line.points.length; i++) {
        ctx.lineTo(line.points[i].x, line.points[i].y);
      }

      ctx.strokeStyle = line.color;
      ctx.lineWidth = line.brushSize;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.stroke();
    });
  };

  const getCanvasCoordinates = (e: React.MouseEvent<HTMLCanvasElement>): Point => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    const pos = getCanvasCoordinates(e);
    const newLine: Line = {
      tool,
      points: [pos],
      brushSize,
      color: "white",
    };
    if (tool === "pen") {
      setLines([...lines, newLine]);
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const pos = getCanvasCoordinates(e);
    setMousePos(pos);

    if (!isDrawing) return;

    if (tool === "pen") {
      setLines((prevLines) => {
        const lastLine = prevLines[prevLines.length - 1];
        const updatedLastLine = {
          ...lastLine,
          points: [...lastLine.points, pos],
        };
        return [...prevLines.slice(0, -1), updatedLastLine];
      });
    } else if (tool === "eraser") {
      setLines((prevLines) => {
        return prevLines.filter((line) => {
          return !line.points.some((point) => {
            const distance = Math.sqrt(
              Math.pow(pos.x - point.x, 2) + Math.pow(pos.y - point.y, 2)
            );
            return distance <= brushSize / 2;
          });
        });
      });
    }
  };

  const handleMouseUp = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    setHistory([...history.slice(0, historyIndex + 1), [...lines]]);
    setHistoryIndex((prevIndex) => prevIndex + 1);
  };

  const undo = () => {
    if (historyIndex <= -1) return;
    if (historyIndex === 0) {
      setLines([]);
      setHistoryIndex(-1);
      return;
    }
    const newIndex = historyIndex - 1;
    setLines([...history[newIndex]]);
    setHistoryIndex(newIndex);
  };

  const redo = () => {
    if (historyIndex >= history.length - 1) return;
    const newIndex = historyIndex + 1;
    setLines([...history[newIndex]]);
    setHistoryIndex(newIndex);
  };

  const clearCanvas = () => {
    setLines([]);
    setHistory((prevHistory) => [...prevHistory, []]);
    setHistoryIndex((prevIndex) => prevIndex + 1);
  };

  const handleExport = () => {
    const canvas = document.createElement("canvas");
    canvas.width = originalImageSize.width;
    canvas.height = originalImageSize.height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.fillStyle = "rgba(0, 0, 0, 0.3)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const scaleX = originalImageSize.width / dimensions.width;
    const scaleY = originalImageSize.height / dimensions.height;

    lines.forEach((line) => {
      if (line.points.length < 2) return;

      ctx.beginPath();
      ctx.moveTo(line.points[0].x * scaleX, line.points[0].y * scaleY);

      for (let i = 1; i < line.points.length; i++) {
        ctx.lineTo(line.points[i].x * scaleX, line.points[i].y * scaleY);
      }

      ctx.strokeStyle = line.color;
      ctx.lineWidth = line.brushSize * Math.max(scaleX, scaleY);
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.stroke();
    });

    const dataURL = canvas.toDataURL("image/png");
    const link = document.createElement("a");
    link.download = "mask.png";
    link.href = dataURL;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: "Success",
      description: "Mask exported successfully!",
    });
  };

  const handleMouseEnter = () => setCursorStyle("crosshair");
  const handleMouseLeave = () => {
    setCursorStyle("default");
    setMousePos(null);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <Card
        className="bg-white/20 backdrop-blur-md dark:bg-slate-900/40 dark:backdrop-blur-md rounded-xl shadow-lg w-full max-w-md mx-auto"
        style={{
          backgroundColor: window.matchMedia("(prefers-color-scheme: dark)").matches
            ? "rgba(17, 24, 39, -0.06)"
            : "rgba(255, 255, 255, -0.11)",
        }}
      >
        <CardContent className="space-y-6 p-4">
          <div className="flex items-center justify-between pb-4">
            <h3 className="text-lg font-bold">Image Inpainting</h3>
          </div>

          {!selectedImage ? (
            <div className="flex items-center justify-center h-40">
              <p className="text-gray-500 text-base font-normal">
                Please select an image first
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex flex-wrap gap-2">
                <Button
                  size="sm"
                  variant={tool === "pen" ? "default" : "outline"}
                  onClick={() => setTool("pen")}
                  className="bg-secondary hover:bg-creative dark:bg-primary dark:hover:bg-chart-4 text-text dark:text-text font-bold"
                >
                  <Pencil className="mr-1 h-3 w-3" /> Pencil
                </Button>
                <Button
                  size="sm"
                  variant={tool === "eraser" ? "default" : "outline"}
                  onClick={() => setTool("eraser")}
                  className="bg-secondary hover:bg-creative dark:bg-primary dark:hover:bg-chart-4 text-text dark:text-text font-bold"
                >
                  <Eraser className="mr-1 h-3 w-3" /> Eraser
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={undo}
                  disabled={historyIndex < 0}
                  className="bg-secondary hover:bg-creative dark:bg-primary dark:hover:bg-chart-4 text-text dark:text-text font-bold"
                >
                  <Undo2 className="h-3 w-3" />
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={redo}
                  disabled={historyIndex >= history.length - 1}
                  className="bg-secondary hover:bg-creative dark:bg-primary dark:hover:bg-chart-4 text-text dark:text-text font-bold"
                >
                  <Redo2 className="h-3 w-3" />
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={clearCanvas}
                  className="bg-secondary hover:bg-creative dark:bg-primary dark:hover:bg-chart-4 text-text dark:text-text font-bold"
                >
                  Clear
                </Button>
              </div>

              <div className="space-y-2">
                <Label className="text-base font-normal">Brush Size: {brushSize}px</Label>
                <Slider
                  defaultValue={[brushSize]}
                  min={1}
                  max={30}
                  step={1}
                  onValueChange={(value) => setBrushSize(value[0])}
                />
              </div>

              <div className="border rounded-md overflow-hidden relative">
                <canvas
                  ref={canvasRef}
                  width={dimensions.width}
                  height={dimensions.height}
                  onMouseDown={handleMouseDown}
                  onMouseMove={handleMouseMove}
                  onMouseUp={handleMouseUp}
                  onMouseLeave={handleMouseLeave}
                  onMouseEnter={handleMouseEnter}
                  style={{
                    cursor: cursorStyle,
                    width: "100%",
                    height: "auto",
                    backgroundColor: "#f0f0f0",
                  }}
                />
                {mousePos && (
                  <div
                    className="absolute pointer-events-none"
                    style={{
                      left: mousePos.x - brushSize / 2,
                      top: mousePos.y - brushSize / 2,
                    }}
                  >
                    <Circle
                      className="text-white"
                      size={brushSize}
                      style={{
                        filter: "drop-shadow(0 0 2px rgba(0,0,0,0.5))",
                      }}
                    />
                  </div>
                )}
              </div>
            </div>
          )}
        </CardContent>
        <CardFooter className="rounded-b-lg">
          {selectedImage && (
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full"
            >
              <Button
                onClick={handleExport}
                className="w-full bg-secondary hover:bg-creative dark:bg-primary dark:hover:bg-chart-4 text-text dark:text-text font-bold"
              >
                <Download className="h-3 w-3 mr-1" /> Export
              </Button>
            </motion.div>
          )}
        </CardFooter>
      </Card>
    </motion.div>
  );
}