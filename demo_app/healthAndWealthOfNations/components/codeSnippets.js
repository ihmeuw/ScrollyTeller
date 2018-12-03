
export default {
  scrollyTellerConfig: `
    const myScrollyTellerConfig = {
      /** The id of the div that will contain all of the scrolling content */
      appContainerId: 'app',
      /** a list of story section configurations, keyed by unique sectionIdentifier. */
      sectionList: {
        /** [unique sectionIdentifier]: { section config object } */
        wealthAndHealth: wealthAndHealthConfig, // {object} containing data, graph, etc
      },
    };

    /** create the ScrollyTeller object to validate the config */
    const storyInstance = new ScrollyTeller(myScrollyTellerConfig);

    /** parse data and build all HMTL */
    storyInstance.render();
  `,
  sectionConfigSummary: `
  const wealthAndHealthConfig = { // Section Config object
    // STATIC PROPS 
    sectionIdentifier: 'healthAndWealth',  // unique identifier (string)
    narration: 'path/to/narration.csv',  // can be promise, array, or path to file
    data: 'path/to/wealthAndHealthData.json',  // can be promise, array, or path to file
    
    // INITIAL RENDER FUNCTIONS, called upon ScrollyTeller.render()
    reshapeDataFunction: function () {},
    buildGraphFunction: function () {},

    // EVENT BASED FUNCTIONS
    onActivateNarrationFunction: function () {},
    onScrollFunction: function () {},
    onResizeFunction: function () { },
    
  }; // end Section Config object
  `,
  sectionConfigReshapeData: `
  const wealthAndHealthConfig = { // Section Config object
    data: 'path/to/datafile.json', // can be promise, array, or path to file
    
    // 1) Called after data is fetched to do any pre-processing
    reshapeDataFunction: function (results) {
      // ... do some processing
      return data; // return an object or array
    },
  }; // end Section Config object
  `,
  sectionConfigReshapeDemoData: `
  const wealthAndHealthConfig = { // Section Config object
    data: 'path/to/datafile.json', // can be promise, array, or path to file
    
    // 1) Called after data is fetched to do any pre-processing
    reshapeDataFunction: function (results) {
      /** compute data domains for income (x), life expectancy (y), and years */
      const xDomain = computeXDomain(results); // min, max of all income [300, 100000]
      const yDomain = computeYDomain(results); // min, max of life expectancy [30, 80]
      const yearDomain = computeYearDomain(results); // min, max of years [1950, 2008]

      /** return the raw data (dataArray) and domains as an object */
      return {
        dataArray: results,
        xDomain,
        yDomain,
        yearDomain,
      };
    },
  }; // end Section Config object
  `,
  sectionConfigBuildGraph: `
  const wealthAndHealthConfig = { // Section Config object
    // 2) Called after reshapeDataFunction()
    buildGraphFunction: function (graphId, sectionConfig) {
      /** destructure the data computed by reshapeDataFunction() from the sectionConfig */
      const {
        data: { dataArray, // ... domains, other props, etc },
      } = sectionConfig;

      /** build the graph using a custom component: WealthAndHealthOfNations */
      const graph = new WealthAndHealthOfNations({
        container: '#' + graphId, // css selector for svg component '#graph_healthAndWealth'
        data: dataArray, // pass data to the component
        // ... pass domains, other rendering props, etc
      });
      
      /** REMEMBER TO RETURN THE GRAPH! */
      return graph;
    },
  }; // end Section Config object
  `,
};
