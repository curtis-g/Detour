

	var map = null;
	var boxpolys = null;
	var directions = null;
	var routeBoxer = null;
var distance = 0.1; // km
var service = null;
var gmarkers = [];
var uniqueId = 1;
var infowindow = new google.maps.InfoWindow();
var placeT = [];
function initialize() {
  // Default the map view to UK
  var mapOptions = {
  	center: new google.maps.LatLng(55.3781,-3.4360),
  	mapTypeId: google.maps.MapTypeId.ROADMAP,
  	zoom: 5
  };

  new AutocompleteDirectionsHandler(map);

  $(".places").change(function()
  {
  	placeT = [];
  	$(".places").each(function()
  	{
  		if( $(this).is(':checked') )
  		{
  			placeT.push($(this).val());
  		}
  		window.placeT = placeT
  	});
  	alert( placeT );
  });

  map = new google.maps.Map(document.getElementById("map"), mapOptions);
  service = new google.maps.places.PlacesService(map);

  routeBoxer = new RouteBoxer();

  directionService = new google.maps.DirectionsService();
  directionsRenderer = new google.maps.DirectionsRenderer({ map: map });   

  function AutocompleteDirectionsHandler(map) {
  	this.map = map;
  	this.originPlaceId = null;
  	this.destinationPlaceId = null;
  	this.travelMode = 'DRIVING';
  	var originInput = document.getElementById('from');
  	var destinationInput = document.getElementById('to');
  	this.directionsService = new google.maps.DirectionsService;
  	this.directionsDisplay = new google.maps.DirectionsRenderer;
  	this.directionsDisplay.setMap(map);

  	var originAutocomplete = new google.maps.places.Autocomplete(
  		originInput, {placeIdOnly: true});
  	var destinationAutocomplete = new google.maps.places.Autocomplete(
  		destinationInput, {placeIdOnly: true});
  }

}



  function route() {
  // Clear any previous route boxes from the map
  clearBoxes();
  clearOverlays();

  // Convert the distance to box around the route from miles to km
  distance = parseFloat(document.getElementById('slider').value) * 1.609344
  var selectedMode = document.getElementById('mode').value;

  var request = {
  	origin: document.getElementById("from").value,
  	destination: document.getElementById("to").value,
  	travelMode: google.maps.DirectionsTravelMode[selectedMode]
  }

  // Make the directions request
  directionService.route(request, function(result, status) {
  	if (status == google.maps.DirectionsStatus.OK) {
  		directionsRenderer.setDirections(result);

      // Box around the overview path of the first route
      var path = result.routes[0].overview_path;
      var boxes = routeBoxer.box(path, distance);
      // alert(boxes.length);
      drawBoxes(boxes);
      findPlaces(boxes,0);
  } else {
  	alert("Directions query failed: " + status);
  }
});
}



function DeleteMarker(id) {
        //Find and remove the marker from the Array
        for (var i = 0; i < gmarkers.length; i++) {
        	if (gmarkers[i].id == id) {
                //Remove the marker from Map                  
                gmarkers[i].setMap(null);

                //Remove the marker from array.
                gmarkers.splice(i, 1);
                return;
            }
        }
    };   


    function sliderChange(val) {
    	document.getElementById('sliderStatus').innerHTML = val;
    	route();
    	document.getElementById("reRoute").style.visibility="visible";
    }

// Draw the array of boxes as polylines on the map
function drawBoxes(boxes) {
	boxpolys = new Array(boxes.length);
	for (var i = 0; i < boxes.length; i++) {
		boxpolys[i] = new google.maps.Rectangle({
			bounds: boxes[i],
			fillOpacity: 0,
			strokeOpacity: 0,
			strokeColor: '#000000',
			strokeWeight: 0,
			map: map
		});
	}
}

// Clear boxes currently on the map
function clearBoxes() {
	if (boxpolys != null) {
		for (var i = 0; i < boxpolys.length; i++) {
			boxpolys[i].setMap(null);
		}
	}
	boxpolys = null;
}


jQuery(document).ready(function(){
	initialize();
});

