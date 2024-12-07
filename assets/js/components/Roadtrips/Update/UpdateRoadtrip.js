import React, { useState, useEffect } from "react";
import styles from './UpdateRoadtrip.module.css';
import roadtripsStyles from '../Roadtrips.module.css';   
import formStyles from '../../../containers/Form/Form.module.css';
import CreateRoadtrip from "../Create/CreateRoadtrip";
import axios from "axios";

export default function UpdateRoadtrip() {
    const [roadtrip, setRoadtrip] = useState(null);
    const [flashMessage, setFlashMessage] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const uid = window.location.pathname.split("/").pop();
        
        axios.get(`/api/roadtrip/search/${uid}`)
            .then(response => {
                setRoadtrip(response.data);
                setFlashMessage(null); // Clear flash message on successful fetch
            })
            .catch(error => {
                setFlashMessage('Une erreur est survenue lors de la récupération des données du roadtrip');
                console.error('Error fetching roadtrip data:', error);
            })
            .finally(() => {
                setLoading(false); // Stop loader in both success and failure cases
            });
    }, []);

    return (
        <section className="first-section">
                {loading ? (
                <div className={styles.container}>
                    <div className={`${roadtripsStyles.loaderContainer} loader-container`}>
                        <span className={`loader ${formStyles.loader} ${formStyles.loaderGreen}`}></span>
                        <span className={`loader-text ${formStyles.loaderTextGreen}`}>Chargement...</span>
                    </div>
                </div>
                ) : flashMessage ? (
                    <div className={styles.container}>
                        <div className={`flash ${formStyles.flashGreen}`}>{flashMessage}</div>
                    </div>
                ) : (
                    <CreateRoadtrip roadtrip={roadtrip} />
                )}
        </section>
    );
}
