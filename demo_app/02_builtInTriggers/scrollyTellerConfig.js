/* globals PR */
import { noop } from 'lodash-es';
import './data/narration.csv';

import './scss/builtInTriggers.scss';

/** no need for any functionality here, this section only uses ScrollyTeller's build in functionality */
export default {
  sectionIdentifier: 'builtInTriggers',
  narration: 'demo_app/02_builtInTriggers/data/narration.csv',
  reshapeDataFunction: noop,
  buildGraphFunction: noop,
  onScrollFunction: noop,
  onActivateNarrationFunction: noop,
};
