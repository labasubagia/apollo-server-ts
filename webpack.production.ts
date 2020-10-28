import path from 'path';
import nodeExternals from 'webpack-node-externals';
import { Configuration } from 'webpack';
import { CleanWebpackPlugin } from 'clean-webpack-plugin';
import { merge } from 'webpack-merge';

import common from './webpack.common';

const config: Configuration = merge(common, {
  mode: 'production',
  devtool: 'source-map',
  entry: [path.join(__dirname, 'src/main.ts')],
  externals: [nodeExternals()],
  plugins: [new CleanWebpackPlugin()],
});

export default config;
