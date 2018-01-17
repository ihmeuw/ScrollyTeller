import { select } from 'd3';

export default class TitleSection {
  constructor({
    appContainerId,
    titleTextCSS,
    titleText,
  } = {}) {
    this.appContainerId = appContainerId;
    this.titleTextCSS = titleTextCSS;
    this.titleText = titleText;

    this.render();
  }

  render() {
    select(`#${this.appContainerId}`)
      .html(`<div class=${this.titleTextCSS}>${this.titleText}</div>`);
  }
}
