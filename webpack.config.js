module.exports = {
  context: __dirname, // we just want to use $cwd
  entry: {
    'react-tournament-bracket': ['./src/index.js']
  },

  output: {
    path: __dirname + '/dist',
    filename: '[name].js',
    library: 'ReactTournamentBracket',
    libraryTarget: 'umd'
  },

  /*externals: {
    'react': {
      commonjs:  'react',
      commonjs2: 'react',
      amd:       'react',
      root:      'React'
    },
    'lodash': {
      commonjs:  'lodash',
      commonjs2: 'lodash',
      amd:       'lodash',
      root:      '_'
    },
    'prop-types': {
      commonjs:  'prop-types',
      commonjs2: 'prop-types',
      amd:       'prop-types',
      root:      'PropTypes'
    }
  },*/

  module: {
    rules: [{
      exclude: /node_modules/,
      test: /\.jsx?$/,
      use: 'babel-loader'
    }, {
      exclude: /node_modules/,
      test: /\.scss$/,
      use: [
        'style-loader',
        'css-loader',
        'sass-loader'
      ]
    }]
  },
  resolve: {
    extensions: ['.js', '.jsx']
  }
};
