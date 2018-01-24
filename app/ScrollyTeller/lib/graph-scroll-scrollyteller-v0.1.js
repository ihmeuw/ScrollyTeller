import {
  select,
  dispatch,
  timer,
  event,
  interpolateNumber,
} from 'd3';

export default class GraphScroll {
  constructor({
    sectionActiveClassName = 'graph-scroll-active',
    graphActiveClassName = 'graph-scroll-fixed',
    graphInactiveClassName = 'graph-scroll-below',
    sectionTopBuffer = 200,
  } = {}) {
    this.sectionActiveClassName = sectionActiveClassName;
    this.graphActiveClassName = graphActiveClassName;
    this.graphInactiveClassName = graphInactiveClassName;
    this.sectionTopBuffer = sectionTopBuffer;
    this.dispatchInstance = dispatch('scroll', 'active');
    this.sectionSelection = select('null');
    this.activeSectionIndex = NaN;
    this.sectionPos = [];
    this.numberOfSections = 0;
    this.graphContainer = select('null');
    this.isFixed = null;
    this.isBelow = null;
    this.parentContainer = select('body');
    this.containerStart = 0;
    this.belowStart = null;
    this.eventIdentifier = Math.random();
    this._reposition = this._reposition.bind(this);
    this._resize = this._resize.bind(this);
  }

  _getSectionNodeByIndex(index) {
    return this.sectionSelection.nodes()[index] || null;
  }

  _reposition() {
    const {
      belowStart,
      sectionTopBuffer,
      containerStart,
      dispatchInstance,
      graphContainer,
      graphActiveClassName,
      graphInactiveClassName,
      numberOfSections,
      sectionPos,
      sectionSelection,
      sectionActiveClassName,
    } = this;
    let newActiveSectionIndex = 0;
    sectionPos.forEach((sectionTopPosition, sectionIndex) => {
      if (sectionTopPosition < pageYOffset - containerStart + sectionTopBuffer) {
        newActiveSectionIndex = sectionIndex;
      }
    });
    newActiveSectionIndex = Math.min(numberOfSections - 1, newActiveSectionIndex);
    const isNewActiveSection = this.activeSectionIndex !== newActiveSectionIndex;
    if (isNewActiveSection) {
      sectionSelection.classed(
        sectionActiveClassName,
        (_, i) => { return i === newActiveSectionIndex; },
      );
      this.activeSectionIndex = newActiveSectionIndex;
    }

    const isBelow1 = pageYOffset > belowStart;
    if (this.isBelow !== isBelow1) {
      this.isBelow = isBelow1;
      graphContainer.classed(graphInactiveClassName, this.isBelow);
    }
    const isFixed1 = !this.isBelow && pageYOffset > containerStart;
    if (this.isFixed !== isFixed1) {
      this.isFixed = isFixed1;
      graphContainer.classed(graphActiveClassName, this.isFixed);
    }

    const pos = pageYOffset - 10 - containerStart;
    const prevTop = sectionPos[this.activeSectionIndex];
    const nextTop =
      (
        this.activeSectionIndex + 1 < sectionPos.length
          ? sectionPos[this.activeSectionIndex + 1]
          : (belowStart - containerStart)
      ) - sectionTopBuffer;
    const progress = (pos - prevTop) / (nextTop - prevTop);
    if (progress >= 0 && progress <= 1) {
      dispatchInstance.apply(
        'scroll',
        this,
        [this.activeSectionIndex, progress, this._getSectionNodeByIndex(this.activeSectionIndex)],
      );
    }
    if (isNewActiveSection) {
      dispatchInstance.apply(
        'active',
        this,
        [newActiveSectionIndex, progress, this._getSectionNodeByIndex(newActiveSectionIndex)],
      );
    }
  }

  _resize() {
    const {
      graphContainer,
      parentContainer,
      sectionSelection,
    } = this;
    const self = this;
    let startPos;

    self.sectionPos = [];
    sectionSelection.each(function (_, i) {
      if (!i) {
        startPos = this.getBoundingClientRect().top; // this === selection element
      }
      self.sectionPos.push(this.getBoundingClientRect().top - startPos); // self === GraphScroll
    });

    const containerBB = parentContainer.node().getBoundingClientRect();
    const graphHeight = graphContainer.node()
      ? graphContainer.node().getBoundingClientRect().height
      : 0;

    this.containerStart = containerBB.top + pageYOffset;
    this.belowStart = containerBB.bottom - graphHeight + pageYOffset;
  }

  _keydown() {
    const {
      activeSectionIndex,
      containerStart,
      isFixed,
      numberOfSections,
      sectionPos,
    } = this;
    let delta;

    if (!isFixed) return;

    switch (event.keyCode) {
      case 39: // right arrow
        if (event.metaKey) return;
      case 40: // down arrow
      case 34: // page down
        delta = event.metaKey ? Infinity : 1; break;
      case 37: // left arrow
        if (event.metaKey) return;
      case 38: // up arrow
      case 33: // page up
        delta = event.metaKey ? -Infinity : -1; break;
      case 32: // space
        delta = event.shiftKey ? -1 : 1;
        break;
      default: return;
    }

    const i1 = Math.max(0, Math.min(activeSectionIndex + delta, numberOfSections - 1));
    select(document.documentElement)
      .interrupt()
      .transition()
      .duration(500)
      .tween('scroll', () => {
        const interpolator =
          interpolateNumber(pageYOffset, sectionPos[i1] + containerStart);
        return (t) => { scrollTo(0, interpolator(t)); };
      });

    event.preventDefault();
  }

  container(_x) {
    if (!_x) return this.parentContainer;

    this.parentContainer = _x;
    return this;
  }

  graph(_x) {
    if (!_x) return this.graphContainer;

    this.graphContainer = _x;

    return this;
  }

  eventId(_x) {
    if (!_x) return this.eventIdentifier;

    this.eventIdentifier = _x;

    return this;
  }

  sections(_x) {
    const {
      eventIdentifier,
    } = this;

    if (!_x) return this.sectionSelection;

    this.sectionSelection = _x;
    this.numberOfSections = this.sectionSelection.size();

    select(window)
      .on(`scroll.gscroll${eventIdentifier}`, this._reposition)
      .on(`resize.gscroll${eventIdentifier}`, this._resize)
      .on(`keydown.gscroll${eventIdentifier}`, this._keydown);

    this._resize();

    const scrollTimerString = `gscrollTimer${eventIdentifier}`;
    if (window[scrollTimerString]) {
      window[scrollTimerString].stop();
    }
    window[scrollTimerString] = timer(this._reposition);

    return this;
  }

  on() {
    const value = this.dispatchInstance.on.apply(this.dispatchInstance, arguments);
    return value === this.dispatchInstance ? this : value;
  }
}
