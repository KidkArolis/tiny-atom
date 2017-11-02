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

function connect (mapStateToProps) {
  return function connectComponent (Component) {
    return function (props, context) {
      var atom = context.atom
      return Preact.h(Component, Object.assign(
        {},
        props,
        mapStateToProps ? mapStateToProps(atom.get()) : { atom: atom.get() },
        { split: atom.split }
      ))
    }
  }
}

module.exports.Provider = Provider
module.exports.connect = connect
