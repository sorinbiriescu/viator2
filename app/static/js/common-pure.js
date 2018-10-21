'use strict'

let token = 'pk.eyJ1Ijoic29yaW5iaXJpZXNjdSIsImEiOiJjam4yM2Z6cGcyMHN2M3FxbHZ3cmJ3N3RwIn0.UJ3jRN4-4yictRsdXBMhWQ'
let map
let userLocationLayer
let watchID
// let userPositionMapBtn
let zoomToLocation

import {
    initMap,
    removeLayer,
    addLocationBtn
} from "./map.js";

const appState = {
    userLocation: {
        latitude: "",
        longitude: "",
        accuracy: ""
    },
    watchLocationOptions: {
        enableHighAccuracy: false,
        timeout: 3000,
        maximumAge: 0
    },
    parameters: {
        amenity: "",
        page: 1,
        perPage: 10
    },
    results: {}
}


document.addEventListener('DOMContentLoaded', function (event) {

    // const toiletsBtn = document.getElementById('toilets-btn')
    // toiletsBtn.addEventListener('click', function () {
    //     parameters.set('amenity', this.getAttribute('amenity'))
    // })

    // const drinkingWaterBtn = document.getElementById('drinking-water-btn')
    // drinkingWaterBtn.addEventListener('click', function () {
    //     parameters.set('amenity', this.getAttribute('amenity'))
    // })

    map = initMap('mapbox')

    function app(state) {
        const dispatch = (action) => {
            const nextState = reducer(state, action);
            app(nextState);
        }

        view(dispatch, state)
    }

    app(appState);

});

function view(dispatch, state) {
    showUserLocation(state)
    // showResultsOnMap(state)
    addLocationBtn(map, dispatch)
    // debugger;
};

// reducer
function reducer(state, action) {
    switch (action.type) {
        case 'SET_USER_LOCATION_WATCH':
            zoomToLocation = true
            removeLocationWatch()
            addLocationWatch(action.payload, state)
            return state

        case 'UPDATE_USER_LOCATION':
            return {
                ...appState,
                userLocation: {
                    latitude: action.payload.coords.latitude,
                    longitude: action.payload.coords.longitude,
                    accuracy: action.payload.coords.accuracy
                }
            };

        case 'UPDATE_USER_LOCATION_MANUALLY':
            zoomToLocation = true
            return {
                ...appState,
                userLocation: {
                    latitude: action.payload.latlng.lat,
                    longitude: action.payload.latlng.lng,
                    accuracy: 1
                }
            };

        default:
            return state;
    }
};


export const addWatch = (payload) => {
    return {
        type: 'SET_USER_LOCATION_WATCH',
        payload: payload
    }
};


function updateUserLocation(coords) {
    return {
        type: 'UPDATE_USER_LOCATION',
        payload: coords
    }
};


function updateUserLocationManually(coords) {
    return {
        type: 'UPDATE_USER_LOCATION_MANUALLY',
        payload: coords
    }
};


function showUserLocation(state) {

    removeLayer(map, userLocationLayer)

    if (state.userLocation.latitude && state.userLocation.longitude) {
        const userCoords = L.latLng(state.userLocation.latitude, state.userLocation.longitude)
        userLocationLayer = L.marker(userCoords).addTo(map)

        if (zoomToLocation === true) {
            map.flyTo(userCoords, 18)
        }

        zoomToLocation = false
    }
};


function addLocationWatch(dispatch, state) {
    removeLocationWatch()
    watchID = navigator.geolocation.watchPosition(e => dispatch(updateUserLocation(e)), watchLocationErrors, state.watchLocationOptions)
};


function removeLocationWatch() {
    if (watchID) {
        navigator.geolocation.clearWatch(watchID)
    }
};


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