# tiny-atom

Minimal, yet awesome, state management.

## Usage

    $ yarn add tiny-atom

### Counter Example

```js
const createAtom = require('tiny-atom')

const atom = createAtom({ count: 0 }, evolve, render)

function evolve (get, set, action) {
  const state = get()
  const { type, payload } = action

  if (type === 'increment') {
    set({ count: state.count + payload })
  }

  if (type === 'asyncIncrement') {
    set({ loading: true })
    setTimeout(() => {
      set({ count: get().count + payload, loading: false })
    }, 1000)
  }
}

function render (atom, details) {
  console.log('change', {
    id: details.id,
    action: details.action,
    state: atom.get()
  })
}

atom.split({ count: 5 })
  // -> { count: 5 }
atom.split('increment', 5)
  // -> { count: 10 }
atom.split('asyncIncrement', 3)
  // -> { count: 10, loading: true }
atom.split('increment', 2)
  // -> { count: 12, loading: true }
  // -> 1 second later...
  // -> { count: 15, loading: false }
```

### Preact example

```js
const React = require('preact')
const createAtom = require('tiny-atom')

const atom = createAtom({ count: 0 }, evolve, render)

function evolve (get, set, action) {
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

## API

### `createAtom(initialState, evolve, render)`

Create an atom.

* `initialState` - should be an object, defaults to `{}`
* `evolve(get, set, action)` - a function that will receive actions and control the evolution of the state
  * `get()` - get current state
  * `set(update)` - extend the state with this new value
  * `action` - an object of shape `{ type, payload }`
* `render(atom, details)` - a function called on each state change
  * `atom` - atom itself
  * `details` - an object of shape { id, action }, purely for debugging

A note on `set` - when calling set in `evolve`, it extends the state using Object.assign. But if you'd like to mutate the object simply pass the same state object to `set` and it will record that as the new state.

### `atom.get`

Return current state.

### `atom.split`

Can be used in 2 ways:

* `atom.split(update)` - a shortcut to directly extend the state with the `update` object, doesn't go via `evolve`.
* `atom.split(type, payload)` – dispatch an action to `evolve`.
