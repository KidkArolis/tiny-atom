<h5 align="center">Pragmatic and concise state management.</h5>
<br />

* single store modified via actions
* tiny api - easy to understand, easy to adapt
* tiny size - 1KB
* react and preact bindings included
* react and preact debug mode for identifying re-renders
* beautiful console logger
* redux devtools integration

## Installation

    npm install tiny-atom

## Example

```js
const createAtom = require('tiny-atom')

const atom = createAtom({ unicorns: 0, rainbows: [] }, {
  incrementUnicorns ({ get, set }, n) {
    set({ unicorns: get().unicorns + n })
  },

  async fetchRainbows ({ set, dispatch }) {
    set({ loading: true })
    const { data: rainbows } = await axios.get('/api/rainbows')
    set({ rainbows, loading: false })
    dispatch('incrementUnicorns', 1)
  }
})

atom.observe((atom) => {
  console.log('atom', atom)
  const { rainbows, unicorns } = atom.get()
  render(unicorns).onClick(e => atom.dispatch('incrementUnicorns', 10))
})
```

**How is this different from redux?** The key differences are:

* actions in tiny-atom can read and update the state and dispatch other actions. Actions are self contained units of business logic. This removes layers of boilerplate while preserving the benefits of redux like stores.
* tiny-atom includes useful utilities to make it completely sufficient for building application of any size.
