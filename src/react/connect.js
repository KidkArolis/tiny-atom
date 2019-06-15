import React from 'react'
import { Consumer } from './Consumer'

export function createConnect(Consumer) {
  return function connect(map, actions, options = {}) {
    return function connectComponent(Component) {
      const render = mappedProps => <Component {...mappedProps} />
      const Connected = props => (
        <Consumer
          displayName={Component.displayName || Component.name}
          map={map}
          actions={actions}
          pure={options.pure}
          sync={options.sync}
          observe={options.observe}
          debug={options.debug}
          originalProps={props}
          render={render}
        />
      )
      return Connected
    }
  }
}

export const connect = createConnect(Consumer)
