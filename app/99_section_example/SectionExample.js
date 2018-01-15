import {
  get,
  isUndefined,
} from 'lodash';
import * as d3 from 'd3';
import ScrollyTeller from '../ScrollyTeller/ScrollyTeller';
import SampleChart from '../sample/template.chart';

export default class SectionExample extends ScrollyTeller {
  constructor({
    /** the id of a div to which this section should be added */
    appContainerId = 'app',
    /** can be any number, string, etc */
    sectionIdentifier = 'example',
    /** must be an absolure path */
    narrationCSVFilePath = 'app/99_section_example/narration_example.csv',
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
     * - Calls this.parseData() to parse any data
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

  parseData() {
    this.data = {
      one: [],
      two: [],
      three: [],
      four: [],
    };
    const parseTime = d3.timeParse('%y');

    d3.csv('app/sample/update-data.csv', (error, data) => {
      if (error) throw error;
      this.data.one = data;
      this.data.one.forEach((d) => {
        d.date = parseTime(d.date);
        d.close = +d.close;
      });
    });

    d3.csv('app/sample/sample-data.csv', (error, data) => {
      if (error) throw error;
      this.data.two = data;
      this.data.two.forEach((d) => {
        d.date = parseTime(d.date);
        d.close = +d.close;
      });
    });

    d3.csv('app/sample/two-data.csv', (error, data) => {
      if (error) throw error;
      this.data.three = data;
      this.data.three.forEach((d) => {
        d.date = parseTime(d.date);
        d.close = +d.close;
      });
    });

    d3.csv('app/sample/three-data.csv', (error, data) => {
      if (error) throw error;
      this.data.four = data;
      this.data.four.forEach((d) => {
        d.date = parseTime(d.date);
        d.close = +d.close;
      });
    });
  }

  buildChart() {
    this.chart = new SampleChart({
      container: `#${this.graphId()}`,
    });
    this.chart.render(this.data.one);
  }

  onActivateNarration(index, activeDomElement) {
    const trigger = activeDomElement.getAttribute('trigger');
    /** trigger can be named as the data object "one", "two", "three" in the csv file
     * and stored as this.data.one.
     * The following lines attempt to retrieve the appropriate data based on the trigger
     * and if the data exists, update the chart */
    const data = get(this.data, trigger, undefined);
    if (!isUndefined(data)) {
      this.chart.update(data);
    }
  }

  onScroll(index, progress, activeDomElement) {
    /** use trigger specified in the narration csv file to trigger actions */
    switch (activeDomElement.getAttribute('trigger')) {
      case 'unhide':
        /** set opacity based on progress to fade graph in */
        d3.select(`#${this.graphId()}`).style('opacity', progress - 0.1);
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
