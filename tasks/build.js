const shell = require('execa').shell

const sh = (...args) => shell(...args, { stdio: 'inherit' })

const files = [
  'package.json',
  'package-lock.json',
  'LICENSE',
  'CHANGELOG.md',
  'README.md'
]

;(async function () {
  await sh('rm -rf dist')
  await sh('mkdir -p dist')
  for (let file of files) {
    await sh(`cp ${file} dist`)
  }
  await sh(`./node_modules/.bin/buble --objectAssign Object.assign src -o dist`)
  await sh(`./node_modules/.bin/buble --objectAssign Object.assign --jsx Preact.h src/preact.js -o dist/preact.js`)
  await sh(`./node_modules/.bin/buble --objectAssign Object.assign --jsx React.createElement src/react.js -o dist/react.js`)
}())
