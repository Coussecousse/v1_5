import React, { useState, useRef, useEffect } from "react";
import styles from '../Map.module.css';
import config from "../../../config/locationIQ";
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import polyline from "@mapbox/polyline";

export default function RoadtripDrawMap({country, roads, firstPlace}) {
    const [map, setMap] = useState(null);
    const [zoom, setZoom] = useState(null);
    const [center, setCenter] = useState(null);
    const mapRef = useRef(null);
    const [markers, setMarkers] = useState([]); 
    const [layersAndSourceId, setLayersAndSourceId] = useState([]);

    const resetMap = () => {
        markers.forEach(marker => {
            marker.remove();
        });
        setMarkers(prevMarkers => []);

        layersAndSourceId.forEach(id => {
            if (map.getLayer(id.layer)) map.removeLayer(id.layer);
            if (map.getSource(id.source)) map.removeSource(id.source);
        });
        setLayersAndSourceId(prevLayersAndSourceId => []);

        // Remove all html markers
        const markersElement = document.querySelectorAll(`.${styles.marker}`);
        markersElement.forEach(marker => marker.remove());  
    }

    const createBasicMarker = () => {
        const element = document.createElement('div');
        element.className = styles.marker;
        element.style.backgroundImage = 'url(https://tiles.locationiq.com/static/images/marker50px.png)';
        element.style.backgroundSize = 'cover';
        return element;
    }

    useEffect(() => {
        if (map) {
            if (markers.length > 0) {
                // Reset map
                resetMap();
            }

            if (roads.length > 0 && roads[0][0].waypoints) {
                const [lon, lat] = roads[0][0].waypoints[0].location
                map.setCenter([lon, lat]);
                map.setZoom(5);

                // Add roads
                roads.forEach((day, index) => {
                    AddDayToMap(day, index);
                })
            } else if (firstPlace) {
                map.setCenter([firstPlace.lng, firstPlace.lat]);
                map.setZoom(5);

                // Add only one marker :
                const element = createBasicMarker();
                element.style.width = '25px';
                element.style.height = '25px';
                // Popup
                const popup = new maplibregl.Popup({ offset: 25 });
                popup.setText(`Jours 1:\n${firstPlace.name}`);

                // Marker
                const marker = new maplibregl.Marker({ element })
                .setLngLat([firstPlace.lng, firstPlace.lat])
                .setPopup(popup)
                .addTo(map);

                setMarkers([...markers, marker]);

            } else if (Object.keys(country).length > 0) {
                map.setCenter([country.lon, country.lat]);
                map.setZoom(5);
            }
        }
    }, [roads, country, firstPlace]);

    const AddDayToMap = (day, index) => { 
        // Add roads
        day.forEach((road, roadIndex) => {
            road.waypoints.forEach((waypoint, waypointIndex) => {
                // Create marker element
                const element = createBasicMarker();

                // Check if it's the start of the day or the end of the day
                let marker;
                const popup = new maplibregl.Popup({ offset: 25 });
                if (roadIndex === 0 && waypointIndex === 0) {
                    element.style.width = '25px';
                    element.style.height = '25px';
                    
                    // Set the text of the popup
                    popup.setText(`Jour ${index + 1} :\n ${waypoint.name}`);
                } else {
                    // Intermediate points
                    element.style.width = '15px';
                    element.style.height = '15px';

                    // Set the text of the popup
                    popup.setText(`${waypoint.name}`);
                }
                // Attach the marker and popup to the map
                marker = new maplibregl.Marker({ element })
                .setLngLat([waypoint.location[0], waypoint.location[1]])
                .setPopup(popup)
                .addTo(map);

                // Add marker to the state
                setMarkers([...markers, marker]);
            });
            const decodedPath = polyline.decode(road.routes[0].geometry);

            const geojsonRoute = {
                type: "Feature",
                geometry: {
                    type: "LineString",
                    coordinates: decodedPath.map(coord => [coord[1], coord[0]])
                }
            };
            const routeSourceId = `route-source-${index}-${roadIndex}`;
            const routeLayerId = `route-layer-${index}-${roadIndex}`;
            setLayersAndSourceId(prevLayers => [...prevLayers, { source: routeSourceId, layer: routeLayerId }]);

            // Add source with a unique ID
            map.addSource(routeSourceId, {
                type: 'geojson',
                data: geojsonRoute
            });

            // Add layer with a unique ID
            map.addLayer({
                id: routeLayerId,
                type: 'line',
                source: routeSourceId,
                layout: {
                    'line-join': 'round',
                    'line-cap': 'round'
                },
                paint: {
                    'line-color': '#758C57',
                    'line-width': 4
                }
            });

        });
    }

    useEffect(() => {
        if (map) return;
        locationiq.key = config.key;

        const newMap = new maplibregl.Map({
            container: mapRef.current,
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
    }, [])

    return (
        <>
            <div ref={mapRef} className={styles.map}></div>
        </>
    )
}
