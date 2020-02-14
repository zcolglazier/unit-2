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
function getData(mymap){
    //load the data
    $.getJSON("data/Pop_Est_Change_US.geojson", function(response){
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
							return L.circleMarker(latlng, geojsonMarkerOptions)
				}
			}).addTo(mymap);
		});
}


//.ready will execute the function it requires once the document has all the data it needs.
$(document).ready(createMap);
