'use client'

import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import { paintImpression } from './paint'
import { brushMask, maskStyle } from './brush-mask'

// Defaults preserve the homepage banner; posts can supply their own image and framing.
type ImpressionProps = {
  src?: string
  aspect?: number
  focusY?: number
  href?: string | null
  alt?: string
  interactive?: boolean
}

export default function Impression({
  src = '/banner.jpeg',
  aspect = 3.5,
  focusY = 0.5,
  href = '/photos',
  alt = 'Photos',
  interactive = true,
}: ImpressionProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [mask, setMask] = useState<string | null>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    let cancel = () => {}
    let cancelled = false
    let frame = 0
    let painting = true
    let ready = false
    let previous: { x: number; y: number } | null = null
    const strokes: { x: number; y: number; angle: number; length: number; width: number; time: number }[] = []
    const source = document.createElement('canvas')
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)')
    const hover = window.matchMedia('(hover: hover) and (pointer: fine)')

    const render = (now: number) => {
      frame = 0
      const ctx = canvas.getContext('2d')
      if (!ctx || cancelled) return
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      ctx.drawImage(source, 0, 0)
      ctx.save()
      ctx.globalCompositeOperation = 'destination-out'
      ctx.lineCap = 'round'
      for (let i = strokes.length - 1; i >= 0; i--) {
        const stroke = strokes[i]
        const age = now - stroke.time
        if (age >= 1400) {
          strokes.splice(i, 1)
          continue
        }
        ctx.globalAlpha = 0.8 * (1 - Math.max(0, age - 200) / 1200)
        ctx.lineWidth = stroke.width
        const dx = Math.cos(stroke.angle) * stroke.length / 2
        const dy = Math.sin(stroke.angle) * stroke.length / 2
        ctx.beginPath()
        ctx.moveTo(stroke.x - dx, stroke.y - dy)
        ctx.lineTo(stroke.x + dx, stroke.y + dy)
        ctx.stroke()
      }
      ctx.restore()
      if (painting || strokes.length) frame = requestAnimationFrame(render)
    }

    const onMove = (event: PointerEvent) => {
      if (!ready || event.pointerType === 'touch' || !hover.matches || reducedMotion.matches) return
      const rect = canvas.getBoundingClientRect()
      const scale = canvas.width / rect.width
      const x = (event.clientX - rect.left) * scale
      const y = (event.clientY - rect.top) * canvas.height / rect.height
      const from = previous ?? { x, y }
      const steps = Math.min(24, Math.max(1, Math.ceil(Math.hypot(x - from.x, y - from.y) / (8 * scale))))
      for (let step = 1; step <= steps; step++) {
        for (let i = 0; i < 5; i++) {
          const angle = Math.random() * Math.PI * 2
          const radius = Math.sqrt(Math.random()) * 13 * scale
          strokes.push({
            x: from.x + (x - from.x) * step / steps + Math.cos(angle) * radius,
            y: from.y + (y - from.y) * step / steps + Math.sin(angle) * radius,
            angle: -0.4 + Math.random() * 0.8,
            length: (4 + Math.random() * 8) * scale,
            width: (1.5 + Math.random() * 3) * scale,
            time: performance.now(),
          })
        }
      }
      if (strokes.length > 1800) strokes.splice(0, strokes.length - 1800)
      previous = { x, y }
      if (!frame) frame = requestAnimationFrame(render)
    }
    const onLeave = () => { previous = null }
    if (interactive) {
      canvas.addEventListener('pointermove', onMove)
      canvas.addEventListener('pointerleave', onLeave)
    }

    const img = new Image()
    img.onload = () => {
      if (cancelled) return
      // Fill the content column; CSS keeps it at 100% width if the window resizes later.
      const w = Math.max(200, canvas.parentElement?.clientWidth ?? 0)
      const h = Math.round(w / aspect)
      const cw = Math.min(img.naturalWidth, img.naturalHeight * aspect)
      const ch = cw / aspect
      const crop = { x: (img.naturalWidth - cw) / 2, y: (img.naturalHeight - ch) * focusY, w: cw, h: ch }
      setMask(brushMask(w, h, [11, 16], [3, 9]))
      cancel = paintImpression(source, img, w, h, {
        crop, density: 1.3, detail: 2,
        onDone: () => { painting = false },
      })
      canvas.width = source.width
      canvas.height = source.height
      ready = true
      if (!frame) frame = requestAnimationFrame(render)
    }
    img.src = src

    return () => {
      cancelled = true
      cancel()
      cancelAnimationFrame(frame)
      canvas.removeEventListener('pointermove', onMove)
      canvas.removeEventListener('pointerleave', onLeave)
    }
  }, [src, aspect, focusY, interactive])

  const canvas = (
    <canvas ref={canvasRef} role="img" aria-label={alt} className="block w-full h-auto" style={{ aspectRatio: `${aspect}`, ...(mask ? maskStyle(mask) : {}) }} />
  )

  return href ? (
    <Link href={href} aria-label={alt} className="block w-full !no-underline hover:!bg-transparent">
      {canvas}
    </Link>
  ) : (
    <div className="my-6 w-full">{canvas}</div>
  )
}
