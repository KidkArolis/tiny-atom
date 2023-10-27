import test from 'ava'
import * as Preact from 'preact'
import { Provider, Consumer, connect } from '../src/preact'
import testApp from './generic-app'

test.serial.skip('usage', async function (t) {
  const h = (global.h = Preact.h)
  const { root, assert, render } = testApp({ h, Provider, Consumer, connect })
  render((App) => Preact.render(h(App), root, root.lastElementChild))
  await assert(t)
  Preact.render(null, root)
})
