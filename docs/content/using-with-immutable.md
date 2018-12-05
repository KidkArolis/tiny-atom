---
title: Using with Immutable.js
---

**Tiny Atom** works best when you don't mutate your state objects and instead update everything in an immutable manner.

By default, **Tiny Atom** shallowly clones and merges state updates into the existing state without mutating the previous state. To perform more complicated state updates, libraries such as [Zaphod](/using-with-zaphod) can be very helpful.

Another way to actually force immutability in your `atom` is to use an immutable data structure library such as [Immutable.js](https://facebook.github.io/immutable-js/). For this to work with **Tiny Atom** you'll have to pass a custom `initialState` and use `swap` instead of `set` in your actions.

```js
import { Map } = from 'immutable'
import createAtom from 'tiny-atom'

const atom = createAtom(initialState(), actions())

const initialState = function () {
  return Map({ count: 0 })
}

function actions () {
  return {
    increment: ({ get, swap }, action) => {
      const state = get()
      const count = state.get('count')
      const update = Map({ count: count + 1 })
      swap(update)
    },

    decrement: ({ get, swap }, action) => {
      const nextState = get().set('count', 5)
      swap(nextState)
    }
  }
}
```
