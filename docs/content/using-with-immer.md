---
title: Using with immer
---

**Tiny Atom** works best when you don't mutate your state objects and instead swap your state with a fresh copy.

By default, **Tiny Atom** shallowly clones and merges state updates into the existing state without mutating the previous state. To perform more complicated state updates, libraries such as [Zaphod](/tiny-atom/using-with-zaphod) can be very helpful.

Another really neat alternative to updating your state without mutating is enabled by a library called [immer](https://github.com/mweststrate/immer). Immer is using Proxies to keep track of changes you're making to the objects and then returns an efficiently cloned copy.

Let's look at how you'd use it with tiny-atom.

```js
const immer = require('immer')
const createAtom = require('tiny-atom')

const actions = {
  async fetchItem ({ get, set }, { id }) => {
    // using immer api! it's a callback where you can
    // mutate the state with regular js mutations
    // without actually mutating the original object
    set(state => {
      state.loading = true
    })

    try {
      const items = await fetch(`/items/${id}`)

      // immer makes it convenient to make multiple,
      // deep changes to your state
      set(state => {
        state.loading = false
        state.entities.items[item.id] = item
        state.feed.items.push(item.id)
      })
    } catch (err) {
      set(state => {
        state.loading = false
        state.error = 'Fetching failed'
      })
    }
  }
}

// immer's signature matches that of atom's merge option
const atom = createAtom({}, { actions }, { merge: immer })

atom.dispatch('fetchItems')
```
