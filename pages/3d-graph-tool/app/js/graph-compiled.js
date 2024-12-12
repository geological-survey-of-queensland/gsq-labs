"use strict";

function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
import { CSS2DRenderer, CSS2DObject } from './external/CSS2DRenderer.js';
var _CSS2DRenderer = CSS2DRenderer;
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == _typeof(i) ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != _typeof(t) || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != _typeof(i)) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
function _toConsumableArray(r) { return _arrayWithoutHoles(r) || _iterableToArray(r) || _unsupportedIterableToArray(r) || _nonIterableSpread(); }
function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _unsupportedIterableToArray(r, a) { if (r) { if ("string" == typeof r) return _arrayLikeToArray(r, a); var t = {}.toString.call(r).slice(8, -1); return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0; } }
function _iterableToArray(r) { if ("undefined" != typeof Symbol && null != r[Symbol.iterator] || null != r["@@iterator"]) return Array.from(r); }
function _arrayWithoutHoles(r) { if (Array.isArray(r)) return _arrayLikeToArray(r); }
function _arrayLikeToArray(r, a) { (null == a || a > r.length) && (a = r.length); for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e]; return n; }
var extraRenderers = [new CSS2DRenderer()];
fetchAndStoreJsonData();

// Retrieve the JSON data from local storage
var jsonData = localStorage.getItem(currentGraphViewId);
var data = JSON.parse(jsonData);
var skipRender = globalGraphConfig.dontRenderGraph;
if (data && !skipRender) {
  // Use the retrieved data to render the graph
  ReactDOM.render(/*#__PURE__*/React.createElement(ForceGraph3D, _defineProperty(_defineProperty(_defineProperty(_defineProperty({
    extraRenderers: extraRenderers,
    graphData: data
    //node separation
    //d3Force={'charge', force => force.strength(-190)} // Increase the negative value to increase repulsion
    //linkDistance={1000} // Adjust the distance as needed
    //d3Force={'link', force => force.distance(200).strength(2)}
    //d3Force={'collide', force => force.radius(node => node.size + 1000)} 
    //d3Force={'center', force => force.strength(0.0001)} // Decrease the strength to let nodes move away from the center.
    //warmupTicks={1000} // Increase the number of iterations before rendering
    ,

    onNodeClick: function onNodeClick(node) {
      return popUpNodeModal(node);
    }
    // Modify container parameters for each component
    ,
    backgroundColor: "black" // Background color
    ,
    showNavInfo: true // Hide navigation controls footer info
    ,
    nodeRelSize: 1.4,
    nodeOpacity: 0.7 // Node opacity
    ,
    ngraphPhysics: "{timeStep: 0.5,dimensions: 3,gravity: -14445,theta: 0.8,springLength: 1500,springCoefficient: 0.001,dragCoefficient: 0.9}",
    nodeLabel: "description" // Node label
    ,
    nodeVal: "size" // Node value
    ,
    nodeColor: "color"
    //nodeAutoColorBy="group" //if coloring by a dimension
    ,
    nodeVisibility: "visible",
    nodeResolution: 16,
    nodeThreeObject: function nodeThreeObject(node) {
      var overrideColor = "#e9ee00";
      var overrideParticleColor = "#e9ee00";
      if (node.overrideColor === true) {
        node.color = overrideColor; // node color
      } else {
        node.nodeColor = node.color; // node color specified in data
      }
      var sprite = new SpriteText(node.description);
      sprite.color = 'cyan';
      sprite.textHeight = 5;
      return sprite;
    },
    nodeThreeObjectExtend: true,
    linkLabel: "description" // Link label
    ,
    linkVisibility: "visible" // Link visibility
    ,

    linkWidth: "thickness" // Link width
    ,
    linkResolution: 6 // Link resolution

    //particles currently not working properly
    ,
    linkDirectionalParticles: 1 // Link directional particles
    ,
    linkDirectionalParticleWidth: 1 // Link directional particle width
    ,
    linkDirectionalParticleSpeed: 0.01 // Link directional particle speed
    ,
    linkDirectionalParticleColor: "particleColor" // Link directional particle color

    //arrow config
    ,
    linkDirectionalArrowLength: 5 // Link directional arrow length
    ,
    linkDirectionalArrowColor: "color" // Link directional arrow color
    ,
    linkDirectionalArrowRelPos: 1 // Link directional arrow relative position
    ,
    linkDirectionalArrowResolution: 8 // Link directional arrow resolution
    ,

    linkOpacity: 0.2 // Link opacity
  }, "linkDirectionalArrowLength", "thickness"), "linkThreeObjectExtend", true), "linkThreeObject", function linkThreeObject(link) {
    // extend link with text sprite
    //override color if required
    var overrideColor = "#e9ee00";
    var overrideParticleColor = "#e9ee00";
    //console.log('link: ',JSON.stringify(link))
    if (link.overrideColor === true) {
      link.color = overrideColor; // Link color
      link.particleColor = overrideParticleColor; // Link particle color
    } else {
      link.linkColor = link.color; // Link color specified in data
      link.linkDirectionalParticleColor = link.particleColor; // Link particle color specified in data
    }
    if (link.linkLabelVisible === true) {
      //console.log('showing label is true');
      var sprite = new SpriteText("".concat(link.description));
      sprite.color = 'lightgrey';
      sprite.textHeight = 4;
      return sprite;
    }
  }), "linkPositionUpdate", function linkPositionUpdate(sprite, _ref) {
    var start = _ref.start,
      end = _ref.end;
    if (sprite) {
      var middlePos = Object.assign.apply(Object, _toConsumableArray(['x', 'y', 'z'].map(function (c) {
        return _defineProperty({}, c, start[c] + (end[c] - start[c]) / 3);
      })));

      // Position sprite
      Object.assign(sprite.position, middlePos);
    }
  })), document.getElementById('graph'));
} else if (skipRender) {
  alert('No rendering due to settings');
} else {
  console.error('Error: JSON data not found in local storage.');
}
