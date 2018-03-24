const test = require('ava')
const createAtom = require('../src')

test('can be used with no initial state, evolve or render listener', t => {
  const atom = createAtom()
  t.deepEqual(atom.get(), {})
  atom.split({ count: 5 })
  atom.split('action')
  t.deepEqual(atom.get(), { count: 5 })
})

test('does not mutate the state object', t => {
  const initialState = { count: 0 }
  const atom = createAtom(initialState)

  t.deepEqual(atom.get(), { count: 0 })
  t.is(atom.get(), initialState)

  atom.split({ count: 5 })
  t.deepEqual(atom.get(), { count: 5 })
  t.not(atom.get(), initialState)
})

test('evolve updates the state', t => {
  const atom = createAtom({ count: 0 }, evolve)

  function evolve (get, split, { type, payload }) {
    if (type === 'increment') {
      split({ count: get().count + (payload || 1) })
    }
  }

  atom.split('increment')
  t.deepEqual(atom.get(), { count: 1 })

  atom.split('increment', 5)
  t.deepEqual(atom.get(), { count: 6 })
})

test.cb('async evolve updates the state', t => {
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
    if (changes.length === 1) t.deepEqual(state, { count: 1 })
    if (changes.length === 2) t.deepEqual(state, { count: 2, async: true })
    if (state.done) {
      t.deepEqual(state, { count: 2, async: true, done: true })
      t.deepEqual(changes, [1, 1, 1])
      t.end()
    }
  }

  atom.split('increment')
})

test('onChange listener receives updates', t => {
  const history = []
  const atom = createAtom({ count: 0 }, null, onChange)

  function onChange (atom) {
    let state = atom.get()
    history.push(state)
  }

  atom.split({ count: 1 })
  atom.split({ count: 2 })
  atom.split({ count: 3 })

  t.deepEqual(history, [
    { count: 1 },
    { count: 2 },
    { count: 3 }
  ])
})

test('can be used in a mutating manner', t => {
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
  t.deepEqual(atom.get(), { count: 3 })
  t.is(atom.get(), initialState)
})

test.cb('debug provides action and update details', t => {
  const history = []
  const atom = createAtom({ count: 0 }, evolve, { debug })

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
      t.snapshot(history)
      t.end()
    }
  }

  atom.split({ count: 1 })
  atom.split('dec', 1)
  atom.split('inc', 2)
  atom.split({ count: 4 })
  atom.split('asyncInc', 10)
  atom.split('inc', 100)
})

test('custom merge', t => {
  const merge = (oldState, newState) => oldState + newState
  const atom = createAtom(5, null, { merge })

  atom.split(1)
  t.deepEqual(atom.get(), 6)

  atom.split(1)
  t.deepEqual(atom.get(), 7)
})

test('async actions are testable', async t => {
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
  t.deepEqual(changes, [
    { loading: true },
    { loading: false, metrics: ['/metrics/57', 'data'] }
  ])

  // error case
  setup()
  let err = new Error('Fetch failed')
  axios = { get: (path) => Promise.reject(err) }
  await actions.fetchMetrics(atom.get, atom.split, 57)
  t.deepEqual(changes, [
    { loading: true },
    { loading: false, error: 'Fetch failed' },
    { seq: 1, type: 'trackError', payload: err }
  ])
})

test('observe with no render is an alternative approach to listening for updates', t => {
  const observations = []
  const atom = createAtom()

  const unobserveA = atom.observe(atom => observations.push('a' + atom.get().v))
  const unobserveB = atom.observe(atom => observations.push('b' + atom.get().v))

  atom.split({ v: 6 })
  t.deepEqual(observations, ['a6', 'b6'])

  unobserveB()
  unobserveB()
  const unobserveC = atom.observe(atom => observations.push('c' + atom.get().v))

  atom.split({ v: 7 })
  t.deepEqual(observations, ['a6', 'b6', 'a7', 'c7'])

  unobserveB()
  unobserveA()
  unobserveC()
})

test('observe can also be used with render', t => {
  const observations = []
  const render = atom => observations.push('r' + atom.get().v)
  const atom = createAtom({}, null, render)

  const unobserveA = atom.observe(atom => observations.push('a' + atom.get().v))
  const unobserveB = atom.observe(atom => observations.push('b' + atom.get().v))

  atom.split({ v: 6 })
  t.deepEqual(observations, ['r6', 'a6', 'b6'])

  unobserveB()
  unobserveB()
  const unobserveC = atom.observe(atom => observations.push('c' + atom.get().v))

  atom.split({ v: 7 })
  t.deepEqual(observations, ['r6', 'a6', 'b6', 'r7', 'a7', 'c7'])

  unobserveB()
  unobserveA()
  unobserveC()
})

test('evolve as action object', t => {
  const increment = (get, split, payload = 1) => split({ count: get().count + payload })
  const atom = createAtom({ count: 0 }, { increment })

  atom.split('increment')
  atom.split('increment', 5)
  t.deepEqual(atom.get(), { count: 6 })
})

test('fuse extends the state and actions', t => {
  const increment = (get, split, payload = 1) => split({ count: get().count + payload })
  const decrement = (get, split, payload = 1) => split({ count: get().count - payload })
  const atom = createAtom({ count: 0 }, { increment })

  atom.fuse({ meta: 1 }, { decrement })
  atom.fuse({ base: 2 })
  atom.fuse()

  atom.split('increment')
  atom.split('increment', 5)
  atom.split('decrement', 2)
  t.deepEqual(atom.get(), { count: 4, meta: 1, base: 2 })
})
