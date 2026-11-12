import { BlogPosts } from 'app/components/posts'
import { Cormorant_Garamond } from 'next/font/google'
import { baseUrl } from 'app/sitemap'

export const metadata = {
  title: 'Blog',
  alternates: { canonical: `${baseUrl}/blog` },
}

const cormorantGaramond = Cormorant_Garamond({
  subsets: ['latin'],
  weight: "400"
})

export default function Page() {
  return (
    <section>
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-semibold mb-2" style={{ fontFamily: cormorantGaramond.style.fontFamily }}>Blog</h1>
        <p className="text-neutral-600">thoughts? notes? rants?</p>
      </div>
      <BlogPosts />
    </section>
  )
}
