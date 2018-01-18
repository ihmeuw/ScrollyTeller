import './scss/style.scss';
import TitleSection from './00_title_section/TitleSection';
import SectionSimple from './01_example_section_simple/SectionSimple';
import SectionExample from './99_example_section_chart/SectionExampleChart.js';

export default class App {
  constructor() {
    const containerSelector = { appContainerId: 'app' };
    const titleSectionProps = { titleTextCSS: 'title', titleText: 'Scrolly Teller Example' };

    this.title = new TitleSection({ ...containerSelector, ...titleSectionProps });
    this.sectionSimple = new SectionSimple(containerSelector);
    this.sectionWithChart = new SectionExample(containerSelector);
  }
}

$(document).ready(() => {
  new App();
});
