"use client";

import React from 'react'
import { useColorPaletteStore } from '@/lib/store'

const SelectedPaletteDisplay = () => {
  const selectedPalette = useColorPaletteStore((state) => state.selectedPalette)
  
  if (!selectedPalette) return null

  return (
    <div className="flex flex-row  rounded-lg  w-64">
      <div className="flex flex-row gap-2">
        {selectedPalette.colors.map((color, index) => (
          <div key={index} className="flex items-center gap-2">
            <div
              className="w-8 h-8 rounded-md"
              style={{ backgroundColor: color }}
            />
          </div>
        ))}
      </div>
    </div>
  )
}

export default SelectedPaletteDisplay