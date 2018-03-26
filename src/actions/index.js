import { cloneDeep } from 'lodash';
import { findTeam } from '../util';

export function setScore(event, game, games, round, score, side) {
  //const newGames = cloneDeep(games);
  const team = findTeam(undefined, game, games, round, side);
  team.score.score = score;
  //return newGames;
}
