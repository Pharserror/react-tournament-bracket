import PropTypes from 'prop-types';
import React, { PureComponent } from 'react';
import GameShape, { HOME, VISITOR } from './GameShape';
import controllable from 'react-controllables';
import moment from 'moment';
import { compact, isNumber, merge } from 'lodash';
import SETTINGS from './settings';
import Side from './Side';

class BracketGame extends PureComponent {
  getGameSides(props, sides) {
    return [(
      !!sides.top ? (
        <Side
          {...props}
          side={sides.top}
          x={0}
          y={8}
        />
      ) : null
    ), (
      !!sides.bottom ? (
        <Side
          {...props}
          side={sides.bottom}
          x={0}
          y={40}
        />
      ) : null
    )];
  }

  getWinningBackground({ bottom, top }) {
    return (
      !!top &&
      !!bottom &&
      !!top.score &&
      !!bottom.score &&
      isNumber(top.score.score) &&
      isNumber(bottom.score.score) &&
      top.score.score !== bottom.score.score
    ) ? (
      <rect
        {...SETTINGS.SVG.BACKGROUNDS.SCORES.WINNER}
        style={{ fill: this.props.styles.winningScoreBackground }}
        y={top.score.score > bottom.score.score ? "8" : "40"}
      />
    ) : null
  }

  getWinningSeparator({ bottom, top }) {
    return (
      !!top &&
      !!bottom &&
      !!top.score &&
      !!bottom.score &&
      isNumber(top.score.score) &&
      isNumber(bottom.score.score) &&
      top.score.score !== bottom.score.score
    ) ? (
      {
        style: { stroke: '#FF9999' },
        y1:    top.score.score >= bottom.score.score ? '40' : '70',
        y2:    top.score.score >= bottom.score.score ? '40' : '70'
      }
    ) : {
      x2: '0',
      y1: '40',
      y2: '40'
    }
  }

  render() {
    const {
      activateScoreInputs,
      bottomText,
      game,
      games,
      homeOnTop,
      hoveredTeamId,
      onHoveredTeamIdChange,
      styles: {
        backgroundColor,
        gameNameStyle,
        gameTimeStyle,
        hoverBackgroundColor,
        scoreBackground,
        teamNameStyle,
        teamScoreStyle,
        teamSeparatorStyle,
        winningScoreBackground
      },

      topText,
      ...rest
    } = this.props;

    const { sides } = game;
    const bottom = sides[ homeOnTop ? VISITOR : HOME ];
    const top = sides[ homeOnTop ? HOME : VISITOR ];
    const topHovered = (!!top && !!top.team && top.team.id === hoveredTeamId);
    const bottomHovered = (!!bottom && !!bottom.team && bottom.team.id === hoveredTeamId);

    return (
      <svg
        style={{ marginTop: '20px', zIndex: '999' }}
        viewBox="0 0 200 82"
        {...rest}
        {...SETTINGS.SVG.GAME_WRAPPER}
      >
        {/* game time */}
        <text style={gameTimeStyle} {...SETTINGS.SVG.TEXT.DATE}>
          { topText(game) }
        </text>

        {/* backgrounds */}

        {/* base background */}
        <rect fill={backgroundColor} {...SETTINGS.SVG.BACKGROUNDS.BASE} />

        {/* background for the top team */}
        <rect
          fill={topHovered ? hoverBackgroundColor : backgroundColor}
          {...SETTINGS.SVG.BACKGROUNDS.BASE}
        />
        {/* background for the bottom team */}
        <rect
          fill={bottomHovered ? hoverBackgroundColor : backgroundColor}
          {...SETTINGS.SVG.BACKGROUNDS.TEAMS.BOTTOM}
        />

        {/* scores background */}
        <rect height="64" fill={scoreBackground} {...SETTINGS.SVG.BACKGROUNDS.SCORES.BASE} />

        {/* winner background */}
        { this.getWinningBackground({ bottom, top }) }

        {/* the players */}
        {
          this.getGameSides({
            activateScoreInputs,
            games,
            teamNameStyle,
            teamScoreStyle,
            onHover: onHoveredTeamIdChange
          }, { bottom, top })
        }

        <line
          {...SETTINGS.SVG.LINES.TOP}
          {...merge(
            { style: teamSeparatorStyle },
            this.getWinningSeparator({ bottom, top })
          )}
        />

        {/* game name */}
        <text style={gameNameStyle} {...SETTINGS.SVG.GAME_NAME}>
          { bottomText(game) }
        </text>
      </svg>
    );
  }
}

BracketGame.propTypes = {
  bottomText:            PropTypes.func,
  game:                  GameShape.isRequired,
  games:                 PropTypes.array,
  homeOnTop:             PropTypes.bool,
  hoveredTeamId:         PropTypes.string,
  onHoveredTeamIdChange: PropTypes.func.isRequired,
  styles:                PropTypes.shape({
    backgroundColor:        PropTypes.string.isRequired,
    gameNameStyle:          PropTypes.object.isRequired,
    hoverBackgroundColor:   PropTypes.string.isRequired,
    scoreBackground:        PropTypes.string.isRequired,
    teamNameStyle:          PropTypes.object.isRequired,
    teamScoreStyle:         PropTypes.object.isRequired,
    teamSeparatorStyle:     PropTypes.object.isRequired,
    winningScoreBackground: PropTypes.string.isRequired
  }),
  topText:               PropTypes.func
};

BracketGame.defaultProps = {
  bottomText:    ({ name, bracketLabel }) => compact([ name, bracketLabel ]).join(' - '),
  homeOnTop:     true,
  hoveredTeamId: null,
  styles:        {
    backgroundColor:        '#CCCCCC',
    gameNameStyle:          { fill: '#999', fontSize: 10 },
    gameTimeStyle:          { fill: '#999', fontSize: 10 },
    hoverBackgroundColor:   '#222',
    scoreBackground:        '#787a80',
    teamNameStyle:          { fill: '#FFF', fontSize: 16, textShadow: '1px 1px 1px #000' },
    teamScoreStyle:         { fill: '#23252d', fontSize: 16 },
    teamSeparatorStyle:     { stroke: '#CCCCCC', strokeWidth: 5 },
    winningScoreBackground: '#FF9999'
  },
  topText:       ({ scheduled }) => moment(scheduled).format('l LT')
};

export default controllable(BracketGame, [ 'hoveredTeamId' ]);
