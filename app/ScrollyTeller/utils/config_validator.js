import {
  forEach,
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
    throw Error('DataStory.validateState() sectionArray is empty.');
  }

  if (isUndefined(cssNames)) {
    throw Error('DataStory.validateState() cssNames is undefined.');
  }

  /** narration and data must be either arrays of ibjects or promises */
  if (!isANonEmptyObjectOrPromise(narration)) {
    throw Error('DataStory.validateState() narration must be an array or a promise.');
  }

  if (!isANonEmptyObjectOrPromise(data)) {
    throw Error('DataStory.validateState() data must be an array or a promise.');
  }

  /** reshapeData data is an optional function, so don't require it */

  /** must have implemented the following functions */
  if (!isFunction(buildGraphFunction)) {
    throw Error('DataStory.validateState() buildGraphFunction must be a function.');
  }
  if (!isFunction(onScrollFunction)) {
    throw Error('DataStory.validateState() onScrollFunction must be a function.');
  }
  if (!isFunction(onActivateNarrationFunction)) {
    throw Error('DataStory.validateState() onActivateNarrationFunction must be a function.');
  }
}

export function validateState(state) {
  const { appContainerId } = state;
  /** need a valid app container id */
  if (isUndefined(appContainerId)) {
    throw Error('DataStory.validateState() No appContainerId is set for the DataStory.');
  }

  /** need a valid array of sections */
  const { sectionList } = state;
  if (isEmpty(sectionList) || !isObject(sectionList)) {
    throw Error('DataStory.validateState() sectionList is empty.');
  } else {
    forEach(sectionList, sectionConfigValidator);
  }
}
