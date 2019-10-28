import { select } from 'd3-selection';
import './data/narration.csv';
import './scss/introduction.scss';
import './data/slides';
import { updateSvgImage } from '../utils';

/** local state object */
const sectionState = {
  svgFileName: '',
};

/** section configuration object with identifier, narration, and data (for the graph)  */
export default {
  /** identifier used to delineate different sections.  Should be unique from other sections
   * identifiers */
  sectionIdentifier: 'introduction',

  /** narration can be either of the following 3 options:
   *  1) a string representing an absolute file path to a file of the following types:
   *      'csv', 'tsv', 'json', 'html', 'txt', 'xml', which will be parsed by d3.promise
   *  2) array of narration objects,
   *  3) a promise to return an array of narration objects in the appropriate form
   * See README for the specification of the narration objects */
  narration: 'demo_app/00_introduction/data/narration.csv',

  /** data can be either of the following 4 options:
   *  1) a string representing an absolute file path to a file of the following types:
   *      'csv', 'tsv', 'json', 'html', 'txt', 'xml', which will be parsed by d3-fetch
   *  2) array of data objects
   *  3) a promise to return an array of narration objects in the appropriate form
   *  4) undefined
   */
  /** data from path example */
  data: [],

  convertTriggerToObject: true,

  /**
   * Optional method to reshape the data passed into ScrollyTeller, or resolved by the data promise
   * @param {object} results - data passed into ScrollyTeller or the result of resolving the data promise (see below).
   * @returns {object|array} -  an object or array of data of user-defined shape
   */
  reshapeDataFunction: function processData(results) {
    return {};
  },

  /**
   * Called AFTER data is fetched, and reshapeDataFunction is called.  This method should
   * build the graph and return an instance of that graph, which will passed as arguments
   * to the onScrollFunction and onActivateNarration functions.
   *
   * This function is called as follows:
   * buildGraphFunction(graphId, sectionConfig)
   * @param {string} graphId - id of the graph in this section. const myGraph = d3.select(`#${graphId}`);
   * @param {object} sectionConfig - the configuration object passed to ScrollyTeller
   * @param {object} [sectionConfig] - the configuration object passed to ScrollyTeller
   * @param {string} [sectionConfig.sectionIdentifier] - the identifier for this section
   * @param {object} [sectionConfig.graph] - the chart instance, or a reference containing the result of the buildChart() function above
   * @param {object} [sectionConfig.data] - the data that was passed in or resolved by the promise and processed by reshapeDataFunction()
   * @param {object} [sectionConfig.scroller] - the scrollama object that handles activation of narration, etc
   * @param {object} [sectionConfig.cssNames] - the CSSNames object containing some useful functions for getting the css identifiers of narrations, graph, and the section
   * @param {object} [params.sectionConfig.elementResizeDetector] - the element-resize-detector object: see https://github.com/wnr/element-resize-detector for usage
   * @returns {object} - chart instance
   */
  buildGraphFunction: function buildGraph(graphId, sectionConfig) {
    /** REMEMBER TO RETURN THE GRAPH! (could also return as an object with multiple graphs, etc)
     * The graph object is assigned to sectionConfig.graph, which is returned to all scrollyteller
     * functions such as buildGraphFunction(), onActivateNarrationFunction(), onScrollFunction()  */
    select(`#${graphId}`)
      .append('div')
      .classed('imageDiv', true)
    updateSvgImage(graphId, { svgFileName: 'slide1' }, sectionState.svgFileName);
    sectionState.svgFileName = 'slide1';
    return undefined;
  },

  /**
   * Called upon scrolling of the section. See argument list below, this function is called as:
   * onScrollFunction({ index, progress, element, trigger, graphId, sectionConfig })
   * @param {object} [params] - object containing parameters
   * @param {number} [params.index] - index of the active narration object
   * @param {number} [params.progress] - 0-1 (sort of) value indicating progress through the active narration block
   * @param {HTMLElement} [params.element] - the narration block DOM element that is currently active
   * @param {string} [params.trigger] - the trigger attribute for narration block that is currently active
   * @param {string} [params.graphContainerId] - id of the graph container in this section. const graphContainer = d3.select(`#${graphContainerId}`);
   * @param {string} [params.graphId] - id of the graph in this section. const myGraph = d3.select(`#${graphId}`);
   * @param {object} [params.sectionConfig] - the configuration object passed to ScrollyTeller
   * @param {string} [params.sectionConfig.sectionIdentifier] - the identifier for this section
   * @param {object} [params.sectionConfig.graph] - the chart instance, or a reference containing the result of the buildChart() function above
   * @param {object} [params.sectionConfig.data] - the data that was passed in or resolved by the promise and processed by reshapeDataFunction()
   * @param {object} [params.sectionConfig.scroller] - the scrollama object that handles activation of narration, etc
   * @param {object} [params.sectionConfig.cssNames] - the CSSNames object containing some useful functions for getting the css identifiers of narrations, graph, and the section
   * @param {object} [params.sectionConfig.elementResizeDetector] - the element-resize-detector object: see https://github.com/wnr/element-resize-detector for usage
   * @returns {void}
   */
  onScrollFunction: function onScroll() {
  },

  /**
   * Called when a narration block is activated.
   * See argument list below, this function is called as:
   * onActivateNarration({ index, progress, element, trigger, graphId, sectionConfig })
   * @param {object} [params] - object containing parameters
   * @param {number} [params.index] - index of the active narration object
   * @param {number} [params.progress] - 0-1 (sort of) value indicating progress through the active narration block
   * @param {HTMLElement} [params.element] - the narration block DOM element that is currently active
   * @param {string} [params.trigger] - the trigger attribute for narration block that is currently active
   * @param {string} [params.direction] - the direction the event happened in (up or down)
   * @param {string} [params.graphContainerId] - id of the graph container in this section. const graphContainer = d3.select(`#${graphContainerId}`);
   * @param {string} [params.graphId] - id of the graph in this section. const myGraph = d3.select(`#${graphId}`);
   * @param {object} [params.sectionConfig] - the configuration object passed to ScrollyTeller
   * @param {string} [params.sectionConfig.sectionIdentifier] - the identifier for this section
   * @param {object} [params.sectionConfig.graph] - the chart instance, or a reference containing the result of the buildChart() function above
   * @param {object} [params.sectionConfig.data] - the data that was passed in or resolved by the promise and processed by reshapeDataFunction()
   * @param {object} [params.sectionConfig.scroller] - the scrollama object that handles activation of narration, etc
   * @param {object} [params.sectionConfig.cssNames] - the CSSNames object containing some useful functions for getting the css identifiers of narrations, graph, and the section
   * @param {object} [params.sectionConfig.elementResizeDetector] - the element-resize-detector object: see https://github.com/wnr/element-resize-detector for usage
   * @returns {void}
   */
  onActivateNarrationFunction: function onActivateNarration({
    graphId,
    state,
    state: {
      svgFileName,
    },
  }) {
    /** DISPLAY/FLIP BETWEEN IMAGES */
    updateSvgImage(graphId, state, sectionState.svgFileName);
    sectionState.svgFileName = svgFileName;
  },

  /**
   * Called upon resize of the graph container
   * @param {object} [params] - object containing parameters
   * @param {HTMLElement} [params.graphElement] - the narration block DOM element that is currently active
   * @param {string} [params.graphId] - id of the graph in this section. const myGraph = d3.select(`#${graphId}`);
   * @param {object} [params.sectionConfig] - the configuration object passed to ScrollyTeller
   * @param {string} [params.graphContainerId] - id of the graph container in this section. const graphContainer = d3.select(`#${graphContainerId}`);
   * @param {string} [params.graphId] - id of the graph in this section. const myGraph = d3.select(`#${graphId}`);
   * @param {string} [params.sectionConfig.sectionIdentifier] - the identifier for this section
   * @param {object} [params.sectionConfig.graph] - the chart instance, or a reference containing the result of the buildChart() function above
   * @param {object} [params.sectionConfig.data] - the data that was passed in or resolved by the promise and processed by reshapeDataFunction()
   * @param {object} [params.sectionConfig.scroller] - the scrollama object that handles activation of narration, etc
   * @param {object} [params.sectionConfig.cssNames] - the CSSNames object containing some useful functions for getting the css identifiers of narrations, graph, and the section
   * @param {object} [params.sectionConfig.elementResizeDetector] - the element-resize-detector object: see https://github.com/wnr/element-resize-detector for usage
   * @returns {void}
   */
  onResizeFunction: function onResize() {
  },
};
