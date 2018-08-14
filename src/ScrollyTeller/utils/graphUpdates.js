import { get } from 'lodash';
import 'd3-selection-multi';

export function updateCaption({
  graphContainer,
  index,
  narration,
  state,
}) {
  const captionContainer = graphContainer.select('.graph_caption');
  const graphCaption = get(narration, [index, 'graphCaption'], '');

  let caption = graphContainer.select('div.graph_caption text');
  if (graphCaption === '') {
    captionContainer.remove();
    return;
  }

  if (caption.empty()) {
    caption = graphContainer.append('div')
      .classed('graph_caption', true)
      .append('text');
  }

  caption.html(graphCaption);

  // apply styles or other attributes
  caption.styles(state.captionStyle);
}

export function updateTitle({
  graphContainer,
  index,
  narration,
  state,
}) {
  const titleContainer = graphContainer.select('.graph_title');
  const graphTitle = get(narration, [index, 'graphTitle'], '');

  if (graphTitle === '') {
    titleContainer.remove();
    return;
  }

  let title = graphContainer.select('div.graph_title text');
  if (title.empty()) {
    title = graphContainer.insert('div', ':first-child')
      .classed('graph_title', true)
      .append('text');
  }

  title.html(graphTitle);

  // apply styles or other attributes
  title.styles(state.titleStyle);
}

export function updateGraphStyles({
  graph,
  graphContainer,
  state,
}) {
  // graph style
  graph.styles(state.graphStyle);

  // graph class name
  if (state.graphClass) {
    const [className, trueFalse] = state.graphClass.split('|');
    graph.classed(className, trueFalse !== 'remove');
  }

  // graph container style
  graphContainer.styles(state.containerStyle);

  // graph container class
  if (state.containerClass) {
    const [className, trueFalse] = state.containerClass.split('|');
    graphContainer.classed(className, trueFalse !== 'remove');
  }

  // apply title styles
  if (state.titleStyle) {
    const title = graphContainer.select('div.graph_title text');
    title.styles(state.titleStyle);
  }

  // apply title classes
  if (state.titleClass) {
    const [className, trueFalse] = state.titleClass.split('|');
    graphContainer.select('div.graph_title text')
      .classed(className, trueFalse !== 'remove');
  }

  // apply caption styles
  if (state.captionStyle) {
    const caption = graphContainer.select('div.graph_caption text');
    caption.styles(state.captionStyle);
  }

  // apply caption classes
  if (state.captionClass) {
    const [className, trueFalse] = state.captionClass.split('|');
    graphContainer.select('div.graph_caption text')
      .classed(className, trueFalse !== 'remove');
  }
}
