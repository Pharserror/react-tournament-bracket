import { keys, map } from 'lodash';

export default function winningPathLength(game, visited = {}) {
  if (visited[ game.id ]) {
    return 0;
  }

  visited[game.id] = true;

  // Return the number of games we must traverse to get to the grand finals
  return (
    1 + (
      keys(game.sides).length > 0
      ? (
        Math.max.apply(
          Math,
          map(
            game.sides,
            ({ seed }) => (
              (!!seed && !!seed.sourceGame && seed.rank === 1)
              ? winningPathLength(seed.sourceGame, visited)
              : 0
            )
          )
        )
      ) : 0
    )
  );
}
