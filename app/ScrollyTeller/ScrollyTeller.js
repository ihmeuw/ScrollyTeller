import {
  get,
  forEach,
  isEmpty,
  isUndefined,
} from 'lodash';
import { select, selectAll } from 'd3';
import {
  validateScrollyTellerConfig,
  fetchNarration,
  fetchDataAndProcessResults,
} from './utils';
import ScrollyTellerNames from './utils/ScrollyTellerNames';
import GraphScroll from './lib/graph-scroll-scrollyteller-v0.1';

export default class ScrollyTeller {
  /**
   * Validates state, converts any narration or data promises in the sectionList to arrays of data
   * or narration, and builds the HTML necessary for a scrolling story
   * @param {object} state object containing configuration
   */
  constructor(state) {
    validateScrollyTellerConfig(state);

    this.appContainerId = state.appContainerId;
    this.sectionList = state.sectionList;

    /** if cssNames is unassigned, use the default ScrollyTellerNames constructor to create a new one */
    if (isUndefined(state.cssNames) || (state.cssNames.constructor.name !== 'ScrollyTellerNames')) {
      this.cssNames = new ScrollyTellerNames();
    } else {
      this.cssNames = state.cssNames;
    }
    this._assignScrollyTellerNamesToSections(this.cssNames);

    /** convert all narration promises to data, and all data promises to processed data,
     * then build all the necessary HTML */
    Promise.resolve(this._buildAsync());
  }

  /** 'PRIVATE' METHODS * */

  async _buildAsync() {
    await fetchNarration(this.sectionList);
    await fetchDataAndProcessResults(this.sectionList);
    /** then build the html we need along with the graph scroll objects for each section */
    this._buildSections();
    this._buildGraphScrollContainers();
    this._buildGraphs();
  }

  _assignScrollyTellerNamesToSections() {
    forEach(this.sectionList, (section) => { section.cssNames = this.cssNames; });
  }

  _graphIdForSection(config) {
    return config.cssNames.graphId(config.sectionIdentifier);
  }
  _buildGraphs() {
    forEach(this.sectionList, (config) => {
      config.graph = config.buildGraphFunction(this._graphIdForSection(config), config.data);
    });
  }

  _buildGraphScrollContainers() {
    forEach(this.sectionList, (config) => {
      const names = config.cssNames;
      const css = get(config, ['cssNames', 'css']);
      config.graphScroll = new GraphScroll()
        .container(select(`#${names.sectionId(config.sectionIdentifier)}`))
        .graph(selectAll(`#${names.graphId(config.sectionIdentifier)}`))
        .sections(selectAll(`#${names.sectionId(config.sectionIdentifier)} > ` +
          `.${css.narrationBlock}`))
        .on('active', (index, activeNarrationBlock) => {
          config.onActivateNarrationFunction(
            index,
            activeNarrationBlock,
            this._graphIdForSection(config),
            config.graph,
            config.data,
          );
        })
        .on('scroll', (index, progress, activeNarrationBlock) => {
          config.onScrollFunction(
            index,
            progress,
            activeNarrationBlock,
            this._graphIdForSection(config),
            config.graph,
            config.data,
          );
        });
    });
  }

  _buildSections() {
    forEach(this.sectionList, this._buildSectionWithNarration.bind(this));
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
