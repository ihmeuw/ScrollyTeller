import {
  isEmpty,
  isFunction,
  isObject,
  isUndefined,
} from 'lodash';

export function isPromise(value) {
  return Object.prototype.toString.call(value) === '[object Promise]';
}

function isANonEmptyObjectOrPromise(value) {
  const isAnObject = isObject(value) && !isEmpty(value);
  const isAPromise = isPromise(value);
  return (isAnObject || isAPromise);
}

export function sectionConfigValidator(sectionConfig) {
  /** validate each array configuration object */
  const {
    appContainerId,
    sectionIdentifier,
    cssNames,
    narration,
    data,
    buildGraphFunction,
    onScrollFunction,
    onActivateNarrationFunction,
  } = sectionConfig;

  /** need a valid app container id */
  if (isUndefined(appContainerId)) {
    throw Error(`DataStory.validateState() missing appContainerId: ${sectionIdentifier}.`);
  }

  /** must have a valid section identifier */
  if (isUndefined(sectionIdentifier) || !sectionIdentifier.length) {
    throw Error('DataStory.validateDataStoryState() sectionArray is empty.');
  }

  if (isUndefined(cssNames)) {
    throw Error('DataStory.validateDataStoryState() cssNames is undefined.');
  }

  /** narration and data must be either arrays of ibjects or promises */
  if (!isANonEmptyObjectOrPromise(narration)) {
    throw Error('DataStory.validateDataStoryState() narration must be an array or a promise.');
  }

  if (!isANonEmptyObjectOrPromise(data)) {
    throw Error('DataStory.validateDataStoryState() data must be an array or a promise.');
  }

  /** reshapeData data is an optional function, so don't require it */

  /** must have implemented the following functions */
  if (!isFunction(buildGraphFunction)) {
    throw Error('DataStory.validateDataStoryState() buildGraphFunction must be a function.');
  }
  if (!isFunction(onScrollFunction)) {
    throw Error('DataStory.validateDataStoryState() onScrollFunction must be a function.');
  }
  if (!isFunction(onActivateNarrationFunction)) {
    throw Error('DataStory.validateDataStoryState() onActivateNarrationFunction must be a function.');
  }
}
