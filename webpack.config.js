const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const { createProxyMiddleware } = require('http-proxy-middleware');
module.exports = {
  
  entry:{
    main:"./src/entry.js",
    page2: "./src/mltf.js",
  }, 
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: '[name].[contenthash].js',
  },
  resolve: {
    extensions: [".js"],
    // alias: {
    //   'tf': '@tensorflow/tfjs',
    //   'posenet': '@tensorflow-models/posenet',
    // }

  },
  experiments: {
    topLevelAwait: true,
  },
  module: {
    rules: [
      {
        test: /\.css$/,
        use: ["style-loader","css-loader"],
        exclude:/node_moduels/,
      },
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env']
          }
        }
      }
    ],
  },
  devtool: "source-map",
  // externals: {
  //   '@tensorflow-models/posenet': 'posenet',
  // },
  plugins: [
    new HtmlWebpackPlugin({
      template: path.join(__dirname, "public/index.html"),
      chunks: ['main'],
      filename: 'index.html'
    }),
    new HtmlWebpackPlugin({
      template: path.join(__dirname, "public/page2.html"),
      chunks: ['page2'],
      filename: 'page2.html'
    }),
  ],

  
  

};
