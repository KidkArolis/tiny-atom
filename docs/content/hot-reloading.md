---
title: Hot reloading
---

Webpack provides a configurable hot code reloading mechanism. One way to preserve your `atom` state between the reloads is to store it on `window` object. Here's an example:

**index.js**
```js
require('./app')
if (module.hot) {
  module.hot.accept()
}
```

**app.js**
```js
const createAtom = require('tiny-atom')
const evolve = require('./evolve')
const render = require('./render')

const atom = createAtom(initialState(), evolve, onChange)

function initialState () {
  // when reloading the code, initialise the state from hotAtom
  return Object.assign({ count: 5 }, window.hotAtom)
}

function onChange (atom) {
  // on each state change, store it in hotAtom for hot reloading
  window.hotAtom = atom.get()
  render(atom)
}

render(atom)
```
