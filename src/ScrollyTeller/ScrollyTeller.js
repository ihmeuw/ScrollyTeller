/* global window */
import {
  get,
  forEach,
  isUndefined,
  noop,
} from 'lodash';
import elementResizeDetectorMaker from 'element-resize-detector';
import { select } from 'd3';
import {
  validateScrollyTellerConfig,
  fetchNarration,
  fetchDataAndProcessResults,
  buildSectionWithNarration,
  resizeNarrationBlocks,
  calcScrollProgress,
} from './utils';
import scrollama from 'scrollama';
import CSSNames from './utils/CSSNames';

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

  _buildScrollamaContainers() {
    forEach(this.sectionList, (sectionConfig) => {
      const css = get(sectionConfig, ['cssNames', 'css']);

      const {
        narration,
        cssNames: names,
        sectionIdentifier,
        onScrollFunction = noop,
        onActivateNarrationFunction = noop,
      } = sectionConfig;

      sectionConfig.scroller = scrollama();

      const sectionId = names.sectionId(sectionIdentifier);
      const graphId = names.graphId(sectionIdentifier);

      const offset = 0.5;

      sectionConfig.scroller
        .setup({
          step: `#${sectionId} .${css.narrationBlock}`,
          container: `#${sectionId}`,
          graphic: `#${graphId}`,
          offset,
          progress: true,
        })
        .onStepEnter(({ element, index, direction }) => {
          const { trigger = '' } = narration[index];
          const progress = 0;

          select(element).classed('active', true);
          select(`#${graphId}`).classed('active', true);

          onActivateNarrationFunction({ index, progress, element, trigger, direction, graphId, sectionConfig });
        })
        .onStepExit(({ index, element, direction }) => {
          select(element).classed('active', false);

          if ((index === narration.length - 1 && direction === 'down')
            || (index === 0 && direction === 'up')
          ) {
            select(`#${graphId}`).classed('active', false);
          }
        })
        .onStepProgress(({ element, index, direction }) => {
          const progress = calcScrollProgress(element, offset);
          const { trigger = '' } = narration[index];

          onScrollFunction({ index, progress, element, trigger, direction, graphId, sectionConfig });
        });
    });
  }

  _buildResizeListeners() {
    forEach(this.sectionList, (sectionConfig) => {
      const {
        cssNames: names,
        onResizeFunction = noop,
        sectionIdentifier,
      } = sectionConfig;

      const graphId = names.graphId(sectionIdentifier);

      sectionConfig.elementResizeDetector = elementResizeDetectorMaker({
        strategy: 'scroll',
      });

      sectionConfig.elementResizeDetector
        .listenTo(
          select(`#${graphId}`).node(),
          (element) => {
            onResizeFunction({ graphElement: element, graphId, sectionConfig });
          },
        );
    });
  }

  _buildSections() {
    select(`#${this.appContainerId}`)
      .append('div')
      .attr('class', this.cssNames.scrollContainer());

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
    this._buildScrollamaContainers();
    this._buildGraphs();
    this._buildResizeListeners();

    window.addEventListener('resize', () => {
      forEach(this.sectionList, (config) => {
        resizeNarrationBlocks(config);
        config.scroller.resize();
      });
    });
  }
}
