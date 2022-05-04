# Sanity Micro-Client

A lightweight client to handle previewing Sanity data in a sane way (pun intended). When [previewing content](https://www.sanity.io/docs/preview-content-on-site), this library ensures draft documents take precedence over their published counterparts. Read the [related article](https://kittygiraudel.com/2021/07/16/a-micro-client-for-sanity/).

It works in conjunction with `@sanity/client` but does not use it as a direct dependency.

## How it works

When editing a published document in the Sanity Studio, Sanity clones the document as a draft. We can leverage that behavior to build a robust preview system.

When querying a specific document — for instance a blog post from its slug — we will query _all_ blog posts with that slug in case there is a both a published version **and** a draft version of that document.

Then, if the preview mode is enabled, we will only return the draft version. If the preview mode is disabled, we will only return the published version. This way we always return the relevant version depending on whether or not the preview mode is enabled.

It works similar when querying a collection of documents — such as all blog posts for instance. If the preview mode is enabled, it will return all documents, published _and_ drafts, while making sure not to return duplicates (keeping only the draft version if it exists). If the preview mode is disabled, it will only return published documents.

This [article](https://kittygiraudel.com/2021/07/16/a-micro-client-for-sanity/) should clarify the concept a bit more, and the code is also well documented if you’d like to take a look.

## Usage

First, you need to define two Sanity clients: one for published content (typically relying on the CDN) and one for preview content (using a secret token).

```js
import sanityClient from '@sanity/client'

const client = sanityClient({
  projectId: YOUR_PROJECT_ID,
  dataset: YOUR_DATASET,
  apiVersion: YOUR_API_VERSION,
  useCdn: true,
})

const previewClient = sanityClient({
  projectId: YOUR_PROJECT_ID,
  dataset: YOUR_DATASET,
  apiVersion: YOUR_API_VERSION,
  useCdn: false,
  token: process.env.SANITY_TOKEN,
})
```

Then, you can use the `getEntry` and `getEntries` like this:

```js
import { getEntry, getEntries } from 'sanity-micro-client'

const blogPost = await getEntry(client, previewClient, {
  conditions: ['_type == "blogPost"', 'slug.current == $slug'],
  params: { slug: 'slug-for-blog-post' },
  options: { isPreview: true },
})

const blogPostsFromAuthor = await getEntry(client, previewClient, {
  conditions: ['_type == "blogPost"', 'author == $author'],
  params: { author: 'Kitty' },
  options: { isPreview: true },
})
```

### With Next.js

Next.js has an [elegant preview mode](https://nextjs.org/docs/advanced-features/preview-mode) which works great with Sanity. A typically page relying on CMS data would look like this (e.g. `/blog/[slug].js`):

```js
import { getEntry } from 'sanity-micro-client'
import BlogPost from '../../components/BlogPost'

export async function getStaticPaths() {
  const blogPosts = await getEntries({
    conditions: ['_type == "blogPost"'],
    fields: '"slug": slug.current',
    options: { order: '_createdAt desc' },
  })
  const paths = blogPosts.map(post => ({ params: { slug: post.slug } }))

  return { paths, fallback: 'blocking' }
}

export async function getStaticProps(context) {
  const isPreview = context.preview ?? false
  const slug = context.params.slug
  const blogPost = await getEntry(client, previewClient, {
    conditions: ['_type == "blogPost"', 'slug.current == $slug'],
    params: { slug },
    options: { isPreview },
  })

  if (!blogPost) {
    return { notFound: true }
  }

  return {
    props: {
      // Pass down whether the preview mode is enabled to the view, which can be
      // handy to render a banner that states that the preview mode is enabled.
      isPreview,
      // Return the blog post data (and whatever other props).
      data: blogPost,
    },
  }
}

export default BlogPost
```

## Simplifying the API

To avoid having to pass the clients in every call, you could wrap the two functions with our own helpers.

```js
import * as smc from 'sanity-micro-client'
import sanityClient from '@sanity/client'

const client = sanityClient(/* */)
const previewClient = sanityClient(/* */)

export const getEntry = options => smc.getEntry(client, previewClient, options)
export const getEntries = options =>
  smc.getEntries(client, previewClient, options)
```
