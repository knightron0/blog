// Shared impressionist painter: short strokes, colored by the photo underneath,
// laid along its edges, coarse first and finer as it goes.
// Used by the homepage sketch (impression.tsx) and the /photos paint-in.

const BASE_WIDTH = 300 // stroke sizes/counts are tuned at this width, then scaled
const TOTAL_STROKES = 9000

export type PaintOptions = {
  duration?: number // ms
  /** multiplies the stroke count */
  density?: number
  /** source rect to sample from (defaults to the whole image) — lets callers crop to a strip */
  crop?: { x: number; y: number; w: number; h: number }
  /** >1 = finer: samples the photo at higher resolution and ends on thinner, more numerous strokes */
  detail?: number
  onDone?: () => void
}

const mix = (a: number, b: number, t: number) => a + (b - a) * t

/** Paints `img` onto `canvas` at CSS size w×h. Returns a cancel function. */
export function paintImpression(
  canvas: HTMLCanvasElement,
  img: CanvasImageSource & { naturalWidth?: number },
  w: number,
  h: number,
  { duration = 4500, density = 1, crop, detail = 1, onDone }: PaintOptions = {}
): () => void {
  let raf = 0
  let cancelled = false

  const dpr = Math.min(window.devicePixelRatio || 1, 2)
  canvas.width = Math.round(w * dpr)
  canvas.height = Math.round(h * dpr)
  // Bigger canvas → somewhat bigger strokes and somewhat more of them (keeps it painterly).
  const k = w / BASE_WIDTH
  const sizeScale = k ** 0.7
  // stroke count tracks area, so tall/short canvases get proportional coverage
  const total = Math.round(TOTAL_STROKES * density * detail ** 1.6 * k ** 0.6 * Math.min(2.5, (h / w) / 0.66) ** 0.8)
  const ctx = canvas.getContext('2d')!
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
  ctx.lineCap = 'round'

  // Sample the photo at a low resolution for colors + edge directions.
  const sw = Math.max(16, Math.min(Math.round(w / 2), Math.round(130 * Math.min(k, 1.6) * detail)))
  const sh = Math.max(16, Math.round((sw * h) / w))
  const off = document.createElement('canvas')
  off.width = sw
  off.height = sh
  const octx = off.getContext('2d', { willReadFrequently: true })!
  if (crop) octx.drawImage(img, crop.x, crop.y, crop.w, crop.h, 0, 0, sw, sh)
  else octx.drawImage(img, 0, 0, sw, sh)
  const px = octx.getImageData(0, 0, sw, sh).data
  const lum = new Float32Array(sw * sh)
  for (let i = 0; i < sw * sh; i++) lum[i] = 0.299 * px[i * 4] + 0.587 * px[i * 4 + 1] + 0.114 * px[i * 4 + 2]
  const L = (x: number, y: number) => lum[Math.min(sh - 1, Math.max(0, y)) * sw + Math.min(sw - 1, Math.max(0, x))]

  const strokeAt = (progress: number) => {
    const u = Math.random(), v = Math.random()

    const sx = Math.min(sw - 1, Math.floor(u * sw)), sy = Math.min(sh - 1, Math.floor(v * sh))
    const i = (sy * sw + sx) * 4
    let r = px[i], g = px[i + 1], b = px[i + 2]
    // jitter so neighboring strokes don't read as flat blocks
    const j = (Math.random() - 0.5) * 8
    r += j; g += j; b += j

    // Lay the stroke along the edge (perpendicular to the luminance gradient).
    const gx = L(sx + 1, sy) - L(sx - 1, sy)
    const gy = L(sx, sy + 1) - L(sx, sy - 1)
    const mag = Math.hypot(gx, gy)
    const angle = mag > 6 ? Math.atan2(gy, gx) + Math.PI / 2 : Math.random() * Math.PI
    const wobble = (Math.random() - 0.5) * 0.5

    // coarse → fine
    // detail shrinks strokes (most at the fine end), so the last layers carry sharper detail
    const fine = mix(detail ** 0.5, detail, progress)
    const len = (mix(16, 4, progress) * sizeScale * (0.6 + Math.random() * 0.8)) / fine
    const width = (mix(6, 1.6, progress) * sizeScale * (0.7 + Math.random() * 0.6)) / fine

    const x = u * w, y = v * h
    const cx = Math.cos(angle + wobble) * len / 2, cy = Math.sin(angle + wobble) * len / 2
    ctx.strokeStyle = `rgba(${r | 0},${g | 0},${b | 0},${mix(0.55, 0.85, progress)})`
    ctx.lineWidth = width
    ctx.beginPath()
    ctx.moveTo(x - cx, y - cy)
    ctx.quadraticCurveTo(x + (Math.random() - 0.5) * 2, y + (Math.random() - 0.5) * 2, x + cx, y + cy)
    ctx.stroke()
  }

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  if (reduced) {
    for (let s = 0; s < total; s++) strokeAt(s / total)
    onDone?.()
    return () => {}
  }

  let drawn = 0
  const start = performance.now()
  const frame = (now: number) => {
    if (cancelled) return
    const t = Math.min(1, (now - start) / duration)
    // ease-out: most paint lands early, details settle in at the end
    const target = Math.floor(total * (1 - (1 - t) ** 2))
    for (; drawn < target; drawn++) strokeAt(drawn / total)
    if (t < 1) raf = requestAnimationFrame(frame)
    else onDone?.()
  }
  raf = requestAnimationFrame(frame)

  return () => {
    cancelled = true
    cancelAnimationFrame(raf)
  }
}
