import React, { useEffect, useState } from "react";
import activitiesStyles from '../Activities.module.css';
import formStyles from '../../../containers/Form/Form.module.css';
import axios from "axios";
import ActivityDetailsCarousel from "../../../containers/Activity/DetailsCardCarousel/ActivityDetailsCarousel";

export default function ActivityDetails() {
    const [activity, setActivity] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const uid = window.location.pathname.split("/").pop();

        axios.get(`/api/activities/search/${uid}`)
            .then(response => {
                setActivity(response.data);
                setLoading(false);
            })
            .catch(error => {
                console.error('Error fetching activity', error);
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
            </div>
        </section>
    );
}

