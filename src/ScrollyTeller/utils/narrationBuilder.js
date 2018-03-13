import {
  get,
  isEmpty,
} from 'lodash';
import { select } from 'd3';

function getSpacerText(config, block, narrationBlockId, location) {
  const viewportHeightSpace = location === 'ABOVE'
    ? block.spaceAboveInVh
    : block.spaceBelowInVh;

  if (isEmpty(viewportHeightSpace)) {
    return '';
  }

  const css = get(config, ['cssNames', 'css']);
  const spacerClassName = config.showSpacers ? css.spacerShow : css.spacerHide;
  const spacerText = config.showSpacers ? `
    <h3>SPACER: ${viewportHeightSpace} vh</h3>
    <h3>${location}: ${narrationBlockId}</h3>
  ` : '';

  return `<div class="${spacerClassName}"  style="height:${viewportHeightSpace}vh">
    ${spacerText}
  </div>`;
}

function getNarrationHtmlString(narrationBlocksArray, config) {
  /** build the narration as an html string */
  const names = config.cssNames;
  const css = get(config, ['cssNames', 'css']);
  return narrationBlocksArray.reduce((narrationHtmlString, block) => {
    /** outer sectionContainer for each part of the narration + spacerHide */
    const narrationBlockId = `${names.narrationId(block.narrationId)}`;
    const blockContainer = `<div 
      class=${css.narrationBlock} 
      id=${narrationBlockId}
    >`;

    /** spacerHide component below, with text if this.showSpacers is set to true */
    const spacerAbove = getSpacerText(config, block, narrationBlockId, 'ABOVE');

    /** text components of the narration */
    const h2 = isEmpty(block.h2Text) ? '' : `<h2>${block.h2Text}</h2>`;
    const paragraph = isEmpty(block.paragraphText) ? '' : `<p>${block.paragraphText}</p>`;

    /** link component */
    const href = (isEmpty(block.hRefText) || isEmpty(block.hRef))
      ? ''
      : `<div class="${css.linkContainer}">
          <a href=${block.hRef} target="_blank">${block.hRefText}</a>
         </div>`;

    /** spacerHide component below, with text if this.showSpacers is set to true */
    const spacerBelow = getSpacerText(config, block, narrationBlockId, 'BELOW');

    /** append all to the accumulated string */
    return narrationHtmlString.concat(
      blockContainer,
      spacerAbove,
      h2,
      paragraph,
      href,
      spacerBelow,
      '</div>',
    );
  }, '');
}

export function buildSectionWithNarration(config) {
  const names = config.cssNames;
  select(`.${names.scrollContainer()}`)
    .append('div')
    .attr('class', names.sectionClass())
    .attr('id', names.sectionId(config.sectionIdentifier));

  /** select the appropriate section by id, and append a properly formatted html string
   * containing the contents of each narration block (row in the narration.csv file) */
  select(`#${names.sectionId(config.sectionIdentifier)}`)
    .html(`<div class=${names.narrationList()}>${getNarrationHtmlString(config.narration, config)}</div>`);

  /** insert the graph as the first div before narration divs */
  select(`#${names.sectionId(config.sectionIdentifier)}`)
    .insert('div', ':first-child')
    .attr('class', names.graphClass(config.sectionIdentifier, config.useDefaultGraphCSS))
    .attr('id', names.graphId(config.sectionIdentifier));
}
