import {
  get,
  forEach,
  isEmpty,
} from 'lodash';
import { select, selectAll } from 'd3';
import graphScroll from './lib/graph-scroll-scrollyteller-v0.0';

export default class ScrollyTeller {
  constructor(state) {
    /** new props */
    this.cssNames = state.cssNames;
    this.appContainerId = state.appContainerId;
    this.sectionList = state.sectionList;

    /** _buildAsync() takes the narration.csv and builds the following in the following order:
     * In parallel:
     * - Calls this.fetchData() to parse any data necessary
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

  /** 'PRIVATE' METHODS * */

  _buildAsync() {
    Promise.all([
      this._buildSections(),
    ])
      .then(() => {
        this._buildGraphScrollContainers();
      })
      .then(() => {
        this._buildGraphs();
      });
  }

  _buildGraphs() {
    forEach(this.sectionList, (config) => {
      config.buildGraphFunction.apply(config.functionBindingContext);
    });
  }

  _buildGraphScrollContainers() {
    forEach(this.sectionList, (config) => {
      const names = config.cssNames;
      const css = get(config, ['cssNames', 'css']);
      config.graphScroll = graphScroll()
        .container(select(`#${names.sectionId(config.sectionIdentifier)}`))
        .graph(selectAll(`#${names.graphId(config.sectionIdentifier)}`))
        .sections(selectAll(`#${names.sectionId(config.sectionIdentifier)} > .${css.narrationBlock}`))
        .on('active', config.onActivateNarrationFunction.bind(config.functionBindingContext))
        .on('scroll', config.onScrollFunction.bind(config.functionBindingContext));
    });
  }

  async _buildSections() {
    await forEach(this.sectionList, this._buildSectionWithNarration.bind(this));
  }

  _buildSectionWithNarration(config) {
    select(`#${config.appContainerId}`)
      .append('div')
      .attr('class', this.cssNames.sectionClass())
      .attr('id', this.cssNames.sectionId(config.sectionIdentifier));

    /** select the appropriate section by id, and append a properly formatted html string
     * containing the contents of each narration block (row in the narration.csv file) */
    const names = config.cssNames;
    select(`#${names.sectionId(config.sectionIdentifier)}`)
      .html(this._getNarrationHtmlString(config.narration, config));

    /** insert the graph as the first div before narration divs */
    select(`#${names.sectionId(config.sectionIdentifier)}`)
      .insert('div', ':first-child')
      .attr('class', names.graphClass(config.sectionIdentifier, config.useDefaultGraphCSS))
      .attr('id', names.graphId(config.sectionIdentifier));
  }

  _getNarrationHtmlString(narrationBlocksArray, config) {
    /** build the narration as an html string */
    const names = config.cssNames;
    const css = get(config, ['cssNames', 'css']);
    return narrationBlocksArray.reduce((narrationHtmlString, block) => {
      /** outer sectionContainer for each part of the narration + spacerHide */
      const narrationBlockId = `${names.narrationId(block.narrationId)}`;
      const blockContainer = `<div class=${css.narrationBlock}\
                                   id=${narrationBlockId}\
                                   trigger=${block.trigger}\
                                   >`;

      /** spacerHide component below, with text if this.showSpacers is set to true */
      const spacerAbove = this._getSpacerText(config, block, narrationBlockId, 'ABOVE');

      /** text components of the narration */
      const h2 = isEmpty(block.h2Text) ? '' : `<h2>${block.h2Text}</h2>`;
      const paragraph = isEmpty(block.paragraphText) ? '' : `<p>${block.paragraphText}</p>`;

      /** link component */
      const href = (isEmpty(block.hRefText) || isEmpty(block.hRef))
        ? ''
        : `<div class="${css.linkContainer}">\
                    <a href=${block.hRef} target="_blank">${block.hRefText}</a>\
              </div>`;

      /** spacerHide component below, with text if this.showSpacers is set to true */
      const spacerBelow = this._getSpacerText(config, block, narrationBlockId, 'BELOW');

      /** append all to the accumulated string */
      return narrationHtmlString.concat(
        blockContainer,
        spacerAbove,
        h2,
        paragraph,
        href,
        spacerBelow,
        '</div>',
      );
    }, '');
  }

  _getSpacerText(config, block, narrationBlockId, location) {
    const viewportHeightSpace = location === 'ABOVE'
      ? block.spaceAboveInVh
      : block.spaceBelowInVh;
    if (isEmpty(viewportHeightSpace)) {
      return '';
    }

    const css = get(config, ['cssNames', 'css']);
    const spacerClassName = config.showSpacers ? css.spacerShow : css.spacerHide;
    const spacerText = config.showSpacers ? `<h3>SPACER: ${viewportHeightSpace} vh</h3>\
                                <h3>${location}: ${narrationBlockId}</h3>` : '';
    return `<div class="${spacerClassName}"\
             style="height:${viewportHeightSpace}vh">\
             ${spacerText}\
          </div>`;
  }
}
