const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const CopyPlugin = require('copy-webpack-plugin')
const { spawn } = require('child_process')
const electron = require('electron')
const { watch } = require('fs')

let electronProcess

const respawnElectron = () => {
  if (electronProcess) electronProcess.kill()
  electronProcess = spawn(electron, ['electron', '--force-color-profile=srgb'])
}

module.exports = () => ({
  plugins: [
    new HtmlWebpackPlugin({
      template: 'src/index.html',
    }),

    new CopyPlugin({
      patterns: [
        {
          from: 'electron',
          to: '', 
        },
        {
          from: 'package.json',
          to: '', 
        },
      ],
    }),

    new class StartElectron {
      apply (compiler) {
        let started = false

        compiler.hooks.done.tap('start electron', () => {
          if (process.env.NODE_ENV === 'development' && !started) {
            started = true
            
            respawnElectron()

            watch(path.resolve('electron'), respawnElectron)
          }
        })
      }
    },
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

  mode: process.env.NODE_ENV,

  devtool: process.env.NODE_ENV === 'production' ? 'none' : 'source-map',

  devServer: {
    host: '0.0.0.0',
    port: 53874,
    historyApiFallback: true,
  },
})
