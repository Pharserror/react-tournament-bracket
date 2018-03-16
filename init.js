import $ from 'jquery';
import { get, isNumber, pick } from 'lodash';
import React from 'react';
import ReactDOM from 'react-dom';
import BracketGenerator from './src/components/BracketGenerator';
import { generateRandomGames } from './src/util/dataMassage';

$(document).ready(function() {
  generateRandomGames({ roundLimit: 0 }).then(games => {
    console.log(games);
    ReactDOM.render(
      React.createElement(
        BracketGenerator,
        { games, numRounds: 3 }
      ),
      document.getElementById('root')
    );
  });
});
