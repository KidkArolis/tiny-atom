const Preact = require('preact')
const createAtom = require('../..')
const { Provider, connect } = require('../../preact')
const devtools = require('../../devtools')
const log = require('../../log')

const atom = window.atom = createAtom({ count: 0 }, evolve, render, {
  debug: (info) => {
    log(info)
    devtools(info)
  }
})

function evolve (get, split, action) {
  const state = get()
  const { type, payload } = action

  if (type === 'increment') {
    split({ count: state.count + payload })
  }

  if (type === 'decrement') {
    split({ count: get().count - payload })
  }

  if (type === 'asyncIncrement') {
    split('asyncIncrementNested', payload)
  }

  if (type === 'asyncIncrementNested') {
    split('increment', payload)
    console.log(action)
    setTimeout(() => split({
      count: get().count + payload,
      extra: get().extra + 1
    }), 1000)
    split('decrement', 1)
  }

  if (type === 'track') {
    // track is a side effect, no store updates
  }
}

const mapState = state => ({
  doubleCount: state.count * 2,
  count: state.count
})

const mapActions = split => ({
  inc: () => split('increment', 1),
  dec: () => split('decrement', 1),
  asyncIncrement: x => () => split('asyncIncrement', x)
})

const App = connect(mapState, mapActions)(({ count, doubleCount, split, asyncIncrement, inc, dec }) => {
  return <div>
    <h1>count: {count}</h1>
    <h1>double: {doubleCount}</h1>
    <button onClick={inc}>Increment</button>
    <button onClick={dec}>Decrement</button>
    <button onClick={asyncIncrement(2)}>Async increment</button>
    <button onClick={() => split('track')}>Track</button>
  </div>
})

function render (atom) {
  Preact.render((
    <Provider atom={atom}>
      <App />
    </Provider>
  ), document.body, document.body.lastElementChild)
}

render(atom)
