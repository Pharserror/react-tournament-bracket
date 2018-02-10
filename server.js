var path = require('path');
var webpack = require('webpack');
var config = require('./webpack.config');
var express = require('express');
var compiler = webpack(config);

var app = express();

// Tell Express to use webpack
app.use(require('webpack-dev-middleware')(compiler, {
  noInfo: true,
  publicPath: config.output.publicPath
}));

// We should make this file any compiled third party libraries
// Tell Express where to find the assets we need
app.get('/init.js', function(req, res) {
  // Nothing special yet
});

// We don't need to use the Express router because we want to render the SPA for
// every route and that SPA will use the React-Router
app.get(/^\/(?!images).*/, function(req, res) {
  res.sendFile(path.join(__dirname, './index.html'));
});

// Last we tell Express what port to listen on
app.listen(9000, 'localhost', function(err) {
  if (err) {
    return console.error(err);
  }
  console.log('Listening at http://0.0.0.9000');
});
