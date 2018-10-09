'use strict';
let token = 'pk.eyJ1Ijoic29yaW5iaXJpZXNjdSIsImEiOiJjam4yM2Z6cGcyMHN2M3FxbHZ3cmJ3N3RwIn0.UJ3jRN4-4yictRsdXBMhWQ';
let map;

document.addEventListener("DOMContentLoaded", function (event) {
    map = L.map('mapbox').setView([45.764, 4.8357], 12);

    let gl = L.mapboxGL({
        accessToken: token,
        style: 'mapbox://styles/mapbox/streets-v9'
    }).addTo(map);

    map.locate({setView: true, maxZoom: 16});
    map.on('locationfound', onLocationFound);

});

// function get user location
// function zoom map to user location
// constructor fetch
// function get results

function onLocationFound(e) {
    var radius = e.accuracy / 2;

    L.marker(e.latlng).addTo(map);
    L.circle(e.latlng, radius).addTo(map);
}