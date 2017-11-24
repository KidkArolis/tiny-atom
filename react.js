var React = require('react')
var Component = React.Component

function Any () {
  return null
}

function ProvideAtom () { Component.apply(this, arguments) }
/* eslint-disable no-proto */
ProvideAtom.__proto__ = Component
ProvideAtom.prototype = Object.create(Component.prototype)
ProvideAtom.prototype.constructor = ProvideAtom
ProvideAtom.childContextTypes = { atom: Any }
ProvideAtom.prototype.getChildContext = function getChildContext () {
  return { atom: this.props.atom }
}
ProvideAtom.prototype.render = function render () {
  return React.Children.only(this.props.children)
}

function ConnectAtom (props, context) {
  var atom = context.atom
  var map = props.map
  var render = props.render
  var data = map ? map(atom.get(), atom.split) : { state: atom.get(), split: atom.split }
  return render(data)
}

ConnectAtom.contextTypes = { atom: Any }

module.exports.ProvideAtom = ProvideAtom
module.exports.ConnectAtom = ConnectAtom
