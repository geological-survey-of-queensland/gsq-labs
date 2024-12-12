function graphQuery(query)
{
  
    console.log("Query: " + JSON.stringify(query));
    //this is the receiving function that queries the current global graph object, it uses the parameters in the query object to 

    // If query.removeCurrentFromStorage is true, then clear the local storage value using the URL's view_id query parameter value.
    // If there is no view_id query parameter, then remove the default view 'graph-3d-net-01'.
    if (query.removeCurrentFromStorage === true) {
        let params = new URLSearchParams(location.search);
        let removeView = params.get('view_id') || "graph-3d-net-01";
        localStorage.removeItem(removeView);
    }

    var graph = JSON.parse(JSON.stringify(globalGraphData));
    //the code to filter the graph object based on the query object is here:
    
    //check for persited node filtering on relations. 
    //filter nodes
    if(query.includeNodes.length > 0)
    {
        graph.nodes = graph.nodes.filter(node => query.includeNodes.includes(node.id));
        //console.log("Included Nodes: " + JSON.stringify(graph.nodes));   
    }
    //filter on node properties
    //console.log('Query:',JSON.stringify(query));
    if (query.includeNodeProperties && query.includeNodeProperties.length > 0) {
        graph.nodes = graph.nodes.filter(node => matchesPropertyFilter(node.properties, query.includeNodeProperties));
        //console.log("Included Node Properties: " + JSON.stringify(graph.nodes));
      }
    alert('pause');
    if(query.excludeNodes.length > 0)
    {
        graph.nodes = graph.nodes.filter(node => !query.excludeNodes.includes(node.id));
        //console.log("Excluded Nodes: " + JSON.stringify(graph.nodes));
    }
    if(query.minNodeCount > 0)
    {
        graph.nodes = graph.nodes.filter(node => node.count >= query.minNodeCount);
        //console.log("Min Node Count: " + JSON.stringify(graph.nodes));
    }
    //based on the color section from   queryObject.selectNodeColor = document.getElementById('selectNodeColor').value; set the color of the nodes
    if(query.selectNodeColor !== "")
    {
        graph.nodes.forEach(node => node.color = query.selectNodeColor);
    } 

    //build relation graph

    // Check if the relationDepth property of the query object is greater than 0
    if (query.relationDepth > 0) {
        // Create a new Set object to include the nodes in the current graph object
        let allowedNodes = new Set(graph.nodes.map(node => node.id));
        // Loop through the relationDepth number of times
        for (let i = 0; i < query.relationDepth; i++) {
            // Create an empty array to store new nodes
            let newNodes = [];
            // Loop through each link in the graph's links array
            //console.log('graph links: ', JSON.stringify(graph.links));
            graph.links.forEach(link => {
                // If the source of the link is in the allowedNodes set, add the target to the newNodes array
                if (allowedNodes.has(link.source)) {
                    newNodes.push(link.target);
                }
                // If the target of the link is in the allowedNodes set, add the source to the newNodes array
                if (allowedNodes.has(link.target)) {
                    newNodes.push(link.source);
                }
            });
            //console.log('new nodes: ', JSON.stringify(newNodes));
            // Add each node in the newNodes array to the allowedNodes set
            newNodes.forEach(node => allowedNodes.add(node));
            //console.log('allowed nodes: ', allowedNodes);
        }
        // Filter the graph's nodes array to only include nodes that are in the allowedNodes set
        // log globalGraphData
        // Create a set of the IDs of the existing nodes in graph.nodes
        let existingNodeIds = new Set(graph.nodes.map(node => node.id));

        // Filter globalGraphData.nodes to only include nodes that are in allowedNodes and not in existingNodeIds
        let additionalNodes = globalGraphData.nodes.filter(node => allowedNodes.has(node.id) && !existingNodeIds.has(node.id));

        // Append the new nodes to graph.nodes
        graph.nodes = graph.nodes.concat(additionalNodes);

        // Update existingNodeIds with the IDs of the new nodes
        additionalNodes.forEach(node => existingNodeIds.add(node.id));
        //console.log("related Nodes: " + JSON.stringify(graph.nodes));
    }

    //filter edges
    if(query.includeEdges.length > 0)
    {
        graph.links = graph.links.filter(link => query.includeEdges.includes(link.description));
        //console.log("Included Edges: " + JSON.stringify(graph.links));  
    }
    if(query.excludeEdges.length > 0)
    {
        graph.links = graph.links.filter(link => !query.excludeEdges.includes(link.description));
        //console.log("Excluded Edges: " + JSON.stringify(graph.links));
    }
    if(query.minEdgeCount > 0)
    {
        graph.links = graph.links.filter(link => link.count >= query.minEdgeCount);
        //console.log("Min Edge Count: " + JSON.stringify(graph.links));
    }
    //TODO filter edge properties
 
    //reapply node exlusion if needed
    if(query.excludeNodes.length > 0 && query.applyExclusionToAll === true)
    {
        graph.nodes = graph.nodes.filter(node => !query.excludeNodes.includes(node.id));
        //console.log("Excluded Nodes: " + JSON.stringify(graph.nodes));
    }
    //now the list must get a bit of clean up based on the rule below:
    //There cannot exist a link that has a source or target node that is not in the nodes list
    //so we need to remove any links that have a source or target that is not in the nodes list
    let nodeIds = graph.nodes.map(node => node.id);
    graph.links = graph.links.filter(link => nodeIds.includes(link.source) && nodeIds.includes(link.target));


    //store the filtered graph object to local storage
    localStorage.setItem(query.view, JSON.stringify(graph));

    //reload the page with the query.view value as the view_id query parameter value
    window.location.href = window.location.origin + window.location.pathname + "?view_id=" + query.view;
}
//helper functions
function matchesPropertyFilter(properties, filters) {
    //console.log('Starting property match check:');

    // Validate the properties object
    if (!properties || typeof properties !== 'object' || Object.keys(properties).length === 0) {
        //console.log('Properties object is invalid or empty:', properties);
        return false;
    }

    //console.log('Node/Edge properties:', JSON.stringify(properties));
    //console.log('Filters to match:', JSON.stringify(filters));

    // Iterate over each filter object in the array
    for (const filter of filters) {
        //console.log('Checking filter group:', JSON.stringify(filter));

        // Assume all key-value pairs in this filter object must match (AND logic)
        let allConditionsMatch = true;

        for (const [key, value] of Object.entries(filter)) {
            //console.log(`Checking if property '${key}' contains value '${value}'...`);

            // Ensure the property key exists in the properties
            if (!properties.hasOwnProperty(key)) {
                //console.log(`Property '${key}' not found in properties object.`);
                allConditionsMatch = false;
                break;
            }

            const propertyValue = properties[key];

            // Ensure the property value is a string and compare it with the filter value
            if (typeof propertyValue !== 'string') {
                //console.log(`Property '${key}' is not a string. Filter does not match.`);
                allConditionsMatch = false;
                break;
            }

            // Check if the property's value matches the filter's value
            const propertyValues = propertyValue.split(',').map(v => v.trim());
            //console.log(`Property '${key}' values present:`, propertyValues);

            if (!propertyValues.includes(value.trim())) {
                //console.log(`Value '${value}' not found in property '${key}'.`);
                allConditionsMatch = false;
                break;
            }

            //console.log(`Condition '${key}=${value}' matches.`);
        }

        // If all key-value pairs in this filter object matched, return true (OR logic)
        if (allConditionsMatch) {
            //console.log('Filter group matched successfully. Returning true.');
            return true;
        }
    }

    //console.log('No filter groups matched. Returning false.');
    return false;
}