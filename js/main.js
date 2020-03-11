//Coded March 2020
//removed pseudocoding for more streamlined look and added descriptors to steps and functions within code - ie, steps within createLegend in a comment above function definition

//my global scope variables
var mymap;
var minValue;
var atts = [];
var index = 0
var data_stats = {}
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
//we need a legend - create the container, add the text that updates with the sequencing, add the circle svgs.
function createLegend(map, attributes){
    var LegendControl = L.Control.extend({
        options: {
            position: 'bottomright'
        },

        onAdd: function (mymap) {
            //create and name the container
            var container = L.DomUtil.create('div', 'legend-control-container');
            $(container).append("<p id='legend'><b>Population in:</b> 2010</p>")
            L.DomEvent.disableClickPropagation(container);

            $(container).append('<div id = "temporal-legend">')
            var svg = '<svg id="att-legend" width="180px" height = "80px">';
            var circles = ["max", "mean", "min"];
            for (var i=0; i<circles.length; i++){
              var rad = calcPropRadius(data_stats[circles[i]]);
              var cy=59-rad;
              svg+=svg += '<circle class="legend-circle" id="' + circles[i] + '" r="' + rad + '"cy="' + cy + '" fill="#986BF0" fill-opacity="0.6" stroke="#000000" cx="30"/>';
              var textY = i * 20 + 20;
              svg += '<text id="' + circles[i] + '-text" x="65" y="' + textY + '">' + Math.round(data_stats[circles[i]]*100)/100 + " people" + '</text>';
            };
            svg+= '</svg>';

            $(container).append(svg);

            return container;
        }
    });
    //add to the map
    mymap.addControl(new LegendControl());
};

//create popups using the object oriented programming
function PopupContent(properties, attribute){
  var statename = "NAME"
  this.properties = properties
  this.attribute = attribute
  this.year = attribute.split('_')[1]
  this.population = this.properties[attribute]
  this.formatted = "<p><b>State:</b> " + this.properties[statename] + "</p><p><b>Population in " + this.year + ": </b>" + this.population + " people</p>";
}
//here is where we get our data from the geojson - we also call functions to process data, calculate min, max, and mean, create the first round of prop symbols, create the sequence controls (slider, steps), and create the legend
function getData(){
    //load the data
    $.getJSON("data/Change_Pop.geojson", function(response){
      var atts = processData(response);
      calcStats(response);
      createPropSymbols(response, atts);
      sequence_controls(atts);
      createLegend(mymap, atts);
})
//the data has to look a certain way to be properly used in other functions, so we process it with this function
function processData(data){
  var props = data.features[0].properties;
  for (var att in props) {
    if (att.indexOf('pop')>-1){
      atts.push(att);
    };
  };
  return atts;
};

//find the min, max, and mean values so that we know how to base our prop symbol radii
function calcStats(data){
  var allValues = [];
  for (var state of data.features){
    for (var year = 2010; year<=2019; year +=1){
      var value = state.properties["pop_" + String(year)];
      //console.log(value)
      allValues.push(value);
    }
  }
  //console.log(allValues)
  data_stats.min = Math.min(...allValues);
  data_stats.max = Math.max(...allValues);
  var sum = allValues.reduce(function(a,b){return a+b});
  data_stats.mean = sum/allValues.length;
  //console.log(minValue)
}


//find the radius using Flannery
function calcPropRadius(attValue){
  var minRadius = 2;

  var radius = 1.0083*Math.pow(attValue/data_stats.min,0.5715)*minRadius
  return radius
}

//point to layer will create our build our symbols and tie them and the pop ups to the map
function pointToLayer(feature, latlng){
  var attribute = atts[index];
  //console.log(attribute)
  var options = {
      radius: 3,
      fillColor: "#986BF0",
      color: "#000",
      weight: 1,
      opacity: 1,
      fillOpacity: 0.8
    };
  var popupContent = new PopupContent(feature.properties, attribute)
  var statename = "NAME"
  var attValue = Number(feature.properties[attribute]);
  options.radius = calcPropRadius(attValue);
  var layer = L.circleMarker(latlng, options);
  var year = attribute.split('_')[1];
  layer.bindPopup(popupContent.formatted, {
    offset: new L.Point(0,-options.radius)
  });
  return layer;
};
//create the proportional symbols
function createPropSymbols(data, atts){
  L.geoJson(data, {
    pointToLayer: function(feature, latlng){
      return pointToLayer(feature, latlng, atts);
    }
  }).addTo(mymap);
};

//structure is very similar to creating the legend
function sequence_controls(atts){
  var SequenceControl = L.Control.extend({
    options: {
      position: 'bottomleft'
    },
    //build the physical containers and fill it
    onAdd: function(){
      var container = L.DomUtil.create('div', 'sequence-control-container')
      $(container).append('<input class="range-slider" type="range">');
      $(container).append('<button class="step" id="reverse" title="Reverse">Reverse</button>');
      $(container).append('<button class="step" id="forward" title="Forward">Forward</button>');
      //no clicks
      L.DomEvent.disableClickPropagation(container);
      return container
    }
    })
    //add the map and style
    mymap.addControl(new SequenceControl());
    $('.range-slider').attr({
      max: 9,
      min: 0,
      value: 0,
      step: 1
    });
    $('#reverse').html('<img src="img/reverse.png">');
    $('#forward').html('<img src="img/forward.png">');
    $('.step').click(function(){
      var index = $('.range-slider').val();
      if ($(this).attr('id') == 'forward'){
        index++
        index = index > 9 ? 0:index;
      } else if ($(this).attr('id')=='reverse'){
        index --
        index = index<0 ? 9 :index;
      };
      $('.range-slider').val(index);
      var attribute = atts[index]
      updatePropSymbols(attribute);
    });
    $('.range-slider').on('input', function(){
      var index = $(this).val();
      attribute = atts[index]
      updatePropSymbols(atts[index]);
    });
  }

//update symbols with slider/step movement
function updatePropSymbols(atts){
  mymap.eachLayer(function(layer){
    if (layer.feature && layer.feature.properties[atts]){
      var props = layer.feature.properties;
      var radius = calcPropRadius(props[atts]);
      layer.setRadius(radius);
      var statename = "NAME"
      var popupContent = new PopupContent(layer.feature.properties, atts)
      popup = layer.getPopup()
      popup.setContent(popupContent.formatted).update();
      //console.log('ready to update legend')
      $("#legend").html("<b>Population in: </b>"+ popupContent.year)
  };
});
};
//make the map!!!!
$(document).ready(createMap);
