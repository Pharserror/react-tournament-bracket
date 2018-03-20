import $ from 'jquery';
import React from 'react';
import ReactDOM from 'react-dom';
import BracketGenerator from './src/components/BracketGenerator';
import { generateGames, generateRandomGames } from './src/util/dataMassage';

const startingGames = [
  ['home-1', 'visitor-1'],
  ['home-2', 'visitor-2'],
  ['home-3', 'visitor-3'],
  ['home-4', 'visitor-4']
];

$(document).ready(function() {
  //generateRandomGames({ roundLimit: 0 }).then(games => {
  generateGames({ startingGames, roundLimit: 2 }).then(games => {
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
