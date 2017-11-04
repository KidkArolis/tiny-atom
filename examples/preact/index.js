const Preact = require('preact')
const { connectViaExtension } = require('remotedev')
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

  if (typeof action === 'function') {
    action(get, split)
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

// window.__REDUX_DEVTOOLS_EXTENSION__.connect()
// window.devToolsExtension.subscribe(message => {
//   console.log(message)
// })

function render (a, { action, currState } = {}) {
  if (action) {
    // window.devToolsExtension(action.type, { state: currState })
    // Send changes to the remote monitor
    remotedev.send(action, a.get())
  }
  Preact.render((
    <Provider atom={atom}>
      <App />
    </Provider>
  ), document.body, document.body.lastElementChild)
}

const remotedev = connectViaExtension()
remotedev.subscribe(message => {
  if (message.type === 'DISPATCH' && message.payload.type === 'JUMP_TO_ACTION') {
    atom.split(JSON.parse(message.state))
  }
})

render()
