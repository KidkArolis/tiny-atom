import test from 'ava'
import React, { useState, useEffect } from 'react'
import ReactDOM from 'react-dom'
import { act } from 'react-dom/test-utils'
import { JSDOM } from 'jsdom'
import { useAtom } from '../src'

test.serial('useAtom usage', async function(t) {
  const dom = new JSDOM('<!doctype html><div id="root"></div>')
  global.window = dom.window
  global.document = dom.window.document
  const root = document.getElementById('root')

  let s

  const App = () => {
    const [state, actions, atom] = useAtom(() => ({
      state: { count: 0, extra: 0 },
      actions: {
        increment: ({ set }) => set(state => ({ count: state.count + 1 })),
        decemenet: ({ set }) => set(state => ({ count: state.count - 1 }))
      }
    }))

    useEffect(() => {
      atom.observe(() => {
        s = atom.get()
      })
      actions.increment()
    }, [])

    return <div id='count-outer'>{state.count}</div>
  }

  act(() => {
    ReactDOM.render(<App />, root)
  })

  t.deepEqual(s, { count: 1, extra: 0 })
  t.is(document.getElementById('count-outer').innerHTML, String(1))
})

test.serial('useAtom allows recreating actions based on deps', async function(t) {
  const dom = new JSDOM('<!doctype html><div id="root"></div>')
  global.window = dom.window
  global.document = dom.window.document
  const root = document.getElementById('root')

  const renders = []

  const App = () => {
    const [item, setItem] = useState('item-1')

    const [state, actions] = useAtom(
      () => ({
        state: { fetched: null, extra: 0 },
        actions: {
          fetch: ({ get, set }) => set({ fetched: item, extra: get().extra + 1 })
        }
      }),
      [item]
    )

    useEffect(() => {
      actions.fetch()
      setItem('item-2')
    }, [item])

    renders.push(state)

    return <div id='item' />
  }

  act(() => {
    ReactDOM.render(<App />, root)
  })

  t.deepEqual(renders, [
    {
      fetched: null,
      extra: 0
    },
    {
      fetched: 'item-1',
      extra: 1
    },
    {
      fetched: 'item-2',
      extra: 2
    }
  ])
})
