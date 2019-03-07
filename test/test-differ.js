const test = require('ava')
const { differ } = require('../src/react')

test('compares values shallowly', async function (t) {
  t.is(differ(1, 1), false)
  t.is(differ(1, 2), true)
  t.is(differ(0, 1), true)
  t.is(differ(0, 0), false)

  t.is(differ(null, 1), true)
  t.is(differ(null, null), false)

  t.is(differ(undefined, 1), true)
  t.is(differ(undefined, undefined), false)

  t.is(differ({}, {}), false)
  t.is(differ({ a: 1 }, { a: 1 }), false)
  t.is(differ({ a: 1 }, { a: 2 }), true)
  t.is(differ({ a: [] }, { a: [] }), true)
  const arr = []
  t.is(differ({ a: arr }, { a: arr }), false)

  t.is(differ([], []), true)
  t.is(differ([1, 2], [1, 2]), true)
  t.is(differ([1, 2], [1, 2, 3]), true)

  t.is(differ(new Date('2018-12-04T14:48:34.400Z'), new Date('2018-12-04T14:48:34.400Z')), true)
  t.is(differ(new Date('2018-12-04T14:48:34.400Z'), new Date('2018-12-05T14:48:34.400Z')), true)
})
