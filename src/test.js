import test from 'ava'
import {
  ID_FIELD,
  createQuery,
  findSameEntry,
  isDraftEntry,
  isPublishedEntry,
  isNotSelf,
  withoutSanityId,
} from './utils.js'

test('isDraftEntry', t => {
  t.is(
    isDraftEntry({ [ID_FIELD]: '091b1dda-81dc-45b7-97f4-61b8fc50a3c1' }),
    false
  )
  t.is(
    isDraftEntry({ [ID_FIELD]: 'drafts.091b1dda-81dc-45b7-97f4-61b8fc50a3c1' }),
    true
  )
})

test('isPublishedEntry', t => {
  t.is(
    isPublishedEntry({ [ID_FIELD]: '091b1dda-81dc-45b7-97f4-61b8fc50a3c1' }),
    true
  )
  t.is(
    isPublishedEntry({
      [ID_FIELD]: 'drafts.091b1dda-81dc-45b7-97f4-61b8fc50a3c1',
    }),
    false
  )
})

test('isNotSelf', t => {
  t.is(
    isNotSelf({ [ID_FIELD]: '091b1dda-81dc-45b7-97f4-61b8fc50a3c1' })({
      [ID_FIELD]: 'drafts.091b1dda-81dc-45b7-97f4-61b8fc50a3c1',
    }),
    true
  )
  t.is(
    isNotSelf({
      [ID_FIELD]: 'drafts.091b1dda-81dc-45b7-97f4-61b8fc50a3c1',
    })({
      [ID_FIELD]: 'drafts.091b1dda-81dc-45b7-97f4-61b8fc50a3c1',
    }),
    false
  )
})

test('withoutSanityId', t => {
  t.deepEqual(
    withoutSanityId({
      [ID_FIELD]: '091b1dda-81dc-45b7-97f4-61b8fc50a3c1',
      foo: 'bar',
    }),
    { foo: 'bar' }
  )
})

test('createQuery', t => {
  t.is(createQuery(), `*[] { ... }`)
  t.is(
    createQuery({ conditions: ['_type == "foo"'] }),
    `*[_type == "foo"] { ... }`
  )
  t.is(
    createQuery({ conditions: ['_type == "foo"', 'slug.current == $bar'] }),
    `*[_type == "foo" && slug.current == $bar] { ... }`
  )
  t.is(createQuery({ fields: 'foo' }), `*[] { foo }`)
  t.is(createQuery({ options: { slice: '0..2' } }), `*[] { ... } [0..2]`)
  t.is(
    createQuery({ options: { order: 'foo asc' } }),
    `*[] { ... } | order(foo asc)`
  )
  t.is(
    createQuery({ options: { isPreview: true } }),
    `*[] { "${ID_FIELD}": _id, ... }`
  )
})

test('findSameEntry', t => {
  const draft = { [ID_FIELD]: 'drafts.091b1dda-81dc-45b7-97f4-61b8fc50a3c1' }
  const published = { [ID_FIELD]: '091b1dda-81dc-45b7-97f4-61b8fc50a3c1' }
  const array = [draft, published]

  t.is(findSameEntry(draft, array), published)
  t.is(findSameEntry(published, array), draft)

  t.is(findSameEntry(published, [published]), undefined)
  t.is(findSameEntry(draft, [draft]), undefined)
})
