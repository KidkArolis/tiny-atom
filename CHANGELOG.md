## 2.0.0

A pretty major refactor of tiny-atom. The core concepts haven't changed, but the API and React/Preact bindings have been updated.

The main change is that `split` has been .. split into `set` and `dispatch`. This makes for more intuitive and more readable API. The action signatures are now updated to:

```
createAtom({ count: 0 }, {
  increment: ({ get, set, dispatch }, payload) => {}
})
```

React and Preact bindings have been refactored to be more consistent, performant and convenient. Support for the old React context API that is planned for removal in React 17 has been dropped.

```
const createContext = require('tiny-atom/react')
const { Provider, Consumer, connect } = createContext(atom)
```

The core API has changed to only allow a single signature `createAtom(initialState, actions, options)` where `evolve` can only be passed as an option now.

Breaking changes

* Use new React's context API in both React and Preact bindings
* The new Provider rerenders relevant connected components
* Connect applies an optimisation and only rerenders if mapped state changed
* Move `evolve` to options
* Remove `tiny-atom/immutable` - out of scope for tiny-atom
* Remove `render` prop and only allow children prop

## 1.2.0

* `tiny-atom/react/context`
* `createAtom(initialState, actions, options)`
* `atom.fuse(state, actions)`
* `tiny-atom/immutable`
* `tiny-atom/raf`
* `tiny-atom/deep-merge`
* New examples - scoped slices of atom, modular atom, fractal atom

## 1.1.0

* In addition to `ConnectAtom` render prop style component, you can now also connect your components to the store using the `connect` HOC function. Import from `import { connect } from 'tiny-atom/react'` or `import { connect } from 'tiny-atom/preact'`
* In addition to being able to pass a `render` prop to `ConnectAtom`, you can now also pass the render function as children: `<ConnectAtom>{(state, split) => {}}</ConnectAtom>`

## 1.0.1

* Accept falsey action payloads such as `0` or `false`

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
