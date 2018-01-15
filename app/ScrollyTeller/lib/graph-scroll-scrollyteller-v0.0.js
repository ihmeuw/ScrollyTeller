import * as d3 from 'd3';

export default function graphScroll() {
  let dispatch = d3.dispatch('scroll', 'active'),
    sections = d3.select('null'),
    i = NaN,
    sectionPos = [],
    n,
    graph = d3.select('null'),
    isFixed = null,
    isBelow = null,
    container = d3.select('body'),
    containerStart = 0,
    belowStart,
    eventId = Math.random();

  function getSectionNodeByIndex(index) {
    return sections.nodes()[index]
      ? sections.nodes()[index]
      : null;
  }

  function reposition() {
    let i1 = 0;
    sectionPos.forEach((d, i) => {
      if (d < pageYOffset - containerStart + 200) i1 = i;
    });
    i1 = Math.min(n - 1, i1);
    if (i != i1) {
      sections.classed('graph-scroll-active', (d, i) => { return i === i1; });

      dispatch.call('active', this, i1, getSectionNodeByIndex(i1));

      i = i1;
    }

    const isBelow1 = pageYOffset > belowStart;
    if (isBelow != isBelow1) {
      isBelow = isBelow1;
      graph.classed('graph-scroll-below', isBelow);
    }
    const isFixed1 = !isBelow && pageYOffset > containerStart;
    if (isFixed != isFixed1) {
      isFixed = isFixed1;
      graph.classed('graph-scroll-fixed', isFixed);
    }

    const pos = pageYOffset - 10 - containerStart;
    const prevTop = sectionPos[i];
    const nextTop = (i + 1 < sectionPos.length ? sectionPos[i + 1] : (belowStart - containerStart)) - 200;
    const progress = (pos - prevTop) / (nextTop - prevTop);
    if (progress >= 0 && progress <= 1) { dispatch.call('scroll', this, i, progress, getSectionNodeByIndex(i)); }
  }

  function resize() {
    sectionPos = [];
    let startPos;
    sections.each(function (d, i) {
      if (!i) startPos = this.getBoundingClientRect().top;
      sectionPos.push(this.getBoundingClientRect().top - startPos);
    });

    const containerBB = container.node().getBoundingClientRect();
    const graphBB = graph.node().getBoundingClientRect();

    containerStart = containerBB.top + pageYOffset;
    belowStart = containerBB.bottom - graphBB.height + pageYOffset;
  }

  function keydown() {
    if (!isFixed) return;
    let delta;
    switch (d3.event.keyCode) {
      case 39: // right arrow
        if (d3.event.metaKey) return;
      case 40: // down arrow
      case 34: // page down
        delta = d3.event.metaKey ? Infinity : 1; break;
      case 37: // left arrow
        if (d3.event.metaKey) return;
      case 38: // up arrow
      case 33: // page up
        delta = d3.event.metaKey ? -Infinity : -1; break;
      case 32: // space
        delta = d3.event.shiftKey ? -1 : 1;
        break;
      default: return;
    }

    const i1 = Math.max(0, Math.min(i + delta, n - 1));
    d3.select(document.documentElement)
      .interrupt()
      .transition()
      .duration(500)
      .tween('scroll', () => {
        const i = d3.interpolateNumber(pageYOffset, sectionPos[i1] + containerStart);
        return function (t) { scrollTo(0, i(t)); };
      });

    d3.event.preventDefault();
  }


  const rv = {};

  rv.container = function (_x) {
    if (!_x) return container;

    container = _x;
    return rv;
  };

  rv.graph = function (_x) {
    if (!_x) return graph;

    graph = _x;
    return rv;
  };

  rv.eventId = function (_x) {
    if (!_x) return eventId;

    eventId = _x;
    return rv;
  };

  rv.sections = function (_x) {
    if (!_x) return sections;

    sections = _x;
    n = sections.size();

    d3.select(window)
      .on(`scroll.gscroll${eventId}`, reposition)
      .on(`resize.gscroll${eventId}`, resize)
      .on(`keydown.gscroll${eventId}`, keydown);

    resize();
    d3.timer(() => {
      reposition();
      return true;
    });

    return rv;
  };

  /** hack for conversion from d3v3 -> d3v4, rebind() is copied from d3.v3 source code
   * Copies a variable number of methods from source to target.
   * Method is assumed to be a standard D3 getter-setter:
   * If passed with no arguments, gets the value.
   * If passed with arguments, sets the value and returns the target.
  */
  function d3_rebind(target, source, method) {
    return function () {
      const value = method.apply(source, arguments);
      return value === source ? target : value;
    };
  }

  d3.rebind = function (target, source) {
    let i = 1,
      n = arguments.length,
      method;
    while (++i < n) target[method = arguments[i]] = d3_rebind(target, source, source[method]);
    return target;
  };

  /** now use rebind as it was used in d3.v3 */
  d3.rebind(rv, dispatch, 'on');

  return rv;
}
