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

function onEachFeature(feature, layer) {
    //no property named popupContent; instead, create html string with all properties
    var popupContent = "";
    if (feature.properties) {
        //loop to add feature property names and values to html string
        for (var property in feature.properties){
            popupContent += "<p>" + property + ": " + feature.properties[property] + "</p>";
        }
        layer.bindPopup(popupContent);
    };
};

//function to retrieve the data and place it on the map
function getData(){
    //load the data
    $.getJSON("data/PopEst_Change.geojson", function(response){
      minValue = calcMinValue(response);
      create PropSymbols(response);
    });
}

//find the minimum value so that we know how to base our prop symbol radii
function calcMinValue(data){
  var allValues = [];

  for (var state of data.features){
    for (var year = 2010; year<=2019; year +=1){
      var value = state.properties["POPESTIMATE" + String(year)];
      allValues.push(value);
    }
  }
  var minValue = Math.min(allValues)

  return minValue;
}


//find the radius using Flannery
function calcPropRadius(attValue){
  var minRadius = 2;

  var radius = 1.0083*Math.pow(attValue/minValue,0.5715)*minRadius

  return radius
}


//build our proportional symbols in a function separate from getData.
function createPropSymbols(data){
  var attribute = "POPESTIMATE2010"
  var geojsonMarkerOptions = {
      radius: 3,
      fillColor: "#986BF0",
      color: "#000",
      weight: 1,
      opacity: 1,
      fillOpacity: 0.8
    };

    L.geoJson(response, {
        onEachFeature: onEachFeature,
        pointToLayer: function (feature, latlng){
          var attValue = Number(feature.properties[attribute]);
          geojsonMarketOptions.radius = calcPropRadius(attValue);
            return L.circleMarker(latlng, geojsonMarkerOptions);
      }
    }).addTo(mymap);
  });
}

//.ready will execute the function it requires once the document has all the data it needs.
$(document).ready(createMap);
