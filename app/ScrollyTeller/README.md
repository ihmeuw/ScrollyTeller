# ScrollyTeller

### Using ScrollyTeller to dynamically build story narration
##### ScrollyTeller is a JavaScript library that dynamically builds the HTML/CSS for the ***narration*** part of a scrolling based data story from a .csv file, and provides functionality for linking named 'triggers' to actions dispatched when each narration comes into view.

#### Use cases and functionality
* Separation of stories into multiple sections with different graphs and narrations.
* Separation of story sections allows multiple developers to work on different sections of a data story without interfering with one another.
* Customizing story narration to an audience: user-specific narration.csv files can tell a story differently based on audience, using the same rendering code, with different actions based on a user's area of interest or expertise.
* Changing the spacing between narration text, or the 'pacing' of a data story.

### Terminology

 | Term | Description |
 | :---: | :---: |
 | **Narration** | The scrolling text content that 'narrates' a data story. |
 | **Narration Block** | A group of text, links, and spacers contained in a ```<div>```. Actions can be triggered when each narration block comes into view. |
 | **Narration Block Contents** | Each narration block contains: ```<h2>``` text (title), ```<p>``` text (subtitle), and an ```<a href=...>``` (link) with some text.  For convenience, each narration block also contains **spacers** whose height is customizeable to control the pacing of the story. |
 | **Section** | A group of narration blocks with a corresponding **graph** element. A story can be one or multiple sections. |
 | **Graph** | A <div> element to hold a user defined graph, chart, or any other graphic to be triggered.  The graph is entirely user controlled. |
 | **GraphScroll** | The underlying JavaScript library used to control the triggering of actions when each narration block comes into view. ScrollyTeller uses a modified version of GraphScroll under the hood to provide extra functionality. |


#### To create a new section:

   * Create a class that extends ScrollyTeller
   * Assign a unique sectionIdentifier (can be a number or string), and pass it to the super() constructor
   * assign the full path of your narrationCSVFilePath to your new narration.csv file

```javascript
export default class Section1 extends ScrollyTeller {
  constructor({
    /** the id of a div to which this section should be added */
    appContainerId,
    /** can be any number, string, etc */
    sectionIdentifier = 1,
    /** must be an absolure path */
    narrationCSVFilePath = 'app/01_section_1/narration_section_1.csv',
    /** set to true to show spacer sizes for debugging */
    showSpacers = true,
    /**  if false, you must specify your own graph css, where
       * the graph class name is "graph_section_ + sectionIdentifier" */
    useDefaultGraphCSS = true,
  } = {}) {
    /**
      * The super class 'ScrollyTeller' takes the narration.csv and
     *      builds the following in the following order:
     * In parallel:
     * - Calls this.parseData() to parse any data
     * - Builds the narration as follows:
     *   - A <div> with class = this.sectionClass() and id = this.sectionId() to hold narration
     *      and our graph
     *   - A 'narration' <div> with class = 'narration=' for each row in the narration.csv file
     *      which contains the scrolling text to narrate our graph
     *   - A 'graph' <div> with id = this.graphId() to hold our graph
     *
     * THEN, it calls this.buildChart() to build the chart
     */
    super({
      appContainerId,
      sectionIdentifier,
      narrationCSVFilePath,
      showSpacers,
      useDefaultGraphCSS,
    });
  }
```
* Instantiate your new class somewhere in your app
```javascript
export default class App {
  constructor() {
    const appContainerId = 'app';
    this.section1 = new Section1({ appContainerId });
  }
}
```

* Format your narration.csv file as follows, keeping the header column names EXACTLY alike (they can be in any order).  Each **row** represents a unique **narration block**.

| narrationId | spaceAboveInVh | spaceBelowInVh | h2Text | paragraphText | hRef | hRefText | trigger |
| :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
|0|40|40|Some text that will be formatted as ```<h2>```| Some text that will be formatted as ```<p>``` |www.link.com|I'm a link to link.com|show_chart
|1|40|40|More Narration...|Here's why this chart is important!|||show_data_1

 Here's a description of what each column header controls:

 | Column Header | Effect |
 | :---: | :---: |
 | **narrationId** | Appended to the id field of each narration block as "narration_ + ```narrationId```". Can be non unique. Provided mainly as a means of distinguishing narration blocks easily. |
 | **spaceAboveInVh** | Specifies the size of a hidden spacer ***above*** any text in each narration block. Units are in viewport height ***vh***. Spacers can be shown by setting the ```showSpacers``` argument to true in the ScrollyTeller constructor. |
 | **spaceBelowInVh** | Specifies the size of a hidden spacer ***below*** any text in each narration block. Units are in viewport height ***vh***. Spacers can be shown by setting the ```showSpacers``` argument to true in the ScrollyTeller constructor. |
 | **h2Text** | Optional larger text at the top of each narration block. If unspecified, no ```<h2>``` text is added to the narration block |
 | **paragraphText** | Optional paragraph text below the h2Text in each narration block. If unspecified, no ```<p>``` text is added to the narration block |
 | **hRef** | Optional link for each narration block. If either **hRef** or **hRefText** is unspecified, no ```<a>``` link is added to the narration block |
 | **trigger** | Optional user customizable field to help trigger actions. Can be a number or string describing an action, data name, etc. See examples below fo usage. |


* override ```parseData()``` to parse your data.  See `SectionExample.js` for an example of how to implement this using [d3.promise](https://github.com/kristw/d3.promise).
```javascript
  /** This method is invoked IN PARALLEL with the narration and graph scroll construction,
   *  but before buildChart() is invoked and can be overridden to build chart data before
   *  creating the chart
   */
  async parseData() {
    // await Promise.resolve(...);
  }
```

* override ```buildChart()``` to build your chart
```javascript
  /** This method is invoked AFTER the narration and graph scroll components have constructed,
   *  and must be overridden to create the chart with id = this.chartId()
   */
  buildChart() {
    const chartId = `#${this.graphId()}`;
    const myChartDiv = select(chartId);
    // build chart from here...
  }
```

* override ```onActivateNarration()``` to respond to the triggers that were set in your .csv file.  ```onActivateNarration()``` is triggered every time a narration section hits the top of your screen.  You can use the spacer heights in the .csv file to customize when each narration item is triggered.
```javascript
  /** Triggered when a narration section hits the top of the page and becomes active
   *  Override this method in sub-classes to handle navigation triggers, and use the
   *   properties on the activeDOMElement to handle which data to trigger your graph changes
   *  @param index - index of the narration group in this.graphScroll.sections()
   *  @param activeDOMElement - the currently active narration DOM element */
  onActivateNarration(index, activeDOMElement) {
    const activeTriggerName = activeDOMElement.getAttribute('trigger');
    const myNarrationClass = activeDOMElement.className;
    const myNarrationId = activeDOMElement.id;

    /** you can also access other 'sections' or narration blocks via this.graphScroll.sections() */
    const previousIndex = index - 1 < 0 ? 0 : index;
    const previousNarrationElement = this.graphScroll.sections().nodes()[previousIndex];
  }
```
* override ```onScroll()``` to get progress of the local  when scrolling occurs. Progress is is a floating point number between 0-1 that increases as the narration block is scrolled up and out of the page.
```javascript
  /** Triggered upon scrolling
   *  Override this method in sub-classes to handle scroll events and use the
   *   properties on the activeDOMElement to handle which data to trigger your graph changes
   *  @param index - index of the narration group in graphScroll().sections()
   *  @param progress - a number between 0-1, 0 when the active narration block has just hit the top
   *        of the page, 1 when the whole block has been scrolled through
   *  @param activeDOMElement - the currently active narration DOM element */
  onScroll(index, progress, activeDomElement) {
    /** use trigger specified in the narration csv file to trigger actions */
    switch (activeDomElement.getAttribute('trigger')) {
      case 'unhide':
        /** set graph opacity based on progress to fade graph in */
        select(`#${this.graphId()}`).style('opacity', progress - 0.05);
        break;
      case 'hide':
        /** set graph opacity based on progress to fade graph out */
        select(`#${this.graphId()}`).style('opacity', 0.9 - progress);
        break;
      default:
        select(`#${this.graphId()}`).style('opacity', 1);
    }
  }
```
* Optionally override the CSS for your chart if ```useDefaultGraphCSS``` is set to false in the constructor. See ```SectionExample.js``` and ```scrolly-graph-example.scss``` for an example.

### Method Documentation
#### TODO...




