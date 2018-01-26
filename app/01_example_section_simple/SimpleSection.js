import { select } from 'd3';
import * as d3promise from 'd3.promise';

/**
 * Returns a valid ScrollyTeller section configuration object
 * @param appContainerId - id of the parent container
 * @returns {Object} representing a valid configuration object for a ScrollyTeller Section
 */
export default function simpleSectionConfig() {
  /** section object with identifier, narration, and data (for the graph), stored, and returned
   * to create the scrollyTellerConfig object */
  return {
    /** identifier used to delineate different sections.  Should be unique from other sections
     * identifiers */
    sectionIdentifier: 'simple',

    /** narration can be either of the following 3 options:
     *  1) a string representing an absolute file path to a file of the following types:
     *      'csv', 'tsv', 'json', 'html', 'txt', 'xml', which will be parsed by d3.promise
     *  2) array of narration objects,
     *  3) a promise to return an array of narration objects in the appropriate form
     * See README for the specfication of the narration objects */
    narration: 'app/01_example_section_simple/data/narrationSectionSimple.csv',

    /** data can be either of the following 4 options:
     *  1) a string representing an absolute file path to a file of the following types:
     *      'csv', 'tsv', 'json', 'html', 'txt', 'xml', which will be parsed by d3.promise
     *  2) array of data objects
     *  3) a promise to return an array of narration objects in the appropriate form
     *  4) undefined
     */
    // data: 'app/99_example_section_chart/data/dataBySeries.csv',
    /** data as array example */
    // data: [ {}, ],
    /** data as promise example */
    // data: d3promise.csv('app/99_example_section_chart/data/dataBySeries.csv'),

    /** optional function to reshape data after queries or parsing from a file */
    reshapeDataFunction(data) {
      // do any data reshaping here and return the processed data
      if (data) {
        /** example: convert x and y string variables to numbers */
        return data.map((datum) => {
          return {
            x: +datum.x,
            y: +datum.y,
          };
        });
      }
    },

    /**
     * Called AFTER data is fetched, and reshapeDataFunction is called.  This method should
     * build the graph and return an instance of that graph, which will passed as arguments
     * to the onScrollFunction and onActivateNarration functions.
     *
     * This function is called as follows:
     * buildGraphFunction(graphId, sectionConfig)
     * @param graphId - id of the graph in this section. const myGraph = d3.select(`#${graphId}`);
     * @param sectionConfig - the configuration object passed to ScrollyTeller, with the following
     *        properties: (sectionConfig.graph, sectionConfig.data, etc)
     *           sectionIdentifier - the identifier for this section
     *           graph - the chart instance, or a reference containing the result of
     *                   the buildChart() function above
     *           data - the data that was passed in or resolved by the promise
     *                   and processed by reshapeDataFunction()
     *           graphScroll - the GraphScroll object that handles activation of narration, etc
     *           cssNames - the CSSNames object containing some useful functions for getting
     *                    the css identifiers of narrations, graph, and the section
     */
    buildGraphFunction(graphId, sectionConfig) {
      // build graph
      // render using any initial data (sectionConfig.data) here
      // return the result to store in sectionConfig.graph
    },

    /**
     * Called upon scrolling of the section. See argument list below, this function is called as:
     * onScrollFunction(index, progress, activeNarrationBlock, graphId, sectionConfig)
     *
     * @param index - index of the active narration object
     * @param progress - 0-1 (sort of) value indicating progress through the active narration block
     * @param activeNarrationBlock - the narration block DOM element that is currently active
     * @param graphId - id of the graph in this section. const myGraph = d3.select(`#${graphId}`);
     * @param sectionConfig - the configuration object passed to ScrollyTeller, with the following
     *        properties: (sectionConfig.graph, sectionConfig.data, etc)
     *           sectionIdentifier - the identifier for this section
     *           graph - the chart instance, or a reference containing the result of
     *                   the buildChart() function above
     *           data - the data that was passed in or resolved by the promise
     *                   and processed by reshapeDataFunction()
     *           graphScroll - the GraphScroll object that handles activation of narration, etc
     *           cssNames - the CSSNames object containing some useful functions for getting
     *                    the css identifiers of narrations, graph, and the section
     */
    onScrollFunction:
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
      },

    /**
     * Called when a narration block is activated.
     * See argument list below, this function is called as:
     * onActivateNarration(index, progress, activeNarrationBlock, graphId, sectionConfig)
     *
     * @param index - index of the active narration object
     * @param progress - 0-1 (sort of) value indicating progress through the active narration block
     * @param activeNarrationBlock - the narration block DOM element that is currently active
     * @param graphId - id of the graph in this section. const myGraph = d3.select(`#${graphId}`);
     * @param sectionConfig - the configuration object passed to ScrollyTeller, with the following
     *        properties: (sectionConfig.graph, sectionConfig.data, etc)
     *           sectionIdentifier - the identifier for this section
     *           graph - the chart instance, or a reference containing the result of
     *                   the buildChart() function above
     *           data - the data that was passed in or resolved by the promise
     *                   and processed by reshapeDataFunction()
     *           graphScroll - the GraphScroll object that handles activation of narration, etc
     *           cssNames - the CSSNames object containing some useful functions for getting
     *                    the css identifiers of narrations, graph, and the section
     */
    onActivateNarrationFunction:
      function onActivateNarration(index, progress, activeNarrationBlock, graphId, sectionConfig) {
      },

    /** optional flags to govern spacers and css behavior */

    /** set to true to show spacer sizes for debugging */
    showSpacers: true,
    /**  if false, you must specify your own graph css, where
     * the graph class name is "graph_section_ + sectionIdentifier" */
    useDefaultGraphCSS: true,
  };
}
