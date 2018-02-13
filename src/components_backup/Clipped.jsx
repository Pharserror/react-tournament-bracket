import PropTypes from 'prop-types';
import React, { PureComponent } from 'react';
import { v4 } from 'uuid';

export default class Clipped extends PureComponent {
  static propTypes = {
    path: PropTypes
          .oneOfType([ PropTypes.node, PropTypes.arrayOf(PropTypes.node) ])
          .isRequired
  };

  static defaultProps = {};

  _id = v4();

  render() {
    const { _id } = this;
    const { path, children } = this.props;

    return (
      <g>
        <defs>
          <clipPath id={_id}>
            {path}
          </clipPath>
        </defs>

        <g clipPath={`url(#${_id})`}>
          {children}
        </g>
      </g>
    );
  }
};

export class RectClipped extends PureComponent {
  static propTypes = {
    height: PropTypes.number.isRequired,
    width:  PropTypes.number.isRequired,
    x:      PropTypes.number.isRequired,
    y:      PropTypes.number.isRequired
  };

  static defaultProps = {};

  render() {
    const { children, height, width, x, y } = this.props;
    const path = (
      <rect x={x} y={y} width={width} height={height}/>
    );

    return (
      <Clipped path={path}>
        {children}
      </Clipped>
    );
  }
}
