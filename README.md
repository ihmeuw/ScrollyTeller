# ScrollyTeller
----------------------------------------------------------------------------------------------------------------------------------
### Using ScrollyTeller to dynamically build story narration
##### ScrollyTeller is a JavaScript library that dynamically builds the HTML/CSS for the ***narration*** part of a scrolling based data story from a .csv file, and provides functionality for linking named 'triggers' to actions dispatched when each narration comes into view.
----------------------------------------------------------------------------------------------------------------------------------
#### Use cases and functionality
* Separation of stories into multiple sections with different graphs and narrations.
* Separation of story sections allows multiple developers to work on different sections of a data story without interfering with one another.
* Customizing story narration to an audience: user-specific narration.csv files can tell a story differently based on audience, using the same rendering code, with different actions based on a user's area of interest or expertise.
* Changing the spacing between narration text, or the 'pacing' of a data story.
----------------------------------------------------------------------------------------------------------------------------------
### Terminology
| Term | Description |
| :---: | :---: |
| **Narration** | The scrolling text content that 'narrates' a data story. |
| **Narration Block** | A group of text, links, and spacers contained in a ```<div>```. Actions can be triggered when each narration block comes into view. |
| **Narration Block Contents** | Each narration block contains: ```<h2>``` text (title), ```<p>``` text (subtitle), and an ```<a href=...>``` (link) with some text.  For convenience, each narration block also contains **spacers** whose height is customizeable to control the pacing of the story. |
| **Section** | A group of narration blocks with a corresponding **graph** element. A story can be one or multiple sections. |
| **Graph** | A ```<div>``` element to hold a user defined graph, chart, or any other graphic to be triggered.  The graph is entirely user controlled. |
| **Scrollama** | The underlying JavaScript library used to control the triggering of actions when each narration block comes into view. |

----------------------------------------------------------------------------------------------------------------------------------
### Building a scrolling data story using ScrollyTeller
##### ScrollyTeller contains two methods: a constructor method ```ScrollyTeller(config)``` that takes a configuration object, and a ```render()``` method that returns a Promise to build all HTML. The pseudo code below shows how a to create a ```ScrollyTeller``` instance from a configuration object, and then render the HTML.  The configuration object is described in much more detail below.
```javascript
const myAppId = 'myAppId';
const myScrollyTellerConfig = {
  /** The id of the <div> that will hold this and all other sections */
  appContainerId: myAppId,
  /** build a list of story sections, keyed by sectionIdentifier.
   * Each section object should be a valid section configuration with
   * the properties defined in the next section */
  sectionList: {
    myExampleSection0: {
      /** ... section properties described below */
    },
    myExampleSection1: {
      /** ... section properties described below */
    },
    myExampleSection2: {
      /** ... section properties described below */
    },
  },
};

/** create the ScrollyTeller object to validate the config */
const myScrollyTellerInstance = new ScrollyTeller(myScrollyTellerConfig);

/** parse data and build all HMTL */
myScrollyTellerInstance.render();
```

##### Each section in the ```{ sectionList }``` object should have a key value that is its ```sectionIdentifier```, and a value object with the properties listed in the table below

* The section properties tell ScrollyTeller where to fetch any narration and data from.  The section configuration is also where the user can implement functions that will process the data, build a graph/chart instance for the section, and respond to scrolling and narration actions when each narration block is activated.  A summary of each of the properties is described in the table below.

| Section Property | Property function |
| :---: | :---: |
| ```sectionIdentifier``` | Unique identifier to distinguish each section. No two ```sectionIdentifier```'s should be the same in the ScrollyTeller configuration object  |
| ```cssNames``` | **Optional**: instance of ```CSSNames``` class.  Can be used to override the default naming of id's and css classes. If left undefined, the default naming will be used. |
| ```narration``` | Defines the scrolling narration of the story. The narration can be either of the following 3 options: 1) a URL string with the absolute file path to a file of type  'csv', 'tsv', 'json', 'html', 'txt', 'xml', 2) an array of narration objects, or 3) a promise to return an array of narration objects.  SEE DOCUMENTATION BELOW FOR SPECIFICATION OF THE NARRATION TABLE / ARRAY |
| ```data``` | **Optional**: user defined data.  Data can be either of the following 4 options: 1) a URL string with the absolute file path to a file of type  'csv', 'tsv', 'json', 'html', 'txt', 'xml', 2) an array of data objects, 3) a promise to return an array of data objects, or  4) undefined |
| ```reshapeDataFunction``` | **Optional**: Called AFTER data is fetched as ```reshapeDataFunction(data)```  This method can be used to filter or reshape data after the datahas been fetched or parsed from a file. It should return the reshaped data, which will overwrite the ```data``` proprerty for this section. |
| ```buildGraphFunction``` | **Optional**: called as ```buildGraphFunction(graphId, sectionConfig)``` AFTER the data is fetched and reshaped by ```reshapeDataFunction```.  This method should build an instance of the graph and return that instance, which will be stored as a property on this section configuration object within ScrollyTeller.  The ```sectionConfig``` object will be passed as an arguments to the onScrollFunction and onActivateNarration functions for later access to the ```data``` and ```graph``` properties. |
| ```onActivateNarration``` | Called when a narration block hits the top of the page, causing it to become active (and classed as ```graph-scroll-active```. See argument list below, this function is called as ```onActivateNarrationFunction({ index, progress, element, graphId, sectionConfig, trigger })```, and can be used to handle scrolling actions.  |
| ```onScrollFunction``` |  Called upon scrolling of the section when the section is active. See argument list below, this function is called as ```onScrollFunction({ index, progress, element, graphId, sectionConfig, trigger })```, and can be used to handle data loading, or graph show-hide actions for a given narration block. |
| ```onResizeFunction``` |  Called upon resize of the graph container ```onResizeFunction({ graphElement, graphId, sectionConfig })```, and can be used to resize the chart appropriately when the container is resized. |
| ```showSpacers``` | **Optional** Boolean. Set to true if undefined. Set to true to show spacers in the web page for debugging purposes, or false to hide spacers in production. |

##### Here's an example of a section configuration that gets added to ```myScrollyTellerConfig```
```javascript
const myAppId = 'myAppId';
const myExampleSection0Name = 'myExampleSection0';
const myExampleSection0 = {
    sectionIdentifier: myExampleSection0Name,
    narration: 'app/99_example_section_chart/data/narrationSectionChart.csv',
    data: 'app/99_example_section_chart/data/dataBySeries.csv',
    reshapeDataFunction:
      function processDataFunction(data) { return data; },

    buildGraphFunction:
      function buildChart(graphId, sectionConfig) {
        const myChart = {}; // build your own chart instance
        return myChart; // return it
      },

    onScrollFunction:
      function onScroll({ index, progress, element, trigger, direction, graphId, sectionConfig }) {
      },

    onActivateNarrationFunction: 
      function onActivateNarration({ index, progress, element, trigger, direction, graphId, sectionConfig }) {
      },
      
    onResizeFunction: 
      function onResize({ graphElement, graphId, sectionConfig }) {
        sectionConfig.graph.resize(graphElement.offsetWidth, graphElement.offsetHeight);
      },
    showSpacers: true,
  };
 
/** Now add the section configuration to the overall ScrollyTeller config */
const myScrollyTellerConfig = {
  appContainerId: myAppId,
  sectionList: {
    [myExampleSection0Name]: myExampleSection0,
    /** add another section here... */
  }, 
};
```

##### Finally, pass the configuration to the ScrollyTeller constructor.  The configuration will be validated, and will throw errors if the configuration is not valid.
```javascript
/** create the ScrollyTeller object to validate the config */
const myScrollyTellerInstance = new ScrollyTeller(myScrollyTellerConfig);

/** parse data and build all HMTL (here we're throwing away the result of the Promise, and just calling the method) */
myScrollyTellerInstance.render();
```

##### See ```app/app.js``` for fully implemented examples that handle scrolling and narration actions. Section configurations are created in ```app/01_example_section_simple/SimpleSection.js``` and ```app/99_example_section_chart/ExampleChartSection.js```.


----------------------------------------------------------------------------------------------------------------------------------
### Narration file/object format
##### If you are using a csv or tsv file, format your narration file as follows, keeping the header column names EXACTLY alike (they can be in any order).  If narration objects are json, each narration block should have a property named in the same manner as the Column Headers below.  Each **row** represents a unique **narration block**.

| narrationId | spaceAboveInVh | spaceBelowInVh | minHeightInVh | h2Text | paragraphText | hRef | hRefText | trigger |
| :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| 0 | 40 | 40 | 100 | Some text that will be formatted as ```<h2>``` | Some text that will be formatted as ```<p>``` | www.link.com | I'm a link to link.com | show_chart
| 1 | 40 | 40 | 200 | More Narration... | Here's why this chart is important!| | | show_data_1

 Here's a description of what each column header controls:

| Column Header/Property Name | Effect |
| :---: | :---: |
| **narrationId** | Appended to the id field of each narration block as "narration_ + ```narrationId```". Can be non unique. Provided mainly as a means of distinguishing narration blocks easily. |
| **spaceAboveInVh** | Specifies the size of a hidden spacer ***above*** any text in each narration block. Units are in viewport height ***vh***. Spacers can be shown by setting the ```showSpacers``` argument to true in the ScrollyTeller constructor. |
| **spaceBelowInVh** | Specifies the size of a hidden spacer ***below*** any text in each narration block. Units are in viewport height ***vh***. Spacers can be shown by setting the ```showSpacers``` argument to true in the ScrollyTeller constructor. |
| **h2Text** | **Optional** larger text at the top of each narration block. If unspecified, no ```<h2>``` text is added to the narration block |
| **paragraphText** | **Optional** paragraph text below the h2Text in each narration block. If unspecified, no ```<p>``` text is added to the narration block |
| **hRef** & **hRefText** | **Optional** link for each narration block. If either **hRef** or **hRefText** is unspecified, no ```<a>``` link is added to the narration block |
| **trigger** | **Optional** user customizable field to help trigger actions. Can be a number or string describing an action, data name, etc. CANNOT have spaces. See examples below for usage. |

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
  /** using d3promise to convert d3.csv calls to promises */
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
 * @param {string} [params.trigger] - the trigger attribute for narration block that is currently active
 * @param {string} [params.direction] - the direction the event happened in (up or down)
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
* Called when scrolling occurs within a section that is visible in the window. The example below fades the graph in and out using triggers ('unhide', 'hide', 'opacityzero') specified in the narration file.
```javascript
/**
 * Called upon scrolling of the section
 * @param {object} [params] - object containing parameters
 * @param {number} [params.index] - index of the active narration object
 * @param {number} [params.progress] - 0-1 (sort of) value indicating progress through the active narration block
 * @param {HTMLElement} [params.element] - the narration block DOM element that is currently active
 * @param {string} [params.trigger] - the trigger attribute for narration block that is currently active
 * @param {string} [params.direction] - the direction the event happened in (up or down)
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
function onScrollFunction({ index, progress, element, trigger, direction, graphId, sectionConfig }) {
  const myGraphDiv = select(`#${graphId}`);
  /** use trigger specified in the narration csv file to trigger actions */
  switch (trigger) {
    case 'unhide':
      /** set graph opacity based on progress to fade graph in */
      myGraphDiv.style('opacity', progress);
      break;
    case 'hide':
      /** set graph opacity based on progress to fade graph out */
      myGraphDiv.style('opacity', 1 - progress);
      break;
    case 'opacityzero':
      /** set opacity to zero (after fadeout */
      myGraphDiv.style('opacity', 0);
      break;
    default:
      myGraphDiv.style('opacity', 1);
  }
}
```

#### ```onResizeFunction```
* Called when the graph container is resized.
```javascript
/**
 * Called when the graph container is resized 
 * @param {object} [params] - object containing parameters
 * @param {number} [params.index] - index of the active narration object
 * @param {number} [params.progress] - 0-1 (sort of) value indicating progress through the active narration block
 * @param {HTMLElement} [params.element] - the narration block DOM element that is currently active
 * @param {string} [params.trigger] - the trigger attribute for narration block that is currently active
 * @param {string} [params.direction] - the direction the event happened in (up or down)
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
function onResizeFunction({  graphElement, graphId, sectionConfig }) {
  sectionConfig.graph.resize(
    {
      width: graphElement.offsetWidth * 0.95,
      height: graphElement.offsetHeight * 0.95,
    }
  );
}
```
