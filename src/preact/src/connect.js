import { h } from 'preact'
import { Consumer } from './Consumer'

/** @jsx h */

export function connect(map, options = {}) {
  return function connectComponent(Component) {
    const render = (mappedProps) => <Component {...mappedProps} />
    const Connected = (props) => (
      <Consumer
        map={map}
        sync={options.sync}
        observe={options.observe}
        originalProps={props}
        render={render}
      />
    )
    return Connected
  }
}
