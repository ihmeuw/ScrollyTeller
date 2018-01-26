import {
  get,
  forEach,
  isUndefined,
} from 'lodash';
import { select, selectAll } from 'd3';
import {
  validateScrollyTellerConfig,
  fetchNarration,
  fetchDataAndProcessResults,
  buildSectionWithNarration,
} from './utils/index';
import CSSNames from './utils/CSSNames';
import GraphScroll from './lib/graph-scroll-scrollyteller-v0.1';

export default class ScrollyTeller {
  /**
   * Validates scrollyTellerConfig, converts any narration or data promises in the sectionList to arrays of data
   * or narration, and builds the HTML necessary for a scrolling story
   * @param {object} config object containing configuration
   */
  constructor(config) {
    validateScrollyTellerConfig(config);

    this.appContainerId = config.appContainerId;
    this.sectionList = config.sectionList;

    /** if cssNames is unassigned,
     * use the default CSSNames constructor to create a new one */
    if (isUndefined(config.cssNames) || (config.cssNames.constructor.name !== 'CSSNames')) {
      this.cssNames = new CSSNames();
    } else {
      this.cssNames = config.cssNames;
    }
    this._assignConfigVariablesToSectionConfigs(this.cssNames);
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
        .graph(select(`#${names.graphId(config.sectionIdentifier)}`))
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


  /** 'PUBLIC' METHODS * */

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
}
