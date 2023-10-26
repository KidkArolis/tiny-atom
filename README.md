<p align="center">
  <br>
  <img src="https://user-images.githubusercontent.com/324440/32469476-cf1a8918-c34a-11e7-8ad2-c7a0c33d373c.png" alt="tiny-atom logo" title="tiny-atom logo" width='140px'>
  <br>
  <br>
</p>

- 🏄 global store for sharing application state easy and efficient
- ⚡️ highly optimised selectors and subscriptions
- ⚛️ supports React and Preact

## History

Tiny atom has been around and used in production since 2017. Back then it the goals of the project were:

- a more minimal and intuitive alternative to Redux
- support for both React and Preact
- efficient re-rendering

The efficiency in tiny-atom is achieved by:

- batching multiple state changes inside a request animation frame
- tracking and deduping nested subscription updates
- re-rendering only if computed state selection differs

More recently, with the introduction of `useSyncExternalStore` React now has the first two optimisations built in out of the box thus somewhat reducing the need for tiny-atom. At the same time the global state approach has been slowly falling out of fashion in favor of using higher level state abstractions like Suspense, Relay, React Query and even React Server Components and with more atomic, modular approaches such as Recoil.

While tiny-atom is very much production ready and battle tested you should also consider more modern alternatives such [Zustand]() that implements similar global store ideas in a more modern package or [Kinfolk]() - a spiritual successor to tiny-atom that provides a simpler and more powerful alternative for managing shared application state.

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
    return { user, err }
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

### `createAtom({ state, actions, ...options })`

Create an atom. Options:

#### state

_type_: `any`
_default_: `{}`

The initial state of the atom.

#### actions

_type_: `object`
_default_: `{}`

An object with action functions. The signature of an action function is `({ get, set, swap, actions, dispatch }, payload)`.

- `get()` - get the current state
- `set(patch)` - updates the state with the patch object by merging the patch using `Object.assign`
- `swap(state)` - replace the entire state with the provided one
- `dispatch` - same as `atom.dispatch`, dispatches an action
- `actions` - actions prebound to dispatch, i.e. actions.increment(1) is equivalent to dispatch('increment', 1)

#### evolve

_type_: `function`

A reducer function that receives every dispatched action payload and calls the appropriate action function. Function signature of evolve is `(atom, action, actions)`. The default implementation uses `action.type` to find the matching function in the `actions` object. Think of it as a place of setting up middleware or customising how actions get dispatched in the specific tiny-atom instance.

#### bindActions

_type_: `function`

A complementary function to evolve that binds the provided actions to `atom.dispatch`. Function signature of bindActions is `(dispatch, actions)`. Together with evolve it allows customising how actions get dispatched in the specific tiny-atom instance.

#### debug

_type_: `function | function[]`
_default_: `null`

A function that will be called on each action and state update. The function is passed an `info` object of shape `{ type, atom, action, sourceActions, prevState }`. Tiny-atom comes with 2 built in debug functions `tiny-atom/log` and `tiny-atom/devtools`.

### `atom.get()`

Get current state.

```js
atom.get()
atom.get().feed.items
```

### `atom.set(state)`

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

Register a callback for when atom changes. Returns the unobserve function.

```js
atom.observe(render)
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

Provide atom instance created using `createAtom` as context.

### `useAtom()`

Consume atom instance provided by the Provider.

### `useSelector(selectorFn, options)`

Select state.

Options:

### `useActions`

### `useDispatch`

#### options.pure

_type_: `boolean`
_default_: `true`

If the connection is `pure`, the mapped props are compared to previously mapped props for avoiding re-renders. Set this to false to re-render on any state change.

#### options.sync

_type_: `boolean`
_default_: `false`

By default, the change listeners are debounced such that at most one render occurs per frame. Set to true to re-render immediately on change state.

#### options.observe

_type_: `boolean`
_default_: `true` in the browser, `false` on the server

Use this to control if the connector subscribes to the store or simply projects the state on parent re-renders.

### `useActions()`

A React hook for getting your actions. The actions are already prebound to the dispatch of atom in context. Use destructuring to grab the specific actions needed.

```js
const { increment, decrement } = useActions()
```

### `useDispatch()`

Get the dispatch function.

#### `createContext()`

```js
const { AtomContext, Provider } = createContext()
```

#### `createHooks(AtomContext)`

Create custom set of hooks

## React HOC API

### `connect`

```jsx
connect(map, actions, options)(Component)
```

Connects a component to atom and re-renders it upon relevant changes.

#### map

_type_: `function`
_default_: `null`

Map atom state to props for your component. Upon changes to atom, the mapped props are compared to the previously mapped props and the connected component is only re-rendered if they differ. A shallow object diff is used in the comparison.

#### actions

_type_: `array | function`
_default_: `null`

An array of action names that will be turned into functions and passed via props or a function that takes dispatch and can return an object with functions that will be passed to the component.

#### options.pure

_type_: `boolean`
_default_: `true`

If the connection is `pure`, the mapped props are compared to previously mapped props for avoiding re-renders. Set this to false to re-render on any state change.

#### options.sync

_type_: `boolean`
_default_: `false`

By default, the change listeners are debounced such that at most one render occurs per frame. Set to true to re-render immediately on change state.

#### options.observe

_type_: `boolean`
_default_: `true` in the browser, `false` on the server

Use this to control if the connector subscribes to the store or simply projects the state on parent re-renders.

#### options.debug

_type_: `boolean`
_default_: `false`

Log information about changed props when this component re-renders. Useful when optimising the application to remove needless re-renders.

#### Example

```js
import { connect } from 'tiny-atom/react'

const map = (state) => {
  return {
    count: state.count,
  }
}

const actions = (dispatch) => {
  return {
    inc: (x) => dispatch('inc', x),
    dec: (x) => dispatch('dec', x),
  }
}

// or
const actions = ['inc', 'dec']

export default connect(map, actions, options)(Component)
```

### `<Consumer />`

A render props style component that can be used inline of your component's render function to map the state similarly to how `connect` works. It supports the following props.

#### map

_type_: `function`
_default_: `null`

Map atom state to props for your component. Upon changes to atom, the mapped props are compared to the previously mapped props and the connected component is only re-rendered if they differ. A shallow object diff is used in the comparison.

#### actions

_type_: `array | function`
_default_: `null`

An array of action names that will be turned into functions and passed via props or a function that takes dispatch and can return an object with functions that will be passed to the component.

#### pure

_type_: `boolean`
_default_: `true`

If the connection is `pure`, the mapped props are compared to previously mapped props for avoiding re-renders. Set this to false to re-render on any state change. **Note!** Children prop is also compared in this case and if you're using an inline render function, it will be different every time thus removing the benefits of setting `pure` to `true`.

#### sync

_type_: `boolean`
_default_: `false`

By default, the change listeners are debounced such that at most one render occurs per frame. Set to true to re-render immediately on change state.

#### debug

_type_: `boolean`
_default_: `false`

Log information about changed props when this component re-renders. Useful when optimising the application to remove needless re-renders.

#### displayName

_type_: `boolean`
_default_: `false`

When debug is true, you can set the displayName value to improve the debug log output. Without the displayName it would be difficult to identify component in the logs. This is only an issue when using `<Consumer />` since `connect()` knows the name of the connected component.

### Example

```js
import { Consumer } from 'tiny-atom/connect'

const map = (state) => {
  return {
    count: state.count,
  }
}

const actions = (dispatch) => {
  return {
    inc: (x) => dispatch('inc', x),
    dec: (x) => dispatch('dec', x),
  }
}

// or
const actions = ['inc', 'dec']

export default () => {
  ;<Consumer map={map} actions={actions}>
    {{ count, inc, dec }} => (<button onClick={inc}>{count}</button>)
  </Consumer>
}
```

#### createConsumer

#### createConnect

## Preact API

For Preact, import `createAtom`, `Provider`, `Consumer` and `connect` from `tiny-atom/preact`. The hook based API for Preact is not currently available.
