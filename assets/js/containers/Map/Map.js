import React, { useEffect, useState } from "react";
import styles from './Map.module.css'
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import config from "../../config/locationIQ";

export default function Map({ jsonLocation, setSelectionnedLocation }) {
    const [map, setMap] = useState(null);

    useEffect(() => {
        if (map) {
            // If the jsonLocation is an array, we take the first element
            // Otherwise, we take the jsonLocation
            let informations = 
            jsonLocation.length ? jsonLocation[0] : jsonLocation;

            map.setCenter([informations.lon, informations.lat]);
            map.setZoom(4);

            if (map.markers) {
                map.markers.forEach(marker => marker.remove());
            }
            map.markers = [];
            
            if (jsonLocation.length) {
                const localisations = jsonLocation.slice(1);

                localisations.forEach(localisation => {
                    createElementOnMap(localisation);
                })
                setSelectionnedLocation(localisations[0]);
            } else {
                createElementOnMap(jsonLocation);
                setSelectionnedLocation(jsonLocation);
            }
            
            map.markers[0].togglePopup();
        }
    }, [jsonLocation]);

    const createElementOnMap = (localisation) => {
        const el = document.createElement('div');
        el.className = styles.marker;
        el.style.backgroundImage = 'url(https://tiles.locationiq.com/static/images/marker50px.png)';
        el.style.width = '25px';
        el.style.height = '25px';
        el.style.backgroundSize = 'cover';
        
        // Add a click event listener to the marker element
        el.addEventListener('click', () => {
            setSelectionnedLocation(localisation);
        });

        const popup = new maplibregl.Popup()
            .setHTML(localisation.display_name);
        
        // Create and add marker to the map
        const marker = new maplibregl.Marker({
            element: el
        })
            .setLngLat([localisation.lon, localisation.lat])
            .setPopup(popup)
            .addTo(map);

        // Keep track of markers
        map.markers.push(marker);
    }

    useEffect(() => {
        locationiq.key = config.key;

        const newMap = new maplibregl.Map({
            container: 'map',
            style: locationiq.getLayer("Streets"), // stylesheet location
            center: [0, 0], // starting position [lng, lat]
            zoom: 1 // starting zoom
        });

        setMap(newMap);

        // Clean-up to avoid memory leaks
        return () => {
            if (newMap) {
                newMap.remove();
            }
        };
    }, []);

    return(
        <div id="map"></div>
    )
}