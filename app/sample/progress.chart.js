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
    const margin = {
        top: 20, right: 20, bottom: 50, left: 100,
      },
      width = 960 - margin.left - margin.right,
      height = 500 - margin.top - margin.bottom;

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

    this.path = this.svg.append('path')
      .attr('class', 'line');

    this.pathScale = d3.scaleLinear()
      .domain([0, 1]);
  }

  render(data) {
    if (data) this.data = data;
    const margin = {
        top: 20, right: 20, bottom: 50, left: 100,
      },
      width = 960 - margin.left - margin.right,
      height = 500 - margin.top - margin.bottom;

    this.x = d3.scaleTime().range([0, width]);
    this.y = d3.scaleLinear().range([height, 0]);


    this.valueline = d3.line()
      .x((d) => { return this.x(d.date); })
      .y((d) => { return this.y(d.close); });


    this.x.domain(d3.extent(this.data, (d) => {
      return d.date;
    }));
    this.y.domain([0, d3.max(this.data, (d) => { return d.close; })]);

    this.dashed = this.svg.append('path')
      .data([this.data])
      .attr('class', 'dashed')
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

  update() {
    this.pathScale
      .domain([0, 1])
      .range([0, this.totalLength])
      .clamp(true);

    this.path
      .data([this.data])
      .attr('d', this.valueline);

    this.totalLength = this.path.node().getTotalLength();

    this.path
      .attr('stroke-dasharray', `${this.totalLength} ${this.totalLength}`)
      .attr('stroke-dashoffset', this.totalLength)
      .transition()
      .duration(5000)
      .attr('stroke-dashoffset', 0);
  }
}
