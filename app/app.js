import {
  keyBy,
} from 'lodash';

import './scss/style.scss';
import TitleSection from './00_title_section/TitleSection';
import DataStory from './DataStory/DataStory';

import SimpleSection from './01_example_section_simple/SimpleSection';
import ExampleChartSection from './99_example_section_chart/ExampleChartSection';
import ScrollyTellerNames from './ScrollyTeller/utils/ScrollyTellerNames';

export default class App {
  constructor() {
    /** css naming handler for ScrollyTeller
     * optionally override any scrollyteller css variable names
     * from ScrollyTeller/css_utils/name_defaults.js */
    const cssNames = new ScrollyTellerNames();
    const appContainerId = 'app';

    /** build a list of story sections.  Constructors should return a valid configuration */

    const simple = new SimpleSection({ appContainerId, cssNames }); // returns it own config
    const example = new ExampleChartSection({ appContainerId, cssNames });
    const storySections = [
      simple,
      example,
    ];

    this.state = {
      appContainerId,
      cssNames,
      titleSectionProps: {
        titleTextCSS: 'title',
        titleText: 'Scrolly Teller Example',
      },
      sectionList: keyBy(storySections, 'sectionIdentifier'),
    };

    this.title = new TitleSection({
      appContainerId: this.state.appContainerId,
      ...this.state.titleSectionProps,
    });

    this.dataStory = new DataStory(this.state);
  }
}

$(document).ready(() => {
  new App();
});
