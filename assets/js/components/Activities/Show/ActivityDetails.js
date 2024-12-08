import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import activitiesStyles from '../Activities.module.css';
import styles from './ActivityDetails.module.css';
import formStyles from '../../../containers/Form/Form.module.css';
import ActivityDetailsCarousel from "../../../containers/Activity/DetailsCardCarousel/ActivityDetailsCarousel";
import Map from "../../../containers/Map/Map";
import config from "../../../config/locationIQ";
import paths from "../../../config/paths";
import axios from "axios";
import { Navigate } from "react-router-dom";

export default function ActivityDetails() {
    const [activity, setActivity] = useState(null);
    const [loading, setLoading] = useState(true);
    const [JSONLocation, setJSONLocation] = useState(null);
    const [flashMessage, setFlashMessage] = useState(null);
    const [currentUser, setCurrentUser] = useState(null);
    const [currentIndex, setCurrentIndex] = useState(0);
    const navigate = useNavigate();

    useEffect(() => {
        // Check if we return from a delete action
        const urlParams = new URLSearchParams(window.location.search);
        const deleted = urlParams.get('deleted');
        if (deleted) {
            setFlashMessage({ type: 'success', message: 'Le roadtrip a bien été supprimé.'});
        }
        const uid = window.location.pathname.split("/").pop();
    
        // A promise for each request to the api
        const profilePromise = axios.get('/api/profile')
            .then(response => {
                setCurrentUser(response.data.user);
            })
            .catch(error => {
                console.error('Error fetching user profile:', error);
            });
    
        const activityPromise = axios.get(`/api/activities/search/${uid}`)
            .then(response => {
                const activityData = response.data;
                setActivity(activityData);
    
                const { lat, lng } = activityData;
    
                return axios.get(`https://eu1.locationiq.com/v1/reverse?key=${config.key}&lat=${lat}&lon=${lng}&format=json&`);
            })
            .then(response => {
                if (response.data) {
                    setJSONLocation(response.data);
                } else {
                    setFlashMessage({ map: 'Erreur lors de l\'affichage de la carte' });
                }
            })
            .catch(error => {
                console.error('Error fetching activity or location data', error);
                setFlashMessage({ error: 'Une erreur est survenue lors de l\'affichage de l\'activité ou de la carte' });
            });
    
        // When we got all the informations :
        Promise.all([profilePromise, activityPromise])
            .finally(() => {
                setLoading(false);
        });

    }, []);

    const getUserContribution = () => {
        return activity.opinions.filter(opinion => opinion.user.uid === currentUser.uid);
    }

    // -- Carousel functions --
    const nextSlide = () => {
        setCurrentIndex((prevIndex) => 
            prevIndex < activity.opinions.length - 1 ? prevIndex + 1 : prevIndex
        );
    };
    
    const prevSlide = () => {
        setCurrentIndex((prevIndex) => 
            prevIndex > 0 ? prevIndex - 1 : prevIndex
        );
    };

    // -- Delete Activity Contribution -- 
    const handleDeleteActivityContribution = () => {
        setLoading(true);
        window.scrollTo(0,0);

        if (window.confirm('Voulez-vous vraiment supprimer votre contribution à cette activité ?')) {
            axios.delete(`/api/activities/${activity.uid}`)
                .then(response => {
                    setFlashMessage({ type: 'success', message: 'Activité supprimée' });
                    if (response.data.lastActivity) {
                        
                        setTimeout(() => {
                            navigate(`${paths.ACTIVITIES}?deleted=1`);
                        }, 2000);
                    } else {
                        setTimeout(() => {
                            window.location.reload();
                        }, 2000);               
                    }
                })
                .catch(error => {
                    console.error('Error deleting roadtrip:', error);
                    setFlashMessage({ type: 'error', message: 'Erreur lors de la suppression du roadtrip' });
                })
                .finally(() => { setLoading(false); });
        } else {
            setLoading(false);
        }
    }

    //  -- Report Activity --
    const handleReport = () => {
        setLoading(true);
        window.scrollTo(0,0);

        axios.post(`/api/activities/report/${activity.uid}`)
            .then(response => {
                setFlashMessage({ type: 'success', message: 'Activité signalée' });
            })
            .catch(error => {
                console.error('Error reporting activity:', error);
                setFlashMessage({ type: 'error', message: 'Erreur lors du signalement de l\'activité' });
            })
            .finally(() => { setLoading(false); });
    }

    return (
        <section className={`first-section ${activitiesStyles.section}`}>
            <h1 className={`typical-title ${activitiesStyles.title}`}>Détails de l'activité</h1>
            <div className={activitiesStyles.activitiesContainer}>
                {loading ? (
                    <div className={`${activitiesStyles.loaderContainer} loader-container`}>
                        <span className={`loader ${formStyles.loader} ${formStyles.loaderGreen}`}></span>
                        <span className={`loader-text ${formStyles.loaderTextGreen}`}>Chargement...</span>
                    </div>
                ) : 
                (
                    <>
                        {flashMessage && ( 
                            <div className={`flash flash-${flashMessage.type} ${formStyles.flashGreen}`}>
                                {flashMessage.message}
                            </div>
                        )}  
                        <h2 className={activitiesStyles.secondTitle}>{activity.display_name}</h2>
                        <div className={styles.opinionsCarousel}>
                            <div className={styles.opinionsCarouselWrapper} style={{ transform: `translateX(-${currentIndex * 100}%)` }}>
                                { activity.opinions.map((opinion,index) => (
                                    <ActivityDetailsCarousel key={index} activity={activity} opinion={opinion} />
                                ))}
                            </div>
                            {activity.opinions.length > 0 && (
                                <div className={styles.buttonsContainer}>
                                    <button onClick={prevSlide} disabled={currentIndex === 0} aria-label="Precedent" className={styles.button}>❮</button>
                                    <button onClick={nextSlide} disabled={currentIndex === activity.opinions.length - 1} aria-label="Precedent" className={styles.button}>❯</button>
                                </div>
                            )}
                        </div>
                        <div className={styles.contribButtonsContainer}>
                            <Link to={paths.UPDATE_ACTIVITY.replace(':uid', activity.uid)} className={styles.contribButton}>{getUserContribution().length > 0 ? 'Modifier ma contribution' : 'Ajouter ma contribution'}</Link>
                            {getUserContribution().length > 0 && <button className={styles.contribButton} onClick={handleDeleteActivityContribution}>Supprimer ma contribution</button>}
                            {getUserContribution().length === 0 && <button onClick={handleReport} className={styles.contribButton}>Signaler cette activité</button>}
                        </div>
                        <div className={styles.map}>
                            <Map jsonLocation={JSONLocation} zoom={10}/>
                        </div>
                    </>
                )}
            </div>
        </section>
    );
}

