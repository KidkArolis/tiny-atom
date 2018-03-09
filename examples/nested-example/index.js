const Preact = require('preact')
const { ProvideAtom } = require('tiny-atom/preact')
const App = require('./components/App')
const raf = require('./utils/raf')

const merge = require('tiny-atom/deep-merge')
const debug = require('tiny-atom/log')
const createAtom = require('./atom')

const atom = window.atom = createAtom({}, { merge, debug })

const actions = require('./actions')
Object.keys(actions).forEach(pack => {
  const p = actions[pack]
  atom(pack, p.state, p.actions)
})

const render = raf(function render () {
  Preact.render((
    <ProvideAtom atom={atom}>
      <App />
    </ProvideAtom>
  ), document.body, document.body.lastElementChild)
})

atom.observe(render)
render()
