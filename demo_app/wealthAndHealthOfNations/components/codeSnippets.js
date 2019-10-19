
export default {
  scrollyTellerConfig: `
    const intro = { /* ... section configuration... */ };
    const wealthAndHealth = { /* ...section configuration ... */ };
 
    const story = { // story configuration
      appContainerId: 'app', // div id="app"
      
      // section configurations
      sectionList: {
        intro, // section configuration object
        wealthAndHealth, // section configuration object
      },
    };

    const storyInstance = new ScrollyTeller(story);

    storyInstance.render(); // fetch data and build HMTL`,
  sectionConfigSummary: `
  const wealthAndHealth = { // Section Config object
    sectionIdentifier: 'wealthAndHealth',
    
    // 1) DATA PATHS/PROMISES 
    narration: 'path/to/narration.csv',
    data: 'path/to/wealthAndHealthData.json',
    
    // 2) FIRST RENDER
    reshapeDataFunction: function (data) {},
    buildGraphFunction: function (graphId, { data }) {},

    // 3) ON USER EVENTS
    onActivateNarrationFunction: function () {},
    onScrollFunction: function () {},
    onResizeFunction: function () {},
    
  }; // end Section Config object`,
  sectionConfigFlow: `
  const wealthAndHealth = { // Section Config
    // on storyInstance.render()...
    narration: 'path/to/narration.csv',
    /* after fetching narration... 
          &#8600
                ScrollyTeller renders narration as HTML */
                
    data: 'path/to/wealthAndHealthData.json',
    /* after fetching data... 
                &#8600  raw data is passed to   */
    reshapeDataFunction: function (rawData) {
        /* process rawData */
        return data;
    }, /*  &#8600 reshaped data is passed to   */
    buildGraphFunction: function (graphId, { data }) {
        /* select graphId, build graph, render graph  */
        return graph;
    }, /*
                    &#8600  returned graph instance is stored in
                          &#8600 sectionConfig: { data, graph }
                                    ... and is passed to event handlers */
    onActivateNarrationFunction: function ({ data, graph }) {},
    onScrollFunction: function ({ data, graph }) {},
    onResizeFunction: function ({ data, graph }) {},
  };`,
  sectionConfigReshapeData: `
  const wealthAndHealth = { // Section Config
    data: 'path/to/datafile.json', // can be promise, array, or path to file
    reshapeDataFunction: function (rawData) {
    // 1) Called after data is fetched to do any pre-processing
      // ... do some processing rawData -> data
      return data; // return an object or array
    },
  }; // end Section Config object`,
  sectionConfigReshapeDemoData: `
  const wealthAndHealth = { // Section Config object
    data: 'path/to/datafile.json',  /*
          &#8600                         */
    reshapeDataFunction: function (rawData) {
      /** compute data domains for income (x), life expectancy (y), and years */
      const xDomain = computeXDomain(rawData); // min, max of all income [300, 100000]
      const yDomain = computeYDomain(rawData); // min, max of life expectancy [30, 80]
      const yearDomain = computeYearDomain(rawData); // min, max of years [1950, 2008]

      /** sectionConfig.data in subsequent functions */
      return {
        dataArray: rawData,
        xDomain,
        yDomain,
        yearDomain,
      };
    },
  }; // end Section Config object`,
  sectionConfigBuildGraph: `
  const wealthAndHealth = { // Section Config
    // 2) Called after reshapeDataFunction()
    buildGraphFunction: function (graphId, sectionConfig) {
      /** destructure the data computed by reshapeDataFunction() from the sectionConfig */
      const {
        data: { dataArray, /* domains, other props, etc */ },
      } = sectionConfig;

      /** build the graph using a custom component: WealthAndHealthOfNations */
      const graph = new WealthAndHealthOfNations({
        container: '#' + graphId, // css selector for svg component '#graph_wealthAndHealth'
        data: dataArray, // pass data to the component
        // ... pass domains, other rendering props, etc
      });
      
      /** sectionConfig.graph in subsequent functions */
      return graph;
    },
  }; // end Section Config object`,
};
