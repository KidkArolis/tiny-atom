const test = require('ava')
const merge = require('../src/deep-merge')

test.only('merges objects deeply', t => {
  t.deepEqual(
    merge(),
    undefined
  )
  t.deepEqual(
    merge({ a: 1 }, 5),
    5
  )
  t.deepEqual(
    merge({ a: 1 }),
    { a: 1 }
  )
  t.deepEqual(
    merge({ a: 1 }, { b: 2 }),
    { a: 1, b: 2 }
  )
  t.deepEqual(
    merge({ a: { b: 1 } }, { a: { c: 2 } }),
    { a: { b: 1, c: 2 } }
  )
  t.deepEqual(
    merge({}, { a: { c: 2 } }),
    { a: { c: 2 } }
  )
  t.deepEqual(
    merge({ a: { b: [1, 2, 3] } }, { a: { b: [4] } }),
    { a: { b: [4] } }
  )
  t.deepEqual(
    merge({ a: { b: 'hello' } }, { a: 'world' }),
    { a: 'world' }
  )
})
