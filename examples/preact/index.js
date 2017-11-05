const Preact = require('preact')
const createAtom = require('../..')
const { Provider, connect } = require('../../preact')
const devtools = require('../../devtools')

const atom = createAtom({ count: 0 }, evolve, render, {
  log: true,
  debug: devtools
})

function evolve (get, split, action) {
  const state = get()
  const { type, payload } = action

  if (type === 'increment') {
    split({ count: state.count + payload })
  }

  if (type === 'decrement') {
    split({ count: get().count - payload })
    split({ count: get().count - payload })
    split({ count: get().count - payload })
  }

  if (type === 'complex') {
    split('complex-part-2')
  }

  if (type === 'complex-part-2') {
    split({ count: 5 })
    split({ c: 1 })
    setTimeout(() => split({ d: 2 }), 1000)
    split('increment', 5)
  }
}

const mapState = state => ({
  doubleCount: state.count * 2,
  count: state.count
})

const mapActions = split => ({
  inc: () => split('increment', 1),
  dec: () => split('decrement', 1),
  split
})

const App = connect(mapState, mapActions)(function App ({ count, doubleCount, split, inc, dec }) {
  return <div>
    <h1>count is {count}</h1>
    <h1>double count is {doubleCount}</h1>
    <button onClick={inc}>Increment</button>
    <button onClick={dec}>Decrement</button>
    <button onClick={() => split('track')}>Track</button>
    <button onClick={() => split('complex')}>Complex</button>
  </div>
})

setTimeout(() => {
  atom.split('increment', 1)
  atom.split('decrement', 2)
  atom.split('track')
  atom.split('complex')
  atom.split({ up: 'abc' })
  setTimeout(() => {
    atom.split('increment', 1)
    atom.split('decrement', 2)
    atom.split('track')
    atom.split('complex')
    atom.split({ up: 'abc' })
  }, 10)
}, 10)

function render (a, { action, currState } = {}) {
  Preact.render((
    <Provider atom={atom}>
      <App />
    </Provider>
  ), document.body, document.body.lastElementChild)
}

render()
