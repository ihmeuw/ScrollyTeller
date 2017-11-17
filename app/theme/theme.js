import $ from 'jquery';

import SampleChart from '../sample/template.chart';

export default class ThemeTemplate {
  constructor() {
    $('#view-content')
      .empty()
      .append(`
      <div class="title">Story Theme Template</div>
      <div id="theme-container" class="outer-container">
          <div id="example-chart" class="inner-container"></div>
          <div id="example-comment" class="inner-container, comment"></div>
      </div> 
    `);

    this.chart = new SampleChart({
      container: '#example-chart',
    });
    this.render();
  }

  render(properties) {
    this.chart.render();

    $('#example-comment')
      .empty()
      .append(`
      <div>
        <h2>How did this happen?</h2>
        <p>In the late 1990s healthcare providers began to prescribe prescription opioid pain relievers at greater rates</p>
        <a href="https://www.drugabuse.gov/drugs-abuse/opioids/opioid-overdose-crisis">What can I do to help?</a>
      </div>`);
  }
}
