# tiny-atom

Minimal, yet awesome, state management. Only 26 LOC, but does everything you'd need to power an app of any size.

## Usage

    $ yarn add tiny-atom

Example with `preact`:

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

## API

### `createAtom(initialState, reduce, onChange)`

Creates an atom, which is an object of shape `{ get, split }`.

* `initialState` - should be an object, defaults to `{}`
* `reduce` - a function of signature `(get, set, action)`
  * `get` - get current state
  * `set` - extend the state with this new value
  * `action` - an object of shape `{ type, payload }`
* `onChange` - a function called with the new state on each state change

A note on `set` - when calling set in the reducer, it typically extends the state with the new object passed to set. But if you'd like to mutate the object simply pass the same state object to `set` and it will record that as the new state.

### `atom.get`

Returns current state.

### `atom.split`

Can be used in 2 ways.

* `atom.split(change)` - a shortcut, directly extend the state with the `change` object, doesn't go via reducer.
* `atom.split(type, payload)` – dispatch an action to the reducer.

### Examples

```js
const atom = createAtom({ sing: 0, rock: 0 }, reducer, render)

function render () {
  // pass atom.get() and atom.split to your components
}

function reducer (get, set, { type, payload }) {
  if (type === 'sing') set({ sing: get().sing + 1 })
  if (type === 'rock') set({ rock: get().rock + payload })

  // async action
  if (type === 'fetch') {
    if (get().loading) return
    set({ loading: true })
    fetch('http://httpbin.org/post', {
      method: 'POST',
      body: JSON.stringify({ sing: 2, rock: 7 })
    })
      .then(res => res.json())
      .then(res => {
        // merge local state with remote state
        const state = get()
        const data = JSON.parse(res.data)
        set({
          loading: false,
          sing: state.sing + data.sing,
          rock: state.rock + data.rock
        })
      })
  }
}

atom.get()
  // -> { sing: 0, rock: 0 }

atom.split({ active: true })
atom.get()
  // -> { sing: 0, rock: 0, active: true }

atom.split('sing')
atom.get()
  // -> { sing: 1, rock: 0, active: true }

atom.split('rock', 5)
atom.get()
  // -> { sing: 1, rock: 5, active: true }

atom.split({ active: false, sing: 0, rock: 0 })
atom.get()
  // -> { sing: 0, rock: 0, active: false }

atom.split('fetch')
atom.get()
  // -> { sing: 0, rock: 0, active: false, loading: true }

// later, render gets called with updated state
atom.get()
  // -> { sing: 2, rock: 7, active: false, loading: false }
```
