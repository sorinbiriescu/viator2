'use strict'
let token = 'pk.eyJ1Ijoic29yaW5iaXJpZXNjdSIsImEiOiJjam4yM2Z6cGcyMHN2M3FxbHZ3cmJ3N3RwIn0.UJ3jRN4-4yictRsdXBMhWQ'
let map
let POILayer
let userLocationLayer
let watchLocationID
const url = `https://sorinbiriescu.pythonanywhere.com/poi/`

let resultsObj = {
  _results: '',

  get: function (name) {
    return this['_' + name]
  },

  set: function (name, value) {
    this['_' + name] = value
    showResultsOnMap(this._results.results)
  }
}

let userLocationObj = {
  _location_latitude: null,
  _location_longitude: null,
  _location_accuracy: null,
  _update_map_view: false,
  get: function (name) {
    return this['_' + name]
  },

  set: function (parameter, value) {
    this['_' + parameter] = value

    if (!hasNull(userLocationObj)) {
      this.showLocation()
      this._update_map_view = false
    }
    // console.log(this._location_latitude, this._location_longitude, this._update_map_view)
  },

  showLocation: function () {
    removeLayer(map, userLocationLayer)
    const userLatLng = L.latLng(this._location_latitude, this._location_longitude)
    const markerIcon = createCustomMarkerIcon('#D35400')
    userLocationLayer = createMarker(userLatLng, markerIcon)
    userLocationLayer.addTo(map)
    if (this._update_map_view === true) {
      map.flyTo(userLatLng, 18)
    }
  },

  voidLocation: function () {
    this._location_latitude = null
    this._location_longitude = null
    this._location_accuracy = null
  }
}

let parameters = {
  _amenity: null,
  _page: 1,
  _per_page: 10,

  get: function (parameter) {
    return this['_' + parameter]
  },

  set: function (parameter, value) {
    this['_' + parameter] = value

    if (!hasNull(parameters) && !hasNull(userLocationObj)) {
      getResults(
        this._amenity,
        this._page,
        this._per_page,
        userLocationObj.get('location_latitude'),
        userLocationObj.get('location_longitude')
      )
    }
  }
}

let watchLocationOptions = {
  enableHighAccuracy: false,
  timeout: 3000,
  maximumAge: 0
}

document.addEventListener('DOMContentLoaded', function (event) {
  map = L.map('mapbox').setView([45.764, 4.8357], 12)

  let gl = L.mapboxGL({
    accessToken: token,
    style: 'mapbox://styles/mapbox/streets-v9'
  })
  gl.addTo(map)

  // Disable double click which will be used for the user to manually enter his location
  map.doubleClickZoom.disable()

  // Add the "Show my location" button on the map
  let userPositionMapBtn = L.control()

  userPositionMapBtn.options = {
    position: 'bottomright'
    // control position - allowed: 'topleft', 'topright', 'bottomleft', 'bottomright'
  }

  // Change the behaviour of the double click on the map
  map.addEventListener('dblclick', setUserLocationManually)

  userPositionMapBtn.onAdd = function () {
    this._div = L.DomUtil.create('button', 'leaflet-bar leaflet-control leaflet-control-custom button')
    this._div.innerHTML = '<i class="fas fa-map-pin"></i>'
    this._div.addEventListener('pointerup', function () {
      event.stopPropagation()
      userLocationObj.voidLocation()
      if (watchLocationID) {
        navigator.geolocation.clearWatch(watchLocationID)
        watchLocationID = null
      }
      userLocationObj.set('update_map_view', true)
      watchLocationID = navigator.geolocation.watchPosition(getUserLocation, watchLocationErrors, watchLocationOptions)
    })
    this._div.addEventListener('pointerdown', function () {
      event.stopPropagation()
      console.log('triggered')
    })
    return this._div
  }

  userPositionMapBtn.addTo(map)

  const toiletsBtn = document.getElementById('toilets-btn')
  toiletsBtn.addEventListener('click', function () {
    parameters.set('amenity', this.getAttribute('amenity'))
  })

  const drinkingWaterBtn = document.getElementById('drinking-water-btn')
  drinkingWaterBtn.addEventListener('click', function () {
    parameters.set('amenity', this.getAttribute('amenity'))
  })
})

/**
 * *** Pure function ***
 * Check if any of an object's properties is null. Used to check, for examples,
 * if the user's location object has all the coordinates
 * @param {Object} target - The object to check for null values
 * @return {boolean} - returns true or false
 */
function hasNull (target) {
  for (var member in target) {
    if (target[member] === null) { return true }
  }
  return false
};

// /**
//  * *** Pure function ***
//  * Sets an object's properties to null. Used to set, for example, the user's
//  * location object to null so its update functions don't trigger
//  * @param {Object} target - The object to check for null values
//  * @return {boolean} - returns true or false
//  */
// function setNull (target) {
//   for (var member in target) {
//     if (typeof target[member] !== 'function') {
//       target[member] = null
//     }
//   }
//   return true
// };

function setUserLocationManually (e) {
  userLocationObj.voidLocation()

  if (watchLocationID) {
    navigator.geolocation.clearWatch(watchLocationID)
    watchLocationID = null
  }

  const coords = e.latlng
  userLocationObj.set('update_map_view', false)
  userLocationObj.set('location_latitude', coords.lat)
  userLocationObj.set('location_longitude', coords.lng)
  userLocationObj.set('location_accuracy', 20)
};

function getUserLocation (position) {
  userLocationObj.voidLocation()

  userLocationObj.set('location_latitude', position.coords.latitude)
  userLocationObj.set('location_longitude', position.coords.longitude)
  userLocationObj.set('location_accuracy', position.coords.accuracy)
};

/**
 * *** Pure function ***
 * Returns to the console a message depending on the error code
 * @param {Object} error - The object to check for null values
 */
function watchLocationErrors (error) {
  switch (error.code) {
    case error.PERMISSION_DENIED:
      console.log('User denied the request for Geolocation.')
      break
    case error.POSITION_UNAVAILABLE:
      console.log('Location information is unavailable.')
      break
    case error.TIMEOUT:
      console.log('The request to get user location timed out.')
      break
    case error.UNKNOWN_ERROR:
      console.log('An unknown error occurred.')
      break
  }
}

function removeLayer (mapObject, layerName) {
  if (mapObject.hasLayer(layerName)) {
    mapObject.removeLayer(layerName)
  }
}

function createMarker (latlng, markerIcon) {
  const marker =  L.marker(latlng, {
    icon: markerIcon })

  return marker
};

function createCustomMarkerIcon (color) {
  const markerHtmlStyles = `

        width: 3rem;
        height: 3rem;
        display: block;
        left: -1.5rem;
        top: -1.5rem;
        position: relative;`

  const customIcon = L.divIcon({
    className: 'custom-pin',
    iconAnchor: [0, 24],
    labelAnchor: [-6, 0],
    popupAnchor: [0, -36],
    html: `
        <div style="${markerHtmlStyles}">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path fill="${color}" d="M256 0C167.6 0 96 71.6 96 160c0 24.8 5.6 48.2 15.7 69.1C112.2 230.3 256 512 256 512l142.6-279.4C409.7 210.8 416 186.2 416 160 416 71.6 344.4 0 256 0zM256 256c-53 0-96-43-96-96s43-96 96-96c53 0 96 43 96 96S309 256 256 256z"/>
        </svg>
        </div>
        `
  })

  return customIcon
};

function showResultsOnMap (geojson) {
  function onEachFeature (feature, layer) {
    let popupContent = ''
    if (feature.properties && feature.properties.name) {
      popupContent += feature.properties.name
    }
    layer.bindPopup(popupContent)
  }

  if (map.hasLayer(POILayer)) {
    map.removeLayer(POILayer)
  }

  if (geojson !== '') {
    POILayer = L.geoJson(geojson, {
      onEachFeature: onEachFeature
    }).addTo(map)
    let bounds = POILayer.getBounds()
    map.fitBounds(bounds)
  }
};

// function plot route on map

// function get results
function getResults (amenityType, page, perPage, userCoordsLat, userCoordsLng) {
  const reqParams = {
    'amenity': amenityType,
    'page': page,
    'per_page': perPage,
    'user_coords_lat': userCoordsLat,
    'user_coords_long': userCoordsLng
  }

  fetch(url, {
    method: 'POST', // *GET, POST, PUT, DELETE, etc.
    mode: 'cors', // no-cors, cors, *same-origin
    cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
    credentials: 'same-origin', // include, same-origin, *omit
    headers: {
      'Content-Type': 'application/json; charset=utf-8'
      // "Content-Type": "application/x-www-form-urlencoded",
    },
    redirect: 'follow', // manual, *follow, error
    referrer: 'no-referrer', // no-referrer, *client
    body: JSON.stringify(reqParams) // body data type must match "Content-Type" header
  })
    .then(
      function (response) {
        return response.json()
      }
    )
    .then(
      function (json) {
        resultsObj.set('results', json)
      }
    )
    .catch(function (error) {
      console.log(error)
    })
};
