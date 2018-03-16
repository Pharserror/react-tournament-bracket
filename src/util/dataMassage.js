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

export function generateDefaultOptions(index, roundLimit, seeds, side) {
  let name;

  if (index <= roundLimit) {
    let winnerMatchIndex = (
      side === 'home'
      ? window.roundGameCounter[index] + window.roundGameCounter[index]
      : window.roundGameCounter[index] + window.roundGameCounter[index] + 1
    );

    name = `Winner of ${index + 1}-${winnerMatchIndex + 1}`;
  } else {
    //name = `${side}-${index}-${window.roundGameCounter[index]}`;
    let homeSide = get(seeds, `${side}.sides.home`);
    let homeScore = get(homeSide, 'score.score');
    let visitorSide = get(seeds, `${side}.sides.visitor`);
    let visitorScore = get(visitorSide, 'score.score');
    name = (
      isNumber(homeScore) && isNumber(visitorScore)
      ? homeScore > visitorScore
        ? homeSide.team.name
        : visitorSide.team.name
        : `game-${index}-${window.roundGameCounter[index]}${!!side ? ` ${side}` : ''}`
    );
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
}

export function generateSeed(game, index, numberOfRounds, roundLimit) {
  return new Promise((resolve, reject) => {
    if (index === numberOfRounds) {
      resolve(null);
    } else {
      generateGame(game, index, numberOfRounds, roundLimit, {
        displayName: `My Game ${index}-${window.roundGameCounter[index]}`,
        rank:        index
      }).then(game => { resolve(game); });
    }
  });
}

export function generateSeeds(game, index, numberOfRounds, roundLimit) {
  return new Promise((resolve, reject) => {
    generateSeed(game, index + 1, numberOfRounds, roundLimit).then(homeSeed => {
      generateSeed(game, index + 1, numberOfRounds, roundLimit).then(visitorSeed => {
        resolve({ home: homeSeed, visitor: visitorSeed });
      })
    });
  });
}

export function generateSides(game, index, numberOfRounds, roundLimit) {
  return new Promise((resolve, reject) => {
    if (index <= numberOfRounds && !!game) {
      let counter;
      let scores = calculateScores();
      let { homeScore, visitorScore } = scores;

      if (isNumber(window.roundGameCounter[index])) {
        counter = ++window.roundGameCounter[index];
      } else {
        window.roundGameCounter[index] = 0;
        counter = 0;
      }

      generateSeeds(game, index, numberOfRounds, roundLimit).then(seeds => {
        resolve({
          home:    {
            ...generateDefaultOptions(index, roundLimit, seeds, 'home'),
            score: { score: homeScore },
            seed:  seeds.home
          },
          visitor: {
            ...generateDefaultOptions(index, roundLimit, seeds, 'visitor'),
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
          name: 'My Game'
        }) : undefined
      );

      generateSides(sourceGameProps, index, numberOfRounds, roundLimit).then(sides => {
        resolve({
          ...generateDefaultOptions(index, roundLimit),
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
              ...generateDefaultOptions(0, roundLimit, {}, 'home'),
              score: { score: homeScore },
              seed:  homeGame,
            },
            visitor: {
              ...generateDefaultOptions(0, roundLimit, {}, 'visitor'),
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
