"use client"

import { useState, useRef, useEffect } from "react"
import { Plus } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"

interface ColorPalette {
  name: string
  colors: string[]
}

const defaultPalettes: ColorPalette[] = [
  {
    name: "Ember",
    colors: ["#FF4D4D", "#666666", "#FFB4A1", "#FF8585", "#FF1A75"]
  },
  {
    name: "Fresh",
    colors: ["#FFE5B4", "#FF9966", "#4D94FF", "#98FF98", "#4D4DFF"]
  },
  {
    name: "Jungle",
    colors: ["#006400", "#228B22", "#32CD32", "#90EE90"]
  },
  {
    name: "Magic",
    colors: ["#FFB6C1", "#CBC3E3", "#4682B4", "#483D8B", "#FF69B4"]
  },
]

function ColorSpectrum({ onColorSelect }: { onColorSelect: (color: string) => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isDragging, setIsDragging] = useState(false)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const gradientHorizontal = ctx.createLinearGradient(0, 0, canvas.width, 0)
    gradientHorizontal.addColorStop(0, "rgb(255, 0, 0)")
    gradientHorizontal.addColorStop(1/6, "rgb(255, 255, 0)")
    gradientHorizontal.addColorStop(2/6, "rgb(0, 255, 0)")
    gradientHorizontal.addColorStop(3/6, "rgb(0, 255, 255)")
    gradientHorizontal.addColorStop(4/6, "rgb(0, 0, 255)")
    gradientHorizontal.addColorStop(5/6, "rgb(255, 0, 255)")
    gradientHorizontal.addColorStop(1, "rgb(255, 0, 0)")

    ctx.fillStyle = gradientHorizontal
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    const gradientVertical = ctx.createLinearGradient(0, 0, 0, canvas.height)
    gradientVertical.addColorStop(0, "rgba(255, 255, 255, 1)")
    gradientVertical.addColorStop(0.5, "rgba(255, 255, 255, 0)")
    gradientVertical.addColorStop(0.5, "rgba(0, 0, 0, 0)")
    gradientVertical.addColorStop(1, "rgba(0, 0, 0, 1)")

    ctx.fillStyle = gradientVertical
    ctx.fillRect(0, 0, canvas.width, canvas.height)
  }, [])

  const handleColorPick = (event: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const x = ('touches' in event ? event.touches[0].clientX : event.clientX) - rect.left
    const y = ('touches' in event ? event.touches[0].clientY : event.clientY) - rect.top
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const imageData = ctx.getImageData(x, y, 1, 1)
    const [r, g, b] = imageData.data
    const color = `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`
    onColorSelect(color)
  }

  return (
    <canvas
      ref={canvasRef}
      width={256}
      height={150}
      className="w-full h-[150px] cursor-crosshair rounded-md"
      onMouseDown={() => setIsDragging(true)}
      onMouseUp={() => setIsDragging(false)}
      onMouseLeave={() => setIsDragging(false)}
      onMouseMove={(e) => isDragging && handleColorPick(e)}
      onClick={handleColorPick}
      onTouchStart={() => setIsDragging(true)}
      onTouchEnd={() => setIsDragging(false)}
      onTouchMove={(e) => isDragging && handleColorPick(e)}
    />
  )
}

export default function CustomColorPalette() {
  const [selectedPalette, setSelectedPalette] = useState<ColorPalette>(defaultPalettes[0])
  const [customColors, setCustomColors] = useState<string[]>(Array(5).fill("#FFFFFF"))
  const [activeColorIndex, setActiveColorIndex] = useState<number | null>(null)

  const handleColorSelect = (color: string) => {
    if (activeColorIndex !== null) {
      const newColors = [...customColors]
      newColors[activeColorIndex] = color
      setCustomColors(newColors)
    }
  }

  return (
    <Card className="fixed w-[300px] bg-white/20 backdrop-blur-md  text-white">
      <CardContent className="p-4">
        <h2 className="mb-4 text-lg text-black font-semibold">Color palette</h2>
        <ScrollArea className="h-[400px] pr-4">
          <div className="space-y-4">
            {/* Existing Palettes */}
            {defaultPalettes.map((palette) => (
              <div key={palette.name} className="space-y-2">
                <Button
                  variant="ghost"
                  className={cn(
                    "w-full justify-start text-left text-black font-normal",
                    selectedPalette.name === palette.name && "bg-yellow-500"
                  )}
                  onClick={() => setSelectedPalette(palette)}
                >
                  {palette.name}
                </Button>
                <div className="grid grid-cols-5 gap-1">
                  {palette.colors.map((color, index) => (
                    <div
                      key={index}
                      className="h-8 w-full rounded-sm"
                      style={{ backgroundColor: color }}
                      title={color}
                    />
                  ))}
                </div>
              </div>
            ))}

            {/* Custom Palette */}
            <div className="space-y-2 text-black">
              <Button
                variant="ghost"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  "custom" === selectedPalette.name && "bg-yellow-500"
                )}
                onClick={() => setSelectedPalette({ name: "custom", colors: customColors })}
              >
                Custom
              </Button>
              <div className="grid grid-cols-5 gap-1">
                {customColors.map((color, index) => (
                  <Popover key={index}>
                    <PopoverTrigger asChild>
                      <button
                        className={cn(
                          "h-8 w-full rounded-sm transition-all hover:scale-105",
                          activeColorIndex === index && "ring-2 ring-white"
                        )}
                        style={{ backgroundColor: color }}
                        onClick={() => setActiveColorIndex(index)}
                      >
                        {color === "#FFFFFF" && (
                          <Plus className="h-4 w-4 mx-auto text-zinc-400" />
                        )}
                      </button>
                    </PopoverTrigger>
                    <PopoverContent className="w-64 p-2 bg-yellow-500 border-zinc-800">
                      <ColorSpectrum onColorSelect={handleColorSelect} />
                      <div className="mt-2 flex justify-between items-center">
                        <div
                          className="w-8 h-8 rounded-md border border-zinc-700"
                          style={{ backgroundColor: customColors[activeColorIndex ?? 0] }}
                        />
                        <span className="text-sm text-zinc-400">
                          {customColors[activeColorIndex ?? 0].toUpperCase()}
                        </span>
                      </div>
                    </PopoverContent>
                  </Popover>
                ))}
              </div>
            </div>
          </div>
        </ScrollArea>

        {/* Selected Palette Info */}
        <div className="mt-4">
          <p className="text-sm text-zinc-400">
            Selected: {selectedPalette.name === "custom" ? "Custom" : selectedPalette.name}
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            {(selectedPalette.name === "custom" ? customColors : selectedPalette.colors).map((color, index) => (
              <div key={index} className="flex items-center gap-1.5">
                <div
                  className="h-4 w-4 rounded-sm"
                  style={{ backgroundColor: color }}
                />
                <span className="text-xs text-zinc-400">{color.toUpperCase()}</span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

