import test from 'ava'
import {
  ID_FIELD,
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
