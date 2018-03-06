import { isNumber } from 'lodash';
import React, { Component } from 'react';
import { RectClipped } from './Clipped';

const Side = ({ onHover, side, teamNameStyle, teamScoreStyle, x, y  }) => {
  const tooltip = (
    !!side.seed && !!side.team
    ? (
      <title>{side.name}</title>
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
          {!!side.team ? side.team.name : (!!side.name ? side.name : null)}
        </text>
      </RectClipped>
      <text x={x + 185} y={y + 16} style={teamScoreStyle} textAnchor="middle">
        {!!side.score && isNumber(side.score.score) ? side.score.score : null}
      </text>
    </g>
  );
};

export default Side
