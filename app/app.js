/* global VizHub, document, window, global window */

import $ from 'jquery';
// import d3 from 'd3';

import ThemeTemplate from './theme/theme';
import './scss/style.scss';


class App {
  constructor() {
    console.log('At least its loading at all');

    this.view = new ThemeTemplate(this);
  }
}


$(document).ready(() => {
  const app = new App();
});

