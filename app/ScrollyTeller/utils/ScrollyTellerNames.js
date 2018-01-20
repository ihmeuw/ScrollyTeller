import CSS from './name_defaults';

export default class CSSNames {
  constructor(scrollyTellerCSS) {
    this.css = { ...CSS, ...scrollyTellerCSS };
  }

  /** Returns the section id associated with this section based on the sectionIdentifier */
  sectionId(sectionIdentifier) {
    return `${this.css.sectionContainer}_${sectionIdentifier}`;
  }

  /** Returns the section id associated with this section based on the sectionIdentifier */
  narrationId(narrationId) {
    return `${this.css.narrationBlock}_${narrationId}`;
  }

  /** Returns the section class name associated with this section based on the sectionIdentifier */
  sectionClass() {
    return `${this.css.sectionContainer}`;
  }

  /** Returns the graph id associated with this section based on the sectionIdentifier */
  graphId(sectionIdentifier) {
    return `${this.css.graphContainer}_${sectionIdentifier}`;
  }

  graphClass(sectionIdentifier, usesDefaultGraphCSS = false) {
    return usesDefaultGraphCSS
      ? this.css.graphContainerDefault
      : `${this.css.graphContainer}_${sectionIdentifier}`;
  }
}
