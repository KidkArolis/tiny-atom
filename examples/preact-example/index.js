const Preact = require('preact')
const createAtom = require('../..')
const { ProvideAtom, ConnectAtom } = require('../../preact')
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

const mapAtom = (state, split) => ({
  doubleCount: state.count * 2,
  count: state.count,
  split: split,
  inc: () => split('increment', 1),
  dec: () => split('decrement', 1),
  asyncIncrement: x => () => split('asyncIncrement', x)
})

const App = () => (
  <ConnectAtom map={mapAtom} render={({ count, doubleCount, split, asyncIncrement, inc, dec }) => (
    <div>
      <h1>count: {count}</h1>
      <h1>double: {doubleCount}</h1>
      <Nested multiplier={5}>
        <Nested multiplier={10} />
      </Nested>
      <button onClick={inc}>Increment</button>
      <button onClick={dec}>Decrement</button>
      <button onClick={asyncIncrement(2)}>Async increment</button>
      <button onClick={() => split('track')}>Track</button>
      <button onClick={() => split({ rnd: Math.random() })}>Random</button>
    </div>
  )} />
)

const Nested = class Nested extends Preact.Component {
  componentWillMount () {
    this.atom = createAtom(
      { count: 2 },
      (...args) => this.evolve(...args),
      () => this.forceUpdate(),
      {
        debug: info => {
          info.action = Object.assign({}, info.action)
          info.action.type = 'INNER ' + info.action.type
          log(info)
        }
      }
    )
  }

  evolve (get, split, action) {
    switch (action.type) {
      case 'increment':
        split({ count: get().count * 2 })
        break
      case 'decrement':
        split({ count: get().count / 2 })
        break
    }
  }

  render ({ children }) {
    return (
      <ProvideAtom atom={this.atom}>
        <ConnectAtom map={(state, split) => ({ count: state.count, split })} render={({ count, split }) => (
          <div>
            Nested component: { count }
            <span onClick={() => split('increment')}>INC</span>
            <span onClick={() => split('decrement')}>DEC</span>
            {children[0]}
          </div>
        )} />
      </ProvideAtom>
    )
  }
}

function render (atom) {
  Preact.render((
    <ProvideAtom atom={atom}>
      <App />
    </ProvideAtom>
  ), document.body, document.body.lastElementChild)
}

render(atom)
