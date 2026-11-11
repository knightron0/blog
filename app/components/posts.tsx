import { formatDate, getBlogPosts } from 'app/blog/utils'
import { FilteredBlogPosts } from './filtered-blog-posts'
export { PostTags } from './filtered-blog-posts'

export function BlogPosts() {
  let allBlogs = getBlogPosts().sort(
    (a, b) =>
      new Date(b.metadata.publishedAt).getTime() -
      new Date(a.metadata.publishedAt).getTime()
  )
  let posts = allBlogs.map((post) => ({
    ...post,
    year: new Date(post.metadata.publishedAt).getFullYear().toString(),
    date: formatDate(post.metadata.publishedAt, false, false, false),
  }))
  return <FilteredBlogPosts posts={posts} />
}
