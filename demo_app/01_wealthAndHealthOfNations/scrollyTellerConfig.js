/* globals PR */
import { isNil } from 'lodash-es'
import { interpolate } from 'd3-interpolate';
import { select } from 'd3-selection';
import { extent } from 'd3-array';
import WealthAndHealthOfNations from './components/wealthAndHealthOfNations';
import snippets from './components/codeSnippets';
import './scss/wealthAndHealth.scss';
import './data/narration.csv';
import { highlightLines, updateSvgImage } from '../utils';

/** local state object */
const sectionState = {
  svgFileName: '',
};
const CODE_HIGHLIGHT_COLOR = '#8078ff36';

function handleActivateNarrationAndResize({
  graphId,
  state: {
    year,
    snippet,
    highlight,
    svgFileName,
  }, /** destructure "year" variable from state */
  sectionConfig: {
    graph: {
      $codeSnippetSelection,
      wealthAndHealthSelector,
      wealthAndHealthGraph,
    },
  }, /** destructure graph from section config */
  width,
  height,
}) {
  /** DISPLAY CODE SNIPPETS */
  let code = '';
  if (snippet) {
    code = snippet.includes('HTML')
      ? snippets[snippet]
      : `<pre class="prettyprint lang-js linenums:5">${snippets[snippet]}</pre>`;
  }
  $codeSnippetSelection
    .html(code);
  PR.prettyPrint();

  if (snippet && highlight) {
    highlightLines(
      $codeSnippetSelection,
      highlight.toString().split(','),
      CODE_HIGHLIGHT_COLOR,
    );
  }

  /** DISPLAY/FLIP BETWEEN IMAGES */
  updateSvgImage(graphId, { svgFileName }, sectionState.svgFileName);
  sectionState.svgFileName = svgFileName;

  /** HIDE GRAPH WHEN CODE SNIPPETS ARE DISPLAYED */
  if (snippet || svgFileName) {
    select(wealthAndHealthSelector).style('opacity', 0);
  } else {
    /** render a year (year = undefined defaults to min year in component) */
    select(wealthAndHealthSelector)
      .style('opacity', 1);
    /** handle resize if width/height exist */
    if (width && height) {
      wealthAndHealthGraph.resize({ width, height });
    } else if (!isNil(year)) {
      wealthAndHealthGraph.render({
        year: Number(year),
        duration: 1000,
      });
    }
  }
}

/** section configuration object with identifier, narration, and data (for the graph)  */
export default {
  /** identifier used to delineate different sections.  Should be unique from other sections
   * identifiers */
  sectionIdentifier: 'wealthAndHealth',

  /** narration can be either of the following 3 options:
   *  1) a string representing an absolute file path to a file of the following types:
   *      'csv', 'tsv', 'json', 'html', 'txt', 'xml', which will be parsed by d3.promise
   *  2) array of narration objects,
   *  3) a promise to return an array of narration objects in the appropriate form
   * See README for the specfication of the narration objects */
  narration: 'demo_app/01_wealthAndHealthOfNations/data/narration.csv',

  /** data can be either of the following 4 options:
   *  1) a string representing an absolute file path to a file of the following types:
   *      'csv', 'tsv', 'json', 'html', 'txt', 'xml', which will be parsed by d3-fetch
   *  2) array of data objects
   *  3) a promise to return an array of narration objects in the appropriate form
   *  4) undefined
   */
  /** data from path example */
  data: 'demo_app/01_wealthAndHealthOfNations/data/wealthAndHealthData.json',

  /**
   * Optional method to reshape the data passed into ScrollyTeller, or resolved by the data promise
   * @param {object} results - data passed into ScrollyTeller or the result of resolving the data promise (see below).
   * @returns {object|array} -  an object or array of data of user-defined shape
   */
  reshapeDataFunction: function processData(results) {
    /** compute data domains for population (radius), income (x), life expectancy (y), and years
     * These functions compute the data domains [min, max] over a range of years from
     * 1950 - 2008 so the graph axes don't change as we update */
    const rDomain = extent(results.reduce((acc, d) => (acc.concat(...extent(d.population))), []));
    const xDomain = extent(results.reduce((acc, d) => (acc.concat(...extent(d.income))), []));
    const yDomain = extent(results.reduce((acc, d) =>
      (acc.concat(...extent(d.lifeExpectancy))), []));
    const yearDomain = extent(results.reduce((acc, d) => (acc.concat(...extent(d.years))), []));

    /** Legend items are regions, so get unique region names */
    const legendArray = results.reduce((acc, d) =>
      (acc.includes(d.region) ? acc : acc.concat(d.region)), []);

    /** return the raw data, domains, and scales, which will be assigned
     * to sectionConfig.data. The sectionConfig object is received by all scrollyteller
     * functions such as buildGraphFunction(), onActivateNarrationFunction(), onScrollFunction() */
    return {
      dataArray: results,
      legendArray,
      rDomain,
      xDomain,
      yDomain,
      yearDomain,
    };
  },

  /**
   * Called AFTER data is fetched, and reshapeDataFunction is called.  This method should
   * build the graph and return an instance of that graph, which will passed as arguments
   * to the onScrollFunction and onActivateNarration functions.
   *
   * This function is called as follows:
   * buildGraphFunction(graphId, sectionConfig)
   * @param {string} graphId - id of the graph in this section. const myGraph = d3.select(`#${graphId}`);
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
    const {
      /** destructure the dataArray and domains computed by reshapeDataFunction() from the sectionConfig */
      data: {
        dataArray,
        legendArray,
        rDomain,
        xDomain,
        yDomain,
        yearDomain,
      },
    } = sectionConfig;

    /** create a css selector to select the graph div by id */
    const graphSelector = `#${graphId}`;

    /** create a div to render images */
    select(`#${graphId}`)
      .append('div')
      .classed('imageDiv', true);

    /** build the wealth and health graph */
    const wealthAndHealthGraph = new WealthAndHealthOfNations({
      container: graphSelector,
      /** data */
      data: dataArray,
      /** data domains */
      rDomain,
      xDomain,
      yDomain,
      yearDomain,
      /** legend values */
      legendArray,
      /** dimensions */
      height: select(graphSelector).node().offsetHeight * 0.9,
      width: select(graphSelector).node().offsetWidth * 0.9,
    });

    /** create a div to render code snippets */
    const $codeSnippetSelection = select(graphSelector)
      .append('div')
      .attr('id', 'codeSnippet');

    /** REMEMBER TO RETURN THE GRAPH! (could also return as an object with multiple graphs, etc)
     * The graph object is assigned to sectionConfig.graph, which is returned to all scrollyteller
     * functions such as buildGraphFunction(), onActivateNarrationFunction(), onScrollFunction()  */
    return {
      $codeSnippetSelection,
      wealthAndHealthSelector: `#${graphId} svg`,
      wealthAndHealthGraph,
    };
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
  onScrollFunction: function onScroll({
    progress,
    state: {
      yearDomain,
    }, /** destructure year progress variable set from the narration.csv file */
    sectionConfig: {
      graph: {
        snippet,
        svgFileName,
        wealthAndHealthGraph,
        wealthAndHealthSelector,
      }, /** destructure graph from section config */
    },
  }) {
    if (snippet || svgFileName) {
      select(wealthAndHealthSelector).style('opacity', 0);
    } else if (!isNil(yearDomain)) {
      const interpolateYear = interpolate(...yearDomain)(progress);
      wealthAndHealthGraph.render({
        year: Math.floor(interpolateYear),
        duration: 100,
      });
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
  onActivateNarrationFunction: handleActivateNarrationAndResize,

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
  onResizeFunction: function onResize({
    graphElement,
    ...rest
  }) {
    handleActivateNarrationAndResize({
      ...rest,
      graphElement,
      width: graphElement.offsetWidth * 0.9,
      height: graphElement.offsetHeight * 0.9,
    });
  },
};
