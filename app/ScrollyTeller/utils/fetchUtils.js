import {
  get,
  map,
  forEach,
  isFunction,
  toArray,
} from 'lodash';
import { isPromise } from './configValidator';

/**
 *  Looks for already stored data and returns a promise to return the un-modified data,
 *  OR if section.data is already a promise, it returns that promise
 *  @param {string} sectionList: array of sections to parse promises from
 *  @param {string} propertyName: property name to look for in each section (data or narration)
 *  @return {Array} returns an array of promises: 1 for each section in sectionList.
 *  */
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

/**
 * finds any narration promises in the sectionList, resolves them,
 * then re-assigns section.narration to the fetched values
 * @param {Array} sectionList of promises to resolve to fetch narration
 * @returns {Promise<void>} to resolve any promises and assign the results to sectionList
 */
export async function fetchNarration(sectionList) {
  /** fetches: 1 for every section */
  const fetches = getPromisesFromSectionList(sectionList, 'narration');
  /** section array: indexed the same as the fetches array, and to the results array */
  const sectionArray = toArray(sectionList);
  await Promise.all(fetches)
    .then((results) => {
      /** results are indexed in the same order as results array */
      forEach(sectionArray, (config, i) => {
        const {
          sectionIdentifier,
        } = config;
        /** re-set the new narration from the promise results */
        sectionList[sectionIdentifier].narration = results[i];
      });
    });
}

/**
 * Finds any data promises in the sectionList, resolves them, and calls section.reshapeDataFunction
 * to reshape the data.
 * Then re-assigns the processed data to section.data
 * @param {Array} sectionList of promises to resolve to fetch data
 * @returns {Promise<void>} to resolve any promises and assign the data results to sectionList
 */
export async function fetchDataAndProcessResults(sectionList) {
  /** fetches: 1 for every section */
  const fetches = getPromisesFromSectionList(sectionList, 'data');
  /** section array: indexed the same as the fetches array, and to the results array */
  const sectionArray = toArray(sectionList);
  await Promise.all(fetches)
    .then((results) => {
      /** results are indexed in the same order as results array */
      forEach(sectionArray, (config, i) => {
        const {
          sectionIdentifier,
          reshapeDataFunction,
          functionBindingContext,
        } = config;
        /** call reshapeDataFunction if it is defined and overwrite the new data values */
        sectionList[sectionIdentifier].data = isFunction(reshapeDataFunction)
          ? reshapeDataFunction.apply(functionBindingContext, [results[i]])
          : results[i];
      });
    });
}

