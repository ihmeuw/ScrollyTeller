import { select } from 'd3';
import * as d3promise from 'd3.promise';

function buildChart() {
}

function onActivateNarration(index, activeNarrationBlock, graphId, graph, data) {
}

function onScroll(index, progress, activeNarrationBlock, graphId, graph, data) {
  /** use trigger specified in the narration csv file to trigger actions */
  switch (activeNarrationBlock.getAttribute('trigger')) {
    case 'unhide':
      /** set graph opacity based on progress to fade graph in */
      select(`#${graphId}`).style('opacity', progress - 0.05);
      break;
    case 'hide':
      /** set graph opacity based on progress to fade graph out */
      select(`#${graphId}`).style('opacity', 0.9 - progress);
      break;
    default:
      select(`#${graphId}`).style('opacity', 1);
  }
}

export default function simpleSectionConfig({ appContainerId }) {
  /** section object with identifier, narration, and data (for the graph), stored, and returned
   * to create the state object */
  return {
    appContainerId,
    sectionIdentifier: 'simple',
    /** array of narration objects, OR a promise to return an array of narration objects.
     * See README for the specfication of the narration objects */
    narration: d3promise.csv('app/01_example_section_simple/data/narrationSectionSimple.csv'),
    // narration: [ {}, ],
    /** data in a form consumable by user specified graphing methods,
     * OR a promise to return data. */
    data: { notEmpty: [] }, // data can't be empty
    /** promise example... */
    // data: d3promise.csv('app/99_example_section_chart/data/dataBySeries.csv'),

    /** optional function to reshape data after queries or parsing from a file */
    // reshapeDataFunction: function(data) { return data; },

    /** functions that must be implemented/defined */
    buildGraphFunction: buildChart,
    onScrollFunction: onScroll,
    onActivateNarrationFunction: onActivateNarration,

    /** optional flags to govern spacers and css behavior */

    /** set to true to show spacer sizes for debugging */
    showSpacers: true,
    /**  if false, you must specify your own graph css, where
     * the graph class name is "graph_section_ + sectionIdentifier" */
    useDefaultGraphCSS: true,
  };
}
