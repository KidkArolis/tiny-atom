const fs = require('fs')
const path = require('path')
const { execFileSync } = require('child_process')

const files = ['LICENSE', 'CHANGELOG.md', 'README.md']

;(function () {
  const root = process.cwd()
  const dist = path.join(root, 'dist')

  fs.rmSync(dist, { force: true, recursive: true })
  fs.mkdirSync(dist)

  for (const file of files) {
    fs.copyFileSync(path.join(root, file), path.join(dist, file))
  }
  const pkg = require('../package.json')
  const source = path.join(root, 'src')

  const swc = path.join(root, 'node_modules', '.bin', 'swc')
  const compile = (format) =>
    execFileSync(swc, ['.', '-d', path.join(dist, format), `--config-file=${path.join(root, `.swcrc-${format}`)}`], {
      cwd: source,
      stdio: 'inherit',
    })

  compile('cjs')
  compile('esm')
  fs.writeFileSync(path.join(dist, 'cjs', 'package.json'), '{"type":"commonjs"}\n')
  fs.writeFileSync(path.join(dist, 'esm', 'package.json'), '{"type":"module"}\n')

  const publishedPackage = {
    name: pkg.name,
    version: pkg.version,
    description: pkg.description,
    main: pkg.main,
    module: pkg.module,
    exports: pkg.exports,
    files: pkg.files,
    sideEffects: pkg.sideEffects,
    engines: pkg.engines,
    repository: pkg.repository,
    contributors: pkg.contributors,
    license: pkg.license,
    publishConfig: pkg.publishConfig,
    dependencies: pkg.dependencies,
  }

  fs.writeFileSync(path.join(dist, 'package.json'), `${JSON.stringify(publishedPackage, null, 2)}\n`)
})()
