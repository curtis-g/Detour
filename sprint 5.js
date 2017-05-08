

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



function findPlaces(boxes,searchIndex) {

	var typeP = placeT.toString().split(',');

	window.typeP = typeP

	var request = { bounds: boxes[searchIndex], types: typeP };

   //alert(request.bounds);
   service.radarSearch(request, function (results, status) {
   	if (status != google.maps.places.PlacesServiceStatus.OK) {
   		alert("Request["+searchIndex+"] failed: "+status);

   	}
   // alert(results.length);
   document.getElementById('side_bar').innerHTML += "bounds["+searchIndex+"] returns "+results.length+" results<br>"
   for (var i = 0, result; result = results[i]; i++) {
   	var marker = createMarker(result);
   }
   searchIndex++;
   if (searchIndex < boxes.length) 
   	findPlaces(boxes,searchIndex);
   callback();
});
}

function callback(results, status) {
	if (status !== google.maps.places.PlacesServiceStatus.OK) {
		console.error(status);
		return;
	}

	for (var i = 0, result; result = results[i]; i++) {
     // Go through each result from the search and if the place exist already in our list of places then done push it in to the array
     if (!placeExists(result.id)) {
     	allPlaces.push(result);
     	bound.contains(new google.maps.LatLng(allPlaces[j].geometry.location.lat(), allPlaces[j].geometry.location.lng()))
     }
 }
}

function createMarker(place, category){

      

      var placeLoc=place.geometry.location;
      if (place.icon) {
      	var image = new google.maps.Icon(
      		place.icon, new google.maps.Size(50, 50),
      		new google.maps.Point(0, 0), new google.maps.Point(17, 34),
      		new google.maps.Size(25, 25));
      } else var image = null;

      for (var i = 0; i < typeP.length; i++) {
      	var marker=new google.maps.Marker({
      		map:map,
      		icon: image,
      		position:place.geometry.location,
      		scaledSize: new google.maps.Size(100, 100)
      	});
      }

      var request =  {
      	reference: place.reference
      };

      google.maps.event.addListener(marker,'click',function(){
      	service.getDetails(request, function(place, status) {
      		if (status == google.maps.places.PlacesServiceStatus.OK) {
      			var contentStr = '<h5>'+place.name+'</h5><p>'+place.formatted_address;
      			if (!!place.formatted_phone_number) contentStr += '<br>'+place.formatted_phone_number;
      			if (!!place.price_level) contentStr += '<br>'+place.price_level;
      			if (!!place.opening_hours) contentStr += '<br>'+place.opening_hours;
      			if (!!place.website) contentStr += '<br><a target="_blank" href="'+place.website+'">'+place.website+'</a>';
      			contentStr += '<br>'+place.types+'</p>';
      			contentStr += "<br /><input type = 'button' value = 'Not Interested' onclick = 'DeleteMarker(" + marker.id + ");' value = 'Delete' />";
      			contentStr += "<br /><input type = 'button' value = 'Route to Location' onclick = 'placeRoute(" + marker.id + ");' value = 'pRoute' />";
      			infowindow.setContent(contentStr);
      			infowindow.open(map,marker);
      		} else { 
      			var contentStr = "<h5>No Result, status="+status+"</h5>";
      			infowindow.setContent(contentStr);
      			infowindow.open(map,marker);
      		}
      	});

      });

      marker.id = uniqueId;
      uniqueId++;
      gmarkers.push(marker);
      var side_bar_html = "<a href='javascript:google.maps.event.trigger(gmarkers["+parseInt(gmarkers.length-1)+"],\"click\");'>"+place.name+"</a><br>";
      document.getElementById('side_bar').innerHTML += side_bar_html;
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

function clearOverlays() {
	for (var i = 0; i < gmarkers.length; i++ ) {
		gmarkers[i].setMap(null);
	}
	gmarkers.length = 0;
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

    function placeRoute(id) {
        //Find and remove the marker from the Array
        for (var i = 0; i < gmarkers.length; i++) {
        	if (gmarkers[i].id == id) {
        		var placeLoc = gmarkers[i].position;
        		document.getElementById("to").value = placeLoc.toString().replace(/[()]/g, '');
        		route(); 
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

