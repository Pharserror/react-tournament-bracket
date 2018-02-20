import $ from 'jquery';
import { pick } from 'lodash';
import React from 'react';
import ReactDOM from 'react-dom';
import BracketGenerator from './src/components/BracketGenerator.jsx';

function generateSeed(game, index, limit) {
  return (
    index === limit
    ? null /*{
      displayName: `Bottom of ${index}`,
      name:        'My Game',
      rank:        index,
      sourceGame:  null,
    }*/
    : generateGame(game, index, limit, {
      displayName: `My Game ${index}`,
      rank:        index
    })
  )
}

function generateSides(game, index, limit) {
  if (index <= limit) {
    let homeScore = Math.floor(Math.random() * 100) + 1;
    let visitorScore = Math.floor(Math.random() * 100) + 1;

    return  {
      home:    {
        score: { score: homeScore },
        seed:  generateSeed(game, index, limit)
      },
      visitor: {
        score: { score: visitorScore },
        seed:  generateSeed(game, index, limit)
      }
    };
  } else {
    return undefined;
  }
}

function generateGame(game, index, limit, options = {}) {
  if (index <= limit) {
    let sourceGameProps = { id: `game-${index}`, name: 'My Game' };

    return {
      ...options,
      id: sourceGameProps.id,
      name: 'My Game',
      scheduled: (new Date()).getTime(),
      sides: generateSides(sourceGameProps, index + 1, limit),
      sourceGame: (!!game ? pick(game, ['id', 'name', 'scheduled']) : null)
      //sourceGame: null //game // || this
    };
  } else {
    return undefined;
  }
}

function generateRandomGames() {
  let homeScore = Math.floor(Math.random() * 100) + 1;
  let max = 10;
  let min = 1;
  window.seed = 4; //Math.floor(Math.random() * (max - min + 1)) + min;
  let rootGame = generateGame(undefined, 0, 0);
  let rootHomeSide = generateGame(rootGame, min, seed, {
    displayName: `My Game ${min}`,
    rank: min
  });

  let rootVisitorSide = generateGame(rootGame, min, seed, {
    displayName: `My Game ${min}`,
    rank: min
  });

  let visitorScore = Math.floor(Math.random() * 100) + 1;

  rootGame.sides = {
    home:    {
      score: { score: homeScore },
      seed:  rootHomeSide
    },
    visitor: {
      score: { score: visitorScore },
      seed:  rootVisitorSide
    }
  };

  return [rootGame];
}

$(document).ready(function() {
  let games = generateRandomGames();

  console.log(games);

  ReactDOM.render(
    React.createElement(
      BracketGenerator,
      { games, numGames: window.seed }
    ),
    document.getElementById('root')
  );
});
