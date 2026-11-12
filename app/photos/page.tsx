import { Cormorant_Garamond } from 'next/font/google'
import { baseUrl } from 'app/sitemap'
import Gallery, { type Photo } from './gallery'
import manifest from './photos.json'

export const metadata = {
  title: 'Photos',
  alternates: { canonical: `${baseUrl}/photos` },
}

const cormorantGaramond = Cormorant_Garamond({
  subsets: ['latin'],
  weight: '400',
})

// Add originals to photos-originals/ and run `node scripts/photos.mjs`.
// Each inner array is one row (names = filenames without extension); rows can hold 2 or 3.
// Photos not listed here get appended at the end in rows of 3.
const LAYOUT = [
  ['tahoe5', 'sf3', 'tahoe2'],
  ['monterey1', 'pofa3', 'costarica6'],
  ['costarica4', 'pofa2'],
  ['yosemite1', 'tahoe4', 'monterey2'],
  ['chi3', 'indy1', 'sf6'],
  ['sf4', 'purdue2', 'sf9'],
  ['costarica1', 'tahoe3', 'yosemite2'],
  ['tahoe1', 'monterey3'],
  ['monterey4', 'purdue1', 'sf1'],
  ['purdue3', 'costarica3', 'pofa1'],
  ['chi2', 'sf7', 'indy2'],
  ['costarica5', 'sf8', 'costarica2'],
  ['sf2', 'chi1', 'sf5'],
]

function getRows(): Photo[][] {
  const byName = new Map<string, Photo>(
    manifest.map(({ src, width, height, blurDataURL }) => [
      src.replace(/^\/photos\//, '').replace(/\.jpg$/, ''),
      { src, width, height, blurDataURL },
    ])
  )
  const rows = LAYOUT.map((row) => row.flatMap((n) => byName.get(n) ?? [])).filter((r) => r.length)
  const placed = new Set(LAYOUT.flat())
  const rest = Array.from(byName.entries()).filter(([n]) => !placed.has(n)).map(([, p]) => p)
  for (let i = 0; i < rest.length; i += 3) rows.push(rest.slice(i, i + 3))
  return rows
}

export default function Page() {
  const rows = getRows()
  return (
    <section className="mb-20">
      <div className="mb-10">
        <h1 className="text-2xl md:text-3xl font-semibold mb-2" style={{ fontFamily: cormorantGaramond.style.fontFamily }}>Photos</h1>
        <p className="text-neutral-600">work in progress..</p>
      </div>
      {rows.length === 0 ? (
        <p className="text-neutral-500">coming soon.</p>
      ) : (
        <Gallery rows={rows} />
      )}
    </section>
  )
}
