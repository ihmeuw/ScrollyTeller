import { get } from 'lodash-es';
import 'd3-selection-multi';

export function updateCaption({
  graphContainer,
  index,
  names,
  narration,
  state,
}) {
  const captionClass = names.graphCaptionClass();
  const graphCaption = get(narration, [index, 'graphCaption'], '');

  let caption = graphContainer.select(`.${captionClass} text`);

  if (caption.empty()) {
    caption = graphContainer.append('div')
      .classed(captionClass, true)
      .append('text');
  }

  // apply styles or other attributes
  caption.styles(state.captionStyle)
    .html(graphCaption);
}

export function updateTitle({
  graphContainer,
  index,
  names,
  narration,
  state,
}) {
  const titleClass = names.graphTitleClass();
  const graphTitle = get(narration, [index, 'graphTitle'], '');

  let title = graphContainer.select(`.${titleClass} text`);
  if (title.empty()) {
    title = graphContainer.insert('div', ':first-child')
      .classed(titleClass, true)
      .append('text');
  }

  // apply styles or other attributes
  title.styles(state.titleStyle)
    .html(graphTitle);

}

export function updateGraphStyles({
  graph,
  graphContainer,
  names,
  sectionIdentifier,
  state,
}) {
  // graph style and classes
  graph.styles(state.graphStyle)
    .attr(
      'class',
      [names.graphClassNames(sectionIdentifier),
        ...(state.graphClass ? state.graphClass.split(' ') : ''),
      ].join(' '),
    );

  // graph container style and classses
  graphContainer.styles(state.containerStyle)
    .attr(
      'class',
      [names.graphContainerClassNames(sectionIdentifier),
        'active',
        ...(state.containerClass ? state.containerClass.split(' ') : ''),
      ].join(' '),
    );

  // caption styles and classes
  graphContainer.select(`.${names.graphCaptionClass()}`)
    .attr(
      'class',
      [names.graphCaptionClass(),
        ...(state.captionClass ? state.captionClass.split(' ') : ''),
      ].join(' '),
    )
    .select('text')
    .styles(state.captionStyle);

  // title styles and classes
  graphContainer.select(`.${names.graphTitleClass()}`)
    .attr(
      'class',
      [names.graphTitleClass(),
        ...(state.titleClass ? state.titleClass.split(' ') : ''),
      ].join(' '),
    )
    .select('text')
    .styles(state.titleStyle);
}
