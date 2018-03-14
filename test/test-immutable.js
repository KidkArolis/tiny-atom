const test = require('ava')

const {
  set, setIn, unset, get, getIn, update, updateIn,
  push, peek, pop, transient
} = require('../src/immutable')

test('set', (assert) => {
  assert.plan(6)

  assert.deepEqual(
    set({ damogran: 5 }, 'zaphod', 'beeblebrox'),
    { damogran: 5, zaphod: 'beeblebrox' },
    'should set a new key/value in an object'
  )

  assert.deepEqual(
    set({ damogran: 4 }, 'damogran', 5),
    { damogran: 5 },
    'should overwrite existing key'
  )

  assert.deepEqual(
    set(undefined, 'damogran', 5),
    { damogran: 5 },
    'should return fresh object if called on undefined'
  )

  const computer = { deep: 'thought' }
  assert.is(
    set(computer, 'deep', 'thought'),
    computer,
    'should return original object when key/value will not change'
  )

  const arthur = { name: 'dent' }
  assert.not(
    set(arthur, 'age', 34),
    arthur,
    'should not mutate original object'
  )

  assert.deepEqual(
    set([42, 42, 42], 0, 5),
    [5, 42, 42],
    'should work with arrays too'
  )
})

test('setIn', (assert) => {
  // assert.plan(10)

  assert.throws(
    () => setIn({}, 2),
    TypeError,
    'should throw for non-array path'
  )

  assert.deepEqual(
    setIn({ trisha: { mc: 'millan' } }, ['trisha', 'mc'], 4),
    { trisha: { mc: 4 } },
    'should update nested property'
  )

  assert.deepEqual(
    setIn([1, [2], 3], [1, 0], 'a'),
    [1, ['a'], 3],
    'should work with arrays'
  )

  const earth = { harmless: true }
  assert.not(
    setIn(earth, ['harmless'], 'mostly'),
    earth,
    'should not mutate original reference'
  )

  assert.is(
    setIn(earth, []),
    earth,
    'should return original reference for empty key array'
  )

  assert.deepEqual(
    setIn(({}), ['guide', 'to', 'the'], 'galaxy'),
    { guide: { to: { the: 'galaxy' } } },
    'should create the path if its not there'
  )

  assert.deepEqual(
    setIn({ guide: null }, ['guide', 'to', 'the'], 'galaxy'),
    { guide: { to: { the: 'galaxy' } } },
    'should create the path if it finds a null'
  )

  assert.deepEqual(
    setIn({ guide: undefined }, ['guide', 'to', 'the'], 'galaxy'),
    { guide: { to: { the: 'galaxy' } } },
    'should create the path if it finds an undefined'
  )

  assert.true(
    Array.isArray(setIn({}, ['lucky', 0], 'galaxy').lucky),
    'should create arrays for numerical indexes'
  )

  assert.deepEqual(
    setIn(undefined, ['guide', 'to', 'the'], 'galaxy'),
    { guide: { to: { the: 'galaxy' } } },
    'should create whole path if called on undefined'
  )
})

test('unset', (assert) => {
  assert.plan(5)

  const jeltz = { vogon: 'captain' }
  assert.is(
    unset(jeltz, 'poetry'),
    jeltz,
    'should return original object when key does not exist'
  )

  assert.deepEqual(
    unset(undefined, 'poetry'),
    {},
    'should return empty object when called on undefined'
  )

  assert.deepEqual(
    unset(({ damogran: 5, zaphod: 'beeb' }), 'zaphod'),
    { damogran: 5 },
    'should unset a key from an object'
  )

  const arthur = { name: 'dent' }
  assert.not(
    unset(arthur, 'name'),
    arthur,
    'should not mutate original object'
  )

  assert.not(
    unset(['pan', 'galactic', 'gargle', 'blaster'], 0),
    ['galactic', 'gargle', 'blaster'],
    'should work with arrays too'
  )
})

test('get', (assert) => {
  assert.plan(7)

  assert.is(
    get(({ paranoid: 'android' }), 'paranoid'),
    'android',
    'should return the value for the key'
  )

  assert.is(
    get(['life', 'universe', 'everything'], 0),
    'life',
    'should also work with arrays'
  )

  assert.is(
    get('zaphod', 0),
    'z',
    'should also work with strings'
  )

  assert.is(
    get(({}), 'jeltz', 4),
    4,
    'should return notFound value for missing key'
  )

  assert.is(
    get(({ jeltz: undefined }), 'jeltz', 4),
    4,
    'should return notFound value for undefined keys'
  )

  const marvin = Object.create({ type: 'android' })
  assert.is(
    get(marvin, 'type'),
    'android',
    'should work for properties on the protoype chain'
  )

  assert.is(
    get(undefined, 'meaning', 42),
    42,
    'should return notFound when called on undefined'
  )
})

test('getIn', (assert) => {
  assert.plan(8)

  assert.throws(
    () => getIn(({}), 2),
    TypeError,
    'should throw for non-array keys'
  )

  assert.is(
    getIn(({ bee: { ble: 'brox' } }), ['bee', 'ble']),
    'brox',
    'should get nested key'
  )

  assert.is(
    getIn(({ bee: ['ble', 'brox'] }), ['bee', 1, 2]),
    'o',
    'should work in mixed type collections'
  )

  assert.is(
    getIn(({ beeble: 'brox' }), ['bobble'], 'brix'),
    'brix',
    'should use notFound if top-level key does not exist'
  )

  assert.is(
    getIn(({ bee: { ble: 'brox' } }), ['bee', 'bee'], 'zaphod'),
    'zaphod',
    'should use notFound if nested key does not exist'
  )

  assert.is(
    getIn(({ beeble: undefined }), ['beeble'], 'betelgeuse'),
    'betelgeuse',
    'should use notFound if value is undefined'
  )

  assert.is(
    getIn(({ beeble: undefined }), [], 'betelgeuse'),
    'betelgeuse',
    'should use notFound if passed empty array of keys'
  )

  assert.is(
    getIn(undefined, ['meaning'], 42),
    42,
    'should return notFound when called on undefined'
  )
})

test('update', (assert) => {
  assert.plan(3)

  const inc = n => n + 1

  assert.deepEqual(
    update(({ life: 41 }), 'life', inc),
    ({ life: 42 }),
    'should apply func to value at key'
  )

  const add = (a, b) => a + b

  assert.deepEqual(
    update(({ life: 2 }), 'life', add, 40),
    ({ life: 42 }),
    'should apply with any additional arguments'
  )

  assert.deepEqual(
    update(({ life: 2 }), 'death', undefined),
    ({ life: 2, death: undefined }),
    'should set value to undefined when func is missing'
  )
})

test('updateIn', (assert) => {
  assert.plan(5)

  assert.throws(
    () => updateIn(({}), 2),
    TypeError,
    'should throw for non-array path'
  )

  const inc = n => n + 1

  assert.deepEqual(
    updateIn({ a: { b: 3 } }, ['a', 'b'], inc),
    { a: { b: 4 } },
    'should apply func to nested value'
  )

  assert.deepEqual(
    updateIn({}, ['a', 'b'], () => 3),
    { a: { b: 3 } },
    'should create path if it not there'
  )

  const add = (a, b) => a + b

  assert.deepEqual(
    updateIn(({ state: { count: 2 } }), ['state', 'count'], add, 40),
    ({ state: { count: 42 } }),
    'should apply with any additional arguments'
  )

  assert.deepEqual(
    update(({ count: 2 }), 'score', undefined),
    ({ count: 2, score: undefined }),
    'should set value to undefined when func is missing'
  )
})

test('push', (assert) => {
  assert.plan(4)

  assert.throws(
    () => push(false, 3),
    TypeError,
    'should throw when called on non-array type'
  )

  assert.deepEqual(
    push([1, 2], 3),
    [1, 2, 3],
    'should be able to push onto end of array'
  )

  assert.deepEqual(
    push([1], 2, 3),
    [1, 2, 3],
    'should be able to push multiple values'
  )

  const xs = [1, 2, 3]
  assert.not(
    push(xs, 4),
    xs,
    'should not mutate reference'
  )
})

test('peek', (assert) => {
  assert.plan(3)

  assert.is(
    peek([1, 2, 3]),
    3,
    'should return final array element'
  )

  assert.is(
    peek([]),
    undefined,
    'should return undefined for empty array'
  )

  assert.is(
    peek([1]),
    1,
    'should return only element for 1-length array'
  )
})

test('pop', (assert) => {
  assert.plan(4)

  assert.deepEqual(
    pop([1, 2, 3]),
    [1, 2],
    'should remove final element from array'
  )

  const xs = [1, 2, 3]
  assert.not(
    pop(xs),
    xs,
    'should not mutate original array'
  )

  assert.throws(
    () => pop(5),
    TypeError,
    'should throw when called on non-array'
  )

  assert.is(
    pop(undefined),
    undefined,
    'should return undefined when called on undefined'
  )
})

test('transient', (assert) => {
  assert.plan(2)

  const marvin = { paranoid: true }

  assert.deepEqual(
    transient(marvin, android => {
      android.paranoid = false
    }),
    { paranoid: false },
    'should allow for managed mutations'
  )

  assert.not(
    transient(marvin, android => {
      android.paranoid = false
    }),
    marvin,
    'should not mutate original reference'
  )
})
