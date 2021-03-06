// This config is extented from webpack.config.js. We use it for development with webpack-dev-server and autoreload/refresh

var webpackShared = require("./webpack.shared");
var webpack = require('webpack');
var WebpackConfig = require('webpack-config');
var path = require("path");

var mainConfig = new WebpackConfig().extend("webpack.config");

var devConfigExtension = {
  entry: {
    app: [
      // We are using next two entries for hot-reload
      'webpack-dev-server/client?http://localhost:3333',
      'webpack/hot/only-dev-server',
    ].concat(mainConfig.entry.app),
    wizard: [
      path.join(__dirname, 'src', 'wizard', 'index.tsx')
    ]
  },

  output: {
    filename: '[name].js',
    publicPath: "http://localhost:3333/assets/"
  },

  resolve: {
    // HACKHACK https://github.com/gaearon/react-hot-loader/issues/417#issuecomment-261548082
    // alias: {'react/lib/ReactMount': 'react-dom/lib/ReactMount' }
  },

  // more options here: http://webpack.github.io/docs/configuration.html#devtool
  devtool: "source-map",

  watch: true,

  module: {
    loaders: [
      { test: /\.ts(x?)$/, loaders: ['react-hot-loader/webpack', 'ts-loader?instance=jsx'], include: path.resolve(__dirname, "src") },
      { test: /\.css$/, exclude: /\.import\.css$/,  loader: "style!css", include: path.resolve(__dirname, "src") },
      { test: /\.import\.css$/,  loader: "style!css", include: path.resolve(__dirname, "src") },
      { test: /\.less$/, exclude: /\.module\.less$/, loader: "style!css!less", include: path.resolve(__dirname, "src") },
      { test: /\.module\.less$/, loader: "style!css?modules&importLoaders=1&localIdentName=[name]__[local]___[hash:base64:5]!less", include: path.resolve(__dirname, "src") },
      { test: /\.(jpg|png|jpg|png|woff2?|eot|ttf|svg|gif)$/, loader: "file-loader?name=[name].[ext]" }
    ]
  },

   plugins: [
    new webpack.optimize.CommonsChunkPlugin('vendors', 'vendors.js'),
    // Used for hot-reload
    new webpack.HotModuleReplacementPlugin(),
    new webpack.NoErrorsPlugin()
  ]
};

mainConfig.module.loaders = [];
mainConfig.plugins = [];

if (webpackShared.isProduction) {
  devConfigExtension.plugins.push(new webpack.optimize.UglifyJsPlugin({
     compress: {
        warnings: false
    }
  }));
  devConfigExtension.plugins.push(new webpack.DefinePlugin({
    'process.env': {NODE_ENV: '"production"'}
  }));

  delete devConfigExtension.devtool;
}

module.exports = mainConfig.merge(devConfigExtension);
