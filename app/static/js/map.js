'use strict'
import {addWatch} from './common-pure.js'

const token = 'pk.eyJ1Ijoic29yaW5iaXJpZXNjdSIsImEiOiJjam4yM2Z6cGcyMHN2M3FxbHZ3cmJ3N3RwIn0.UJ3jRN4-4yictRsdXBMhWQ'
let userLocationLayer
let userPositionMapBtn

export const initMap = (div) => {
    const map = L.map(div, {
        center: [45.764, 4.8357],
        zoom: 12,
        tap: true,
        touchZoom: true,
        doubleClickZoom: false
    })
    
    const gl = L.mapboxGL({
        accessToken: token,
        style: 'mapbox://styles/mapbox/streets-v9'
    })
    gl.addTo(map)

    return map
}


export const removeLayer = (mapInstance, layerName) => {
    // if (mapInstance.hasLayer(layerName)) {
    //     mapInstance.removeLayer(layerName)
    // }
    try {
        mapInstance.removeLayer(layerName)
    }
    catch {
    }
}


export const addLocationBtn = (mapInstance, dispatchFunc) => {
    try {
        mapInstance.removeControl(userPositionMapBtn)
    }
    catch {
    }

    userPositionMapBtn = L.control()
    // debugger;
    userPositionMapBtn.options = {
        position: 'bottomright'
        // control position - allowed: 'topleft', 'topright', 'bottomleft', 'bottomright'
    }

    userPositionMapBtn.onAdd = function () {
        this._div = L.DomUtil.create('button', 'leaflet-bar leaflet-control leaflet-control-custom button')
        this._div.innerHTML = '<i class="fas fa-map-pin"></i>'
        this._div.addEventListener('click', () => {dispatchFunc(addWatch(dispatchFunc))})
        return this._div
    }
    // debugger;
    userPositionMapBtn.addTo(mapInstance)
}
