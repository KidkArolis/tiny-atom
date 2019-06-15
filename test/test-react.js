import test from 'ava'
import React from 'react'
import ReactDOM from 'react-dom'
import { Provider, Consumer, connect, createContext, createConnect, createConsumer } from '../src/react'
import testApp from './generic-app'

test.serial('usage', async function(t) {
  const h = (global.h = React.createElement)
  const { root, assert, render } = testApp({ h, Provider, Consumer, connect })
  render(App => ReactDOM.render(h(App), root))
  await assert(t)
  ReactDOM.render(null, root)
})

test.serial('usage with createContext, createConsumer and createConnect', async function(t) {
  const h = (global.h = React.createElement)
  const { root, assert, render } = testApp({ h, createContext, createConnect, createConsumer })
  render(App => ReactDOM.render(h(App), root))
  await assert(t)
  ReactDOM.render(null, root)
})
