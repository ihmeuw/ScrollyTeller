/* global document window */
import './scss/style.scss';
import ScrollyTeller from '../src/ScrollyTeller/ScrollyTeller.js';
import myExampleSection0 from './exampleSection0/exampleSection0';
import myExampleSection1 from './exampleSection1/exampleSection1';

export default class App {
  constructor() {
    /** The id of the <div> that will contain all of the page content */
    const appContainerId = 'app';

    /** ScrollyTeller */
    const myScrollyTellerConfig = {
      appContainerId: appContainerId,
      /** build a list of story sections, keyed by sectionIdentifier.
       * Each section object should be a valid section configuration with
       * the properties defined in the next section */
      sectionList: {
        /** [key = sectionIdentifier]: value = { section config object } */
        [myExampleSection0.sectionIdentifier]: myExampleSection0,
        [myExampleSection1.sectionIdentifier]: myExampleSection1,
      },
    };

    /** create the ScrollyTeller object to validate the config */
    const myScrollyTellerInstance = new ScrollyTeller(myScrollyTellerConfig);

    /** parse data and build all HMTL */
    myScrollyTellerInstance.render();
  }
}

document.addEventListener('DOMContentLoaded', () => {
  window.app = new App();
});

