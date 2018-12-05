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
import createAtom from 'tiny-atom'
import actions from './actions'
import render from './render'

const atom = createAtom(initialState(), actions)

function initialState () {
  // when loading/reloading the app, initialise the state
  // from an atom copy stored on window.hotAtom
  return Object.assign({ count: 5 }, window.hotAtom)
}

atom.observe(function onChange (atom) {
  // on each state change, store it in hotAtom for hot reloading
  window.hotAtom = atom.get()
})
```
