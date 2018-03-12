const Preact = require('preact') //eslint-disable-line
const { ConnectAtom } = require('tiny-atom/preact')
require('./App.css')

module.exports = () => (
  <ConnectAtom>
    {({ state, split }) => (
      <div className='App'>
        <h1>tiny todo</h1>

        <form onSubmit={onSubmit(split, this.$input)}>
          <input
            className='Todo-input'
            type='text'
            ref={el => { this.$input = el }}
            onChange={(e) => split.todo.update(e.target.value)}
            value={state.todo.input}
          />
        </form>

        {state.todo.items.map((item, i) => (
          <div className='Todo'>
            <span className='Todo-done' onClick={() => split.todo.done(i)}>☐</span>
            {item}
          </div>
        ))}

        {state.todo.items.length === 0 &&
          <div className='Todo-empty'>Take a break!</div>
        }

        <div className='Hint'>
          {state.hint.show ? state.hint.text : ''}
        </div>
      </div>
    )}
  </ConnectAtom>
)

function onSubmit (split, $input) {
  return function (e) {
    split.todo.add()
    e.preventDefault()
    window.requestAnimationFrame(() => {
      setTimeout(() => {
        $input.focus()
      }, 1)
    })
  }
}
