'use client'

import Image from 'next/image'
import { useCallback, useEffect, useState } from 'react'

export default function Gallery({ photos }: { photos: string[] }) {
  const [open, setOpen] = useState<number | null>(null)

  const close = useCallback(() => setOpen(null), [])
  const step = useCallback(
    (d: number) => setOpen((i) => (i === null ? i : (i + d + photos.length) % photos.length)),
    [photos.length]
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

  return (
    <>
      <div className="columns-1 sm:columns-2 gap-3">
        {photos.map((src, i) => (
          <button
            key={src}
            onClick={() => setOpen(i)}
            className="block w-full mb-3 break-inside-avoid cursor-zoom-in"
          >
            <Image
              src={src}
              alt=""
              width={0}
              height={0}
              sizes="(min-width: 640px) 384px, 100vw"
              className="w-full h-auto rounded-sm hover:opacity-90 transition-opacity"
            />
          </button>
        ))}
      </div>

      {open !== null && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 cursor-zoom-out"
          onClick={close}
        >
          <Image
            src={photos[open]}
            alt=""
            width={0}
            height={0}
            sizes="100vw"
            className="w-auto h-auto max-w-full max-h-full object-contain"
            onClick={(e) => { e.stopPropagation(); step(1) }}
            priority
          />
          <span className="absolute bottom-4 left-1/2 -translate-x-1/2 text-sm text-neutral-400">
            {open + 1} / {photos.length}
          </span>
        </div>
      )}
    </>
  )
}
