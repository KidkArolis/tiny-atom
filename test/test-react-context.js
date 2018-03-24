const test = require('ava')
const React = require('react')
const ReactDOM = require('react-dom')
const createContext = require('../src/react/context')
const testApp = require('./generic-app')

const h = React.createElement

test('usage with react\'s new context', t => {
  const app = testApp({ h, createContext })

  app.render((App, atom, root) => {
    ReactDOM.render(
      h(app.Provider, {},
        h(App, {})
      )
      , root)
  })

  app.assert(t)

  ReactDOM.render(null, app.root)
})

test('usage with react\'s new context with atom as prop', t => {
  const { Provider, Consumer, connect } = createContext()
  const app = testApp({ h, Consumer, connect })

  app.render((App, atom, root) => {
    ReactDOM.render(
      h(Provider, { atom },
        h(App, {})
      )
      , root)
  })

  app.assert(t)

  ReactDOM.render(null, app.root)
})
