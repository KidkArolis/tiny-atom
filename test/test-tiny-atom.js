const { equal, notEqual, deepEqual } = require('assert')
const createAtom = require('..')

suite('tiny-atom')

test('can be used with no initial state, evolve or render listener', () => {
  const atom = createAtom()
  deepEqual(atom.get(), {})
  atom.split({ count: 5 })
  atom.split('action')
  deepEqual(atom.get(), { count: 5 })
})

test('does not mutate the state object', () => {
  const initialState = { count: 0 }
  const atom = createAtom(initialState)

  deepEqual(atom.get(), { count: 0 })
  equal(atom.get(), initialState)

  atom.split({ count: 5 })
  deepEqual(atom.get(), { count: 5 })
  notEqual(atom.get(), initialState)
})

test('evolve', () => {
  const atom = createAtom({ count: 0 }, evolve)

  function evolve (get, split, { type, payload }) {
    if (type === 'increment') {
      split({ count: get().count + (payload || 1) })
    }
  }

  atom.split('increment')
  deepEqual(atom.get(), { count: 1 })

  atom.split('increment', 5)
  deepEqual(atom.get(), { count: 6 })
})

test('async evolve', (done) => {
  const changes = []
  const atom = createAtom({ count: 0 }, evolve, onChange)

  function evolve (get, split, { type, payload }) {
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
    if (changes.length === 1) deepEqual(state, { count: 1 })
    if (changes.length === 2) deepEqual(state, { count: 2, async: true })
    if (state.done) {
      deepEqual(state, { count: 2, async: true, done: true })
      deepEqual(changes, [1, 1, 1])
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

  deepEqual(history, [
    { count: 1 },
    { count: 2 },
    { count: 3 }
  ])
})

test('can be used in a mutating manner', () => {
  const initialState = { count: 0 }
  const atom = createAtom(initialState, evolve, () => {}, { merge: mutate })

  function mutate (empty, prev, next) {
    return Object.assign(prev, next)
  }

  function evolve (get, split, { type, payload }) {
    const state = get()
    if (type === 'increment') {
      state.count += payload
      split(state)
    }
  }

  atom.split('increment', 3)
  deepEqual(atom.get(), { count: 3 })
  equal(atom.get(), initialState)
})

test('debug provides action and update details', (done) => {
  const history = []
  const atom = createAtom({ count: 0 }, evolve, null, { debug })

  function evolve (get, split, { type, payload }) {
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
      deepEqual(history, [{
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
  deepEqual(atom.get(), 6)

  atom.split(1)
  deepEqual(atom.get(), 7)
})

test('async action testability', async () => {
  // instead of stubbing real axios, we'll use fake axios instead
  let axios
  let changes
  let atom

  // test boilerplate
  function setup () {
    changes = []
    atom = createAtom({}, evolve, onChange)
    function evolve (get, split, action) {
      const { type, payload } = action
      if (actions[type]) {
        actions[type](get, split, payload)
      } else {
        changes.push(action)
      }
    }
    function onChange (atom) {
      changes.push(atom.get())
    }
    return atom
  }

  // action in test
  const actions = {
    fetchMetrics: async (get, split, id) => {
      split({ loading: true })
      try {
        const res = await axios.get('/metrics/' + id)
        split({ loading: false, metrics: res.data })
      } catch (err) {
        split({ loading: false, error: err.message })
        split('trackError', err)
      }
    }
  }

  // success case
  setup()
  axios = { get: (path) => Promise.resolve({ data: [path, 'data'] }) }
  await actions.fetchMetrics(atom.get, atom.split, 57)
  deepEqual(changes, [
    { loading: true },
    { loading: false, metrics: ['/metrics/57', 'data'] }
  ])

  // error case
  setup()
  let err = new Error('Fetch failed')
  axios = { get: (path) => Promise.reject(err) }
  await actions.fetchMetrics(atom.get, atom.split, 57)
  deepEqual(changes, [
    { loading: true },
    { loading: false, error: 'Fetch failed' },
    { seq: 1, type: 'trackError', payload: err }
  ])
})
