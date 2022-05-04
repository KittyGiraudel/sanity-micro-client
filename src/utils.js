export const ID_FIELD = '__smc_id'

export const isDraftEntry = entry => entry[ID_FIELD].startsWith('drafts.')
export const isPublishedEntry = entry => !entry[ID_FIELD].startsWith('drafts.')
export const isNotSelf = entry => item => item[ID_FIELD] !== entry[ID_FIELD]
export const withoutSanityId = ({ [ID_FIELD]: sanityId, ...entry }) => entry

export const findSameEntry = (current, array) => {
  const otherEntries = array.filter(isNotSelf(current))
  const isDraft = isDraftEntry(current)
  const isSameEntry = entry =>
    // If the current entry is a draft, a duplicate would be a published version
    // with the same ID but without the `drafts.` part. If the current entry is
    // a published version, a duplicate would be a draft version with the same
    // ID starting with the `drafts.` part.
    isDraft
      ? current[ID_FIELD].endsWith(entry[ID_FIELD])
      : entry[ID_FIELD].endsWith(current[ID_FIELD])

  return otherEntries.find(isSameEntry)
}

// Try to find the current entry in the array with a different publication
// status (draft if it’s published, or published if it’s draft). If the same
// entry has been found in the array but with a different publication status,
// it means it is both published and drafted. In that case, we should only
// preserve the draft version (most recent).
export const preserveDrafts = (current, _, array) =>
  findSameEntry(current, array) ? isDraftEntry(current) : true

export const createQuery = ({
  conditions = [],
  fields = '...',
  options = {},
}) => {
  const grep = `*[${conditions.join(' && ')}]`
  const order = options.order ? `| order(${options.order})` : ''
  const slice = typeof options.slice !== 'undefined' ? `[${options.slice}]` : ''

  if (options.isPreview) {
    fields = `"${ID_FIELD}": _id, ` + fields
  }

  return [grep, '{', fields, '}', order, slice].filter(Boolean).join(' ')
}
