const { eq, assert } = require('@briancavalier/assert')
const createAtom = require('..')

suite('tiny-atom')

test('can be used with no initial state, reducer or render listener', () => {
  const atom = createAtom()
  eq(atom.get(), {})
  atom.split({ count: 5 })
  atom.split('action')
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
  const atom = createAtom(initialState, reduce, () => {}, { merge: mutate })

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

test('debug provides action and update details', (done) => {
  const history = []
  const atom = createAtom({ count: 0 }, reduce, null, { debug })

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

  function debug (info) {
    history.push(Object.assign(info, { currState: atom.get() }))

    if (atom.get().done) {
      eq(history, [{
        type: 'update',
        action: { payload: { count: 1 } },
        sourceActions: [],
        atom: atom,
        prevState: { count: 0 },
        currState: { count: 1 }
      }, {
        type: 'action',
        action: { seq: 1, type: 'dec', payload: 1 },
        sourceActions: [],
        atom: atom,
        currState: { count: 1 }
      }, {
        type: 'update',
        action: { payload: { count: 0 } },
        sourceActions: [{ seq: 1, type: 'dec', payload: 1 }],
        atom: atom,
        prevState: { count: 1 },
        currState: { count: 0 }
      }, {
        type: 'action',
        action: { seq: 2, type: 'inc', payload: 2 },
        sourceActions: [],
        atom: atom,
        currState: { count: 0 }
      }, {
        type: 'update',
        action: { payload: { count: 2 } },
        sourceActions: [{ seq: 2, type: 'inc', payload: 2 }],
        atom: atom,
        prevState: { count: 0 },
        currState: { count: 2 }
      }, {
        type: 'update',
        action: { payload: { count: 4 } },
        sourceActions: [],
        atom: atom,
        prevState: { count: 2 },
        currState: { count: 4 }
      }, {
        type: 'action',
        action: { seq: 3, type: 'asyncInc', payload: 10 },
        sourceActions: [],
        atom: atom,
        currState: { count: 4 }
      }, {
        type: 'update',
        action: { payload: { loading: true } },
        sourceActions: [{ seq: 3, type: 'asyncInc', payload: 10 }],
        atom: atom,
        prevState: { count: 4 },
        currState: { count: 4, loading: true }
      }, {
        type: 'action',
        action: { seq: 4, type: 'inc', payload: 100 },
        sourceActions: [],
        atom: atom,
        currState: { count: 4, loading: true }
      }, {
        type: 'update',
        action: { payload: { count: 104 } },
        sourceActions: [{ seq: 4, type: 'inc', payload: 100 }],
        atom: atom,
        prevState: { count: 4, loading: true },
        currState: { count: 104, loading: true }
      }, {
        type: 'action',
        action: { seq: 5, type: 'inc', payload: 1 },
        sourceActions: [{ seq: 3, type: 'asyncInc', payload: 10 }],
        atom: atom,
        currState: { count: 104, loading: true }
      }, {
        type: 'update',
        action: { payload: { count: 105 } },
        sourceActions: [
          { seq: 3, type: 'asyncInc', payload: 10 },
          { seq: 5, type: 'inc', payload: 1 }
        ],
        atom: atom,
        prevState: { count: 104, loading: true },
        currState: { count: 105, loading: true }
      }, {
        type: 'update',
        action: { payload: { count: 115, loading: false, done: true } },
        sourceActions: [{ seq: 3, type: 'asyncInc', payload: 10 }],
        atom: atom,
        prevState: { count: 105, loading: true },
        currState: { count: 115, loading: false, done: true }
      }]
      )
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
  const merge = (oldState, newState) => oldState + newState
  const atom = createAtom(5, null, null, { merge })

  atom.split(1)
  eq(atom.get(), 6)

  atom.split(1)
  eq(atom.get(), 7)
})
