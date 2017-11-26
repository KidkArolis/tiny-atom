---
title: Async actions
---

Async action API in **Tiny Atom** is probably the key differentiator from other state management libraries out there. **Tiny Atom** simply avoids any kidn of ceremony around this concept. Async actions work exactly the same as sync actions.

An example of regular action:

```js
const actions = {
  increment: (get, split, payload) {
    split({ count: get().count + 1 })
  }
}
```

And here's how an async action looks like:

```js
const actions = {
  fetchMetrics: async (get, split) {
    split({ loading: true })
    try {
      const res = await axios.get('/metrics')
      split({ loading: false, metrics: res.data })
    } catch (err) {
      split({ loading: false, error: err.message })
      split('trackError', err)
    }
  }
}
```

The trick is you can use `split` in your action as many times as you need. This approach helps keep all business logic self contained.
