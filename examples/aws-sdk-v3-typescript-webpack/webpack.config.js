// Import path for resolving file paths
import path from 'path';

export default {
  entry: [path.resolve('../../dist/examples/aws-sdk-v3-typescript-webpack')],
  // Specify the output file containing our bundled code
  output: {
    path: path.resolve(
      '../../dist/examples/aws-sdk-v3-typescript-webpack/bundle'
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
      }
    ],
  },

  target: 'node16',
  devtool: 'source-map',
  mode: 'production',
  externals: ['aws-sdk', 'aws-crt'],
};
