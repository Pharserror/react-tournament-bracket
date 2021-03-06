require('../scss/main.scss');
import PropTypes from 'prop-types';
import React, { Component, PureComponent } from 'react';
import { chain, filter, map, some } from 'lodash';
import Bracket from './Bracket';
import GameShape from './GameShape';
import { setScore } from '../actions';
import * as themes from './themes';
import winningPathLength from '../util/winningPathLength';

/* makeFinals()
 *
 *
 */
const makeFinals = ({ games }) => {
  return (
    chain(games)
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
      hoveredTeamId: null,
      theme:         themes[this.props.styleConfig.theme]
    };
  }

  static propTypes = {
    // You must pass in an array of objects that adhere to the GameShape definition
    games:          PropTypes.arrayOf(GameShape).isRequired,
    styleConfig:    PropTypes.shape({
      contentAlignment: PropTypes.string,
      textAlignment:    PropTypes.string,
      theme:            PropTypes.string
    }),
    titleComponent: PropTypes.func
  };

  // By default we will render a BracketTitle to display the title for the whole bracket
  static defaultProps = {
    setScoreCallback: () => (new Promise((resolve, reject) => resolve(false))),
    styleConfig:    {
      contentAlignment: 'left',
      textAlignment:    'text-left',
      theme:            'dark'
    },
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

  setScore(event, game) {
    event.preventDefault();
    event.persist();

    const games = (
      new Array(setScore(event, game.game, this.state.games[0], game.round))
    );

    this.props.setScoreCallback({
      event, game, games, round: game.round
    }).then((games) => {
      this.setState({
        games,
        finals: makeFinals({ games })
      });
    }).catch(() => { /* TODO: Add error handling */ });
  }

  /* Based on this render it should be safe to assume that the data is structured
   * such that we have an array of games that are the grand finals and that all
   * other games are nested in the game.sides.home/visitor properties
   */
  render() {
    const {
      titleComponent: TitleComponent,
      style,
      ...rest
    } = this.props;

    const { finals, games, theme } = this.state;

    return (
      <div
        className="wrapper"
        style={{
          alignItems:     'center',
          justifyContent: this.props.styleConfig.contentAlignment,
          ...style
        }}
      >
        {map(
          finals,
          ({ game, height }) => (
            <div
              className="bracket-wrapper"
              key={game.id}
              style={{textAlign: 'center'}}
            >
              <TitleComponent game={game} height={height} />
              <Bracket
                game={game}
                games={games}
                hoveredTeamId={this.state.hoveredTeamId}
                onHoveredTeamIdChange={this.onHoveredTeamIdChange}
                setScore={this.setScore}
                theme={theme}
                {...rest}
              />
            </div>
          )
        )}
      </div>
    );
  }
}
