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
* react and preact bindings included
* react and preact debug mode for identifying re-renders
* beautiful console logger
* redux devtools integration

**How is this different from redux?** The key differences are:

* actions in tiny-atom can read and update the state and dispatch other actions. Actions are self contained units of business logic. This removes layers of boilerplate while preserving the benefits of redux like stores.
* tiny-atom includes useful utilities to make it completely sufficient for building application of any size.

## Installation

    $ npm install tiny-atom

## Docs

Read the [full docs](https://kidkarolis.github.io/tiny-atom) or pick one of the highlights:

  * [Basics](https://kidkarolis.github.io/tiny-atom/basics)
  * [Prior art](https://kidkarolis.github.io/tiny-atom/prior-art)
  * [Using with React](https://kidkarolis.github.io/tiny-atom/using-with-react)
  * [Using with Preact](https://kidkarolis.github.io/tiny-atom/using-with-preact)
  * [API Reference](https://kidkarolis.github.io/tiny-atom/api-reference)

## Example

```js
const createAtom = require('tiny-atom')

const atom = createAtom({ unicorns: 0, rainbows: [] }, {
  incrementUnicorns ({ get, set }, n) {
    set({ unicorns: get().unicorns + n })
  },

  async fetchRainbows ({ set, dispatch }) {
    set({ loading: true })
    const { data: rainbows } = await axios.get('/api/rainbows')
    set({ rainbows, loading: false })
    dispatch('incrementUnicorns', 1)
  }
})

atom.observe((atom) => {
  console.log('atom', atom)
  const { rainbows, unicorns } = atom.get()
  render(unicorns).onClick(e => atom.dispatch('incrementUnicorns', 10))
})
```


## API

### `createAtom(initialState, actions, options)`

Create an atom.

#### initialState
*type*: `any`
*default*: `{}`

The initial state of the atom.

#### actions
*type*: `object`
*default*: `{}`

An object with action functions. The signature of an action function is `({ get, set, dispatch }, payload)`. If you provide nested action objects or other structure, make sure to also specify an appropriate `options.evolve` implementation to handle your actions appropriately.

* `get()` - returns the current state
* `set(patch)` - updates the state with the patch object by merging the patch using `Object.assign`
* `swap(state)` - replace the entire state with the provided one
* `dispatch` - same as `atom.dispatch`, dispatches an action

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

### `atom.get()`

Get current state.

```js
atom.get()
atom.get().feed.items
```

### `atom.set(update)`

Update current state by merging the update shallowly.

```js
atom.set({ user })
atom.set({ entities: { ...entities, posts } })
```

### `atom.swap(state)`

Replace the state with the provided one.

```js
atom.swap(nextState)
```

### `atom.dispatch(type, payload)`

Send an action

```js
atom.dispatch('fetchMovies')
atom.dispatch('increment', 5)
```

### `atom.observe(cb`

Register a callback for when atom changes. Returns the unobserve function.

```js
atom.observe(render)
atom.observe(atom => render(atom.get(), atom.dispatch))
```

### `atom.fuse(state, actions)`

Extend atom's state and the action object. Convenient for composing atom from slices of state and actions from several modules.

```js
const state = {
  project: { name: 'tiny-atom' }
}

const actions = {
  star: ({ get, set }) => set({
    project: { starred: true }
  })
}

atom.fuse(state, actions)
```


## React / Preact bindings

For documentation on the set of react and preact components `<Provider />`, `<Consumer />` and `connect` see [react](https://kidkarolis.github.io/tiny-atom/using-with-react) or [preact](https://kidkarolis.github.io/tiny-atom/using-with-preact) docs.
