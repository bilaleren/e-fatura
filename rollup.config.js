const cleanup = require('rollup-plugin-cleanup')
const { default: dts } = require('rollup-plugin-dts')
const typescript = require('@rollup/plugin-typescript')
const externals = require('rollup-plugin-node-externals')

const prod = process.env.NODE_ENV === 'production'

/**
 * @type {Array<import('rollup').RollupOptions>}
 */
const config = [
  {
    input: './src/index.ts',
    output: {
      file: './dist/index.js',
      format: 'cjs',
      exports: 'named'
    },
    plugins: [
      typescript(),
      prod &&
        cleanup({
          comments: 'none',
          extensions: ['ts', 'js']
        }),
      externals({
        deps: true,
        devDeps: true,
        optDeps: true,
        peerDeps: true
      })
    ]
  }
]

if (prod) {
  config.push({
    input: './src/index.ts',
    plugins: [dts()],
    output: {
      file: './dist/index.d.ts',
      format: 'es',
      exports: 'named'
    }
  })
}

module.exports = config
