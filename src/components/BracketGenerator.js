import PropTypes from 'prop-types';
import React, { Component, PureComponent } from 'react';
import { chain, filter, map, some } from 'lodash';
import Bracket from './Bracket';
import GameShape from './GameShape';
import { setScore } from '../actions';
import winningPathLength from '../util/winningPathLength';

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
  //const isInGroup = (() => {
  //  const gameIdHash =
  //    // cycle through all of the games
  //    chain(games)
  //    // create an object of all top level games with keys set to each game's id
  //    .keyBy('id')
  //    // Create a new object like { gameName1: 1, ... gameNameN: 1 }
  //    .reduce((allGames, gameData, gameName) => {
  //      allGames[gameName] = 1;
  //      return allGames;
  //    }, {})
  //    // Return the created object
  //    .value();

  //    /* Finally we return a function that will tell us if a game with id is in
  //     * the hash of games passed in
  //     */
  //  return id => Boolean(gameIdHash[ id ]);
  //})();

  //const gamesFeedInto = map(
  //  games,
  //  game => ({
  //    ...game,
  //    feedsInto: filter(
  //      games,
  //      ({ id, sides }) => (
  //        /* If the id of the game is in our top-level object or if it has a
  //         * sides property (not the final game?) or its seed is the first game
  //         * then it will be returned
  //         */
  //        isInGroup(id) &&
  //        some(
  //          sides,
  //          ({ seed }) => (
  //            !!seed &&
  //            !!seed.sourceGame &&
  //            seed.rank === 1 &&
  //            seed.sourceGame.id === game.id
  //          )
  //        )
  //      )
  //    )
  //  })
  //);

  return (
    //chain(gamesFeedInto)
    chain(games)
    // get the games that don't feed into anything else in the group, i.e. finals for this game group
    //.filter(({ feedsInto }) => feedsInto.length === 0)
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

//Displays the brackets for some set of games sorted by bracket height
export default class BracketGenerator extends Component {
  constructor(props) {
    super(props);

    this.onHoveredTeamIdChange = this.onHoveredTeamIdChange.bind(this);
    this.setScore = this.setScore.bind(this);
    this.state = {
      finals:        makeFinals({ games: props.games }),
      games:         props.games,
      hoveredTeamId: null
    };
  }

  static propTypes = {
    // You must pass in an array of objects that adhere to the GameShape definition
    games:          PropTypes.arrayOf(GameShape).isRequired,
    titleComponent: PropTypes.func
  };

  // By default we will render a BracketTitle to display the title for the whole bracket
  static defaultProps = {
    titleComponent: BracketTitle
  };

  componentWillReceiveProps({ games }) { // get games from nextProps
    if (games !== this.state.games) {
      /* If we get a new set of games and they are not what we already have then
       * we need to recalculate the path length and all that
       */
      this.setState({ finals: makeFinals({ games }) });
    }
  }

  onHoveredTeamIdChange(id) {
    this.setState({ hoveredTeamId: id });
  }

  setScore(event, game, round) {
    event.preventDefault();
    event.persist();
    const games = (new Array(setScore(event, game, this.state.games[0], round)));

    this.setState({
      games,
      finals: makeFinals({ games })
    });
  }

  /* Based on this render it should be safe to assume that the data is structured
   * such that we have an array of games that are the grand finals and that all
   * other games are nested in the game.sides.home/visitor properties
   */
  render() {
    const { titleComponent: TitleComponent, style, ...rest } = this.props;
    const { finals, games } = this.state;

    return (
      <div
        style={{
          display:        'flex',
          flexWrap:       'wrap',
          alignItems:     'center',
          justifyContent: 'center',
          ...style
        }}
      >
        {
          map(
            finals,
            ({ game, height }) => (
              <div
                key={game.id}
                style={{
                  flexGrow: 1,
                  maxWidth: '100%',
                  textAlign: 'center',
                  minWidth: `${this.props.numRounds * 200}px`
                }}
              >
                <TitleComponent game={game} height={height} />
                <div
                  style={{
                    maxWidth:                '100%',
                    overflow:                'scroll',
                    WebkitOverflowScrolling: 'touch'
                  }}
                >
                  <div className="container-fluid">
                    <div className="row">
                      <Bracket
                        game={game}
                        games={games}
                        hoveredTeamId={this.state.hoveredTeamId}
                        onHoveredTeamIdChange={this.onHoveredTeamIdChange}
                        setScore={this.setScore}
                        {...rest}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )
          )
        }
      </div>
    );
  }
}
