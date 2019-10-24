/* global document window */
import { select, selectAll } from 'd3';
import { get } from 'lodash-es';
import './scss/style.scss';
import ScrollyTeller from '../src/ScrollyTeller/ScrollyTeller.js';
import intro from './00_introduction/scrollyTellerConfig';
import wealthAndHealthConfig from './01_wealthAndHealthOfNations/scrollyTellerConfig';
import builtInTriggers from './02_builtInTriggers/scrollyTellerConfig';

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
        [wealthAndHealthConfig.sectionIdentifier]: wealthAndHealthConfig,
        [builtInTriggers.sectionIdentifier]: builtInTriggers,
      },
      /** optional function to receive the current sectionIdentifier,
       * narrationIndex, narrationId, and narrationClass
       * when narration blocks are entered */
      onNarrationChangedFunction: ({ narrationClass }) => {
        /** remove .active from all navButtons */
        selectAll('.navButton')
          .classed('active', false);
        /** set navButtons with class narrationClass to .active */
        selectAll(`.navButton.${narrationClass}`)
          .classed('active', true);
      },
    };

    /** create the ScrollyTeller object to validate the config */
    const storyInstance = new ScrollyTeller(storyConfiguration);

    /** parse data and build all HMTL */
    storyInstance.render();

    /** build click handlers for each button to trigger ScrollyTeller.scrollTo()
     * the appropriate section/narration as defined as DOM data- attributes */
    selectAll('.navButton')
      .on('click', function () {
        const elt = select(this).node();
        storyInstance.scrollTo(
          get(elt, ['dataset', 'section']),
          get(elt, ['dataset', 'narrationtarget']),
        );
      });
  }
}

document.addEventListener('DOMContentLoaded', () => {
  window.app = new App();
});
