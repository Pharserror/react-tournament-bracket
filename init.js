import $ from 'jquery';
import React from 'react';
import ReactDOM from 'react-dom';
import BracketGenerator from './src/components/BracketGenerator.jsx';

function generateSides(game, index, limit) {
  if (index <= limit) {
    return  {
      home:    {
        seed: generateGame(game, index + 1, limit, {
          displayName: `My Game ${index}`,
          rank: index
        })
      },
      visitor: {
        seed: generateGame(game, index + 1, limit, {
          displayName: `My Game ${index}`,
          rank: index
        })
      }
    };
  } else {
    return undefined;
  }
}

function generateGame(game, index, limit, options = {}) {
  if (index <= limit) {
    return {
      ...options,
      id: `game-${index}`,
      name: `My Game`,
      scheduled: (new Date()).getTime(),
      sides: generateSides(game, index + 1, limit),
      sourceGame: game
    };

  } else {
    return undefined;
  }
}

function generateRandomGames() {
  let max = 10;
  let min = 1;
  let seed = Math.floor(Math.random() * (max - min + 1)) + min;
  let games = [generateGame(undefined, 0, seed)];

  //for (var i = 1; i <= seed; i++) {
  generateGame(games[0], min, seed);
  //}
  return games;
}

$(document).ready(function() {
  let games = generateRandomGames();

  ReactDOM.render(
    React.createElement(
      BracketGenerator,
      { games: games }
    ),
    document.getElementById('root')
  );
});
