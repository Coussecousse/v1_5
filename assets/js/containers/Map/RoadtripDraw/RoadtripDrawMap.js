import React, { useState, useRef, useEffect } from "react";
import styles from '../Map.module.css';
import config from "../../../config/locationIQ";

export default function RoadtripDrawMap({country, roads}) {
    const [map, setMap] = useState(null);
    const [zoom, setZoom] = useState(null);
    const [center, setCenter] = useState(null);
    const mapRef = useRef(null);

    useEffect(() => {
        if (map) {
            if (country.length == 0) return;
            map.setCenter([country.lon, country.lat]);
            map.setZoom(5);
        }
    }, [roads, country]);

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
