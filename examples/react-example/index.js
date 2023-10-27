import React from 'react'
import { createRoot } from 'react-dom/client'
import { createAtom, Provider } from 'tiny-atom'
import { createLog } from 'tiny-atom/log'
import { App } from './App'
import { initialState, actions } from './actions'

const atom = (window.atom = createAtom({ state: initialState, actions, debug: createLog() }))

const container = document.querySelector('#root')
const root = createRoot(container)

root.render(
  <Provider atom={atom}>
    <App />
  </Provider>,
)
