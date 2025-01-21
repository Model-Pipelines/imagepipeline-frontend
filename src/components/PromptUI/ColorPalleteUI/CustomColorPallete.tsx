import { useState, useRef, useEffect } from "react"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { useColorPaletteStore } from "@/lib/store"

interface ColorPalette {
  name: string
  colors: string[]
}

const defaultPalettes: ColorPalette[] = [
  {
    name: "Ember",
    colors: ["#FF4D4D", "#666666", "#FFB4A1", "#FF8585", "#FF1A75"],
  },
  {
    name: "Fresh",
    colors: ["#FFE5B4", "#FF9966", "#4D94FF", "#98FF98", "#4D4DFF"],
  },
  {
    name: "Jungle",
    colors: ["#006400", "#228B22", "#32CD32", "#90EE90"],
  },
  {
    name: "Magic",
    colors: ["#FFB6C1", "#CBC3E3", "#4682B4", "#483D8B", "#FF69B4"],
  },
]

function ColorSpectrum({ onColorSelect }: { onColorSelect: (color: string) => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isDragging, setIsDragging] = useState(false)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const gradientHorizontal = ctx.createLinearGradient(0, 0, canvas.width, 0)
    gradientHorizontal.addColorStop(0, "rgb(255, 0, 0)")
    gradientHorizontal.addColorStop(1 / 6, "rgb(255, 255, 0)")
    gradientHorizontal.addColorStop(2 / 6, "rgb(0, 255, 0)")
    gradientHorizontal.addColorStop(3 / 6, "rgb(0, 255, 255)")
    gradientHorizontal.addColorStop(4 / 6, "rgb(0, 0, 255)")
    gradientHorizontal.addColorStop(5 / 6, "rgb(255, 0, 255)")
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
    const x = ("touches" in event ? event.touches[0].clientX : event.clientX) - rect.left
    const y = ("touches" in event ? event.touches[0].clientY : event.clientY) - rect.top
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const imageData = ctx.getImageData(x, y, 1, 1)
    const [r, g, b] = imageData.data
    const color = `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`
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
  const setGlobalSelectedPalette = useColorPaletteStore((state) => state.setSelectedPalette)

  useEffect(() => {
    // Update global state when selected palette changes
    setGlobalSelectedPalette(selectedPalette)
  }, [selectedPalette, setGlobalSelectedPalette])

  const handlePaletteSelect = (palette: ColorPalette) => {
    setSelectedPalette(palette)
    setGlobalSelectedPalette(palette)
  }

  const handleColorSelect = (color: string) => {
    if (activeColorIndex !== null) {
      const newColors = [...customColors]
      newColors[activeColorIndex] = color
      setCustomColors(newColors)
    }
  }

  const handleColorInputChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const newColor = e.target.value
    if (/^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/.test(newColor)) {
      const updatedColors = [...customColors]
      updatedColors[index] = newColor
      setCustomColors(updatedColors)
    }
  }

  return (
    <Card className="fixed w-[300px] bg-white/20 backdrop-blur-md text-white">
      <CardContent className="p-4">
        <h2 className="mb-4 text-lg text-black font-semibold">Color palette</h2>
        <ScrollArea className="h-[300px] pr-4">
          <div className="space-y-4">
            {defaultPalettes.map((palette) => (
              <div key={palette.name} className="space-y-2">
                <Button
                  variant="ghost"
                  className={cn(
                    "w-full justify-between text-left text-black font-normal py-2 px-3",
                    selectedPalette.name === palette.name && "bg-yellow-500",
                  )}
                  onClick={() => handlePaletteSelect(palette)}
                >
                  <span>{palette.name}</span>
                  <div className="flex items-center space-x-2">
                    {palette.colors.map((color, index) => (
                      <div
                        key={index}
                        className="h-5 w-5 rounded-sm"
                        style={{ backgroundColor: color }}
                        title={color}
                      />
                    ))}
                  </div>
                </Button>
              </div>
            ))}

            <div className="space-y-2 text-black">
              <Button
                variant="ghost"
                className={cn(
                  "w-full justify-between text-left font-normal py-2 px-3",
                  "custom" === selectedPalette.name && "bg-yellow-500",
                )}
                onClick={() => setSelectedPalette({ name: "custom", colors: customColors })}
              >
                <span>Custom</span>
                <div className="flex items-center space-x-2">
                  {customColors.map((color, index) => (
                    <Popover key={index}>
                      <PopoverTrigger asChild>
                        <button
                          className={cn(
                            "h-5 w-5 rounded-sm transition-all hover:scale-105",
                            activeColorIndex === index && "ring-1 ring-yellow-500",
                          )}
                          style={{ backgroundColor: color }}
                          onClick={(e) => {
                            e.stopPropagation()
                            setActiveColorIndex(index)
                          }}
                        >
                          {color === "#FFFFFF" && <Plus className="h-4 w-4 mx-auto text-zinc-400" />}
                        </button>
                      </PopoverTrigger>
                      <PopoverContent className="w-64 p-2 bg-yellow-500 border-zinc-800">
                        <ColorSpectrum onColorSelect={handleColorSelect} />
                        <div className="mt-2 flex justify-between items-center">
                          <div
                            className="w-8 h-8 rounded-md border border-zinc-700"
                            style={{ backgroundColor: customColors[activeColorIndex ?? 0] }}
                          />
                          <input
                            type="text"
                            value={customColors[activeColorIndex ?? 0].toUpperCase()}
                            onChange={(e) => handleColorInputChange(e, activeColorIndex ?? 0)}
                            className="ml-2 w-24 text-sm text-zinc-700 bg-white border border-zinc-300 rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                          />
                        </div>
                      </PopoverContent>
                    </Popover>
                  ))}
                </div>
              </Button>
            </div>
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}

