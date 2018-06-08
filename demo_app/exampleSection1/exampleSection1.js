import {
  get,
  isUndefined,
  groupBy,
  findIndex,
  toNumber,
  toArray,
  isEmpty,
  reduce,
} from 'lodash';
import { select, timeParse } from 'd3';
import * as d3promise from 'd3.promise';
import SampleChart from './components/template.chart';
import './data/narrationExampleSection1.csv';

/**
 * Helper function to convert a user specified 'trigger' (set in the narration.csv file) to
 * to a data shape using the following specification:
 * series:yearstart-yearend,series:yearstart-yearend
 * @param {string} trigger representing the data requested
 * @param {object} data - data to parse
 * @returns {array} of data specified by the trigger string
 */
function getFilteredDataByTriggerString(trigger, data) {
  /** assume trigger is formatted as follows:
   * series:yearstart-yearend,series:yearstart-yearend
   */
  const seriesYearRangeArray = trigger.split(',');
  const allDataFiltered = reduce(seriesYearRangeArray, (accum, seriesYearRange) => {
    const [series, yearRange] = seriesYearRange.split(':');
    if (!isEmpty(series) && !isEmpty(yearRange)) {
      // TODO: check that years are in valid range?
      const dataSeries = get(data, series, undefined);
      if (!isUndefined(dataSeries)) {
        const parseTime = timeParse('%y');
        const yearArray = yearRange.split('-');
        const [yearStartDate, yearEndDate] = yearArray.map(parseTime);
        const filteredData = dataSeries.filter((datum) => {
          return datum.date >= yearStartDate && datum.date <= yearEndDate;
        });
        if (!isEmpty(filteredData)) {
          return accum.concat(filteredData);
        }
      }
    }
  }, []);

  return toArray(groupBy(allDataFiltered, 'series'));
}

/**
 * Called when a narration block is activated
 * @param {object} [params] - object containing parameters
 * @param {number} [params.index] - index of the active narration object
 * @param {number} [params.progress] - 0-1 (sort of) value indicating progress through the active narration block
 * @param {HTMLElement} [params.element] - the narration block DOM element that is currently active
 * @param {string} [params.trigger] - the trigger attribute for narration block that is currently active
 * @param {string} [params.direction] - the direction the event happened in (up or down)
 * @param {string} [params.graphId] - id of the graph in this section. const myGraph = d3.select(`#${graphId}`);
 * @param {object} [params.sectionConfig] - the configuration object passed to ScrollyTeller
 * @param {string} [params.sectionConfig.sectionIdentifier] - the identifier for this section
 * @param {object} [params.sectionConfig.graph] - the chart instance, or a reference containing the result of the buildChart() function above
 * @param {object} [params.sectionConfig.data] - the data that was passed in or resolved by the promise and processed by reshapeDataFunction()
 * @param {object} [params.sectionConfig.scroller] - the scrollama object that handles activation of narration, etc
 * @param {object} [params.sectionConfig.cssNames] - the CSSNames object containing some useful functions for getting the css identifiers of narrations, graph, and the section
 * @returns {void}
 */
function onActivateNarration({ trigger, sectionConfig }) {
  switch (trigger) {
    case 'unhide':
    case 'hide':
    case 'opacityzero':
      break; // do nothing for unhide, hide, opacity zero
    default: {
      const filteredData = getFilteredDataByTriggerString(trigger, sectionConfig.data);
      if (!isEmpty(filteredData)) {
        filteredData.forEach((datum) => {
          sectionConfig.graph.update(datum);
        });
      }
    }
  }
}

/** section configuration object with identifier, narration, and data (for the graph)  */
export default {
  /** identifier used to delineate different sections.  Should be unique from other sections
   * identifiers */
  sectionIdentifier: 'myExampleSection1',

  /** narration can be either of the following 3 options:
   *  1) a string representing an absolute file path to a file of the following types:
   *      'csv', 'tsv', 'json', 'html', 'txt', 'xml', which will be parsed by d3.promise
   *  2) array of narration objects,
   *  3) a promise to return an array of narration objects in the appropriate form
   * See README for the specfication of the narration objects */
  narration: 'demo_app/exampleSection1/data/narrationExampleSection1.csv',

  /** narration as array example */
  // narration: [ {}, ],

  /** narration as promise example */
  // narration: d3promise.csv('demo_app/exampleSection1/data/narrationExampleSection1.csv'),

  /** data can be either of the following 4 options:
   *  1) a string representing an absolute file path to a file of the following types:
   *      'csv', 'tsv', 'json', 'html', 'txt', 'xml', which will be parsed by d3.promise
   *  2) array of data objects
   *  3) a promise to return an array of narration objects in the appropriate form
   *  4) undefined
   */
  // data: 'demo_app/exampleSection1/data/dataBySeries.csv',
  /** data as array example */
  // data: [ {}, ],
  /** data from path example */
  data: 'demo_app/exampleSection1/data/dataBySeries.csv',

  /**
   * Optional method to reshape the data passed into ScrollyTeller, or resolved by the data promise
   * @param {object} results - data passed into ScrollyTeller or the result of resolving the data promise (see below).
   * @returns {object|array} -  an object or array of data of user-defined shape
   */
  reshapeDataFunction: function processData(results) {
    const parseTime = timeParse('%y');
    /** parse results and convert dates to years, close to number */
    const dataProcessed = results.map((datum) => {
      return {
        series: datum.series,
        date: parseTime(datum.date),
        close: toNumber(datum.close),
      };
    });
    /** set data to the results array and handle some date and number conversion */
    return groupBy(dataProcessed, 'series');
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
    const svgWidth = select(`#${graphId}`).node().offsetWidth * 0.9;
    const svgHeight = select(`#${graphId}`).node().offsetHeight * 0.9;
    const graph = new SampleChart({
      container: `#${graphId}`,
      width: svgWidth,
      height: svgHeight,
    });
    const filteredData = getFilteredDataByTriggerString('series1:90-17', sectionConfig.data);

    if (!isEmpty(filteredData)) {
      filteredData.forEach((datum) => {
        graph.render(datum);
      });
    }

    return graph;
  },

  /**
   * Called upon scrolling of the section. See argument list below, this function is called as:
   * onScrollFunction({ index, progress, element, trigger, graphId, sectionConfig })
   * @param {object} [params] - object containing parameters
   * @param {number} [params.index] - index of the active narration object
   * @param {number} [params.progress] - 0-1 (sort of) value indicating progress through the active narration block
   * @param {HTMLElement} [params.element] - the narration block DOM element that is currently active
   * @param {string} [params.trigger] - the trigger attribute for narration block that is currently active
   * @param {string} [params.direction] - the direction the event happened in (up or down)
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
  onScrollFunction: function onScroll({ progress, trigger, graphId }) {
    const myGraph = select(`#${graphId}`);
    /** use trigger specified in the narration csv file to trigger actions */
    switch (trigger) {
      case 'unhide':
        /** set graph opacity based on progress to fade graph in */
        myGraph.style('opacity', progress);
        break;
      case 'hide':
        /** set graph opacity based on progress to fade graph out */
        myGraph.style('opacity', 1 - progress);
        break;
      case 'opacityzero':
        /** set opacity to zero (after fadeout */
        myGraph.style('opacity', 0);
        break;
      default:
        break;
    }
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
  onActivateNarrationFunction: onActivateNarration,

  /**
   * Called upon resize of the graph container
   * @param {object} [params] - object containing parameters
   * @param {HTMLElement} [params.graphElement] - the narration block DOM element that is currently active
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
  onResizeFunction: function onResize({ graphElement, graphId, sectionConfig }) {
    const svgWidth = graphElement.offsetWidth * 0.9;
    const svgHeight = graphElement.offsetHeight * 0.9;
    sectionConfig.graph.resize(svgWidth, svgHeight);
  },
};