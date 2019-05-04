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
    <div className="bracket-game-wrapper">
      <BracketGame game={game} games={games} {...props} />
      <div className="score-inputs-form-wrapper" style={state.isSettingScore ? {} : { display: 'none' }}>
        {renderScoreInputsForm(game, games, props, 'game', setScore)}
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
  theme,
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

        //const pathInfo = [
        //  `M${x - lineInfo.separation} ${y + gameHeight / 2 + lineInfo.yOffset + multiplier * lineInfo.homeVisitorSpread}`,
        //  `H${x - (roundSeparatorWidth / 2)}`,
        //  `V${y + gameHeight / 2 + lineInfo.yOffset + ((ySep / 2) * multiplier)}`,
        //  `H${x - roundSeparatorWidth + lineInfo.separation}`
        //];
        const pathInfo = (
          side === 'home'
            ? ['M14 33', 'H6', 'V3', 'H0']
            : ['M14 64', 'H6', 'V96', 'H0']
        );

        return (
          <path
            key={`${game.id}-${side}-${y}-path`}
            d={pathInfo.join(' ')}
            fill="transparent"
            stroke={theme.connectorColor}
          />
        );
      }
    ).flatten(true)
    .value()
  );
};

const renderScoreInputsForm = (game, games, props, scoreFor, setScore) => (
  <div className="game-score-inputs">
    <form
      onSubmit={partial(
        setScore,
        partial.placeholder,
        game.game,
        game.round
      )}
      style={{ marginLeft: 'auto' }}
    >
      <div className={`inputs-wrapper`}>
        <div className={`home-input`}>
          <input name="score[home]" style={{ width: '121px' }} type="text" />
        </div>
        <div className={`visitor-input`}>
          <input name="score[visitor]" style={{ width: '121px' }} type="text" />
        </div>
      </div>
      {/* TODO: Can potentially use npm classnames to clean this up */}
      <div className="inputs-form-submit">
        <input style={{ height: '60px' }} type="submit" value="Lock" />
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
      <div className={`sides round-${game.num}`}>
        {SETTINGS.SIDES.map(side => (
          <div className="games-wrapper" key={`${game.name}-${side}`}>
            {
              renderBracketOrGame(
                game.sides[side].seed,
                games,
                this.props.numRounds,
                {
                  activateScoreInputs:   this.activateScoreInputs,
                  hoveredTeamId:         this.props.hoveredTeamId,
                  onHoveredTeamIdChange: this.props.onHoveredTeamIdChange,
                  styleConfig:           this.props.styleConfig,
                  theme:                 this.props.theme
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
      styleConfig,
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
     *
     * 130 = The very top margin of 20px + the height of the game SVG (100px) +
     *       1/2 of the 20px margin between games
     *
     * We use Math.pow(2, [0, 1, 2, {4, 8, 16, ...}]) to move down the screen
     * By the number of games proportional to where the middle of the last round
     * is: the 2nd round is in the middle of 2 games so we move down 1 game plus
     * the half of the margin between games to put us in the middle of those 2
     * The next round we need to be between 4 games so we move down 2 plus 1/2 * 2
     * margins
     * The next round we need to be between 8 games so we move down 4 plus 1/2 * 4
     * => We can see a binary pattern of 1, 2, 4 and this is due to the binary
     * nature of this bracket layout
     * {} - denotes values for brackets with more than 8 games in the first round
     *
     * - 49 = the top text height of a game + one game side's height
     */
    //let marginLeft = Math.pow(2, ((this.props.numRounds + 5) - game.num));
    let marginTop = (130 * Math.pow(2, (this.props.numRounds - (game.num + 2)))) - 49;

    const svgDimensions = {
      //       80                    + 20
      height: (gameDimensions.height + svgPadding),
      width:  220,//(numRounds * (gameDimensions.width + roundSeparatorWidth)) + svgPadding * 2,
      style:  {
        marginTop,
        marginLeft: SETTINGS.SVG.STYLES.MARGINS_LEFT[this.props.numRounds][game.num],
        position:   'relative',
        zIndex:     999
      }
    };

    return (
      <div className="bracket">
        {this.getGameSidesComponents(game, games, setScore, this.state)}
        <div className="bracket-svg">
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
                  x: 20, //svgDimensions.width - svgPadding - gameDimensions.width,
                  // vertically centered first game
                  y: 0,
                  ...rest
                })
              }
            </g>
          </svg>
          <div style={this.state.isSettingScore ? {} : { display: 'none' }}>
            {renderScoreInputsForm(game, games, { styleConfig }, 'bracket', setScore)}
          </div>
        </div>
      </div>
    );
  }
}
