import $ from 'jquery';
import { isNumber, pick } from 'lodash';
import React from 'react';
import ReactDOM from 'react-dom';
import BracketGenerator from './src/components/BracketGenerator.jsx';

function calculateScores() {
  let homeScore = Math.floor(Math.random() * 100) + 1;
  let visitorScore = Math.floor(Math.random() * 100) + 1;
  let scores = { homeScore, visitorScore };

  // Haven't figured out how to deal with ties yet
  if (homeScore === visitorScore) {
    console.log("recalculating...")
    scores = calculateScores();
  }

  return scores;
}

function generateDefaultOptions(index, roundLimit, side) {
    let name;

    if (index < roundLimit) {
      let winnerMatchIndex = (
        side === 'home'
        ? window.roundGameCounter[index] + window.roundGameCounter[index]
        : window.roundGameCounter[index] + window.roundGameCounter[index] + 1
      );

      name = `Winner of ${index + 1}-${winnerMatchIndex - 1}`;
    } else {
      name = `${side}-${index}-${window.roundGameCounter[index]}`;
    }

    return {
      id:        name,
      name:      `My Game ${index}-${window.roundGameCounter[index] + 1}${!!side ? ` ${side}`: ''}`,
      num:       index,
      scheduled: (new Date()).getTime(),
      team:      {
        id:   name,
        name: name
      }
    };
  //}
}

function generateSeed(game, index, numberOfRounds, roundLimit) {
  return (
    index === numberOfRounds
    ? null
    : generateGame(game, index, numberOfRounds, roundLimit, {
      displayName: `My Game ${index}-${window.roundGameCounter[index]}`,
      rank:        index
    })
  )
}

function generateSeeds(game, index, numberOfRounds, roundLimit) {
  return {
    home:    generateSeed(game, index + 1, numberOfRounds, roundLimit),
    visitor: generateSeed(game, index + 1, numberOfRounds, roundLimit)
  };
}

function generateSides(game, index, numberOfRounds, roundLimit) {
  if (index <= numberOfRounds) {
    let counter;
    let scores = calculateScores();
    let { homeScore, visitorScore } = scores;
    let seeds = generateSeeds(game, index, numberOfRounds, roundLimit);

    if (isNumber(window.roundGameCounter[index])) {
      counter = ++window.roundGameCounter[index];
    } else {
      window.roundGameCounter[index] = 0;
      counter = 0;
    }

    return  {
      home:    {
        ...generateDefaultOptions(index, roundLimit, 'home'),
        score: { score: homeScore },
        seed:  seeds.home
      },
      visitor: {
        ...generateDefaultOptions(index, roundLimit, 'visitor'),
        score: { score: visitorScore },
        seed:  seeds.visitor
      }
    };
  } else {
    return undefined;
  }
}

function generateGame(game, index, numberOfRounds, roundLimit, options = {}) {
  if (index <= numberOfRounds) {
    let sourceGameProps = {
      id:   `game-${index}-${window.roundGameCounter[index]}`,
      name: 'My Game'
    };

    return {
      ...generateDefaultOptions(index, roundLimit),
      ...options,
      sides: generateSides(sourceGameProps, index, numberOfRounds, roundLimit),
      sourceGame: (!!game ? pick(game, ['id', 'name', 'scheduled']) : null)
    };
  } else {
    return undefined;
  }
}

function generateRandomGames(options = {}) {
  window.roundGameCounter = { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  const { roundLimit } = options;
  let homeScore = (
     roundLimit
     ? roundLimit > 1
       ? Math.floor(Math.random() * 100) + 1
       : null
     : Math.floor(Math.random() * 100) + 1
  );

  let min = 1;
  let numberOfRounds = 6;
  let rootGame = generateGame(undefined, 0, 0, roundLimit);
  let rootHomeSide = generateGame(rootGame, min, numberOfRounds, roundLimit, {
    displayName: `My Game ${min}-${window.roundGameCounter[0]}`,
    rank: min
  });

  let rootVisitorSide = generateGame(rootGame, min, numberOfRounds, roundLimit, {
    displayName: `My Game ${min}-${window.roundGameCounter[0]}`,
    rank: min
  });

  let visitorScore = (
    roundLimit
    ? roundLimit > 1
      ? Math.floor(Math.random() * 100) + 1
      : null
    : Math.floor(Math.random() * 100) + 1
  );

  rootGame.sides = {
    home:    {
      ...generateDefaultOptions(0, roundLimit, 'home'),
      score: { score: homeScore },
      seed:  rootHomeSide,
    },
    visitor: {
      ...generateDefaultOptions(0, roundLimit, 'visitor'),
      score: { score: visitorScore },
      seed:  rootVisitorSide,
    }
  };

  return [rootGame];
}

$(document).ready(function() {
  let games = generateRandomGames({ roundLimit: 5 });

  console.log(games);

  ReactDOM.render(
    React.createElement(
      BracketGenerator,
      { games, numRounds: 6 }
    ),
    document.getElementById('root')
  );
});
