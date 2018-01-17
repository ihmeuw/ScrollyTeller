import './scss/style.scss';
import TitleSection from './00_title_section/TitleSection';
import Section1 from './01_section_1/Section1';
import SectionExample from './99_section_example/SectionExample';

export default class App {
  constructor() {
    const containerSelector = { appContainerId: 'app' };
    const titleSectionProps = { titleTextCSS: 'title', titleText: 'Scrolly Teller Example' };

    this.title = new TitleSection({ ...containerSelector, ...titleSectionProps });
    this.section1 = new Section1(containerSelector);
    this.example = new SectionExample(containerSelector);
  }
}

$(document).ready(() => {
  new App();
});
