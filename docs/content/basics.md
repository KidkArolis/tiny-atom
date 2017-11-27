---
title: Basics
---

This guide demonstrates the typical usage of `tiny-atom` when creating interactive web apps. With **Tiny Atom** we keep all of the application data and some of the application state in the `atom`. We then project this state by rendering it with some view library, such as `react`. And we update the state by sending actions using the `atom.split` function. To summarise:

1. Store data and state in an `atom`.
2. Render the state into DOM.
3. Update the state with actions.

## Basic app

First, we create our `atom` that stores a count and can be updated with two actions.

**atom.js**
```js
const createAtom = require('tiny-atom')
const render = require('./render')

const atom = createAtom({ count: 0 }, evolve, render)

const actions = {
  increment: (get, split, x) => split({ count: get().count + x }),
  decrement: (get, split, x) => split({ count: get().count - x })
}

function evolve (get, split, action) {
  actions[action.type](get, split, action.payload)
}

module.exports = atom
```

Next, let's create the render function. This demonstrates how we react to `atom` changes in order to continuosly project the latest state into DOM. It also demonstrates how we can pass `atom` as context to the entire application tree using the `ProvideAtom` component.

**render.js**
```js
const React = require('react')
const ReactDOM = require('react-dom')
const { ProvideAtom } = require('tiny-atom/react')
const App = require('./App')

module.exports = function render (atom) {
  ReactDOM.render((
    <ProvideAtom atom={atom}>
      <App />
    </ProvideAtom>
  ), document.body)
}
```

We then create our App component. This demonstrates how to use `ConnectAtom` to extract the relevant bits of state and actions for any given component.

**App.js**
```js
const React = require('react')
const { ConnectAtom } = require('tiny-atom/react')

const mapAtom = (state, split) => ({
  count: state.count,
  inc: () => split('increment', 1),
  dec: () => split('decrement', 1)
})

const App = () => (
  <ConnectAtom map={mapAtom} render={({ count, inc, dec }) => (
    <div>
      <h1>count: {count}</h1>
      <button onClick={inc}>Increment</button>
      <button onClick={dec}>Decrement</button>
    </div>
  )} />
)

module.exports = App
```

And finally assemble all the pieces together.

**index.js**
```js
const atom = require('./atom')
const render = require('./render')
render(atom)
```

This is the initial render of the app. When a user clicks one of the Increment or Decrement buttons, the state will be updated and `render` will be called to rerender the app.

There are many ways to bootstrap and structure an application. This flexibility can be useful. If you prefer an opinionated prepackaged way to create an app, check out [moonwave](https://github.com/KidkArolis/moonwave) - an application framework to puts together (p)react, tiny-atom and space-router libraries.
