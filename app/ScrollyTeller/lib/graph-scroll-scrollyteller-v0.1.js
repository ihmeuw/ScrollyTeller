import {
  select,
  dispatch,
  timer,
  event,
  interpolateNumber,
} from 'd3';

export default class GraphScroll {
  constructor() {
    this.dispatch = dispatch('scroll', 'active');
    this.sectionSelection = select('null');
    this.activeSectionIndex = NaN;
    this.sectionPos = [];
    this.numberOfSections = undefined;
    this.graphContainer = select('null');
    this.isFixed = null;
    this.isBelow = null;
    this.parentContainer = select('body');
    this.containerStart = 0;
    this.belowStart = undefined;
    this.eventIdentifier = Math.random();
    this._reposition = this._reposition.bind(this);
    this._resize = this._resize.bind(this);
  }

  _getSectionNodeByIndex(index) {
    return this.sectionSelection.nodes()[index]
      ? this.sectionSelection.nodes()[index]
      : null;
  }

  _reposition() {
    let i1 = 0;
    this.sectionPos.forEach((d, i) => {
      if (d < (pageYOffset - this.containerStart) + 200) {
        i1 = i;
      }
    });
    i1 = Math.min(this.numberOfSections - 1, i1);
    if (this.activeSectionIndex !== i1) {
      this.sectionSelection.classed('graph-scroll-active', (d, i) => { return i === i1; });

      this.dispatch.apply('active', this, [i1, this._getSectionNodeByIndex(i1)]);

      this.activeSectionIndex = i1;
    }

    const isBelow1 = pageYOffset > this.belowStart;
    if (this.isBelow !== isBelow1) {
      this.isBelow = isBelow1;
      this.graphContainer.classed('graph-scroll-below', this.isBelow);
    }
    const isFixed1 = !this.isBelow && pageYOffset > this.containerStart;
    if (this.isFixed !== isFixed1) {
      this.isFixed = isFixed1;
      this.graphContainer.classed('graph-scroll-fixed', this.isFixed);
    }

    const pos = pageYOffset - 10 - this.containerStart;
    const prevTop = this.sectionPos[this.activeSectionIndex];
    const nextTop =
      (
        this.activeSectionIndex + 1 < this.sectionPos.length
          ? this.sectionPos[this.activeSectionIndex + 1]
          : (this.belowStart - this.containerStart)
      ) - 200;
    const progress = (pos - prevTop) / (nextTop - prevTop);
    if (progress >= 0 && progress <= 1) {
      this.dispatch.apply('scroll', this, [this.activeSectionIndex, progress, this._getSectionNodeByIndex(this.activeSectionIndex)]);
    }
  }

  _resize() {
    this.sectionPos = [];
    const that = this;
    let startPos;
    this.sectionSelection.each(function (d, i) {
      if (!i) startPos = this.getBoundingClientRect().top;
      that.sectionPos.push(this.getBoundingClientRect().top - startPos);
    });

    const containerBB = this.parentContainer.node().getBoundingClientRect();
    const graphBB = this.graphContainer.node().getBoundingClientRect();

    this.containerStart = containerBB.top + pageYOffset;
    this.belowStart = containerBB.bottom - (graphBB.height + pageYOffset);
  }

  _keydown() {
    if (!this.isFixed) return;
    let delta;
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

    const i1 = Math.max(0, Math.min(this.activeSectionIndex + delta, this.numberOfSections - 1));
    select(document.documentElement)
      .interrupt()
      .transition()
      .duration(500)
      .tween('scroll', () => {
        const interpolator =
          interpolateNumber(pageYOffset, this.sectionPos[i1] + this.containerStart);
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
    if (!_x) return this.sectionSelection;

    this.sectionSelection = _x;
    this.numberOfSections = this.sectionSelection.size();

    select(window)
      .on(`scroll.gscroll${this.eventIdentifier}`, this._reposition)
      .on(`resize.gscroll${this.eventIdentifier}`, this._resize)
      .on(`keydown.gscroll${this.eventIdentifier}`, this._keydown);

    this._resize();
    timer(() => {
      this._reposition();
      return true;
    });

    return this;
  }

  on() {
    const value = this.dispatch.on.apply(this.dispatch, arguments);
    return value === this.dispatch ? this : value;
  }
}
