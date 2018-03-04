import $ from 'jquery';
import { pick } from 'lodash';
import React from 'react';
import ReactDOM from 'react-dom';
import BracketGenerator from './src/components/BracketGenerator.jsx';

function generateSeed(game, index, limit) {
  return (
    index === limit
    ? null
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
        id: `game-${index} home`,
        name: `My Game ${index} home`,
        num: index,
        scheduled: (new Date()).getTime(),
        score: { score: homeScore },
        seed:  generateSeed(game, index + 1, limit)
      },
      visitor: {
        id: `game-${index} visitor`,
        name: `My Game ${index} visitor`,
        num: index,
        scheduled: (new Date()).getTime(),
        score: { score: visitorScore },
        seed:  generateSeed(game, index + 1, limit)
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
      id: `game-${index} home`,
      name: `My Game ${index} home`,
      num: index,
      scheduled: (new Date()).getTime(),
      sides: generateSides(sourceGameProps, index, limit),
      sourceGame: (!!game ? pick(game, ['id', 'name', 'scheduled']) : null)
    };
  } else {
    return undefined;
  }
}

function generateRandomGames() {
  let homeScore = Math.floor(Math.random() * 100) + 1;
  let max = 10;
  let min = 1;
  let seed = 6; // 6 is the maximum number of rounds we should support; no tourney is going to have more than 32 setups for a single pool
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
      id: `game-0 home`,
      name: `My Game 0 home`,
      num: 0,
      scheduled: (new Date()).getTime(),
      score: { score: homeScore },
      seed:  rootHomeSide
    },
    visitor: {
      id: `game-0 visitor`,
      name: `My Game 0 visitor`,
      num: 0,
      scheduled: (new Date()).getTime(),
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
      { games, numRounds: 6 }
    ),
    document.getElementById('root')
  );
});
