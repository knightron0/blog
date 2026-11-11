import fs from 'fs'
import path from 'path'
import { Cormorant_Garamond } from 'next/font/google'
import { baseUrl } from 'app/sitemap'
import Gallery from './gallery'

export const metadata = {
  title: 'Photos',
  alternates: { canonical: `${baseUrl}/photos` },
}

const cormorantGaramond = Cormorant_Garamond({
  subsets: ['latin'],
  weight: '400',
})

const IMAGE_EXT = /\.(jpe?g|png|webp|avif|gif)$/i

// Drop images into public/photos — they show up here automatically, sorted by filename.
function getPhotos() {
  const dir = path.join(process.cwd(), 'public', 'photos')
  if (!fs.existsSync(dir)) return []
  return fs
    .readdirSync(dir)
    .filter((f) => IMAGE_EXT.test(f))
    .sort()
    .map((f) => `/photos/${f}`)
}

export default function Page() {
  const photos = getPhotos()
  return (
    <section>
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-semibold mb-2" style={{ fontFamily: cormorantGaramond.style.fontFamily }}>Photos</h1>
        <p className="text-neutral-600">sometimes i pick up my camera.</p>
      </div>
      {photos.length === 0 ? (
        <p className="text-neutral-500">coming soon.</p>
      ) : (
        <Gallery photos={photos} />
      )}
    </section>
  )
}
