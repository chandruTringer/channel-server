const path = require('path');

module.exports = {
  entry: './libs/fluxiRTC.js',
  output: {
    path: path.resolve(__dirname, 'public/js'),
    filename: 'fluxiRTC.bundle.js'
  }
};
