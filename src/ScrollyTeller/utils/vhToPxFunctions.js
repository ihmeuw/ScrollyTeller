/* global document */
import { isNil } from 'lodash-es';

export function vhToNumericPx(vh) {
  if (isNil(vh)) return undefined;

  const { clientHeight: height } = document.documentElement;
  const percent = parseFloat(vh) / 100;
  return height * percent;
}

export function vhToPx(vh) {
  return `${vhToNumericPx(vh)}px`;
}
