const fs = require('fs')
const path = require('path')
const { execFileSync } = require('child_process')

const files = ['package.json', 'package-lock.json', 'LICENSE', 'CHANGELOG.md', 'README.md']

;(function () {
  const root = process.cwd()
  const dist = path.join(root, 'dist')

  fs.rmSync(dist, { force: true, recursive: true })
  fs.mkdirSync(dist)

  for (const file of files) {
    fs.copyFileSync(path.join(root, file), path.join(dist, file))
  }
  fs.cpSync(path.join(root, 'src'), path.join(dist, 'src'), { recursive: true })

  const pkg = require('../package.json')
  const subdirs = ['core', 'devtools', 'log', 'preact', 'react']

  const swc = path.join(root, 'node_modules', '.bin', 'swc')
  const compile = (args, options = {}) => execFileSync(swc, args, { stdio: 'inherit', ...options })

  compile(['src/index.js', '-o', path.join(dist, pkg.main), '--config-file=.swcrc-cjs'])
  compile(['src/index.js', '-o', path.join(dist, pkg.module), '--config-file=.swcrc-esm'])
  for (const subdir of subdirs) {
    const cwd = path.join(root, 'src', subdir, 'src')
    compile(['.', '-d', path.join(dist, subdir, 'cjs'), `--config-file=${path.join(root, '.swcrc-cjs')}`], {
      cwd,
    })
    compile(['.', '-d', path.join(dist, subdir, 'esm'), `--config-file=${path.join(root, '.swcrc-esm')}`], {
      cwd,
    })
    fs.writeFileSync(
      path.join(dist, subdir, 'package.json'),
      JSON.stringify(
        {
          name: `tiny-atom-${subdir}`,
          private: true,
          main: './cjs',
          module: './esm',
          sideEffects: false,
        },
        null,
        2,
      ),
    )
  }
})()
