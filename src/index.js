import {
  createQuery,
  isDraftEntry,
  isPublishedEntry,
  preserveDrafts,
  withoutSanityId,
} from './utils'

// @param {Client} client - Sanity production client
// @param {Client} previewClient - Sanity preview client
// @param {String[]} conditions - Query conditions (joined with &&)
// @param {String} fields - Fields to query
// @param {Object} params - Query parameters
// @param {Object} options - Additional options (preview/sorting/slicing)
// @param {Boolean} options.isPreview - Whether to use the preview client
// @param {String} options.slice - Slicing argument to forward to Sanity
// @param {String} options.order - Sorting option to forward to Sanity
export const getEntry = async (
  client,
  previewClient,
  { conditions, fields, params, options = {} }
) => {
  // Limit the amount of results to 1 when the preview mode is *not* enabled
  // since the production Sanity client cannot return draft entries anyway.
  const slice = options.isPreview ? options.slice : 0
  const query = createQuery({
    conditions,
    fields,
    options: { ...options, slice },
  })

  if (options.isPreview) {
    const entries = await previewClient.fetch(query, params)
    const entry = entries.find(isDraftEntry) || entries.find(isPublishedEntry)

    return entry ? withoutSanityId(entry) : null
  }

  return client.fetch(query, params)
}

// @param {Client} client - Sanity production client
// @param {Client} previewClient - Sanity preview client
// @param {String[]} conditions - Query conditions (joined with &&)
// @param {String} fields - Fields to query
// @param {Object} params - Query parameters
// @param {Object} options - Additional options (preview/sorting/slicing)
// @param {Boolean} options.isPreview - Whether to use the preview client
// @param {String} options.slice - Slicing argument to forward to Sanity
// @param {String} options.order - Sorting option to forward to Sanity
export const getEntries = async (
  client,
  previewClient,
  { conditions, fields, params, options = {} }
) => {
  const query = createQuery({ conditions, fields, options })

  if (options.isPreview) {
    const entries = await previewClient.fetch(query, params)

    return entries.filter(preserveDrafts).map(withoutSanityId)
  }

  return client.fetch(query, params)
}
