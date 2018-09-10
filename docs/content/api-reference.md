---
title: API reference
---

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

* `get()` - returns the current state
* `set(patch, options)` - updates the state with the patch object by merging the patch using `options.merge` function. The default implementation is deep merge. Use `{ replace: true }` option to replace the state instead of merging in the patch.
* `dispatch` - same as `atom.dispatch`, dispatches an action.

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

### `atom.get()`

Get current state.

```js
atom.get()
atom.get().feed.items
```

### `atom.dispatch(type, payload)`

Send an action

```js
atom.dispatch('fetchMovies')
atom.dispatch('increment', 5)
```

### `atom.observe(cb, options)`

Register a callback for when atom changes. Returns the unobserve function.

```js
atom.observe(render)
atom.observe(atom => render(atom.get(), atom.dispatch))
```

The only option available is `after`. It's an advanced option for ordering the listeners. The value of `after` has to be a reference to another listener function that's already been registered as an observer.

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
