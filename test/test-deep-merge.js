const test = require('ava')
const createAtom = require('../src')

test('merges objects deeply', t => {
  const merge = (a, b) => {
    const atom = createAtom(a)
    atom.fuse(b)
    return atom.get()
  }

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
