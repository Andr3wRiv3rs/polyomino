const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')

module.exports = () => ({
  plugins: [
    new HtmlWebpackPlugin({
      template: 'src/index.html',
    }),
  ],

  module: {
    rules: [
      {
        test: /\.css$/i,
        use: [
          'style-loader', 
          {
            loader: 'css-loader',
            options: {
              modules: true,
            },
          },
        ],
      },
      {
        test: /\.(png|svg|jpg|webp|gif|woff|woff2|eot|ttf|otf)$/,
        use: [
          {
            loader: 'file-loader',
            options: {
              esModule: false,
            },
          },
        ],
      },
    ],
  },

  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
    extensions: ['.js'],
  },

  output: {
    path: path.join(__dirname, 'dist'),
    filename: "[name].bundle.js",
    chunkFilename: '[name].bundle.js',
  },

  devtool: 'source-map',

  devServer: {
    host: '0.0.0.0',
    port: 53874,
    historyApiFallback: true,
  },
})
