import { get, isNumber, pick, zipObject } from 'lodash';

export function buildGameOptions(options) {
  switch(options.startingGames.constructor.name) {
    case 'Array': {
      return {
        teamNames: options.startingGames
      }
    }
    default: {
      return options;
    }
  }
}

export function calculateScores() {
  let homeScore = Math.floor(Math.random() * 100) + 1;
  let visitorScore = Math.floor(Math.random() * 100) + 1;
  let scores = { homeScore, visitorScore };

  // Haven't figured out how to deal with ties yet
  if (homeScore === visitorScore) {
    scores = calculateScores();
  }

  return scores;
}

export function determineNumberOfRounds(games) {
  switch(games.constructor.name) {
    case 'Array': {
      if (games.length % 2 !== 0 || games.length % 3 === 0) {
        try {
          throw new Error('You must pass a number of games equal to: 1, 2, 4, 8, 16, or 32!');
        } catch(error) {
          console.log(error.message);
        }
      }

      for(let i = 0; i <= 5; i++) {
        if (games.length === Math.pow(2, i)) { return i + 1; }
      }
    }
    default: {
      return games.length;
    }
  }
}

export function getTeamName(index, side, teamNames) {
  switch(teamNames.constructor.name) {
    case 'Array': {
      return teamNames[window.roundGameCounter[index] - 1][(side === 'home' ? 0 : 1)]
    }
    default: {
      return teamNames;
    }
  }
}

export function generateDefaultOptions(index, roundLimit, seeds, side, options = {}) {
  let name;

  if (index < roundLimit) {
    let winnerMatchIndex = (
      side === 'home'
      ? window.roundGameCounter[index] + window.roundGameCounter[index]
      : window.roundGameCounter[index] + window.roundGameCounter[index] + 1
    );

    name = `Winner of ${index + 1}-${winnerMatchIndex - 1}`;
  } else {
    //name = `${side}-${index}-${window.roundGameCounter[index]}`;
    let homeSide = get(seeds, `${side}.sides.home`);
    let homeScore = get(homeSide, 'score.score');
    let visitorSide = get(seeds, `${side}.sides.visitor`);
    let visitorScore = get(visitorSide, 'score.score');
    name = index === roundLimit
    ? getTeamName(index, side, options.teamNames)
    : (
      isNumber(homeScore) && isNumber(visitorScore)
      ? homeScore > visitorScore
        ? homeSide.team.name
        : visitorSide.team.name
      : `game-${index}-${window.roundGameCounter[index]}${!!side ? ` ${side}` : ''}`
    );
  }

  return {
    side,
    game:      window.roundGameCounter[index],
    id:        name,
    name:      `My Game ${index}-${window.roundGameCounter[index]}${!!side ? ` ${side}`: ''}`,
    num:       index,
    round:     index,
    scheduled: (new Date()).getTime(),
    team:      {
      id:   name,
      name: name
    }
  };
}

export function generateSeed(game, index, numberOfRounds, roundLimit, options = {}) {
  return new Promise((resolve, reject) => {
    if (index === numberOfRounds) {
      resolve(null);
    } else {
      generateGame(game, index, numberOfRounds, roundLimit, {
        ...options,
        displayName: `My Game ${index}-${window.roundGameCounter[index]}`,
        rank:        index
      }).then(game => { resolve(game); });
    }
  });
}

export function generateSeeds(game, index, numberOfRounds, roundLimit, options = {}) {
  return new Promise((resolve, reject) => {
    generateSeed(game, index + 1, numberOfRounds, roundLimit, options).then(homeSeed => {
      generateSeed(game, index + 1, numberOfRounds, roundLimit, options).then(visitorSeed => {
        resolve({ home: homeSeed, visitor: visitorSeed });
      })
    });
  });
}

export function generateSides(game, index, numberOfRounds, roundLimit, options = {}) {
  return new Promise((resolve, reject) => {
    if (index <= numberOfRounds && !!game) {
      let counter;
      let scores = { homeScore: 0, visitorScore: 0 } // for random games: calculateScores();
      let { homeScore, visitorScore } = scores;

      if (isNumber(window.roundGameCounter[index])) {
        counter = ++window.roundGameCounter[index];
      } else {
        window.roundGameCounter[index] = 0;
        counter = 0;
      }

      generateSeeds(game, index, numberOfRounds, roundLimit, options).then(seeds => {
        resolve({
          home:    {
              ...generateDefaultOptions(index, roundLimit, seeds, 'home', options),
            score: { score: homeScore },
            seed:  seeds.home
          },
          visitor: {
              ...generateDefaultOptions(index, roundLimit, seeds, 'visitor', options),
            score: { score: visitorScore },
            seed:  seeds.visitor
          }
        });
      });
    } else {
      resolve(undefined);
    }
  });
}

export function generateGame(game, index, numberOfRounds, roundLimit, options = {}) {
  return new Promise((resolve, reject) => {
    if (index <= numberOfRounds) {
      let sides;
      let sourceGameProps = (
        !!game
        ? ({
          id:   `game-${index}-${window.roundGameCounter[index]}`,
          name: game.name || game.displayName
        }) : undefined
      );

      generateSides(sourceGameProps, index, numberOfRounds, roundLimit, options).then(sides => {
        resolve({
          ...generateDefaultOptions(index, roundLimit, null, null, options),
          ...options,
          sides,
          sourceGame: (!!game ? pick(game, ['id', 'name', 'scheduled']) : null)
        });
      });
    } else {
      resolve(undefined);
    }
  });
}

export function generateGames(options = {}) {
  return new Promise((resolve, reject) => {
    if (!!options.startingGames) {
      let gameOptions = buildGameOptions(options);
      let min = 1;
      let numberOfRounds = determineNumberOfRounds(options.startingGames);
       window.roundGameCounter = (
        zipObject(
          Array.apply(null, { length: numberOfRounds }).map(Number.call, (number) => number),
          (new Array(numberOfRounds)).fill(0)
        )
      );

      let { roundLimit } = options;

      generateGame(undefined, 0, 0, roundLimit, gameOptions).then(rootGame => {
        generateGame(rootGame, min, numberOfRounds, roundLimit, {
          ...gameOptions,
          displayName: `My Game ${min}-${window.roundGameCounter[0]}`,
          rank: min
        }).then(homeGame => {
          generateGame(rootGame, min, numberOfRounds, roundLimit, {
            ...gameOptions,
            displayName: `My Game ${min}-${window.roundGameCounter[0]}`,
            rank: min
          }).then(visitorGame => {
            rootGame.sides = {
              home:    {
                ...generateDefaultOptions(0, roundLimit, {}, 'home', options),
                score: { score: 0 },
                seed:  homeGame,
              },
              visitor: {
                ...generateDefaultOptions(0, roundLimit, {}, 'visitor', options),
                score: { score: 0 },
                seed:  visitorGame,
              }
            };

            resolve([rootGame]);
          });
        });
      });
    } else {
      generateRandomGames(options);
    }
  });
}

export function generateRandomGames(options = {}) {
  return new Promise((resolve, reject) => {
    window.roundGameCounter = { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    const { roundLimit } = options;
    let homeScore = (
      roundLimit
      ? roundLimit > 1
        ? Math.floor(Math.random() * 100) + 1
        : null
      : Math.floor(Math.random() * 100) + 1
    );

    let visitorScore = (
      roundLimit
      ? roundLimit > 1
        ? Math.floor(Math.random() * 100) + 1
        : null
      : Math.floor(Math.random() * 100) + 1
    );

    let min = 1;
    let numberOfRounds = 3;

    generateGame(undefined, 0, 0, roundLimit).then(rootGame => {
      generateGame(rootGame, min, numberOfRounds, roundLimit, {
        displayName: `My Game ${min}-${window.roundGameCounter[0]}`,
        rank: min
      }).then(homeGame => {
        generateGame(rootGame, min, numberOfRounds, roundLimit, {
          displayName: `My Game ${min}-${window.roundGameCounter[0]}`,
          rank: min
        }).then(visitorGame => {
          rootGame.sides = {
            home:    {
              ...generateDefaultOptions(0, roundLimit, {}, 'home', options),
              score: { score: homeScore },
              seed:  homeGame,
            },
            visitor: {
              ...generateDefaultOptions(0, roundLimit, {}, 'visitor', options),
              score: { score: visitorScore },
              seed:  visitorGame,
            }
          };

          resolve([rootGame]);
        });
      });
    });
  });
}
