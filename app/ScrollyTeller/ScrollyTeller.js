import {
  isEmpty,
} from 'lodash';
import { select, selectAll } from 'd3';
import * as d3promise from 'd3.promise';
import { CSS } from './constants/constants';
import graphScroll from './lib/graph-scroll-scrollyteller-v0.0';

export default class ScrollyTeller {
  constructor({
    appContainerId,
    sectionIdentifier,
    narrationCSVFilePath,
    showSpacers = false,
    useDefaultGraphCSS = true,
  } = {}) {
    this.appContainerId = appContainerId;
    this.sectionIdentifier = sectionIdentifier;
    this.narrationCSVFilePath = narrationCSVFilePath;
    this.showSpacers = showSpacers;
    this.useDefaultGraphCSS = useDefaultGraphCSS;
    this.graphScroll = null; /** constructed via _buildGraphScrollContainer() */

    /** _buildAsync() takes the narration.csv and builds the following in the following order:
     * In parallel:
     * - Calls this.parseData() to parse any data necessary
     * - Builds the following:
     *   - A <div> with class = this.sectionClass() and id = this.sectionId() to hold narration
     *      and our graph
     *   - A 'narration' <div> with class = 'narration=' for each row in the narration.csv file
     *      which contains the scrolling text to narrate our graph
     *   - A 'graph' <div> with id = this.graphId() to hold our graph
     *
     * THEN after the data is parsed and the page is built:
     *   - calls this.buildChart() to build the chart
     */
    this._buildAsync();
  }

  /** 'PUBLIC' methods * */

  /** This method is invoked IN PARALLEL with the narration and graph scroll construction,
   *  but before buildChart() is invoked and can be overridden to build chart data before
   *  creating the chart
   */
  async parseData() {
  }

  /** This method is invoked AFTER the narration and graph scroll components have constructed,
   *  and must be overridden to create the chart with id = this.chartId()
   */
  buildChart() {
    const chartId = `#${this.graphId()}`;
    const myChartDiv = select(chartId);
    // build chart from here...
  }

  /** Triggered when a narration section hits the top of the page and becomes active
   *  Override this method in sub-classes to handle navigation triggers, and use the
   *   properties on the activeNarrationBlock to handle which data to trigger your graph changes
   *  @param index - index of the narration group in this.graphScroll.sections()
   *  @param activeNarrationBlock - the currently active narration DOM element */
  onActivateNarration(index, activeNarrationBlock) {
    const activeTriggerName = activeNarrationBlock.getAttribute('trigger');
    const myNarrationClass = activeNarrationBlock.className;
    const myNarrationId = activeNarrationBlock.id;

    /** you can also access other 'sections' or narration blocks via this.graphScroll.sections() */
    const previousIndex = index - 1 < 0 ? 0 : index;
    const previousNarrationElement = this.graphScroll.sections().nodes()[previousIndex];
  }

  /** Triggered upon scrolling
   *  Override this method in sub-classes to handle scroll events and use the
   *   properties on the activeNarrationBlock to handle which data to trigger your graph changes
   *  @param index - index of the narration group in graphScroll().sections()
   *  @param progress - a number between 0-1, 0 when the active narration block has just hit the top
   *        of the page, 1 when the whole block has been scrolled through
   *  @param activeNarrationBlock - the currently active narration DOM element */
  onScroll(index, progress, activeNarrationBlock) {
  }

  /** Returns the section id associated with this section based on the sectionIdentifier */
  sectionId() {
    return `${CSS.sectionContainer}_${this.sectionIdentifier}`;
  }

  /** Returns the section id associated with this section based on the sectionIdentifier */
  narrationId(index) {
    return `${CSS.narrationBlock}_${index}`;
  }

  /** Returns the section class name associated with this section based on the sectionIdentifier */
  sectionClass() {
    return `${CSS.sectionContainer}`;
  }

  /** Returns the graph id associated with this section based on the sectionIdentifier */
  graphId() {
    return `${CSS.graphContainer}_${this.sectionIdentifier}`;
  }

  graphClass() {
    return this.useDefaultGraphCSS
      ? CSS.graphContainerDefault
      : `${CSS.graphContainer}_${this.sectionIdentifier}`;
  }

  /** 'PRIVATE' METHODS * */

  _buildAsync() {
    Promise.all([
      this.parseData(),
      this._buildSectionWithNarration(this.narrationFilePath, this.sectionIdentifier),
    ])
      .then(() => {
        this._buildGraphScrollContainer();
      })
      .then(() => {
        this.buildChart();
      });
  }

  _buildGraphScrollContainer() {
    this.graphScroll = graphScroll()
      .container(select(`#${this.sectionId()}`))
      .graph(selectAll(`#${this.graphId()}`))
      .sections(selectAll(`#${this.sectionId()} > .${CSS.narrationBlock}`))
      .on('active', this.onActivateNarration.bind(this))
      .on('scroll', this.onScroll.bind(this));
  }

  async _buildSectionWithNarration() {
    select(`#${this.appContainerId}`)
      .append('div')
      .attr('class', this.sectionClass())
      .attr('id', this.sectionId());

    /** await parsing of the csv file */
    await d3promise.csv(this.narrationCSVFilePath)
    /** then build the html string and add it to this container */
      .then((narrationBlocksArray) => {
        /** select the appropriate section by id, and append a properly formatted html string
         * containing the contents of each narration block (row in the narration.csv file) */
        select(`#${this.sectionId()}`)
          .html(this._getNarrationHtmlString(narrationBlocksArray));

        /** insert the graph as the first div before narration divs */
        select(`#${this.sectionId()}`)
          .insert('div', ':first-child')
          .attr('class', this.graphClass())
          .attr('id', this.graphId());
      })
      .catch((error) => {
        throw new Error('Error in ScrollyTeller._buildSectionWithNarration() Invalid narrationCSVFilePath variable');
      });
  }

  _getNarrationHtmlString(narrationBlocksArray) {
    /** build the narration as an html string */
    return narrationBlocksArray.reduce((narrationHtmlString, block) => {
      /** outer sectionContainer for each part of the narration + spacerHide */
      const narrationBlockId = `${this.narrationId(block.narrationId)}`;
      const blockContainer = `<div class=${CSS.narrationBlock}\
                                   id=${narrationBlockId}\
                                   trigger=${block.trigger}\
                                   >`;

      /** spacerHide component below, with text if this.showSpacers is set to true */
      const spacerAbove = this._getSpacerText(block, narrationBlockId, 'ABOVE');

      /** text components of the narration */
      const h2 = isEmpty(block.h2Text) ? '' : `<h2>${block.h2Text}</h2>`;
      const paragraph = isEmpty(block.paragraphText) ? '' : `<p>${block.paragraphText}</p>`;

      /** link component */
      const href = (isEmpty(block.hRefText) || isEmpty(block.hRef))
        ? ''
        : `<div class="${CSS.linkContainer}">\
                    <a href=${block.hRef} target="_blank">${block.hRefText}</a>\
              </div>`;

      /** spacerHide component below, with text if this.showSpacers is set to true */
      const spacerBelow = this._getSpacerText(block, narrationBlockId, 'BELOW');

      /** append all to the accumulated string */
      return narrationHtmlString.concat(blockContainer, spacerAbove, h2, paragraph, href, spacerBelow, '</div>');
    }, '');
  }

  _getSpacerText(block, narrationBlockId, location) {
    const viewportHeightSpace = location === 'ABOVE'
      ? block.spaceAboveInVh
      : block.spaceBelowInVh;
    if (isEmpty(viewportHeightSpace)) {
      return '';
    }

    const spacerClassName = this.showSpacers ? CSS.spacerShow : CSS.spacerHide;
    const spacerText = this.showSpacers ? `<h3>SPACER: ${viewportHeightSpace} vh</h3>\
                                <h3>${location}: ${narrationBlockId}</h3>` : '';
    return `<div class="${spacerClassName}"\
             style="height:${viewportHeightSpace}vh">\
             ${spacerText}\
          </div>`;
  }
}
