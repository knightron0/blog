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
        <h1 className="text-2xl md:text-3xl font-semibold" style={{ fontFamily: cormorantGaramond.style.fontFamily }}>Blog</h1>
      </div>
      <BlogPosts />
    </section>
  )
}
