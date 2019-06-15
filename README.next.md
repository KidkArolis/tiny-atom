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
