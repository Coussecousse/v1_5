import React from "react";
import styles from './Place.module.css';

export default function Place({place, index}) {
    return (
        <div className={styles.placeContainer}>
            <h3>{index + 1}. {place.display_name}</h3>
            <small role="button" aria-label="Boutton supprimer le lieu">Supprimer le lieu</small>
        </div>
    )
}