

const path = require('path')
const genHtml = require('./plugins/genHtml.js')

module.exports = {
  entry: path.join(__dirname, '../src/app.js'),
  output: {
    filename: 'app.bundle.js',
    path: path.join(__dirname, '../dist')
  },
  module: {
    rules: [
      {
        test: /\.css$/,
        use: ['css-loader']
      }
    ]
  },
  plugins: [
    new genHtml({
      template: path.join(__dirname, '../index.html'),
      filename: 'app.html',
      inject: true
    })
  ]
}