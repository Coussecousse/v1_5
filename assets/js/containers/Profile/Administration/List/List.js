import React from "react";
import { Link } from "react-router-dom";
import styles from './List.module.css';
import axios from "axios";

export default function List({data, type}) {
    const handleLink = (d) => {
        switch (type) {
            case "roadtrips":
                return `/roadtrips/${d.uid}`;
            case "activities":
                return `/activities/${d.uid}`;
            case "users":
                return `/users/${d.uid}`;
            default:
                return "#";
        }
    };

     // Handle Reset
    const handleReset = async (uid) => {
        try {
            await axios.get(`/api/administration/reset/${type}/${id}`);
            alert(`${type} ${id} has been reset.`);
        } catch (error) {
            console.error(error);
            alert(`Failed to reset ${type} ${id}.`);
        }
    };

    // Handle Delete
    const handleDelete = async (uid) => {
        try {
            await axios.get(`/api/administration/delete/${type}/${uid}`);
            alert(`${type} ${uid} has been deleted.`);
        } catch (error) {
            console.error(error);
            alert(`Failed to delete ${type} ${uid}.`);
        }
    };
    
    return (
        <ul className={styles.listContainer}>
            {data.map((d, index) => (
                <li key={index} className={styles.li}>
                    <Link to={handleLink} className={styles.link} target="_blank">
                    {type == 'users' ? d.username : d.title}</Link>
                    <div className={styles.buttonsContainer}>
                        <span>Signalement : {d.report}
                        </span>
                        <small><button className={styles.button} onClick={() => handleReset(d.uid)}>Réinitialiser</button></small>
                        <small><button className={styles.button} onClick={() => handleDelete(d.uid)}>Supprimer</button></small>
                    </div>
                </li>
            ))}
        </ul>
    )
}