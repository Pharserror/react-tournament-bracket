import PropTypes from 'prop-types';
import React, { Component, PureComponent } from 'react';
import { chain, filter, map, some } from 'lodash';
import Bracket from './Bracket';
import winningPathLength from '../util/winningPathLength';
import GameShape from './GameShape';

/* makeFinals()
 *
 *
 */
const makeFinals = ({ games }) => {
  /* TODO: This is seriously convoluted. We should be able to grab the keys of
   * the games and pass over the array with indexOf
   * Unless I revisit this later and find a reason for this madness then it
   * needs to be rewritten to be much simpler
   */
  const isInGroup = (() => {
    const gameIdHash =
      // cycle through all of the games
      chain(games)
      // create an object of all top level games with keys set to each game's id
      .keyBy('id')
      // Create a new object like { gameName1: 1, ... gameNameN: 1 }
      .reduce((allGames, gameData, gameName) => {
        allGames[gameName] = 1;
        return allGames;
      }, {})
      // Return the created object
      .value();

      /* Finally we return a function that will tell us if a game with id is in
       * the hash of games passed in
       */
    return id => Boolean(gameIdHash[ id ]);
  })();

  const gamesFeedInto = map(
    games,
    game => ({
      ...game,
      feedsInto: filter(
        games,
        ({ id, sides }) => (
          /* If the id of the game is in our top-level object or if it has a
           * sides property (not the final game?) or its seed is the first game
           * then it will be returned
           */
          isInGroup(id) &&
          some(
            sides,
            ({ seed }) => (
              seed !== null &&
              seed.sourceGame !== null &&
              seed.rank === 1 &&
              seed.sourceGame.id === game.id
            )
          )
        )
      )
    })
  );

  return (
    chain(gamesFeedInto)
    // get the games that don't feed into anything else in the group, i.e. finals for this game group
    .filter(({ feedsInto }) => feedsInto.length === 0)
    .map(
      // get their heights
      game => ({
        game,
        height: winningPathLength(game)
      })
    )
    // render the tallest bracket first
    .sortBy(({ height }) => height * -1)
    .value()
  );
};

/**
 * The default title component used for each bracket, receives the game and the height of the bracket
 */
class BracketTitle extends PureComponent {
  static propTypes = {
    game:   GameShape.isRequired,
    height: PropTypes.number.isRequired
  };

  render() {
    const { game, height } = this.props;

    return (
      <h3 style={{ textAlign: 'center' }}>
        {game.bracketLabel || game.name} ({height} {height === 1 ? 'round' : 'rounds'})
      </h3>
    );
  }
}

/**
 * Displays the brackets for some set of games sorted by bracket height
 */
export default class BracketGenerator extends Component {
  static propTypes = {
    // You must pass in an array of objects that adhere to the GameShape definition
    games:          PropTypes.arrayOf(GameShape).isRequired,
    titleComponent: PropTypes.func
  };

  // By default we will render a BracketTitle to display the title for the whole bracket
  static defaultProps = {
    titleComponent: BracketTitle
  };

  state = {
    finals: makeFinals({ games: this.props.games })
  };

  componentWillReceiveProps({ games }) {
    if (games !== this.props.games) {
      this.setState({ finals: makeFinals({ games }) });
    }
  }

  render() {
    const { games, titleComponent: TitleComponent, style, ...rest } = this.props;
    const { finals } = this.state;

    return (
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'center',
          ...style
        }}
      >
        {
          map(
            finals,
            ({ game, height }) => (
              <div key={game.id} style={{ textAlign: 'center', flexGrow: 1, maxWidth: '100%' }}>
                <TitleComponent game={game} height={height}/>
                <div style={{ maxWidth: '100%', overflow: 'auto', WebkitOverflowScrolling: 'touch' }}>
                  <Bracket game={game} {...rest}/>
                </div>
              </div>
            )
          )
        }
      </div>
    );
  }
}
