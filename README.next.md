---
title: Tiny Atom V5
date: '2019-06-15'
---

## Intro

- store modified via actions
- can be used as global store or local component state
- out of the box support for React and Preact
- first class React hooks support
- highly optimised with batched rerenders
- beautiful console logger
- battle tested and hardened

* tiny-atom’s goal was always to allow very efficiently passing contextual data/state to the whole application
* in subscription based stores, which are stores that tell you when they changed via some .onChange(cb) - if you subscribe to the store in many components in your application, you need to make sure they re-render in the right order (parent first, then children, etc.)
* and you also need to make sure that that doesn’t cause redundant re-rendering, e.g. say parent component ’s onChange is called first, and causes a re-render, then if child component’s onChange is called right after (because of the same store change) you don’t want to re-render, since the parent cause that to happen already
* batching - so that for example 10 synchronous state changes would cause only 1 re-render instead of 10
* making sure that if selected state (computed by useSelector) did not change (that is store change is not relevant to this particular subscription), that component does not needlessly re-render

## Installation

\$ npm install tiny-atom

## createAtom

```js
import { createAtom, Provider } from 'tiny-atom'

const atom = createAtom({
  state: {
    user: null,
    route: null,
  },
  actions: {
    async auth({ set }) {
      const token = localStorage.getItem('access-token')
      const { user } = await fetch('/authenticate', { token }).then((res) => res.json())
      set({ user })
    },
  },
})

ReactDOM.render(
  <Provider atom={atom}>
    <App />
  </Provider>
)
```

## Provider

## useSelector

## useActions

## useStore - a complementary local component store

## logger - print messages with each set

## async actions - easy

## useStoreInstance

## preact support

## devtools

# Recipes

## Using with Immutable

## Using with zaphod

## Using with router

## Using with immer

# advanced usage (separate page per each)

## Consumer / connect

## createContext / createConsumer / createConnect

## custom evolve

## custom bindActions

## useDispatch

## Other

All in one store.
Combination of global store with local store using the same principles.
Support for async actions.

```js
import React, { useEffect } from 'react'
import ReactDOM from 'react-dom'
import { createAtom, Provider, useSelector, useActions } from 'tiny-atom'

const store = createAtom({
  state: { user: null },
  actions: {
    async authenticate({ set }) {
      const token = localStorage.getItem('access-token')
      const { user } = await fetch('/authenticate', { token }).then((res) => res.json())
      set({ user })
    },
  },
})

function App() {
  const user = useSelector((state) => state.user)
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

```js
import React, { useEffect } from 'react'
import ReactDOM from 'react-dom'
import { useStore } from 'tiny-atom'

export function User({ id }) {
  const [user, { fetchUser }] = useStore(() => ({
    state: { fetching: null, user: null },
    actions: {
      async fetchUser({ get, set }, id) {
        set({ fetching: id })
        const { user } = await fetch(`/users/${id}`).then((res) => res.json())
        if (user.id === get().fetching) {
          set({ user, fetching: false })
        }
      },
    },
  }))

  useEffect(() => {
    fetchUser(id)
  }, [id])

  return user ? <main>Hello, {user.firstName}</main> : null
}
```
