<h1 align="center">
  <br>
  <img src="https://user-images.githubusercontent.com/324440/32469476-cf1a8918-c34a-11e7-8ad2-c7a0c33d373c.png" alt="tiny atom logo" title="tiny atom logo" width='140px'>
  <br>
  <br>
</h1>

<h5 align="center">Pragmatic and concise state management.</h5>
<br />

<p align="center">
  <a href="https://www.npmjs.com/package/tiny-atom">
    <img src="https://img.shields.io/npm/v/tiny-atom.svg" alt="npm" />
  </a>
  <a href="http://img.badgesize.io/https://cdn.jsdelivr.net/npm/tiny-atom/index.min.js?compression=gzip">
    <img src="http://img.badgesize.io/https://cdn.jsdelivr.net/npm/tiny-atom/index.min.js?compression=gzip" alt="size" />
  </a>
  <a href="https://travis-ci.org/KidkArolis/tiny-atom">
    <img src="https://travis-ci.org/KidkArolis/tiny-atom.svg?branch=master" alt="Build Status" />
  </a>
  <a href="https://github.com/standard/standard">
    <img src="https://img.shields.io/badge/code_style-standard-brightgreen.svg" alt="code style: standard" />
  </a>
</p>

- store modified via actions
- can be used as global store or local component state
- out of the box support for React and Preact
- first class React hooks support
- highly optimised with batched rerenders
- beautiful console logger
- battle tested and hardened

**How is this different from redux?** The key differences are:

- Actions in tiny-atom are self contained units of business logic. They can read and update the state and dispatch other actions any number of times. This removes layers of boilerplate while preserving the benefits of redux like stores.
- Tiny-atom includes useful utilities to make it completely sufficient for building application of any size.

## Installation

    $ npm install tiny-atom

## Docs

Read the [full docs](https://kidkarolis.github.io/tiny-atom) or pick one of the highlights:

- [Basics](https://kidkarolis.github.io/tiny-atom/basics)
- [Prior art](https://kidkarolis.github.io/tiny-atom/prior-art)
- [Using with React](https://kidkarolis.github.io/tiny-atom/using-with-react)
- [Using with Preact](https://kidkarolis.github.io/tiny-atom/using-with-preact)
- [API Reference](https://kidkarolis.github.io/tiny-atom/api-reference)

## Example

```js
import createAtom from 'tiny-atom'

const atom = createAtom(
  { unicorns: 0, rainbows: [] },
  {
    incrementUnicorns({ get, set }, n) {
      set({ unicorns: get().unicorns + n })
    },

    async fetchRainbows({ set, actions }) {
      set({ loading: true })
      const { data: rainbows } = await axios.get('/api/rainbows')
      set({ rainbows, loading: false })
      actions.incrementUnicorns(1)
    }
  }
)

atom.observe(atom => {
  console.log('atom', atom)
  const { rainbows, unicorns } = atom.get()
  render(unicorns).onClick(e => atom.actions.incrementUnicorns(10))
})
```

## React Example

Provide the store:

```js
import React from 'react'
import ReactDOM from 'react-dom'
import createAtom from 'tiny-atom'
import { Provider } from 'tiny-atom/react'

const atom = createAtom(
  { user: { name: 'Atom' } },
  {
    message({ get, set, swap, actions }, msg) {
      console.log(msg)
    }
  }
)

ReactDOM.render(
  <Provider atom={atom}>
    <App />
  </Provider>,
  document.querySelector('root')
)
```

Connect using React hooks:

```js
import React from 'react'
import { useAtom, useActions } from 'tiny-atom/react/hooks'

export default function Hello() {
  const user = useAtom(state => state.user)
  const { message } = useActions()

  return <button onClick={() => message('hi')}>{user.name}</button>
}
```

## API

### `createAtom(initialState, actions, options)`

Create an atom.

#### initialState

_type_: `any`
_default_: `{}`

The initial state of the atom.

#### actions

_type_: `object`
_default_: `{}`

An object with action functions. The signature of an action function is `({ get, set, swap, actions, dispatch }, payload)`. If you provide nested action objects or other structure, make sure to also specify an appropriate `options.evolve` implementation to handle your actions appropriately.

- `get()` - returns the current state
- `set(patch)` - updates the state with the patch object by merging the patch using `Object.assign`
- `swap(state)` - replace the entire state with the provided one
- `dispatch` - same as `atom.dispatch`, dispatches an action
- `actions` - actions prebound to dispatch, i.e. actions.increment(1) is equivalent to dispatch('increment', 1)

#### options.evolve

_type_: `function`

A function that receives all of the dispatched action objects and calls the action functions. The function signature is `(atom, action, actions)`. Note that `atom` in this place has an extra added function `set`, a function that is used to update the state, this function does not exist on the actual atom. The default implementation uses `action.type` to find the matching function in the `actions` object.

#### options.debug

_type_: `function | function[]`
_default_: `null`

A function that will be called on each action and state update. The function is passed an `info` object of shape `{ type, atom, action, sourceActions, prevState }`. Tiny atom comes with 2 built in debug functions `tiny-atom/log` and `tiny-atom/devtools`.

```js
createAtom(
  { count: 1 },
  {
    increment: ({ get, set }, payload) => set({ count: get().count + payload }),
    inc: ({ actions }, payload) => actions.increment(payload)
  }
)
```

### `atom.get()`

Get current state.

```js
atom.get()
atom.get().feed.items
```

### `atom.set(update)`

Update state by shallowly merging an update.

```js
atom.set({ user })
atom.set({ entities: { ...get().entities, posts } })
```

### `atom.swap(state)`

Replace the entire state with the provided one.

```js
atom.swap(nextState)
```

### `atom.dispatch(type, payload)`

Send an action

```js
atom.dispatch('fetchMovies')
atom.dispatch('increment', 5)
```

### `atom.actions`

A map of prebound actions. For example, if your actions passed to atom are

```js
const actions = {
  increment({ get, set }) {
    const { count } = get()
    set({ count: count + 1 })
  }
}
```

They will be bound such that calling `atom.actions.increment(1)` dispatches action with `dispatch('increment', 1).

### `atom.observe(cb)`

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
  star: ({ get, set }) =>
    set({
      project: { starred: true }
    })
}

atom.fuse(state, actions)
```

## React / Preact bindings

For documentation on the set of react and preact components `<Provider />`, `<Consumer />`, `connect`, `useAtom`, `useActions` and `useDispatch` see [react](https://kidkarolis.github.io/tiny-atom/using-with-react) or [preact](https://kidkarolis.github.io/tiny-atom/using-with-preact) docs.
