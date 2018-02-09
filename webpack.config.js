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

  externals: {
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
  },

  module: {
    loaders: [{
      test: /\.jsx?$/,
      exclude: /node_modules/,
      loader: 'babel',
      query: {
        presets: ['react', 'es2015', 'stage-0'] // we need to use this preset so that Babel doesn't choke on JSX syntax
      }
    }]
  },
  resolve: {
    extensions: [ '', '.js', '.jsx' ]
  }
};
