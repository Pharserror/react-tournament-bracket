import PropTypes from 'prop-types';
import React, { Component, PureComponent } from 'react';
import { chain } from 'lodash';
import GameShape from './GameShape';
import winningPathLength from '../util/winningPathLength';
import BracketGame from './BracketGame';

const SETTINGS = {
  SIDES: ['home', 'visitor']
};

// game has score and seed as props
const renderBracketOrGame = game => (
  (!!game &&
   !!game.seed &&
   !!game.seed.sides &&
   !!game.seed.sides.home && !!game.seed.sides.visitor &&
   !!game.seed.sides.home.seed && !!game.seed.sides.visitor.seed)
  ? (
    <Bracket game={game.seed} />
  ) : (
    <div className="col text-right">
      <BracketGame game={game.seed} />
    </div>
  )
);

const renderBracketSVG = ({
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
        ]/*.concat(
          renderBracketSVG({
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
        )*/;
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

  getGameSidesComponents = game => (
    !!game.sides
    ? (
      <div className="col col-9">
        {SETTINGS.SIDES.map(side => (
          <div className="row" key={`${game.name}-${side}`}>
            {renderBracketOrGame(game.sides[side])}
          </div>
        ))}
      </div>
    ) : null
  )

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

    let marginTop;

    /* TODO: Need to replace this with a binary function to get the series:
     * (({ 1, 2, 4, 8, 16, 32, ... } - 1) * 4) / 4
     * OR
     *  ({ 1, 2, 4, 8, 16, 32, ... } - 1) + 0.25
     *
     * As of 02/26/2018 the maximum number of Round 1 games supported is: 
     */
    switch (game.num) {
      case 0:
        marginTop = (61 * 88.5) / 4;
        break;
      case 1:
        marginTop = (29 * 88.5) / 4;
        break;
      case 2:
        marginTop = (13 * 88.5) / 4;
        break;
      case 3:
        marginTop = (5 * 88.5) / 4;
        break;
      case 4:
        marginTop = (1 * 88.5) / 4;
        break;
    }

    const svgDimensions = {
      height: (gameDimensions.height * Math.pow(2, numRounds - 1)) + svgPadding * 2,
      width:  (numRounds * (gameDimensions.width + roundSeparatorWidth)) + svgPadding * 2,
      style:  { marginTop }
    };

    return (
      <div className="col">
        <div className="row">
          {this.getGameSidesComponents(game)}
          <div className="col col-3 text-right">
            <svg {...svgDimensions}>
              <g>
                {
                  renderBracketSVG({
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
          </div>
        </div>
      </div>
    );
  }
}
