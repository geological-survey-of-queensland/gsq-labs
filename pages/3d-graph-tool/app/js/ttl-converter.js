function convertJsonToGraph3dV1(data)
{
  //create color wheel for setting up the colors
const complimentaryColors = [
  '#33FFA6', '#33FFFF', '#FF33DD', '#FF3366', '#33FFB1', '#33FF33',
  '#5733FF', '#33FF57', '#FF5733', '#FF33A6', '#FF3366', '#FFFF33',
  '#4CFF33', '#33FF90', '#33AAFF', '#FF9033', '#9033FF', '#FF334C',
  '#FF33E9', '#E9FF33', '#33FF21', '#DDFF33', '#33FFD6', '#FF3333',
  '#3333FF', '#33FF33', '#FF33FF', '#33FFB1', '#33FFA6', '#33FFFF'
];
  var colorGroup = {};
  var graphingModel = {"nodes":[],"links":[]}
  var builtModel = Object.assign({}, graphingModel);

  const defaultConfig = {
  "nodes":{
    "id":"not provided",
    "group":"not provided",
    "description":"not provided",
    "detailed_info":"not provided",
    "size":20,
    "visible":true,
    "overrideColor":false,
    "color":"#FF33FF",
    "opacity":0.5,
    "properties":{}
    },
  "links":{
    "source": "not provided", 
    "target": "not provided", 
    "value": 1, 
    "description": "not provided", 
    "thickness":3, 
    "visible":true,
    "overrideColor":false,
    "color":"#33FFFF",
    "particleColor":"#FFFF33",
    "linkLabelVisible":true
    }
   };

//build nodes
//high level explanation : iterate through the graph and build nodes and links
//console.log('display json-ld graph: ',JSON.stringify(data, null, 2));
var i = 0;

if (data["@graph"] === undefined || data["@context"] === undefined)
{
  console.log('failed, missing json-ld components');
  return;
}
for (i=0; i < data["@graph"].length; i++)
{
  //add default data for the nodes
 var nodeBit = Object.assign({}, defaultConfig.nodes);
  //extract id 

  // explaination of code: split the id of the graph object and get the real prefix from the context object and then add the id to the prefix to get the full URI

    var fullUri = extractFullUri(data["@graph"][i]["@id"], data["@context"]);
    //console.log('fullUri: ',fullUri);
  nodeBit.id = fullUri;
  //set up label
  // explanation of code: if the skos:prefLabel exists then use that value, else use the rdfs:label value

  let descriptionKeys = ["skos:prefLabel", "rdfs:label","sdo:name","sosa:observedProperty"];
  nodeBit.description = getDetailedInfo(data["@graph"][i], descriptionKeys);

  //add detailed info if known - TODO make more compatable with other ontologies
  // detailed code description: if the geo:description exists then use that value, else use the skos:definition value, else use the rdfs:comment value
  
  let detailedInfoKeys = ["geo:description", "skos:definition", "rdfs:comment"];
  nodeBit.detailed_info = getDetailedInfo(data["@graph"][i], detailedInfoKeys);

  //if skos:inScheme then use that value instead of rdf:type  
  var groupSelector = "rdf:type";
  if ((data["@graph"][i]["rdf:type"] && data["@graph"][i]["rdf:type"]["@id"] == "skos:Concept") || data["@graph"][i]["skos:inScheme"])
  {
    groupSelector = "skos:inScheme";
  }
  //description of code: based on groupSelector, get the full URI of the group and assign it to the node
  if (data["@graph"][i][groupSelector])
  {
    var groupComponents = data["@graph"][i][groupSelector]["@id"].split(':');
    var realGroupPrefix = data["@context"][groupComponents[0]];
    var fullGroupUri = realGroupPrefix + groupComponents[1];
    nodeBit.group = fullGroupUri;
  }

  if (data["@graph"][i]["sdo:color"] && data["@graph"][i]["sdo:color"]["@value"] && data["@graph"][i]["sdo:color"]["@value"].match(/^(#[a-fA-F0-9]{6}|#[a-fA-F0-9]{3})$/) && globalGraphConfig.useSdoColorValues)
  {
    nodeBit.color = data["@graph"][i]["sdo:color"]["@value"];
  }
  //color by group
  else if (colorGroup[nodeBit.group])
  {
	  nodeBit.color = colorGroup[nodeBit.group];
  }
  else
  {
	  //if not exists then set up color allocation and assign to the node
	  //get next color in color wheel
	  var keysInColGroup = Object.keys(colorGroup);
	  //assign to node
    colorGroup[nodeBit.group] = complimentaryColors[keysInColGroup.length % complimentaryColors.length];
    // assign to node
    nodeBit.color = colorGroup[nodeBit.group];
  }
  //add properties
  // explanation of code: if the graph object has properties then add them to the node
    nodeBit.properties = data["@graph"][i];
  //add node to node set
    builtModel["nodes"].push(nodeBit);
}

//build links
//high level explanation: iterate through the graph and build links
var j = 0;

for (j=0; j < data["@graph"].length; j++)
{
  var linkBit = Object.assign({}, defaultConfig.links);
  //get the current graph object
  var currentGraphObject = data["@graph"][j];
  //iterate through the keys of the graph object
  var keys = Object.keys(currentGraphObject);

  //check if usable, if not then skip, this is for skos:Concept and skos:ConceptScheme and rdfs:Resource, these are not used as sources for links
  var usable = true;
  if (data["@graph"][j]["rdf:type"] && data["@graph"][j]["rdf:type"]["@id"] && 
  (data["@graph"][j]["rdf:type"]["@id"] == "skos:Concept" || 
  data["@graph"][j]["rdf:type"]["@id"] == "skos:ConceptScheme" || 
  data["@graph"][j]["rdf:type"]["@id"] == "rdfs:Resource"))
  {
    //console.log('skipping this source: ', data["@graph"][j]["@id"]);
    usable = false;
  }


  //fullURI 
  fullUri = extractFullUri(data["@graph"][j]["@id"], data["@context"]);
  linkBit.source = fullUri;
  //now we have the source URI, we can look up the description which equates to the rdf predicate

  //iterate through the keys
  var k = 0;
  for (k=0; k < keys.length; k++)
  {
    //convert key to URI
    var fullKeyUri = extractFullUri(keys[k], data["@context"]);
    builtModel["nodes"].forEach(function(node) {
      if (node.id == fullKeyUri)
      {
        //console.log('key search, found: ', node, ' with fullKeyUri: ', fullKeyUri);
        linkBit.description = node.description;
        //console.log('linkBit descriptions: ',linkBit.description);
      }
    });

    //handle skos:concept, this will override as it is preferred, this is for readability
    if (keys[k] == 'rdf:type')
    {
      linkBit.description = 'Of type';
    } 
    //if the value is an object then it is a link
    if (usable && typeof(currentGraphObject[keys[k]]) == "object" && !Array.isArray(currentGraphObject[keys[k]]))
    {
      // code to execute if the value is an object and not an array)
      //console.log('type 1');
      if (data["@graph"][j][keys[k]]["@id"])
      {
        //split the id of the graph object and get the real prefix from the context object and then add the id to the prefix to get the full URI
        var fullTermUri = extractFullUri(data["@graph"][j][keys[k]]["@id"], data["@context"]); // realTermPrefix + realTermSuffix;
      }
      else
      {
        fullTermUri = 'undefined';
      }
      //look up fullTermUri in builtModel
      //check for matches with ignore list
      console.log('current ignore list: ', globalGraphConfig.ignoreNodesById);
     //explain this code: if the node is not in the ignore list then add the link to the link se
      var dontIgnore = checkIgnoreList('node', fullTermUri, fullKeyUri, fullUri);
      if (usable && dontIgnore && fullTermUri && fullTermUri !== 'undefined' && fullTermUri !== null )
     {
      if (fullTermUri !== null && builtModel["nodes"].findIndex(x => x.id === fullTermUri) !== -1) { 
        linkBit.target = fullTermUri;
        if (linkBit.description === "not provided")
        {
          linkBit.description = fullKeyUri;
        }

        //search builtModel for the target
        //update show label setting
        if (globalGraphConfig.dontShowLabelsOnLinks)
        {
          linkBit.linkLabelVisible = false;
        }
        //console.log('linkBit to go in: ', JSON.stringify(linkBit, null, 2));
        var indexOfSource = builtModel["nodes"].findIndex(node => node.id === linkBit.source);
        var indexOfTarget = builtModel["nodes"].findIndex(node => node.id === linkBit.target);

        if (indexOfSource !== -1 && indexOfTarget !== -1) {
            builtModel["links"].push(Object.assign({}, linkBit));
        } else {
            //console.warn('Skipping link due to missing node:', linkBit);
        }
        linkBit.description = "not provided"; //reset description
        linkBit.linkLabelVisible = true; //reset visibility
        }

     }

    }
    else if (usable && Array.isArray(currentGraphObject[keys[k]]) && typeof currentGraphObject[keys[k]][0] === "object")  
    {
      //console.log('type 2');
      //iterate through array
      //console.log(JSON.stringify(currentGraphObject[keys[k]]));
      var m = 0;
      for (m=0; m < currentGraphObject[keys[k]].length; m++)
      {
        //extract id 
        if (currentGraphObject[keys[k]][m]["@id"])
        {
          var fullArrayUri = extractFullUri(currentGraphObject[keys[k]][m]["@id"], data["@context"]); // realTermPrefix + realTermSuffix;
        }
        else 
        {
          fullArrayUri = null;
        }
        //check for matches with ignore list
        var dontIgnore = checkIgnoreList('node', fullArrayUri, fullKeyUri, fullUri);
        if (usable && dontIgnore)
        {
          if (fullArrayUri !== null && builtModel["nodes"].findIndex(x => x.id === fullTermUri) !== -1) { 
            linkBit.target = fullArrayUri;
            builtModel["nodes"].forEach(function(node) {
              if (node.id == fullKeyUri)
              {
                linkBit.description = node.description;
              }
            });

            if (linkBit.description === "not provided")
            {
              linkBit.description = fullKeyUri;
            }            
            //add link to link set
            //console.log('linkBit to go in: ', JSON.stringify(linkBit, null, 2));
            //update show label setting
            if (globalGraphConfig.dontShowLabelsOnLinks)
            {
              linkBit.linkLabelVisible = false;
            }
            let indexOfSourceArray = builtModel["nodes"].findIndex(node => node.id === linkBit.source);
            let indexOfTargetArray = builtModel["nodes"].findIndex(node => node.id === linkBit.target);
          
            if (indexOfSourceArray !== -1 && indexOfTargetArray !== -1) {
              builtModel["links"].push(Object.assign({}, linkBit));
              // Reset linkBit attributes if needed
            } else {
              console.warn('Skipping link due to missing node:', linkBit);
            }
            linkBit.description = "not provided"; //reset description
            linkBit.linkLabelVisible = true; //reset visibility
          }
        }

      }
    }

    else if (usable === false && (data["@graph"][j]["rdf:type"]["@id"] == "skos:Concept" || data["@graph"][j]["rdf:type"]["@id"] == "skos:ConceptScheme"  || 
    data["@graph"][j]["rdf:type"]["@id"] == "rdfs:Resource"))    
    {
      //console.log('type 4');
      var anyGraph3dVariable = true; //placeholder
      //console.log('skos concept and rdfs resource skipped');
    }

    }
}

  if (globalGraphConfig.removeIsolatedNodes)
  {
    //remove isolated nodes
    //console.log('removing isolated nodes');
    var nodeIds = [];
    var linkIds = [];
    //get all node ids
    builtModel["nodes"].forEach(function(node) {
      nodeIds.push(node.id);
    });
    //get all link ids
    builtModel["links"].forEach(function(link) {
      linkIds.push(link.source);
      linkIds.push(link.target);
    });

    //remove any node that is not in the linkIds array
    for (let p = builtModel["nodes"].length - 1; p >= 0; p--)
    {
      if (!linkIds.includes(builtModel["nodes"][p].id))
      {
        builtModel["nodes"].splice(p, 1);
      }
    } 
  }

  //console.log('builtModelJSON: ', JSON.stringify(builtModel, null, 2));
  return(JSON.stringify(builtModel));
}

function extractFullUri(graphPart, context)
{
    if (graphPart === undefined)
    {
      //console.log('blank node encountered');
      graphPart = 'blank_node';
    }
    //console.log('graph part : ', graphPart);
    var idComponents = graphPart.split(':');
    if (context[idComponents[0]] === undefined)
    {
      var realPrefix = idComponents[0];
      //console.log('could not find prefix in @context, restitching the URI.');
    }
    else
    {
      realPrefix = context[idComponents[0]];
    }
    if (idComponents[1] === undefined)
    {
      var suffix = '';
    }
    else
    {
      suffix = idComponents[1];
    }

    var fullUri = realPrefix + suffix;
    return fullUri;





}

function checkIgnoreList(level, uri, linkNameUri, sourceUri)
{
  //console.log('checking ignore list: ', uri, linkNameUri, sourceUri);
  if (level == 'node')
  {
    if (globalGraphConfig.ignoreNodesById.includes(uri) || globalGraphConfig.ignoreNodesById.includes(sourceUri))
    {
      return false;
    }
    else
    {
      return true;
    }
  }
  else if (level == 'group')
  {
    if (globalGraphConfig.ignoreNodesByGroup.includes(uri))
    {
      return false;
    }
    else
    {
      return true;
    }    
  }
}

function getDetailedInfo(data, keys) {
  for (let key of keys) {
      if (data[key]) {
          // Check if it's an object with @value or @id
          if (typeof data[key] === 'object') {
              if (data[key]["@value"]) {
                  return data[key]["@value"];  // Return the actual value
              } else if (data[key]["@id"]) {
                  return data[key]["@id"];  // Return the URI if @id exists
              } else {
                  return 'not provided';  // If neither, return 'not provided'
              }
          } else if (typeof data[key] === 'string') {
              return data[key];  // Return the string value if it's a plain string
          }
      }
  }
  return "not provided";  // Default to 'not provided' if none of the keys match
}


