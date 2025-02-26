import path from 'node:path';
import dts from 'rollup-plugin-dts';
import json from '@rollup/plugin-json';
import typescript from '@rollup/plugin-typescript';
import externals from 'rollup-plugin-node-externals';

const prod = process.env.NODE_ENV === 'production';

/**
 * @type {Array<import('rollup').RollupOptions>}
 */
const config = [
  // e-fatura
  {
    input: './packages/e-fatura/src/index.ts',
    output: [
      {
        file: './packages/e-fatura/dist/index.cjs',
        format: 'cjs',
        exports: 'named'
      },
      {
        file: './packages/e-fatura/dist/index.mjs',
        format: 'esm',
        exports: 'named'
      }
    ],
    plugins: [
      typescript({
        tsconfig: './tsconfig.json'
      }),
      externals({
        deps: true,
        devDeps: true,
        optDeps: true,
        peerDeps: true,
        packagePath: path.resolve('./packages/e-fatura/package.json')
      })
    ]
  },
  prod && {
    input: './packages/e-fatura/src/index.ts',
    plugins: [dts()],
    output: {
      file: './packages/e-fatura/dist/index.d.ts',
      format: 'es'
    }
  },

  // e-fatura-cli
  {
    input: './packages/e-fatura-cli/src/index.ts',
    output: {
      file: './packages/e-fatura-cli/dist/bin/e-fatura.mjs',
      format: 'esm',
      exports: 'named'
    },
    plugins: [
      typescript({
        tsconfig: './tsconfig.json'
      }),
      json({
        preferConst: true
      }),
      externals({
        deps: true,
        devDeps: true,
        optDeps: true,
        peerDeps: true,
        packagePath: path.resolve('./packages/e-fatura-cli/package.json')
      })
    ]
  }
].filter(Boolean);

export default config;
