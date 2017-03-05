# tiny-atom

Minimal, yet awesome, state management.

## Usage

    $ yarn add tiny-atom

### Counter Example

```js
const createAtom = require('tiny-atom')

const atom = createAtom({ count: 0 }, reduce, onChange)

function reduce (get, set, action) {
  const state = get()
  const { type, payload } = action

  if (type === 'increment') {
    set({ count: state.count + payload })
  }

  if (type === 'decrement') {
    set({ count: state.count - payload })
  }

  if (type === 'asyncIncrement') {
    set({ loading: true })
    setTimeout(() => {
      set({ count: get().count + payload, loading: false })
    }, 1000)
  }
}

function onChange (atom) {
  console.log('new state', atom.get())
}

atom.split({ count: 5 })
  // -> { count: 5 }

atom.split('increment', 5)
  // -> { count: 10 }

atom.split('decrement', 3)
  // -> { count: 7 }

atom.split('asyncIncrement', 1)
  // -> { count: 7, loading: true }
atom.split('decrement', 2)
  // -> { count: 5, loading: true }
  // -> 1 second later...
  // -> { count: 6, loading: false }
```

### Preact example

```js
const React = require('preact')
const createAtom = require('tiny-atom')

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

## API

### `createAtom(initialState, reduce, onChange)`

Creates an atom, which is an object of shape `{ get, split }`.

* `initialState` - should be an object, defaults to `{}`
* `reduce` - a function of signature `(get, set, action)`
  * `get` - get current state
  * `set` - extend the state with this new value
  * `action` - an object of shape `{ type, payload }`
* `onChange` - a function called on each state change

A note on `set` - when calling set in the reducer, it typically extends the state with the new object passed to set. But if you'd like to mutate the object simply pass the same state object to `set` and it will record that as the new state.

### `atom.get`

Returns current state.

### `atom.split`

Can be used in 2 ways.

* `atom.split(change)` - a shortcut, directly extend the state with the `change` object, doesn't go via reducer.
* `atom.split(type, payload)` – dispatch an action to the reducer.
