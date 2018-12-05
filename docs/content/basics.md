---
title: Basics
---

This guide demonstrates the typical usage of `tiny-atom` when creating interactive web apps. With **Tiny Atom** we keep all of the application data and some of the application state in the `atom`. We then project this state by rendering it with some view library, such as `react`. And we update the state by sending actions using the `atom.dispatch` function. To summarise:

1. Store data and state in an `atom`.
2. Render the state into DOM.
3. Update the state using actions.

## Basic app

First, we create our `atom` that stores a count and can be updated with two actions.

**atom.js**
```js
import createAtom from 'tiny-atom'

const initialState = { count: 0 }

const actions = {
  increment: ({ get, set }, n) => {
    const count = get().count
    set({ count: count + n })
  },
  decrement: ({ get, set }, n) => {
    const count = get().count
    set({ count: count - n })
  }
}

export default createAtom(initialState, actions)
```

Next, create the App component and use the connector to subscribe to the atom state.

**App.js**
```js
import React from 'react'
import { connect } from 'tiny-atom/connect'

const mapStateToProps = (state) => {
  return {
    count: state.count
  }
}

cont mapActions = [
  'increment',
  'decrement'
]

const App = ({ count, increment, decrement }) => (
  <div>
    <h1>count: {count}</h1>
    <button onClick={() => increment(1)}>Increment</button>
    <button onClick={() => decrement(1)}>Decrement</button>
  </div>
)

export default connect(map, actions)(App)
```

And finally render the application.

**index.js**
```js
import React from 'react'
import ReactDOM from 'react-dom'
import App from './App'
import atom from './atom'

ReactDOM.render((
  <Provider atom={atom}>
    <App />
  </Provider>
), document.body)
```

When a user clicks one of the Increment or Decrement buttons, the state will be updated and the connected components will efficiently rerender.

There are many ways to bootstrap and structure an application. This flexibility can be useful. If you prefer an opinionated prepackaged way to create an app, check out [moonwave](https://github.com/KidkArolis/moonwave) - an application framework combining (p)react, tiny-atom and space-router libraries.
