import { isNumber, partial } from 'lodash';
import React, { Component } from 'react';
import { RectClipped } from './Clipped';
import { setScore } from '../actions/';
import SETTINGS from './settings';

const Side = ({
  activateScoreInputs,
  games,
  onHover,
  side,
  teamNameStyle,
  teamScoreStyle,
  x,
  y
}) => {
  const tooltip = (
    !!side.seed && !!side.team
    ? (
      <title>{side.name}</title>
    ) : null
  );

  return (
    <g
      onClick={activateScoreInputs}
      onMouseEnter={_event => { onHover(!!side && !!side.team ? side.team.id : null); }}
      onMouseLeave={_event => { onHover(null); }}
    >
      {/* trigger mouse events on the entire block */}
      <rect x={x} y={y} height={32} width={200} fillOpacity={0}>
        {tooltip}
      </rect>
      <RectClipped x={x} y={y} height={32} width={165}>
        <text
          style={{
            ...teamNameStyle,
            fontStyle: !!side.seed && !!side.seed.sourcePool ? 'italic' : null
          }}
          x={x + 5}
          y={y + (side.side === 'home' ? 20 : 23)}
        >
          {tooltip}
          {!!side.team ? side.team.name : (!!side.name ? side.name : null)}
        </text>
      </RectClipped>
      <text x={x + 185} y={y + (side.side === 'home' ? 20 : 23)} style={teamScoreStyle} textAnchor="middle">
        {!!side.score && isNumber(side.score.score) ? side.score.score : null}
      </text>
    </g>
  );
};

export default Side
