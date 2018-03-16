import Emitter from 'events';
import { merge } from 'lodash';
import * as d3 from 'd3';
import './chart.scss';

/**
 * @class
 * @extends Emitter
 * @description Base chart class.
 * @access protected
 */
export default class Chart extends Emitter {
  /**
  * @constructor
  * @description chart constructor.
  * @param {Object} properties - Configuration properties
  * @access public
  */
  constructor(properties) {
    super();

    const defaults = {
      container: '#chart',
      animation: 1000,
      width: 1000,
      height: 800,
    };

    this.properties = merge({}, defaults, properties);
  }

  /**
  * @description Determine should transition occur
  * @param {Selection} selection - d3 selection
  * @param {Object} param - the param object
  * @param {Boolean} [param.animate = true] - flag to prevent animation
  * @param {Number|Boolean} [param.delay = false] - delay in ms or false
  * @return {Selection|Transition} - d3 selection or transition
  * @access protected
  */
  _transition(selection, {
    duration = 3000,
    animate = true,
    delay = false,
  } = {}) {
    if (animate && duration > 0) {
      if (this.timer) this.timer.stop();

      this.emit('transitioning', true);

      const transition = selection.transition().ease(d3.easeLinear).duration(duration);

      if (delay) transition.delay(delay);

      this.timer = d3.timeout(() => {
        this.emit('transitioning', false);
      }, (duration));

      return transition;
    }
    return selection;
  }

  /**
  * @description resize the chart
  * @access public
  * @param {Number} width - new width of the chart
  * @param {Number} height - new height of the chart
  * @param {Object} param - the param object
  * @param {Boolean} [param.animate = false] - flag to enable/disable transition
  * @return {void}
  */
  resize(width, height, { animate = false } = {}) {
    this.properties = { ...this.properties, ...{ width, height } };

    if (this.svg !== undefined) {
      this.svg
        .attr('width', width)
        .attr('height', height);
      this.update({ animate });
    }
  }
}
