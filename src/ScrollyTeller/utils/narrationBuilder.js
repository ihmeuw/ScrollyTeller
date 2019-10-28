/* global window document */
/* eslint-disable require-jsdoc */
import {
  get,
  isEmpty,
} from 'lodash-es';
import { select, selectAll } from 'd3-selection';
import { vhToPx } from './vhToPxFunctions';

function scaleMarginTop(mobileScrollHeightMultiplier = 1) {
  return function ({ marginTopVh }) {
    return vhToPx(marginTopVh * mobileScrollHeightMultiplier);
  };
}

function scaleMarginBottom(mobileScrollHeightMultiplier = 1) {
  return function ({ marginBottomVh }) {
    return vhToPx(marginBottomVh * mobileScrollHeightMultiplier);
  };
}

function scaleMinHeight(mobileScrollHeightMultiplier = 1) {
  return function ({ minHeightVh, marginTopVh, marginBottomVh }) {
    const scaledHeight = minHeightVh * mobileScrollHeightMultiplier;
    const scaledMarginTop = marginTopVh * mobileScrollHeightMultiplier;
    const scaledMarginBottom = marginBottomVh * mobileScrollHeightMultiplier;

    return vhToPx(
      scaledHeight || (Number(scaledMarginTop) + Number(scaledMarginBottom)),
    );
  };
}


function buildNarrationBlocks(
  narrationDiv,
  narrationBlocksArray,
  config,
  mobileScrollHeightMultiplier = 1,
) {
  /** build the narration as an html string */
  const names = config.cssNames;
  const css = get(config, ['cssNames', 'css']);

  narrationBlocksArray.forEach((block) => {
    const {
      narrationId,
      narrationClass = '',
      h2Text,
      paragraphText,
      hRefText,
      hRef,
    } = block;

    const narrationBlockId = `${names.narrationId(narrationId)}`;

    const blockContainer = narrationDiv
      .append('div')
      .datum(block)
      .attr('class', css.narrationBlock)
      .attr('id', narrationBlockId)
      .classed(narrationClass, true)
      .style('margin-top', scaleMarginTop(mobileScrollHeightMultiplier))
      .style('margin-bottom', scaleMarginBottom(mobileScrollHeightMultiplier))
      .style('min-height', scaleMinHeight(mobileScrollHeightMultiplier));

    const blockContent = blockContainer.append('div')
      .datum(block)
      .attr('class', css.narrationContent);

    if (!isEmpty(h2Text)) {
      blockContent.append('h2').html(h2Text);
    }

    if (!isEmpty(paragraphText)) {
      blockContent.append('p').html(paragraphText);
    }

    if (!isEmpty(hRefText) && !isEmpty(hRef)) {
      blockContent.append('div')
        .attr('class', css.linkContainer)
        .append('a')
        .attr('href', hRef)
        .attr('target', '_blank')
        .html(hRefText);
    }
  });
}

export function resizeNarrationBlocks(config, mobileScrollHeightMultiplier) {
  const { sectionIdentifier, cssNames: names } = config;

  const css = get(names, ['css']);
  const sectionId = names.sectionId(sectionIdentifier);

  selectAll(`#${sectionId} .${css.narrationBlock}`)
    .style('margin-top', scaleMarginTop(mobileScrollHeightMultiplier))
    .style('margin-bottom', scaleMarginBottom(mobileScrollHeightMultiplier))
    .style('min-height', scaleMinHeight(mobileScrollHeightMultiplier));
}

export function buildSectionWithNarration(config, mobileScrollHeightMultiplier) {
  const { sectionIdentifier, cssNames: names, narration } = config;

  const sectionDiv = select(`.${names.scrollContainer()}`)
    .append('div')
    .attr('class', names.sectionClass())
    .attr('id', names.sectionId(sectionIdentifier));

  /** insert the graph as the first div before narration divs */
  sectionDiv
    .append('div')
    .attr('id', names.graphContainerId(sectionIdentifier))
    .attr('class', names.graphContainerClassNames(sectionIdentifier))
    .append('div')
    .attr('class', names.graphClassNames(sectionIdentifier))
    .attr('id', names.graphId(sectionIdentifier));

  const narrationDiv = sectionDiv.append('div')
    .attr('class', names.narrationList());

  /** select the appropriate section by id, and append a properly formatted html string
   * containing the contents of each narration block (row in the narration.csv file) */
  buildNarrationBlocks(narrationDiv, narration, config, mobileScrollHeightMultiplier);
}
