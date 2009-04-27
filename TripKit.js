var map = null;
var geocodeCache = null;

var ds = [];

var error_codes;

// try to get directions
function testSegment(from, to, success, failure) {
  var directions = new google.maps.Directions(map, null);
  google.maps.Event.addListener(directions, "load", 
                                function() {
                                  directions.getMarker(0).hide();
                                  directions.getMarker(1).hide();
                                  success()
                                });
  google.maps.Event.addListener(directions, "error",
                                function() { failure(directions.getStatus().code) });
  directions.load('from: '+from+' to: '+to);
}

function mapRun(stops) {
  var directions = new google.maps.Directions(map, null);
  var stop_names = $.map(stops, function(stop) { return stop.name })
  var stop_points = $.map(stops, function(stop) {
    return stop.geocode[0]+', '+stop.geocode[1] })

  google.maps.Event.addListener(directions, "load",
    function() {
    });
  google.maps.Event.addListener(directions, "error",
    function() {
      if (stops.length > 2) {
        var center = Math.floor(stops.length / 2);
        mapRun(stops.slice(0, center+1));
        mapRun(stops.slice(center));
      } else if (stops.length == 2) {
        // just 2 points left, just make a line
        var line = new google.maps.Polyline([new google.maps.Point(stops[0].geocode[0], stops[0].geocode[1]),
                                             new google.maps.Point(stops[1].geocode[0], stops[1].geocode[1])],
                                            '#0000ff', 5);
        map.addOverlay(line);
      }
    });

  directions.load('from: '+stop_names.join(' to: '), {
    preserveViewport: true
  });
}

function initializeLeg(leg) {
  /*
  leg.stops.reduce(function(a, b, c, d) {
    testSegment(a.name, b.name, function (){
      console.log("can route: "+a.name+" -> "+b.name)
    }, function(code) {
      console.log("can't route: "+a.name+" -> "+b.name+" ("+code+")")
    })
    return b;
  })
  */
  /*
  leg.directions = new google.maps.Directions(map, null);
  google.maps.Event.addListener(leg.directions, "load",
                                function() { console.log('loaded') });
  google.maps.Event.addListener(leg.directions, "error",
    function() {
      console.log('error')
      console.log(leg.directions.getStatus().code)
    });

  var stops = $.map(leg.stops, function(stop) { return stop.name })
  leg.directions.load('from: '+stops.join(' to: '));
  */
  mapRun(leg.stops);
}

$(document).ready(function() {
  if (GBrowserIsCompatible()) {
    error_codes = {};
    jQuery.each(google.maps, function(key) {
      if (key.match(/^GEO_/)) error_codes[this] = key;
    });

    map = new google.maps.Map2(document.getElementById("map_canvas"));
    map.setCenter(new google.maps.LatLng(google.loader.ClientLocation.latitude,
                                         google.loader.ClientLocation.longitude),
                  3);
    map.setUIToDefault();
    
    geocodeCache = new google.maps.GeocodeCache();
  }
  
  $.getJSON('trip.js', function(trip) {
    $.each(trip, function() {
      initializeLeg(this);
    })
  })
  
});