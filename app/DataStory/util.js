import {
  get,
  map,
  forEach,
  isEmpty,
  isObject,
  isUndefined,
  toArray,
} from 'lodash';
import {
  isPromise,
  sectionConfigValidator,
} from '../ScrollyTeller/utils/config_validator';

/** returns an array of promises: 1 for each section in sectionList.
 *  Looks for already stored data and returns a promise to return the un-modified data,
 *  OR if section.data is already a promise, it returns that promise
 *  @param propertyName: property name to look for in each section (data or narration) */
export function getPromisesFromSectionList(sectionList, propertyName) {
  const sectionArray = toArray(sectionList);
  /** return a promise for every section so we can used the indices to index into results array
   * after the promise is resolved */
  return map(sectionArray, (config) => {
    /** if the promise is already specified by the user spec, just return it */
    if (isPromise(get(config, propertyName))) {
      return get(config, propertyName);
    }
    /** otherwise, return a promise to just get the already stored data from the section */
    return Promise.resolve(get(config, propertyName));
  });
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
    forEach(sectionList, sectionConfigValidator);
  }
}

