'use client'

import { useState } from 'react'
import RetroGrid from '@/components/ui/retro-grid'

const COLORS = [
  { value: '#00f3ff' }, // neon-cyan
  { value: '#ff003c' }, // neon-pink
  { value: '#fcee0a' }, // neon-yellow
  { value: '#ff00ff' }, // magenta
  { value: '#00ff88' }, // green
]

export default function RetroBackground() {
  const [gridColor, setGridColor] = useState('#ff00ff')
  const [showScanlines, setShowScanlines] = useState(false)
  const [glowEffect, setGlowEffect] = useState(true)
  const [panelPos, setPanelPos] = useState({ x: 24, y: 80 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })

  return (
    <>
      <RetroGrid
        gridColor={gridColor}
        showScanlines={showScanlines}
        glowEffect={glowEffect}
        className="fixed inset-0 z-0"
      />

      {/* Controls panel */}
      <div
        className="fixed z-40 w-52 cursor-move select-none rounded-sm border border-neon-cyan/30 bg-black/85 backdrop-blur-sm"
        style={{ left: panelPos.x, top: panelPos.y }}
        onMouseDown={(e) => {
          setIsDragging(true)
          setDragOffset({ x: e.clientX - panelPos.x, y: e.clientY - panelPos.y })
        }}
        onMouseMove={(e) => {
          if (isDragging)
            setPanelPos({ x: e.clientX - dragOffset.x, y: e.clientY - dragOffset.y })
        }}
        onMouseUp={() => setIsDragging(false)}
        onMouseLeave={() => setIsDragging(false)}
      >
        <div className="border-b border-neon-cyan/20 px-3 py-2">
          <p className="font-orbitron text-xs font-bold tracking-widest text-neon-cyan">
            // GRID_CONTROLS
          </p>
        </div>

        <div className="space-y-4 p-3">
          {/* Color swatches */}
          <div>
            <p className="mb-2 font-space-mono text-xs tracking-widest text-gray-500">COLOR</p>
            <div className="flex flex-wrap gap-2">
              {COLORS.map(({ value }) => (
                <button
                  key={value}
                  onClick={(e) => { e.stopPropagation(); setGridColor(value) }}
                  className="h-7 w-7 rounded-sm border-2 transition-all"
                  style={{
                    backgroundColor: value,
                    borderColor: gridColor === value ? '#ffffff' : 'transparent',
                    boxShadow: gridColor === value ? `0 0 8px ${value}` : 'none',
                  }}
                />
              ))}
              <input
                type="color"
                value={gridColor}
                onChange={(e) => setGridColor(e.target.value)}
                onClick={(e) => e.stopPropagation()}
                className="h-7 w-7 cursor-pointer rounded-sm border-0 bg-transparent"
              />
            </div>
          </div>

          {/* Toggles */}
          <div className="space-y-3">
            {(
              [
                { label: 'SCANLINES', value: showScanlines, set: setShowScanlines },
                { label: 'NEON GLOW', value: glowEffect, set: setGlowEffect },
              ] as const
            ).map(({ label, value, set }) => (
              <div key={label} className="flex items-center justify-between">
                <span className="font-space-mono text-xs tracking-widest text-gray-400">
                  {label}
                </span>
                <button
                  onClick={(e) => { e.stopPropagation(); set(!value) }}
                  className="relative h-4 w-8 rounded-full transition-all"
                  style={{ background: value ? `${gridColor}33` : '#1a1a1a' }}
                >
                  <span
                    className="absolute top-0.5 h-3 w-3 rounded-full transition-all"
                    style={{
                      left: value ? '1rem' : '0.125rem',
                      background: value ? gridColor : '#4b5563',
                      boxShadow: value ? `0 0 6px ${gridColor}` : 'none',
                    }}
                  />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  )
}
