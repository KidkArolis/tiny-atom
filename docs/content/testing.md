---
title: Testing
---

An example of how you could go about unit testing individual actions. Say you have the following action:

**actions.js**
```js
const axios = require('axios')

module.exports = {
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
  atom = createAtom({}, evolve, onChange)
  function evolve (get, split, action) {
    const { type, payload } = action
    if (type === actionType) {
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

test('fetchMetrics success', async () => {
  setup('fetchMetrics')

  sinon.stub(axios, 'get').callsFake(
    (path) => Promise.resolve({ data: [path, 'data'] })
  )

  // directly call the action so we could await
  await actions.fetchMetrics(atom.get, atom.split, 57)

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

  // directly call the action so we could await
  await actions.fetchMetrics(atom.get, atom.split, 57)

  // inspect each state change and actions dispatched
  deepEqual(changes, [
    { loading: true },
    { loading: false, error: 'Fetch failed' },
    { seq: 1, type: 'trackError', payload: err }
  ])
})
```
