---
title: Using with Immutable.js
---

**Tiny Atom** works best when you don't mutate your state objects and instead update everything in an immutable manner.

By default, **Tiny Atom** shallowly clones and merges state updates into the existing state without mutating the previous state. To perform more complicated state updates, libraries such as [Zaphod](/using-with-zaphod) can be very helpful.

Another way to actually force immutability in your `atom` is to use an immutable data structure library such as [Immutable.js](https://facebook.github.io/immutable-js/). For this to work with **Tiny Atom** you'll have to pass a custom `initialState` and a custom `merge` function.

```js
const { Map } = require('immutable')
const createAtom = require('tiny-atom')

const merge = (state, update) => state.merge(update)
const atom = createAtom(initialState(), actions(), { merge })

const initialState = function () {
  return Map({ count: 0 })
}

function actions () {
  return {
    increment: ({ get, set }, action) => {
      const state = get()
      const count = state.get('count')
      const update = Map({ count: count + 1 })
      set(update)
    },

    decrement: ({ get, set }, action) => {
      const nextState = get().set('count', 5)
      set(nextState)
    }
  }
}
```
