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

/**
 * Optional method to reshape the data passed into ScrollyTeller, or resolved by the data promise
 * @param data - data passed into ScrollyTeller or the result of resolving
 *                  the data promise (see below).
 * @returns {data} an object or array of data of user-defined shape
 */
function processData(results) {
  /** using d3promise to convert d3.csv calls to promises */
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
}

/**
 * Helper function to convert a user specified 'trigger' (set in the narration.csv file) to
 * to a data shape using the following specification:
 * series:yearstart-yearend,series:yearstart-yearend
 * @param trigger {string} representing the data requested
 * @param data - data to parse
 * @returns {Array} of data specified by the trigger string
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
 * Called AFTER data is fetched, and reshapeDataFunction is called.  This method should
 * build the graph and return an instance of that graph, which will be passed as arguments
 * to the onScrollFunction and onActivateNarration functions
 * @param graphId - id of the graph in this section. const myGraph = d3.select(`#${graphId}`);
 * @param sectionConfig - the configuration object passed to ScrollyTeller, with the following
 *        properties: (sectionConfig.graph, sectionConfig.data, etc)
 *           sectionIdentifier - the identifier for this section
 *           graph - the chart instance, or a reference containing the result of
 *                   the buildChart() function above
 *           data - the data that was passed in or resolved by the promise
 *                   and processed by reshapeDataFunction()
 *           graphScroll - the GraphScroll object that handles activation of narration, etc
 *           cssNames - the ScrollyTellerNames object containing some useful functions for getting
 *                    the css identifiers of narrations, graph, and the section
 */
function buildChart(graphId, sectionConfig) {
  const graph = new SampleChart({
    container: `#${graphId}`,
  });
  const filteredData = getFilteredDataByTriggerString('series1:90-17', sectionConfig.data);

  if (!isEmpty(filteredData)) {
    filteredData.forEach((datum) => {
      graph.render(datum);
    });
  }
  return graph;
}

/**
 * Called when a narration block is activated
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
 *           cssNames - the ScrollyTellerNames object containing some useful functions for getting
 *                    the css identifiers of narrations, graph, and the section
 */
function onActivateNarration(index, progress, activeNarrationBlock, graphId, sectionConfig) {
  const trigger = activeNarrationBlock.getAttribute('trigger');
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

/**
 * Called upon scrolling of the section
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
 *           cssNames - the ScrollyTellerNames object containing some useful functions for getting
 *                    the css identifiers of narrations, graph, and the section
 */function onScroll(index, progress, activeNarrationBlock, graphId, sectionConfig) {
  const myGraph = select(`#${graphId}`);
  const classNames = myGraph.nodes()[0].className.split(' ');
  if (!findIndex(classNames, 'graph-scroll-fixed')) {
    myGraph.style('opacity', 0);
  } else {
    /** use trigger specified in the narration csv file to trigger actions */
    switch (activeNarrationBlock.getAttribute('trigger')) {
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
        myGraph.style('opacity', 1);
    }
  }
}

/**
 * Returns a valid ScrollyTeller section configuration object
 * @param appContainerId - id of the parent container
 * @returns {Object} representing a valid configuration object for a ScrollyTeller Section
 */
export default function exampleChartConfig({ appContainerId }) {
  /** section object with identifier, narration, and data (for the graph), stored, and returned
   * to create the state object */
  return {
    /** The id of the <div> that will hold this and all other sections */
    appContainerId,

    /** identifier used to delineate different sections.  Should be unique from other sections
     * identifiers */
    sectionIdentifier: 'example',

    /** narration can be either of the following 3 options:
     *  1) a string representing an absolute file path to a file of the following types:
     *      'csv', 'tsv', 'json', 'html', 'txt', 'xml', which will be parsed by d3.promise
     *  2) array of narration objects,
     *  3) a promise to return an array of narration objects in the appropriate form
     * See README for the specfication of the narration objects */
    narration: 'app/99_example_section_chart/data/narrationSectionChart.csv',
    /** narration as array example */
    // narration: [ {}, ],
    /** narration as promise example */
    // narration: d3promise.csv('app/99_example_section_chart/data/narrationSectionChart.csv'),

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
    data: d3promise.csv('app/99_example_section_chart/data/dataBySeries.csv'),

    /** optional function to reshape data after queries or parsing from a file */
    reshapeDataFunction: processData,

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
     *           cssNames - the ScrollyTellerNames object containing some useful functions for getting
     *                    the css identifiers of narrations, graph, and the section
     */
    buildGraphFunction: buildChart,

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
     *           cssNames - the ScrollyTellerNames object containing some useful functions for getting
     *                    the css identifiers of narrations, graph, and the section
     */
    onScrollFunction: onScroll,

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
     *           cssNames - the ScrollyTellerNames object containing some useful functions for getting
     *                    the css identifiers of narrations, graph, and the section
     */
    onActivateNarrationFunction: onActivateNarration,

    /** optional flags to govern spacers and css behavior */
    /** set to true to show spacer sizes for debugging */
    showSpacers: true,
    /**  if false, you must specify your own graph css, where
     * the graph class name is "graph_section_ + sectionIdentifier" */
    useDefaultGraphCSS: false,
  };
}
