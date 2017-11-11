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

const actions = {
  increment: (get, split, payload) => {
    split({ count: get().count + payload })
  },

  decrement: (get, split, payload) => {
    split({ count: get().count - payload })
  },

  asyncIncrement: (get, split, payload) => {
    split('asyncIncrementNested', payload)
  },

  asyncIncrementNested: (get, split, payload) => {
    split('increment', payload)
    setTimeout(() => {
      split({
        count: get().count + payload,
        extra: (get().extra || 'a') + 'a'
      })
      setTimeout(() => {
        split('decrement', 1)
      }, 1000)
    }, 1000)
  },

  track: (get, split, payload) => {
    // track is a side effect, no store updates
  }
}

function evolve (get, split, action) {
  actions[action.type](get, split, action.payload)
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
    <button onClick={() => split({ rnd: Math.random() })}>Random</button>
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
