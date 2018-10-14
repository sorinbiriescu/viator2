'use strict';
let token = 'pk.eyJ1Ijoic29yaW5iaXJpZXNjdSIsImEiOiJjam4yM2Z6cGcyMHN2M3FxbHZ3cmJ3N3RwIn0.UJ3jRN4-4yictRsdXBMhWQ';
let map;
let POI_layer;
let user_location_layer
const url = `https://sorinbiriescu.pythonanywhere.com/poi/`

let results_obj = {
    _results: "",

    get: function (name) {
        return this["_" + name]
    },

    set: function (name, value) {
        this["_" + name] = value;
        show_markers_on_map(this._results.results)
    }
};

let user_location = {
    _location_latitude: null,
    _location_longitude: null,
    _location_accuracy: null,
    get: function (name) {
        return this["_" + name]
    },

    set: function (parameter, value) {
        this["_" + parameter] = value;

        if (!has_Null(user_location)) {
            show_user_location(this._location_latitude, this._location_longitude);
        }
    }
};

let parameters = {
    _amenity: null,
    _page: 1,
    _per_page: 10,

    get: function (parameter) {
        return this["_" + parameter]
    },

    set: function (parameter, value) {
        this["_" + parameter] = value;

        if (!has_Null(parameters) && !has_Null(user_location)) {
            get_results(
                this._amenity,
                this._page,
                this._per_page,
                user_location.get("location_latitude"),
                user_location.get("location_longitude")
            )
        }
    }
};

document.addEventListener("DOMContentLoaded", function (event) {
    map = L.map('mapbox').setView([45.764, 4.8357], 12);

    let gl = L.mapboxGL({
        accessToken: token,
        style: 'mapbox://styles/mapbox/streets-v9'
    }).addTo(map);

    let ourCustomControl = L.Control.extend({
        options: {
            position: 'bottomright'
            //control position - allowed: 'topleft', 'topright', 'bottomleft', 'bottomright'
        },

        onAdd: function (map) {
            var container = L.DomUtil.create('div', 'leaflet-bar leaflet-control leaflet-control-custom');
            container.style.backgroundColor = 'white';
            container.style.width = '40px';
            container.style.height = '40px';
            container.onclick = function () {
                get_user_location();
            }
            return container;
        }
    });

    map.addControl(new ourCustomControl());

    const toilets_button = document.getElementById("toilets-btn");
    toilets_button.addEventListener("click", function () {
        parameters.set("amenity", this.getAttribute('amenity'))
    });

    const drinking_water_button = document.getElementById("drinking-water-btn");
    drinking_water_button.addEventListener("click", function () {
        parameters.set("amenity", this.getAttribute('amenity'))
    });

});



function has_Null(target) {
    for (var member in target) {
        if (target[member] == null)
            return true;
    }
    return false;
}


function get_user_location() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function (position) {
            user_location.set("location_latitude", position.coords.latitude)
            user_location.set("location_longitude", position.coords.longitude)
            user_location.set("location_accuracy", position.coords.accuracy)
        });
    } else {
        console.log("Geolocation is not supported by this browser.");
    }
}


function show_user_location(lat, lng) {
    const user_location = L.latLng(lat, lng)

    if (map.hasLayer(user_location_layer)) {
        map.removeLayer(user_location_layer)
    }

    user_location_layer = L.marker(user_location).addTo(map);
    map.setView(user_location_layer.getLatLng(), 16)
}


function show_markers_on_map(geojson) {
    function onEachFeature(feature, layer) {
        let popupContent = "";
        if (feature.properties && feature.properties.name) {
            popupContent += feature.properties.name;
        }
        layer.bindPopup(popupContent);
    }

    if (map.hasLayer(POI_layer)) {
        map.removeLayer(POI_layer)
    }

    if (geojson !== "") {
        POI_layer = L.geoJson(geojson, {
            onEachFeature: onEachFeature
        }).addTo(map);
        let bounds = POI_layer.getBounds()
        map.fitBounds(bounds)
    }
};

// function plot route on map


// function get results
function get_results(amenity_type, page, per_page, user_coords_lat, user_coords_long) {
    
    const req_params = {
        "amenity": amenity_type,
        "page": page,
        "per_page": per_page,
        "user_coords_lat": user_coords_lat,
        "user_coords_long": user_coords_long
    }

    fetch(url, {
            method: "POST", // *GET, POST, PUT, DELETE, etc.
            mode: "cors", // no-cors, cors, *same-origin
            cache: "no-cache", // *default, no-cache, reload, force-cache, only-if-cached
            credentials: "same-origin", // include, same-origin, *omit
            headers: {
                "Content-Type": "application/json; charset=utf-8",
                // "Content-Type": "application/x-www-form-urlencoded",
            },
            redirect: "follow", // manual, *follow, error
            referrer: "no-referrer", // no-referrer, *client
            body: JSON.stringify(req_params), // body data type must match "Content-Type" header
        })
        .then(
            function (response) {
                return response.json()
            }
        )
        .then(
            function (json) {
                results_obj.set("results", json)
                return
            }
        )
        .catch(function (error) {
            console.log(error);
        })
};