import { select } from 'd3';
import * as d3promise from 'd3.promise';

/**
 * Optional method to reshape the data passed into ScrollyTeller, or resolved by the data promise
 * @param data - data passed into ScrollyTeller or the result of resolving
 *                  the data promise (see below).
 * @returns {data} an object or array of data of user-defined shape
 */
function reshapeData(data) {
  // do any data reshaping here and return
  return data;
}

/**
 * Called AFTER data is fetched, and reshapeDataFunction is called.  This method should
 * build the graph and return an instance of that graph, which will be passed as arguments
 * to the onScrollFunction and onActivateNarration functions
 * @param graphId - id of the graph in this section. const myGraph = d3.select(`#${graphId}`);
 * @param data - the data that was passed in or resolved by the promise, AND processed by reshapeDataFunction()
 */
function buildGraph(graphId, data) {
  // build graph
  // render using any initial data here
}

/**
 * Called when a narration block is activated
 * @param index - index of the active narration object
 * @param progress - 0-1 (sort of) value indicating progress through the active narration block
 * @param activeNarrationBlock - the narration block DOM element that is currently active
 * @param graphId - id of the graph in this section. const myGraph = d3.select(`#${graphId}`);
 * @param graph - the chart instance, or a reference containing the result of
 *                  the buildChart() function above
 * @param data - the data that was passed in or resolved by the promise,
 *                AND processed by reshapeDataFunction()
 */
function onActivateNarration(index, progress, activeNarrationBlock, graphId, sectionConfig) {
}

/**
 * Called upon scrolling of the section
 * @param index - index of the active narration object
 * @param progress - 0-1 (sort of) value indicating progress through the active narration block
 * @param activeNarrationBlock - the narration block DOM element that is currently active
 * @param graphId - id of the graph in this section. const myGraph = d3.select(`#${graphId}`);
 * @param graph - the chart instance, or a reference containing the result of
 *                  the buildChart() function above
 * @param data - the data that was passed in or resolved by the promise,
 *                AND processed by reshapeDataFunction()
 */
function onScroll(index, progress, activeNarrationBlock, graphId, sectionConfig) {
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

/**
 * Returns a valid ScrollyTeller section configuration object
 * @param appContainerId - id of the parent container
 * @returns {Object} representing a valid configuration object for a ScrollyTeller Section
 */
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
     * OR a promise to return data. Can be undefined and not used at all. */
    // data: [  ],

    /** promise example... */
    // data: d3promise.csv('app/99_example_section_chart/data/dataBySeries.csv'),

    /** optional function to reshape data after queries or parsing from a file */
    reshapeDataFunction: reshapeData,

    /** functions that must be implemented/defined */
    buildGraphFunction: buildGraph, // should return a reference to whatever graph is built
    /** argument list: (index, progress, activeNarrationBlock, graphId, graph, data)
     * see above implementation for usage */
    onScrollFunction: onScroll,
    /** argument list: (index, progress, activeNarrationBlock, graphId, graph, data)
     * see above implementation for usage */
    onActivateNarrationFunction: onActivateNarration,

    /** optional flags to govern spacers and css behavior */

    /** set to true to show spacer sizes for debugging */
    showSpacers: true,
    /**  if false, you must specify your own graph css, where
     * the graph class name is "graph_section_ + sectionIdentifier" */
    useDefaultGraphCSS: true,
  };
}
