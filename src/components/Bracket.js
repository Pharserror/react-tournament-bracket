import PropTypes from 'prop-types';
import React, { Component, PureComponent } from 'react';
import { chain, partial } from 'lodash';
import GameShape from './GameShape';
import winningPathLength from '../util/winningPathLength';
import BracketGame from './BracketGame';
import SETTINGS from './settings';

// game has score and seed as props
const renderBracketOrGame = (game, games, numRounds, props, setScore, state) => (
  (!!game &&
   !!game.sides &&
   !!game.sides.home && !!game.sides.visitor &&
   !!game.sides.home.seed && !!game.sides.visitor.seed)
  ? (
    <Bracket
      game={game}
      games={games}
      numRounds={numRounds}
      setScore={setScore}
      {...props}
    />
  ) : (
    <div className="col text-right">
      <BracketGame game={game} games={games} {...props} />
      <div className="row" style={state.isSettingScore ? {} : { display: 'none' }}>
        {renderScoreInputsForm(game, games, setScore)}
      </div>
    </div>
  )
);

const renderBracketSVG = ({
  game,
  games,
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
        games={games}
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

        return (
          <path
            key={`${game.id}-${side}-${y}-path`}
            d={pathInfo.join(' ')}
            fill="transparent"
            stroke="black"
          />
        );
      }
    ).flatten(true)
    .value()
  );
};

const renderScoreInputsForm = (game, games, setScore) => (
  <div className="col">
    <form
      onSubmit={
        partial(
          setScore,
          partial.placeholder,
          game.game,
          game.round
        )
      }
      style={{ marginLeft: 'auto', width: '264px' }}
    >
      <div className="row">
        <div className="col col-7 offset-1 text-right">
          <div className="row">
            <div className="col text-right">
              <input name="score[home]" style={{ width: '121px' }} type="text" />
            </div>
          </div>
          <div className="row">
            <div className="col text-right">
              <input name="score[visitor]" style={{ width: '121px' }} type="text" />
            </div>
          </div>
        </div>
        <div className="col col-4 text-right">
          <input style={{ height: '60px' }} type="submit" value="Lock" />
        </div>
      </div>
    </form>
  </div>
);

/**
 * Displays the bracket that culminates in a particular finals game
 */
export default class Bracket extends Component {
  constructor(props) {
    super(props);

    this.state = { isSettingScore: false };

    this.activateScoreInputs = this.activateScoreInputs.bind(this);
  }

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

  shouldComponentUpdate(nextProps, nextState) {
    // TODO: Make this more efficient
    return true;

    const { home: currentHome, visitor: currentVisitor } = this.props.game.sides;
    const { home: nextHome, visitor: nextVisitor } = nextProps.game.sides;

    /* TODO: Component still not updating immediately after score is set;
     * have to hover over team to get it to update
     */
    return (
      this.state.isSettingScore !== nextState.isSettingScore ||
      this.props.hoveredTeamId !== nextProps.hoveredTeamId ||
      currentHome.score.score !== nextHome.score.score ||
      currentVisitor.score.score !== nextVisitor.score.score ||
      currentHome.team.name !== nextHome.team.name ||
      currentVisitor.team.name !== nextVisitor.team.name
    );
  }

  activateScoreInputs() {
    this.setState({ isSettingScore: true });
  }

  getGameSidesComponents = (game, games, setScore, state) => (
    !!game.sides
    ? (
      <div className="col col-9">
        {SETTINGS.SIDES.map(side => (
          <div className="row" key={`${game.name}-${side}`}>
            {
              renderBracketOrGame(
                game.sides[side].seed,
                games,
                this.props.numRounds,
                {
                  activateScoreInputs:   this.activateScoreInputs,
                  hoveredTeamId:         this.props.hoveredTeamId,
                  onHoveredTeamIdChange: this.props.onHoveredTeamIdChange
                },
                setScore,
                state
              )
            }
          </div>
        ))}
      </div>
    ) : null
  )

  render() {
    const {
      GameComponent,
      game,
      games,
      gameDimensions,
      setScore,
      svgPadding,
      roundSeparatorWidth,
      ...rest
    } = this.props;

    const numRounds = winningPathLength(game);
    /* Notes on this calculation
     *
     * The reason we need to calculate the top margin is because it varies based
     * on round: rounds with more games will have a smaller margin for their
     * games than rounds with less games
     */
    //let marginTop = (
    //  (((Math.pow(2, (this.props.numRounds - (game.num + 2))) - 1) * 4) + 1) / 4
    //) * SETTINGS.STYLES.ROUND_MARGINS.TOP;
    let marginTop = Math.pow(2, ((this.props.numRounds + 1) + ((this.props.numRounds + 1) - (game.num + 2))));
    //let marginTop = ((((this.props.numRounds - game.num) + 1) - 1) * (20 + 100)) + 16;

    if (game.num === 2) { debugger; }

    const svgDimensions = {
      height: (gameDimensions.height * Math.pow(2, numRounds - 1)) + svgPadding * 2,
      width:  (numRounds * (gameDimensions.width + roundSeparatorWidth)) + svgPadding * 2,
      style:  { marginTop, position: 'relative', zIndex: 999 }
    };

    return (
      <div className="col">
        <div className="row">
          {this.getGameSidesComponents(game, games, setScore, this.state)}
          <div className="col col-3 text-right">
            <div className="row">
              <div className="col">
                <svg {...svgDimensions} className={`round-${game.num}`}>
                  <g>
                    {
                      renderBracketSVG({
                        GameComponent,
                        gameDimensions,
                        roundSeparatorWidth,
                        game,
                        games,
                        activateScoreInputs: this.activateScoreInputs,
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
            <div className="row" style={this.state.isSettingScore ? {} : { display: 'none' }}>
              {renderScoreInputsForm(game, games, setScore)}
            </div>
          </div>
        </div>
      </div>
    );
  }
}
