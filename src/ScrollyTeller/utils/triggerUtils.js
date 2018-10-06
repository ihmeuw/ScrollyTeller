import { set, reduce, split, slice, replace, isString } from 'lodash-es';

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

export function getStateFromTrigger(sectionConfig, triggerString, attributes, state = {}) {
  const {
    triggerListSeparator = ';',
    triggerKeyValueSeparator = ':',
  } = sectionConfig;

  const triggerList = split(triggerString, triggerListSeparator);

  return reduce(triggerList, (results, trigger) => {
    const [key, value] = split(trigger, triggerKeyValueSeparator);

    if (value === undefined) {
      results._otherTriggers = results._otherTriggers || [];
      results._otherTriggers.push(key);

      return results;
    }

    return set(results, key, replaceMap(value, attributes));

  }, state);
}

export function getNarrationState(sectionConfig, activeIndex, currentProgress) {
  const narrationSteps = slice(sectionConfig.narration, 0, activeIndex + 1);

  return reduce(narrationSteps, (results, { trigger }, narrationIndex) => {
    const narrationProgress = (narrationIndex === activeIndex) ? currentProgress : 1;

    return getStateFromTrigger(
      sectionConfig,
      trigger,
      {
        progress: narrationProgress,
        index: activeIndex,
      },
      results,
    );
  }, {});
}
