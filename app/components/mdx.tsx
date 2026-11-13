import Link from 'next/link'
import Image from 'next/image'
import { MDXRemote } from 'next-mdx-remote/rsc'
import { highlight } from 'sugar-high'
import React from 'react'
import Impression from './impression'
import rehypeKatex from 'rehype-katex'
import rehypePrettyCode from "rehype-pretty-code";
import remarkMath from 'remark-math';

import "katex/dist/katex.min.css";

function Table({ data }) {
  let headers = data.headers.map((header, index) => (
    <th key={index}>{header}</th>
  ))
  let rows = data.rows.map((row, index) => (
    <tr key={index}>
      {row.map((cell, cellIndex) => (
        <td key={cellIndex}>{cell}</td>
      ))}
    </tr>
  ))

  return (
    <table>
      <thead>
        <tr>{headers}</tr>
      </thead>
      <tbody>{rows}</tbody>
    </table>
  )
}

function CustomLink(props) {
  let href = props.href

  if (href.startsWith('/')) {
    return (
      <Link href={href} {...props}>
        {props.children}
      </Link>
    )
  }

  if (href.startsWith('#')) {
    return <a {...props} />
  }

  return <a target="_blank" rel="noopener noreferrer" {...props} />
}

function RoundedImage(props) {
  return <Image alt={props.alt} className="rounded-lg" {...props} />
}

function Code({ children, ...props }) {
  let codeHTML = highlight(children)
  return <code dangerouslySetInnerHTML={{ __html: codeHTML }} {...props} />
}

function slugify(str) {
  return str
    .toString()
    .toLowerCase()
    .trim() // Remove whitespace from both ends of a string
    .replace(/\s+/g, '-') // Replace spaces with -
    .replace(/&/g, '-and-') // Replace & with 'and'
    .replace(/[^\w\-]+/g, '') // Remove all non-word characters except for -
    .replace(/\-\-+/g, '-') // Replace multiple - with single -
}

function createHeading(level) {
  const Heading = ({ children }) => {
    let slug = slugify(children)
    return React.createElement(
      `h${level}`,
      { id: slug },
      [
        React.createElement('a', {
          href: `#${slug}`,
          key: `link-${slug}`,
          className: 'anchor',
        }),
      ],
      children
    )
  }

  Heading.displayName = `Heading${level}`

  return Heading
}

let components = {
  h1: createHeading(1),
  h2: createHeading(2),
  h3: createHeading(3),
  h4: createHeading(4),
  h5: createHeading(5),
  h6: createHeading(6),
  Image: RoundedImage,
  Impression,
  a: CustomLink,
  Table,
}

function normalizeFootnoteId(label: string) {
  return label
    .toString()
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]/g, '')
}

function preprocessFootnotes(source: string) {
  let lines = source.split('\n')
  let footnotes = new Map<string, string>()
  let cleanedLines: string[] = []
  let inFence = false

  for (let i = 0; i < lines.length; i++) {
    let line = lines[i]
    let fenceMatch = line.match(/^(```+|~~~+)/)
    if (fenceMatch) {
      inFence = !inFence
      cleanedLines.push(line)
      continue
    }

    if (!inFence) {
      let defMatch = line.match(/^\[\^([^\]]+)\]:\s*(.*)$/)
      if (defMatch) {
        let label = defMatch[1].trim()
        let contentLines = [defMatch[2]]

        while (i + 1 < lines.length) {
          let next = lines[i + 1]
          if (next.trim() === '') {
            contentLines.push('')
            i++
            continue
          }
          if (/^( {2,}|\t+)/.test(next)) {
            contentLines.push(next.replace(/^( {2,}|\t+)/, ''))
            i++
            continue
          }
          break
        }

        footnotes.set(label, contentLines.join('\n').trim())
        continue
      }
    }

    cleanedLines.push(line)
  }

  if (footnotes.size === 0) {
    return source
  }

  let order: string[] = []
  let refCounts = new Map<string, number>()
  let inReplacementFence = false
  let replacedBody = cleanedLines
    .map((line) => {
      let fenceMatch = line.match(/^(```+|~~~+)/)
      if (fenceMatch) {
        inReplacementFence = !inReplacementFence
        return line
      }
      if (inReplacementFence) {
        return line
      }
      return line.replace(/\[\^([^\]]+)\]/g, (match, rawLabel) => {
        let label = rawLabel.trim()
        if (!footnotes.has(label)) {
          return match
        }
        if (!order.includes(label)) {
          order.push(label)
        }
        let number = order.indexOf(label) + 1
        let count = (refCounts.get(label) || 0) + 1
        refCounts.set(label, count)
        let safeId = normalizeFootnoteId(label) || `footnote-${number}`
        let refId = count === 1 ? `fnref-${safeId}` : `fnref-${safeId}-${count}`
        return `<sup id="${refId}"><a href="#fn-${safeId}">${number}</a></sup>`
      })
    })
    .join('\n')

  if (order.length === 0) {
    return replacedBody
  }

  let list = order
    .map((label, idx) => {
      let safeId = normalizeFootnoteId(label) || `footnote-${idx + 1}`
      let body = footnotes.get(label) || ''
      let backTarget = `fnref-${safeId}`
      return `${idx + 1}. <span id="fn-${safeId}"></span>${body} <a href="#${backTarget}" aria-label="Back to content">↩</a>`
    })
    .join('\n')

  // If [[FOOTNOTES]] marker is present, replace it with the footnote list.
  // Otherwise append at the end (default behavior).
  if (replacedBody.includes('[[FOOTNOTES]]')) {
    return replacedBody.replace('[[FOOTNOTES]]', list)
  }

  return `${replacedBody}\n\n---\n\n${list}\n`
}

export function CustomMDX(props) {
  const sourceWithFootnotes = preprocessFootnotes(props.source)

  return (
    <MDXRemote
      {...props}
      source={sourceWithFootnotes}
      components={{ ...components, ...(props.components || {}) }}
      options={{
        mdxOptions: {
          remarkPlugins: [remarkMath],
          rehypePlugins: [
            rehypeKatex,
            [rehypePrettyCode, { theme: "one-dark-pro" }]
          ],
        },
      }}
    />
  )
}
