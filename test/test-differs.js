import test from 'ava'
import { differs } from '../src/react/differs'

test('compares values shallowly', async function(t) {
  t.is(differs(1, 1), false)
  t.is(differs(1, 2), true)
  t.is(differs(0, 1), true)
  t.is(differs(0, 0), false)

  t.is(differs(null, 1), true)
  t.is(differs(null, null), false)

  t.is(differs(undefined, 1), true)
  t.is(differs(undefined, undefined), false)

  t.is(differs({}, {}), false)
  t.is(differs({ a: 1 }, { a: 1 }), false)
  t.is(differs({ a: 1 }, { a: 2 }), true)
  t.is(differs({ a: [] }, { a: [] }), true)
  const arr = []
  t.is(differs({ a: arr }, { a: arr }), false)

  t.is(differs([], []), true)
  t.is(differs([1, 2], [1, 2]), true)
  t.is(differs([1, 2], [1, 2, 3]), true)

  t.is(differs(new Date('2018-12-04T14:48:34.400Z'), new Date('2018-12-04T14:48:34.400Z')), true)
  t.is(differs(new Date('2018-12-04T14:48:34.400Z'), new Date('2018-12-05T14:48:34.400Z')), true)
})
