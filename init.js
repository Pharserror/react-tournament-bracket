import React from 'react';
import ReactDOM from 'react-dom';
import BracketGenerator from './src/components/BracketGenerator';
import { generateGames, generateRandomGames } from './src/util/dataMassage';

const startingGames = [
  ['home-1', 'visitor-1'],
  ['home-2', 'visitor-2'],
  ['home-3', 'visitor-3'],
  ['home-4', 'visitor-4'],
  ['home-5', 'visitor-5'],
  ['home-6', 'visitor-6'],
  ['home-7', 'visitor-7'],
  ['home-8', 'visitor-8'],
  ['home-9', 'visitor-9'],
  ['home-10', 'visitor-10'],
  ['home-11', 'visitor-11'],
  ['home-12', 'visitor-12'],
  ['home-13', 'visitor-13'],
  ['home-14', 'visitor-14'],
  ['home-15', 'visitor-15'],
  ['home-16', 'visitor-16']
];

document.addEventListener('DOMContentLoaded', () => {
  //generateRandomGames({ roundLimit: 0 }).then(games => {
  generateGames({ startingGames, roundLimit: 5 }).then(games => {
    console.log(games);
    ReactDOM.render(
      React.createElement(
        BracketGenerator,
        { games, numRounds: 5 }
      ),
      document.getElementById('root')
    );
  });
});
