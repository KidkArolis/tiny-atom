/* eslint-disable node/no-deprecated-api */

var fs = require('fs')
var path = require('path')
var buble = require('buble')

var original = require.extensions['.js']
var nodeModulesPattern = path.sep === '/' ? /\/node_modules\// : /\\node_modules\\/

var options = {
  objectAssign: 'Object.assign',
  transforms: { asyncAwait: false },
  jsx: 'h'
}

require.extensions['.js'] = function(m, filename) {
  if (nodeModulesPattern.test(filename)) return original(m, filename)

  var source = fs.readFileSync(filename, 'utf-8')
  var compiled

  try {
    compiled = buble.transform(source, options)
  } catch (err) {
    if (err.snippet) {
      console.log('Error compiling ' + filename + ':\n---')
      console.log(err.snippet)
      console.log(err.message)
      console.log('')
      process.exit(1)
    }

    throw err
  }

  m._compile('"use strict";\n' + compiled.code, filename)
}
