import { cloneDeep } from 'lodash';
import { findTeams } from '../util';
import { gatherFormData } from 'SwiS';

// TODO: Make this more functional
/* setScore()
 *
 * Traverses the games tree until we find the team property we want as determined
 * by its matching game and round numbers where we then set its score
 *
 * @param event [SyntheticEvent] The event that called setScore
 *
 * @param game [Number] The game number
 *
 * @param games [Object] The games object that we pass to BracketGenerator as a prop
 *
 * @param round [Number] The round number
 *
 * @returns [Object] returns nothing yet but should return a new games object
 */
export function setScore(event, game, games, round) {
  //const newGames = cloneDeep(games);
  event.preventDefault();
  const data = gatherFormData(event);
  const teams = findTeams(undefined, game, games, round);
  teams.home.score.score = Number(data.score.home);
  teams.visitor.score.score = Number(data.score.visitor);
  //return newGames;
}
