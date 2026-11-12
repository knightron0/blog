// Brushy edge mask for the homepage banner: a solid core with short strokes along each
// side, giving it a ragged, hand-painted border. Returned as a PNG data URL for mask-image.
export function brushMask(w: number, h: number, band: [number, number], stroke: [number, number]): string {
  const dpr = Math.min(window.devicePixelRatio || 1, 2)
  const c = document.createElement('canvas')
  c.width = Math.round(w * dpr)
  c.height = Math.round(h * dpr)
  const ctx = c.getContext('2d')!
  ctx.scale(dpr, dpr)
  ctx.fillStyle = ctx.strokeStyle = '#000'
  ctx.lineCap = 'round'

  const [bandMin, bandMax] = band
  const [strokeMin, strokeMax] = stroke
  const m = Math.max(bandMin, Math.min(bandMax, Math.min(w, h) * 0.035)) // edge band width
  ctx.fillRect(m, m, w - 2 * m, h - 2 * m)

  const R = Math.random
  // each side: [start x, start y, direction x, direction y, inward normal x, normal y, length]
  const sides: [number, number, number, number, number, number, number][] = [
    [0, 0, 1, 0, 0, 1, w],
    [w, 0, 0, 1, -1, 0, h],
    [w, h, -1, 0, 0, -1, w],
    [0, h, 0, -1, 1, 0, h],
  ]
  for (const [ox, oy, dx, dy, nx, ny, len] of sides) {
    const n = Math.round(len / (strokeMin + 0.5))
    for (let k = 0; k < n; k++) {
      const t = R() * len
      // how far the stroke's outer edge reaches toward the frame (0 = core, m = full bleed)
      const reach = m * (0.15 + R() * 0.95)
      const width = strokeMin + R() * (strokeMax - strokeMin)
      const depth = Math.max(width / 2, m - reach + width / 2)
      const sl = (6 + R() * 12) * (m / 7)
      const a = (R() - 0.5) * 0.35
      const ux = dx * Math.cos(a) - dy * Math.sin(a), uy = dx * Math.sin(a) + dy * Math.cos(a)
      const cx = ox + dx * t + nx * depth, cy = oy + dy * t + ny * depth
      ctx.globalAlpha = R() < 0.25 ? 0.55 : 1 // a few dry-brush strokes
      ctx.lineWidth = width
      ctx.beginPath()
      ctx.moveTo(cx - (ux * sl) / 2, cy - (uy * sl) / 2)
      ctx.quadraticCurveTo(cx + nx * (R() - 0.5) * 2, cy + ny * (R() - 0.5) * 2, cx + (ux * sl) / 2, cy + (uy * sl) / 2)
      ctx.stroke()
    }
  }

  return c.toDataURL('image/png')
}

/** CSS for applying a brushMask() data URL to an element. */
export function maskStyle(mask: string) {
  return { maskImage: `url(${mask})`, WebkitMaskImage: `url(${mask})`, maskSize: '100% 100%', WebkitMaskSize: '100% 100%' }
}
