var mapStyle = [
  { "elementType": "geometry",
      "stylers": [{"color": "#f5f5f5"}]
  },
  { "elementType": "labels.icon",
      "stylers": [{"visibility": "off"}]
  },
  { "elementType": "labels.text.fill",
      "stylers": [{"color": "#616161"}]
  },
  { "elementType": "labels.text.stroke",
      "stylers": [{"color": "#f5f5f5"}]
  },
  { "featureType": "administrative.land_parcel",
      "elementType": "labels",
      "stylers": [{"visibility": "off"}]
  },
  { "featureType": "administrative.land_parcel",
      "elementType": "labels.text.fill",
      "stylers": [{"color": "#bdbdbd"}]
  },
  { "featureType": "poi",
      "elementType": "geometry",
      "stylers": [{"color": "#eeeeee"}]
  },
  { "featureType": "poi",
      "elementType": "labels.text.fill",
      "stylers": [{"color": "#757575"}]
  },
  { "featureType": "poi.business",
      "stylers": [{"visibility": "off"}]
  },
  { "featureType": "poi.park",
      "elementType": "geometry",
      "stylers": [{"color": "#e5e5e5"}]
  },
  { "featureType": "poi.park",
      "elementType": "labels.text",
      "stylers": [{"visibility": "off"}]
  },
  { "featureType": "poi.park",
      "elementType": "labels.text.fill",
      "stylers": [{"color": "#9e9e9e"}]
  },
  { "featureType": "road",
      "elementType": "geometry",
      "stylers": [{"color": "#ffffff"}]
  },
  { "featureType": "road.arterial",
      "stylers": [{"visibility": "off"}]
  },
  { "featureType": "road.arterial",
      "elementType": "labels.text.fill",
      "stylers": [{"color": "#757575"}]
  },
  { "featureType": "road.highway",
      "elementType": "geometry",
      "stylers": [{"color": "#dadada"}]
  },
  { "featureType": "road.highway",
      "elementType": "labels",
      "stylers": [{"visibility": "off"}]
  },
  { "featureType": "road.highway",
      "elementType": "labels.text.fill",
      "stylers": [{"color": "#616161"}]
  },
  { "featureType": "road.local",
      "stylers": [{"visibility": "off"}]
  },
  { "featureType": "road.local",
      "elementType": "labels",
      "stylers": [{"visibility": "off"}]
  },
  { "featureType": "road.local",
      "elementType": "labels.text.fill",
      "stylers": [{"color": "#9e9e9e"}]
  },
  { "featureType": "transit.line",
      "elementType": "geometry",
      "stylers": [{"color": "#e5e5e5"}]
  },
  { "featureType": "transit.station",
      "elementType": "geometry",
      "stylers": [{"color": "#eeeeee"}]
  },
  { "featureType": "water",
      "elementType": "geometry",
      "stylers": [{"color": "#c9c9c9"}]
  },
  { "featureType": "water",
      "elementType": "labels.text.fill",
      "stylers": [{"color": "#9e9e9e"}]
  }
  ];
var map;
var censusMin = Number.MAX_VALUE, censusMax = -Number.MAX_VALUE;
var month;
var day;
var year;
var date;
const monthNames = ["January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];
//const STATES = ["36","09","34"];
//const STATES = ["36"];

function initMap() {
  // load the map of NYC
  map = new google.maps.Map(document.getElementById('map'), {
    center: {lat: 40.7606809, lng: -73.9231722},
    zoom: 10,
    styles: mapStyle,
    scrollwheel: false
  });

  // Set the date to today's date
  d = new Date();
  month = monthNames[d.getMonth()];
  day = d.getDate();
  year = d.getFullYear();

  document.getElementById('data-value').textContent = "";
  //document.getElementById('data-box').style.display = 'block';

  // Add styling to the map
  map.data.setStyle(mapStyle);
  
  map.data.setStyle(styleFeature);
  map.data.addListener('mouseover', mouseInToRegion);
  map.data.addListener('mouseout', mouseOutOfRegion);
  
  // census tract polygons only need to be loaded once, do them now
  loadMapShapes();
  
}; 
  
/**
* Applies a gradient style based on the 'census_variable' column.
* This is the callback passed to data.setStyle() and is called for each row in
* the data set.  Check out the docs for Data.StylingFunction.
*
* @param {google.maps.Data.Feature} feature
*/
function styleFeature(feature) {
  var low = [5, 69, 54];  // color of smallest datum
  var high = [151, 83, 34];   // color of largest datum

  // delta represents where the value sits between the min and max
  var delta = (feature.getProperty('census_variable') - censusMin) /
      (censusMax - censusMin);

  var color = [];
  for (var i = 0; i < 3; i++) {
    // calculate an integer color based on the delta
    color[i] = (high[i] - low[i]) * delta + low[i];
  }

  // determine whether to show this shape or not
  var showRow = true;
  if (feature.getProperty('census_variable') == null ||
      isNaN(feature.getProperty('census_variable'))) {
    showRow = false;
  }

  var outlineWeight = 0.5, zIndex = 1;
  if (feature.getProperty('state') === 'hover') {
    outlineWeight = zIndex = 2;
  }

  return {
    strokeWeight: outlineWeight,
    strokeColor: '#fff',
    zIndex: zIndex,
    fillColor: 'hsl(' + color[0] + ',' + color[1] + '%,' + color[2] + '%)',
    fillOpacity: 0.75,
    visible: showRow
  };
}

function getBorough(county){
  var borough = "000";
  //console.log(type(county));
  if (county == "061"){
    // Manhattan / New York County
    borough = "1";
  } 
  else if (county == "047"){
    // Brooklyn / Kings County
    borough = "3";
  }
  else if (county == "005"){
    // Bronx County
    borough = "2";
  }
  else if (county == "085"){
    // Staten Island / Richmond County
    borough = "5";
  }
  else if (county == "081"){
    // Queens County 081
    borough = "4";
  }

  return borough;
}

/**
 * Loads the census data from a simulated API call to the US Census API.
 *
 * @param {string} variable
 */
function loadCensusData(address) {
  // load the requested variable from the census API (using local copies)
  var xhr = new XMLHttpRequest();
  xhr.open('GET', address);
  xhr.onload = function() {
    var censusData = JSON.parse(xhr.response);

    censusData.forEach(function(row) {
      
      var censusVariable = Math.round(parseFloat(row['rate']));
      var geoID = row['tract'];

      var county = row['county'];
      var tract = geoID.substring(5,11);

      //identify borough using county
      var id = getBorough(county) + tract;
      
      try {
        map.data
        .getFeatureById(id)
        .setProperty('census_variable', censusVariable);
      } catch (error) {
        //console.log(id);
      } 

    });

    
    var original = 'https://storage.googleapis.com/www.census2020map.com/orig_36.json';
    loadOriginalData(original);

  };
  xhr.send();

}

/**
 * Loads the census data from a simulated API call to the US Census API.
 *
 * @param {string} variable
 */
 function loadOriginalData(address) {
  // load the requested variable from the census API (using local copies)
  var xhr = new XMLHttpRequest();
  xhr.open('GET', address);
  xhr.send();
  xhr.onload = function() {
    var censusData = JSON.parse(xhr.response);

    censusData.forEach(function(row) {
      
      var censusVariable = Math.round(parseFloat(row['rate']));
      var geoID = row['tract'];

      var county = row['county'];
      var tract = geoID.substring(5,11);

      //identify borough using county
      var id = getBorough(county) + tract;
      
      try {
        var currentVariable = map.data
          .getFeatureById(id)
          .getProperty('census_variable');

        console.log(geoID,currentVariable, censusVariable);
        censusVariable = currentVariable - censusVariable;

        map.data
        .getFeatureById(id)
        .setProperty('census_variable', censusVariable);

        // keep track of min and max values
        if (censusVariable < censusMin) {
          censusMin = censusVariable;
        }
        if (censusVariable > censusMax) {
          censusMax = censusVariable;
          console.log('Updating censusMax to: ', censusMax, ' because ', geoID, ' has ', censusVariable, 'as rate');
        }
      } catch (error) {
        //console.log(id);
      } 

      

    });


    // update and display the legend
    document.getElementById('census-min').textContent =
        censusMin.toLocaleString();
    document.getElementById('census-max').textContent =
        censusMax.toLocaleString();

  };
  

}

  /**
 * Responds to the mouse-in event on a map shape (state).
 *
 * @param {?google.maps.MouseEvent} e
 */
function mouseInToRegion(e) {
  // set the hover state so the setStyle function can change the border
  e.feature.setProperty('state', 'hover');

  // update the label
  var percent = (e.feature.getProperty('census_variable') - censusMin) /
      (censusMax - censusMin) * 100;

 // update the label
 document.getElementById('data-label').textContent =
      e.feature.getProperty('BoroName') + " Tract " + e.feature.getProperty('CT2010');
  document.getElementById('data-value').textContent =
      e.feature.getProperty('census_variable') + '%';
  document.getElementById('data-box').style.display = 'block';
  document.getElementById('data-caret').style.display = 'block';
  document.getElementById('data-caret').style.paddingLeft = percent + '%';
}

/**
 * Responds to the mouse-out event on a map shape (state).
 *
 * @param {?google.maps.MouseEvent} e
 */
 function mouseOutOfRegion(e) {
  // reset the hover state, returning the border to normal
  e.feature.setProperty('state', 'normal');
}

function getRndInteger(min=-100, max=100) {
  return Math.floor(Math.random() * (max - min)) + min;
}   

/** Loads the state boundary polygons from a GeoJSON source. */
function loadMapShapes() {
  // load US state outline polygons from a GeoJson file
  map.data.loadGeoJson('https://opendata.arcgis.com/datasets/5e1d9acbb2d4490795c48f1b03f7f730_0.geojson', 
    { idPropertyName: 'BoroCT2010' });

  // wait for the request to complete by listening for the first feature to be
  // added
  google.maps.event.addListenerOnce(map.data, 'addfeature', function() {
    var prediction = 'https://storage.googleapis.com/www.census2020map.com/state_36.json';
    loadCensusData(prediction);
  });

}