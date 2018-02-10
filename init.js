var $ = require('jquery');
var React = require('react');
var ReactDOM = require('react-dom');
var BracketGenerator = require('./src/components/BracketGenerator.jsx');

function generateSides(game, index, limit) {
  if (index <= limit) {
    return  {
      home:    { seed: generateGame(game, index + 1, limit) },
      visitor: { seed: generateGame(game, index + 1, limit) }
    };
  } else {
    return undefined;
  }
}

function generateGame(game, index, limit) {
  if (index <= limit) {
    return {
      id: `game-${index}`,
      scheduled: (new Date()).getTime(),
      sides: generateSides(game, index + 1, limit),
      sourceGame: game
    };

  } else {
    return undefined;
  }
}

function generateRandomGames() {
  var max = 10;
  var min = 1;
  var seed = Math.floor(Math.random() * (max - min + 1)) + min;
  var games = [generateGame(undefined, 0, seed)];

  //for (var i = 1; i <= seed; i++) {
  generateGame(games[0], min, seed);
  //}
}

$(document).ready(function() {
  var games = generateRandomGames();
  ReactDOM.render(
    React.createElement(
      BracketGenerator,
      { games: games }
    ),
    document.getElementById('root')
  );
});
