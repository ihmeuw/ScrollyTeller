import {
  isEmpty, isString, merge, reduce, slice, replace,
} from 'lodash-es';

function replaceMap(string, replacements) {
  if (!isString(string)) {
    return string;
  }

  const matches = string.match(/\$(\w+)/g);

  if (matches) {
    return reduce(matches, (result, match) => {
      return replace(result, match, replacements[match.substring(1)]);
    }, string);
  }

  return string;
}

export function getStateFromTrigger(triggerString, attributes, state = {}) {
  const attributeReplacedTrigger = replaceMap(triggerString, attributes);
  try {
    return isEmpty(attributeReplacedTrigger)
      ? state
      : merge(state, JSON.parse(attributeReplacedTrigger));
  } catch (e) {
    console.warn(`malformed JSON in trigger ${triggerString}`);
  }
  return {};
}

export function getNarrationState(sectionConfig, activeIndex, currentProgress) {
  const narrationSteps = slice(sectionConfig.narration, 0, activeIndex + 1);

  return reduce(narrationSteps, (results, { trigger }, narrationIndex) => {
    const narrationProgress = (narrationIndex === activeIndex) ? currentProgress : 1;

    return getStateFromTrigger(
      trigger,
      {
        progress: narrationProgress,
        index: activeIndex,
      },
      results,
    );
  }, {});
}
