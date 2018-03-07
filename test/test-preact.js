const test = require('ava')
const Preact = require('preact')
const { ProvideAtom, ConnectAtom, connect } = require('../preact')
const testApp = require('./generic-app')

const h = Preact.h

test('usage with preact', t => {
  const app = testApp({ h, ProvideAtom, ConnectAtom, connect })

  app.render((App, atom, root) => {
    Preact.render(
      h(ProvideAtom, { atom }, [
        h(App, {})
      ])
    , root, root.lastElementChild)
  })

  app.assert(t)
})
