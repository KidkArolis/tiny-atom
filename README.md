<p align="center">
  <br>
  <img src="https://user-images.githubusercontent.com/324440/32469476-cf1a8918-c34a-11e7-8ad2-c7a0c33d373c.png" alt="tiny-atom logo" title="tiny-atom logo" width='140px'>
  <br>
  <br>
</p>

> 🏄 global store for sharing application state easily<br />
> ⚡️ highly optimised subscriptions and selectors<br />
> ⚛️ supports React and Preact<br />

## History

Created in 2017, Tiny Atom aimed to offer:

- A streamlined and user-friendly alternative to Redux
- Compatibility with both React and Preact
- Efficient re-rendering.

Tiny Atom achieved enhanced efficiency through:

- Batching multiple state changes within a request animation frame
- Tracking and deduping nested subscription updates
- Re-rendering only when there's a change in the computed state selection.

However, with the introduction of [`useSyncExternalStore`](https://react.dev/reference/react/useSyncExternalStore), React now inherently encompasses the first two aforementioned optimizations. At the same time the global state approach has been slowly falling out of fashion in favor of using higher level state abstractions like Suspense, Relay, React Query and most recently React Server Components as well as more atomic and modular strategies such as Recoil.

Although tiny-atom remains a robust and battle tested solution, it's worth considering contemporary alternatives. For instance, [Zustand](https://github.com/pmndrs/zustand) embodies similar global store concepts in a more modern package. Meanwhile, [Kinfolk](https://github.com/KidkArolis/kinfolk) is a spiritual successor to tiny-atom offering more streamlined and powerful alternative for managing shared application state.

## Installation

```sh
npm install tiny-atom
```

## Example

```jsx
import React, { useState } from 'react'
import { createAtom, Provider, useSelector, useActions } from 'tiny-atom'

const atom = createAtom({
  state: {
    user: null,
    err: null,
  },

  actions: {
    // perform async work in the actions!
    async auth({ get, set, actions }) {
      // read and write state multiple times
      // within a single action invocation!
      if (get().user) return

      const token = localStorage.getItem('access-token')
      const { user } = await fetch('/authenticate', { token })
        .then((res) => res.json())
        .catch((err) => set({ err }))

      // update atom or dispatch other actions!
      set({ user })
      actions.log()
    },
    log({ get }) {
      console.log(get().user.name)
    },
  },
})

export default function App() {
  return (
    <Provider atom={atom}>
      <Dashboard />
    </Provider>
  )
}

function Dashboard() {
  // actions are functions, no string constants!
  const { auth } = useActions()

  // subscribe to slices of state, derive state
  // only re-renders if the keys of the selected
  // object differ!
  const { user, err } = useSelector((state) => {
    return { user: state.user, err: state.err }
  })

  useEffect(() => {
    auth()
  }, [])

  if (!user) return <div>Loading</div>
  if (err) return <div>Yikes</div>
  return <div>Hello, {user.name}</div>
}
```

## API

### `createAtom(options)`

Create an atom. Options:

```js
{
  state?: any;
  actions?: { [actionName: string]: ActionFunction };
  evolve?: (atom: Atom, action: any, actions: { [actionName: string]: ActionFunction }) => void;
  bindActions?: (dispatch: DispatchFunction, actions: { [actionName: string]: ActionFunction }) => void;
  debug?: DebugFunction;
}

```

#### state

The initial state of the atom. Default: `{}`.

#### actions

An object with action functions. Where every action is `(params, payload) => void` with params:

- `get()` - get the current state
- `set(patch)` - updates the state with the patch object by merging the patch using `Object.assign`
- `swap(state)` - replace the entire state with the provided one
- `dispatch(type, payload)` - same as `atom.dispatch`, dispatches an action
- `actions` - actions prebound to dispatch, i.e. `actions.increment(1)` is equivalent to `dispatch('increment', 1)`

#### evolve

```js
(atom, action, actions) => void
```

A reducer function that receives every dispatched action payload and calls the appropriate action function. The default implementation uses `action.type` to find the matching function in the `actions` object. Think of it as a place of setting up middleware or customising how actions get dispatched in the specific tiny-atom instance.

#### bindActions

```js
(dispatch, actions) => void;
```

A complementary function to evolve that binds the provided actions to `atom.dispatch`. Together with evolve it allows customising how actions get dispatched in the specific tiny-atom instance.

#### debug

A function that will be called on each action and state update. The function is passed an `info` object of shape `{ type, atom, action, sourceActions, prevState }`. Tiny-atom comes with 2 built in debug functions `tiny-atom/log` and `tiny-atom/devtools`.

### `atom.get()`

Get current state.

```js
atom.get()
atom.get().feed.items
```

### `atom.set(patch)`

Update state by shallowly merging an update.

```js
atom.set({ user })
atom.set({ entities: { ...get().entities, posts } })
```

### `atom.swap(state)`

Replace the entire state with the provided value.

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

A map of actions that are bound to the dispatch. For example, if your actions passed to atom are

```js
const actions = {
  increment({ get, set }) {
    const { count } = get()
    set({ count: count + 1 })
  },
}
```

They will be bound such that calling `atom.actions.increment(1)` dispatches action with `dispatch('increment', 1)`.

### `atom.observe(cb)`

Register a callback that triggers when the atom changes. The function returns an 'unobserve' function to unregister the callback

```js
const unobserve = atom.observe(render)
atom.observe((atom) => render(atom.get(), atom.actions))
```

### `atom.fuse({ state, actions })`

Extend atom's state and the action object. Used for creating a combined atom from multiple slices of state and actions from several modules.

```js
const state = {
  project: { name: 'tiny-atom' },
}

const actions = {
  star: ({ get, set }) => {
    set({ project: { starred: true } })
  },
}

// add extra state and actions to an existing atom instance
atom.fuse(state, actions)
```

## React API

### `<Provider atom={atom} />`

Provide atom instance created using `createAtom` as context to the render tree.

### `useAtom()`

Get atom instance provided by the Provider. Note: typically you should prefer using `useSelector` and `useActions` instead of using atom directly.

### `useSelector(selectorFn, options)`

Select a slice of state and subscribed to state changes. Full state is passed to `selectorFn` where any computed value can be returned. The component will only re-render if the computed value differs by shallowly comparing every key of the previous and updated computed object.

Options:

#### sync

_type_: `boolean`
_default_: `false`

By default, the change listeners are debounced such that at most one render occurs per frame. Set to true to re-render immediately on change state.

#### observe

_type_: `boolean`
_default_: `true` in the browser, `false` on the server

Use this to control if the hook should subscribe to the store and re-renders on every change or simply projects the state on parent re-renders, but does not re-render on state changes.

### `useActions()`

Get the bound actions.

```js
const { increment, decrement } = useActions()
```

### `useDispatch()`

Get the dispatch function.

```js
const dispatch = useDispatch()
dispatch('increment')
dispatch('increment', { by: 5 })
```

#### `createContext()`

By default, `useSelector` and `useActions` are bound to the default tiny-atom context that is shared across the app. Use this to create an isolated context. Note: you will need to create a dedicated set of hooks using `createHooks(AtomContext)`.

```js
const { AtomContext, Provider } = createContext()
```

#### `createHooks(AtomContext)`

Create custom set of hooks tailored for a specific context.

```js
const { AtomContext, Provider } = createContext()
const { useSelector, useActions } = createHooks(AtomContext)
```

## React HOC API

Before the widespread use of React hooks, Tiny Atom utilized the Higher Order Component (HOC) pattern. The following functions enable the use of tiny-atom with this pattern.

### `connect`

```jsx
const map = (state) => ({ count: state.count })
const ConnectedComponent = connect(map, options)(Component)
```

Connects a component to atom and re-renders it upon relevant changes. Connected component will be passed an `action` props with the atom's actions and the mapped props (the props returned in the `map` function).

#### map

_type_: `function`
_default_: `null`

Map atom state to props for your component. Upon changes to atom, the mapped props are compared to the previously mapped props and the connected component is only re-rendered if they differ. A shallow object diff is used in the comparison.

#### options.sync

_type_: `boolean`
_default_: `false`

By default, the change listeners are debounced such that at most one render occurs per frame. Set to true to re-render immediately on change state.

#### options.observe

_type_: `boolean`
_default_: `true` in the browser, `false` on the server

Use this to control if the connector subscribes to the store or simply projects the state on parent re-renders.

### `<Consumer map={map} sync={sync} />`

A render props style component that can be used inline of your component's render function to map the state similarly to how `connect` works. It supports the following props.

#### map

_type_: `function`
_default_: `null`

Map atom state to props for your component. Upon changes to atom, the mapped props are compared to the previously mapped props and the connected component is only re-rendered if they differ. A shallow object diff is used in the comparison.

#### sync

_type_: `boolean`
_default_: `false`

By default, the change listeners are debounced such that at most one render occurs per frame. Set to true to re-render immediately on change state.

#### observe

_type_: `boolean`
_default_: `true` in the browser, `false` on the server

Use this to control if the connector subscribes to the store or simply projects the state on parent re-renders.

#### createConnect(AtomContext)

Create an isolated `connect` bound to a specific `AtomContext`.

#### createConsumer(AtomContext)

Create an isolated `<Consumer />` bound to a specific `AtomContext`.

## Preact API

For Preact, import `createAtom`, `Provider`, `Consumer` and `connect` from `tiny-atom/preact`. The hooks based API for Preact is not currently available.
