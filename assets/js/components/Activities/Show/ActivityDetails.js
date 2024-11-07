import React, { useEffect, useState } from "react";
import activitiesStyles from '../Activities.module.css';
import styles from './ActivityDetails.module.css';
import formStyles from '../../../containers/Form/Form.module.css';
import ActivityDetailsCarousel from "../../../containers/Activity/DetailsCardCarousel/ActivityDetailsCarousel";
import Map from "../../../containers/Map/Map";
import config from "../../../config/locationIQ";
import axios from "axios";

export default function ActivityDetails() {
    const [activity, setActivity] = useState(null);
    const [loading, setLoading] = useState(true);
    const [JSONLocation, setJSONLocation] = useState(null);
    const [flashMessage, setFlashMessage] = useState(null);

    useEffect(() => {
        const uid = window.location.pathname.split("/").pop();
    
        // Fetch activity details
        axios.get(`/api/activities/search/${uid}`)
            .then(response => {
                const activityData = response.data;
                setActivity(activityData);
    
                
                const { lat, lng } = activityData;

                return axios.get(`https://eu1.locationiq.com/v1/reverse?key=${config.key}&lat=${lat}&lon=${lng}&format=json&`);
            })
            .then(response => {
                if (response.data) {
                    setJSONLocation(response.data);
                    setLoading(false);
                } else {
                    setFlashMessage({ map: 'Erreur lors de l\'affichage de la carte' });
                }
            })
            .catch(error => {
                console.error('Error fetching data', error);
                setFlashMessage({ error: 'Une erreur est survenue lors de l\'affichage de l\'activité ou de la carte' });
            });
    }, []);

    return (
        <section className={`first-section ${activitiesStyles.section}`}>
            <h1 className={`typical-title ${activitiesStyles.title}`}>Détails de l'activité</h1>
            <div className={activitiesStyles.actvitiesContainer}>
                {loading ? (
                    <div className={`${activitiesStyles.loaderContainer} loader-container`}>
                        <span className={`loader ${formStyles.loader} ${formStyles.loaderGreen}`}></span>
                        <span className={`loader-text ${formStyles.loaderTextGreen}`}>Chargement...</span>
                    </div>
                ) : 
                (
                    <>
                        <h2 className={activitiesStyles.secondTitle}>{activity.display_name}</h2>
                        { activity.opinions.map((opinion,index) => (
                            <ActivityDetailsCarousel key={index} activity={activity} opinion={opinion} />
                        ))}
                    </>
                )}
                {JSONLocation && (
                    <div className={styles.map}>
                        <Map jsonLocation={JSONLocation} zoom={10}/>
                    </div>
                )}
            </div>
        </section>
    );
}

