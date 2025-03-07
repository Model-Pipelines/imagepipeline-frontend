"use client"

import type React from "react"

import { useState, useEffect, useRef, useCallback } from "react"
import { Plus, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { useSettingPanelStore } from "@/AxiosApi/SettingPanelStore"

interface ColorPalette {
  name: string
  colors: string[]
  image?: string | null
}

const defaultPalettes: ColorPalette[] = [
  { name: "Ember", colors: ["#FF4D4D", "#666666", "#FFB4A1", "#FF8585", "#FF1A75"] },
  { name: "Fresh", colors: ["#FFE5B4", "#FF9966", "#4D94FF", "#98FF98", "#4D4DFF"] },
  { name: "Jungle", colors: ["#006400", "#228B22", "#32CD32", "#90EE90"] },
  { name: "Magic", colors: ["#FFB6C1", "#CBC3E3", "#4682B4", "#483D8B", "#FF69B4"] },
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
    const color = `#${r.toString(16).padStart(2, "0")}${g
      .toString(16)
      .padStart(2, "0")}${b.toString(16).padStart(2, "0")}`
    onColorSelect(color)
  }

  return (
    <canvas
      ref={canvasRef}
      width={256}
      height={150}
      className="w-full h-[150px] cursor-crosshair rounded-md border border-gray-300 dark:border-gray-600 shadow-inner"
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
  const {
    text,
    image_url,
    magic_prompt,
    hex_color,
    selectedPaletteName,
    paletteImages,
    updateSetting,
    setPaletteImage,
  } = useSettingPanelStore()

  const [customColors, setCustomColors] = useState<string[]>(Array(5).fill("#FFFFFF"))
  const [activeColorIndex, setActiveColorIndex] = useState<number | null>(null)
  const [inputValue, setInputValue] = useState<string>("")
  const [openPopoverIndex, setOpenPopoverIndex] = useState<number | null>(null)
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    if (!isVisible && selectedPaletteName !== "custom") {
      const resetColors = Array(5).fill("#FFFFFF")
      setCustomColors(resetColors)
    }
  }, [isVisible, selectedPaletteName])

  const handlePaletteSelect = useCallback(
    (palette: ColorPalette) => {
      const newColors =
        palette.name === "custom" ? customColors : palette.colors.concat(Array(5).fill("#FFFFFF")).slice(0, 5)
      if (image_url) {
        const currentEmberImage = paletteImages["Ember"]
        if (palette.name !== "Ember" && currentEmberImage) {
          setPaletteImage(palette.name, currentEmberImage)
          setPaletteImage("Ember", null)
        }
        setPaletteImage("Ember", image_url)
      }
      updateSetting(text, image_url, magic_prompt, newColors, palette.name)
    },
    [customColors, image_url, magic_prompt, paletteImages, setPaletteImage, text, updateSetting],
  )

  const handleColorSelect = (color: string) => {
    if (activeColorIndex !== null) {
      const newColors = [...customColors]
      newColors[activeColorIndex] = color
      setCustomColors(newColors)
      setInputValue(color.toUpperCase())
    }
  }

  const handleColorInputChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const newValue = e.target.value
    setInputValue(newValue.toUpperCase())

    let colorValue = newValue
    if (colorValue.length > 0 && !colorValue.startsWith("#")) {
      colorValue = "#" + colorValue
    }

    const updatedColors = [...customColors]
    updatedColors[index] = colorValue
    setCustomColors(updatedColors)
  }

  const handleInputBlur = (index: number) => {
    let finalColor = customColors[index]
    if (finalColor.length < 4 || !/^#[0-9A-F]{6}$/i.test(finalColor)) {
      finalColor = "#FFFFFF"
    }
    const updatedColors = [...customColors]
    updatedColors[index] = finalColor
    setCustomColors(updatedColors)
    setInputValue(finalColor.toUpperCase())
  }

  const closePopover = () => {
    setOpenPopoverIndex(null)
    setActiveColorIndex(null)
  }

  return (
    isVisible && (
      <Card className="fixed z-[1000] w-[320px] bg-white/20 backdrop-blur-md dark:bg-slate-900/40 dark:backdrop-blur-md shadow-lg rounded-xl border border-gray-200 dark:border-gray-700/50">
        <CardContent className="p-4 backdrop-filter backdrop-blur-sm">
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-2 right-2 hover:bg-white/30 dark:hover:bg-slate-700/40 dark:backdrop-blur-md rounded-full backdrop-blur-sm"
            onClick={() => setIsVisible(false)}
            aria-label="Close palette"
          >
            <X className="h-4 w-4 text-gray-700 dark:text-gray-300" />
          </Button>
          <h2 className="mb-4 text-lg text-gray-800 font-medium dark:text-white">Color Palette</h2>
          <ScrollArea className="h-[300px] pr-2">
            <div className="space-y-2">
              {defaultPalettes.map((palette) => (
                <div key={palette.name} className="space-y-2">
                  <Button
                    variant="ghost"
                    className={cn(
                      "w-full justify-between py-3 px-4 text-gray-800 dark:text-gray-200 font-medium rounded-md backdrop-blur-sm",
                      selectedPaletteName === palette.name
                        ? "bg-blue-100/80 border dark:bg-blue-900/30 dark:backdrop-blur-md border-accent text-notice dark:text-blue-300"
                        : "bg-slate-100/80 dark:bg-slate-800/30 dark:backdrop-blur-md hover:bg-white/40 dark:hover:bg-slate-700/40 hover:shadow-sm",
                    )}
                    onClick={() => handlePaletteSelect(palette)}
                    aria-label={`Select ${palette.name} palette`}
                  >
                    <span>{palette.name}</span>
                    <div className="flex items-center space-x-1">
                      {palette.colors.map((color, index) => (
                        <div
                          key={index}
                          className="h-4 w-4 rounded-full border border-gray-200"
                          style={{ backgroundColor: color }}
                          title={color}
                        />
                      ))}
                    </div>
                  </Button>
                  {paletteImages[palette.name] && (
                    <img
                      src={paletteImages[palette.name]! || "/placeholder.svg"}
                      alt={`${palette.name} image`}
                      className="w-10 h-10 object-cover rounded-md ml-4"
                    />
                  )}
                </div>
              ))}

              <div className="space-y-2">
                <Button
                  variant="ghost"
                  className={cn(
                    "w-full justify-between py-3 px-4 text-gray-800 dark:text-gray-200 font-medium rounded-md backdrop-blur-sm",
                    selectedPaletteName === "custom"
                      ? "bg-blue-100/80 border dark:bg-blue-900/30 dark:backdrop-blur-md border-accent text-notice dark:text-blue-300"
                      : "bg-slate-100/80 dark:bg-slate-800/30 dark:backdrop-blur-md hover:bg-white/40 dark:hover:bg-slate-700/40 hover:shadow-sm",
                  )}
                  onClick={() => handlePaletteSelect({ name: "custom", colors: customColors })}
                  aria-label="Select custom palette"
                >
                  <span>Custom</span>
                  <div className="flex items-center space-x-1">
                    {customColors.map((color, index) => (
                      <Popover
                        key={index}
                        open={openPopoverIndex === index}
                        onOpenChange={(open) => {
                          setOpenPopoverIndex(open ? index : null)
                          if (open) {
                            setActiveColorIndex(index)
                            setInputValue(color.toUpperCase())
                          }
                        }}
                      >
                        <PopoverTrigger asChild>
                          <div
                            role="button"
                            tabIndex={0}
                            className={cn(
                              "h-4 w-4 rounded-full border border-gray-200 transition-all hover:scale-110",
                              activeColorIndex === index && "ring-2 ring-blue-500",
                            )}
                            style={{ backgroundColor: color }}
                            onClick={(e) => {
                              e.stopPropagation()
                            }}
                          >
                            {color === "#FFFFFF" && <Plus className="h-3 w-3 mx-auto text-gray-500" />}
                          </div>
                        </PopoverTrigger>
                        <PopoverContent className="w-72 p-4 bg-gray-100/90 dark:bg-gray-800/60 backdrop-blur-md dark:backdrop-blur-md border border-gray-200 dark:border-gray-700/50 shadow-md rounded-lg">
                          <div className="flex justify-between items-center mb-3">
                            <span className="font-medium text-gray-800 dark:text-white">Pick a Color</span>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 p-0 hover:bg-gray-200/70 dark:hover:bg-gray-700/50 dark:backdrop-blur-md text-gray-600 dark:text-gray-300 backdrop-blur-sm"
                              onClick={closePopover}
                              aria-label="Close color picker"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                          <ColorSpectrum onColorSelect={handleColorSelect} />
                          <div className="mt-3 flex justify-between items-center">
                            <div
                              className="w-8 h-8 rounded-md border border-gray-300 dark:border-gray-600 shadow-sm"
                              style={{ backgroundColor: customColors[index] }}
                            />
                            <input
                              type="text"
                              value={activeColorIndex === index ? inputValue : customColors[index]}
                              onChange={(e) => handleColorInputChange(e, index)}
                              onBlur={() => handleInputBlur(index)}
                              className="ml-3 w-28 text-sm text-gray-700 dark:text-gray-200 bg-white/90 dark:bg-gray-700/60 backdrop-blur-sm dark:backdrop-blur-md border border-gray-300 dark:border-gray-600/50 rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
  )
}

