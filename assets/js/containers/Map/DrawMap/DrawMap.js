import React, { useEffect, useState, useRef } from "react";
import styles from '../Map.module.css';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import polyline from '@mapbox/polyline';
import config from "../../../config/locationIQ";

export default function DrawMap({ drawJson, localisations }) {
    const [map, setMap] = useState(null);
    const mapRef = useRef(null);

    const addRouteToMap = (newMap) => {
        const route = drawJson.routes[0].geometry;
        const decodedPath = polyline.decode(route);

        if (newMap.getLayer('route')) {
            newMap.removeLayer('route');
            newMap.removeSource('route');
        }

        const geojsonRoute = {
            type: "Feature",
            geometry: {
                type: "LineString",
                coordinates: decodedPath.map(coord => [coord[1], coord[0]]) 
            }
        };

        newMap.addSource('route', {
            type: 'geojson',
            data: geojsonRoute
        });

        newMap.addLayer({
            id: 'route',
            type: 'line',
            source: 'route',
            layout: {
                'line-join': 'round',
                'line-cap': 'round'
            },
            paint: {
                'line-color': '#758C57',
                'line-width': 4
            }
        });

        // First Marker
        const startCoord = decodedPath[0];
        const startElement = document.createElement('div');
        startElement.className = styles.marker;
        startElement.style.backgroundImage = 'url(https://tiles.locationiq.com/static/images/marker50px.png)';
        startElement.style.width = '25px';
        startElement.style.height = '25px';
        startElement.style.backgroundSize = 'cover';
        const startPopup = new maplibregl.Popup({ offset: 25 })
            .setText(localisations[0].display_name);

        new maplibregl.Marker({ element: startElement })
            .setLngLat([startCoord[1], startCoord[0]])
            .setPopup(startPopup)
            .addTo(newMap);

        // Last Marker
        const endCoord = decodedPath[decodedPath.length - 1];
        const endElement = document.createElement('div');
        endElement.className = styles.marker;
        endElement.style.backgroundImage = 'url(https://tiles.locationiq.com/static/images/marker50px.png)';
        endElement.style.width = '25px';
        endElement.style.height = '25px';
        endElement.style.backgroundSize = 'cover';

        const endPopup = new maplibregl.Popup({ offset: 25 })
            .setText(localisations[1].display_name);

        new maplibregl.Marker({ element: endElement })
            .setLngLat([endCoord[1], endCoord[0]])
            .setPopup(endPopup)
            .addTo(newMap);
    };

    useEffect(() => {
        if (map) return;

        locationiq.key = config.key;
        const center = [
            (parseFloat(localisations[0].lng ? localisations[0].lng : localisations[0].lon) + parseFloat(localisations[1].lng ? localisations[1].lng : localisations[1].lon)) / 2,
            (parseFloat(localisations[0].lat) + parseFloat(localisations[1].lat)) / 2
        ];

        const newMap = new maplibregl.Map({
            container: mapRef.current,
            style: locationiq.getLayer("Streets"),
            center: center,
            zoom: 12
        });

        newMap.on('load', () => {
            addRouteToMap(newMap);
        });

        setMap(newMap);
    }, []);

    return (
        <>
            <div ref={mapRef} className={styles.map}></div>
            <div className={styles.informations}>
                <p>Distance: {(drawJson.routes[0].distance / 1000).toFixed(2)} km</p>
                <p>Temps estimé: {Math.round(drawJson.routes[0].duration / 60)} min</p>
            </div>
        </>
    );
}
