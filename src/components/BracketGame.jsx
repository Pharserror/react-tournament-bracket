import PropTypes from 'prop-types';
import React, { PureComponent } from 'react';
import { RectClipped } from './Clipped';
import GameShape, { HOME, VISITOR } from './GameShape';
import controllable from 'react-controllables';
import moment from 'moment';
import { compact, isNumber } from 'lodash';

class BracketGame extends PureComponent {
  static propTypes = {
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

  static defaultProps = {
    homeOnTop:     true,
    hoveredTeamId: null,
    styles:        {
      backgroundColor:        '#58595e',
      bottomText:             ({ name, bracketLabel }) => compact([ name, bracketLabel ]).join(' - '),
      gameNameStyle:          { fill: '#999', fontSize: 10 },
      gameTimeStyle:          { fill: '#999', fontSize: 10 },
      hoverBackgroundColor:   '#222',
      scoreBackground:        '#787a80',
      teamNameStyle:          { fill: '#fff', fontSize: 12, textShadow: '1px 1px 1px #222' },
      teamScoreStyle:         { fill: '#23252d', fontSize: 12 },
      teamSeparatorStyle:     { stroke: '#444549', strokeWidth: 1 },
      winningScoreBackground: '#ff7324'
    },

    topText:       ({ scheduled }) => moment(scheduled).format('l LT')
  };

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
    const winnerBackground = (
      (!!top &&
       !!bottom &&
       isNumber(top.score) &&
       isNumber(bottom.score) &&
       top.score.score !== bottom.score.score)
      ? (
        top.score.score > bottom.score.score
        ? (
          <rect
            height="22.5"
            rx="3"
            ry="3"
            style={{ fill: winningScoreBackground }}
            width="30"
            x="170"
            y="12"
          />
        ) : (
          <rect
            height="22.5"
            rx="3"
            ry="3"
            style={{ fill: winningScoreBackground }}
            width="30"
            x="170"
            y="34.5"
          />
        )
      ) : null
    );

    const Side = ({ x, y, side, onHover }) => {
      const tooltip = (
        !!side.seed && !!side.team
        ? (
          <title>{side.seed.displayName}</title>
        ) : null
      );

      return (
        <g
          onMouseEnter={() => onHover(!!side && !!side.team ? side.team.id : null)}
          onMouseLeave={() => onHover(null)}
        >
          {/* trigger mouse events on the entire block */}
          <rect x={x} y={y} height={22.5} width={200} fillOpacity={0}>
            {tooltip}
          </rect>
          <RectClipped x={x} y={y} height={22.5} width={165}>
            <text
              style={{
                ...teamNameStyle,
                fontStyle: !!side.seed && !!side.seed.sourcePool ? 'italic' : null
              }}
              x={x + 5}
              y={y + 16}
            >
              {tooltip}
              {!!side.team ? side.team.name : (!!side.seed ? side.seed.displayName : null)}
            </text>
          </RectClipped>
          <text x={x + 185} y={y + 16} style={teamScoreStyle} textAnchor="middle">
            {isNumber(side.score) ? side.score.score : null}
          </text>
        </g>
      );
    };

    const topHovered = (!!top && !!top.team && !!top.team.id === hoveredTeamId);
    const bottomHovered = (!!bottom && !!bottom.team && bottom.team.id === hoveredTeamId);

    return (
      <svg width="200" height="82" viewBox="0 0 200 82" {...rest}>
        {/* game time */}
        <text x="100" y="8" textAnchor="middle" style={gameTimeStyle}>
          { topText(game) }
        </text>

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
        { winnerBackground }

        {/* the players */}
        {
          top ? (
            <Side x={0} y={12} side={top} onHover={onHoveredTeamIdChange}/>
          ) : null
        }

        {
          bottom ? (
            <Side x={0} y={34.5} side={bottom} onHover={onHoveredTeamIdChange}/>
          ) : null
        }

        <line x1="0" y1="34.5" x2="200" y2="34.5" style={teamSeparatorStyle}/>

        {/* game name */}
        <text x="100" y="68" textAnchor="middle" style={gameNameStyle}>
          { bottomText(game) }
        </text>
      </svg>
    );
  }
}

export default controllable(BracketGame, [ 'hoveredTeamId' ]);
