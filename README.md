<h1 align="center">
  <br>
  <img src="https://user-images.githubusercontent.com/324440/32469476-cf1a8918-c34a-11e7-8ad2-c7a0c33d373c.png" alt="tiny atom logo" title="tiny atom logo" width='140px'>
  <br>
  <br>
</h1>

<h5 align="center">Minimal, yet awesome, state management.</h5>
<br />

* tiny api - easy to understand, easy to adapt
* tiny size - 0.6KB
* single store modified via actions
* batteries included
  * react bindings including
  * support for the new React.createContext API
  * preact bindings
  * console logger
  * redux devtools integration
  * immutable helper functions
  * requestAnimationFrame helper for efficient rerender

[![npm](https://img.shields.io/npm/v/tiny-atom.svg)](https://www.npmjs.com/package/tiny-atom)
[![size](http://img.badgesize.io/https://cdn.jsdelivr.net/npm/tiny-atom/index.min.js?compression=gzip)](http://img.badgesize.io/https://cdn.jsdelivr.net/npm/tiny-atom/index.min.js?compression=gzip)
[![Build Status](https://travis-ci.org/QubitProducts/tiny-atom.svg?branch=master)](https://travis-ci.org/QubitProducts/tiny-atom)
[![Coverage Status](https://coveralls.io/repos/github/QubitProducts/tiny-atom/badge.svg?branch=master)](https://coveralls.io/github/QubitProducts/tiny-atom?branch=master)
[![code style: standard](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://github.com/standard/standard)

## Installation

    $ yarn add tiny-atom

## Docs

Read the [full docs](https://qubitproducts.github.io/tiny-atom) or pick one of the highlights:

  * [Basics](https://qubitproducts.github.io/tiny-atom/basics)
  * [Prior art](https://qubitproducts.github.io/tiny-atom/prior-art)
  * [Using with React](https://qubitproducts.github.io/tiny-atom/using-with-react)
  * [Using with Preact](https://qubitproducts.github.io/tiny-atom/using-with-preact)
  * [API Reference](https://qubitproducts.github.io/tiny-atom/api-reference)

## Example

```js
const createAtom = require('tiny-atom')

const atom = createAtom({ count: 0 }, evolve)

const actions = {
  increment: (get, split, x) => {
    split({ count: get().count + x })
  },

  asyncIncrement: (get, split, x) => {
    split({ loading: true })
    setTimeout(() => {
      split('increment', x)
      split({ loading: false })
    }, 1000)
  }
}

function evolve (get, split, action) {
  actions[action.type](get, split, action.payload)
}

function render (atom) {
  document.body.innerHTML = `Count ${atom.get().count}`
}

atom.observe(render)

atom.split({ count: 5 })
  // -> { count: 5 }
atom.split('increment', 5)
  // -> { count: 10 }
atom.split('asyncIncrement', 3)
  // -> { count: 10, loading: true }
atom.split('increment', 2)
  // -> { count: 12, loading: true }
  // -> 1 second later...
  // -> { count: 15, loading: false }
```

## API

### `createAtom(initialState, evolve | actions, options)`

Create an atom.

* `initialState` - defaults to `{}`
* `evolve(get, split, action, actions)` - receives actions and controls the evolution of the state
  * `get()` - get current state – see `atom.get`
  * `split(update)` or `split(type, payload)` – see `atom.split`
  * `action` - an object of shape `{ type, payload }`

All parameters are optional, but typically you'll want to use at least initialState and evolve/actions.

Available options:

* `options.debug(info)` - called on each `action` and `update` with info object of shape `{ type, atom, action, sourceActions, prevState }`
* `options.merge(state, update)` - called each time `split(update)` is called. Default implementation is `(state, update) => Object.assign({}, state, update)`. You can use this hook to use a different data structure for your state, such as Immutable. Or you could use it to extend the state instead of cloning with `Object.assign(state, update)` if that makes performance or architectural difference.

e.g.

```js
createAtom({ count: 1 }, { increment, decrement })
createAtom({ count: 1 }, (get, split, action) => split({ count: 2 }))
const evolve = (get, split, action, actions) => actions[action.type](get, split, action.payload)
createAtom({ count: 1 }, evolve)
```

### `atom.get`

Get current state.

e.g.

```js
atom.get()
atom.get().feed.items
```

### `atom.split`

Can be used in 2 ways:

* `atom.split(type, payload)` - send an action to `evolve`.
* `atom.split(update)` - update the state with the `update` object, doesn't go via `evolve`.

e.g.

```js
atom.split('increment', 5)
atom.split({ count: 2 })
atom.split({ entities: { movies: { 45: { name: 'Primer' } } }})
```

### `atom.observe`

Register a callback for when atom changes. This can be used in addition or instead of the `render` callback. Returns the dispose function.

For documentation on the set of (p)react components `<ProvideAtom />`, `<ConnectAtom />` and `connect` see the [react](https://qubitproducts.github.io/tiny-atom/using-with-react) or [preact](https://qubitproducts.github.io/tiny-atom/using-with-preact) docs.

e.g.

```js
atom.observe(render)
atom.observe(atom => render(atom.get(), atom.split))
```

### `atom.fuse(state, actions)`

Extend atom's state and the action object. Convenient for composing the atom slices of state and actions from several modules.

e.g.

```js
const state = { project: { name: 'tiny-atom' } }
const actions = {
  star: (get, split) => split({ project: { starred: true } })
}
atom.fuse(state, actions)
```
