/* global document, window */
import {
  get,
  forEach,
  isEmpty,
  isNil,
  isNumber,
  isString,
  isUndefined,
  keyBy,
  noop,
} from 'lodash-es';
import isTouchDevice from './utils/isTouchDevice';
import elementResizeDetectorMaker from 'element-resize-detector';
import { select } from 'd3-selection';
import * as utils from './utils';
import scrollIntoView from 'scroll-into-view';
import 'intersection-observer';
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
    utils.validateScrollyTellerConfig(config);

    this.appContainerId = config.appContainerId;
    this.sectionList = keyBy(config.sectionList, 'sectionIdentifier');
    this.onNarrationChangedFunction = config.onNarrationChangedFunction || noop;
    /** multiply minHeightVh, marginTopVh, and marginBottomVh by this factor on mobile to
     * pad scrolling */
    this.mobileScrollHeightMultiplier = config.mobileScrollHeightMultiplier || 1;

    /** state to handle advancing to previous/next narration and time tracking */
    this.sectionNamesArray = config.sectionList.map(({ sectionIdentifier }) => (sectionIdentifier));
    this.currentSectionId = null;
    this.currentNarrationIndex = null;

    /** store the current trigger state */
    this.triggerState = {};
    this.trigger = '';

    /** state to handle google analytics tracking */
    this.sendSectionAnalytics = config.sendSectionAnalytics || false;
    this.sendNarrationAnalytics = config.sendNarrationAnalytics || false;
    this.sendScrollToAnalytics = config.sendScrollToAnalytics || false;
    this.maxTimeInSeconds = config.maxTimeInSeconds || Infinity;
    this.timeEnteredCurrentSection = null;
    this.timeEnteredCurrentNarration = null;
    this.pageLoadStartTime = new Date();

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
    forEach(this.sectionList, (section, sectionIdentifier) => {
      section.appContainerId = this.appContainerId;
      section.cssNames = this.cssNames;
      section.sectionIndex = this._sectionIndexFromSectionIdentifier(sectionIdentifier);
    });
  }

  _graphIdForSection(config) {
    return config.cssNames.graphId(config.sectionIdentifier);
  }

  _buildGraphs() {
    forEach(this.sectionList, (config) => {
      const { state } = this._triggerState({ sectionConfig: config, index: 0, progress: 0 });
      this.triggerState = state;

      const containerId = config.cssNames.graphContainerId(config.sectionIdentifier)
      this._updateTitleAndCaption({
        graphContainer: select(`#${containerId}`),
        index: 0,
        names: config.cssNames,
        narration: config.narration,
        state,
      });

      config.graph = config.buildGraphFunction(this._graphIdForSection(config), config);
    });
  }

  _triggerState({ sectionConfig, index, progress }) {
    if (isNil(sectionConfig) || isNil(index)) {
      return { trigger: '', state: {} };
    }
    const {
      narration,
      convertTriggerToObject = true,
    } = sectionConfig;

    const trigger = (convertTriggerToObject)
      ? utils.getStateFromTrigger(narration[index].trigger, { index, progress })
      : narration[index].trigger || '';

    const state = (convertTriggerToObject)
      ? utils.getNarrationState(sectionConfig, index, progress)
      : {};

    return { trigger, state };
  }

  _updateTitleAndCaption({
    graphContainer, index, names, narration, state
  }) {
    utils.updateTitle({
      graphContainer,
      index,
      names,
      narration,
      state,
    });

    utils.updateCaption({
      graphContainer,
      index,
      names,
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

    // if google analytics object exists
    if (window.ga) {
      // if user requests SECTION tracking and section has changed
      if (this.sendSectionAnalytics && sectionIdentifier !== this.currentSectionId) {
        // send enter section tracking events
        utils.sendEnteredSectionAnalytics({
          enteringSectionId: sectionIdentifier,
          enteringSectionIndex: this._sectionIndexFromSectionIdentifier(sectionIdentifier),
          pageLoadStartTime: this.pageLoadStartTime,
          maxTimeInSeconds: this.maxTimeInSeconds,
        });

        // if a previous section is set, send analytics on the section that was exited from
        if (!isNil(this.currentSectionId)) {
          utils.sendExitedSectionAnalytics({
            exitedNarrationIndex: this.currentNarrationIndex,
            exitedSectionId: this.currentSectionId,
            exitedSectionIndex: this._sectionIndexFromSectionIdentifier(this.currentSectionId),
            maxTimeInSeconds: this.maxTimeInSeconds,
            timeEntered: this.timeEnteredCurrentSection || new Date(),
          });
        }

        this.timeEnteredCurrentSection = new Date();
      }

      // if user requests NARRATION tracking and section or narration index has changed
      if (
        this.sendNarrationAnalytics
        && (sectionIdentifier !== this.currentSectionId || index !== this.currentNarrationIndex)
      ) {
        // there should always be an entered section identifier: send enter section tracking events
        utils.sendEnteredNarrationAnalytics({
          enteringNarrationIndex: index,
          enteringSectionId: sectionIdentifier,
          enteringSectionIndex: this._sectionIndexFromSectionIdentifier(sectionIdentifier),
          pageLoadStartTime: this.pageLoadStartTime,
          maxTimeInSeconds: this.maxTimeInSeconds,
        });

        // if a previous section is set, send analytics on the section that was exited from
        if (!isNil(this.currentNarrationIndex)) {
          utils.sendExitedNarrationAnalytics({
            exitingNarrationIndex: this.currentNarrationIndex,
            exitedSectionId: this.currentSectionId,
            exitedSectionIndex: this._sectionIndexFromSectionIdentifier(this.currentSectionId),
            maxTimeInSeconds: this.maxTimeInSeconds,
            timeEntered: this.timeEnteredCurrentNarration || new Date(),
          });
        }
        this.timeEnteredCurrentNarration = new Date();
      }
    }

    this.currentSectionId = sectionIdentifier;
    this.currentNarrationIndex = index;
    this.onNarrationChangedFunction({
      sectionIdentifier: this.currentSectionId,
      narrationIndex: this.currentNarrationIndex,
      narrationId: get(sectionConfig, ['narration', index, 'narrationId']),
      narrationClass: get(sectionConfig, ['narration', index, 'narrationClass']),
    });

    const graphId = names.graphId(sectionIdentifier);
    const graphContainerId = names.graphContainerId(sectionIdentifier);

    const progress = 0;

    const { trigger, state } = this._triggerState({ sectionConfig, index, progress });
    this.triggerState = state;

    select(element).classed('active', true);
    const graphContainer = select(`#${graphContainerId}`).classed('active', true);
    const graph = select(`#${graphId}`);

    this._updateTitleAndCaption({
      graphContainer,
      index,
      names,
      narration,
      state,
    });

    utils.updateGraphStyles({
      graph,
      graphContainer,
      names,
      sectionIdentifier,
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

      /** check for scrolling out of the story and set current id and section to null */
      const sectionIndex = this._sectionIndexFromSectionIdentifier(sectionIdentifier);
      if ((sectionIndex === 0 && direction === 'up')
        || (sectionIndex === this.sectionNamesArray.length - 1 && direction === 'down')) {
        this.currentNarrationIndex = null;
        this.currentSectionId = null;
        this.onNarrationChangedFunction({
          sectionIdentifier: null,
          narrationIndex: null,
          narrationId: null,
          narrationClass: null,
        });
      }
    }
  }

  _handleOnStepProgress(sectionConfig, { element, scrollProgressElement, index }) {
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
    const progress = utils.calcScrollProgress(scrollProgressElement || element, TRIGGER_OFFSET);

    const { trigger, state } = this._triggerState({ sectionConfig, index, progress });
    this.triggerState = state;

    utils.updateGraphStyles({
      graph: select(`#${graphId}`),
      graphContainer: select(`#${graphContainerId}`),
      names,
      sectionIdentifier,
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

      sectionConfig.scroller
        .setup({
          step: `#${sectionId} .${css.narrationBlock}`,
          offset: TRIGGER_OFFSET,
          progress: true,
        })
        .onStepEnter((payload) => { this._handleOnStepEnter(sectionConfig, payload); })
        .onStepExit((payload) => { this._handleOnStepExit(sectionConfig, payload); })
        .onStepProgress((payload) => { this._handleOnStepProgress(sectionConfig, payload); });
    });
  }

  _buildKeyboardListeners() {
    // prevent default scroll using spacebar and arrow keys
    document.addEventListener('keydown', (event) => {
      const key = event.key || event.keyCode;

      if (event.target === document.body) {
        switch (key) {
          case ' ':
          case 'ArrowDown':
          case 'ArrowRight':
          case 'ArrowUp':
          case 'ArrowLeft':
            event.preventDefault();
            break;
          default:
        }
      }
    });

    document.addEventListener('keyup', (event) => {
      if (event.defaultPrevented) {
        return;
      }

      if (event.target === document.body) {
        const key = event.key || event.keyCode;

        switch (key) {
          case ' ':
          case 'ArrowDown':
          case 'ArrowRight':
            this.scrollToNextNarration();
            break;
          case 'ArrowUp':
          case 'ArrowLeft':
            this.scrollToPreviousNarration();
            break;
          default:
        }
      }
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
          select(`#${graphId}`).node(),
          (element) => {
            onResizeFunction({
              graphElement: element,
              graphContainerId,
              graphId,
              sectionConfig,
              state: this.triggerState,
              trigger: this.triggerState,
            });
          },
        );
    });
  }

  _buildSections() {
    select(`#${this.appContainerId}`)
      .append('div')
      .attr('class', this.cssNames.scrollContainer());

    const mobileScrollHeightMultiplier = isTouchDevice()
      ? this.mobileScrollHeightMultiplier
      : 1;
    forEach(
      this.sectionList,
      config => (utils.buildSectionWithNarration(config, mobileScrollHeightMultiplier)),
    );
  }

  _sectionIndexFromSectionIdentifier(sectionIdentifier) {
    return this.sectionNamesArray.findIndex(
      (id) => { return id === sectionIdentifier; },
    );
  }

  /** 'PUBLIC' METHODS * */

  /**
   * Converts all narration promises to data, and all data promises to processed data,
   * then build all the necessary HTML
   * @returns {Promise<void>} that is resolved when everything is built
   */
  async render() {
    await utils.fetchNarration(this.sectionList);
    await utils.fetchDataAndProcessResults(this.sectionList);
    /** then build the html we need along with the graph scroll objects for each section */
    this._buildSections();
    this._buildScrollamaContainers();
    this._buildGraphs();
    this._buildResizeListeners();
    this._buildKeyboardListeners();

    if (isTouchDevice()) {
      window.addEventListener('orientationchange', () => {
        const afterOrientationChange = () => {
          this._handleResizeEvent();
          window.removeEventListener('resize', afterOrientationChange);
        };
        window.addEventListener('resize', afterOrientationChange);
      });
    } else {
      window.addEventListener('resize', () => {
        this._handleResizeEvent();
      });
    }
  }

  _handleResizeEvent() {
    const mobileScrollHeightMultiplier = isTouchDevice()
      ? this.mobileScrollHeightMultiplier
      : 1;
    forEach(this.sectionList, (config) => {
      utils.resizeNarrationBlocks(config, mobileScrollHeightMultiplier);
      config.scroller.resize();
    });
  }

  /**
   * @param {string|number} sectionIdentifier - `sectionIdentifier` of the target section
   * @param {string|number|undefined} [narrationIdStringOrNumericIndex]
   *  - optional: if undefined, defaults to the first narration block of target section
   *              if number, argument is treated as the index of the narration block to scroll to
   *              if string, argument is treated as the `narrationId` of the target narration block
   * @param {object} [options] - optional: configuration object passed to `scrollIntoView`
   *              (https://github.com/KoryNunn/scroll-into-view)
   * @returns {Promise<void>} - returns empty promise
   */
  async scrollTo(sectionIdentifier, narrationIdStringOrNumericIndex, options) {
    if (isNil(sectionIdentifier) || isNil(narrationIdStringOrNumericIndex)) {
      return;
    }
    const {
      appContainerId,
      cssNames,
      currentNarrationIndex,
      currentSectionId,
      sectionList,
    } = this;

    // Find the sectionConfig.
    const sectionConfig = get(sectionList, sectionIdentifier);
    if (isNil(sectionConfig)) {
      return;
    }

    // Find the index of the target narration block to scroll to.
    let index = 0; // undefined case, treat as zero index
    // string case: treat as narration id
    if (isString(narrationIdStringOrNumericIndex)) {
      index = sectionConfig.narration.findIndex(
        // eslint-disable-next-line eqeqeq
        (block) => { return block.narrationId === narrationIdStringOrNumericIndex; },
      ) || 0;
    } else if ( // numeric case: treat as index
      isNumber(narrationIdStringOrNumericIndex)
      && narrationIdStringOrNumericIndex > -1
      && narrationIdStringOrNumericIndex < sectionConfig.narration.length
    ) {
      index = narrationIdStringOrNumericIndex;
    }

    // if user requests tracking and google analytics object exists
    if (this.sendScrollToAnalytics && window.ga) {
      // send props to handle analytics tracking of the previous section that we just left
      utils.sendScrollToAnalytics({
        enteringSectionId: sectionIdentifier,
        enteringSectionIndex: this._sectionIndexFromSectionIdentifier(sectionIdentifier),
        enteringNarrationIndex: index,
        pageLoadStartTime: this.pageLoadStartTime,
        maxTimeInSeconds: this.maxTimeInSeconds,
        exitedSectionId: currentSectionId,
        exitedSectionIndex: this._sectionIndexFromSectionIdentifier(currentSectionId),
        exitedNarrationIndex: currentNarrationIndex,
      });
    }

    // create a selector for the target narration block and select that element
    const targetNarrationSelector = [
      `#${cssNames.sectionId(sectionIdentifier)}`,
      `.${cssNames.narrationList()}`,
      `div.${cssNames.narrationClass()}:nth-of-type(${index + 1})`,
    ].join(' ');
    const narrationBlockSelection = select(targetNarrationSelector); // d3 selection
    const narrationBlockElement = narrationBlockSelection.node(); // node

    // select the content element within the desired narration block, which we'll scroll directly to
    const scrollToContentElement = narrationBlockSelection.select(
      `div.${cssNames.narrationContentClass()}`,
    ).node();

    // can't find element, return
    if (isNil(scrollToContentElement)) {
      return;
    }

    // Get the page position, so we can determine which direction we've scrolled.
    const startingYOffset = window.pageYOffset;

    // Remove CSS class 'active' on all elements within the ScrollyTeller container element.
    select(`#${appContainerId}`).selectAll('.active').classed('active', false);
    // Set a flag to prevent trigger callbacks from executing during scrolling.
    this._triggersDisabled = true;
    // Scroll the page (asynchronously).
    await new Promise((resolve) => {
      scrollIntoView(scrollToContentElement, options, resolve);
    });
    // Re-enable trigger callbacks.
    this._triggersDisabled = false;

    // Compute the direction of scrolling.
    const direction = window.pageYOffset < startingYOffset ? 'up' : 'down';
    // Manually activate triggers for the current narration (since they won't have fired on scroll).
    this._handleOnStepEnter(sectionConfig, { element: narrationBlockElement, index, direction });
    this._handleOnStepProgress(
      sectionConfig,
      {
        element: narrationBlockElement,
        index,
        scrollProgressElement: scrollToContentElement,
      },
    );
  }

  /**
   * Scrolls "up" to the previous narration block in the story
   * @return {Promise<void>} - returns empty promise
   */
  async scrollToPreviousNarration() {
    const {
      sectionList,
      sectionNamesArray,
    } = this;
    let narrationContentEmtpy = false;
    let destinationSection = this.currentSectionId;
    let destinationNarration = this.currentNarrationIndex;

    while (!narrationContentEmtpy) {
      const sectionIndex = this._sectionIndexFromSectionIdentifier(destinationSection);

      destinationSection = sectionIndex === -1 ? sectionNamesArray[0] : destinationSection;
      destinationNarration = destinationNarration === null ? 1 : destinationNarration;

      const isFirstSection = sectionIndex === 0;
      const isNarrationInPreviousSection = destinationNarration - 1 < 0;

      if (isNarrationInPreviousSection && !isFirstSection) {
        destinationSection = sectionNamesArray[sectionIndex - 1];
        const currentNarration = get(sectionList, [destinationSection, 'narration']);
        destinationNarration = currentNarration ? currentNarration.length - 1 : 0;
      } else if (!isNarrationInPreviousSection) {
        destinationNarration -= 1;
      } else {
        return;
      }

      const content = get(
        sectionList,
        [destinationSection, 'narration', destinationNarration],
      );

      narrationContentEmtpy = !(
        isEmpty(content.hRefText)
        && isEmpty(content.h2Text)
        && isEmpty(content.paragraphText)
      );
    }

    await this.scrollTo(
      destinationSection,
      destinationNarration,
      { align: { top: 0.5 } },
    );
  }

  /**
   * Scrolls "down" to the next narration block in the story
   * @return {Promise<void>} - returns empty promise
   */
  async scrollToNextNarration() {
    const {
      sectionList,
      sectionNamesArray,
    } = this;
    let narrationContentEmtpy = false;
    let destinationSection = this.currentSectionId;
    let destinationNarration = this.currentNarrationIndex;

    while (!narrationContentEmtpy) {
      const sectionIndex = this._sectionIndexFromSectionIdentifier(destinationSection);

      destinationSection = sectionIndex === -1 ? sectionNamesArray[0] : destinationSection;
      destinationNarration = destinationNarration === null ? -1 : destinationNarration;

      const isLastSection = sectionIndex === sectionNamesArray.length - 1;
      const currentSectionNarrationCount = get(
        sectionList,
        [destinationSection, 'narration', 'length'],
        0,
      );
      const isNarrationInNextSection = destinationNarration + 1 === currentSectionNarrationCount;

      if (isNarrationInNextSection && !isLastSection) {
        destinationSection = sectionNamesArray[sectionIndex + 1];
        destinationNarration = 0;
      } else if (!isNarrationInNextSection) {
        destinationNarration += 1;
      } else {
        return;
      }

      const content = get(
        sectionList,
        [destinationSection, 'narration', destinationNarration],
      );

      narrationContentEmtpy = !(
        isEmpty(content.hRefText)
        && isEmpty(content.h2Text)
        && isEmpty(content.paragraphText)
      );
    }

    await this.scrollTo(
      destinationSection,
      destinationNarration,
      { align: { top: 0.5 } },
    );
  }
}
