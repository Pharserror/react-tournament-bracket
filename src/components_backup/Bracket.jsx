import PropTypes from 'prop-types';
import React, { Component, PureComponent } from 'react';
import { chain } from 'lodash';
import GameShape from './GameShape';
import winningPathLength from '../util/winningPathLength';
import BracketGame from './BracketGame';

const toBracketGames = ({
  game,
  GameComponent,
  gameDimensions,
  homeOnTop,
  lineInfo,
  round,
  roundSeparatorWidth,
  x,
  y,
  ...rest
}) => {
  const { width: gameWidth, height: gameHeight } = gameDimensions;
  const ySep = gameHeight * Math.pow(2, round - 2);

  debugger;
  return [
    <g key={`${game.id}-${y}`}>
      <GameComponent
        {...rest}
        {...gameDimensions}
        key={game.id}
        homeOnTop={homeOnTop}
        game={game}
        x={x}
        y={y}
      />
    </g>
  ].concat(
    chain(game.sides)
    /* Loop through the game sides, pass back an array of
     * [{
     *   ...sideObj,
     *   side: 'home'/'visitor'
     * }, ...]
     */
    .map((obj, side) => ({ ...obj, side }))
    // Grab the games that have sourceGames with a rank of 1 (winning teams?)
    .filter(({ seed }) => !!seed && !!seed.sourceGame && seed.rank === 1)
    .map(
      ({ seed, side }) => {
        // we put visitor teams on the bottom
        // TODO: move home into SETTINGS
        const isTop = side === 'home' ? homeOnTop : !homeOnTop;
        const multiplier = isTop ? -1 : 1;

        const pathInfo = [
          `M${x - lineInfo.separation} ${y + gameHeight / 2 + lineInfo.yOffset + multiplier * lineInfo.homeVisitorSpread}`,
          `H${x - (roundSeparatorWidth / 2)}`,
          `V${y + gameHeight / 2 + lineInfo.yOffset + ((ySep / 2) * multiplier)}`,
          `H${x - roundSeparatorWidth + lineInfo.separation}`
        ];

        return [
          <path
            key={`${game.id}-${side}-${y}-path`}
            d={pathInfo.join(' ')}
            fill="transparent"
            stroke="black"
          />
        ].concat(
          toBracketGames({
            GameComponent,
            game: seed,// sourceGame,
            homeOnTop,
            lineInfo,
            gameDimensions,
            roundSeparatorWidth,
            x: x - gameWidth - roundSeparatorWidth,
            y: y + ((ySep / 2) * multiplier),
            round: round - 1,
            ...rest
          })
        );
      }
    ).flatten(true)
    .value()
  );
};

/**
 * Displays the bracket that culminates in a particular finals game
 */
export default class Bracket extends Component {
  static propTypes = {
    game:                GameShape.isRequired,
    GameComponent:       PropTypes.func,
    homeOnTop:           PropTypes.bool,
    gameDimensions:      PropTypes.shape({
      height: PropTypes.number.isRequired,
      width:  PropTypes.number.isRequired
    }).isRequired,

    lineInfo:            PropTypes.shape({
      homeVisitorSpread: PropTypes.number.isRequired,
      separation:        PropTypes.number.isRequired,
      yOffset:           PropTypes.number.isRequired
    }).isRequired,

    svgPadding:          PropTypes.number.isRequired
  };

  static defaultProps = {
    GameComponent:       BracketGame,
    homeOnTop:           true,
    gameDimensions:      {
      height: 80,
      width: 200
    },

    lineInfo:            {
      yOffset: -6,
      separation: 6,
      homeVisitorSpread: 11
    },

    roundSeparatorWidth: 24,
    svgPadding:          20
  };

  render() {
    const {
      GameComponent,
      game,
      gameDimensions,
      svgPadding,
      roundSeparatorWidth,
      ...rest
    } = this.props;

    const numRounds = winningPathLength(game);
    const svgDimensions = {
      height: (gameDimensions.height * Math.pow(2, numRounds - 1)) + svgPadding * 2,
      width:  (numRounds * (gameDimensions.width + roundSeparatorWidth)) + svgPadding * 2
    };

    return (
      <svg {...svgDimensions}>
        <g>
          {
            toBracketGames({
              GameComponent,
              gameDimensions,
              roundSeparatorWidth,
              game,
              round: numRounds,
              // svgPadding away from the right
              x: svgDimensions.width - svgPadding - gameDimensions.width,
              // vertically centered first game
              y: (svgDimensions.height / 2) - gameDimensions.height / 2,
              ...rest
            })
          }
        </g>
      </svg>
    );
  }
}
