import {
  forEach,
  isFunction,
  toArray,
} from 'lodash';
import {
  validateDataStoryState,
  getPromisesFromSectionList,
} from './util';
import ScrollyTeller from '../ScrollyTeller/ScrollyTeller';

export default class DataStory {
  constructor(appState) {
    validateDataStoryState(appState);
    this.sectionList = appState.sectionList;

    Promise.all([
      this.fetchNarration(),
      this.fetchDataAndProcessResults(),
    ])
      .then(() => {
        appState.scrollyTeller = new ScrollyTeller({
          ...appState,
          sectionList: this.sectionList,
        });
      });
  }

  /** finds any data promises in the sectionList, resolves them, and calls section.reshapeDataFunction
   * to reshape the data.
   * Then re-assigns the processed data to section.data
   */
  async fetchDataAndProcessResults() {
    /** fetches: 1 for every section */
    const fetches = getPromisesFromSectionList(this.sectionList, 'data');
    /** section array: indexed the same as the fetches array, and to the results array */
    const sectionArray = toArray(this.sectionList);
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
          this.sectionList[sectionIdentifier].data = isFunction(reshapeDataFunction)
            ? reshapeDataFunction.apply(functionBindingContext, [results[i]])
            : results[i];
        });
      });
  }

  /** finds any narration promises in the sectionList, resolves them,
   * then re-assigns section.narration to the fetched values
   */
  async fetchNarration() {
    /** fetches: 1 for every section */
    const fetches = getPromisesFromSectionList(this.sectionList, 'narration');
    /** section array: indexed the same as the fetches array, and to the results array */
    const sectionArray = toArray(this.sectionList);
    await Promise.all(fetches)
      .then((results) => {
        /** results are indexed in the same order as results array */
        forEach(sectionArray, (config, i) => {
          const {
            sectionIdentifier,
          } = config;
          /** re-set the new narration from the promise results */
          this.sectionList[sectionIdentifier].narration = results[i];
        });
      });
  }
}
