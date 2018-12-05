<h5 align="center">Pragmatic and concise state management.</h5>
<br />

* single store modified via actions
* tiny api - easy to understand, easy to adapt
* tiny size - 1KB, or 2KB with (p)react bindings
* react and preact bindings included
* react hooks support
* highly optimised with batched rerenders
* beautiful console logger
* redux devtools integration

## Installation

    npm install tiny-atom

## Example

```js
import createAtom from 'tiny-atom'

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

## React Example

Provide the store:

```js
import React from 'react'
import ReactDOM from 'react-dom'
import createAtom from 'tiny-atom'
import { Provider } from 'tiny-atom/react'

const atom = createAtom({ user: { name: 'Atom' } }, {
  message ({ get, set, swap, dispatch}, msg) {
    console.log(msg)
  }
})

ReactDOM.render((
  <Provider atom={atom}>
    <App />
  </Provider>
), document.querySelector('root'))
```

Connect using React hooks:

```js
import React from 'react'
import { useAtom, useActions } from 'tiny-atom/react/hooks'

export default function Hello () {
  const user = useAtom(state => state.user)
  const { message } = useActions()

  return (
    <button onClick={() => message('hi')}>{user.name}</button>
  )
}
```

Note: `connect` and `<Consumer />` are also available, see [react docs](https://kidkarolis.github.io/tiny-atom/using-with-react).

**How is this different from redux?** The key differences are:

* Actions in tiny-atom are self contained units of business logic. They can read and update the state and dispatch other actions any number of times. This removes layers of boilerplate while preserving the benefits of redux like stores.
* Tiny-atom includes useful utilities to make it completely sufficient for building application of any size.
