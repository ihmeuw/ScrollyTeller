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
  buildSectionWithNarration,
  calcScrollProgress,
  fetchDataAndProcessResults,
  fetchNarration,
  getNarrationState,
  getStateFromTrigger,
  resizeNarrationBlocks,
  updateCaption,
  updateGraphStyles,
  updateTitle,
  validateScrollyTellerConfig,
} from './utils';
import scrollIntoView from 'scroll-into-view';
import scrollama from 'scrollama';
import CSSNames from './utils/CSSNames';

// How far from the top of the viewport to trigger a step.
const TRIGGER_OFFSET = 0.5;

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

    this._triggersDisabled = false;
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
      const { _, state } = this._triggerState({ sectionConfig: config, index: 0, progress: 0 });

      const containerId = config.cssNames.graphContainerId(config.sectionIdentifier)
      this._updateTitleAndCaption({
        graphContainer: select(`#${containerId}`),
        index: 0,
        narration: config.narration,
        state,
      });

      config.graph = config.buildGraphFunction(this._graphIdForSection(config), config);
    });
  }

  _triggerState({ sectionConfig, index, progress }) {
    const {
      narration,
      convertTriggerToObject = false,
    } = sectionConfig;

    const trigger = (convertTriggerToObject)
      ? getStateFromTrigger(sectionConfig, narration[index].trigger, { index, progress })
      : narration[index].trigger || '';

    const state = (convertTriggerToObject)
      ? getNarrationState(sectionConfig, index, progress)
      : undefined;

    return { trigger, state };
  }

  _updateTitleAndCaption({
    graphContainer, index, narration, state
  }) {
    updateTitle({
      graphContainer,
      index,
      narration,
      state,
    });

    updateCaption({
      graphContainer,
      index,
      narration,
      state,
    });
  }

  _handleOnStepEnter(sectionConfig, { element, index, direction }) {
    if (this._triggersDisabled) {
      return;
    }
    const {
      narration,
      cssNames: names,
      sectionIdentifier,
      onActivateNarrationFunction = noop,
    } = sectionConfig;

    const graphId = names.graphId(sectionIdentifier);
    const graphContainerId = names.graphContainerId(sectionIdentifier);

    const progress = 0;

    const { trigger, state } = this._triggerState({ sectionConfig, index, progress });

    select(element).classed('active', true);
    const graphContainer = select(`#${graphContainerId}`).classed('active', true);
    const graph = select(`#${graphId}`);

    this._updateTitleAndCaption({ graphContainer, index, narration, state });

    updateGraphStyles({
      graph,
      graphContainer,
      state,
    });

    onActivateNarrationFunction({
      index,
      progress,
      element,
      trigger,
      state,
      direction,
      graphId,
      graphContainerId,
      sectionConfig,
    });
  }

  _handleOnStepExit(sectionConfig, { index, element, direction }) {
    if (this._triggersDisabled) {
      return;
    }
    const {
      narration,
      cssNames: names,
      sectionIdentifier,
    } = sectionConfig;

    select(element).classed('active', false);

    if ((index === narration.length - 1 && direction === 'down')
      || (index === 0 && direction === 'up')
    ) {
      const graphContainerId = `#${names.graphContainerId(sectionIdentifier)}`;
      select(graphContainerId).classed('active', false);
    }
  }

  _handleOnStepProgress(sectionConfig, { element, index }) {
    if (this._triggersDisabled) {
      return;
    }
    const {
      cssNames: names,
      sectionIdentifier,
      onScrollFunction = noop,
    } = sectionConfig;

    const graphId = names.graphId(sectionIdentifier);
    const graphContainerId = names.graphContainerId(sectionIdentifier);

    /** recalculate scroll progress due to intersection observer bug in Chrome
     *  https://github.com/russellgoldenberg/scrollama/issues/64
     *  TODO: revert back to using scrollama progress if/when issue is resolved */
    const progress = calcScrollProgress(element, TRIGGER_OFFSET);

    const { trigger, state } = this._triggerState({ sectionConfig, index, progress });

    updateGraphStyles({
      graph: select(`#${graphId}`),
      graphContainer: select(`#${graphContainerId}`),
      state,
    });

    onScrollFunction({
      index,
      progress,
      element,
      trigger,
      state,
      graphId,
      graphContainerId,
      sectionConfig,
    });
  }

  _buildScrollamaContainers() {
    forEach(this.sectionList, (sectionConfig) => {
      const css = get(sectionConfig, ['cssNames', 'css']);

      const {
        cssNames: names,
        sectionIdentifier,
      } = sectionConfig;

      sectionConfig.scroller = scrollama();

      const sectionId = names.sectionId(sectionIdentifier);
      const graphContainerId = names.graphContainerId(sectionIdentifier);

      sectionConfig.scroller
        .setup({
          step: `#${sectionId} .${css.narrationBlock}`,
          container: `#${sectionId}`,
          graphic: `#${graphContainerId}`,
          offset: TRIGGER_OFFSET,
          progress: true,
        })
        .onStepEnter((payload) => { this._handleOnStepEnter(sectionConfig, payload); })
        .onStepExit((payload) => { this._handleOnStepExit(sectionConfig, payload); })
        .onStepProgress((payload) => { this._handleOnStepProgress(sectionConfig, payload); });
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
      const graphContainerId = names.graphContainerId(sectionIdentifier);

      sectionConfig.elementResizeDetector = elementResizeDetectorMaker({
        strategy: 'scroll',
      });

      sectionConfig.elementResizeDetector
        .listenTo(
          select(`#${graphContainerId}`).node(),
          (element) => {
            onResizeFunction({
              graphElement: element,
              graphContainerId,
              graphId,
              sectionConfig,
            });
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

  /**
   * @param {string|number} sectionIdentifier - `sectionIdentifier` of the target section
   * @param {string|number} [narrationId] - optional: `narrationId` of the target narration block (default: first narration block of target section)
   * @param {object} [options] - optional: configuration object passed to `scrollIntoView` (https://github.com/KoryNunn/scroll-into-view)
   * @returns {Promise<void>}
   */
  async scrollTo(sectionIdentifier, narrationId, options) {
    const { appContainerId, cssNames, sectionList } = this;

    // Find the sectionConfig.
    const sectionConfig = sectionList[sectionIdentifier];

    // Find the index of the target narration block to scroll to.
    const index = (
      narrationId !== undefined
        // eslint-disable-next-line eqeqeq
        ? sectionConfig.narration.findIndex((block) => { return block.narrationId == narrationId; })
        : 0
    );
    // get the target narration block element from the section config.
    const targetNarrationBlock = sectionConfig.narration[index];

    // create a selector for the target narration block and select that element
    const targetNarrationSelector = [
      `#${cssNames.sectionId(sectionIdentifier)}`,
      `.${cssNames.narrationList()}`,
      `#${cssNames.narrationId(targetNarrationBlock.narrationId)}`,
    ].join(' ');
    const element = select(targetNarrationSelector).node();

    // Get the page position, so we can determine which direction we've scrolled.
    const startingYOffset = window.pageYOffset;

    // Remove CSS class 'active' on all elements within the ScrollyTeller container element.
    select(`#${appContainerId}`).selectAll('.active').classed('active', false);
    // Set a flag to prevent trigger callbacks from executing during scrolling.
    this._triggersDisabled = true;
    // Scroll the page (asynchronously).
    await new Promise((resolve) => { scrollIntoView(element, options, resolve); });
    // Re-enable trigger callbacks.
    this._triggersDisabled = false;

    // Compute the direction of scrolling.
    const direction = window.pageYOffset < startingYOffset ? 'up' : 'down';
    // Manually activate triggers for the current narration (since they won't have fired on scroll).
    this._handleOnStepEnter(sectionConfig, { element, index, direction });
    this._handleOnStepProgress(sectionConfig, { element, index });
  }
}
