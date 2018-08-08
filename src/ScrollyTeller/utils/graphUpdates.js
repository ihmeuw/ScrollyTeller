import { forIn, get } from 'lodash';

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
  forIn(state.captionStyle, (value, key) => {
    caption.style(key, value);
  });
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
  }

  let title = graphContainer.select('div.graph_title text');
  if (title.empty()) {
    title = graphContainer.insert('div', ':first-child')
      .classed('graph_title', true)
      .append('text');
  }

  title.html(graphTitle);

  // apply styles or other attributes
  forIn(state.titleStyle, (value, key) => {
    title.style(key, value);
  });
}

export function updateGraphStyles({
  graph,
  graphContainer,
  state,
}) {
  // graph style
  forIn(state.graphStyle, (value, key) => {
    graph.style(key, value);
  });

  // graph class name
  if (state.graphClass) {
    const [className, trueFalse] = state.graphClass.split('|');
    graph.classed(className, trueFalse !== 'remove');
  }

  // graph container style
  forIn(state.containerStyle, (value, key) => {
    graphContainer.style(key, value);
  });

  // graph container class
  if (state.containerClass) {
    const [className, trueFalse] = state.containerClass.split('|');
    graphContainer.classed(className, trueFalse !== 'remove');
  }

  // apply title styles
  if (state.titleStyle) {
    const title = graphContainer.select('div.graph_title text');
    forIn(state.titleStyle, (value, key) => {
      title.style(key, value);
    });
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
    forIn(state.captionStyle, (value, key) => {
      caption.style(key, value);
    });
  }

  // apply caption classes
  if (state.captionClass) {
    const [className, trueFalse] = state.captionClass.split('|');
    graphContainer.select('div.graph_caption text')
      .classed(className, trueFalse !== 'remove');
  }
}
