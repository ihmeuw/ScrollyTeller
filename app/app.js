import {
  keyBy,
} from 'lodash';

import './scss/style.scss';
import TitleSection from './00_title_section/TitleSection';
import ScrollyTeller from './ScrollyTeller/ScrollyTeller';

import SimpleSection from './01_example_section_simple/SimpleSection';
import ExampleChartSection from './99_example_section_chart/ExampleChartSection';
import ScrollyTellerNames from './ScrollyTeller/utils/ScrollyTellerNames';

export default class App {
  constructor() {
    /** css naming handler for ScrollyTeller
     * optionally override any scrollyteller css variable names
     * from ScrollyTeller/css_utils/name_defaults.js */
    const appContainerId = 'app';
    const cssNames = new ScrollyTellerNames();

    this.state = {
      appContainerId,
      cssNames,
      titleSectionProps: {
        titleTextCSS: 'title',
        titleText: 'Scrolly Teller Example',
      },
      /** build a list of story sections, keyed by sectionIdentifier.
       * Each section constructor should return a valid configuration,
       * or create a new section "object" outside, and add a .config() function
       * that returns a valid configuration object */
      sectionList: keyBy(
        [
          new SimpleSection({ appContainerId, cssNames }),
          new ExampleChartSection({ appContainerId, cssNames }),
          /** add a new chart here */
        ],
        'sectionIdentifier', // key by this value
      ),
    };

    /** now build the components */
    this.title = new TitleSection({
      appContainerId: this.state.appContainerId,
      ...this.state.titleSectionProps,
    });

    this.scrollingDataStory = new ScrollyTeller(this.state);
  }
}

$(document).ready(() => {
  new App();
});
