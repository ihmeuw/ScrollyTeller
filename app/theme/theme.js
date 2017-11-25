import $ from 'jquery';
import * as item from 'graph-scroll';
import * as d3 from 'd3';
import { union } from 'lodash';


import SampleChart from '../sample/template.chart';

export default class ThemeTemplate {
  constructor() {
    $('#app')
      .empty()
      .append(`
      <div class="title">Story Theme Template</div>
      <div id="container">
          <div id="sections">
            <div id="one">
              <h2>How did this happen?</h2>
              <p>In the late 1990s healthcare providers began to prescribe prescription opioid pain relievers at greater rates</p>
              <a href="https://www.drugabuse.gov/drugs-abuse/opioids/opioid-overdose-crisis">What can I do to help?</a>
            </div>
            <div class="step"></div>
            <div id="two">
              <h2>How did this happen?</h2>
              <p>In the late 1990s healthcare providers began to prescribe prescription opioid pain relievers at greater rates</p>
              <a href="https://www.drugabuse.gov/drugs-abuse/opioids/opioid-overdose-crisis">What can I do to help?</a>
            </div>
                <div class="step"></div>
            <div id="three">
              <h2>How did this happen?</h2>
              <p>In the late 1990s healthcare providers began to prescribe prescription opioid pain relievers at greater rates</p>
              <a href="https://www.drugabuse.gov/drugs-abuse/opioids/opioid-overdose-crisis">What can I do to help?</a>
            </div>
           <div class="step"></div>
            <div id="four">
              <h2>How did this happen?</h2>
              <p>In the late 1990s healthcare providers began to prescribe prescription opioid pain relievers at greater rates</p>
              <a href="https://www.drugabuse.gov/drugs-abuse/opioids/opioid-overdose-crisis">What can I do to help?</a>
            </div>
            <div class="step"></div>
          </div>
          <div id="graph"></div>
      </div> 
      <div class="step"></div>
    `);
    this.data = {
      one: [],
      two: [],
      three: [],
      four: [],
    };

    this.dataPrepAndRenderInitialGraph();

    this.chart = new SampleChart({
      container: '#graph',
    });
    item.graphScroll()
      .container(d3.select('#container'))
      .graph(d3.selectAll('#graph'))
      .sections(d3.selectAll('#sections > div'))
      .on('active', (i) => {
        console.log(`${i}th section active`);
        if (i == 0) this.update(this.data.one);
        if (i == 2) this.update(this.data.three);
        if (i == 4) this.update(this.data.two);
        if (i == 7) this.update(this.data.one);
      });
  }

  dataPrepAndRenderInitialGraph() {
    const parseTime = d3.timeParse('%y');

    d3.csv('app/sample/update-data.csv', (error, data) => {
      if (error) throw error;
      this.data.one = data;
      this.data.one.forEach((d) => {
        d.date = parseTime(d.date);
        d.close = +d.close;
      });
      this.render(this.data.one);
    });

    d3.csv('app/sample/sample-data.csv', (error, data) => {
      if (error) throw error;
      this.data.two = data;
      this.data.two.forEach((d) => {
        d.date = parseTime(d.date);
        d.close = +d.close;
      });
    });

    d3.csv('app/sample/two-data.csv', (error, data) => {
      if (error) throw error;
      this.data.three = data;
      this.data.three.forEach((d) => {
        d.date = parseTime(d.date);
        d.close = +d.close;
      });
    });

    d3.csv('app/sample/three-data.csv', (error, data) => {
      if (error) throw error;
      this.data.four = data;
      this.data.four.forEach((d) => {
        d.date = parseTime(d.date);
        d.close = +d.close;
      });
    });
  }

  render(data) {
    this.chart.render(data);
  }

  update(data) {
    this.chart.update(data);
  }
}
