"use client";

import { useRef, useState, useEffect } from "react";
import * as fabric from "fabric";
import { useImageStore } from "@/AxiosApi/ZustandImageStore";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Eraser, Pencil, Undo2, Redo2, Download, Circle } from "lucide-react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { InfoTooltip } from "@/components/ui/info-tooltip";

export default function Inpainting() {
  const { selectedImageId, images } = useImageStore();
  const { toast } = useToast();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fabricRef = useRef<fabric.Canvas | null>(null);
  const [tool, setTool] = useState<"pen" | "eraser">("pen");
  const [brushSize, setBrushSize] = useState(10);
  const [dimensions, setDimensions] = useState({ width: 500, height: 400 });
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [mousePos, setMousePos] = useState<{ x: number; y: number } | null>(null);
  const [originalImageSize, setOriginalImageSize] = useState({
    width: 0,
    height: 0,
  });

  const selectedImage = images.find((img) => img.id === selectedImageId);

  useEffect(() => {
    if (!canvasRef.current || !selectedImage) return;
  
    console.log("Fetching image from URL:", selectedImage.url);
  
    const loadImage = async () => {
      try {
        const response = await fetch(selectedImage.url, {
          mode: "cors", // Attempt to handle CORS
          headers: {
            // If authentication is needed, add it here, e.g.:
            // "Authorization": "Bearer YOUR_API_TOKEN"
          },
        });
  
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status} - ${response.statusText}`);
        }
  
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
  
        console.log("Image fetched successfully, blob URL:", url);
  
        const img = new window.Image();
        img.src = url;
  
        img.onload = () => {
          console.log("Image loaded successfully:", selectedImage.url);
          // Rest of your canvas setup code here...
        };
  
        img.onerror = () => {
          console.error("Image failed to load after fetch:", url);
          toast({
            title: "Error",
            description: "Failed to load the image after fetching.",
            variant: "destructive",
          });
        };
      } catch (error) {
        console.error("Fetch error:", error.message);
        toast({
          title: "Error",
          description: `Failed to fetch the image: ${error.message}`,
          variant: "destructive",
        });
      }
    };
  
    loadImage();
  
    return () => {
      if (fabricRef.current) {
        fabricRef.current.dispose();
        fabricRef.current = null;
      }
    };
  }, [selectedImage]);

  useEffect(() => {
    if (!fabricRef.current) return;

    const canvas = fabricRef.current;
    if (tool === "pen") {
      canvas.isDrawingMode = true;
      canvas.freeDrawingBrush = new fabric.PencilBrush(canvas);
      canvas.freeDrawingBrush.color = "white";
      canvas.freeDrawingBrush.width = brushSize;
      // @ts-ignore
      canvas.freeDrawingBrush.globalCompositeOperation = "source-over";
    } else if (tool === "eraser") {
      canvas.isDrawingMode = true;
      canvas.freeDrawingBrush = new fabric.PencilBrush(canvas);
      canvas.freeDrawingBrush.color = "rgba(0,0,0,1)";
      canvas.freeDrawingBrush.width = brushSize;
      // @ts-ignore
      canvas.freeDrawingBrush.globalCompositeOperation = "destination-out";
    }
  }, [tool, brushSize]);

  const undo = () => {
    if (historyIndex <= 0 || !fabricRef.current) return;
    const newIndex = historyIndex - 1;
    fabricRef.current.loadFromJSON(JSON.parse(history[newIndex]), () => {
      fabricRef.current?.renderAll();
    });
    setHistoryIndex(newIndex);
  };

  const redo = () => {
    if (historyIndex >= history.length - 1 || !fabricRef.current) return;
    const newIndex = historyIndex + 1;
    fabricRef.current.loadFromJSON(JSON.parse(history[newIndex]), () => {
      fabricRef.current?.renderAll();
    });
    setHistoryIndex(newIndex);
  };

  const clearCanvas = () => {
    if (!fabricRef.current) return;
    const canvas = fabricRef.current;
    canvas.getObjects().forEach((obj) => {
      if (obj.type !== "image" && obj.type !== "rect") {
        canvas.remove(obj);
      }
    });
    canvas.renderAll();
    const json = canvas.toJSON();
    setHistory((prev) => [...prev, JSON.stringify(json)]);
    setHistoryIndex((prev) => prev + 1);
  };

  const handleExport = () => {
    if (!fabricRef.current || !selectedImage) return;

    const canvas = fabricRef.current;
    const tempCanvas = document.createElement("canvas");
    const exportCanvas = new fabric.Canvas(tempCanvas, {
      width: originalImageSize.width,
      height: originalImageSize.height,
      backgroundColor: "transparent",
    });

    const scaleX = originalImageSize.width / dimensions.width;
    const scaleY = originalImageSize.height / dimensions.height;

    canvas.getObjects().forEach((obj) => {
      obj.clone((cloned: fabric.Object) => {
        cloned.scaleX = (cloned.scaleX || 1) * scaleX;
        cloned.scaleY = (cloned.scaleY || 1) * scaleY;
        cloned.left = (cloned.left || 0) * scaleX;
        cloned.top = (cloned.top || 0) * scaleY;
        if (cloned instanceof fabric.Path) {
          // @ts-ignore
          cloned.globalCompositeOperation = obj.globalCompositeOperation;
        }
        exportCanvas.add(cloned);
      });
    });

    const dataURL = exportCanvas.toDataURL({
      format: "png",
      quality: 1,
      multiplier: 1,
    });

    const link = document.createElement("a");
    link.download = "inpainting-result.png";
    link.href = dataURL;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    exportCanvas.dispose();
    tempCanvas.remove();

    toast({
      title: "Success",
      description: "Image with mask exported successfully!",
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <Card
        className="bg-white/20 backdrop-blur-md dark:bg-slate-900/40 dark:backdrop-blur-md rounded-xl shadow-lg"
        style={{
          backgroundColor: window.matchMedia("(prefers-color-scheme: dark)")
            .matches
            ? "rgba(17, 24, 39, -0.06)"
            : "rgba(255, 255, 255, -0.11)",
        }}
      >
        <CardContent className="space-y-6 p-4">
          {!selectedImage ? (
            <p className="text-gray-500 text-base font-normal">
              No image selected
            </p>
          ) : (
            <>
              <div className="flex flex-wrap gap-2 mb-2">
                <Button
                  size="sm"
                  variant={tool === "pen" ? "default" : "outline"}
                  onClick={() => setTool("pen")}
                >
                  <Pencil className="mr-1 h-3 w-3" /> Pencil
                </Button>
                <Button
                  size="sm"
                  variant={tool === "eraser" ? "default" : "outline"}
                  onClick={() => setTool("eraser")}
                >
                  <Eraser className="mr-1 h-3 w-3" /> Eraser
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={undo}
                  disabled={historyIndex <= 0}
                >
                  <Undo2 className="h-3 w-3" />
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={redo}
                  disabled={historyIndex >= history.length - 1}
                >
                  <Redo2 className="h-3 w-3" />
                </Button>
                <Button size="sm" variant="outline" onClick={clearCanvas}>
                  Clear
                </Button>
              </div>

              <div className="space-y-1">
                <Label className="text-xs">Brush Size: {brushSize}px</Label>
                <Slider
                  defaultValue={[brushSize]}
                  min={1}
                  max={50}
                  step={1}
                  onValueChange={(value) => setBrushSize(value[0])}
                />
              </div>

              <div className="relative border rounded-md overflow-hidden">
                <canvas
                  ref={canvasRef}
                  style={{
                    cursor: "crosshair",
                    width: `${dimensions.width}px`,
                    height: `${dimensions.height}px`,
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
                      className={tool === "pen" ? "text-white" : "text-black"}
                      size={brushSize}
                      style={{
                        filter: "drop-shadow(0 0 2px rgba(0,0,0,0.5))",
                      }}
                    />
                  </div>
                )}
              </div>
            </>
          )}
        </CardContent>
        <CardFooter className="flex justify-end p-3">
          <Button
            size="sm"
            onClick={handleExport}
            disabled={!selectedImage}
            className="bg-secondary hover:bg-creative dark:bg-primary dark:hover:bg-chart-4"
          >
            <Download className="mr-1 h-3 w-3" /> Export
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  );
}