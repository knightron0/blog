import { notFound } from 'next/navigation'
import { CustomMDX } from 'app/components/mdx'
import { PostTags } from 'app/components/posts'
import { formatDate, getBlogPosts } from 'app/blog/utils'
import { baseUrl } from 'app/sitemap'
import Footer from 'app/components/footer'
import { Cormorant_Garamond } from 'next/font/google'

const cormorantGaramond = Cormorant_Garamond({
  subsets: ['latin'],
  weight: "400"
})

export async function generateStaticParams() {
  let posts = getBlogPosts()

  return posts.map((post) => ({
    slug: post.slug,
  }))
}

export function generateMetadata({ params }) {
  let post = getBlogPosts().find((post) => post.slug === params.slug)
  if (!post) {
    return
  }

  let {
    title,
    publishedAt: publishedTime,
    summary: description,
    image,
  } = post.metadata
  let ogImage = image
    ? image
    : `${baseUrl}/og/blog/${post.slug}`

  const metadata = {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'article',
      publishedTime,
      url: `${baseUrl}/blog/${post.slug}`,
      images: [
        {
          url: ogImage,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [ogImage],
    },
    other: {}
  }

  // Google Scholar citation meta tags for the BAM post
  if (post.slug === 'bam') {
    metadata.other = {
      citation_title: 'Norm Balancing Optimizers',
      citation_author: 'Sarthak Mangla, Abel Gurung',
      citation_publication_date: '2026/02/17',
      citation_abstract:
        'Balancing row and column-wise update magnitudes alone can reproduce a surprising share of Muon’s performance. Across a CNN, an MLP, and a small transformer, this lightweight norm-balancing step often matches AdamW and sometimes closes much of the gap to Muon, without explicit orthogonalization and without any extra variance/second-moment buffers. These results suggest norm balancing may be a simple, useful source of optimizer stability worth studying on its own.',
      citation_pdf_url: `${baseUrl}/papers/bam.pdf`,
      citation_fulltext_html_url: `${baseUrl}/blog/bam`,
    }
  }

  return metadata
}

export default function Blog({ params }) {
  let post = getBlogPosts().find((post) => post.slug === params.slug)

  if (!post) {
    notFound()
  }

  const renderAuthors = (authors?: string) => {
    if (!authors) return null

    const matches = Array.from(
      authors.matchAll(/\[([^\]]+)\]\(([^)]+)\)/g)
    )

    // If no markdown-style links are found, just render the raw string
    if (matches.length === 0) {
      return authors
    }

    const parts: any[] = []
    const marker = post && post.slug === 'bam' ? '†' : null

    matches.forEach((match, index) => {
      const name = match[1]
      const href = match[2]

      if (index > 0) {
        parts.push(', ')
      }

      parts.push(
        <span key={index}>
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="author-link"
          >
            {name}
          </a>
          {marker && (
            <sup className="ml-0.5 align-super text-xs text-neutral-500">
              {marker}
            </sup>
          )}
        </span>
      )
    })

    return parts
  }

  return (
    <>
      <section>
        <script
          type="application/ld+json"
          suppressHydrationWarning
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'BlogPosting',
              headline: post.metadata.title,
              datePublished: post.metadata.publishedAt,
              dateModified: post.metadata.publishedAt,
              description: post.metadata.summary,
              image: post.metadata.image
                ? `${baseUrl}${post.metadata.image}`
                : `${baseUrl}/og/blog/${post.slug}`,
              url: `${baseUrl}/blog/${post.slug}`,
              author: {
                '@type': 'Person',
                name: 'My Portfolio',
              },
            }),
          }}
        />
        <h1 className="text-2xl md:text-4xl font-semibold" style={{ fontFamily: cormorantGaramond.style.fontFamily }}>
          {post.metadata.title}
        </h1>
        <div className="flex flex-col md:flex-row md:items-center my-2 text-md">
          {post.metadata.authors && (
            <p className="text-md text-neutral-600 mb-1 md:mb-0">
              {renderAuthors(post.metadata.authors)}
            </p>
          )}
          {post.metadata.authors && (
            <span className="hidden md:inline mx-2 text-neutral-400">·</span>
          )}
          <div className="flex items-center gap-3">
            <p className="text-md text-neutral-600">
              {formatDate(post.metadata.publishedAt, false, false)}
            </p>
            <PostTags tags={post.metadata.tags} size="default" />
          </div>
        </div>
        {post.slug === 'bam' && (
          <p className="text-sm text-neutral-500">
            <sup className="mr-1">†</sup>Purdue University
          </p>
        )}
        <hr className="my-4 border-gray-300" />
        <article className="prose">
          <CustomMDX source={post.content} />
        </article>
        <div className="my-10 border-t border-gray-300" />
      </section>
      <Footer></Footer>
    </>
  )
}
