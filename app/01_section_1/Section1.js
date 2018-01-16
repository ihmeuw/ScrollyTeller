import {
  bind,
  get,
  isEmpty,
} from 'lodash';
import { select } from 'd3';
import ScrollyTeller from '../ScrollyTeller/ScrollyTeller';

export default class Section1 extends ScrollyTeller {
  constructor({
    /** the id of a div to which this section should be added */
    appContainerId,
    /** can be any number, string, etc */
    sectionIdentifier = 1,
    /** must be an absolure path */
    narrationCSVFilePath = 'app/01_section_1/narration_section_1.csv',
    /** set to true to show spacer sizes for debugging */
    showSpacers = true,
    /**  if false, you must specify your own graph css, where
       * the graph class name is "graph_section_ + sectionIdentifier" */
    useDefaultGraphCSS = true,
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

  async parseData() {
  }

  buildChart() {
  }

  onActivateNarration(index, activeDomElement) {
  }

  onScroll(index, progress, activeDomElement) {
    /** use trigger specified in the narration csv file to trigger actions */
    switch (activeDomElement.getAttribute('trigger')) {
      case 'unhide':
        /** set graph opacity based on progress to fade graph in */
        select(`#${this.graphId()}`).style('opacity', progress - 0.05);
        break;
      case 'hide':
        /** set graph opacity based on progress to fade graph out */
        select(`#${this.graphId()}`).style('opacity', 0.9 - progress);
        break;
      default:
        select(`#${this.graphId()}`).style('opacity', 1);
    }
  }
}
