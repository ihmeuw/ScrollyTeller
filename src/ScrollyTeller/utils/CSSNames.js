import CSS from './CSSNameDefaults';
import { merge } from 'lodash-es';

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

  narrationContentClass() {
    return this.css.narrationContent;
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
   * @returns {string} representing the id the graph div for this section
   * */
  graphId(sectionIdentifier) {
    return `${this.css.graphContainer}_${sectionIdentifier}`;
  }

  /**
   * Returns the classname of the div for this section
   * @param {string} sectionIdentifier - id of the section
   * @returns {string} representing the classname of the graph div for this section
   * */
  graphClass(sectionIdentifier) {
    return `${this.css.graphContainer}_${sectionIdentifier}`;
  }

  /**
   * Returns a space separated string of all of the class names for the graph in this section
   * @param {string} sectionIdentifier - id of the section
   * @returns {string} a space separated string of all of the class names for the graph in
   *                    this section
   * */
  graphClassNames(sectionIdentifier) {
    return `${this.css.graphContainerDefault} ${this.graphClass(sectionIdentifier)}`;
  }

  /**
   * Returns the id of the graph container associated with this section
   * @param {string} sectionIdentifier - id of the section
   * @returns {string} representing the id of the div containing the graph
   * */
  graphContainerId(sectionIdentifier) {
    return `${this.graphId(sectionIdentifier)}_container`;
  }

  /**
   * Returns the classname of all graph containers
   * @returns {string} representing the class name of the div containing the section
   * */
  graphContainerClass() {
    return `${this.css.graphContainer}_container`;
  }

  /**
   * Returns a space separated string of all of the class names for the graph container
   * in this section
   * @param {string} sectionIdentifier - id of the section
   * @returns {string} a space separated string of all of the class names for the
   *                    graph container in this section
   * */
  graphContainerClassNames(sectionIdentifier) {
    return this.graphContainerClass(sectionIdentifier);
  }


  /**
   * Get the title class
   * @return {CSSNames.graphTitleClass} - the title class name from the scrollyteller configuration
   */
  graphTitleClass() {
    return this.css.graphTitleClass;
  }

  /**
   * Get the caption class
   * @return {CSSNames.graphCaptionClass} - the caption class name from the scrollyteller configuration
   */
  graphCaptionClass() {
    return this.css.graphCaptionClass;
  }
}
