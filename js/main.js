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
var atts = [];
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
    $.getJSON("data/Change_Pop.geojson", function(response){
      var atts = processData(response);
      calcMinValue(response);
      createPropSymbols(response, atts);
      sequence_controls();
    });
}

function processData(data){
  var props = data.features[0].properties;
  for (var att in props) {
    if (att.indexOf('pop')>-1){
      atts.push(att);
    };
  };
  console.log(atts);
  return atts;
};

//find the minimum value so that we know how to base our prop symbol radii
function calcMinValue(data){
  var allValues = [];

  for (var state of data.features){
    for (var year = 2010; year<=2019; year +=1){
      var value = state.properties["pop_" + String(year)];
      //console.log(value)
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
  var attribute = atts[0];
  //console.log(attribute)
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
  var year = attribute.split('_')[1];
  //console.log(year)
  var popupContent = "<p><b>State: </b> " + feature.properties[statename];
  popupContent += "<p><b>Population in " + year + ":</b> " + feature.properties[attribute] + " people</p>";

  layer.bindPopup(popupContent, {
    offset: new L.Point(0,-options.radius)
  });
  //console.log("i hate this lab");
  //console.log(layer)
  return layer;
};

function createPropSymbols(data, atts){
  //console.log("This function works")
  L.geoJson(data, {
    pointToLayer: function(feature, latlng){
      //console.log('ahhhhh')
      return pointToLayer(feature, latlng, atts);
    }
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

function sequence_controls(){
  $('#panel').append('<input class="range-slider" type="range">');
  console.log('Looks like we made it!')
  $('.range-slider').attr({
    max: 9,
    min: 0,
    value: 0,
    step: 1
  });

  $('#panel').append('<button class="step" id="reverse">Reverse</button>');
  $('#panel').append('<button class="step" id="forward">Forward</button>');

  $('#reverse').html('<img src="img/reverse.png">');
  $('#forward').html('<img src="img/forward.png">');

  $('.step').click(function(){
    var index = $('ranger-slider').val();
    if ($(this).attr('id') == 'forward'){
      index++
      index = index > 9 ? 0:index;
    } else if ($(this).attr('id')=='reverse'){
      index --
      index = index<0 ? 9 :index;
    };
    $('.range-slider').val(index);
  });
  $('.range-slider').on('input', function(){
    var index = $(this).val();

  updatePropSymbols(attribute[index]);
  })
};

function updatePropSymbols(attribute){
  map.eachLayer(function(layer){
    if (layer.feature && layer.feature.properties[attribute]){
      var props = layer.feature.properties;
      var radius = calcPropRadius(props[attribute]);
      layer.setRadius(radius);
      var statename = "NAME"
      var popupContent = "<p><b>State:</b>" + props.name + "</p>";
      var year = attribute.split("_")[1];
      popupContent += "<p><b>Population in "+year+":</b>" + props[attribute] + " people</p>";

      popup = layer.getPopup()
      popup.setContent(popupContent).update();
    };
  });
};
//.ready will execute the function it requires once the document has all the data it needs.
$(document).ready(createMap);
