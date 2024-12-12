# Custom JS Documentation

## Contents

1. ttl-converter.js
2. json-graph-query.js
3. graph-compiled.js

### Disclaimer
This documentation is provided without warranty and should be read 'as is'. There may be circumstances where this documentation may not accurately depict the current codebase. Please see the disclaimer for further information - [https://www.qld.gov.au/legal/disclaimer](https://www.qld.gov.au/legal/disclaimer).

## **ttl-converter.js** 

## convertJsonToGraph3dV1

The `convertJsonToGraph3dV1` function contained within `ttl-converter.js` is responsible for converting JSON-LD formatted data into a format suitable for graph visualization using a 3D force graph library. This conversion allows the JSON-LD structured data to be visually represented as nodes and links within the graph.

### Function Overview

- Input: The function receives a `data` parameter, which is a JSON object in JSON-LD format.
- Output: Returns a JSON string representation of a graphing model with two properties: `nodes` and `links`, each an array of objects formatted for 3D graph visualization.

### Color Wheel Setup

- A color wheel array (`complimentaryColors`) defines a set of predefined colors used to visually differentiate nodes in the graph.

### Default Configuration Objects

- Two default configuration objects are defined:
  - `defaultConfig.nodes`: Default properties for graph nodes, including labels, groupings, and visual properties.
  - `defaultConfig.links`: Default properties for the links (edges) between nodes, including the source, target, and visual properties.

### Process Overview

1. **Initialization**: A `builtModel` object starts as a clone of an empty `graphingModel` containing empty `nodes` and `links` arrays.
2. **Validation**: The function checks if the `data` object contains the required `@graph` and `@context` properties.
3. **Node Building**:
   - Iterates through each element in `data["@graph"]` and creates `nodeBit` configured with properties from `defaultConfig.nodes`.
   - Sets the node identifier (`id`) using `extractFullUri`, which constructs the full URI from a compact URI (CURIE) format found in JSON-LD.
   - Assigns groupings, descriptions, and detailed information for the node, based on certain properties or relationship types found within the data.
   - Optionally sets node colors from `sdo:color` values or assigns from the predefined `complimentaryColors` based on groupings.
   - Generates a color grouping for nodes without predefined colors, cycling through the color wheel.
   - Appends each constructed node object to `builtModel["nodes"]`.

4. **Link Building**:
   - Iterates through `data["@graph"]` again to create `linkBit` configured with properties from `defaultConfig.links`.
   - Sets the source for the link and initiates link description generation.
   - Iterates through keys of the current graph object, generating target and descriptions based on the URI full term extraction.
   - Filters out nodes based on the ignore list (`globalGraphConfig.ignoreNodesById`) and skips unusable sources.
   - Appends each constructed link object to `builtModel["links"]` after verifying existing endpoints.
   - Optionally removes isolated nodes if specified in the configuration (`globalGraphConfig.removeIsolatedNodes`).

5. **Data Return**: Returns a JSON string representing the fully built graph model to be consumed by the graph visualization library.

### Helper Functions

- `extractFullUri`: Converts compact URIs (CURIEs) into full URIs by referencing the provided `@context`.
- `checkIgnoreList`: Checks whether a given URI should be ignored based on global ignore configurations.
- `getDetailedInfo`: Retrieves detailed information for a node, based on an ordered list of preferred keys, from the data.

### Configuration Management

- Global configuration (`globalGraphConfig`) plays a key role in determining aspects of the conversion, such as color usage, label visibility, and element exclusion.

### Remarks

- The function is designed to operate with a JSON-LD formatted input that follows a certain structure and set of assumptions about node and link properties.
- Consideration for different ontologies and vocabularies is mentioned in the comments, suggesting the function could be adapted for broader compatibility.

### Usage

To use this function within the HTML file, it is assumed that the user provides a valid JSON-LD formatted input. The output should be directed to a visualization library

## **json-graph-query.js**

## graphQuery

The `graphQuery` function is a critical part of the visual graph display utility, enabling the querying and manipulation of the visualized graph based on various parameters. It filters nodes and links (edges) according to inclusion and exclusion criteria, node and edge counts, and other configurable aspects to create custom views or apply transformations on the graph data.

### Function Overview

- Input: Receives a `query` object that contains a set of filtering and configuration parameters.
- Output: Modifies the global graph model according to the query parameters and saves the updated model to the browser's local storage. Optionally reloads the page with the new graph model active.

### Query Object Structure

The `query` object may include the following properties:
- `removeCurrentFromStorage`: A flag that indicates whether to remove the current graph view from local storage.
- `includeNodes`: An array of node IDs to include.
- `includeNodeProperties`: An array of key-value pairs representing node properties to include.
- `excludeNodes`: An array of node IDs to exclude.
- `minNodeCount`: The minimum count a node must have to be included.
- `selectNodeColor`: A color value to apply to all nodes.
- `relationDepth`: The depth to which related nodes should be included.
- `includeEdges`: An array of edge descriptions to include.
- `excludeEdges`: An array of edge descriptions to exclude.
- `minEdgeCount`: The minimum count an edge must have to be included.
- `applyExclusionToAll`: A flag that indicates whether to apply node exclusions after the graph has been built up to a particular relation depth.
- `view`: A identifier for the view to be used when storing the modified graph data.

### Function Execution Flow

1. **Initialization**: 
   - Displays the query parameters in the console.
   - Conditionally removes the current view from local storage based on `query.removeCurrentFromStorage`.

2. **Graph Cloning**: 
   - Creates a deep copy of the global graph model.

3. **Node Inclusion Criteria**: 
   - Filters `graph.nodes` to include only nodes specified in `query.includeNodes`.

4. **Node Property Filtering**: 
   - Further filters nodes based on specified node property filters in `query.includeNodeProperties`.

5. **Node Exclusion Criteria**: 
   - Filters `graph.nodes` to exclude nodes specified in `query.excludeNodes`.

6. **Minimum Node Count Filtering**: 
   - Filters nodes based on the minimum node count (`query.minNodeCount`).

7. **Node Color Application**: 
   - Sets the color of all nodes to the specified color (`query.selectNodeColor`).

8. **Relationship Depth Handling**: 
   - If `query.relationDepth` is greater than 0, constructs a relation graph that includes related nodes up to the specified relation depth.

9. **Edge Inclusion Criteria**: 
   - Filters `graph.links` to include only edges specified in `query.includeEdges`.

10. **Edge Exclusion Criteria**: 
    - Filters `graph.links` to exclude edges specified in `query.excludeEdges`.

11. **Minimum Edge Count Filtering**: 
    - Filters edges based on the minimum edge count (`query.minEdgeCount`).

12. **Reapplication of Node Exclusions**: 
    - If `query.applyExclusionToAll` is set, reapplies node exclusions to remove any nodes becoming isolated after relation depth expansion.

13. **Link Validity Check**: 
    - Ensures that no link remains in `graph.links` with a source or target that is not listed in `graph.nodes`.

14. **Persistent Storage**: 
    - Saves the filtered graph to local storage using the provided view identifier (`query.view`).

15. **Page Reload**: 
    - Optional page reload with `query.view` passed as the URL `view_id` query parameter.
    
### Helper Functions

- `matchesPropertyFilter(properties, filters)`: 
    - Checks if the properties of a node or edge match a set of provided filter criteria. Uses AND logic to match each key-value pair within a filter object and OR logic across multiple filter objects. This function provides the logic to determine whether to include nodes based on their properties.

### Implementation Details

The function operates on a deep-cloned version of the global graph data to avoid mutating the global state directly. It uses the JavaScript `Set` object for efficient filtering of nodes through inclusion and relation depth handling. Additionally, it utilizes the `localStorage` API to store the updated graph model for persistence across page reloads.

### Usage

The `graphQuery` function is typically called in response to a user action, such as submitting a form that specifies the desired filtering criteria. It's designed to be a flexible tool for creating and persisting custom views of the graph data based on varying analysis needs, exploration, or presentation purposes.

## **graph-compiled.js**

## Overview

The JavaScript described here provides a set of functions and utilities that configure and initialize the visualization of graph data using the `react-force-graph` library. This info outlines the technical details of these functions, their roles in setting up the visualization, and how they interact with configuration variables.

### Key Functions and Features

- Babel Helpers: A series of utility functions such as `_typeof`, `_defineProperty`, `_toPrimitive`, and more are used to provide polyfill support and manipulate objects and properties in a backward-compatible manner.
- Renderer Setup: Utilizes the `CSS2DRenderer` from the external `CSS2DRenderer.js` library to create an additional rendering context alongside the primary WebGL context typically used by `react-force-graph-3D`.
- Automatic Data Fetching: Calls `fetchAndStoreJsonData()` function to retrieve and parse JSON graph data from local storage.
- Main Rendering Block: Conditions check if JSON data is present and if rendering is permitted by configuration settings. If so, the `ForceGraph3D` React component is rendered with a set of properties defined by processing global configuration settings.

### Configuration and Initialization

The visualization can be configured by passing a set of properties to the `ForceGraph3D` component. These properties control various aesthetic and physical aspects of the graph, such as colors, sizes, forces, and interactions. 

- `extraRenderers`: An array that defines additional renderers to layer over the primary WebGL renderer.
- `graphData`: The actual graph data to be visualized, usually fetched from local storage.
- Callbacks for various user interactions, such as `onNodeClick`.
- Visual configurations like `backgroundColor` and `nodeRelSize`.
- D3 force simulation settings that affect the physical behaviors of nodes and links.
- Custom `nodeThreeObject` and `linkThreeObject` functions to extend graph elements with custom graphics.
- Particle and arrow settings for links to create directional effects.
- Dynamically updating link label positions using `linkPositionUpdate`.

### Rendering Process

The graph rendering logic within an `if` block checks against `skipRender` to determine if it should proceed with visualization. This check allows for the graph rendering process to be bypassed based on global configuration flags, such as `globalGraphConfig.dontRenderGraph`.

If rendering proceeds:

- The `ForceGraph3D` component is called with the aforementioned properties to visualize the graph inside the specified page element.
- Node and link representations are customized using `nodeThreeObject` and `linkThreeObject` functions, where a `SpriteText` object may be used to display labels for visual elements.
- Link positioning is continuously updated through `linkPositionUpdate`, ensuring that additional graphics like labels follow the links' geometry during animation.

### Error Handling

The else blocks provide error feedback, alerting users to missed rendering due to settings or informing that JSON data is not found in the browser's local storage.

### Integration with `react-force-graph`

The script is designed with respect to the available features and settings exposed by the `react-force-graph` library. The library provides the base components and a variety of options for tweaking the visualization of the graph data.

For comprehensive instructions on individual settings and properties referenced in this script, users should consult the `react-force-graph` documentation available on the official GitHub repository: https://github.com/vasturiano/react-force-graph

### Usage

This script is designed for users familiar with JavaScript, React component properties, and the `ForceGraph3D` library. It is assumed that users will be editing this script to fit their specific visualization needs, such as changing the layout, physical properties, and aesthetics of the graph visualization.
