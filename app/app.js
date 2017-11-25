/* global VizHub, document, window, global window */

import ThemeTemplate from './theme/theme';
import './scss/style.scss';
import $ from 'jquery';


export default class App {
  constructor() {
    this.view = new ThemeTemplate(this);
  }
}


$(document).ready(() => {
  new App();
});
