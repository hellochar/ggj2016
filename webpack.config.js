var path = require("path");
var webpackShared = require("./webpack.shared");
var webpack = require('webpack');
var ExtractTextPlugin = require('extract-text-webpack-plugin');

var nodeModulesPath = path.join(__dirname, 'node_modules');

var config = {
  // entry points - each will produce one bundled js file and one css file if there is any css in dependency tree
  entry: {
    vendors: [
      'react',
      'react-dom',
      'react-redux'
    ],
    app: [
      path.join(__dirname, 'src', 'index.tsx')
    ]
  },

  // This is path to loaders
  resolveLoader: {
    root: nodeModulesPath
  },

  resolve: {
    extensions: ['', '.tsx', '.ts', '.js', '.less', '.css'],
    root: [
      path.join(__dirname, "src")
    ]
  },

  output: {
      path: path.join(__dirname, 'build'),
      filename: '[name].js'
  },

  module: {
    preLoaders: [
      { test: /\.ts(x?)$/, loader: "tslint", include: path.resolve(__dirname, "src") },
    ],
    noParse: [],
    loaders: [
      { test: /\.ts(x?)$/, loader: 'ts-loader?instance=jsx', include: path.resolve(__dirname, "src") },
      { test: /\.css$/,  loader: ExtractTextPlugin.extract("style-loader", "css-loader?minimize"), include: path.resolve(__dirname, "src") },
      { test: /\.less$/, exclude: /\.module\.less$/, loader: ExtractTextPlugin.extract("style-loader", "css-loader?minimize!less-loader?compress"), include: path.resolve(__dirname, "src") },
      { test: /\.module\.less$/,
        loader: ExtractTextPlugin.extract("style-loader","css-loader?minimize&modules&importLoaders=1&localIdentName=[name]__[local]___[hash:base64:5]!less-loader?-compress"),
        include: path.resolve(__dirname, "src") },
      { test: /\.(jpg|png|woff2?|eot|ttf|svg|gif)$/, loader: "file-loader?name=[name]_[hash].[ext]" }
    ]
  },

  plugins: [
    new webpack.optimize.CommonsChunkPlugin('vendors', 'vendors.js'),
    new ExtractTextPlugin('[name].css', { allChunks: true })
  ],

  tslint: {
    // Rules are in tslint.json
    emitErrors: false,
    formattersDirectory: path.join(nodeModulesPath, 'tslint-loader', 'formatters')
  },
};

if (webpackShared.isProduction) {
  config.plugins.push(new webpack.optimize.UglifyJsPlugin({
     compress: {
        warnings: false
    }
  }));
  config.plugins.push(new webpack.DefinePlugin({
    'process.env': {NODE_ENV: '"production"'}
  }));
}

module.exports = config;
