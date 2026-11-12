'use client'

import Image from 'next/image'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { paintImpression } from 'app/components/paint'

export type Photo = { src: string; width: number; height: number; blurDataURL: string }

// Paints the photo in brush strokes when it scrolls into view (same brushwork as the
// homepage sketch), then fades the real photo in over the painting.
function PaintedPhoto({ photo, delay }: { photo: Photo; delay: number }) {
  const boxRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const imgRef = useRef<HTMLImageElement | null>(null)
  const [loaded, setLoaded] = useState(false)
  const [inView, setInView] = useState(false)
  const [revealed, setRevealed] = useState(false)

  useEffect(() => {
    const el = boxRef.current
    if (!el) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setRevealed(true) // no paint-in, just show the photo
      return
    }
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setInView(true)
          io.disconnect()
        }
      },
      { threshold: 0.25 }
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])

  useEffect(() => {
    if (!inView || !loaded || revealed) return
    const canvas = canvasRef.current, img = imgRef.current, box = boxRef.current
    if (!canvas || !img || !box) return
    let cancel = () => {}
    let done: ReturnType<typeof setTimeout>
    const start = setTimeout(() => {
      const { width, height } = box.getBoundingClientRect()
      try {
        cancel = paintImpression(canvas, img, width, height, {
          density: 1.3,
          duration: 1800,
          // let the painting sit for a beat before the photo comes through
          onDone: () => { done = setTimeout(() => setRevealed(true), 350) },
        })
      } catch {
        setRevealed(true) // e.g. canvas unavailable — just show the photo
      }
    }, delay)
    return () => {
      clearTimeout(start)
      clearTimeout(done)
      cancel()
    }
  }, [inView, loaded, revealed, delay])

  return (
    <div ref={boxRef} className="absolute inset-0 bg-[#FCF6F1]">
      <canvas ref={canvasRef} aria-hidden className="absolute inset-0 w-full h-full" />
      <Image
        ref={imgRef}
        src={photo.src}
        alt=""
        fill
        sizes="(min-width: 768px) 400px, 50vw"
        onLoad={() => setLoaded(true)}
        className={`object-cover transition-opacity ease-out duration-[1200ms] ${revealed ? 'opacity-100 group-hover:opacity-85' : 'opacity-0'}`}
      />
    </div>
  )
}

export default function Gallery({ rows }: { rows: Photo[][] }) {
  // flat list (with each photo's index) so the lightbox can step through everything
  const { all, indexed } = useMemo(() => {
    let i = 0
    const indexed = rows.map((row) => row.map((p) => ({ p, i: i++ })))
    return { all: rows.flat(), indexed }
  }, [rows])
  const [open, setOpen] = useState<number | null>(null)
  const touchX = useRef<number | null>(null)

  const close = useCallback(() => setOpen(null), [])
  const step = useCallback(
    (d: number) => setOpen((i) => (i === null ? i : (i + d + all.length) % all.length)),
    [all.length]
  )

  useEffect(() => {
    if (open === null) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close()
      if (e.key === 'ArrowRight') step(1)
      if (e.key === 'ArrowLeft') step(-1)
    }
    window.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [open, close, step])

  const current = open !== null ? all[open] : null

  return (
    <>
      {/* justified rows: each item grows by its aspect ratio, so every photo in a row shares one height */}
      <div className="flex flex-col gap-1.5 sm:gap-2">
        {indexed.map((row, r) => (
          <div key={r} className="flex gap-1.5 sm:gap-2">
            {row.map(({ p, i }) => {
              const ar = p.width / p.height
              return (
                <button
                  key={p.src}
                  onClick={() => setOpen(i)}
                  aria-label="Open photo"
                  style={{ flex: `${ar} 1 0%`, aspectRatio: `${ar}` }}
                  className="group relative min-w-0 overflow-hidden cursor-zoom-in"
                >
                  <PaintedPhoto photo={p} delay={(i % 3) * 180} />
                </button>
              )
            })}
            {/* pad a lone photo so it doesn't blow up to full width */}
            {Array.from({ length: row.length === 1 ? 2 : 0 }, (_, k) => (
              <div key={`pad${k}`} style={{ flex: '1.5 1 0%' }} />
            ))}
          </div>
        ))}
      </div>

      {current && (
        <div
          className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#111]/95 p-4 sm:p-10 cursor-zoom-out"
          onClick={close}
          onTouchStart={(e) => (touchX.current = e.touches[0].clientX)}
          onTouchEnd={(e) => {
            if (touchX.current === null) return
            const dx = e.changedTouches[0].clientX - touchX.current
            if (Math.abs(dx) > 40) step(dx < 0 ? 1 : -1)
            touchX.current = null
          }}
        >
          <div className="relative flex-1 w-full min-h-0">
            <Image
              key={current.src}
              src={current.src}
              alt=""
              fill
              sizes="100vw"
              quality={90}
              placeholder="blur"
              blurDataURL={current.blurDataURL}
              className="object-contain"
              priority
            />
          </div>
          <div className="mt-4 flex items-center gap-6 text-sm text-neutral-400 select-none">
            <button
              onClick={(e) => { e.stopPropagation(); step(-1) }}
              className="px-2 py-1 hover:text-white transition-colors cursor-pointer"
              aria-label="Previous photo"
            >
              ←
            </button>
            <span className="tabular-nums">
              {open! + 1} / {all.length}
            </span>
            <button
              onClick={(e) => { e.stopPropagation(); step(1) }}
              className="px-2 py-1 hover:text-white transition-colors cursor-pointer"
              aria-label="Next photo"
            >
              →
            </button>
          </div>
          {/* preload neighbours */}
          <div className="hidden">
            {[1, -1].map((d) => {
              const n = all[(open! + d + all.length) % all.length]
              return <Image key={n.src} src={n.src} alt="" fill sizes="100vw" quality={90} />
            })}
          </div>
        </div>
      )}
    </>
  )
}
