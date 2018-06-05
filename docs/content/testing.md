---
title: Testing
---

An example of how you could go about unit testing individual actions. Say you have the following action:

**actions.js**
```js
const axios = require('axios')

module.exports = {
  fetchMetrics: async ({ get, set, dispatch }, id) => {
    set({ loading: true })
    try {
      const res = await axios.get('/metrics/' + id)
      set({ loading: false, metrics: res.data })
    } catch (err) {
      set({ loading: false, error: err.message })
      dispatch('trackError', err)
    }
  }
}
```

**test.js**
```js
const { deepEqual } = require('assert')
const createAtom = require('tiny-atom')
const axios = require('axios')
const sinon = require('sinon')
const actions = require('./actions')

suite('actions')

let changes
let atom

// reusable setup
function setup (actionType) {
  changes = []
  atom = createAtom({}, actions, { evolve })

  function evolve (atom, action, actions) {
    const { type, payload } = action
    if (type === actionType) {
      actions[type](atom, payload)
    } else {
      changes.push(action)
    }
  }

  atom.observe(function onChange (atom) {
    changes.push(atom.get())
  })

  return atom
}

test('fetchMetrics success', async () => {
  setup('fetchMetrics')

  sinon.stub(axios, 'get').callsFake(
    (path) => Promise.resolve({ data: [path, 'data'] })
  )

  await atom.dispatch('fetchMetrics', 57)

  // inspect each state change
  deepEqual(changes, [
    { loading: true },
    { loading: false, metrics: ['/metrics/57', 'data'] }
  ])
})

test('fetchMetrics error', async () => {
  setup('fetchMetrics')

  let err = new Error('Fetch failed')
  sinon.stub(axios, 'get').callsFake(
    (path) => Promise.reject(err)
  )

  await atom.dispatch('fetchMetrics', 57)

  // inspect each state change and actions dispatched
  deepEqual(changes, [
    { loading: true },
    { loading: false, error: 'Fetch failed' },
    { seq: 1, type: 'trackError', payload: err }
  ])
})
```
