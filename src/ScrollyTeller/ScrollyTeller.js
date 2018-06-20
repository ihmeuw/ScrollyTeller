/* global window, document */
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
  getNarrationState,
  getStateFromTrigger,
  fetchNarration,
  fetchDataAndProcessResults,
  buildSectionWithNarration,
  resizeNarrationBlocks,
  calcScrollProgress,
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
      config.graph = config.buildGraphFunction(this._graphIdForSection(config), config);
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
      convertTriggerToObject = false,
    } = sectionConfig;

    const graphId = names.graphId(sectionIdentifier);

    const progress = 0;

    const trigger = (convertTriggerToObject)
      ? getStateFromTrigger(sectionConfig, narration[index].trigger, { index, progress })
      : narration[index].trigger || '';

    const state = (convertTriggerToObject)
      ? getNarrationState(sectionConfig, index, progress)
      : undefined;

    select(element).classed('active', true);
    select(`#${graphId}`).classed('active', true);

    onActivateNarrationFunction({
      index,
      progress,
      element,
      trigger,
      state,
      direction,
      graphId,
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

    const graphId = names.graphId(sectionIdentifier);

    select(element).classed('active', false);

    if ((index === narration.length - 1 && direction === 'down')
      || (index === 0 && direction === 'up')
    ) {
      select(`#${graphId}`).classed('active', false);
    }
  }

  _handleOnStepProgress(sectionConfig, { element, index }) {
    if (this._triggersDisabled) {
      return;
    }
    const {
      narration,
      cssNames: names,
      sectionIdentifier,
      onScrollFunction = noop,
      convertTriggerToObject = false,
    } = sectionConfig;

    const graphId = names.graphId(sectionIdentifier);

    /** recalculate scroll progress due to intersection observer bug in Chrome
     *  https://github.com/russellgoldenberg/scrollama/issues/64
     *  TODO: revert back to using scrollama progress if/when issue is resolved */
    const progress = calcScrollProgress(element, TRIGGER_OFFSET);

    const trigger = (convertTriggerToObject)
      ? getStateFromTrigger(sectionConfig, narration[index].trigger, { index, progress })
      : narration[index].trigger || '';

    const state = (convertTriggerToObject)
      ? getNarrationState(sectionConfig, index, progress)
      : undefined;

    onScrollFunction({
      index,
      progress,
      element,
      trigger,
      state,
      graphId,
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
      const graphId = names.graphId(sectionIdentifier);

      sectionConfig.scroller
        .setup({
          step: `#${sectionId} .${css.narrationBlock}`,
          container: `#${sectionId}`,
          graphic: `#${graphId}`,
          offset: TRIGGER_OFFSET,
          progress: true,
        })
        .onStepEnter(payload => this._handleOnStepEnter(sectionConfig, payload))
        .onStepExit(payload => this._handleOnStepExit(sectionConfig, payload))
        .onStepProgress(payload => this._handleOnStepProgress(sectionConfig, payload));
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

  async scrollTo(sectionIdentifier, narrationId, options) {
    // Find the DOM element to which we'll scroll.
    const selectorString = (
      narrationId !== undefined
      ? this.cssNames.narrationId(narrationId)
      : this.cssNames.sectionId(sectionIdentifier)
    );
    const element = document.getElementById(selectorString);
    // Find the sectionConfig.
    const sectionConfig = this.sectionList[sectionIdentifier];
    // Get the page position, so we can determine which direction we've scrolled.
    const previousYOffset = window.pageYOffset;

    // Remove CSS class 'active' on all elements within the ScrollyTeller container element.
    select(this.appContainerId).selectAll('.active').classed('active', false);
    // Set a flag to prevent trigger callbacks from executing during scrolling.
    this._triggersDisabled = true;
    // Scroll the page (asynchronously).
    await new Promise(resolve => scrollIntoView(element, options, resolve));
    // Re-enable trigger callbacks.
    this._triggersDisabled = false;

    // Find the index of the current narration block.
    const index = (
      narrationId !== undefined
      ? sectionConfig.narration.findIndex(block => block.narrationId == narrationId)
      : 0
    );
    // Compute the direction of scrolling.
    const direction = window.pageYOffset < previousYOffset ? 'up' : 'down';
    // Manually activate triggers for the current narration (since they won't have fired on scroll).
    this._handleOnStepEnter(sectionConfig, { element, index, direction });
    this._handleOnStepProgress(sectionConfig, { element, index });
  }
}
