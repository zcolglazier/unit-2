//I used .setView to center my map on a specific location when it first loads.
var mymap = L.map('mapid').setView([51.505, -0.09], 13);

var OpenStreetMap_Mapnik = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
	maxZoom: 19,
	attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(mymap);
 //.addTo adds things to the specified object - through this script it is used to append to my map
var marker = L.marker([51.5, -0.09]).addTo(mymap);
//.marker, .circle, and .polygon all create things we can see on the map (icons, circles, and polygons respectably)
var circle = L.circle([51.508, -0.11], {
  color: 'red',
  fillColor: '#f03',
  fillOpacity: 0.5,
  radius: 500
}).addTo(mymap);

var polygon = L.polygon([
  [51.509, -0.08],
  [51.503, -0.06],
  [51.51, -0.047]
]).addTo(mymap);

//.bindPopup attaches a popup text to the object it references, which can then be accessed via click.
//.openPopup sets the first open popup. This is what is already open when the user loads the map.
marker.bindPopup("<b>Hello world!</b><br>I am a popup.").openPopup();
circle.bindPopup("I am a circle.");
polygon.bindPopup("I am a polygon.");

//.setLatlng and .setContent determine where the popup will appear on the map and what it will say. .Openon is similar to .addTo, but specific to popups
var popup = L.popup()
    .setLatLng([51.5, -0.09])
    .setContent("I am a standalone popup.")
    .openOn(mymap);
//alert is a function we have used before - it activates notices when an action has occured.
    function onMapClick(e) {
        alert("You clicked the map at " + e.latlng);
    }
//here .on references what type of action must occur on a location
    mymap.on('click', onMapClick);
//.popup calls the popup we used earlier
    var popup = L.popup();

function onMapClick(e) {
    popup
        .setLatLng(e.latlng)
        .setContent("You clicked the map at " + e.latlng.toString())
        .openOn(mymap);
}

mymap.on('click', onMapClick);
