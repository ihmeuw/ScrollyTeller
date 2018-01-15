/* global VizHub, document, window, global window */

import './scss/style.scss';
import TitleSection from './00_title_section/TitleSection';
import Section1 from './01_section_1/Section1';
import SectionExample from './99_section_example/SectionExample';

export default class App {
  constructor() {
    const appContainerId = 'app';
    this.title = new TitleSection(appContainerId, 'title', 'Story Theme Template');
    this.section1 = new Section1({ appContainerId });
    this.example = new SectionExample({ appContainerId });
  }
}

$(document).ready(() => {
  new App();
});
