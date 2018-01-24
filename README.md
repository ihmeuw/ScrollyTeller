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
| **Graph** | A ```<div>``` element to hold a user defined graph, chart, or any other graphic to be triggered.  The graph is entirely user controlled. |
| **GraphScroll** | The underlying JavaScript library used to control the triggering of actions when each narration block comes into view. ScrollyTeller uses a modified version of GraphScroll under the hood to provide extra functionality. |

#### Building a scrolling data story using ScrollyTeller
* ScrollyTeller has only one method: a constructor that takes a configuration object with the following shape:
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
```

#### Each section in the ```{ sectionList }``` object should have a key value that is its ```sectionIdentifier```, and a value object with the following properties:

* Here's an example of a section configuration that gets added to ```myScrollyTellerConfig```
```javascript
const myAppId = 'myAppId';
const myExampleSection0Name = 'myExampleSection0';
const myExampleSection0 = {
    appContainerId: myAppId,
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
      function onScroll(index, progress, activeNarrationBlock, graphId, sectionConfig) {
      },

    onActivateNarrationFunction: 
      function onActivateNarration(index, progress, activeNarrationBlock, graphId, sectionConfig) {
      },
    showSpacers: true,
    useDefaultGraphCSS: false,
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
* The section properties tell ScrollyTeller where to fetch any narration and data from.  The section configuration is also where the user can implement functions that will process the data, build a graph/chart instance for the section, and respond to scrolling and narration actions when each narration block is activated.  A summary of each of the properties is described in the table below.

| Section Property | Property function |
| :---: | :---: |
| ```sectionIdentifier``` | Unique identifier to distinguish each section. No two ```sectionIdentifier```'s should be the same in the ScrollyTeller configuration object  |
| ```cssNames``` | **Optional**: instance of ```ScrollyTellerNames``` class.  Can be used to override the default naming of id's and css classes. If left undefined, the default naming will be used. |
| ```narration``` | Defines the scrolling narration of the story. The narration can be either of the following 3 options: 1) a URL string with the absolute file path to a file of type  'csv', 'tsv', 'json', 'html', 'txt', 'xml', 2) an array of narration objects, or 3) a promise to return an array of narration objects.  SEE DOCUMENTATION BELOW FOR SPECIFICATION OF THE NARRATION TABLE / ARRAY |
| ```data``` | **Optional**: user defined data.  Data can be either of the following 4 options: 1) a URL string with the absolute file path to a file of type  'csv', 'tsv', 'json', 'html', 'txt', 'xml', 2) an array of narration objects, 3) a promise to return an array of narration objects, or  4) undefined |
| ```reshapeDataFunction``` | **Optional**: Called AFTER data is fetched as ```reshapeDataFunction(data)```  This method can be used to filter or reshape data after the datahas been fetched or parsed from a file. It should return the reshaped data, which will overwrite the ```data``` proprerty for this section. |
| ```buildGraphFunction``` | **Optional**: called as ```buildGraphFunction(graphId, sectionConfig)``` AFTER the data is fetched and reshaped by ```reshapeDataFunction```.  This method should build an instance of the graph and return that instance, which will be stored as a property on this section configuration object within ScrollyTeller.  The ```sectionConfig``` object will be passed as an arguments to the onScrollFunction and onActivateNarration functions for later access to the ```data``` and ```graph``` properties. |
| ```onActivateNarration``` | Called when a narration block hits the top of the page, causing it to become active (and classed as ```graph-scroll-active```. See argument list below, this function is called as ```onActivateNarrationFunction(index, progress, activeNarrationBlock, graphId, sectionConfig)```, and can be used to handle scrolling actions.  |
| ```onScrollFunction``` |  Called upon scrolling of the section when the section is active. See argument list below, this function is called as ```onScrollFunction(index, progress, activeNarrationBlock, graphId, sectionConfig)```, and can be used to handle data loading, or graph show-hide actions for a given narration block. |
| ```showSpacers``` | Boolean. Set to true to show spacers in the web page for debugging purposes |
| ```useDefaultGraphCSS``` | Boolean. Set to false to specify your own graph css, where the graph class name is "graph_section_```sectionIdentifier```" |

* Finally, pass the configuration to the ScrollyTeller constructor.  The configuration will be validated, and will throw errors if the configuration is not valid.
```javascript
const myScrollyTellerInstance = new ScrollyTeller(myScrollyTellerConfig);
```

* See: ```app/01_example_section_simple/SimpleSection.js``` and ```app/99_example_section_chart/ExampleChartSection.js``` for fully implemented examples that handle scrolling and narration actions.

#### Narration file/object format
* If you are using a csv or tsv file, format your narration file as follows, keeping the header column names EXACTLY alike (they can be in any order).  If narration objects are json, each narration block should have a property named in the same manner as the Column Headers below.  Each **row** represents a unique **narration block**.

| narrationId | spaceAboveInVh | spaceBelowInVh | h2Text | paragraphText | hRef | hRefText | trigger |
| :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| 0 | 40 | 40 | Some text that will be formatted as ```<h2>``` | Some text that will be formatted as ```<p>``` |www.link.com|I'm a link to link.com|show_chart
| 1 | 40 | 40 |More Narration...|Here's why this chart is important!|||show_data_1

 Here's a description of what each column header controls:

| Column Header/Property Name | Effect |
| :---: | :---: |
| **narrationId** | Appended to the id field of each narration block as "narration_ + ```narrationId```". Can be non unique. Provided mainly as a means of distinguishing narration blocks easily. |
| **spaceAboveInVh** | Specifies the size of a hidden spacer ***above*** any text in each narration block. Units are in viewport height ***vh***. Spacers can be shown by setting the ```showSpacers``` argument to true in the ScrollyTeller constructor. |
| **spaceBelowInVh** | Specifies the size of a hidden spacer ***below*** any text in each narration block. Units are in viewport height ***vh***. Spacers can be shown by setting the ```showSpacers``` argument to true in the ScrollyTeller constructor. |
| **h2Text** | Optional larger text at the top of each narration block. If unspecified, no ```<h2>``` text is added to the narration block |
| **paragraphText** | Optional paragraph text below the h2Text in each narration block. If unspecified, no ```<p>``` text is added to the narration block |
| **hRef** | Optional link for each narration block. If either **hRef** or **hRefText** is unspecified, no ```<a>``` link is added to the narration block |
| **trigger** | Optional user customizable field to help trigger actions. Can be a number or string describing an action, data name, etc. See examples below fo usage. |

### Method Documentation
#### TODO...




