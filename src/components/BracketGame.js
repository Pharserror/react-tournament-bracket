import PropTypes from 'prop-types';
import React, { PureComponent } from 'react';
import GameShape, { HOME, VISITOR } from './GameShape';
import controllable from 'react-controllables';
import moment from 'moment';
import { compact, isNumber } from 'lodash';
import SETTINGS from './settings';
import Side from './Side';
import COLORS from './colors';

class BracketGame extends PureComponent {
  getGameSides(props, sides) {
    return [(
      !!sides.top ? (
        <Side
          {...props}
          side={sides.top}
          x={0}
          y={12}
        />
      ) : null
    ), (
      !!sides.bottom ? (
        <Side
          {...props}
          side={sides.bottom}
          x={0}
          y={34.5}
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
        {...SETTINGS.SVG.BACKGROUNDS.SCORE}
        style={{ fill: this.props.styles.winningScoreBackground }}
        y={top.score.score > bottom.score.score ? "12" : "34.5"}
      />
    ) : null
  }

  render() {
    const {
      bottomText,
      game,
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
      <svg width="200" height="82" viewBox="0 0 200 82" {...rest}>
        {/* backgrounds */}

        {/* base background */}
        <rect x="0" y="12" width="200" height="45" fill={backgroundColor} rx="3" ry="3"/>

        {/* background for the top team */}
        <rect
          x="0"
          y="12"
          width="200"
          height="22.5"
          fill={topHovered ? hoverBackgroundColor : backgroundColor}
          rx="3"
          ry="3"
        />
        {/* background for the bottom team */}
        <rect
          x="0"
          y="34.5"
          width="200"
          height="22.5"
          fill={bottomHovered ? hoverBackgroundColor : backgroundColor}
          rx="3"
          ry="3"
        />

        {/* scores background */}
        <rect x="170" y="12" width="30" height="45" fill={scoreBackground} rx="3" ry="3"/>

        {/* winner background */}
        { this.getWinningBackground({ bottom, top }) }

        {/* the players */}
        {
          this.getGameSides({
            onHover: onHoveredTeamIdChange,
            teamNameStyle,
            teamScoreStyle
          }, { bottom, top })
        }

        <line x1="0" y1="34.5" x2="200" y2="34.5" style={teamSeparatorStyle}/>

      </svg>
    );
  }
}

BracketGame.propTypes = {
  bottomText:            PropTypes.func,
  game:                  GameShape.isRequired,
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
    backgroundColor:        COLORS.WHITE,
    gameNameStyle:          { fill: COLORS.BLACK, fontSize: 9 },
    gameTimeStyle:          { fill: COLORS.BLACK, fontSize: 10 },
    hoverBackgroundColor:   COLORS.YELLOW,
    scoreBackground:        COLORS.DGREY,
    teamNameStyle:          { fill: COLORS.BLACK, fontSize: 12},
    teamScoreStyle:         { fill: COLORS.BLACK, fontSize: 12 },
    teamSeparatorStyle:     { stroke: COLORS.WHITE, strokeWidth: 1 },
    winningScoreBackground: COLORS.BLUE
  },
  topText:       ({ scheduled }) => moment(scheduled).format('l LT')
};

export default controllable(BracketGame, [ 'hoveredTeamId' ]);
