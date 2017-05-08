var map = null;
var boxpolys = null;
var directions = null; //initial setting of global variables
var routeBoxer = null;
var distance = 0.1; // km
var service = null;
var gmarkers = []; //creation of the marker array
var uniqueId = 1;
var infowindow = new google.maps.InfoWindow(); //creating a new marker infowindow is set to a variable
var placeT = []; //creation of the place type array

jQuery(document).ready(function(){
  initialize(); //ensure the webpage is ready before running initialize
});

function initialize() {
  // Default the map view to UK
  var mapOptions = {
    center: new google.maps.LatLng(55.3781,-3.4360),
    mapTypeId: google.maps.MapTypeId.ROADMAP, //set the type of map to a road map
    zoom: 5
  };

  new AutocompleteDirectionsHandler(map); //call the Auto Complete directions function

  $(".places").change(function() //use the checkbox class places to use onChange for each
  {
    placeT = []; //call the placeT array
    $(".places").each(function() //run this on each checkbox
    {
      if( $(this).is(':checked') )
      {
        placeT.push($(this).val()); //if the checkbox is checked or unchecked the value of the box is pushed to the placeT array, either a place type or the place type removed
      }
      window.placeT = placeT //making the placeT array global
    });
  });

  map = new google.maps.Map(document.getElementById("map-canvas"), mapOptions); //binding the creation of the map in the map-canvas div to map
  service = new google.maps.places.PlacesService(map); //binding the place service to service

  routeBoxer = new RouteBoxer(); //binding the routeboxer function to routeBoxer

  directionService = new google.maps.DirectionsService(); //binding the directions service to directionService
  directionsRenderer = new google.maps.DirectionsRenderer({ map: map }); //binding the directions to be rendered onto the map to directionsRenderer  

  function AutocompleteDirectionsHandler(map) { //this function was based on code from Google's Developer Documentation
    this.map = map;
    this.originPlaceId = null;
    this.destinationPlaceId = null;
    this.travelMode = 'DRIVING'; //setting the default travel mode to driving
    var originInput = document.getElementById('start'); //setting the origin input to the value of the start textbox
    var destinationInput = document.getElementById('destination'); //setting the distination input to the value of the destination textbox
    this.directionsService = new google.maps.DirectionsService;
    this.directionsDisplay = new google.maps.DirectionsRenderer;
    this.directionsDisplay.setMap(map);

    var originAutocomplete = new google.maps.places.Autocomplete(
      originInput, {placeIdOnly: true}); //calling the Google place autocomplete for the start textbox
    var destinationAutocomplete = new google.maps.places.Autocomplete(
      destinationInput, {placeIdOnly: true}); //calling the Google place autocomplete for the destination textbox
  }

}


function findPlaces(boxes,searchIndex) {

  var typeP = placeT.toString().split(','); //turning the placeT array to a string and splitting each place type by when a , appears, stored under typeP variabe

  window.typeP = typeP //making typeP variable global

  var request = { bounds: boxes[searchIndex], types: typeP }; //storing the bounds which places can appear and the type of places to appear under the request variable

   //alert(request.bounds);
   service.radarSearch(request, function (results, status) { //performs a radar search returning up to 200 places using the input specified in the request variable
    // if (status != google.maps.places.PlacesServiceStatus.OK) {
    //   // alert("Request["+searchIndex+"] failed: "+status);

    // }
   // alert(results.length);
   document.getElementById('side_bar').innerHTML += "bounds["+searchIndex+"] returns "+results.length+" results<br>" //uses the invisible side_bar element to store the results of the search
   for (var i = 0, result; result = results[i]; i++) {
    var marker = createMarker(result); //loops through each of the results calling the createMarker function for each
   }
   searchIndex++; //increments through the search results
   if (searchIndex < boxes.length) //continues finding places until the search index is >= boxes.length therefore matching the route
    findPlaces(boxes,searchIndex);
});
}

function createMarker(place, category){ //some code taken from Google Developer Documentation

  // var iconBase = '/img/icons/';
  // var icons = {

  //   park: {
  //     icon: iconBase + 'park-15.svg'
  //   },
  //   campground: {
  //     icon: iconBase + 'restaurant-15.svg'
  //   },
  //         //  'park, campground': {
  //         //   icon: iconBase + 'park-15.svg'
  //         // },
  //         'lodging, campground': {
  //           icon: iconBase + 'lodging-15.svg'  Feature removed from this build, code kept for solution at later date
  //         },
  //         'restaurant, bakery, cafe, meal_delivery, meal_takeaway': {
  //           icon: iconBase + 'restaurant-15.svg'
  //         },
  //         'art_gallery, church, cemetery, city_hall, library, museum': {
  //           icon: iconBase + 'castle-15.svg'
  //         },
  //         'bar, casino, night_club': {
  //           icon: iconBase + 'beer-15.svg'
  //         },
  //         'amusement_park, aquarium, art_gallery, bowling_alley, casino, library, movie_theater, museum, stadium, zoo': {
  //           icon: iconBase + 'attraction-15.svg'
  //         },

  //         '':{
  //           icon:iconBase + 'triangle-15.svg'
  //         },
  //     };
      

      var placeLoc=place.geometry.location; //sets the geometrical coordinates of a place to the placeLoc variable
      if (place.icon) {
        var image = new google.maps.Icon( //structure for variable taken from Google Developer Documentation
          place.icon, new google.maps.Size(50, 50), //sets the size of the marker icon
          new google.maps.Point(0, 0), new google.maps.Point(17, 34),
          new google.maps.Size(25, 25));
      } else var image = null;

        var marker=new google.maps.Marker({ //structure for variable taken from Google Developer Documentation
          map:map,
          icon: image, //sets the icon settings to what is outlined in the image variable
          position:place.geometry.location,
        });

      var request =  { //stores the bounds of the request under the request variable
        reference: place.reference 
      };

      google.maps.event.addListener(marker,'click',function(){ //adds an event listener for when a marker is clicked
        service.getDetails(request, function(place, status) { //makes a request for the details of a place when the marjer is clicked
          if (status == google.maps.places.PlacesServiceStatus.OK) { //returns the below criteria if the PlacesServiceStatus == OK
            var contentStr = '<h5>'+place.name+'</h5><p>'+place.formatted_address; 
            if (!!place.formatted_phone_number) contentStr += '<br>'+place.formatted_phone_number;
            if (!!place.price_level) contentStr += '<br>'+place.price_level;
            if (!!place.opening_hours) contentStr += '<br>'+place.opening_hours;
            if (!!place.website) contentStr += '<br><a target="_blank" href="'+place.website+'">'+place.website+'</a>';
            // contentStr += '<br>'+place.types+'</p>';
            contentStr += "<br /><input type = 'button' value = 'Not Interested' onclick = 'DeleteMarker(" + marker.id + ");' value = 'Delete' />"; //Adds a button to the infowindow which links to the deleteMarker function
            contentStr += "<br /><input type = 'button' id= 'routeTo' value = 'Route to Location' onclick = 'placeRoute(" + marker.id + ");' value = 'pRoute' />";//Adds a button to the infowindow which links to the placeRoute function
            infowindow.setContent(contentStr); //sets the contents of the infowindow to what is in the contentStr variable
            infowindow.open(map,marker); //opens the infowindow on the map
          } else { 
            var contentStr = "<h5>No Result"+status+"</h5>"; //sets the contentStr varibale to no results
            infowindow.setContent(contentStr);
            infowindow.open(map,marker);
          }
        });

      });

      marker.id = uniqueId; //sets the marker id to the uniqueId variable
      uniqueId++; //increments the uniqueId for each marker
      gmarkers.push(marker); //pushes each marker to the gmarkers array
      var side_bar_html = "<a href='javascript:google.maps.event.trigger(gmarkers["+parseInt(gmarkers.length-1)+"],\"click\");'>"+place.name+"</a><br>"; //
        document.getElementById('side_bar').innerHTML += side_bar_html; //stores results in side_bar, side_bar code modified from user "Toothbrush" on StackOverflow "http://stackoverflow.com/questions/21967065/turn-callback-into-promise"
  }

  function route() {

  clearBoxes(); //clear boxes from RouteBoxer from the map
  clearOverlays(); //clear any marker from the map

  distance = parseFloat(document.getElementById('slider').value) * 1.609344 //gets the value of the distance slider as a float and turns it from miles to km
  var selectedMode = document.getElementById('mode').value; //gets the selected mode of travel from the drop down menu

  var request = {
    origin: document.getElementById("start").value, //gets the origin value from the value of the start textbox
    destination: document.getElementById("destination").value, //gets the destination value from the value of the destination textbox
    travelMode: google.maps.DirectionsTravelMode[selectedMode] //gets the travel mode from the value of the selectedMode drop down box
  }

  directionService.route(request, function(result, status) { //uses the request variable to make a directions request
    if (status == google.maps.DirectionsStatus.OK) {
      directionsRenderer.setDirections(result); //renders the result onto the map

      
      var path = result.routes[0].overview_path; //sets the path variable to the route created
      var boxes = routeBoxer.box(path, distance); //sets the boxes variable to the function for routeboxer to box around the route also using the distance value
      // alert(boxes.length);
      drawBoxes(boxes); //draws the boxes onto the map
      findPlaces(boxes,0); //calls the find places function to run within the boxes
  } else {
    alert("Directions query failed, please ammend input. "); //lets the user know there  was a problem with the routing
  }
});
}

function clearOverlays() {
  for (var i = 0; i < gmarkers.length; i++ ) {
    gmarkers[i].setMap(null); //sets each marker to dissappear on the map
  }
  gmarkers.length = 0; //sets the length of the gmarkers array to 0
}



function DeleteMarker(id) {
        for (var i = 0; i < gmarkers.length; i++) { //loops through the gmarkers array until the id of the marker clicked on is found
          if (gmarkers[i].id == id) {
                          
                gmarkers[i].setMap(null); //marker is removed from map

                gmarkers.splice(i, 1); //marker also removed from array
                return;
            }
        }
    };

    function placeRoute(id) {
        for (var i = 0; i < gmarkers.length; i++) { //loops through the gmarkers array to find the marker clicked on
          if (gmarkers[i].id == id) {
            var placeLoc = gmarkers[i].position; //sets the placeLoc variable to the coordinates of the marker on the map
            document.getElementById("destination").value = placeLoc.toString().replace(/[()]/g, ''); //sets the destination value to the coordinates of the marker, after turning to a string to remove the parentheses
            clearOverlays(); //clears the markers from the previous route from the map
            route(); //runs the route to the new destination
          }
        }
    };    


    function sliderChange(val) {
      document.getElementById('sliderStatus').innerHTML = val; //gets the value of the distance slider
      route(); //runs the route function
      document.getElementById("reRoute").style.visibility="visible"; //sets the button to re-route to visible after the slider has been used
    }

function drawBoxes(boxes) { //part of routeboxer library
  boxpolys = new Array(boxes.length); //sets boxpolys to an array of the boxes length
  for (var i = 0; i < boxes.length; i++) { //loops through each box
    boxpolys[i] = new google.maps.Rectangle({ //creates a rectangle onto the map for each box
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
  if (boxpolys != null) { //if boxpolys is not null
    for (var i = 0; i < boxpolys.length; i++) {
      boxpolys[i].setMap(null); //loop through and remove each box from the map
    }
  }
  boxpolys = null; //set the boxpolys array to null
}



$(document).ready(function(){/* affix the navbar after scroll below header */
$('#nav').affix({
      offset: {
        top: $('header').height()-$('#nav').height()
      }
});	//code included with bootstrap template

$(document).ready(function (){
            $("#slider").change(function (){
                $('html, body').animate({
                    scrollTop: $("#section5").offset().top
                }, 2000);
            }); //scrolls back to the map when a change to the slider is made
        });

$(document).ready(function (){
            $("#reRoute").click(function (){
                $('html, body').animate({
                    scrollTop: $("#section5").offset().top
                }, 2000);
            }); //scrolls back to the map when the re-route button is clicked
        });

/* highlight the top nav as scrolling occurs */
$('body').scrollspy({ target: '#nav' }) //code included with bootstrap template

/* smooth scrolling for scroll to top */
$('.scroll-top').click(function(){
  $('body,html').animate({scrollTop:0},1000); //code included with bootstrap template
})

/* smooth scrolling for nav sections */
$('#nav .navbar-nav li>a').click(function(){
  var link = $(this).attr('href');
  var posi = $(link).offset().top+20;
  $('body,html').animate({scrollTop:posi},700); //code included with bootstrap template
})



});