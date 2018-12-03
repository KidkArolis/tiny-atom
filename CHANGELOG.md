## 3.4.1

* **Fix** support for react-native by improving the check for server environment. Previously react-native was treated as server side rendering scenario and the connectors wouldn't subscribe to the store by default.

## 3.4.0

* **Improvement** - It's now possible to turn on the default behaviour of subscribing to the store by setting `observe: false` when connecting.
* **Fix** - Don't `observe` atom by default in server environment to avoid memory leaks in case the atom instance is being reused.

## 3.3.0

* **Improvement** - Avoid recomputing bound actions if the action list hasn't changed.
* **Fix** - The rerendering ordering introduced in the previous release wasn't working with newly added nested connected components due to how componentDidMount is called inside out. This version simplifies the code and the component render tree by subscribing to store changes via `render`. This actually reverts the `{ after }` option introduced in the previous version – yay for removing things!
* **Fix** - When jumping back in time with the devtools, correctly restore the state by using `{ replace: true }` to bypass deep merging.

## 3.2.0

* **Improvement** - Ensure the order of observations and rerenders of all connected components is always top down. This is done by adding a new feature to `atom.observe(fn, { after })`. The `after` can specify another listener function.
* **Improvement** - Avoid checking shouldComponentUpdate twice in case the mapped state hasn't changed.
* **Fix** - Name the Component produced by connect() in devtools for preact

## 3.1.0

* Calling set with replace option replaces the whole `set(state, { replace: true })` state. Useful when you need to bypass the default deep merge behaviour which can make it difficult to remove keys.

## 3.0.1

* Switch to using the official deep-diff package.

## 3.0.0

Improves upon the work started in 2.0.0.

Summary of changes:

* Version 3.0.0 brings back `<Provider />`, because it's a great way of wiring up the application lazily at runtime instead of at module export time.
* New logger, both `tiny-atom/log` and `tiny-atom/devtools` are now factory functions that need to be called to create the actual log function. This is so they could take options, e.g. `log({ diff: false })`. The new logger outputs simpler looking output, prints the diff of all the state changes and uses emojis 🙌!
* New debug mode for preact/react `<Consumer />` and `connect()` that logs details on why connected components rerender. This should help greatly with optimising the application to avoid needless rerenders. Turn on by setting `debug` prop on the `Provider` or `Consumer`, e.g. `<Provider debug />`.
* Nicer, more realistic examples!

## 2.0.0

A major refactor of tiny-atom's codebase and API.

The main change is that `split` has been .. split into `set` and `dispatch`. This makes for more intuitive and more readable API. The action signatures are now updated to:

```js
createAtom({ count: 0 }, {
  increment: ({ get, set, dispatch }, payload) => {}
})
```

React and Preact bindings have been refactored to be more consistent, performant and convenient. Support for the old React context API that is planned for removal in React 17 has been dropped. In fact, all use of the context API has been removed. The connectors connect to the atom directly. This makes the API very similar to how you'd use React's new context API. And also, this means that instead of rerendering the entire application top down, the new API encourages to render the app only once and let the individual components anywhere in the tree listen to their own changes. This is done efficiently by debouncing the changes to only rerender at most once per frame and. The components also avoid needless rerendering if the parent has already rerendered it as part of the change. Finally, this new connectors API means that deeply nested components connected to state will update, even if the parent component is optimised with shouldComponentUpdate.

```js
const createConnector = require('tiny-atom/react')
const { Consumer, connect } = createConnector(atom)
```

The core API has changed to only allow a single signature `createAtom(initialState, actions, options)` where `evolve` can only be passed as an option now.

Summary of changes:

* React and Preact bindings have been rewritten.
* Remove The ProvideAtom, ConnectAtom components.
* Create a new connector API `const { Consumer, connect } = createConnector(atom)`.
* Connect applies an optimisation and only rerenders if mapped state changed.
* Atom observer functions are now pushed to the start of the array reversing the order that on change listeners are called.
* Add ability to pass array to  `options.debug`, e.g. `debug: [log, devtools]`
* Move `evolve` to options.
* Remove `tiny-atom/deep-merge` - it's now the default merge behavior.
* Remove `tiny-atom/immutable` - out of scope for tiny-atom.

## 1.2.0

* `tiny-atom/react/context`
* `createAtom(initialState, actions, options)`
* `atom.fuse(state, actions)`
* `tiny-atom/immutable`
* `tiny-atom/raf`
* `tiny-atom/deep-merge`
* New examples - scoped slices of atom, modular atom, fractal atom

## 1.1.0

* In addition to `ConnectAtom` render prop style component, you can now also connect your components to the store using the `connect` HOC function. Import from `import { connect } from 'tiny-atom/react'` or `import { connect } from 'tiny-atom/preact'`.
* In addition to being able to pass a `render` prop to `ConnectAtom`, you can now also pass the render function as children: `<ConnectAtom>{(state, split) => {}}</ConnectAtom>`.

## 1.0.1

* Accept falsey action payloads such as `0` or `false`

## 1.0.0

* No change.

## 0.6.0

* Add `const dispose = atom.observe(atom => {})` - useful when passing atom around. Allows for separation of concerns where a self contained module can depend on atom changes as well as update atom.
* **BREAKING** A real edge case, but `render` can't be passed as null anymore in combination with `options`. Instead of `createAtom(initialState, evolve, null, options)` do `createAtom(initialState, evolve, options)`.

## 0.5.1

* Update docs and README.

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
