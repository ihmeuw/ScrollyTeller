import * as d3 from 'd3';
import { merge } from 'lodash';

import Chart from './chart';

export default class SampleChart extends Chart {
  /**
   * @constructor
   * @param {Object} properties - Configuration properties
   * @access public
   */
  constructor(properties) {
    super(merge({}, properties));
  }

  render(data) {
    if (data) this.data = data;
    const margin = {
        top: 20, right: 20, bottom: 50, left: 100,
      },
      width = this.properties.width - margin.left - margin.right,
      height = this.properties.height - margin.top - margin.bottom;

    this.x = d3.scaleTime().range([0, width]);
    this.y = d3.scaleLinear().range([height, 0]);

    const xTitleGroup = (selection) => {
      return selection.attr(
        'transform',
        `translate(${(((width + margin.right) - margin.left) / 2)}, 
        ${(height + 50)})`,
      );
    };

    const yTitleGroup = (selection) => {
      return selection.attr(
        'transform',
        `translate(-50,${((height + (margin.top + margin.bottom)) / 2)}) 
        rotate(-90)`,
      );
    };

    this.valueline = d3.line()
      .x((d) => { return this.x(d.date); })
      .y((d) => { return this.y(d.close); });

    this.svg = d3.select(this.properties.container)
      .append('svg')
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .append('g')
      .attr(
        'transform',
        `translate(${margin.left},${margin.top})`,
      );


    this.yTitleGroup = this.svg.append('g')
      .attr('class', 'y-title-group title-group')
      .call(yTitleGroup.bind(this));

    this.yTitle = this.yTitleGroup.append('text')
      .attr('class', 'y-title')
      .text('Rate of Change');

    this.xTitleGroup = this.svg.append('g')
      .attr('class', 'x-title-group title-group')
      .call(xTitleGroup.bind(this));

    this.xTitle = this.xTitleGroup.append('text')
      .attr('class', 'x-title')
      .text('Years');

    this.x.domain(d3.extent(this.data, (d) => {
      return d.date;
    }));
    this.y.domain([0, d3.max(this.data, (d) => { return d.close; })]);

    this.path = this.svg.append('path')
      .data([this.data])
      .attr('class', 'line')
      .attr('d', this.valueline);

    // Add the X Axis
    this.xAxisOuter = this.svg.append('g')
      .attr('transform', `translate(0,${height})`)
      .attr('class', 'axis')
      .call(d3.axisBottom(this.x));

    this.xAxisInner = this.svg.append('g')
      .attr('class', 'inner-axis')
      .call(d3.axisLeft(this.y).tickSizeInner(-width));

    // Add the Y Axis
    this.yAxisInner = this.svg.append('g')
      .attr('class', 'axis')
      .call(d3.axisLeft(this.y));

    this.yAxisOuter = this.svg.append('g')
      .attr('transform', `translate(0,${height})`)
      .attr('class', 'inner-axis')
      .call(d3.axisBottom(this.x).tickSizeInner(-height));
  }

  update(data) {
    if (data) this.data = data;
    const animate = true;
    const margin = {
        top: 20, right: 20, bottom: 50, left: 100,
      },
      width = this.properties.width - margin.left - margin.right,
      height = this.properties.height - margin.top - margin.bottom;

    d3.select(`${this.properties.container} svg`)
      .attr('width', this.properties.width)
      .attr('height', this.properties.height);

    this.x.domain(d3.extent(this.data, (d) => {
      return d.date;
    }));
    this.y.domain([0, d3.max(this.data, (d) => { return d.close; })]);

    this.path.data([this.data]);

    this._transition(this.path, { animate })
      .attr('class', 'line')
      .attr('d', this.valueline);

    this._transition(this.xAxisOuter, { animate })
      .attr('transform', `translate(0,${height})`)
      .call(d3.axisBottom(this.x));
    //
    this._transition(this.xAxisInner, { animate })
      .call(d3.axisLeft(this.y).tickSizeInner(-width));


    this._transition(this.yAxisInner, { animate })
      .attr('class', 'axis')
      .call(d3.axisLeft(this.y));

    this._transition(this.yAxisOuter, { animate })
      .attr('transform', `translate(0,${height})`)
      .attr('class', 'inner-axis')
      .call(d3.axisBottom(this.x).tickSizeInner(-height));
  }
}
