const Preact = require('preact')
const { ProvideAtom } = require('tiny-atom/preact')
const App = require('./components/App')
const raf = require('./utils/raf')
const atom = require('./atom')

const render = raf(function render () {
  Preact.render((
    <ProvideAtom atom={atom}>
      <App />
    </ProvideAtom>
  ), document.body, document.body.lastElementChild)
})

atom.observe(render)
render()
