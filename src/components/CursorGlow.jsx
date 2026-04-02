import { useEffect } from 'react'

const COLORS = [
  '#53fc18', // pax
  '#00c2ff', // raku
  '#d42020', // redjangu
]

function hexToRgb(hex) {
  return [
    parseInt(hex.slice(1, 3), 16),
    parseInt(hex.slice(3, 5), 16),
    parseInt(hex.slice(5, 7), 16),
  ]
}

function blendColor(c1, c2, t) {
  const [r1, g1, b1] = hexToRgb(c1)
  const [r2, g2, b2] = hexToRgb(c2)
  const r = Math.round(r1 + (r2 - r1) * t).toString(16).padStart(2, '0')
  const g = Math.round(g1 + (g2 - g1) * t).toString(16).padStart(2, '0')
  const b = Math.round(b1 + (b2 - b1) * t).toString(16).padStart(2, '0')
  return `#${r}${g}${b}`
}

function makeCursor(color) {
  const svg = encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="22" height="30" viewBox="0 0 16 22">
      <path d="M0 0 L0 18 L4 13.5 L7 21 L9 20 L6 12.5 L12 12.5 Z"
        fill="${color}" stroke="#000" stroke-width="1.2" stroke-linejoin="round"/>
    </svg>`
  )
  return `url("data:image/svg+xml,${svg}") 0 0, auto`
}

function makePointer(color) {
  const svg = encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="22" height="28" viewBox="0 0 22 28">
      <path d="M6 0 C6 0 6 14 6 14 C6 14 4 12 2 13 C0 14 1 17 3 18 C5 19 8 23 10 25 C12 27 14 28 16 28 C20 28 22 25 22 21 L22 14 C22 14 22 12 20 12 C18 12 18 13 18 13 C18 13 18 11 16 11 C14 11 14 12 14 12 C14 12 14 10 12 10 C10 10 10 11 10 11 L10 0 C10 0 10 -1 8 -1 C6 -1 6 0 6 0 Z"
        fill="${color}" stroke="#000" stroke-width="1" stroke-linejoin="round"/>
    </svg>`
  )
  return `url("data:image/svg+xml,${svg}") 6 0, pointer`
}

let styleTag = null

function setCursor(color) {
  document.documentElement.style.cursor = makeCursor(color)

  if (!styleTag) {
    styleTag = document.createElement('style')
    styleTag.id = 'cursor-pointer-override'
    document.head.appendChild(styleTag)
  }
  styleTag.textContent = `a, button, [role="button"], label, select, [tabindex] { cursor: ${makePointer(color)} !important; }`
}

export default function CursorGlow() {
  useEffect(() => {
    if (window.matchMedia('(pointer: coarse)').matches) return

    let currentIdx = 0
    let transitionTimer = null
    let mainTimer = null

    const TRANSITION_MS = 600
    const FRAMES = 24

    function transition(fromIdx, toIdx) {
      let frame = 0
      transitionTimer = setInterval(() => {
        frame++
        const t = frame / FRAMES
        setCursor(blendColor(COLORS[fromIdx], COLORS[toIdx], t))
        if (frame >= FRAMES) {
          clearInterval(transitionTimer)
          currentIdx = toIdx
        }
      }, TRANSITION_MS / FRAMES)
    }

    setCursor(COLORS[0])

    mainTimer = setInterval(() => {
      const nextIdx = (currentIdx + 1) % COLORS.length
      transition(currentIdx, nextIdx)
    }, 2000)

    return () => {
      clearInterval(mainTimer)
      clearInterval(transitionTimer)
      document.documentElement.style.cursor = ''
      if (styleTag) { styleTag.remove(); styleTag = null }
    }
  }, [])

  return null
}
