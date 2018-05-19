const _CONSTANTS = {
  GAME_WIDTH:  '200',
  TEAM_HEIGHT: '32'
};

const SETTINGS = {
  SIDES: ['home', 'visitor'],
  STYLES: {
    GAME: {
      WIDTH: 264
    },
    ROUND_MARGINS: {
      LEFT: 82,
      TOP:  158.5
      //TOP:  88.5
    }
  },
  SVG: {
    BACKGROUNDS: {
      BASE: {
        height: _CONSTANTS.TEAM_HEIGHT,
        rx:     '0',
        ry:     '0',
        width:  _CONSTANTS.GAME_WIDTH,
        x:      '0',
        y:      '8'
      },
      SCORES: {
        BASE: {
          height: '64',
          rx:     '0',
          ry:     '0',
          width:  '30',
          x:      '170',
          y:      '8'
        },
        WINNER: {
          height: '32',
          rx:     '0',
          ry:     '0',
          width:  '30',
          x:      '170',
          y:      '13'
        }
      },
      TEAMS: {
        BOTTOM: {
          height: _CONSTANTS.TEAM_HEIGHT,
          rx:     '0',
          ry:     '0',
          width:  _CONSTANTS.GAME_WIDTH,
          x:      '0',
          y:      '40'
        }
      }
    },
    GAME_NAME: {
      textAnchor: 'middle',
      x:          '100',
      y:          '85'
    },
    GAME_WRAPPER: {
      height: '100',
      width:  _CONSTANTS.GAME_WIDTH
    },
    LINES: {
      BOTTOM: {
      },
      TOP: {
        'x1': '0',
        'x2': '200'
      }
    },
    STYLES: {
      MARGINS_LEFT: {
        '1': { '0': 0 },
        '2': { '0': 0, '1': 0 },
        '3': { '0': 0, '1': 0, '2': 0 },
        '4': { '0': 0, '1': 0, '2': 0, '3': 0 },
        '5': { '0': 0, '1': 128, '2': 96, '3': 0, '4': 0 }
      }
    },
    TEXT: {
      DATE: {
        textAnchor: 'middle',
        x:          '100',
        y:          '3',
      }
    }
  }
};

export default SETTINGS
