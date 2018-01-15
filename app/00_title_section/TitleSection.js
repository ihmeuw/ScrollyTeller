import { select } from 'd3';

export default class TitleSection {
  constructor(appContainerId, titleTextCSS, titleText) {
    select(`#${appContainerId}`)
      .html(`<div class=${titleTextCSS}>${titleText}</div>`);
  }
}
