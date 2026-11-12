'use client'

import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import { paintImpression } from './paint'
import { brushMask, maskStyle } from './brush-mask'

// Homepage banner: paints public/banner.jpeg as an impressionist sketch (see ./paint.ts)
// with a brushy edge (./brush-mask.ts). Replace that file to change the banner.
const SRC = '/banner.jpeg'
const ASPECT = 3.5 // width / height of the strip; the photo is center-cropped to fit
const FOCUS_Y = 0.5 // which band of the photo to keep (0 = top, 1 = bottom)

export default function Impression() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [mask, setMask] = useState<string | null>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    let cancel = () => {}
    let cancelled = false

    const img = new Image()
    img.src = SRC
    img.onload = () => {
      if (cancelled) return
      // Fill the content column; CSS keeps it at 100% width if the window resizes later.
      const w = Math.max(200, canvas.parentElement?.clientWidth ?? 0)
      const h = Math.round(w / ASPECT)
      const cw = Math.min(img.naturalWidth, img.naturalHeight * ASPECT)
      const ch = cw / ASPECT
      const crop = { x: (img.naturalWidth - cw) / 2, y: (img.naturalHeight - ch) * FOCUS_Y, w: cw, h: ch }
      setMask(brushMask(w, h, [5, 9], [3, 8]))
      cancel = paintImpression(canvas, img, w, h, { crop, density: 1.3, detail: 2 })
    }

    return () => {
      cancelled = true
      cancel()
    }
  }, [])

  return (
    <Link href="/photos" aria-label="Photos" className="block w-full !no-underline hover:!bg-transparent">
      <canvas ref={canvasRef} className="block w-full h-auto" style={mask ? maskStyle(mask) : undefined} />
    </Link>
  )
}
