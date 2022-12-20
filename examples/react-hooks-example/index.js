const React = require('react')
const ReactDOM = require('react-dom')
const createAtom = require('tiny-atom')
const { Provider } = require('tiny-atom/react')
const log = require('tiny-atom/log')
const App = require('./App')
const { initialState, actions } = require('./actions')

const atom = (window.atom = createAtom({ state: initialState, actions, debug: log() }))

ReactDOM.render(
  <Provider atom={atom}>
    <App />
  </Provider>,
  document.querySelector('#root')
)
