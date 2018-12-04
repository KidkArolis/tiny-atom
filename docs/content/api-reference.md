---
title: API reference
---

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
