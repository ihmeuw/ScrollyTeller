import {
  forEach,
  findIndex,
  isArray,
  isEmpty,
  isFunction,
  isObject,
  isString,
  isUndefined,
} from 'lodash-es';

export function getFileExtensionFromURLString(url) {
  /** check for string */
  if (isString(url)) {
    /** regex match to get the file extension with 3 or 4 characters:
     * https://regex101.com/r/O5kD7y/1 */
    const matches = url.match(/\.(\w{3,4})$/g);
    return matches.length === 1 // multiple matches are probably invalid
      ? matches[0].replace('.', '') // strip off the . in .extension
      : '';
  }
  return '';
}

function isValidURLString(url) {
  const extension = getFileExtensionFromURLString(url);
  const index = findIndex(
    ['csv', 'tsv', 'json', 'html', 'txt', 'xml'],
    (valid) => { return valid === extension; },
  );
  return index !== -1;
}

export function isPromise(value) {
  return Promise.resolve(value) === value;
}

function isANonEmptyObjectPromiseOrValidURLString(value) {
  const isURLString = isValidURLString(value);
  const isAnObject = isObject(value) && !isEmpty(value);
  const isAPromise = isPromise(value);
  return (isAnObject || isAPromise || isURLString);
}

function validateCSSNames(state) {
  const {
    cssNames,
  } = state;

  /** cssNames is optional, so allow ScrollyTeller to create the default CSSNames object,
   * however, DO check for an incorrectly defined cssNames object
   * (not of class CSSNames) */
  if (cssNames && (cssNames.constructor.name !== 'CSSNames')) {
    throw Error('ScrollyTeller.validateSectionConfig() cssNames must be a CSSNames object.');
  }
}

export function validateSectionConfig(sectionConfig) {
  /** validate each array configuration object */
  const {
    sectionIdentifier,
    narration,
    buildGraphFunction,
    onScrollFunction,
    onActivateNarrationFunction,
  } = sectionConfig;

  /** must have a valid section identifier */
  if (isUndefined(sectionIdentifier) || !sectionIdentifier.length) {
    throw Error('ScrollyTeller.validateSectionConfig() sectionArray is empty.');
  }

  validateCSSNames(sectionConfig);

  /** narration  must be either arrays of objects or promises */
  if (!isANonEmptyObjectPromiseOrValidURLString(narration)) {
    throw Error('ScrollyTeller.validateSectionConfig() narration must be an array or a promise.');
  }

  /** data can be undefined or empty */

  /** reshapeData data is an optional function, so don't require it */

  /** must have implemented the following functions */
  if (!isFunction(buildGraphFunction)) {
    throw Error('ScrollyTeller.validateSectionConfig() buildGraphFunction must be a function.');
  }
  if (!isFunction(onScrollFunction)) {
    throw Error('ScrollyTeller.validateSectionConfig() onScrollFunction must be a function.');
  }
  if (!isFunction(onActivateNarrationFunction)) {
    throw Error('ScrollyTeller.validateSectionConfig() onActivateNarrationFunction must be a function.');
  }
}

export function validateScrollyTellerConfig(state) {
  const {
    appContainerId,
    sectionList,
  } = state;
  /** need a valid app container id */
  if (isUndefined(appContainerId)) {
    throw Error('ScrollyTeller.validateScrollyTellerConfig() No appContainerId is set for the ScrollyTeller.');
  }

  /** need a valid array of sections */
  if (isEmpty(sectionList) || !isArray(sectionList)) {
    throw Error('ScrollyTeller.validateScrollyTellerConfig() sectionList is empty.');
  } else {
    validateCSSNames(state);

    forEach(sectionList, validateSectionConfig);
  }
}
