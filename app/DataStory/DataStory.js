import {
  forEach,
  isFunction,
  get,
  map,
  toArray,
} from 'lodash';
import {
  isPromise,
  validateDataStoryState,
} from './util';
import ScrollyTeller from '../ScrollyTeller/ScrollyTeller';

export default class DataStory {
  constructor(appState) {
    validateDataStoryState(appState);
    this.sectionList = appState.sectionList;

    Promise.all([
      this.fetchNarration(),
      this.fetchData(),
    ])
      .then(() => {
        appState.scrollyTeller = new ScrollyTeller({
          ...appState,
          sectionList: this.sectionList,
        });
      });
  }

  async fetchData() {
    const fetches = this._getPromisesFromSectionList('data');
    const sectionArray = toArray(this.sectionList);
    await Promise.all(fetches)
      .then((results) => {
        /** results are indexed in the same order as sectionList */
        forEach(sectionArray, (config, i) => {
          const {
            sectionIdentifier,
            reshapeDataFunction,
          } = config;
          /** re-set the new data values */
          this.sectionList[sectionIdentifier].data = isFunction(reshapeDataFunction)
            ? reshapeDataFunction(results[i])
            : results;
        });
      });
  }

  async fetchNarration() {
    const fetches = this._getPromisesFromSectionList('narration');
    const sectionArray = toArray(this.sectionList);
    await Promise.all(fetches)
      .then((results) => {
        /** results are indexed in the same order as sectionList */
        forEach(sectionArray, (config, i) => {
          const {
            sectionIdentifier,
          } = config;
          /** re-set the new data values */
          this.sectionList[sectionIdentifier].narration = results[i];
        });
      });
  }

  _getPromisesFromSectionList(propertyName) {
    const sectionArray = toArray(this.sectionList);
    return map(sectionArray, (config) => {
      if (isPromise(get(config, propertyName))) {
        return get(config, propertyName);
      }
      return Promise.resolve(() => { return get(config, propertyName); });
    });
  }
}
