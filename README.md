<h1 align="center">
  <br>
  <img src="https://user-images.githubusercontent.com/324440/32469476-cf1a8918-c34a-11e7-8ad2-c7a0c33d373c.png" alt="tiny atom logo" title="tiny atom logo" width='140px'>
  <br>
  <br>
</h1>

<h5 align="center">Minimal, yet awesome, state management.</h5>
<br />

<p align="center">
  <a href="https://www.npmjs.com/package/tiny-atom">
    <img src="https://img.shields.io/npm/v/tiny-atom.svg" alt="npm" />
  </a>
  <a href="http://img.badgesize.io/https://cdn.jsdelivr.net/npm/tiny-atom/index.min.js?compression=gzip">
    <img src="http://img.badgesize.io/https://cdn.jsdelivr.net/npm/tiny-atom/index.min.js?compression=gzip" alt="size" />
  </a>
  <a href="https://travis-ci.org/QubitProducts/tiny-atom">
    <img src="https://travis-ci.org/QubitProducts/tiny-atom.svg?branch=master" alt="Build Status" />
  </a>
  <a href="https://github.com/standard/standard">
    <img src="https://img.shields.io/badge/code_style-standard-brightgreen.svg" alt="code style: standard" />
  </a>
</p>

* tiny api - easy to understand, easy to adapt
* tiny size - 0.6KB
* single store modified via actions
* batteries included
  * react bindings
  * preact bindings
  * console logger
  * redux devtools integration
  * requestAnimationFrame helper for efficient rerenders

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

const initialState = {
  clicks: 0,
  items: []
}

const actions = {
  countClicks: ({ get, set }, n) => {
    set({ clicks: get().clicks + n })
  },

  fetchItems: async ({ set, dispatch }) => {
    set({ loading: true })
    const { data: items } = await axios.get('/api/items')
    set({ items, loading: false })
    dispatch('countClicks', 1)
  }
}

const atom = createAtom(initialState, actions)

atom.observe(function render (atom) {
  const { items, clicks } = atom.get()
  onClick(e => atom.dispatch('countClicks', 10))
})
```

## API

### `createAtom(initialState, actions, options)`

Create an atom.

* `initialState` - defaults to `{}`
* `options.debug` - a debug function called on each `action` and `update` with info object of shape `{ type, atom, action, sourceActions, prevState }`
* `options.merge` - a function called each time `set(update)` is called. Default implementation is `(state, update) => Object.assign({}, state, update)`. You can use this hook to use a different data structure or apply deep merges.
* `evolve({ get, set, dispatch }, action, actions)` - receives actions and controls the evolution of the state
  * `get()` - get current state
  * `set(update)` - mutate atom
  * `dispatch(type, payload)` – dispatch an action

```js
createAtom({ count: 1 }, { increment, decrement })
```

### `atom.get`

Get current state.

```js
atom.get()
atom.get().feed.items
```

### `atom.dispatch`

Send an action

```js
atom.dispatch('fetchMovies')
atom.dispatch('increment', 5)
```

### `atom.observe`

Register a callback for when atom changes. Returns the unobserve function.

```js
atom.observe(render)
atom.observe(atom => render(atom.get(), atom.split))
```

### `atom.fuse(state, actions)`

Extend atom's state and the action object. Convenient for composing atom from slices of state and actions from several modules.

```js
const state = {
  project: { name: 'tiny-atom' }
}

const actions = {
  star: (get, split) => split({
    project: { starred: true }
  })
}

atom.fuse(state, actions)
```

---

For documentation on the set of (p)react components `<ProvideAtom />`, `<ConnectAtom />` and `connect` see the [react](https://qubitproducts.github.io/tiny-atom/using-with-react) or [preact](https://qubitproducts.github.io/tiny-atom/using-with-preact) docs.
