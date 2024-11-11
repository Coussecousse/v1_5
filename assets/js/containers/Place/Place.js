import React from "react";
import styles from './Place.module.css';

export default function Place({place, index}) {
    console.log(place);
    return (
        <div className={styles.place}>
            <h3>{index + 1}. {place.display_name}</h3>
            <small role="button" aria-label="Boutton supprimer le lieu">Supprimer le lieu</small>
        </div>
    )
}