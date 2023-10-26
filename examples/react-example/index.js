import React from 'react'
import ReactDOM from 'react-dom'
import { createAtom, Provider } from 'tiny-atom'
import { createLog } from 'tiny-atom/log'
import { App } from './App'
import { initialState, actions } from './actions'

const atom = (window.atom = createAtom({ state: initialState, actions, debug: createLog() }))

ReactDOM.render(
  <Provider atom={atom}>
    <App />
  </Provider>,
  document.querySelector('#root')
)
