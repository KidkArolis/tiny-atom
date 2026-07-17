const fs = require('fs')
const os = require('os')
const path = require('path')
const { execFileSync } = require('child_process')

const root = path.join(__dirname, '..')
const dist = path.join(root, 'dist')
const publishedPackage = require('../dist/package.json')
const exportEntries = Object.entries(publishedPackage.exports)
const entrypoints = exportEntries
  .filter(([subpath]) => subpath !== './package.json')
  .map(([subpath]) => (subpath === '.' ? publishedPackage.name : `${publishedPackage.name}${subpath.slice(1)}`))
const exportTargets = exportEntries.flatMap(([, target]) =>
  typeof target === 'string' ? [target] : Object.values(target),
)

const commonJsSmokeTest = `
  for (const entrypoint of ${JSON.stringify(entrypoints)}) {
    const loaded = require(entrypoint);
    if (Object.keys(loaded).length === 0) throw new Error(\`No exports found for \${entrypoint}\`);
  }
`
const esmSmokeTest = `
  for (const entrypoint of ${JSON.stringify(entrypoints)}) {
    const loaded = await import(entrypoint);
    if (Object.keys(loaded).length === 0) throw new Error(\`No exports found for \${entrypoint}\`);
  }
`

execFileSync(process.execPath, ['--input-type=commonjs', '--eval', commonJsSmokeTest], {
  cwd: dist,
  stdio: 'inherit',
})
execFileSync(process.execPath, ['--input-type=module', '--eval', esmSmokeTest], {
  cwd: dist,
  stdio: 'inherit',
})

const cache = fs.mkdtempSync(path.join(os.tmpdir(), 'tiny-atom-npm-cache-'))

try {
  const result = JSON.parse(
    execFileSync('npm', ['pack', '--dry-run', '--json', '--ignore-scripts'], {
      cwd: dist,
      encoding: 'utf8',
      env: { ...process.env, npm_config_cache: cache },
    }),
  )[0]
  const files = result.files.map(({ path }) => path)
  const requiredFiles = new Set([
    'package.json',
    'cjs/package.json',
    'esm/package.json',
    ...exportTargets.map((target) => target.replace(/^\.\//, '')),
  ])

  for (const file of requiredFiles) {
    if (!files.includes(file)) throw new Error(`Missing ${file} from the package`)
  }
  if (files.some((file) => file.startsWith('src/') || file.startsWith('tasks/'))) {
    throw new Error('Development source or tasks are included in the package')
  }

  console.log(`Package smoke test passed (${files.length} files, ${result.size} bytes)`) // eslint-disable-line no-console
} finally {
  fs.rmSync(cache, { force: true, recursive: true })
}
