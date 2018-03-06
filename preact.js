var Preact = require('preact')
var Component = Preact.Component

function ProvideAtom () { Component.apply(this, arguments) }
/* eslint-disable no-proto */
ProvideAtom.__proto__ = Component
ProvideAtom.prototype = Object.create(Component.prototype)
ProvideAtom.prototype.constructor = ProvideAtom
ProvideAtom.prototype.getChildContext = function getChildContext () {
  return { atom: this.props.atom }
}
ProvideAtom.prototype.render = function render (props) {
  return props.children[0]
}

function ConnectAtom (props, context) {
  var atom = context.atom
  var map = props.map
  var render = props.render || props.children[0]
  var data = map ? map(atom.get(), atom.split) : { state: atom.get(), split: atom.split }
  return render(data)
}

function connect (map) {
  return function connectComponent (Component) {
    return function Connected (props) {
      return Preact.h(ConnectAtom, {
        map: map,
        render: function (mappedProps) {
          return Preact.h(Component, Object.assign({}, props, mappedProps))
        }
      })
    }
  }
}

module.exports.ProvideAtom = ProvideAtom
module.exports.ConnectAtom = ConnectAtom
module.exports.connect = connect
