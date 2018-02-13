import PropTypes from 'prop-types';

// for nested PropTypes
const lazyFunction = f => ((...args) => f().apply(this, args));

let GameShape;

export const HOME = 'home';
export const VISITOR = 'visitor';

const ID_TYPE = PropTypes.string;

// the shape of one side of the competition - e.g. home or visitor
const SideShape = PropTypes.shape({
  score: PropTypes.shape({
    score: PropTypes.number.isRequired
  }),

  seed: PropTypes.shape({
      displayName: PropTypes.string.isRequired,
      rank:        PropTypes.number.isRequired,
      sourceGame:  lazyFunction(() => GameShape),
      sourcePool:  PropTypes.object
  }),

  team: PropTypes.shape({
      id:   ID_TYPE,
      name: PropTypes.string.isRequired
  })
});

GameShape = PropTypes.shape({
  // optional: the label for the game within the bracket, e.g. Gold Finals, Silver Semi-Finals
  bracketLabel: PropTypes.string,
  // where the game is played
  court:        PropTypes.shape({
    name:  PropTypes.string.isRequired,
    venue: PropTypes.shape({
      name: PropTypes.string.isRequired
    }).isRequired
  }),
  id:           ID_TYPE,
  name:         PropTypes.string.isRequired, // the game name
  // the unix timestamp of the game-will be transformed to a human-readable time using momentjs
  scheduled:    PropTypes.number.isRequired,
  // only two sides are supported-home and visitor
  sides: PropTypes.shape({
    [HOME]: SideShape,
    [VISITOR]: SideShape
  })
});

export default GameShape;
