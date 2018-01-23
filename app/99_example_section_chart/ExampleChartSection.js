import {
  get,
  isUndefined,
  groupBy,
  toNumber,
  toArray,
  isEmpty,
  reduce,
} from 'lodash';
import { select, timeParse } from 'd3';
import * as d3promise from 'd3.promise';
import SampleChart from './components/template.chart';

export default class ExampleChartSection {
  constructor({ appContainerId }) {
    /** section object with identifier, narration, and data (for the graph), stored, and returned
     * to create the state object */
    this.config = {
      appContainerId,
      sectionIdentifier: 'example',
      /** array of narration objects, OR a promise to return an array of narration objects.
       * See README for the specfication of the narration objects */
      narration: d3promise.csv('app/99_example_section_chart/data/narrationSectionChart.csv'),
      // narration: [ {}, ],
      /** data in a form consumable by user specified graphing methods,
       * OR a promise to return data. */
      // data: { notEmpty: [] }, // data can't be empty
      data: d3promise.csv('app/99_example_section_chart/data/dataBySeries.csv'),

      /** optional function to reshape data after queries or parsing from a file */
      reshapeDataFunction: this.processData,

      /** functions that must be implemented/defined */
      functionBindingContext: this,
      buildGraphFunction: this.buildChart,
      onScrollFunction: this.onScroll,
      onActivateNarrationFunction: this.onActivateNarration,

      /** optional flags to govern spacers and css behavior */
      /** set to true to show spacer sizes for debugging */
      showSpacers: false,
      /**  if false, you must specify your own graph css, where
       * the graph class name is "graph_section_ + sectionIdentifier" */
      useDefaultGraphCSS: false,
    };

    return this.config;
  }

  processData(results) {
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
    /** set this.data to the results array and handle some date and number conversion */
    return groupBy(dataProcessed, 'series');
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
        const dataSeries = get(this.config.data, series, undefined);
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

  buildChart() {
    this.chart = new SampleChart({
      container: `#${this.myGraphId()}`,
    });
    this.chart.render(this.getFilteredDataByTriggerString('series1:90-17'));
  }

  onActivateNarration(index, activeNarrationBlock) {
    const trigger = activeNarrationBlock.getAttribute('trigger');

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
      case 'opacityzero':
        /** set opacity to zero (after fadeout */
        select(`#${this.myGraphId()}`).style('opacity', 0);
        break;
      default:
        select(`#${this.myGraphId()}`).style('opacity', 1);
    }
  }

  myGraphId() {
    return this.config.cssNames.graphId(this.config.sectionIdentifier);
  }
}
