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

## Installation

\$ npm install tiny-atom

## createStore

```js
import { createStore, Provider } from 'tiny-atom'

const store = createStore({
  state: {
    user: null,
    route: null
  },
  actions: {
    async auth({ set }) {
      const token = localStorage.getItem('access-token')
      const { user } = await fetch('/authenticate', { token }).then(res => res.json())
      set({ user })
    }
  }
})

ReactDOM.render(
  <Provider store={store}>
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
import { createStore, Provider, useSelector, useActions } from 'tiny-atom'

const store = createStore({
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
