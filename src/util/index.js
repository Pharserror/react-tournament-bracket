import { chunk } from 'lodash';

/* findTeams()
 *
 * Search the games tree and return the object that corresponds to the team we
 * are looking for
 *
 * @param game [Number] the number of the game in the round
 *
 * @param games [Object] our current scope of the games tree
 *
 * @param round [Number] the round in which the game is
 *
 * @returns [Object]
 */
export function findTeams(chunks, game, games, round) {
  let homeOrVisitor;
  let max = chunks ? chunks.length : Math.pow(2, round);
  let nextChunk;
  chunks = chunk((chunks ? chunks : generateSpread(max, 1)), max / 2);

  chunks.forEach((chunk, index) => {
    if (chunk.indexOf(game) > -1) {
      homeOrVisitor = index === 0 ? 'home' : 'visitor';
      nextChunk = chunk;
    }
  });

  if (games.round + 1 === round) {
    return [games.sides[homeOrVisitor], games.sides[homeOrVisitor].seed.sides];
  }

  return findTeams(nextChunk, game, games.sides[homeOrVisitor].seed, round);
}

export function generateSpread(max, modifier = 0) {
  return (
    Array
      .apply(null, { length: max })
      .map(Number.call, number => number + modifier)
  );
}
