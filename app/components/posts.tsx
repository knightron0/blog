import Link from 'next/link'
import { formatDate, getBlogPosts } from 'app/blog/utils'

const tagStyles: Record<string, string> = {
  Life: 'text-[#5e7c63] before:bg-[#7fa985]',
  Experiments: 'text-[#9a6255] before:bg-[#d4a096]',
  Research: 'text-[#5f7d8d] before:bg-[#83a7bd]',
  Papers: 'text-[#8d7750] before:bg-[#bea675]',
}

function getTagStyle(tag: string) {
  return tagStyles[tag] ?? 'text-[#6f675f] before:bg-[#a79d92]'
}

export function PostTags({
  tags,
  size = 'compact',
}: {
  tags?: string
  size?: 'compact' | 'default'
}) {
  if (!tags) return null

  const textSize = size === 'compact' ? 'text-xs leading-5' : 'text-md leading-6'

  return (
    <div className="flex shrink-0 flex-wrap gap-x-3 gap-y-1">
      {tags.split(',').map((tag) => {
        const label = tag.trim()
        return (
          <span
            key={label}
            className={`inline-flex items-center gap-1.5 ${textSize} before:h-1.5 before:w-1.5 before:rounded-full before:content-[''] ${getTagStyle(label)}`}
          >
            {label}
          </span>
        )
      })}
    </div>
  )
}

export function BlogPosts() {
  let allBlogs = getBlogPosts()

  return (
    <div className='mb-10' id='posts'>
      {allBlogs
        .sort((a, b) => {
          if (
            new Date(a.metadata.publishedAt) > new Date(b.metadata.publishedAt)
          ) {
            return -1
          }
          return 1
        })
        .map((post) => (
          <Link
            key={post.slug}
            className="group mb-4 block"
            href={`/blog/${post.slug}`}
          >
            <div className="flex w-full flex-col md:flex-row md:gap-2">
              <p className="text-neutral-600 w-[180px] tabular-nums">
                {formatDate(post.metadata.publishedAt, false)}
              </p>
              <div className="flex min-w-0 flex-1 flex-col gap-1 md:flex-row md:items-baseline md:gap-2">
                <p className="shrink-0 text-neutral-900 tracking-tight">
                  {post.metadata.title}
                </p>
                {post.metadata.tags && (
                  <>
                    <span
                      aria-hidden="true"
                      className="hidden min-w-4 flex-1 border-b border-dotted border-[#ded5ca] md:block"
                    />
                    <PostTags tags={post.metadata.tags} />
                  </>
                )}
              </div>
            </div>
          </Link>
        ))}
    </div>
  )
}
