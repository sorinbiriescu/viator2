'use strict'
let token = 'pk.eyJ1Ijoic29yaW5iaXJpZXNjdSIsImEiOiJjam4yM2Z6cGcyMHN2M3FxbHZ3cmJ3N3RwIn0.UJ3jRN4-4yictRsdXBMhWQ'
let map
let userLocationLayer
let watchID

const userLocationObj = {
    _location_latitude: null,
    _location_longitude: null,
    _location_accuracy: null,
    _update_map_view: false,
}

const watchLocationOptions = {
    enableHighAccuracy: false,
    timeout: 3000,
    maximumAge: 0
}

document.addEventListener('DOMContentLoaded', function (event) {
    map = L.map('mapbox')
    map.setView([45.764, 4.8357], 12)

    let gl = L.mapboxGL({
        accessToken: token,
        style: 'mapbox://styles/mapbox/streets-v9'
    })
    gl.addTo(map)

    // Add the "Show my location" button on the map
    let userPositionMapBtn = L.control()

    userPositionMapBtn.options = {
        position: 'bottomright'
        // control position - allowed: 'topleft', 'topright', 'bottomleft', 'bottomright'
    }

    userPositionMapBtn.onAdd = function (map) {
        this._div = L.DomUtil.create('button', 'leaflet-bar leaflet-control leaflet-control-custom button')
        this._div.innerHTML = '<i class="fas fa-map-pin"></i>'
        this._div.onclick = function () {
            //   getUserLocation()
            removeLocationWatch(watchID)
            watchID = addLocationWatch(watchID)
        }
        return this._div
    }

    userPositionMapBtn.addTo(map)

    // Change the behaviour of the double click on the map
    // map.addEventListener('dblclick', setUserLocationManually)

    const toiletsBtn = document.getElementById('toilets-btn')
    toiletsBtn.addEventListener('click', function () {
        parameters.set('amenity', this.getAttribute('amenity'))
    })

    const drinkingWaterBtn = document.getElementById('drinking-water-btn')
    drinkingWaterBtn.addEventListener('click', function () {
        parameters.set('amenity', this.getAttribute('amenity'))
    })

});

function getUserLocation(position) {
    // userLocationObj.voidLocation()

    const userLocationObj = {
        _location_latitude: position.coords.latitude,
        _location_longitude: position.coords.longitude,
        _location_accuracy: position.coords.accuracy,
        _update_map_view: false,
    }

    showUserLocation(position, true)
    // return userLocationObj
};

function showUserLocation(position, updateView) {
    const userCoords = L.latLng(position.coords.latitude, position.coords.longitude)

    // if (map.hasLayer(userLocationLayer)) {
    //   map.removeLayer(userLocationLayer)
    // }

    removeLayer(userLocationLayer)
    userLocationLayer = L.marker(userCoords).addTo(map)

    // addMarkerToMap(userCoords, '#D35400')
    if (updateView === true) {
        map.flyTo(userCoords, 18)
    }
};

function removeLayer(layer) {
    if (map.hasLayer(layer)) {
        map.removeLayer(layer)
    }
}

function addLocationWatch() {
    // if (watchLocationID) {
    //     navigator.geolocation.clearWatch(watchLocationID)
    //     watchLocationID = null
    // }
    // userLocationObj.set('update_map_view', true)
    const watchLocationID = navigator.geolocation.watchPosition(getUserLocation, watchLocationErrors, watchLocationOptions)

    return watchLocationID
};

function removeLocationWatch(watch) {
    if (watch) {
        navigator.geolocation.clearWatch(watch)
        // watch = null
    }

}

function watchLocationErrors(error) {
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
};