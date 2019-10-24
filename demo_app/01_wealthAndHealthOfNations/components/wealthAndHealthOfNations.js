import {
  scaleLinear,
  scaleLog,
  scaleOrdinal,
  scaleSqrt,
} from 'd3-scale';
import { select } from 'd3-selection';
import { axisBottom, axisLeft } from 'd3-axis';
import { schemeCategory10 } from 'd3-scale-chromatic'
import { legendColor } from 'd3-svg-legend';

const defaults = {
  container: '#chart',
  height: 500,
  margin: {
    top: 30, left: 60, bottom: 60, right: 30,
  },
  width: 500,
};

export default class WealthAndHealthOfNations {
  constructor(props) {
    this._init({ ...defaults, ...props });
  }

  _updateProps(props) {
    this.props = { ...this.props, ...props };
    return this.props;
  }

  _init(props) {
    const {
      container,
      height,
      legendArray,
      margin,
      rDomain,
      xDomain,
      yDomain,
      yearDomain,
      width,
    } = this._updateProps(props);

    /** build svg */
    this.svg = select(container)
      .append('svg')
      .attr('width', width)
      .attr('height', height);

    /** X SCALE & AXIS */
    this.xScale = scaleLog()
      .domain(xDomain)
      .range([margin.left, width - margin.right]);

    this.xAxis = g => g
      .attr('transform', `translate(0,${height - margin.bottom})`)
      .call(axisBottom(this.xScale).ticks(width / 80, ','))
      .call(g => g.select('.domain').remove());

    this.svg
      .append('text')
      .attr('transform', `translate(${width / 2} ,${height - margin.bottom / 2})`)
      .style('text-anchor', 'middle')
      .style('font-size', 12)
      .text('Income per capita (inflation adjusted dollars)');

    this.svg.append('g')
      .call(this.xAxis);

    this.yScale = scaleLinear()
      .domain(yDomain)
      .range([height - margin.bottom, margin.top]);

    /** Y SCALE & AXIS */
    this.yAxis = g => g
      .attr('transform', `translate(${margin.left},0)`)
      .call(axisLeft(this.yScale))
      .call(g => g.select('.domain').remove());

    this.svg.append('g')
      .call(this.yAxis);

    this.svg
      .append('text')
      .attr('transform', 'rotate(-90)')
      .attr('y', margin.left / 3)
      .attr('x', 0 - height / 2)
      .attr('dy', '1em')
      .style('text-anchor', 'middle')
      .style('font-size', 12)
      .text('Life expectancy (years)');

    /** RADIUS SCALE */
    this.rScale = scaleSqrt()
      .domain(rDomain)
      .range([1, 50]);

    /** COLOR SCALE */
    this.cScale = scaleOrdinal()
      .domain(legendArray)
      .range(schemeCategory10);

    /** YEAR SCALE & LABEL */
    this.yearScale = scaleLinear()
      .domain(yearDomain)
      .range([0, yearDomain[1] - yearDomain[0]]);

    this.yearLabel = this.svg.append('g')
      .style('font-size', 50)
      .style('opacity', 0.3)
      .attr('transform', `translate(${margin.left + 10}, ${margin.top + 40})`)
      .append('text')
      .text(Math.max(yearDomain) || '');

    /** SCATTER GROUP */
    this.scatter = this.svg.append('g')
      .attr('stroke', '#000')
      .attr('stroke-opacity', 0.2);

    /** LEGEND */
    this.svg.append('g')
      .attr('class', 'legendOrdinal')
      .style('font-size', 13)
      .style('opacity', 0.7)
      .attr('transform', `translate(${width - width / 3}, ${height - height / 2.8})`);

    const legendOrdinal = legendColor()
      .shape('circle')
      .shapeRadius(8)
      .title('Regions')
      .titleWidth(100)
      .scale(this.cScale);

    this.svg.select('.legendOrdinal')
      .call(legendOrdinal);
  }

  render(props) {
    const {
      data,
      duration = 500,
      year,
      yearDomain,
    } = this._updateProps(props);

    const yearIndex = year ? Math.floor(this.yearScale(year)) : this.yearScale.range()[0];

    const update = this.scatter
      .selectAll('circle')
      .data(data, (d) => {
        return d.name;
      });

    this.yearLabel
      .text(year || yearDomain[0] || '');

    update
      .enter().append('circle')
      .attr('cx', d => this.xScale(d.income[yearIndex]))
      .attr('cy', d => this.yScale(d.lifeExpectancy[yearIndex]))
      .merge(update)
      .transition()
      .duration(duration)
      .attr('cx', d => this.xScale(d.income[yearIndex]))
      .attr('cy', d => this.yScale(d.lifeExpectancy[yearIndex]))
      .attr('fill', d => this.cScale(d.region))
      .attr('opacity', 0.7)
      .attr('r', d => this.rScale(d.population[yearIndex]));

    update.exit().remove();
  }

  resize(props) {
    this.svg.remove();
    this._init(props);

  }
}
