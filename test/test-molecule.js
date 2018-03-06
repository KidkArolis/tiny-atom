// const { equal, notEqual, deepEqual } = require('assert')
const { deepEqual } = require('assert')
const createMolecule = require('../molecule')

suite('tiny-atom/molecule')

test('does not mutate the state object', () => {
  const initialState = { count: 0 }
  const molecule = createMolecule()
  molecule.registerInitialState(initialState)

  deepEqual(molecule.get(), { count: 0 })
  molecule.split({ count: 5 })
  deepEqual(molecule.get(), { count: 5 })
})

test('action', () => {
  const molecule = createMolecule()
  molecule.registerInitialState({ count: 0 })
  molecule.registerActions({ increment })

  function increment (get, split, { payload }) {
    return split({ count: get().count + (payload || 1) })
  }

  molecule.split('increment')
  deepEqual(molecule.get(), { count: 1 })

  molecule.split('increment', 5)
  deepEqual(molecule.get(), { count: 6 })
})

test('async evolve', (done) => {
  const changes = []
  const molecule = createMolecule(onChange)

  molecule.registerInitialState({ count: 0 })
  molecule.registerActions({ increment })

  function increment (get, split) {
    split({ count: get().count + 1 })
    setTimeout(() => {
      split({ count: get().count + 1, async: true })
      split({ done: true })
    }, 1)
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

  molecule.split('increment')
})

test('onChange listener', () => {
  const history = []
  const molecule = createMolecule(onChange)

  molecule.registerInitialState({ count: 0 })

  function onChange (atom) {
    let state = atom.get()
    history.push(state)
  }

  molecule.split({ count: 1 })
  molecule.split({ count: 2 })
  molecule.split({ count: 3 })

  deepEqual(history, [
    { count: 1 },
    { count: 2 },
    { count: 3 }
  ])
})

test('can be used in a mutating manner', () => {
  const molecule = createMolecule({ merge: mutate })

  molecule.registerInitialState({ count: 0 })
  molecule.registerActions({ increment })

  function mutate (empty, prev, next) {
    return Object.assign(prev, next)
  }

  function increment (get, split, { payload }) {
    const state = get()
    state.count += payload
    split(state)
  }

  molecule.split('increment', 3)
  deepEqual(molecule.get(), { count: 3 })
})

test('debug provides action and update details', (done) => {
  const history = []
  const molecule = createMolecule({ debug })

  molecule.registerInitialState({ count: 0 })
  molecule.registerActions({
    inc: (get, split, { payload }) => split({ count: get().count + payload }),
    dec: (get, split, { payload }) => split({ count: get().count - payload }),
    asyncInc: (get, split, { payload }) => {
      split({ loading: true })
      setTimeout(() => {
        split('inc', 1)
        split({ count: get().count + payload, loading: false, done: true })
      }, 1)
    }
  })

  function debug (info) {
    history.push(Object.assign(info, { currState: molecule.get() }))

    if (molecule.get().done) {
      deepEqual(history, [{
        type: 'update',
        action: { payload: { count: 1 } },
        sourceActions: [],
        atom: molecule,
        prevState: { count: 0 },
        currState: { count: 1 }
      }, {
        type: 'action',
        action: { seq: 1, type: 'dec', payload: 1 },
        sourceActions: [],
        atom: molecule,
        currState: { count: 1 }
      }, {
        type: 'update',
        action: { payload: { count: 0 } },
        sourceActions: [{ seq: 1, type: 'dec', payload: 1 }],
        atom: molecule,
        prevState: { count: 1 },
        currState: { count: 0 }
      }, {
        type: 'action',
        action: { seq: 2, type: 'inc', payload: 2 },
        sourceActions: [],
        atom: molecule,
        currState: { count: 0 }
      }, {
        type: 'update',
        action: { payload: { count: 2 } },
        sourceActions: [{ seq: 2, type: 'inc', payload: 2 }],
        atom: molecule,
        prevState: { count: 0 },
        currState: { count: 2 }
      }, {
        type: 'update',
        action: { payload: { count: 4 } },
        sourceActions: [],
        atom: molecule,
        prevState: { count: 2 },
        currState: { count: 4 }
      }, {
        type: 'action',
        action: { seq: 3, type: 'asyncInc', payload: 10 },
        sourceActions: [],
        atom: molecule,
        currState: { count: 4 }
      }, {
        type: 'update',
        action: { payload: { loading: true } },
        sourceActions: [{ seq: 3, type: 'asyncInc', payload: 10 }],
        atom: molecule,
        prevState: { count: 4 },
        currState: { count: 4, loading: true }
      }, {
        type: 'action',
        action: { seq: 4, type: 'inc', payload: 100 },
        sourceActions: [],
        atom: molecule,
        currState: { count: 4, loading: true }
      }, {
        type: 'update',
        action: { payload: { count: 104 } },
        sourceActions: [{ seq: 4, type: 'inc', payload: 100 }],
        atom: molecule,
        prevState: { count: 4, loading: true },
        currState: { count: 104, loading: true }
      }, {
        type: 'action',
        action: { seq: 5, type: 'inc', payload: 1 },
        sourceActions: [{ seq: 3, type: 'asyncInc', payload: 10 }],
        atom: molecule,
        currState: { count: 104, loading: true }
      }, {
        type: 'update',
        action: { payload: { count: 105 } },
        sourceActions: [
          { seq: 3, type: 'asyncInc', payload: 10 },
          { seq: 5, type: 'inc', payload: 1 }
        ],
        atom: molecule,
        prevState: { count: 104, loading: true },
        currState: { count: 105, loading: true }
      }, {
        type: 'update',
        action: { payload: { count: 115, loading: false, done: true } },
        sourceActions: [{ seq: 3, type: 'asyncInc', payload: 10 }],
        atom: molecule,
        prevState: { count: 105, loading: true },
        currState: { count: 115, loading: false, done: true }
      }]
      )
      done()
    }
  }

  molecule.split({ count: 1 })
  molecule.split('dec', 1)
  molecule.split('inc', 2)
  molecule.split({ count: 4 })
  molecule.split('asyncInc', 10)
  molecule.split('inc', 100)
})

test('custom merge', () => {
  const merge = (oldState, factor) => {
    return ({ count: oldState.count * factor })
  }
  const molecule = createMolecule({ merge })

  molecule.registerInitialState({ count: 5 })

  molecule.split(2)
  deepEqual(molecule.get().count, 10)

  molecule.split(3)
  deepEqual(molecule.get().count, 30)
})

test('async action testability', async () => {
  // instead of stubbing real axios, we'll use fake axios instead
  let axios
  let changes
  let molecule

  // action in test
  const actions = {
    fetchMetrics: async (get, split, { id }) => {
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

  // test boilerplate
  function setup () {
    changes = []
    molecule = createMolecule(onChange, { defaultEvolve })
    molecule.registerInitialState({})
    molecule.registerActions(actions)
    function defaultEvolve (get, split, action) {
      changes.push(action)
    }
    function onChange (atom) {
      changes.push(atom.get())
    }
    return molecule
  }

  // success case
  setup()
  axios = { get: (path) => Promise.resolve({ data: [path, 'data'] }) }
  await actions.fetchMetrics(molecule.get, molecule.split, { id: 57 })
  deepEqual(changes, [
    { loading: true },
    { loading: false, metrics: ['/metrics/57', 'data'] }
  ])

  // error case
  setup()
  let err = new Error('Fetch failed')
  axios = { get: (path) => Promise.reject(err) }
  await actions.fetchMetrics(molecule.get, molecule.split, { id: 57 })
  deepEqual(changes, [
    { loading: true },
    { loading: false, error: 'Fetch failed' },
    { seq: 1, type: 'trackError', payload: err }
  ])
})

test('observe with no render', () => {
  const observations = []
  const molecule = createMolecule()

  const unobserveA = molecule.observe(atom => observations.push('a' + atom.get().v))
  const unobserveB = molecule.observe(atom => observations.push('b' + atom.get().v))

  molecule.split({ v: 6 })
  deepEqual(observations, ['a6', 'b6'])

  unobserveB()
  unobserveB()
  const unobserveC = molecule.observe(atom => observations.push('c' + atom.get().v))

  molecule.split({ v: 7 })
  deepEqual(observations, ['a6', 'b6', 'a7', 'c7'])

  unobserveB()
  unobserveA()
  unobserveC()
})

test('observe with render', () => {
  const observations = []
  const render = atom => observations.push('r' + atom.get().v)
  const molecule = createMolecule(render)
  molecule.registerInitialState({})

  const unobserveA = molecule.observe(atom => observations.push('a' + atom.get().v))
  const unobserveB = molecule.observe(atom => observations.push('b' + atom.get().v))

  molecule.split({ v: 6 })
  deepEqual(observations, ['r6', 'a6', 'b6'])

  unobserveB()
  unobserveB()
  const unobserveC = molecule.observe(atom => observations.push('c' + atom.get().v))

  molecule.split({ v: 7 })
  deepEqual(observations, ['r6', 'a6', 'b6', 'r7', 'a7', 'c7'])

  unobserveB()
  unobserveA()
  unobserveC()
})

// Molecule specific tests

function incrementModule (molecule) {
  molecule.registerInitialState({ count1: 0 })
  molecule.registerActions({ increment })
  function increment (get, split, { payload }) {
    return split({ count1: get().count1 + (payload || 1) })
  }
}

function decrementModule (molecule) {
  molecule.registerInitialState({ count2: 100 })
  molecule.registerActions({ decrement })
  function decrement (get, split, { payload }) {
    return split({ count2: get().count2 - (payload || 1) })
  }
}

test('modules', () => {
  const molecule = createMolecule()

  incrementModule(molecule)
  decrementModule(molecule)

  molecule.split('increment')
  deepEqual(molecule.get(), { count1: 1, count2: 100 })

  molecule.split('decrement', 58)
  deepEqual(molecule.get(), { count1: 1, count2: 42 })
})

// Accessing / changing fields from across modules is possible,
// but I don't want to make that official in a test yet.
// There may be elegant ways to regulate that.
