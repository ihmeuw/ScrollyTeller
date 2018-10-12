import { clamp } from 'lodash-es';

export function calcScrollProgress(element, offset) {
  const {
    top: elementTop,
    height: elementHeight,
  } = element.getBoundingClientRect();
  const {
    innerHeight: viewPortHeight,
  } = element.ownerDocument.defaultView;

  const progress = ((viewPortHeight * offset) - elementTop) / elementHeight;

  return clamp(progress, 0, 1);
}
