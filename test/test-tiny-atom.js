import test from 'ava'
import { createAtom } from '../src/core'

test('can be initialised with no initial state or actions', t => {
  const atom = createAtom()
  t.deepEqual(atom.get(), {})
})

test('does not mutate the state object', t => {
  const initialState = { count: 0 }
  const increment = ({ get, set }, payload = 1) => set({ count: get().count + payload })
  const atom = createAtom({ state: initialState, actions: { increment } })

  t.deepEqual(atom.get(), { count: 0 })
  t.is(atom.get(), initialState)

  atom.dispatch('increment', 5)
  t.deepEqual(atom.get(), { count: 5 })
  t.not(atom.get(), initialState)
})

test('set can be be passed an updating function', t => {
  const initialState = { count: 0 }
  const increment = ({ set }, payload = 1) => set(state => ({ count: state.count + payload, t: 2 }))
  const atom = createAtom({ state: initialState, actions: { increment } })

  t.deepEqual(atom.get(), { count: 0 })
  t.is(atom.get(), initialState)

  atom.dispatch('increment', 5)
  t.deepEqual(atom.get(), { count: 5, t: 2 })
  t.not(atom.get(), initialState)
})

test.cb('async action updates the state', t => {
  const changes = []
  const atom = createAtom({ state: { count: 0 }, actions: { increment } })
  atom.observe(onChange)

  function increment({ get, set }) {
    set({ count: get().count + 1 })
    setTimeout(() => {
      set({ count: get().count + 1, async: true })
      set({ done: true })
    }, 1)
  }

  function onChange(atom) {
    const state = atom.get()
    changes.push(1)
    if (changes.length === 1) t.deepEqual(state, { count: 1 })
    if (changes.length === 2) t.deepEqual(state, { count: 2, async: true })
    if (state.done) {
      t.deepEqual(state, { count: 2, async: true, done: true })
      t.deepEqual(changes, [1, 1, 1])
      t.end()
    }
  }

  atom.dispatch('increment')
})

test('can be used in a mutating manner', t => {
  const initialState = { count: 0 }
  const atom = createAtom({ state: initialState, actions: { increment } })

  function increment({ get, swap }, payload) {
    const state = get()
    state.count += payload
    swap(state)
  }

  atom.dispatch('increment', 3)
  t.deepEqual(atom.get(), { count: 3 })
  t.is(atom.get(), initialState)
})

test.cb('debug provides action and update details', t => {
  const history = []

  const actions = {
    inc: ({ get, set }, payload) => set({ count: get().count + payload }),
    dec: ({ get, set }, payload) => set({ count: get().count - payload }),
    asyncInc: ({ get, set, dispatch }, payload) => {
      set({ loading: true })
      setTimeout(() => {
        dispatch('inc', 1)
        set({ count: get().count + payload, loading: false, done: true })
      }, 1)
    }
  }

  const atom = createAtom({ state: { count: 0 }, actions, debug })

  function debug(info) {
    history.push(Object.assign(info, { currState: atom.get() }))

    if (atom.get().done) {
      t.snapshot(history)
      t.end()
    }
  }

  atom.fuse({ state: { count: 1 } })
  atom.dispatch('dec', 1)
  atom.dispatch('inc', 2)
  atom.fuse({ state: { count: 4 } })
  atom.dispatch('asyncInc', 10)
  atom.dispatch('inc', 100)
})

test.cb('debug can be an array of functions', t => {
  const history = []

  const actions = {
    inc: ({ get, set }, payload) => set({ count: get().count + payload })
  }

  const atom = createAtom({ state: { count: 0 }, actions, debug: [debugOne, debugTwo] })

  function debugOne(info) {
    history.push(['debugOne', info])
  }

  function debugTwo(info) {
    history.push(['debugTwo', info])

    if (atom.get().done) {
      t.snapshot(history)
      t.end()
    }
  }

  atom.dispatch('inc', 2)
  atom.fuse({ state: { done: true } })
})

test('observe callback is called on each update', t => {
  const observations = []
  const atom = createAtom()

  const unobserveA = atom.observe(atom => observations.push('a' + atom.get().v))
  const unobserveB = atom.observe(atom => observations.push('b' + atom.get().v))

  atom.fuse({ state: { v: 6 } })
  t.deepEqual(observations, ['a6', 'b6'])

  unobserveB()
  unobserveB()
  const unobserveC = atom.observe(atom => observations.push('c' + atom.get().v))

  atom.fuse({ state: { v: 7 } })
  t.deepEqual(observations, ['a6', 'b6', 'a7', 'c7'])

  unobserveB()
  unobserveA()
  unobserveC()
})

test('missing actions', t => {
  const state = { count: 0 }
  const atom = createAtom({ state })

  try {
    atom.dispatch('i-dont-exist')
    t.ok(false, 'should not get here')
  } catch (err) {
    t.deepEqual(err.message, 'Missing action: i-dont-exist')
  }
})

test('custom evolve', t => {
  const state = { count: 0 }
  const atom = createAtom({ state, evolve })

  function evolve({ get, set }, { type, payload }) {
    if (type === 'increment') {
      set({ count: get().count + (payload || 1) })
    }
  }

  atom.dispatch('nothing')
  t.deepEqual(atom.get(), { count: 0 })

  atom.dispatch('increment')
  t.deepEqual(atom.get(), { count: 1 })

  atom.dispatch('increment', 5)
  t.deepEqual(atom.get(), { count: 6 })
})

test('fuse extends the state and actions', t => {
  const increment = ({ get, set }, payload = 1) => set({ count: get().count + payload })
  const decrement = ({ get, set }, payload = 1) => set({ count: get().count - payload })
  const state = { count: 0 }
  const actions = { increment }
  const atom = createAtom({ state, actions })

  atom.fuse({ state: { meta: 1 }, actions: { decrement } })
  atom.fuse({ state: { base: 2 } })
  atom.fuse()

  atom.dispatch('increment')
  atom.dispatch('increment', 5)
  atom.dispatch('decrement', 2)
  t.deepEqual(atom.get(), { count: 4, meta: 1, base: 2 })
})

test('async actions are testable', async function(t) {
  let atom, history, axios

  // action under test
  const actions = {
    fetchMetrics: async function({ get, set, dispatch }, id) {
      set({ loading: true })
      try {
        const res = await axios.get('/metrics/' + id)
        set({ loading: false, metrics: res.data })
      } catch (err) {
        set({ loading: false })
        dispatch('trackError', err)
      }
    },

    trackError: ({ set }) => {
      set({ error: err.message })
    }
  }

  // test boilerplate
  function setup() {
    history = []
    const onChange = ({ type, atom }) => (type === 'update' ? history.push(atom.get()) : null)
    return createAtom({ actions, debug: onChange })
  }

  // success case
  atom = setup()
  axios = { get: path => Promise.resolve({ data: [path, 'data'] }) }
  await atom.dispatch('fetchMetrics', 57)
  t.deepEqual(history, [{ loading: true }, { loading: false, metrics: ['/metrics/57', 'data'] }])

  // error case
  atom = setup()
  const err = new Error('Fetch failed')
  axios = { get: path => Promise.reject(err) }
  await atom.dispatch('fetchMetrics', 57)
  t.deepEqual(history, [{ loading: true }, { loading: false }, { loading: false, error: 'Fetch failed' }])
})
