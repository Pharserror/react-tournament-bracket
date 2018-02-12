import $ from 'jquery';
import { isObject, pick } from 'lodash';
import React from 'react';
import ReactDOM from 'react-dom';
import BracketGenerator from './src/components/BracketGenerator.jsx';

function generateSeed(game, index, limit) {
  return (
    index === limit
    ? {
      sourceGame: null,
      rank: index,
      displayName: `Bottom of ${index}`
    }
    : generateGame(game, index, limit, {
      displayName: `My Game ${index}`,
      rank:        index
    })
  )
}

function generateSides(game, index, limit) {
    debugger;
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
  }
}

function generateGame(game, index, limit, options = {}) {
  if (index <= limit) {
    let sourceGameProps = {
      id:        `game-${index}`,
      name:      'My Game',
      scheduled: (new Date()).getTime(),
      sides:     generateSides(this, index + 1, limit),
    };

    return {
      ...options,
      ...sourceGameProps,
      sourceGame: !!game && isObject(game) ? pick(game, ['id', 'name', 'scheduled', 'sides']) : undefined
      //sourceGame: (!!game && !!game.id ? { id: game.id, name: 'My Game' } : undefined)
      //sourceGame: game // || this
    };
  } else {
    return undefined;
  }
}

function generateRandomGames() {
  let homeScore = Math.floor(Math.random() * 100) + 1;
  let visitorScore = Math.floor(Math.random() * 100) + 1;
  let max = 10;
  let min = 1;
  let seed = 3; //Math.floor(Math.random() * (max - min + 1)) + min;
  let rootGame = generateGame(undefined, 0, 0);

  //rootGame.sides = {
  //  home:    {
  //    score: { score: homeScore },
  //    seed:  generateSeed(rootGame, min, seed)
  //  },
  //  visitor: {
  //    score: { score: visitorScore },
  //    seed:  generateSeed(rootGame, min, seed)
  //  }
  //};

  //rootGame.sides.home.seed.sourceGame.sides = rootGame.sides;
  //rootGame.sides.visitor.seed.sourceGame.sides = rootGame.sides;

  let rootHomeSide = generateGame(rootGame, min, seed, {
    displayName: `My Game ${min}`,
    rank: min
  });

  let rootVisitorSide = generateGame(rootGame, min, seed, {
    displayName: `My Game ${min}`,
    rank: min
  });

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

  debugger;
  return [rootGame];
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
