import { h } from 'preact'
import { Consumer } from './Consumer'

/** @jsx h */

export function connect(map, actions, options = {}) {
  return function connectComponent(Component) {
    const render = mappedProps => <Component {...mappedProps} />
    const Connected = props => (
      <Consumer
        map={map}
        actions={actions}
        pure={options.pure}
        sync={options.sync}
        observe={options.observe}
        originalProps={props}
        render={render}
      />
    )
    return Connected
  }
}
