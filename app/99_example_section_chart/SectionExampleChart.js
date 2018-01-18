import {
  get,
  isUndefined,
  groupBy,
  toNumber,
  toArray,
  isEmpty,
  reduce,
} from 'lodash';
import * as d3 from 'd3';
import * as d3promise from 'd3.promise';
import ScrollyTeller from '../ScrollyTeller/ScrollyTeller';
import SampleChart from './components/template.chart';

export default class SectionExampleChart extends ScrollyTeller {
  constructor({
    /** the id of a div to which this section should be added */
    appContainerId = 'app',
    /** can be any number, string, etc */
    sectionIdentifier = 'chart',
    /** must be an absolute path */
    narrationCSVFilePath = 'app/99_example_section_chart/data/narration_section_chart.csv',
    /** set to true to show spacer sizes for debugging */
    showSpacers = false,
    /**  if false, you must specify your own graph css, where
       * the graph class name is "graph_section_ + sectionIdentifier" */
    useDefaultGraphCSS = false,
  } = {}) {
    /**
     * The super class 'ScrollyTeller' takes the narration.csv and
     *      builds the following in the following order:
     * In parallel:
     * - Calls this.fetchData() to parse any data
     * - Builds the narration as follows:
     *   - A <div> with class = this.sectionClass() and id = this.sectionId() to hold narration
     *      and our graph
     *   - A 'narration' <div> with class = 'narration=' for each row in the narration.csv file
     *      which contains the scrolling text to narrate our graph
     *   - A 'graph' <div> with id = this.graphId() to hold our graph
     *
     * THEN, it calls this.buildChart() to build the chart
     */
    super({
      appContainerId,
      sectionIdentifier,
      narrationCSVFilePath,
      showSpacers,
      useDefaultGraphCSS,
    });
  }

  async fetchData() {
    this.data = {};

    /** using d3promise to convert d3.csv calls to promises */
    const parseTime = d3.timeParse('%y');
    await d3promise.csv('app/99_example_section_chart/data/data-by-series.csv')
      .then((results) => {
        /** parse results and convert dates to years, close to number */
        const dataProcessed = results.map((datum) => {
          return {
            series: datum.series,
            date: parseTime(datum.date),
            close: toNumber(datum.close),
          };
        });
        /** set this.data to the results array and handle some date and number conversion */
        this.data = groupBy(dataProcessed, 'series');

        console.log(this.data);
      })
      .catch((error) => {
        throw new Error('Error in SectionExampleChart.fetchData()');
      });
  }

  buildChart() {
    this.chart = new SampleChart({
      container: `#${this.graphId()}`,
    });
    this.chart.render(this.getFilteredDataByTriggerString('series1:90-17'));
  }

  onActivateNarration(index, activeNarrationBlock) {
    const trigger = activeNarrationBlock.getAttribute('trigger');
    const narrationId = activeNarrationBlock.id;

    switch (trigger) {
      case 'unhide':
      case 'hide':
      case 'opacityzero':
        break; // do nothing for unhide, hide, opacity zero
      default: {
        const filteredData = this.getFilteredDataByTriggerString(trigger);
        if (!isEmpty(filteredData)) {
          filteredData.forEach((datum) => {
            this.chart.update(datum);
          });
        }
      }
    }
  }

  getFilteredDataByTriggerString(trigger) {
    /** assume trigger is formatted as follows:
     * series:yearstart-yearend,series:yearstart-yearend
     */
    const seriesYearRangeArray = trigger.split(',');
    const allDataFiltered = reduce(seriesYearRangeArray, (accum, seriesYearRange) => {
      const [series, yearRange] = seriesYearRange.split(':');
      if (!isEmpty(series) && !isEmpty(yearRange)) {
        // TODO: check that years are in valid range?
        const dataSeries = get(this.data, series, undefined);
        if (!isUndefined(dataSeries)) {
          const parseTime = d3.timeParse('%y');
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

  onScroll(index, progress, activeNarrationBlock) {
    /** use trigger specified in the narration csv file to trigger actions */
    switch (activeNarrationBlock.getAttribute('trigger')) {
      case 'unhide':
        /** set opacity based on progress to fade graph in */
        d3.select(`#${this.graphId()}`).style('opacity', progress - 0.05);
        break;
      case 'hide':
        /** set opacity based on progress to fade graph out */
        d3.select(`#${this.graphId()}`).style('opacity', 0.9 - progress);
        break;
      case 'opacityzero':
        /** set opacity to zero (after fadeout */
        d3.select(`#${this.graphId()}`).style('opacity', 0);
        break;
      default:
        d3.select(`#${this.graphId()}`).style('opacity', 1);
    }
  }
}
