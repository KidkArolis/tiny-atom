var Preact = require('preact')

var Provider = (function (superclass) {
  function Provider () {
    superclass.apply(this, arguments)
  }

  if (superclass) Provider.__proto__ = superclass
  Provider.prototype = Object.create(superclass && superclass.prototype)

  Provider.prototype.constructor = Provider

  Provider.prototype.getChildContext = function getChildContext () {
    return { atom: this.props.atom }
  }

  Provider.prototype.render = function render (props) {
    return props.children && props.children[0]
  }

  return Provider
}(Preact.Component))

function connect (mapState, mapActions) {
  return function connectComponent (Component) {
    return function (props, context) {
      var atom = context.atom
      return Preact.h(Component, Object.assign(
        {},
        props,
        mapState ? mapState(atom.get()) : { atom: atom.get() },
        // TODO - pass mapped props to mapActions
        mapActions ? mapActions(atom.split, props) : { split: atom.split }
      ))
    }
  }
}

module.exports.Provider = Provider
module.exports.connect = connect
