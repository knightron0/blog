// Generates web-sized photos from photos-originals/ into public/photos/,
// plus app/photos/photos.json (dimensions + blur placeholder).
//
//   node scripts/photos.mjs          # process new/changed originals
//   node scripts/photos.mjs --force  # regenerate everything
//
// Requires ImageMagick (`magick`). Converts to sRGB and strips all metadata (incl. GPS).
// Row layout lives in app/photos/page.tsx.

import { execFileSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..')
const SRC = path.join(root, 'photos-originals')
const OUT = path.join(root, 'public', 'photos')
const MANIFEST = path.join(root, 'app', 'photos', 'photos.json')
const LONG_EDGE = 2400
const QUALITY = 82
const SRGB = '/System/Library/ColorSync/Profiles/sRGB Profile.icc'
const force = process.argv.includes('--force')

const IMAGE_EXT = /\.(jpe?g|png|webp|tiff?|heic|nef|cr2|cr3|arw|dng|raf)$/i

const run = (cmd, args) => execFileSync(cmd, args, { encoding: 'utf8' }).trim()

const prev = fs.existsSync(MANIFEST) ? JSON.parse(fs.readFileSync(MANIFEST, 'utf8')) : []
const prevBySource = new Map(prev.map((p) => [p.source, p]))

const files = fs.readdirSync(SRC).filter((f) => IMAGE_EXT.test(f)).sort()
const photos = []

for (const file of files) {
  const srcPath = path.join(SRC, file)
  const base = path.parse(file).name.toLowerCase()
  const outName = `${base}.jpg`
  const outPath = path.join(OUT, outName)
  const mtime = fs.statSync(srcPath).mtimeMs
  const cached = prevBySource.get(file)

  if (!force && cached && cached.mtime === mtime && fs.existsSync(outPath)) {
    photos.push(cached)
    continue
  }

  process.stdout.write(`${file} → ${outName} … `)
  run('magick', [
    srcPath,
    '-auto-orient',
    // convert wide-gamut (Display P3 / HLG) profiles to sRGB before stripping metadata,
    // otherwise those photos render washed out
    '-profile', SRGB,
    '-resize', `${LONG_EDGE}x${LONG_EDGE}>`,
    '-strip',
    '-interlace', 'JPEG',
    '-sampling-factor', '4:2:0',
    '-quality', String(QUALITY),
    outPath,
  ])
  const [width, height] = run('magick', ['identify', '-format', '%w %h', outPath]).split(' ').map(Number)
  const blurDataURL =
    'data:image/jpeg;base64,' +
    execFileSync('magick', [outPath, '-resize', '12x12', '-strip', '-quality', '50', 'jpg:-']).toString('base64')

  const kb = Math.round(fs.statSync(outPath).size / 1024)
  console.log(`${width}×${height}, ${kb} KB`)

  photos.push({
    source: file,
    mtime,
    src: `/photos/${outName}`,
    width,
    height,
    blurDataURL,
  })
}

// remove outputs whose original is gone
const keep = new Set(photos.map((p) => path.basename(p.src)))
for (const f of fs.readdirSync(OUT)) {
  if (f.endsWith('.jpg') && !keep.has(f)) {
    fs.unlinkSync(path.join(OUT, f))
    console.log(`removed stale ${f}`)
  }
}

fs.writeFileSync(MANIFEST, JSON.stringify(photos, null, 2) + '\n')
console.log(`\n${photos.length} photos → ${path.relative(root, MANIFEST)}`)
