import React from 'react'
import { Consumer } from './Consumer'

export function createConnect(Consumer) {
  return function connect(map, options = {}) {
    return function connectComponent(Component) {
      const render = (mappedProps) => <Component {...mappedProps} />
      const Connected = (props) => (
        <Consumer
          displayName={Component.displayName || Component.name}
          map={map}
          pure={options.pure}
          observe={options.observe}
          originalProps={props}
          render={render}
        />
      )
      return Connected
    }
  }
}

export const connect = createConnect(Consumer)
