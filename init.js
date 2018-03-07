import $ from 'jquery';
import { pick } from 'lodash';
import React from 'react';
import ReactDOM from 'react-dom';
import BracketGenerator from './src/components/BracketGenerator.jsx';

function generateDefaultOptions(index, side) {
  return {
    id:        `game-${index}`,
    name:      `My Game ${index}${!!side ? ` ${side}`: ''}`,
    num:       index,
    scheduled: (new Date()).getTime(),
    team:      { id: `${side}-0`, name: `${side}-0` }
  };
}

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
        ...generateDefaultOptions(index, 'home'),
        score: { score: homeScore },
        seed:  generateSeed(game, index + 1, limit)
      },
      visitor: {
        ...generateDefaultOptions(index, 'visitor'),
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
      ...generateDefaultOptions(index),
      ...options,
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
      ...generateDefaultOptions(0, 'home'),
      score: { score: homeScore },
      seed:  rootHomeSide,
      team: { id: 'home-0', name: 'home-0' }
    },
    visitor: {
      ...generateDefaultOptions(0, 'visitor'),
      scheduled: (new Date()).getTime(),
      score: { score: visitorScore },
      seed:  rootVisitorSide,
      team: { id: 'visitor-0', name: 'visitor-0' }
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
