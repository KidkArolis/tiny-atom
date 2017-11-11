---
title: Using with preact
---

### Preact example

```js
const Preact = require('preact')
const createAtom = require('tiny-atom')

const atom = createAtom({ count: 0 }, evolve, render)

function evolve (get, split, action) {
  const state = get()
  const { type, payload } = action

  if (type === 'increment') {
    // sync
    split({ count: state.count + payload })

    // or do it async
    setTimeout(() => {
      split({ count: get().count + payload })
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
  Preact.render(<App atom={atom.get()} split={atom.split} />, document.body, document.body.lastElementChild)
}

render()
```