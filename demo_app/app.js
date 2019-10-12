/* global document window */
import './scss/style.scss';
import ScrollyTeller from '../src/ScrollyTeller/ScrollyTeller.js';
import intro from './introduction/scrollyTellerConfig';
import myExampleSection0 from './exampleSection0/exampleSection0';
import wealthAndHealthConfig from './healthAndWealthOfNations/scrollyTellerConfig';

export default class App {
  constructor() {
    /** ScrollyTeller */
    const storyConfiguration = {
      /** The id of the <div> that will contain all of the page content */
      appContainerId: 'app',
      /** build a list of story sections, keyed by sectionIdentifier.
       * Each section object should be a valid section configuration with
       * the properties defined in the next section */
      sectionList: {
        /** [key = sectionIdentifier]: value = { section config object } */
        [intro.sectionIdentifier]: intro,
        [myExampleSection0.sectionIdentifier]: myExampleSection0,
        [wealthAndHealthConfig.sectionIdentifier]: wealthAndHealthConfig,
      },
    };

    /** create the ScrollyTeller object to validate the config */
    const storyInstance = new ScrollyTeller(storyConfiguration);

    /** parse data and build all HMTL */
    storyInstance.render();
  }
}

document.addEventListener('DOMContentLoaded', () => {
  window.app = new App();
});

