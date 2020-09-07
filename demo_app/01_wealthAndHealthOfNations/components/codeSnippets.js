
export default {
  scrollyTellerConfig: `
    const intro = { /* ...configuration... */ };
    const wealthAndHealth = { /* ...configuration ... */ };
 
    const storyConfig = {
      appContainerId: 'app', // div id="app"
      
      sectionList: [ 
        intro, // section configuration
        wealthAndHealth, // section configuration
      ],
    };

    const storyInstance = new ScrollyTeller(storyConfig);

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
    data: 'path/to/datafile.json', // promise, array, or file path 
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
      const xDomain = getXDomain(rawData); // min, max of all income [300, 100000]
      const yDomain = getYDomain(rawData); // min, max of life expectancy [30, 80]
      const yearDomain = getYearDomain(rawData); // min, max of years [1950, 2008]

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
      /** destructure the data from reshapeDataFunction() from the sectionConfig */
      const {
        data: { dataArray, /* domains, other props, etc */ },
      } = sectionConfig;

      /** build the graph */
      const graph = new WealthAndHealthOfNations({
        container: '#' + graphId, // '#graph_wealthAndHealth'
        data: dataArray, // pass data to the component
        // ... pass domains, other rendering props, etc
      });
      
      return graph;
      /** -> sectionConfig.graph in subsequent functions */
    },
  }; // end Section Config object`,
  narrationTableHTML: `
  <table style="width: 100%;">
    <tbody>
    <tr>
      <td></td>
      <td>...</td>
      <td>h2Text</td>
      <td>paragraphText</td>
      <td>hRef</td>
      <td>hRefText</td>
      <td>...</td>
    </tr>
    <tr>
      <td>17</td>
      <td>...</td>
      <td>h2Text -> Title</td>
      <td>paragraphText -> Summary</td>
      <td>http://link.com</td>
      <td>hRefText -> linked text</td>
      <td>...</td>
    </tr>
    <tr>
      <td>18</td>
      <td>...</td>
      <td>Customizing text</td>
      <td>Both &lt;strong&gt;h2Text&lt;/strong&gt; and...</td>
      <td></td>
      <td></td>
      <td>...</td>
    </tr>
  </tbody>
  </table>`,
  narrationTriggerHTML: `
 <table style="width: 100%;">
  <tbody>
  <tr>
    <td></td>
    <td>...</td>
    <td>h2Text</td>
    <td>...</td>
    <td>trigger</td>
    <td>...</td>
  </tr>
  <tr>
    <td>19</td>
    <td>...</td>
    <td>Trigger example: 1950</td>
    <td>...</td>
    <td>  { "year": 1950 }  </td>
    <td>...</td>
  </tr>
  <tr>
    <td>20</td>
    <td>...</td>
    <td>Trigger example: 2008</td>
    <td>...</td>
    <td>  { "year": 2008 }  </td>
    <td>...</td>
  </tr>
</tbody>
</table> 
  `,
  narrationRestHTML: `
  <table style="width: 100%;">
  <tbody>
  <tr>
    <td></td>
    <td>...</td>
    <td>narrationId</td>
    <td>narrationClass</td>
    <td>graphTitle</td>
    <td>graphCaption</td>
    <td>...</td>
  </tr>
  <tr>
    <td>19</td>
    <td>...</td>
    <td>uniqueId</td>
    <td>class-name</td>
    <td>Title</td>
    <td>Oh caption, my caption!</td>
    <td>...</td>
  </tr>
  <tr>
    <td>20</td>
    <td>...</td>
    <td></td>
    <td>class-name</td>
    <td>Title</td>
    <td>Oh caption, my caption!</td>
    <td>...</td>
  </tr>
</tbody>
</table>`,
  narrationSizingHTML: `
  <table style="width: 100%;">
  <tbody>
  <tr>
    <td></td>
    <td>...</td>
    <td>marginTopVh</td>
    <td>marginBottomVh</td>
    <td>minHeightVh</td>
    <td>...</td>
  </tr>
  <tr>
    <td>19</td>
    <td>...</td>
    <td>40</td>
    <td>40</td>
    <td>80</td>
    <td>...</td>
  </tr>
  <tr>
    <td>20</td>
    <td>...</td>
    <td>40</td>
    <td>40</td>
    <td>80</td>
    <td>...</td>
  </tr>
</tbody>
</table>`,
  onActivateNarrationExample: `
  const wealthAndHealth = { // Section Config

    onActivateNarrationFunction: function ({
      // -> sectionConfig.graph:
      //    the return value of buildGraphFunction()
      sectionConfig: { graph },
      
      // -> state = JSON.parse(trigger)
      state: { year },
    }) {
      if (graph && year) {
        graph.render({ year });
      }
    },

  };`,
  onScrollExample: `
  const wealthAndHealth = { // Section Config

    onScrollFunction: function ({
      progress, // <- scroll progress!
      sectionConfig: { graph },
      state: { yearDomain }, // -> [1950, 1999]
    }) {
      if (graph && yearDomain) {
        const interpolateYear = d3.interpolate(
          yearDomain[0], yearDomain[1]
        )(progress);
        const year = Math.floor(interpolateYear);
        graph.render({ year });
      }
    },
    
  };`,
  triggerToStateHTML: `
<table style="width: 100%;">
  <tbody>
  <tr>
    <td></td>
    <td>h2Text</td>
    <td>trigger</td>
    <td>...</td>
    <td>(merged) state</td>
  </tr>
  <tr>
    <td>19</td>
    <td>Narration 0</td>
    <td><pre><code>{ "year": 1950 }</code></pre></td>
    <td>...</td>
    <td><pre><code>{ "year": 1950 }</code></pre></td>
  </tr>
  <tr>
    <td>20</td>
    <td>Narration 1</td>
    <td><pre><code>{ "year": 2008 }</code></pre></td>
    <td>...</td>
    <td><pre><code>{ "year": 2008 }</code></pre></td>
  </tr>
  <tr>
    <td>21</td>
    <td>Narration 2</td>
    <td><pre><code>{ "foo": "bar" }</code></pre></td>
    <td>...</td>
    <td><pre><code>{ "year": 2008, "foo": "bar" }</code></pre></td>
  </tr>
  <tr>
    <td>22</td>
    <td>Narration 3</td>
    <td><pre><code>{ "year": null, foo": null }</code></pre></td>
    <td>...</td>
    <td><pre><code>{ "year": null, "foo": null }</code></pre></td>
  </tr>
</tbody>
</table>
  `,
};
