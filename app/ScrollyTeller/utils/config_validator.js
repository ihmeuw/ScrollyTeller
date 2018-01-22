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
    functionBindingContext,
    buildGraphFunction,
    onScrollFunction,
    onActivateNarrationFunction,
    showSpacers,
    useDefaultGraphCSS,
  } = sectionConfig;

  /** need a valid app container id */
  if (isUndefined(appContainerId)) {
    throw Error('ScrollyTeller.sectionConfigValidator() missing ' +
      `appContainerId for section: ${sectionIdentifier}.`);
  }

  /** must have a valid section identifier */
  if (isUndefined(sectionIdentifier) || !sectionIdentifier.length) {
    throw Error('ScrollyTeller.sectionConfigValidator() sectionArray is empty.');
  }

  if (isUndefined(cssNames) || (cssNames.constructor.name !== 'CSSNames')) {
    throw Error('ScrollyTeller.sectionConfigValidator() cssNames must be a CSSNames object.');
  }

  /** narration and data must be either arrays of objects or promises */
  if (!isANonEmptyObjectOrPromise(narration)) {
    throw Error('ScrollyTeller.sectionConfigValidator() narration must be an array or a promise.');
  }

  if (!isANonEmptyObjectOrPromise(data)) {
    throw Error('ScrollyTeller.sectionConfigValidator() data must be an array or a promise.');
  }

  /** reshapeData data is an optional function, so don't require it */

  if (isUndefined(functionBindingContext)) {
    throw Error('ScrollyTeller.sectionConfigValidator() functionBindingContext must be defined.');
  }
  /** must have implemented the following functions */
  if (!isFunction(buildGraphFunction)) {
    throw Error('ScrollyTeller.sectionConfigValidator() buildGraphFunction must be a function.');
  }
  if (!isFunction(onScrollFunction)) {
    throw Error('ScrollyTeller.sectionConfigValidator() onScrollFunction must be a function.');
  }
  if (!isFunction(onActivateNarrationFunction)) {
    throw Error('ScrollyTeller.sectionConfigValidator()' +
      'onActivateNarrationFunction must be a function.');
  }

  /** must have a valid showSpacers flag */
  if (isUndefined(showSpacers)) {
    throw Error('ScrollyTeller.sectionConfigValidator() sectionArray is empty.');
  }
  /** must have a useDefaultGraphCSS flag */
  if (isUndefined(useDefaultGraphCSS)) {
    throw Error('ScrollyTeller.sectionConfigValidator() sectionArray is empty.');
  }
}

export function validateState(state) {
  const { appContainerId } = state;
  /** need a valid app container id */
  if (isUndefined(appContainerId)) {
    throw Error('ScrollyTeller.validateState() No appContainerId is set for the ScrollyTeller.');
  }

  /** need a valid array of sections */
  const { sectionList } = state;
  if (isEmpty(sectionList) || !isObject(sectionList)) {
    throw Error('ScrollyTeller.validateState() sectionList is empty.');
  } else {
    forEach(sectionList, sectionConfigValidator);
  }
}
