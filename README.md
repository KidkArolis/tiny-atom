# tiny-atom

Minimalistic state management – 24 LOC.

## Usage

```js
const React = require('preact')
const createAtom = require('tiny-atom') // not on npm yet!

const atom = createAtom({ count: 0 }, reduce, render)

function reduce (get, set, action) {
  const state = get()
  const { type, payload } = action

  if (type === 'increment') {
    // mutate – performant if you need to avoid GC
    state.count += payload
    set(state)

    // or don't mutate – performant if you want to avoid subtree rerenders
    set({ count: state.count + payload })

    // or do it async
    setTimeout(() => {
      set({ count: get().count + payload })
    }, 1000)
  }
}

function App ({ atom, split }) {
  return <div>
    <h1>count is {atom.count}</h1>
    <button onclick={onclick}>Increment</button>
  </div>

  function onclick () {
    split('increment', 1)
  }
}

function render () {
  React.render(<App atom={atom.get()} split={atom.split} />, document.body, document.body.lastChild)
}

render()
```
