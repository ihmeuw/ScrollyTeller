import CSS from './nameDefaults';

export default class ScrollyTellerNames {
  constructor(scrollyTellerCSS) {
    this.css = { ...CSS, ...scrollyTellerCSS };
  }

  /**
   * Returns the section id associated with this section based on the sectionIdentifier
   * @param {string} sectionIdentifier - id of the section
   * @returns {string} representing the id of the div containing this section
   */
  sectionId(sectionIdentifier) {
    return `${this.css.sectionContainer}_${sectionIdentifier}`;
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

  graphClass(sectionIdentifier, usesDefaultGraphCSS = false) {
    return usesDefaultGraphCSS
      ? this.css.graphContainerDefault
      : `${this.css.graphContainer}_${sectionIdentifier}`;
  }
}
