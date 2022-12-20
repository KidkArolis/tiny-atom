---
title: 'tiny-atom'
bref: React's context and state enhanced
draft: false
toc: true
---

- 🏄 can be used as a global store or as local component state
- ⚡️ optimised state selectors and batched subscriptions
- ⚛️ supports React and Preact

Tiny Atom can be used instead of or in addition to React's **context** and **state**.

It works similar to React's **context**, in that you can access parts of your atom anywhere in your application. It works similar to React's **state**, in that you can update your atom by calling actions and your application will rerender as the state changes.

Tiny Atom can be used as a **global store** or as **local component state**.

When using Tiny Atom as a **global store**, you will benefit from efficient subscriptions to a subset of the state. Components will only rerender if the specific slice of the state they care about changed. You will also benefit from containing the state transition logic in a set of actions, which can even be asynchronous. The latter also applies to using Tiny Atom as **local component state**.

## Installation

```sh
npm install tiny-atom
```

## Example

```jsx
import React, { useState } from 'react'
import { createAtom, Provider, useSelector, useActions } from 'tiny-atom'

export default function Root() {
  const [atom] = useState(() =>
    createAtom({
      state: {
        user: null,
        err: null
      },
      actions: {
        async auth({ get, set }) {
          if (get().user) return
          try {
            const token = localStorage.getItem('access-token')
            const res = await fetch('/authenticate', { token })
            const { user } = await res.json()
            set({ user })
          } catch (err) {
            set({ err })
          }
        }
      }
    })
  )

  return (
    <Provider atom={atom}>
      <App />
    </Provider>
  )
}

function App() {
  const { auth } = useActions()
  const { user, err } = useSelector(state => {
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

## Global store guide

This is a short step by step introduction in how you'd use the main features of `tiny-atom`.

### Create an atom

First, create your atom and inject it into the render tree using the `<Provider>` component.

```jsx
import React, { useState } from 'react'
import { createAtom, Provider, useSelector, useActions } from 'tiny-atom'

// initial state and actions
const state = {}
const actions = {}

export default function Root() {
  const [atom] = useState(() => createAtom({ state, actions }))

  return (
    <Provider atom={atom}>
      <App />
    </Provider>
  )
}
```

### Setup initial state and actions

In the previous state, we passed an empty `state` and `actions`. In this step we take a look at an example of how to setup some actions.

```jsx
const {
  // initial state
  state: {
    status: 'idle',
    user: null,
    err: null
  },

  // each action can be called by any
  // component to transition the state
  // and cause effects
  actions: {
    async auth({ get, set }) {
      // check if we already have a user
      if (get().status === 'ready') return

      // check if we're not already fetching
      if (get().status === 'fetching') return

      try {
        set({ status: 'fetching' })
        const token = localStorage.getItem('access-token')
        const res = await fetch('/authenticate', { token })
        const { user } = await res.json()
        set({ status: 'ready', user })
      } catch (err) {
        set({ status: 'error', err })
      }
    }
  }
}
```

**Tips 💡**

- Think of an action a bit like like a reducer and an effect in one. That is in an action you can perform effectful logic and update the state.
-

### useSelector

```jsx
function Component() {
  const { user } = useSelector(state => {
    return {
      user: state.user
    }
  })
  return <div>{state.user}</div>
}
```

**Tips 🎓**

- use `reselect` bla bla
- shallow comparison is performed to decide if this component needs rerendering

### useActions

```jsx
function Component() {
  const { updateLocation } = useActions()
  return <button onClick={updateLocation}>Update</button>
}
```

## API

### `createAtom(options)`

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

### `atom.set(state)`

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

## React API

### <Provider>

### `useSelector`

`useSelector(selector, options)`

### `useActions`

### `useDispatch`

### `useAtom`

### `useAtomContext`

A React hook for getting state from atom into your component. Rerenders upon relevant changes.

#### map

_type_: `function`
_default_: `null`

Map atom state to props for your component. Upon changes to atom, the mapped props are compared to the previously mapped props and the connected component is only rerendered if they differ. A shallow object diff is used in the comparison.

#### options.pure

_type_: `boolean`
_default_: `true`

If the connection is `pure`, the mapped props are compared to previously mapped props for avoiding rerenders. Set this to false to rerender on any state change.

#### options.sync

_type_: `boolean`
_default_: `false`

By default, the change listeners are debounced such that at most one render occurs per frame. Set to true to rerender immediately on change state.

#### options.observe

_type_: `boolean`
_default_: `true` in the browser, `false` on the server

Use this to control if the connector subscribes to the store or simply projects the state on parent rerenders.

#### Example

```js
import { useAtom } from 'tiny-atom/react/hooks'

export default function MyComponent() {
  const count = useAtom(state => state.count)
  return <div>{count}</div>
}
```

## `useActions()`

A React hook for getting your actions. The actions are already prebound to the dispatch of atom in context. Use destructuring to grab the specific actions needed.

### Example

```js
import { useActions } from 'tiny-atom/react/hooks'

export default function MyComponent() {
  const { increment, decrement } = useActions()
  return <button onClick={increment} />
}
```

### `useDispatch()`

A React hook for getting the dispatch function.

#### Example

```js
import { useDispatch } from 'tiny-atom/react/hooks'

export default function MyComponent() {
  const dispatch = useDispatch()
  return <button onClick={() => dispatch('increment')} />
}
```

### `connect`

```jsx
connect(
  map,
  actions,
  options
)(Component)
```

Connects a component to atom and rerenders it upon relevant changes.

#### map

_type_: `function`
_default_: `null`

Map atom state to props for your component. Upon changes to atom, the mapped props are compared to the previously mapped props and the connected component is only rerendered if they differ. A shallow object diff is used in the comparison.

#### actions

_type_: `array | function`
_default_: `null`

An array of action names that will be turned into functions and passed via props or a function that takes dispatch and can return an object with functions that will be passed to the component.

#### options.pure

_type_: `boolean`
_default_: `true`

If the connection is `pure`, the mapped props are compared to previously mapped props for avoiding rerenders. Set this to false to rerender on any state change.

#### options.sync

_type_: `boolean`
_default_: `false`

By default, the change listeners are debounced such that at most one render occurs per frame. Set to true to rerender immediately on change state.

#### options.observe

_type_: `boolean`
_default_: `true` in the browser, `false` on the server

Use this to control if the connector subscribes to the store or simply projects the state on parent rerenders.

#### options.debug

_type_: `boolean`
_default_: `false`

Log information about changed props when this component re-renders. Useful when optimising the application to remove needless re-renders.

#### Example

```js
import { connect } from 'tiny-atom/react'

const map = state => {
  return {
    count: state.count
  }
}

const actions = dispatch => {
  return {
    inc: x => dispatch('inc', x),
    dec: x => dispatch('dec', x)
  }
}

// or
const actions = ['inc', 'dec']

export default connect(
  map,
  actions,
  options
)(Component)
```

### `<Consumer />`

A render props style component that can be used inline of your component's render function to map the state similarly to how `connect` works. It supports the following props.

#### map

_type_: `function`
_default_: `null`

Map atom state to props for your component. Upon changes to atom, the mapped props are compared to the previously mapped props and the connected component is only rerendered if they differ. A shallow object diff is used in the comparison.

#### actions

_type_: `array | function`
_default_: `null`

An array of action names that will be turned into functions and passed via props or a function that takes dispatch and can return an object with functions that will be passed to the component.

#### pure

_type_: `boolean`
_default_: `true`

If the connection is `pure`, the mapped props are compared to previously mapped props for avoiding rerenders. Set this to false to rerender on any state change. **Note!** Children prop is also compared in this case and if you're using an inline render function, it will be different every time thus removing the benefits of setting `pure` to `true`.

#### sync

_type_: `boolean`
_default_: `false`

By default, the change listeners are debounced such that at most one render occurs per frame. Set to true to rerender immediately on change state.

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

const map = state => {
  return {
    count: state.count
  }
}

const actions = dispatch => {
  return {
    inc: x => dispatch('inc', x),
    dec: x => dispatch('dec', x)
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

## `<Provider />`

Injects atom into the context of the render tree.

#### atom

_type_: `object`

Your atom instance created by `createAtom`.

#### debug

_type_: `boolean`
_default_: `false`

Log information about changed props when all of the connected components re-render. Useful when optimising the application to remove needless re-renders.

### logger

Print messages with each set

### devtools

### HOC

Consumer / connect

## Guides

### You own hooks

createContext / createConsumer / createConnect

### Custom evolve

### Custom bindActions

## Other

All in one store.
Combination of global store with local store using the same principles.
Support for async actions.

```jsx
import React, { useEffect } from 'react'
import ReactDOM from 'react-dom'
import { createAtom, Provider, useSelector, useActions } from 'tiny-atom'

const store = createAtom({
  state: { user: null },
  actions: {
    async authenticate({ set }) {
      const token = localStorage.getItem('access-token')
      const { user } = await fetch('/authenticate', { token }).then(res => res.json())
      set({ user })
    }
  }
})

function App() {
  const user = useSelector(state => state.user)
  const { authenticate } = useActions()

  useEffect(() => {
    authenticate()
  })

  return user ? <main>Hello, {user.firstName}</main> : null
}

ReactDOM.render(
  <Provider store={store}>
    <App />
  </Provider>
)
```

Or if local component state is more appropriate:

```jsx
import React, { useEffect } from 'react'
import ReactDOM from 'react-dom'
import { useStore } from 'tiny-atom'

export function User({ id }) {
  const [user, { fetchUser }] = useStore(() => ({
    state: { fetching: null, user: null },
    actions: {
      async fetchUser({ get, set }, id) {
        set({ fetching: id })
        const { user } = await fetch(`/users/${id}`).then(res => res.json())
        if (user.id === get().fetching) {
          set({ user, fetching: false })
        }
      }
    }
  }))

  useEffect(() => {
    fetchUser(id)
  }, [id])

  return user ? <main>Hello, {user.firstName}</main> : null
}
```
