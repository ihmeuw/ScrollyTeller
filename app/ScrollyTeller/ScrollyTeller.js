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
  buildSectionWithNarration,
} from './utils';
import ScrollyTellerNames from './utils/ScrollyTellerNames';
import GraphScroll from './lib/graph-scroll-scrollyteller-v0.1';

export default class ScrollyTeller {
  /**
   * Validates scrollyTellerConfig, converts any narration or data promises in the sectionList to arrays of data
   * or narration, and builds the HTML necessary for a scrolling story
   * @param {object} state object containing configuration
   */
  constructor(state) {
    validateScrollyTellerConfig(state);

    this.appContainerId = state.appContainerId;
    this.sectionList = state.sectionList;

    /** if cssNames is unassigned,
     * use the default ScrollyTellerNames constructor to create a new one */
    if (isUndefined(state.cssNames) || (state.cssNames.constructor.name !== 'ScrollyTellerNames')) {
      this.cssNames = new ScrollyTellerNames();
    } else {
      this.cssNames = state.cssNames;
    }
    this._assignConfigVariablesToSectionConfigs(this.cssNames);
  }

  /**
   * Converts all narration promises to data, and all data promises to processed data,
   * then build all the necessary HTML
   * @returns {Promise<void>} that is resolved when everything is built
   */
  async render() {
    await fetchNarration(this.sectionList);
    await fetchDataAndProcessResults(this.sectionList);
    /** then build the html we need along with the graph scroll objects for each section */
    this._buildSections();
    this._buildGraphScrollContainers();
    this._buildGraphs();
  }

  /** 'PRIVATE' METHODS * */

  _assignConfigVariablesToSectionConfigs() {
    forEach(this.sectionList, (section) => {
      section.showSpacers = isUndefined(section.showSpacers)
        ? true
        : section.showSpacers;
      section.useDefaultGraphCSS = isUndefined(section.useDefaultGraphCSS)
        ? true
        : section.useDefaultGraphCSS;
      section.appContainerId = this.appContainerId;
      section.cssNames = this.cssNames;
    });
  }

  _graphIdForSection(config) {
    return config.cssNames.graphId(config.sectionIdentifier);
  }

  _buildGraphs() {
    forEach(this.sectionList, (config) => {
      config.graph = config.buildGraphFunction(this._graphIdForSection(config), config);
    });
  }

  _buildGraphScrollContainers() {
    forEach(this.sectionList, (config) => {
      const names = config.cssNames;
      const css = get(config, ['cssNames', 'css']);
      config.graphScroll = new GraphScroll({ sectionTopBuffer: 100 })
        .container(select(`#${names.sectionId(config.sectionIdentifier)}`))
        .graph(selectAll(`#${names.graphId(config.sectionIdentifier)}`))
        .sections(selectAll(`#${names.sectionId(config.sectionIdentifier)} > ` +
          `.${css.narrationBlock}`))
        .on('active', (index, progress, activeNarrationBlock) => {
          config.onActivateNarrationFunction(
            index,
            progress,
            activeNarrationBlock,
            this._graphIdForSection(config),
            config,
          );
        })
        .on('scroll', (index, progress, activeNarrationBlock) => {
          config.onScrollFunction(
            index,
            progress,
            activeNarrationBlock,
            this._graphIdForSection(config),
            config,
          );
        });
    });
  }

  _buildSections() {
    forEach(this.sectionList, buildSectionWithNarration);
  }
}
