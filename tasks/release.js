const fs = require('fs')
const shell = require('execa').shell

const sh = (...args) => shell(...args, { stdio: 'inherit' })

const files = [
  'package.json',
  'CHANGELOG.md',
  'README.md'
]

;(async function () {
  await sh('npm test')

  await sh('rm -rf dist')
  await sh('mkdir -p dist')

  for (let file of files) {
    await sh(`cp ${file} dist`)
  }
  await sh(`cp src/* dist`)

  await sh(`./node_modules/.bin/buble --objectAssign Object.assign dist -o dist`)
  await sh(`./node_modules/.bin/buble --objectAssign Object.assign --jsx Preact.h src/preact.js -o dist/preact.js`)
  await sh(`./node_modules/.bin/buble --objectAssign Object.assign --jsx React.createElement src/react.js -o dist/react.js`)

  await sh(`yarn version`)
  const version = require('../package.json').version

  fs.writeFileSync(
    './dist/package.json',
    JSON.stringify(
      Object.assign({}, require('../dist/package.json'), { version })
      , null, 2)
  )

  process.chdir('./dist')
  await sh(`yarn publish --new-version ${version}`)
}())
