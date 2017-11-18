import { event as d3Event } from 'd3';

import * as d3 from 'd3';

export default class SampleChart {
  /**
   * @constructor
   * @param {Object} properties - Configuration properties
   * @access public
   */
  constructor(properties) {
    this.properties = properties;
  }

  render() {
    const margin = {
        top: 20, right: 20, bottom: 50, left: 100,
      },
      width = 960 - margin.left - margin.right,
      height = 500 - margin.top - margin.bottom;

    const x = d3.scaleTime().range([0, width]);
    const y = d3.scaleLinear().range([height, 0]);

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

    const valueline = d3.line()
      .x((d) => { return x(d.date); })
      .y((d) => { return y(d.close); });

    this.svg = d3.select(this.properties.container)
      .append('svg')
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .append('g')
      .attr(
        'transform',
        `translate(${margin.left},${margin.top})`,
      );

    const parseTime = d3.timeParse('%y');

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

    d3.csv('app/sample/sample-data.csv', (error, data) => {
      if (error) throw error;

      data.forEach((d) => {
        d.date = parseTime(d.date);
        d.close = +d.close;
      });

      x.domain(d3.extent(data, (d) => {
        return d.date;
      }));
      y.domain([0, d3.max(data, (d) => { return d.close; })]);

      this.svg.append('path')
        .data([data])
        .attr('class', 'line')
        .attr('d', valueline);

      // Add the X Axis
      this.svg.append('g')
        .attr('transform', `translate(0,${height})`)
        .attr('class', 'axis')
        .call(d3.axisBottom(x));

      // Add the X Axis
      this.svg.append('g')
        .attr('class', 'inner-axis')
        .call(d3.axisLeft(y).tickSizeInner(-width));

      // Add the Y Axis
      this.svg.append('g')
        .attr('class', 'axis')
        .call(d3.axisLeft(y));

      this.svg.append('g')
        .attr('transform', `translate(0,${height})`)
        .attr('class', 'inner-axis')
        .call(d3.axisBottom(x).tickSizeInner(-height));
    });
  }
}
