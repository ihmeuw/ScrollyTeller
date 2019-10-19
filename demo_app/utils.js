import { select } from 'd3';

export const highlightLines = (baseCssSelector, linesArray, highlightColor) => {
  if (linesArray instanceof Array) {
    linesArray.forEach((line) => {
      select(`${baseCssSelector} li:nth-child(${line})`)
        .style('background', highlightColor, 'important')
        .style('border-radius', '5px');
    });
  }
};

export const updateSvgImage = (graphId, state, previousSvgFileName) => {
  const {
    svgFileName,
  } = state;
  if (svgFileName !== previousSvgFileName) {
    const html = svgFileName
      ? `<img src="dist/images/${svgFileName}.svg" />`
      : null;
    const graph = select(`#${graphId} .imageDiv`);
    graph
      .transition()
      .duration(500)
      .style('opacity', 0)
      .on('end', () => {
        graph
          .html(html)
          .transition()
          .duration(500)
          .style('opacity', svgFileName ? 1 : 0);
      });
  }
};
