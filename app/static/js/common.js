'use strict';
let token = 'pk.eyJ1Ijoic29yaW5iaXJpZXNjdSIsImEiOiJjam4yM2Z6cGcyMHN2M3FxbHZ3cmJ3N3RwIn0.UJ3jRN4-4yictRsdXBMhWQ';
let map;
let results_obj = {
    _results: "",
    get: function (name) {
        return this["_" + name]
    },
    set: function (name, value) {
        this["_" + name] = value;
        console.log(this._results)
    }
}

// let parameters = {
//     _amenity : "",
//     _page : 0,
//     _per_page : 0,
//     get : function() {return this.page},
//     set : function(amenity, page, per_page) {
//         this._page = page;
//         this._per_page = per_page;
//     }
// }

document.addEventListener("DOMContentLoaded", function (event) {
    map = L.map('mapbox').setView([45.764, 4.8357], 12);

    let gl = L.mapboxGL({
        accessToken: token,
        style: 'mapbox://styles/mapbox/streets-v9'
    }).addTo(map);

    map.locate({
        setView: true,
        maxZoom: 16
    });
    map.on('locationfound', onLocationFound);

    const toilets_button = document.getElementById("toilets-div");
    toilets_button.addEventListener("click", function () {
        get_results();
    });

});

// function get user location
// function zoom map to user location

// function show markers on map
// function plot route on map

function onLocationFound(e) {
    var radius = e.accuracy / 2;

    L.marker(e.latlng).addTo(map);
    L.circle(e.latlng, radius).addTo(map);
}


// function get results
function get_results(obj, amenity_type = "toilets", page = 1, per_page = 10) {
    let url = `http://localhost:8000/poi/${amenity_type}/${page}/${per_page}`
    fetch(url)
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

}