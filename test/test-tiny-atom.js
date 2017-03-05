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

  function reduce (get, set, { type, payload }) {
    if (type === 'increment') {
      set({ count: get().count + (payload || 1) })
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

  function reduce (get, set, { type, payload }) {
    let state = get()
    let swap = next => { state = set(next) }

    if (type === 'increment') {
      swap({ count: state.count + 1 })
      setTimeout(() => {
        swap({ count: state.count + 1, async: true })
        swap({ done: true })
      }, 1)
    }
  }

  function onChange (atom) {
    let state = atom.get()
    changes.push(1)
    if (changes.length === 1) eq(state, { count: 1 })
    if (changes.length === 2) eq(state, { count: 2, async: true })
    if (state.done) {
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
  const atom = createAtom(initialState, reduce)

  function reduce (get, set, { type, payload }) {
    const state = get()
    if (type === 'increment') {
      state.count += payload
      set(state)
    }
  }

  atom.split('increment', 3)
  eq(atom.get(), { count: 3 })
  assert(atom.get() === initialState)
})

test('onChange provides action details', (done) => {
  const history = []
  const atom = createAtom({ count: 0 }, reduce, onChange)

  function reduce (get, set, { type, payload }) {
    ({
      inc: () => set({ count: get().count + payload }),
      dec: () => set({ count: get().count - payload }),
      asyncInc: () => {
        set({ loading: true })
        setTimeout(() => {
          set({ count: get().count + payload, loading: false, done: true })
        }, 1)
      }
    }[type]())
  }

  function onChange (atom, details) {
    history.push({ id: details.id, action: details.action, state: atom.get() })

    if (atom.get().done) {
      eq(history, [{
        id: 1,
        action: { type: null, payload: { count: 1 } },
        state: { count: 1 }
      }, {
        id: 2,
        action: { type: 'dec', payload: 1 },
        state: { count: 0 }
      }, {
        id: 3,
        action: { type: 'inc', payload: 2 },
        state: { count: 2 }
      }, {
        id: 4,
        action: { type: 'asyncInc', payload: 10 },
        state: { count: 2, loading: true }
      }, {
        id: 5,
        action: { type: 'inc', payload: 100 },
        state: { count: 102, loading: true }
      }, {
        id: 4,
        action: { type: 'asyncInc', payload: 10 },
        state: { count: 112, loading: false, done: true }
      }])
      done()
    }
  }

  atom.split({ count: 1 })
  atom.split('dec', 1)
  atom.split('inc', 2)
  atom.split('asyncInc', 10)
  atom.split('inc', 100)
})

test('custom extend - undocumented feature', () => {
  const extend = (x, oldState, newState) => oldState + newState
  const atom = createAtom(5, null, null, extend)

  atom.split(1)
  eq(atom.get(), 6)

  atom.split(1)
  eq(atom.get(), 7)
})
