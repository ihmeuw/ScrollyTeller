import * as d3 from 'd3';
import { union } from 'lodash';


import SampleChart from '../sample/template.chart';
import ProgressChart from '../sample/progress.chart';

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
      <div class="step"></div>
      <div class="step"></div>
      <div id="container_progress">
          <div id="sections_progress">
            <div id="one_progress">
              <h2>How did this happen?</h2>
              <p>In the late 1990s healthcare providers began to prescribe prescription opioid pain relievers at greater rates</p>
              <a href="https://www.drugabuse.gov/drugs-abuse/opioids/opioid-overdose-crisis">What can I do to help?</a>
            </div>
            <div class="step"></div>
            <div id="two_progress">
              <h2>How did this happen?</h2>
              <p>In the late 1990s healthcare providers began to prescribe prescription opioid pain relievers at greater rates</p>
              <a href="https://www.drugabuse.gov/drugs-abuse/opioids/opioid-overdose-crisis">What can I do to help?</a>
            </div>
                <div class="step"></div>
            <div id="three_progress">
              <h2>How did this happen?</h2>
              <p>In the late 1990s healthcare providers began to prescribe prescription opioid pain relievers at greater rates</p>
              <a href="https://www.drugabuse.gov/drugs-abuse/opioids/opioid-overdose-crisis">What can I do to help?</a>
            </div>
           <div class="step"></div>
            <div id="four_progress">
              <h2>How did this happen?</h2>
              <p>In the late 1990s healthcare providers began to prescribe prescription opioid pain relievers at greater rates</p>
              <a href="https://www.drugabuse.gov/drugs-abuse/opioids/opioid-overdose-crisis">What can I do to help?</a>
            </div>
            <div class="step"></div>
          </div>
          <div id="graph_progress"></div>
      </div> 
    `);
    this.data = {
      one: [],
      two: [],
      three: [],
      four: [],
    };

    this.chart = new SampleChart({
      container: '#graph',
    });

    this.dataPrepAndRenderInitialGraph();

    graphScroll()
      .container(d3.select('#container'))
      .graph(d3.selectAll('#graph'))
      .sections(d3.selectAll('#sections > div'))
      .on('active', (i) => {
        console.log(`${i}th section active`);
        if (i == 0) this.update(this.data.one);
        if (i == 2) this.update(this.data.three);
        if (i == 4) this.update(this.data.two);
        if (i == 6) this.update(this.data.four);
      });

    this.progress = new ProgressChart({
      container: '#graph_progress',
    });


    graphScroll()
      .container(d3.select('#container_progress'))
      .graph(d3.selectAll('#graph_progress'))
      .sections(d3.selectAll('#sections_progress > div'))
      .on('active', (i) => {
        console.log(`${i}th section active progress`);
      })
      .on('scroll', (i, d) => {
        console.log(d, i);
        if (i == 2) {
          this.progress.update();
        }
        // this.progress.path.attr('stroke-dashoffset', `${this.progress.path.node().getTotalLength() - this.progress.pathScale(d)}px`);
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
    this.progress.render(data);
  }

  update(data) {
    this.chart.update(data);
  }
}
