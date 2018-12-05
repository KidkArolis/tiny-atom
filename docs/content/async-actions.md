---
title: Async actions
---

Async action API in **Tiny Atom** is probably the key differentiator from other state management libraries out there. Each action function can read and modify state multiple times and even dispatch other actions. Async actions work exactly the same as sync actions.

An example of regular action:

```js
const actions = {
  increment ({ get, dispatch }, payload) {
    set({ count: get().count + 1 })
  }
}
```

And here's how an async action looks like:

```js
const actions = {
  async fetchMetrics ({ get, set, dispatch }) {
    set({ loading: true })
    try {
      const { data } = await axios.get('/metrics')
      set({ loading: false, metrics: data })
    } catch (err) {
      set({ loading: false, error: err.message })
      dispatch('showError', err)
    }
  }
}
```

The trick is you can use `get`, `set`, `swap` and `dispatch` in your action as many times as you need. This approach helps keep all business logic self contained, when performing complex state transitions.
