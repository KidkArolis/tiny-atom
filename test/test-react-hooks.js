const test = require('ava')
const React = require('react')
const ReactDOM = require('react-dom')
const { JSDOM } = require('jsdom')
const { useAtom, useActions, useDispatch } = require('../src/react/hooks')
const renderHooksApp = require('./hooks-app')

test.serial('usage', async t => {
  const h = global.h = React.createElement
  const dom = new JSDOM('<!doctype html><div id="root"></div>')
  global.window = dom.window
  global.document = dom.window.document
  const root = document.getElementById('root')

  const { atom, stats } = renderHooksApp({ h, useAtom, useActions, useDispatch, root })

  await frame()

  t.is(document.getElementById('count-outer').innerHTML, '0')
  t.is(document.getElementById('count-inner').innerHTML, '0')
  t.is(stats.childRenderCount, 1)

  atom.dispatch('increment')
  await frame()
  t.is(document.getElementById('count-outer').innerHTML, '1')
  t.is(document.getElementById('count-inner').innerHTML, '10')
  t.is(stats.childRenderCount, 2)

  atom.dispatch('increment')
  await frame()
  t.is(document.getElementById('count-outer').innerHTML, '2')
  t.is(document.getElementById('count-inner').innerHTML, '20')
  t.is(stats.childRenderCount, 3)

  document.getElementById('increment-outer').dispatchEvent(click(dom))
  await frame()
  t.is(document.getElementById('count-outer').innerHTML, '3')
  t.is(document.getElementById('count-inner').innerHTML, '30')
  t.is(stats.childRenderCount, 4)

  atom.dispatch('incrementUnrelated')
  await frame()
  t.is(stats.childRenderCount, 4)

  ReactDOM.render(null, root)
})

function click (dom) {
  return new dom.window.MouseEvent('click', {
    'view': dom.window,
    'bubbles': true,
    'cancelable': true
  })
}

function frame () {
  flushEffects()
  return new Promise(resolve => setTimeout(resolve, 2 * (1000 / 60)))
}

function flushEffects () {
  ReactDOM.render(null, document.createElement('template'))
}
