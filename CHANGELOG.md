## 0.5.0

* **BREAKING** Change `createAtom(initialState, evolve, render, merge)` -> `createAtom(initialState, evolve, render, options)`. Two options available - `merge` and `debug`.
* **BREAKING** `render` callback no longer gets `details` passed to it, use the `debug` hook instead. Render is only called when state is updated, `debug` is called on both actions and updates.
* Bundled logger via `{ debug: require('tiny-atom/log') }`.
* Redux devtools via `{ debug: require('tiny-atom/devtools') }`.
* Preact bindings `const { ProvideAtom, ConnectAtom } = require('tiny-atom/preact')`.
* Add MIT license.

## 0.4.0

* Change `evolve(get, set, action)` -> `evolve(get, split, action)`. Means actions can now split other actions.
* Allow custom `merge(prev, next)` function via 4th `createAtom` argument.

## 0.3.0

* Rename `reduce` -> `evolve` and `onChange` -> `render`. Trying to make the api more intuitive.
* Pass `details` object to `render` for debugging/logging.

## 0.2.0

* **BREAKING** Pass `atom` instead of `state` to `onChange`. Makes it easier to propagate atom's `{ get, split }` to the rendered components.

## 0.1.0

* Flux ftw.
