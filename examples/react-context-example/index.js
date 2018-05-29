const ReactDOM = require('react-dom')
const AtomContext = require('./atomContext')
const React = require('react')
const App = require('./App')

ReactDOM.render((
  <AtomContext.Provider>
    <App />
  </AtomContext.Provider>
), document.getElementById('root'))
