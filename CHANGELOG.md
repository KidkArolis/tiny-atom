## 1.0.0

* No change.

## 0.6.0

* Add `const dispose = atom.observe(atom => {})` - useful when passing atom around. Allows for separation of concerns where a self contained module can depend on atom changes as well as update atom.
* **BREAKING** A real edge case, but `render` can't be passed as null anymore in combination with `options`. Instead of `createAtom(initialState, evolve, null, options)` do `createAtom(initialState, evolve, options)`

## 0.5.1

* Updated docs and README

## 0.5.0

* **BREAKING** Change `createAtom(initialState, evolve, render, merge)` -> `createAtom(initialState, evolve, render, options)`. Two options available - `merge` and `debug`.
* **BREAKING** `render` callback no longer gets `details` passed to it, use the `debug` hook instead. Render is only called when state is updated, `debug` is called on both actions and updates.
* Bundled logger via `{ debug: require('tiny-atom/log') }`.
* Redux devtools via `{ debug: require('tiny-atom/devtools') }`.
* Preact bindings `const { ProvideAtom, ConnectAtom } = require('tiny-atom/preact')`.
* React bindings `const { ProvideAtom, ConnectAtom } = require('tiny-atom/react')`.
* Docs site.
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
