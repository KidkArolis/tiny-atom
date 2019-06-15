const Preact = require('preact') //eslint-disable-line
const { Consumer } = require('tiny-atom/preact')
require('./App.css')

const map = state => {
  return { state }
}

module.exports = () => (
  <Consumer map={map}>
    {({ state, dispatch }) => (
      <div className='App'>
        <h1>tiny todo</h1>

        <form onSubmit={onSubmit(dispatch, this.$input)}>
          <input
            className='Todo-input'
            type='text'
            ref={el => {
              this.$input = el
            }}
            onChange={e => dispatch('todo.update', e.target.value)}
            value={state.todo.input}
          />
        </form>

        {state.todo.items.map((item, i) => (
          <div className='Todo' onClick={() => dispatch('todo.done', i)}>
            <span className='Todo-done'>☐</span>
            {item}
          </div>
        ))}

        {state.todo.items.length === 0 && <div className='Todo-empty'>Take a break!</div>}

        <div className='Hint'>{state.hint.show ? state.hint.text : ''}</div>
      </div>
    )}
  </Consumer>
)

function onSubmit(dispatch, $input) {
  return function(e) {
    e.preventDefault()
    dispatch('todo.add')
    $input && $input.focus()
  }
}
