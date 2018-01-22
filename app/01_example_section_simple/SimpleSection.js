import { select } from 'd3';
import * as d3promise from 'd3.promise';

export default class SimpleSection {
  constructor({ appContainerId, cssNames }) {
    /** section object with identifier, narration, and data (for the graph), stored, and returned
     * to create the state object */
    this.config = {
      appContainerId,
      sectionIdentifier: 'simple',
      /** array of narration objects, OR a promise to return an array of narration objects.
       * See README for the specfication of the narration objects */
      narration: d3promise.csv('app/01_example_section_simple/data/narration_section_simple.csv'),
      // narration: [ {}, ],
      /** data in a form consumable by user specified graphing methods,
       * OR a promise to return data. */
      data: { notEmpty: [] }, // data can't be empty
      /** promise example... */
      // data: d3promise.csv('app/99_example_section_chart/data/data-by-series.csv'),

      /** optional function to reshape data after queries or parsing from a file */
      // reshapeDataFunction: function(data) { return data; },

      /** functions that must be implemented/defined */
      functionBindingContext: this,
      buildGraphFunction: this.buildChart,
      onScrollFunction: this.onScroll,
      onActivateNarrationFunction: this.onActivateNarration,

      /** optional flags to govern spacers and css behavior */

      /** set to true to show spacer sizes for debugging */
      showSpacers: true,
      /**  if false, you must specify your own graph css, where
       * the graph class name is "graph_section_ + sectionIdentifier" */
      useDefaultGraphCSS: true,
    };

    return this.config;
  }

  buildChart() {
  }

  onActivateNarration(index, activeNarrationBlock) {
  }

  onScroll(index, progress, activeNarrationBlock) {
    /** use trigger specified in the narration csv file to trigger actions */
    switch (activeNarrationBlock.getAttribute('trigger')) {
      case 'unhide':
        /** set graph opacity based on progress to fade graph in */
        select(`#${this.myGraphId()}`).style('opacity', progress - 0.05);
        break;
      case 'hide':
        /** set graph opacity based on progress to fade graph out */
        select(`#${this.myGraphId()}`).style('opacity', 0.9 - progress);
        break;
      default:
        select(`#${this.myGraphId()}`).style('opacity', 1);
    }
  }

  myGraphId() {
    return this.config.cssNames.graphId(this.config.sectionIdentifier);
  }
}
