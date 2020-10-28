import path from 'path';
import nodeExternals from 'webpack-node-externals';
import { Configuration, HotModuleReplacementPlugin } from 'webpack';
import { CleanWebpackPlugin } from 'clean-webpack-plugin';
import { merge } from 'webpack-merge';

import common from './webpack.common';

const config: Configuration = merge(common, {
  mode: 'development',
  devtool: 'inline-source-map',
  entry: ['webpack/hot/poll?1000', path.join(__dirname, 'src/main.ts')],
  externals: [
    nodeExternals({
      allowlist: ['webpack/hot/poll?1000'],
    }),
  ],
  plugins: [new CleanWebpackPlugin(), new HotModuleReplacementPlugin()],
  watch: true,
});

export default config;
