import {
  keyBy,
} from 'lodash';

import './scss/style.scss';
import TitleSection from './00_title_section/TitleSection';
import ScrollyTeller from '../src/ScrollyTeller/ScrollyTeller.js';

import simpleSectionConfig from './01_example_section_simple/SimpleSection';
import exampleChartConfig from './99_example_section_chart/ExampleChartSection';

export default class App {
  constructor() {
    this.scrollyTellerConfig = {
      appContainerId: 'app',
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
          simpleSectionConfig(),
          exampleChartConfig(),
          /** add a new chart here */
        ],
        'sectionIdentifier', // key by this value
      ),
    };

    /** now build the components */
    this.title = new TitleSection({
      appContainerId: this.scrollyTellerConfig.appContainerId,
      ...this.scrollyTellerConfig.titleSectionProps,
    });

    /** create the ScrollyTeller object to validate the config */
    this.scrollingDataStory = new ScrollyTeller(this.scrollyTellerConfig);

    /** parse data and build all HMTL */
    this.scrollingDataStory.render();
  }
}

$(document).ready(() => {
  new App();
});
