import {
  keyBy,
} from 'lodash';

import './scss/style.scss';
import TitleSection from './00_title_section/TitleSection';
import ScrollyTeller from './ScrollyTeller/ScrollyTeller';

import simpleSectionConfig from './01_example_section_simple/SimpleSection';
import exampleChartConfig from './99_example_section_chart/ExampleChartSection';

export default class App {
  constructor() {
    const appContainerId = 'app';

    this.state = {
      appContainerId,
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
          simpleSectionConfig({ appContainerId }),
          exampleChartConfig({ appContainerId }),
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
