---
title: Using with immer
---

**Tiny Atom** works best when you don't mutate your state objects and instead swap your state with a fresh copy.

By default, **Tiny Atom** shallowly clones and merges state updates into the existing state without mutating the previous state. To perform more complicated state updates, libraries such as [Zaphod](/tiny-atom/using-with-zaphod) can be very helpful.

Another neat alternative to updating your state without mutating is enabled by a library called [immer](https://github.com/mweststrate/immer). Immer is using Proxies to keep track of changes you're making to the objects and then returns an efficiently cloned copy.

Let's look at how you'd use it with tiny-atom.

```js
import rawImmer from 'immer'
import createAtom from 'tiny-atom'

const actions = {
  async fetchItem ({ get, immer }, { id }) => {
    // using immer api! it's a callback where you can
    // mutate the state with regular js mutations
    // without actually mutating the original object
    immer(state => {
      state.loading = true
    })

    try {
      const items = await fetch(`/items/${id}`)

      // immer makes it convenient to make multiple,
      // deep changes to your state
      immer(state => {
        state.loading = false
        state.entities.items[item.id] = item
        state.feed.items.push(item.id)
      })
    } catch (err) {
      immer(state => {
        state.loading = false
        state.error = 'Fetching failed'
      })
    }
  }
}

// use a custom evolver helper to inject a state bound immer into your actions
// this is entirely optional as you could just use immer directly in your actions
function evolve ({ get, set, swap, dispatch }, { type, payload }, actions) {
  const immer = fn => swap(rawImmer(get(), fn))
  actions[type]({ get, set, swap, immer, dispatch }, payload)
}

const atom = createAtom({}, { actions }, { evolve })

atom.dispatch('fetchItems')
```
