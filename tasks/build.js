const fs = require('fs')
const path = require('path')

const files = ['package.json', 'package-lock.json', 'LICENSE', 'CHANGELOG.md', 'README.md']

;(async function () {
  const execa = (await import('execa')).execa

  const sh = (...args) => execa(...args, { stdio: 'inherit', shell: true })

  await sh('rm -rf dist')
  await sh('mkdir -p dist')

  for (const file of files) {
    await sh(`cp ${file} dist`)
  }
  await sh(`cp -R src dist/src`)

  const pkg = require('../package.json')
  const subdirs = ['core', 'devtools', 'log', 'preact', 'react']

  const babel = './node_modules/.bin/babel'
  await sh(`${babel} --no-babelrc src/index.js -o dist/${pkg.main} --config-file=./.babelrc-cjs`)
  await sh(`${babel} --no-babelrc src/index.js -o dist/${pkg.module} --config-file=./.babelrc-esm`)
  for (const subdir of subdirs) {
    await sh(`${babel} --no-babelrc src/${subdir}/src -d dist/${subdir}/cjs --config-file=./.babelrc-cjs`)
    await sh(`${babel} --no-babelrc src/${subdir}/src -d dist/${subdir}/esm --config-file=./.babelrc-esm`)
    fs.writeFileSync(
      path.join(process.cwd(), 'dist', subdir, 'package.json'),
      JSON.stringify(
        {
          name: `tiny-atom-${subdir}`,
          private: true,
          main: './cjs',
          module: './esm',
          sideEffects: false,
        },
        null,
        2
      )
    )
  }
})()
