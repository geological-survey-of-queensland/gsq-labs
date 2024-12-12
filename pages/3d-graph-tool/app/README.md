# 3D Graph Tool

## Disclaimer

This documentation is provided without warranty and should be read 'as is'. There may be circumstances where this documentation may not accurately depict the current codebase. Please see the disclaimer for further information - [https://www.qld.gov.au/legal/disclaimer](https://www.qld.gov.au/legal/disclaimer).

## Description

This utility is a comprehensive web tool designed for visualizing and interacting with graph data. The HTML file contains an embedded JavaScript application that leverages several external libraries to render graph data in 2D or 3D views, allowing users to load, manipulate, and export graph data.

## How It Works

The application is comprised of HTML page with embedded JavaScript and referenced JS (both custom and 3rd party libraries). The custom js files are be described further in the respecitve path: [/js/README.md](./js/README.md). 

## **index.html**

The index.html files structurally contains the following sections:

1. **HTML Head**: Includes the stylesheet and script tags necessary to load external JavaScript libraries and CSS stylesheets.

2. **HTML Body**: Contains buttons that serve as the user interface to interact with the graph data, such as loading, exporting, and graph manipulation features. It also includes containers where the visual graph will be rendered.

3. **JavaScript Blocks**: Define the utility's logic, listening for user interactions and manipulating the graph data accordingly.

4. **Style Tags**: Define additional styles for customizing the appearance of elements.

## Key Functions Descriptions

### Navigation and Modal Functions

- `goHome`: Navigation function that redirects the user to the parent directory.
- `popUpNodeModal`: Function that creates and displays a modal with node-specific information including relationships and node data when a node is clicked.
- `selectFromDropDown`: Displays a modal to select from predefined graph views by modifying the URL query parameters.

### Data Import Functions

- `loadJSON`: Initiates a file input dialogue to load graph data from a JSON file.
- `loadJSONLinkedData`: Initiates a file input dialogue to load graph data from a JSON-LD file.
- `loadTtlFile`: Initiates a file input dialogue to load graph data from a TTL (Turtle) file.

### Data Operation Functions

- `saveJSON`: Exports and saves the current graph data to a JSON file on the client's system.
- `clearLocalStorageAndReload`: Clears the stored graph data from the browser's local storage and reloads the page.
- `fetchAndStoreJsonData`: Fetches graph data from local storage or an external data source and stores it globally within the application.

### Graph Visualization Setting Functions

- `showInstructions`: Displays a modal with information about the tool and its basic functions.
- `popUpSettingsModal`: Displays a modal that allows users to edit settings like node exclusion and graph rendering.
- `popUpQuerySettingsModal`: Displays a modal for defining custom views and configurations for the graph visualization.

## Data Management and Rendering

The utility makes use of the browser's local storage to manage and persist graph data across sessions. When graph data files are imported using the file input mechanism, the data is read from the file, possibly transformed to the required format, and then stored in local storage for subsequent use.

Global variables are employed to store configurations to control aspects of graph rendering, such as ignoring certain nodes or removing isolated nodes. Any changes to these configurations are persisted to local storage for consistency across sessions.

The `onLoadScripts` function ensures that graph data is fetched and stored correctly when the page is loaded, setting up the visualization according to the most recent state.

## External Resources

Scripts and stylesheets included in the utility originate from external libraries:

- React and ReactDOM for efficient UI rendering.
- jQuery for simplified DOM manipulation.
- Bootstrap for responsive design elements and modals.
- `three.js` and `react-force-graph-3d` for 3D graph rendering.
- `ttl2jsonld.js` and `ttl-converter.js` for converting TTL files into JSON-LD, and potentially other intermediate formats necessary for the graph visualization tool.

Each of these libraries has its own documentation and usage guidelines, which should be referred to for more detailed information about their functionalities.

## Usage

Open the `index.html` file in a compatible web browser to start the application.

## Contributing

For contributions and improvements to the utility, please follow the standard GitHub pull request process.

## Issues

Any bugs or issues can be reported through the GitHub Issues section of the repository.

## License

Please review the repository's LICENSE file or the project homepage for details on the licensing of external libraries and this utility itself.