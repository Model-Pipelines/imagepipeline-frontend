"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import { useImageStore } from "@/AxiosApi/ZustandImageStore";
import { useInpaintingStore } from "@/AxiosApi/InpaintingStore";
import { useBackgroundTaskStore } from "@/AxiosApi/TaskStore";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Eraser, Pencil, Undo2, Redo2 } from "lucide-react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { v4 as uuidv4 } from "uuid";
import { useAuth } from "@clerk/nextjs";
import { useUploadBackendFiles, useInpaintImage } from "@/AxiosApi/TanstackQuery";
import { TextShimmerWave } from "@/components/ui/text-shimmer-wave";

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
  const { selectedImageId, images, addPendingImage } = useImageStore();
  const { inpaintingParams, setInpaintingParams, clearInpaintingParams } = useInpaintingStore();
  const { tasks, addTask } = useBackgroundTaskStore();
  const { toast } = useToast();
  const { getToken } = useAuth();
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
  const [prompt, setPrompt] = useState("");
  const [pendingTaskId, setPendingTaskId] = useState<string | null>(null);
  const { mutate: uploadImage } = useUploadBackendFiles();
  const { mutate: startInpainting } = useInpaintImage();

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

  useEffect(() => {
    if (pendingTaskId) {
      const task = tasks[pendingTaskId];
      if (task) {
        if (task.status === "SUCCESS") {
          toast({
            title: "Success",
            description: "Image generated successfully!",
          });
          setPendingTaskId(null);
        } else if (task.status === "FAILURE") {
          toast({
            title: "Error",
            description: "Inpainting failed. Please try again.",
            variant: "destructive",
          });
          setPendingTaskId(null);
        }
      }
    }
  }, [tasks, pendingTaskId, toast]);

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
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
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
        if (!lastLine || lastLine.tool !== "pen") return prevLines;

        const updatedLine = {
          ...lastLine,
          points: [...lastLine.points, pos],
        };
        return [...prevLines.slice(0, -1), updatedLine];
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

  const createMaskFile = useCallback(() => {
    const canvas = document.createElement("canvas");
    canvas.width = originalImageSize.width;
    canvas.height = originalImageSize.height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;

    ctx.fillStyle = "#000000"; // Solid black background
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

    return new Promise<File>((resolve) => {
      canvas.toBlob((blob) => {
        if (blob) {
          resolve(new File([blob], "mask.png", { type: "image/png" }));
        }
      }, "image/png");
    });
  }, [lines, originalImageSize, dimensions]);

  const handleGenerate = useCallback(async () => {
    // Validate prompt
    if (!prompt.trim()) {
      toast({
        title: "Error",
        description: "Please enter a prompt first.",
        variant: "destructive",
      });
      return;
    }

    // Validate selected image
    if (!selectedImage) {
      toast({
        title: "Error",
        description: "No image selected.",
        variant: "destructive",
      });
      return;
    }

    // Get authentication token
    const token = await getToken();
    if (!token) {
      toast({
        title: "Error",
        description: "Authentication token not available.",
        variant: "destructive",
      });
      return;
    }

    // Create and upload mask
    const maskFile = await createMaskFile();
    if (!maskFile) {
      toast({
        title: "Error",
        description: "Failed to create mask file.",
        variant: "destructive",
      });
      return;
    }

    // Upload mask and proceed with inpainting
    uploadImage(
      { data: maskFile, token },
      {
        onSuccess: (maskUrl) => {
          // Set inpainting parameters
          setInpaintingParams({
            init_image: selectedImage.url,
            mask_image: maskUrl,
            prompt,
          });
          toast({
            title: "Success",
            description: "Mask generated successfully!",
          });

          // Proceed with inpainting
          const payload = {
            init_image: selectedImage.url,
            mask_image: maskUrl,
            prompt,
          };

          const newId = uuidv4();
          const position = selectedImage ? { x: selectedImage.position.x, y: selectedImage.position.y } : { x: 50, y: 100 };
          const scaleFactor = 200 / Math.max(originalImageSize.width, originalImageSize.height);
          const scaledWidth = originalImageSize.width * scaleFactor;
          const scaledHeight = originalImageSize.height * scaleFactor;

          startInpainting(
            { data: payload, token },
            {
              onSuccess: (response) => {
                if (!response?.id) {
                  toast({
                    title: "Error",
                    description: "Missing task ID.",
                    variant: "destructive",
                  });
                  return;
                }
                setPendingTaskId(response.id);
                addTask(response.id, selectedImageId!, "inpainting");
                addPendingImage({
                  id: response.id,
                  position,
                  size: { width: scaledWidth, height: scaledHeight },
                });
                toast({
                  title: "Started",
                  description: "Inpainting in progress...",
                });
              },
              onError: (error: any) => {
                toast({
                  title: "Error",
                  description: error.message || "Failed to start inpainting.",
                  variant: "destructive",
                });
                setPendingTaskId(null);
              },
            }
          );
        },
        onError: (error: any) => {
          toast({
            title: "Error",
            description: error.message || "Failed to upload mask.",
            variant: "destructive",
          });
        },
      }
    );
  }, [
    prompt,
    selectedImage,
    selectedImageId,
    originalImageSize,
    getToken,
    createMaskFile,
    uploadImage,
    setInpaintingParams,
    startInpainting,
    addTask,
    addPendingImage,
    toast,
  ]);

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
        className="bg-white/20 backdrop-blur-md dark:bg-slate-900/40 dark:backdrop-blur-md rounded-xl shadow-lg w-full max-w-md mx-auto h-[80vh] max-h-[900px] overflow-y-auto"
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
              <div className="space-y-2">
                <Label htmlFor="prompt" className="text-base font-normal">
                  Prompt
                </Label>
                <Input
                  id="prompt"
                  placeholder="Describe the inpainting changes"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  className="w-full bg-white/10 dark:bg-slate-800/10 backdrop-blur-sm border border-white/10 dark:border-white/5 hover:bg-white/20 dark:hover:bg-slate-800/20 text-base font-normal"
                />
              </div>

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
              </div>
            </div>
          )}
        </CardContent>
        <CardFooter className="rounded-b-lg flex gap-2">
          {selectedImage && (
            <>
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex-1"
              >
                <Button
                  onClick={handleGenerate}
                  disabled={pendingTaskId && tasks[pendingTaskId]?.status === "PENDING"}
                  className="w-full bg-secondary hover:bg-creative dark:bg-primary dark:hover:bg-chart-4 text-text dark:text-text font-bold"
                >
                  {pendingTaskId && tasks[pendingTaskId]?.status === "PENDING" ? (
                    <TextShimmerWave>Generating...</TextShimmerWave>
                  ) : (
                    "Generate"
                  )}
                </Button>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex-1"
              >
                <Button
                  onClick={clearInpaintingParams}
                  variant="outline"
                  className="w-full bg-secondary hover:bg-creative dark:bg-primary dark:hover:bg-chart-4 text-text dark:text-text font-bold"
                >
                  Clear Saved
                </Button>
              </motion.div>
            </>
          )}
        </CardFooter>
      </Card>
    </motion.div>
  );
}