'use strict'

let token = 'pk.eyJ1Ijoic29yaW5iaXJpZXNjdSIsImEiOiJjam4yM2Z6cGcyMHN2M3FxbHZ3cmJ3N3RwIn0.UJ3jRN4-4yictRsdXBMhWQ'
let map
let userLocationLayer
let watchID
let userPositionMapBtn
let zoomToLocation


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
    map = L.map('mapbox', {
        center: [45.764, 4.8357],
        zoom: 12,
        tap: true,
        touchZoom: true
    })
    // map.setView([45.764, 4.8357], 12)

    let gl = L.mapboxGL({
        accessToken: token,
        style: 'mapbox://styles/mapbox/streets-v9'
    })
    gl.addTo(map)

    map.doubleClickZoom.disable()

    // const toiletsBtn = document.getElementById('toilets-btn')
    // toiletsBtn.addEventListener('click', function () {
    //     parameters.set('amenity', this.getAttribute('amenity'))
    // })

    // const drinkingWaterBtn = document.getElementById('drinking-water-btn')
    // drinkingWaterBtn.addEventListener('click', function () {
    //     parameters.set('amenity', this.getAttribute('amenity'))
    // })

    function app(state) {
        console.log(state)
        view(dispatch, state)

        function dispatch(action) {
            const nextState = updateState(state, action);
            app(nextState);
        }
    }

    app(appState);
    console.log(map)

});

function view(dispatch, state) {
    showUserLocation(state)
    // showResultsOnMap(state)
    addLocationBtn(dispatch)

    let timer
    // let start_action = ["mousedown", "touchstart", "dblclick", "pointerdown"]
    // start_action.map(function (evt) {
    //     map.addEventListener(evt, function (e) {
    //         console.log("touch start")
    //         clearTimeout(timer);
    //         timer = setTimeout(function () {
    //             dispatch(updateUserLocationManually(e))
    //         }, 1000)

    //     })
    // })

    // let stop_action = ["mouseup", "mouseleave", "touchend", "touchleave", "pointermove", "pointerup"]
    // stop_action.map(function (evt) {
    //     map.addEventListener(evt, function (e) {
    //         clearTimeout(timer)
    //     })
    // })
    map.addEventListener('contextmenu', e => dispatch(updateUserLocationManually(e)))

}

// reducer
function updateState(state, action) {
    switch (action.type) {
        case 'SET_USER_LOCATION_WATCH':
            console.log(zoomToLocation)
            zoomToLocation = true
            console.log(zoomToLocation)
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
}



function addWatch(payload) {
    return {
        type: 'SET_USER_LOCATION_WATCH',
        payload: payload
    };
}


function updateUserLocation(coords) {
    return {
        type: 'UPDATE_USER_LOCATION',
        payload: coords
    };
}

function updateUserLocationManually(coords) {
    return {
        type: 'UPDATE_USER_LOCATION_MANUALLY',
        payload: coords
    };
}


function addLocationBtn(dispatch) {
    if (userPositionMapBtn) {
        map.removeControl(userPositionMapBtn)
    }

    userPositionMapBtn = L.control()

    userPositionMapBtn.options = {
        position: 'bottomright'
        // control position - allowed: 'topleft', 'topright', 'bottomleft', 'bottomright'
    }

    userPositionMapBtn.onAdd = function () {
        this._div = L.DomUtil.create('button', 'leaflet-bar leaflet-control leaflet-control-custom button')
        this._div.innerHTML = '<i class="fas fa-map-pin"></i>'
        this._div.addEventListener('click', function () {
            dispatch(addWatch(dispatch))
        })
        return this._div
    }
    userPositionMapBtn.addTo(map)

}


function showUserLocation(state) {

    if (map.hasLayer(userLocationLayer)) {
        map.removeLayer(userLocationLayer)
    }

    if (state.userLocation.latitude && state.userLocation.longitude) {
        const userCoords = L.latLng(state.userLocation.latitude, state.userLocation.longitude)
        userLocationLayer = L.marker(userCoords).addTo(map)

        if (zoomToLocation === true) {
            map.flyTo(userCoords, 18)
        }

        zoomToLocation = false
    }
}


function addLocationWatch(dispatch, state) {
    removeLocationWatch()
    watchID = navigator.geolocation.watchPosition(e => dispatch(updateUserLocation(e)), updateUserLocation, state.watchLocationOptions)
};


function removeLocationWatch() {
    if (watchID) {
        navigator.geolocation.clearWatch(watchID)
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