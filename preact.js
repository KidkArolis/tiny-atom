var Preact = require('preact')

var Provider = (function (superclass) {
  function Provider () {
    superclass.apply(this, arguments)
  }
  /* eslint-disable no-proto */
  if (superclass) Provider.__proto__ = superclass
  Provider.prototype = Object.create(superclass && superclass.prototype)
  Provider.prototype.constructor = Provider
  Provider.prototype.getChildContext = function getChildContext () {
    return { atom: this.props.atom }
  }
  Provider.prototype.render = function render (props) {
    return props.children[0]
  }
  return Provider
}(Preact.Component))

function connect (mapState, mapActions) {
  return function connectComponent (Component) {
    return function (props, context) {
      var atom = context.atom
      props = Object.assign(
        { atom: atom.get(), split: atom.split },
        props,
        mapState ? mapState(atom.get()) : {}
      )
      props = Object.assign(
        props,
        mapActions ? mapActions(atom.split, props) : {}
      )
      return Preact.h(Component, props)
    }
  }
}

module.exports.Provider = Provider
module.exports.connect = connect
