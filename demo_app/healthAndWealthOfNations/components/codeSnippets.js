
export default {
  scrollyTellerConfig: `
    const storyConfiguration = {

      appContainerId: 'app', // div id of the story
 
      sectionList: { // story section configurations, keyed by a sectionIdentifier string
      
        wealthAndHealth: { /* ...a section configuration object... */ },
        
        anotherStoryId: { /* ... another section configuration... */ },
      },
    };

    const storyInstance = new ScrollyTeller(storyConfiguration); // validate the config

    storyInstance.render(); // fetch data and build HMTL`,
  sectionConfigSummary: `
  const wealthAndHealthConfig = { // Section Config object
    sectionIdentifier: 'healthAndWealth',  // unique identifier (string)
    
    // 1) DATA PATHS/PROMISES 
    narration: 'path/to/narration.csv',  // can be promise, array, or path to file
    data: 'path/to/wealthAndHealthData.json',  // can be promise, array, or path to file
    
    // 2) FIRST RENDER
    reshapeDataFunction: function (data) {},
    buildGraphFunction: function (graphId, { data }) {},

    // 3) ON USER EVENTS
    onActivateNarrationFunction: function () {},
    onScrollFunction: function () {},
    onResizeFunction: function () {},
    
  }; // end Section Config object`,
  sectionConfigFlow: `
  const wealthAndHealthConfig = {
    // on storyInstance.render()...
    narration: 'path/to/narration.csv',
    /* after fetching narration... 
          &#8600
                ScrollyTeller renders narration as HTML */
               
    data: 'path/to/wealthAndHealthData.json',
    /* after fetching data... 
          &#8600
                &#8600  raw data is passed to reshapeDataFunction 
                      &#8600                                                                                */
    reshapeDataFunction: function (rawData) {
        /* process rawData */
        return data;
    }, /*
              &#8600
                    &#8600 reshaped data is passed to buildGraphFunction
                          &#8600                                                                            */
    buildGraphFunction: function (graphId, { data }) {
        /* select graphId, build graph, render graph */
        return graph;
    }, /*
              &#8600
                    &#8600  returned graph instance is stored in
                          &#8600 sectionConfig: { data, graph }
                                &#8600 
                                    ... and is passed to event handlers when triggered                     */
    onActivateNarrationFunction: function ({ data, graph }) {},
    onScrollFunction: function ({ data, graph }) {},
    onResizeFunction: function ({ data, graph }) {},
  };`,
  sectionConfigReshapeData: `
  const wealthAndHealthConfig = { // Section Config object
    data: 'path/to/datafile.json', // can be promise, array, or path to file
    reshapeDataFunction: function (results) {
    // 1) Called after data is fetched to do any pre-processing
      // ... do some processing
      return data; // return an object or array
    },
  }; // end Section Config object`,
  sectionConfigReshapeDemoData: `
  const wealthAndHealthConfig = { // Section Config object
    data: 'path/to/datafile.json', /* can be promise, array, or path to file
          &#8600
                &#8600                                                          */
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
  }; // end Section Config object`,
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
  }; // end Section Config object`,
};
