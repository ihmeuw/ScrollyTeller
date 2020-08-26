# ScrollyTeller

### ScrollyTeller is a JavaScript library that dynamically builds the HTML for a scrolling data story from a .csv file, and provides functionality for linking stateful JSON ***triggers*** to events dispatched when each scrolling text 'narration' comes into view.

<img src="https://github.com/ihmeuw/ScrollyTeller/blob/master/dist/images/slide5.png" width="700" alt="ScrollyTeller image"/>


<h3>Check out the <a href="https://ihmeuw.github.io/ScrollyTeller/" target="_blank">ScrollyTeller tutorial</a>, then come back for code examples and the full documentation on this page.</h3>

----------------------------------------------------------------------------------------------------------------------------------
#### Use cases and functionality
* Separation of stories into multiple sections with different graphs and narrations.
* Separation of story sections allows multiple developers to work on different sections of a data story without interfering with one another.
* Customizing story narration to an audience: user-specific narration.csv files can tell a story differently based on audience, using the same rendering code, with different actions based on a user's area of interest or expertise.
* Changing the spacing between narration text, or the 'pacing' of a data story.

#### Data stories that have used ScrollyTeller
* [How can mapping can save children's lives?](https://vizhub.healthdata.org/child-mortality)
* [Assessment of tobacco control measures in Mexico](https://vizhub.healthdata.org/tobacco-control/)
* [Following the Money: exploring country-to-country donations](https://ryshackleton.github.io/swd-aid-data/index.html)

## Documentation

### Terminology
| Term | Description |
| :---: | :---: |
| **Narration** | The scrolling text content that 'narrates' a data story. |
| **Narration Block** | A group of text and links, contained in a ```<div>```. Actions can be triggered when each narration block comes into view. |
| **Narration Block Contents** | Each narration block contains: ```<h2>``` text (title), ```<p>``` text (subtitle), and an ```<a href=...>``` (link) with some text.  The height of each narration block can also be controlled to change the pacing of the story. |
| **Section** | A group of narration blocks with a corresponding **graph** element. A story can be one or multiple sections. |
| **Graph Container** | A ```<div>``` element to hold a title, caption, and a graph, chart, or any other graphic to be triggered. |
| **Graph** | A ```<div>``` element to hold a user defined graph, chart, or any other graphic to be triggered.  The graph is entirely user controlled. |
| **[Scrollama](https://github.com/russellgoldenberg/scrollama)** | The underlying JavaScript library used to control the triggering of actions when each narration block comes into view. |

----------------------------------------------------------------------------------------------------------------------------------
### Building a scrolling data story using ScrollyTeller
##### A `ScrollyTeller` object is created with the constructor `ScrollyTeller`, which takes a configuration object as argument. To actually set up the story, including loading data, building the HTML, and setting up event listeners, call the asynchronous method `render`. The pseudo code below shows how a to create a `ScrollyTeller` instance from a configuration object and then render the HTML. The configuration object is described in much more detail below.
```javascript
const myAppId = 'myAppId';
const storyConfiguration = {
  /** The id of the <div> that will hold this and all other sections */
  appContainerId: myAppId,
  /** build an array of story sections.
   * Each section object should be a valid section configuration with
   * the properties defined in the next section */
  sectionList: [ 
    {
      sectionIdentifier: 'myExampleSection0',
      /** ... section properties described below */
    },
    {
      sectionIdentifier: 'myExampleSection1',
      /** ... section properties described below */
    },
    {
      sectionIdentifier: 'myExampleSection3',
      /** ... section properties described below */
    ],
    /** optional function to receive the current sectionIdentifier,
     * narrationIndex, narrationId, and narrationClass
     * when narration blocks are entered */
    onNarrationChangedFunction: function ({
      sectionIdentifier,
      narrationIndex,
      narrationId,
      narrationClass,
    }) { console.log('in ', sectionIdentifier, narrationIndex); },
    /** optional parameter to scale scroll elements on mobile devices
        to create slower scrolling */
    mobileScrollHeightMultiplier: 1.5,
  },
};

/** create the ScrollyTeller object to validate the config */
const myScrollyTellerInstance = new ScrollyTeller(storyConfiguration);

/** parse data and build all HMTL */
myScrollyTellerInstance.render();
```

##### Each section in the ```sectionList``` array must have a unique property ```sectionIdentifier``` as well as the properties listed in the table below

* The section properties tell ScrollyTeller where to fetch any narration and data from.  The section configuration is also where the user can implement functions that will process the data, build a graph/chart instance for the section, and respond to scrolling and narration actions when each narration block is activated.  A summary of each of the properties is described in the table below.

| Section Property | Property function |
| :---: | :---: |
| ```sectionIdentifier``` | Unique identifier to distinguish each section. No two ```sectionIdentifier```'s should be the same in the ScrollyTeller configuration object  |
| ```cssNames``` | **Optional**: instance of ```CSSNames``` class.  Can be used to override the default naming of id's and css classes. If left undefined, the default naming will be used. |
| ```narration``` | Defines the scrolling narration of the story. The narration can be either of the following 3 options: 1) a URL string with the absolute file path to a file of type  'csv', 'tsv', 'json', 'html', 'txt', 'xml', 2) an array of narration objects, or 3) a promise to return an array of narration objects.  SEE DOCUMENTATION BELOW FOR SPECIFICATION OF THE NARRATION TABLE / ARRAY |
| ```data``` | **Optional**: user defined data.  Data can be either of the following 4 options: 1) a URL string with the absolute file path to a file of type  'csv', 'tsv', 'json', 'html', 'txt', 'xml', 2) an array of data objects, 3) a promise to return an array of data objects, or  4) undefined |
| ```reshapeDataFunction``` | **Optional**: Called AFTER data is fetched as ```reshapeDataFunction(data)```  This method can be used to filter or reshape data after the datahas been fetched or parsed from a file. It should return the reshaped data, which will overwrite the ```data``` proprerty for this section. |
| ```buildGraphFunction``` | **Optional**: called as ```buildGraphFunction(graphId, sectionConfig)``` AFTER the data is fetched and reshaped by ```reshapeDataFunction```.  This method should build an instance of the graph and return that instance, which will be stored as a property on this section configuration object within ScrollyTeller.  The ```sectionConfig``` object will be passed as an arguments to the onScrollFunction and onActivateNarration functions for later access to the ```data``` and ```graph``` properties. |
| ```onActivateNarration``` | Called when a narration block hits the top of the page, causing it to become active (and classed as ```graph-scroll-active```. See argument list below, this function is called as ```onActivateNarrationFunction({ index, progress, element, graphContainerId, graphId, sectionConfig, trigger })```, and can be used to handle scrolling actions.  |
| ```onScrollFunction``` |  Called upon scrolling of the section when the section is active. See argument list below, this function is called as ```onScrollFunction({ index, progress, element, graphContainerId, graphId, sectionConfig, trigger })```, and can be used to handle data loading, or graph show-hide actions for a given narration block. |
| ```onResizeFunction``` |  Called upon resize of the graph container ```onResizeFunction({ graphElement, graphId, sectionConfig })```, and can be used to resize the chart appropriately when the container is resized. |
| ```convertTriggerToObject``` | **Optional**: Option to parse the JSON trigger for narration steps to an object and update the state object, default is true.  |


##### Here's an example of a section configuration that gets added to ```storyConfiguration```
```javascript
const myAppId = 'myAppId';
const myExampleSection0Name = 'myExampleSection0';
const myExampleSection0 = {
    sectionIdentifier: myExampleSection0Name,
    narration: 'demo_app/exampleSection0/data/narrationSectionChart.csv',
    data: 'demo_app/exampleSection0/data/dataBySeries.csv',
    reshapeDataFunction:
      function processDataFunction(data) { return data; },

    buildGraphFunction:
      function buildChart(graphId, sectionConfig) {
        const myChart = {}; // build your own chart instance
        return myChart; // return it
      },

    onScrollFunction:
      function onScroll({ index, progress, element, trigger, graphContainerId, graphId, sectionConfig }) {
      },

    onActivateNarrationFunction:
      function onActivateNarration({ index, progress, element, trigger, direction, graphContainerId, graphId, sectionConfig }) {
      },

    onResizeFunction:
      function onResize({ graphElement, graphId, graphContainerId, sectionConfig }) {
        sectionConfig.graph.resize(graphElement.offsetWidth, graphElement.offsetHeight);
      },
  };

/** Now add the section configuration to the overall ScrollyTeller config */
const storyConfiguration = {
  appContainerId: myAppId,
  sectionList: [ 
    myExampleSection0,
    /** add another section here... */
  ],
};
```

##### Finally, pass the configuration to the ScrollyTeller constructor.  The configuration will be validated, and will throw errors if the configuration is not valid.
```javascript
/** create the ScrollyTeller object to validate the config */
const myScrollyTellerInstance = new ScrollyTeller(storyConfiguration);

/** parse data and build all HMTL (here we're throwing away the result of the Promise, and just calling the method) */
myScrollyTellerInstance.render();
```

##### See ```demo_app/app.js``` for fully implemented examples that handle scrolling and narration actions. Section configurations are created in ```demo_app/00_introduction/scrollyTellerConfig.js``` and ```demo_app/01_wealthAndHealthOfNations/scrollyTellerConfig.js```.


----------------------------------------------------------------------------------------------------------------------------------
### Narration file/object format

<h4>See <a href="https://docs.google.com/spreadsheets/d/1yoShwSc7yruaveFeWAhHFUc3kqW8lelmMFQu7qc75aA/edit?usp=sharing" target="_blank">this google spreadsheet</a> for a sample configuration file, which is the same file as: demo_app/00_introduction/data/narration.csv</h4>

##### If you are using a csv or tsv file, format your narration file as follows, keeping the header column names EXACTLY alike (they can be in any order).  If narration objects are json, each narration block should have a property named in the same manner as the Column Headers below.  Each **row** represents a unique **narration block**.

| narrationId | narrationClass | marginTopVh | marginBottomVh | minHeightVh | h2Text | paragraphText | hRef | hRefText | trigger | graphTitle | graphCaption |
| :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: |  :---: |
| 0 | myClass | 40 | 40 | 100 | Some text that will be formatted as ```<h2>``` | Some text that will be formatted as ```<p>``` | www.link.com | I'm a link to link.com | <pre>{ show_chart: true }</pre> | This is a Graph Title | This is a graph caption
| 1 | myOtherClass | 40 | 40 | 200 | More Narration... | Here's why this chart is important!| | | <pre>{ show_data_1: true }</pre> | This is a Graph Title | This is a graph caption

 Here's a description of what each column header controls:

| Column Header/Property Name | Effect |
| :---: | :---: |
| **narrationId** | Appended to the id field of each narration block as "narration_ + ```narrationId```". Can be non unique. Provided mainly as a means of distinguishing narration blocks easily. |
| **narrationClass** | Appended to the class name of each narration block. Can be non unique. |
| **marginTopVh** | Specifies the size of the margin ***above*** any text in each narration block. Units are in viewport height **vh**, but are converted to pixels **px** upon load or resize to avoid issues with mobile browsers using a reduced view height. |
| **marginBottomVh** | Specifies the size the margin ***below*** any text in each narration block.  Units are in viewport height **vh**, but are converted to pixels **px** upon load or resize to avoid issues with mobile browsers using a reduced view height.  |
| **minHeightVh** | Specifies the minimum height of the narration block. Units are in viewport height **vh**, but are converted to pixels **px** upon load or resize to avoid issues with mobile browsers using a reduced view height. |
| **h2Text** | **Optional** larger text at the top of each narration block. If unspecified, no ```<h2>``` text is added to the narration block |
| **paragraphText** | **Optional** paragraph text below the h2Text in each narration block. If unspecified, no ```<p>``` text is added to the narration block |
| **hRef** & **hRefText** | **Optional** link for each narration block. If either **hRef** or **hRefText** is unspecified, no ```<a>``` link is added to the narration block |
| **trigger** | **Optional** user customizable JSON to help trigger actions such as chart visiblity, styles, data ranges, etc. Must be a valid JSON string with the optional keyword `$progress` that refers to scroll progress within the current narration block. Invalid JSON strings are indicated by console warnings.  |
| **graphTitle** | **Optional**  User customizable graph title that is placed in the ```<div class=graph_container>``` container.  |
| **graphCaption** | **Optional**  User customizable graph caption that is placed in the ```<div class=graph_container>``` container.  |

----------------------------------------------------------------------------------------------------------------------------------
### Auto-scrolling to a specific section or narration block
The method `scrollTo` on the `ScrollyTeller` object allows you to auto-scroll to a specific section or narration block. It disabled triggers during scrolling, only firing triggers for the target section or narration block. This functionality can be useful for hooking up with navigation controls. Note that this method is asynchronous, so if you need to script any actions following the scroll, you should await resolution of the Promise it returns.

```javascript
/**
 * @param {string|number} sectionIdentifier - `sectionIdentifier` of the target section
 * @param {string|number|undefined} [narrationIdStringOrNumericIndex]
 *  - optional: if undefined, defaults to the first narration block of target section
 *              if number, argument is treated as the index of the narration block to scroll to
 *              if string, argument is treated as the `narrationId` of the target narration block
 * @param {object} [options] - optional: configuration object passed to `scrollIntoView`
 *              (https://github.com/KoryNunn/scroll-into-view)
 * @returns {Promise<void>} - returns empty promise
 */
async scrollTo(sectionIdentifier, narrationIdStringOrNumericIndex, options) { ... }
```
----------------------------------------------------------------------------------------------------------------------------------
### Auto-scrolling to the previous/next narration block
The methods `scrollToPreviousNarration/scrollToNextNarration` on the `ScrollyTeller` object allows you to auto-scroll to the previous/next narration blocks.  ScrollyTeller automatically adds event listeners to scroll to the previous narration block with keyboard events `<ArrowUp>` and `<ArrowLeft>`, and to the next narration block with keyboard events `<Space>`, `<ArrowDown>`, and `<ArrowRight>`, but the asynchronous functions could be used for custom navigation functionality as well.

```javascript
/**
 * Scrolls "up" to the previous narration block in the story
 * @return {Promise<void>} - returns empty promise
 */
async scrollToPreviousNarration() { ... }

/**
 * Scrolls "down" to the next narration block in the story
 * @return {Promise<void>} - returns empty promise
 */
async scrollToNextNarration() { ... }
```


### Tracking Scroll Progress using Google Analytics

ScrollyTeller can automatically send google analytics events when sections or narration blocks are entered, and when the `scrollTo()` function is called.  To enable these features, add the following booleans to the ScrollyTeller configuration object.

ScrollyTeller *requires that the `ga()` function from google's `analytics.js` be in the global scope with valid credentials.*  See [these instructions for how to set up google analytics](https://developers.google.com/analytics/devguides/collection/analyticsjs/). In the future, we hope to support the new `gtag.js` library in addition to `analytics.js`.

```javascript
const myScrollyTellerConfig = {
  appContainerId: 'myAppId',
  /** section list */
  sectionList: [ /** ... see above for section list properties */ ],
  
  /** optional google analytics properties */
  sendSectionAnalytics: true, // send analytics events when a section is entered or exited
  sendNarrationAnalytics: true, // send analytics events when each narration block is entered or exited
  sendScrollToAnalytics: true, // send analytics events when scrollTo() is called
  maxTimeInSeconds: 60, // optionally cap the maximum amount of time that can be sent to google (think of this as the maximum user "idle" time
};

// call render methods...
```

Page Events that ScrollyTeller can send are:

| ScrollyTeller config flag (sends events when true) | EventCategory | EventAction | EventLabel | EventValue |
| :---: | :---: | :---: | :---: | :---: |
| sendSectionAnalytics | Time in Narration (seconds) | [sectionIndex]--[sectionIdentifier] | Exited [sectionIdentifier], narration #[exitingNarrationIndex] after (EventValue) seconds | [seconds a user spent in section] |
| sendSectionAnalytics | Section Entry Time (seconds since page load) | [sectionIndex]--[sectionIdentifier] | Entered section [enteringSectionId] (EventValue) seconds since page load | [seconds since page load section was entered] |
| sendNarrationAnalytics | Time in Narration (seconds) | [sectionIndex]--[sectionIdentifier]--[narrationIndex] | Exited [section], narration #[exitingNarrationIndex] after (EventValue) seconds | [seconds a user spent in a given narration block] |
| sendNarrationAnalytics | Narration Entry Time (seconds since page load) | [sectionIndex]--[sectionIdentifier]--[narrationIndex] | Entered narration #[enteringNarrationIndex] (EventValue) seconds since page load | [seconds since page load narration block was entered] |
| sendScrollToAnalytics | Scroll From-To (SectionIndex---SectionId---NarrationIndex) | From [from section]--[narration index of exit] | To [to section]--[narration index of entry] | [seconds since page load that scrollTo() occurred] |
| sendScrollToAnalytics | Scroll To-From (SectionIndex---SectionId---NarrationIndex) | To [to section]--[narration index of entry] | From [from section]--[narration index of exit] | [seconds since page load that scrollTo() occurred] |

All of the times are reported as PageEvents in seconds, and can be given an upper bound by specifying `maxTimeInSeconds`, which defaults to `Infinity`. 

----------------------------------------------------------------------------------------------------------------------------------
### Sample implementations of ```reshapeDataFunction()```, ```buildGraphFunction()```, ```onActivateNavigationFunction()```, and ```onScrollFunction()```
#### ```reshapeDataFunction()```
* (uses lodash toNumber() and groupBy() functions to manipulate data)
* Notice that the function returns a new "grouped" data set, which is stored in the ```sectionConfig``` object and passed as an argument to ```onScrollFunction``` and ```onActivateNavigationFunction``` below, where it is accessed as ```sectionConfig.data```.
```javascript
/**
 * Optional method to reshape the data passed into ScrollyTeller, or resolved by the data promise
 * @param {data} results - data passed into ScrollyTeller or the result of resolving a data promise
 * @returns {object|array} - an object or array of data of user-defined shape
 */
function reshapeDataFunction(results) {
  /** using d3 to convert d3.csv calls to promises */
  const parseTime = timeParse('%y');
  /** parse results and convert dates to years, close to number */
  const dataProcessed = results.map((datum) => {
    return {
      series: datum.series,
      date: parseTime(datum.date),
      close: toNumber(datum.close),
    };
  });
  /** set data to the results array and handle some date and number conversion */
  return groupBy(dataProcessed, 'series');
}
```


#### ```buildGraphFunction()```
* uses an imported SampleChart to build the chart element.  An imported class ```SampleChart``` selects the ```<div>``` element to build the graph (chart) by using d3 to select ```#graphId```
* Notice that the function returns the chart instance, which is stored in the ```sectionConfig``` object and passed as an argument to ```onScrollFunction``` and ```onActivateNavigationFunction``` below, where it is accessed as ```sectionConfig.graph```
```javascript
/**
 * Called AFTER data is fetched, and reshapeDataFunction is called.  This method should
 * build the graph and return an instance of that graph, which will be passed as arguments
 * to the onScrollFunction and onActivateNarration functions
 * @param {string} graphId - id of the graph in this section. const myGraph = d3.select(`#${graphId}`);
 * @param {object} sectionConfig - the configuration object passed to ScrollyTeller
 * @param {string} [sectionConfig.sectionIdentifier] - the identifier for this section
 * @param {object} [sectionConfig.graph] - the chart instance, or a reference containing the result of the buildChart() function above
 * @param {object} [sectionConfig.data] - the data that was passed in or resolved by the promise and processed by reshapeDataFunction()
 * @param {object} [sectionConfig.scroller] - the scrollama object that handles activation of narration, etc
 * @param {object} [sectionConfig.cssNames] - the CSSNames object containing some useful functions for getting the css identifiers of narrations, graph, and the section
 * @param {object} [params.sectionConfig.elementResizeDetector] - the element-resize-detector object: see https://github.com/wnr/element-resize-detector for usage
 * @returns {object} - chart instance
 */
function buildGraphFunction(graphId, sectionConfig) {
  const graph = new SampleChart({
    container: `#${graphId}`,
  });
  return graph;
}
```


#### ```onActivateNarrationFunction()```
* This is called when a narration block is activated by hitting the top of the page. See below for how to access different properties from the sectionConfig object and other function parameters
```javascript
/**
 * Called when a narration block is activated
 * @param {object} [params] - object containing parameters
 * @param {number} [params.index] - index of the active narration object
 * @param {number} [params.progress] - 0-1 (sort of) value indicating progress through the active narration block
 * @param {HTMLElement} [params.element] - the narration block DOM element that is currently active
 * @param {string|object} [params.trigger] - the trigger attribute for narration block that is currently active. Optionally converted to an object based on the value set for `convertTriggerToObject` in section config.
 * @param {object} [params.state] - the full state of all narration blocks before and including the active one. Not computed if the value for `convertTriggerToObject` in section config is set to false.
 * @param {string} [params.direction] - the direction the event happened in (up or down)
 * @param {string} [params.graphContainerId] - id of the graph container in this section. const graphContainer = d3.select(`#${graphContainerId}`);
 * @param {string} [params.graphId] - id of the graph in this section. const myGraph = d3.select(`#${graphId}`);
 * @param {object} [params.sectionConfig] - the configuration object passed to ScrollyTeller
 * @param {string} [params.sectionConfig.sectionIdentifier] - the identifier for this section
 * @param {object} [params.sectionConfig.graph] - the chart instance, or a reference containing the result of the buildChart() function above
 * @param {object} [params.sectionConfig.data] - the data that was passed in or resolved by the promise and processed by reshapeDataFunction()
 * @param {object} [params.sectionConfig.scroller] - the scrollama object that handles activation of narration, etc
 * @param {object} [params.sectionConfig.cssNames] - the CSSNames object containing some useful functions for getting the css identifiers of narrations, graph, and the section
 * @param {object} [params.sectionConfig.elementResizeDetector] - the element-resize-detector object: see https://github.com/wnr/element-resize-detector for usage
 * @returns {void}
 */
function onActivateNarrationFunction({ index, progress, element, trigger, direction, graphId, sectionConfig }) {
  /** data and graph instances */
  const myGraph = sectionConfig.graph;
  const myData = sectionConfig.data;

  /** retrieving properties from the active narration DOM element */
  const { className: activeNarrationClass, id: activeNarrationId } = element;

  /** retrieving the expected css naming conventions in the HTML built by ScrollyTeller */
  const {
    cssNames,
    sectionIdentifier,
    appContainerId // the id of the container <div> that holds all sections
  } = sectionConfig

  const mySectionId = cssNames.sectionId(sectionIdentifier);
  const mySectionClass = cssNames.sectionClass();
  const globalNarrationClass = cssNames.narrationClass();
  const myGraphClass = cssNames.graphClass(sectionIdentifier);
  /** same as the graphId function argument */
  const myGraphId = cssNames.graphId(sectionIdentifier);
}
```

#### ```onScrollFunction```
* Called when scrolling occurs within a section that is visible in the window.  Receives a current progress representing the progress through the existing narration.  The example below takes a range of data and interpolates a current x value based on progress. 
```javascript
/**
 * Called upon scrolling of the section
 * @param {object} [params] - object containing parameters
 * @param {number} [params.index] - index of the active narration object
 * @param {number} [params.progress] - 0-1 (sort of) value indicating progress through the active narration block
 * @param {HTMLElement} [params.element] - the narration block DOM element that is currently active
 * @param {string|object} [params.trigger] - the trigger attribute for narration block that is currently active. Optionally converted to an object based on the value set for `convertTriggerToObject` in section config.
 * @param {object} [params.state] - the full state of all narration blocks before and including the active one. Not computed if the value for `convertTriggerToObject` in section config is set to false.
 * @param {string} [params.graphContainerId] - id of the graph container in this section. const graphContainer = d3.select(`#${graphContainerId}`);
 * @param {string} [params.graphId] - id of the graph in this section. const myGraph = d3.select(`#${graphId}`);
 * @param {object} [params.sectionConfig] - the configuration object passed to ScrollyTeller
 * @param {string} [params.sectionConfig.sectionIdentifier] - the identifier for this section
 * @param {object} [params.sectionConfig.graph] - the chart instance, or a reference containing the result of the buildChart() function above
 * @param {object} [params.sectionConfig.data] - the data that was passed in or resolved by the promise and processed by reshapeDataFunction()
 * @param {object} [params.sectionConfig.scroller] - the scrollama object that handles activation of narration, etc
 * @param {object} [params.sectionConfig.cssNames] - the CSSNames object containing some useful functions for getting the css identifiers of narrations, graph, and the section
 * @param {object} [params.sectionConfig.elementResizeDetector] - the element-resize-detector object: see https://github.com/wnr/element-resize-detector for usage
 * @returns {void}
 */
function onScrollFunction({ index, progress, element, trigger, graphContainerId, graphId, sectionConfig, state }) {
  /** user sets state in the csv file as JSON trigger:
    {
      xStart: 1,
      xEnd: 500
    }
  */
  if (state.xStart && state.xEnd) {
      const currentX = Math.ceil((state.xEnd - state.xStart) * progress);
      console.log('Current x is: ', currentX);
  }
}
```

#### ```onResizeFunction```
* Called when the graph container (graph_container div, not the graph itself) is resized.
```javascript
/**
 * Called when the graph container is resized
 * @param {object} [params] - object containing parameters
 * @param {number} [params.index] - index of the active narration object
 * @param {number} [params.progress] - 0-1 (sort of) value indicating progress through the active narration block
 * @param {HTMLElement} [params.element] - the narration block DOM element that is currently active
 * @param {string} [params.trigger] - the trigger attribute for narration block that is currently active
 * @param {string} [params.direction] - the direction the event happened in (up or down)
 * @param {string} [params.graphContainerId] - id of the graph container in this section. const graphContainer = d3.select(`#${graphContainerId}`);
 * @param {string} [params.graphId] - id of the graph in this section. const myGraph = d3.select(`#${graphId}`);
 * @param {object} [params.sectionConfig] - the configuration object passed to ScrollyTeller
 * @param {string} [params.sectionConfig.sectionIdentifier] - the identifier for this section
 * @param {object} [params.sectionConfig.graph] - the chart instance, or a reference containing the result of the buildChart() function above
 * @param {object} [params.sectionConfig.data] - the data that was passed in or resolved by the promise and processed by reshapeDataFunction()
 * @param {object} [params.sectionConfig.scroller] - the scrollama object that handles activation of narration, etc
 * @param {object} [params.sectionConfig.cssNames] - the CSSNames object containing some useful functions for getting the css identifiers of narrations, graph, and the section
 * @param {object} [params.sectionConfig.elementResizeDetector] - the element-resize-detector object: see https://github.com/wnr/element-resize-detector for usage
 * @returns {void}
 */
function onResizeFunction({  graphElement, graphContainerId, graphId, sectionConfig }) {
  sectionConfig.graph.resize(
    {
      width: graphElement.offsetWidth * 0.95,
      height: graphElement.offsetHeight * 0.95,
    }
  );
}
```
