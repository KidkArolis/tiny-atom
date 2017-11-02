const Preact = require('preact')
const createAtom = require('../..')
const { Provider, connect } = require('../../preact')

const atom = createAtom({ count: 0 }, evolve, render, { log: true })

function evolve (get, split, action) {
  const state = get()
  const { type, payload } = action

  if (type === 'increment') {
    // sync
    split({ count: state.count + payload })
  }
}

const App = connect(state => ({ doubleCount: state.count * 2, count: state.count }))(function App ({ count, doubleCount, split }) {
  return <div>
    <h1>count is {count}</h1>
    <h1>double count is {doubleCount}</h1>
    <button onClick={onClickInc}>Increment</button>
    <button onClick={onClickDec}>Decrement</button>
  </div>

  function onClickInc () {
    split('increment', 1)
  }

  function onClickDec () {
    split(function decrement (get, split) {
      split({ count: get().count - 1 })
    })
  }
})

function render () {
  Preact.render((
    <Provider atom={atom}>
      <App />
    </Provider>
  ), document.body, document.body.lastElementChild)
}

render()
