'use client'

import Link from 'next/link'
import { useMemo, useState } from 'react'


type Post = {
  slug: string
  year: string
  date: string
  metadata: { title: string; tags?: string }
}

// Order here is the order filters appear in.
const tagStyles: Record<string, string> = {
  Research: 'text-[#5f7d8d] before:bg-[#83a7bd]',
  Experiments: 'text-[#9a6255] before:bg-[#d4a096]',
  Life: 'text-[#5e7c63] before:bg-[#7fa985]',
}
const defaultTagStyle = 'text-[#6f675f] before:bg-[#a79d92]'

export function PostTags({ tags, size = 'compact' }: { tags?: string; size?: 'compact' | 'default' }) {
  if (!tags) return null
  const textSize = size === 'compact' ? 'text-xs leading-5' : 'text-md leading-6'
  return (
    <div className="flex shrink-0 flex-wrap gap-x-3 gap-y-1">
      {tags.split(',').map((tag) => {
        const label = tag.trim()
        const color = tagStyles[label] ?? defaultTagStyle
        return <span key={label} className={`inline-flex items-center gap-1.5 ${textSize} before:h-1.5 before:w-1.5 before:rounded-full before:content-[''] ${color}`}>{label}</span>
      })}
    </div>
  )
}

export function FilteredBlogPosts({ posts }: { posts: Post[] }) {
  const [selectedTag, setSelectedTag] = useState('All')
  const tags = useMemo(
    () => {
      const used = new Set(posts.flatMap((post) => post.metadata.tags?.split(',').map((tag) => tag.trim()) ?? []))
      const known = Object.keys(tagStyles).filter((tag) => used.has(tag))
      return ['All', ...known, ...Array.from(used).filter((tag) => !(tag in tagStyles))]
    },
    [posts]
  )
  const visiblePosts = selectedTag === 'All'
    ? posts
    : posts.filter((post) => post.metadata.tags?.split(',').some((tag) => tag.trim() === selectedTag))
  const postsByYear = visiblePosts.reduce((groups, post) => {
    groups[post.year] ??= []
    groups[post.year].push(post)
    return groups
  }, {} as Record<string, Post[]>)

  return (
    <div className="mb-10" id="posts">
      <div className="mb-8 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm" role="group" aria-label="Filter posts by tag">
        {tags.map((tag) => {
          const active = selectedTag === tag
          const color = tag === 'All' ? 'text-neutral-800 before:bg-neutral-500' : tagStyles[tag] ?? defaultTagStyle
          return (
            <button
              key={tag}
              type="button"
              aria-pressed={active}
              onClick={() => setSelectedTag(tag)}
              className={`inline-flex items-center gap-1.5 transition-colors duration-300 before:h-1.5 before:w-1.5 before:rounded-full before:content-[''] ${color} ${active ? '' : '!text-neutral-400 hover:!text-neutral-600'}`}
            >
              {tag}
            </button>
          )
        })}
      </div>
      {Object.entries(postsByYear).sort(([a], [b]) => Number(b) - Number(a)).map(([year, yearPosts]) => (
        <section key={year} className="mb-8">
          <h2 className="mb-4 border-b border-neutral-200 pb-2 text-sm font-medium tabular-nums tracking-wide text-neutral-500">{year}</h2>
          {yearPosts.map((post) => (
            <Link key={post.slug} className="group mb-4 block" href={`/blog/${post.slug}`}>
              <div className="flex w-full flex-col md:flex-row md:gap-2">
                <p className="w-16 shrink-0 tabular-nums text-neutral-500">{post.date}</p>
                <div className="flex min-w-0 flex-1 flex-col gap-1 md:flex-row md:items-baseline md:justify-between md:gap-4">
                  <p className="min-w-0 tracking-tight text-neutral-900">{post.metadata.title}</p>
                  {post.metadata.tags && <PostTags tags={post.metadata.tags} />}
                </div>
              </div>
            </Link>
          ))}
        </section>
      ))}
    </div>
  )
}
