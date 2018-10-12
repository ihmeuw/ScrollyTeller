import 'whatwg-fetch';
import {
  get,
  map,
  forEach,
  isFunction,
  toArray,
  isString,
} from 'lodash-es';
import { getFileExtensionFromURLString } from './configValidator';
import {
  csv,
  json,
  tsv,
  xml,
  html,
} from 'd3-fetch';

function convertURLToPromise(config, propertyName) {
  const urlPromiseOrArray = get(config, propertyName);
  if (isString(urlPromiseOrArray)) {
    /** which function? csv, html, json? */
    const fileExtension = getFileExtensionFromURLString(urlPromiseOrArray);
    const promiseFunction = get({
      csv, json, tsv, xml, html,
    }, fileExtension);
    /** if we found a function, return, otherwise throw exception */
    if (isFunction(promiseFunction)) {
      return promiseFunction(urlPromiseOrArray);
    }
    throw Error('ScrollyTeller.convertURLToPromise(). URL must have a file extension of ' +
      '.csv, .tsv, .json, .html, .txt, or .xml');
  }
  return urlPromiseOrArray;
}

/**
 * finds any narration promises in the sectionList, resolves them,
 * then re-assigns section.narration to the fetched values
 * @param {Array} sectionList of promises to resolve to fetch narration
 * @returns {Promise<void>} to resolve any promises and assign the results to sectionList
 */
export async function fetchNarration(sectionList) {
  /** fetches: 1 for every section */
  const sectionArray = toArray(sectionList);
  const fetches = map(sectionArray, (config) => {
    /** if the promise is already specified by the user spec, just return it
     * (if property is a promise, resolve will resolve to a Promise) */
    return Promise.resolve(convertURLToPromise(config, 'narration'));
  });
  /** section array: indexed the same as the fetches array, and to the results array */
  const results = await Promise.all(fetches);
  /** results are indexed in the same order as results array */
  forEach(sectionArray, (config, i) => {
    const {
      sectionIdentifier,
    } = config;
    /** re-set the new narration from the promise results */
    sectionList[sectionIdentifier].narration = results[i];
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
  const sectionArray = toArray(sectionList);
  const fetches = map(sectionArray, (config) => {
    /** if the promise is already specified by the user spec, just return it
     * (if property is a promise, resolve will resolve to a Promise) */
    return Promise.resolve(convertURLToPromise(config, 'data'));
  });
  /** section array: indexed the same as the fetches array, and to the results array */
  const results = await Promise.all(fetches);
  /** results are indexed in the same order as sectionList array */
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
}

