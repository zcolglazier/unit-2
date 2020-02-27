//Pseudocode planning: overview of assignments A6, A7
//pan and zoom are default from  leaflet
//create pop symbol map by creating function that creates symbol radius based on Flannery
  //determine attr for scaling
  //determine value at attr
  //give marker radius
//retrieve:
  //build popups for 2010 data that are formatted the way I would like.
//sequence:
  //create slider
  //create steppers
  //create functionality of steppers
  //create functionality of slider


//I used .setView to center my map on a specific location when it first loads.
var mymap;
var minValue;
//let's make a map
function createMap(){
    //create the map
    mymap = L.map('map', {
        center: [37.0902,-95.7129],
        zoom: 4
    });

    //add OSM base tilelayer
    L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap contributors</a>'
    }).addTo(mymap);

	getData();
};

//function to retrieve the data and place it on the map
function getData(){
    //load the data
    $.getJSON("data/Pop_Change.geojson", function(response){
      calcMinValue(response);
      createPropSymbols(response);
    });
}

//find the minimum value so that we know how to base our prop symbol radii
function calcMinValue(data){
  var allValues = [];

  for (var state of data.features){
    for (var year = 2010; year<=2019; year +=1){
      var value = state.properties[String(year)];
      allValues.push(value);
    }
  }
  //console.log(allValues)
  minValue = Math.min(...allValues)
  //console.log(minValue)
}


//find the radius using Flannery
function calcPropRadius(attValue){
  var minRadius = 2;

  var radius = 1.0083*Math.pow(attValue/minValue,0.5715)*minRadius
  //console.log(minValue)
  return radius
}

//My functions based on lab examples
//build our proportional symbols in a function separate from getData.
function pointToLayer(feature, latlng){
  var attribute = "2010";
  var options = {
      radius: 3,
      fillColor: "#986BF0",
      color: "#000",
      weight: 1,
      opacity: 1,
      fillOpacity: 0.8
    };

  var statename = "NAME"
  var attValue = Number(feature.properties[attribute]);
  //console.log(attValue)
  options.radius = calcPropRadius(attValue);
  var layer = L.circleMarker(latlng, options);
  //console.log(feature.properties.State)
  var popupContent = "<p><b>State: </b> " + feature.properties[statename];
  popupContent += "<p><b>Population in " + attribute + ":<b/> " + feature.properties[attribute] + " people</p>";

  layer.bindPopup(popupContent, {
    offset: new L.Point(0,-options.radius)
  });
  //console.log(layer)
  return layer;
};

function createPropSymbols(data, map){
  console.log("This function works")
  L.geoJson(data, {
    pointToLayer: pointToLayer
  }).addTo(mymap);
};

//pseudocode for sequencing
//create slider
//add buttons
//build array to keep track of order
//assign attribute based on the index of array
//event listeners
//build wrap around
//update slider position based on index
//resize symbols

//.ready will execute the function it requires once the document has all the data it needs.
$(document).ready(createMap);
