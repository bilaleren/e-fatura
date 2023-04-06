import dts from 'rollup-plugin-dts'
import cleanup from 'rollup-plugin-cleanup'
import typescript from '@rollup/plugin-typescript'
import externals from 'rollup-plugin-node-externals'

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
    plugins: [dts.default()],
    output: {
      file: './dist/index.d.ts',
      format: 'es',
      exports: 'named'
    }
  })
}

export default config
