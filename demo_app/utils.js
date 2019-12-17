import { isNil } from 'lodash-es';
import { select } from 'd3-selection';

export const highlightLines = (baseSelection, linesArray, highlightColor) => {
  if (linesArray instanceof Array) {
    linesArray.forEach((line) => {
      baseSelection.select(`li:nth-child(${line})`)
        .style('background', highlightColor, 'important')
        .style('border-radius', '5px');
    });
  }
};

export const updateSvgImage = (graphId, state, previousSvgFileName) => {
  const {
    svgFileName,
  } = state;
  if (isNil(svgFileName)) {
    const graph = select(`#${graphId} .imageDiv`);
    graph
      .transition()
      .duration(250)
      .style('opacity', 0);
  }
  if (svgFileName !== previousSvgFileName) {
    const html = svgFileName
      ? `<img src="dist/images/${svgFileName}.svg" />`
      : null;
    const graph = select(`#${graphId} .imageDiv`);
    graph
      .transition()
      .duration(250)
      .style('opacity', 0)
      .on('end', () => {
        graph
          .html(html)
          .transition()
          .duration(250)
          .style('opacity', svgFileName ? 1 : 0);
      });
  }
};
