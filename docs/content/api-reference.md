---
title: API reference
---

### `createAtom(initialState, evolve, render, options)`

Create an atom.

* `initialState` - defaults to `{}`
* `evolve(get, split, action)` - receives actions and controls the evolution of the state
  * `get()` - get current state
  * `split(update)` or `split(type, payload)` - see `atom.split`
  * `action` - an object of shape `{ type, payload }`
* `render(atom)` - called on each state update
* `options`
  * `debug(info)` - called on each `action` and `update` with `{ type, atom, action, sourceActions, prevState }`
  * 'merge(state, update)' - called each time `split(update)` is called. Default implementation is `(state, update) => Object.assign({}, state, update)`. You can use this hook to use a different data structure for your state, such as Immutable. Or you could use it to extend the state instead of cloning with `Object.assign(state, update)` if that makes performance or architectural difference.

### `atom.get`

Returns current state.

### `atom.split`

Can be used in 2 ways:

* `atom.split(type, payload)` - send an action to `evolve`.
* `atom.split(update)` - update the state with the `update` object, doesn't go via `evolve`.
