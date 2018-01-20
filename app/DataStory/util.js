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

export function isANonEmptyObjectOrPromise(value) {
  const isAnObject = isObject(value) && !isEmpty(value);
  const isAPromise = isPromise(value);
  return (isAnObject || isAPromise);
}

export function validateDataStoryState(state) {
  const { appContainerId } = state;
  /** need a valid app container id */
  if (isUndefined(appContainerId)) {
    throw Error('DataStory.validateDataStoryState() No appContainerId is set for the DataStory.');
  }

  /** need a valid array of sections */
  const { sectionList } = state;
  if (isEmpty(sectionList) || !isObject(sectionList)) {
    throw Error('DataStory.validateDataStoryState() sectionList is empty.');
  } else {
    /** validate each array configuration object */
    forEach(sectionList, (sectionObject) => {
      const {
        sectionIdentifier,
        cssNames,
        narration,
        data,
        reshapeDataFunction,
        buildGraphFunction,
        onScrollFunction,
        onActivateNarrationFunction,
      } = sectionObject;

      /** need a valid app container id */
      if (isUndefined(sectionObject.appContainerId)) {
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

      /** must have implemented the following functions */
      if (!isFunction(reshapeDataFunction)) {
        throw Error('DataStory.validateDataStoryState() reshapeDataFunction must be a function.');
      }
      if (!isFunction(buildGraphFunction)) {
        throw Error('DataStory.validateDataStoryState() buildGraphFunction must be a function.');
      }
      if (!isFunction(onScrollFunction)) {
        throw Error('DataStory.validateDataStoryState() onScrollFunction must be a function.');
      }
      if (!isFunction(onActivateNarrationFunction)) {
        throw Error('DataStory.validateDataStoryState() onActivateNarrationFunction must be a function.');
      }
    });
  }
}

