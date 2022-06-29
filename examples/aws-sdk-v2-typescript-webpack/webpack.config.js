// Import path for resolving file paths
import path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default {
  entry: [path.resolve('../../dist/examples/aws-sdk-v2-typescript-webpack')],
  // Specify the output file containing our bundled code
  output: {
    path: path.resolve(
      '../../dist/examples/aws-sdk-v2-typescript-webpack/bundle'
    ),
    filename: 'index.js',
  },
  module: {
    rules: [
      {
        test: /\.m?js/,
        resolve: {
          fullySpecified: false,
        },
      },
    ],
  },
  target: 'node16',
  devtool: 'source-map',
  mode: 'production',
  externals: [
    {
      ['@aws-sdk/client-dynamodb']: {
        root: '@aws-sdk/client-dynamodb',
      },
      ['@aws-sdk/lib-dynamodb']: {
        root: '@aws-sdk/lib-dynamodb',
      },
    },
  ],
};
