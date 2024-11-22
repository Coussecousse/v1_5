import React, { useEffect, useState, useRef } from "react";
import styles from './Map.module.css'
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import config from "../../config/locationIQ";

export default function Map({ jsonLocation, setSelectionnedLocation=null, zoom=1 }) {
    const [map, setMap] = useState(null);
    const mapRef = useRef(null);

    useEffect(() => {
        if (map && jsonLocation) {
            // If the jsonLocation is an array, we take the first element
            // Otherwise, we take the jsonLocation
            let informations = 
            jsonLocation.length ? jsonLocation[0] : jsonLocation;

            map.setCenter([informations.lon, informations.lat]);
            map.setZoom(zoom);

            if (map.markers) {
                map.markers.forEach(marker => marker.remove());
            }
            map.markers = [];
            
            if (jsonLocation.length) {
                // const localisations = jsonLocation.slice(1);
                const localisations = jsonLocation;
                localisations.forEach(localisation => {
                    createElementOnMap(localisation);
                })

                if (setSelectionnedLocation) setSelectionnedLocation(localisations[0]);
            } else {
                createElementOnMap(jsonLocation);
                if (setSelectionnedLocation) setSelectionnedLocation(jsonLocation);
            }
            
            if (map.markers.length) {
                map.markers[0].togglePopup();
            }
        }
    }, [jsonLocation, map]);

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
        if (map) return;
        locationiq.key = config.key;

        const newMap = new maplibregl.Map({
            container: mapRef.current,
            style: locationiq.getLayer("Streets"), // stylesheet location
            center: [0, 0], // starting position [lng, lat]
            zoom: zoom // starting zoom
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
        <div ref={mapRef} className={styles.map}></div>
    )
}