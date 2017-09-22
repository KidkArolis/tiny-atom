const { eq, assert } = require('@briancavalier/assert')
const createAtom = require('..')

suite('tiny-atom')

test('can be used with no reducer or onChange listener', () => {
  const atom = createAtom({ count: 0 })
  eq(atom.get(), { count: 0 })
  atom.split({ count: 5 })
  eq(atom.get(), { count: 5 })
})

test('does not mutate the state object', () => {
  const initialState = { count: 0 }
  const atom = createAtom(initialState)

  eq(atom.get(), { count: 0 })
  assert(atom.get() === initialState)

  atom.split({ count: 5 })
  eq(atom.get(), { count: 5 })
  assert(atom.get() !== initialState)
})

test('reducer', () => {
  const atom = createAtom({ count: 0 }, reduce)

  function reduce (get, split, { type, payload }) {
    if (type === 'increment') {
      split({ count: get().count + (payload || 1) })
    }
  }

  atom.split('increment')
  eq(atom.get(), { count: 1 })

  atom.split('increment', 5)
  eq(atom.get(), { count: 6 })
})

test('async reducer', (done) => {
  const changes = []
  const atom = createAtom({ count: 0 }, reduce, onChange)

  function reduce (get, split, { type, payload }) {
    if (type === 'increment') {
      split({ count: get().count + 1 })
      setTimeout(() => {
        split({ count: get().count + 1, async: true })
        split({ done: true })
      }, 1)
    }
  }

  function onChange (atom) {
    let state = atom.get()
    changes.push(1)
    if (changes.length === 1) eq(state, { count: 1 })
    if (changes.length === 2) eq(state, { count: 2, async: true })
    if (state.done) {
      eq(state, { count: 2, async: true, done: true })
      eq(changes, [1, 1, 1])
      done()
    }
  }

  atom.split('increment')
})

test('onChange listener', () => {
  const history = []
  const atom = createAtom({ count: 0 }, null, onChange)

  function onChange (atom) {
    let state = atom.get()
    history.push(state)
  }

  atom.split({ count: 1 })
  atom.split({ count: 2 })
  atom.split({ count: 3 })

  eq(history, [
    { count: 1 },
    { count: 2 },
    { count: 3 }
  ])
})

test('can be used in a mutating manner', () => {
  const initialState = { count: 0 }
  const atom = createAtom(initialState, reduce, () => {}, mutate)

  function mutate (empty, prev, next) {
    return Object.assign(prev, next)
  }

  function reduce (get, split, { type, payload }) {
    const state = get()
    if (type === 'increment') {
      state.count += payload
      split(state)
    }
  }

  atom.split('increment', 3)
  eq(atom.get(), { count: 3 })
  assert(atom.get() === initialState)
})

test('onChange provides action details', (done) => {
  const history = []
  const atom = createAtom({ count: 0 }, reduce, onChange)

  function reduce (get, split, { type, payload }) {
    ({
      inc: () => split({ count: get().count + payload }),
      dec: () => split({ count: get().count - payload }),
      asyncInc: () => {
        split({ loading: true })
        setTimeout(() => {
          split('inc', 1)
          split({ count: get().count + payload, loading: false, done: true })
        }, 1)
      }
    }[type]())
  }

  function onChange (atom, details) {
    history.push(Object.assign(details, { state: atom.get() }))

    if (atom.get().done) {
      eq(history, [{
        seq: 1,
        action: { payload: { count: 1 } },
        update: { count: 1 },
        prev: { count: 0 },
        state: { count: 1 }
      }, {
        seq: 2,
        action: { type: 'dec', payload: 1 },
        update: { count: 0 },
        prev: { count: 1 },
        state: { count: 0 }
      }, {
        seq: 3,
        action: { type: 'inc', payload: 2 },
        update: { count: 2 },
        prev: { count: 0 },
        state: { count: 2 }
      }, {
        seq: 4,
        action: { payload: { count: 4 } },
        update: { count: 4 },
        prev: { count: 2 },
        state: { count: 4 }
      }, {
        seq: 5,
        action: { type: 'asyncInc', payload: 10 },
        update: { loading: true },
        prev: { count: 4 },
        state: { count: 4, loading: true }
      }, {
        seq: 6,
        action: { type: 'inc', payload: 100 },
        update: { count: 104 },
        prev: { count: 4, loading: true },
        state: { count: 104, loading: true }
      }, {
        seq: 7,
        action: { type: 'inc', payload: 1 },
        update: { count: 105 },
        prev: { count: 104, loading: true },
        state: { count: 105, loading: true }
      }, {
        seq: 5,
        action: { type: 'asyncInc', payload: 10 },
        update: { count: 115, loading: false, done: true },
        prev: { count: 105, loading: true },
        state: { count: 115, loading: false, done: true }
      }])
      done()
    }
  }

  atom.split({ count: 1 })
  atom.split('dec', 1)
  atom.split('inc', 2)
  atom.split({ count: 4 })
  atom.split('asyncInc', 10)
  atom.split('inc', 100)
})

test('custom merge', () => {
  const extend = (oldState, newState) => oldState + newState
  const atom = createAtom(5, null, null, extend)

  atom.split(1)
  eq(atom.get(), 6)

  atom.split(1)
  eq(atom.get(), 7)
})

test('split with action returns promise with new state as resolution value', () => {
  const initialState = { count: 0 }
  const atom = createAtom(initialState, reduce, () => {})

  function reduce (get, split, { type, payload }) {
    const state = get()
    if (type === 'asyncIncrement') {
      state.count += payload
      split(state)
      return new Promise((resolve, reject) => setTimeout(resolve, 100))
    }
  }

  return atom.split('asyncIncrement', 3).then((state) => {
    eq({ count: 3 }, state)
  })
})

test('split with action returns promise that rejects when action throws', () => {
  const initialState = { count: 0 }
  const atom = createAtom(initialState, reduce, () => {})

  function reduce (get, split, { type, payload }) {
    const state = get()
    if (type === 'asyncIncrement') {
      state.count += payload
      split(state)
      throw Error('oopsie')
    }
  }

  return atom.split('asyncIncrement', 3).catch((err) => {
    eq(Error('oopsie'), err)
  })
})

test('split with action returns promise that rejects when action rejects', () => {
  const initialState = { count: 0 }
  const atom = createAtom(initialState, reduce, () => {})

  function reduce (get, split, { type, payload }) {
    const state = get()
    if (type === 'asyncIncrement') {
      state.count += payload
      split(state)
      return new Promise((resolve, reject) => setTimeout(() => reject(Error('oopsie')), 100))
    }
  }

  return atom.split('asyncIncrement', 3).catch((err) => {
    eq(Error('oopsie'), err)
  })
})
