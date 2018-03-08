const test = require('ava')
const React = require('react')
const ReactDOM = require('react-dom')
const { ProvideAtom, ConnectAtom, connect } = require('../src/react')
const testApp = require('./generic-app')

const h = React.createElement

test('usage with react', t => {
  const app = testApp({ h, ProvideAtom, ConnectAtom, connect })

  app.render((App, atom, root) => {
    ReactDOM.render(
      h(ProvideAtom, { atom },
        h(App, {})
      )
      , root)
  })

  app.assert(t)
})
