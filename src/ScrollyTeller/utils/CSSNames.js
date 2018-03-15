import CSS from './CSSNameDefaults';
import { merge } from 'lodash';

export default class CSSNames {
  constructor(scrollyTellerCSS) {
    this.css = merge({}, CSS, scrollyTellerCSS);
  }

  /**
   * Returns the section id associated with this section based on the sectionIdentifier
   * @param {string} sectionIdentifier - id of the section
   * @returns {string} representing the id of the div containing this section
   */
  sectionId(sectionIdentifier) {
    return `${this.css.sectionContainer}_${sectionIdentifier}`;
  }

  narrationList() {
    return this.css.narrationList;
  }

  narrationClass() {
    return this.css.narrationBlock;
  }

  /** Returns the section id associated with this section based on the sectionIdentifier
   * @param {string} narrationId id of the narration to concatenate to default narrationBlock keyword
   * @returns {string} representing the id of the div containing narration
   * */
  narrationId(narrationId) {
    return `${this.css.narrationBlock}_${narrationId}`;
  }

  scrollContainer() {
    return this.css.scrollContainer;
  }

  /** Returns the section class name associated with this section based on the sectionIdentifier
   * @returns {string} representing the class name of the div containing the section
   * */
  sectionClass() {
    return `${this.css.sectionContainer}`;
  }

  /**
   * Returns the graph id associated with this section based on the sectionIdentifier
   * @param {string} sectionIdentifier - id of the section
   * @returns {string} representing the class name of the div containing the section
   * */
  graphId(sectionIdentifier) {
    return `${this.css.graphContainer}_${sectionIdentifier}`;
  }

  graphClass(sectionIdentifier) {
    return `${this.css.graphContainer}_${sectionIdentifier}`;
  }
}
