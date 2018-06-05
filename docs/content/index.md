<h5 align="center">Minimal, yet awesome, state management.</h5>
<br />

* single store modified via actions
* tiny api - easy to understand, easy to adapt
* tiny size - 1KB
+ react and preact bindings included
+ console logger and redux devtools integration

## Installation

    npm install --save tiny-atom@beta

## Example

```js
const createAtom = require('tiny-atom')

const atom = createAtom({
  clicks: 0,
  items: []
}, {
  countClicks: ({ get, set }, n) => {
    set({ clicks: get().clicks + n })
  },

  fetchItems: async ({ set, dispatch }) => {
    set({ loading: true })
    const { data: items } = await axios.get('/api/items')
    set({ items, loading: false })
    dispatch('countClicks', 1)
  }
})

atom.observe(function render (atom) {
  const { items, clicks } = atom.get()
  onClick(e => atom.dispatch('countClicks', 10))
})
```

**How is this different from redux?** The key difference is that action functions in tiny-atom can read and update the state and call other actions. Action functions are self contained units of business logic. This removes layers of boilerplate while preserving the benefits of redux like stores.
