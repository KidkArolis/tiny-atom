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

* single store modified via actions
* tiny api - easy to understand, easy to adapt
* tiny size - 1KB
+ react and preact bindings included
+ console logger and redux devtools integration

**How is this different from redux?** The key difference is that action functions in tiny-atom can read and update the state and call other actions. Action functions are self contained units of business logic. This removes layers of boilerplate while preserving the benefits of redux like stores.

## Installation

    $ npm install --save tiny-atom@beta

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

const atom = createAtom({
  clicks: 0,
  items: []
}, {
  countClicks: ({ get, set }, n) => {
    set({ clicks: get().clicks + n })
  },

  fetchItems: async ({ set, dispatch }) => {
    set({ loading: true })
    const { data: items } = await axios.get('/api/items')
    set({ items, loading: false })
    dispatch('countClicks', 1)
  }
})

atom.observe(function render (atom) {
  const { items, clicks } = atom.get()
  onClick(e => atom.dispatch('countClicks', 10))
})
```

## API

### `createAtom(initialState, actions, options)`

Create an atom.

#### initialState
*type*: `any`
*default*: `{}`

The initial state of the atom. If custom data structure is used (e.g. Immutable), make sure to also specify an appropriate `options.merge` implementation.

#### actions
*type*: `object`
*default*: `{}`

An object with action functions. The signature of an action function is `({ get, set, dispatch }, payload)`. If you provide nested action objects or other structure, make sure to also specify an appropriate `options.evolve` implementation to handle your actions appropriately.

#### options.merge
*type*: `function`

A function called on each `set(update)` to merge the update into the state. The function signature is `(state, update) => state'`. The default implementation is a deep merge.

#### options.evolve
*type*: `function`

A function that receives all of the dispatched action objects and calls the action functions. The function signature is `(atom, action, actions)`. Note that `atom` in this place has an extra added function `set`, a function that is used to update the state, this function does not exist on the actual atom. The default implementation uses `action.type` to find the matching function in the `actions` object.

#### options.debug
*type*: `function | function[]`
*default*: `null`

A function that will be called on each action and state update. The function is passed an `info` object of shape `{ type, atom, action, sourceActions, prevState }`. Tiny atom comes with 2 built in debug functions `tiny-atom/log` and `tiny-atom/devtools`.

```js
createAtom({ count: 1 }, {
  increment: ({ get, set }, payload) => set({ count: get().count + payload }),
  inc: ({ dispatch }, payload) => dispatch('increment', payload)
})
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

For documentation on the set of react and preact components `<Consumer />` and `connect` see [react](https://qubitproducts.github.io/tiny-atom/using-with-react) or [preact](https://qubitproducts.github.io/tiny-atom/using-with-preact) docs.
