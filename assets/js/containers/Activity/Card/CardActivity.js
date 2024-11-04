import React, { useState, useEffect } from "react";
import activityStyles from "../Activity.module.css";
import styles from "./CardActivity.module.css"; 
import { Link } from "react-router-dom";
import paths from "../../../config/paths";
import config from "../../../config/locationIQ";
import axios from "axios";
import DrawMap from "../../Map/DrawMap/DrawMap";
import Map from "../../Map/Map";

export default function CardActivity({ activity, index, selectionnedLocation }) {
    const maxPics = 3;
    const limitedPics = activity.pics.slice(0, maxPics); 
    const [showMap, setShowMap] = useState(false);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [drawJsonResponse, setDrawJsonResponse] = useState(null);
    const [localisations, setLocalisations] = useState(null);
    const [jsonFormatActivity, setJsonFormatActivity] = useState(null);   
    const [selectionnedLocationMap, setSelectionnedLocationMap] = useState(null);
    const [flashMessageMap, setFlashMessageMap] = useState(null);

    // -- Carousel functions --
    const nextSlide = () => {
        setCurrentIndex((prevIndex) => 
            prevIndex < activity.pics.length - 1 ? prevIndex + 1 : prevIndex
        );
    };
    
    const prevSlide = () => {
        setCurrentIndex((prevIndex) => 
            prevIndex > 0 ? prevIndex - 1 : prevIndex
        );
    };

    // -- Description --
    const truncateDescription = (description, maxLength) => {
        return description.length > maxLength
            ? description.substring(0, maxLength) + "..."
            : description;
    };

    // -- Render Map -- 
    useEffect(() =>{
        if (showMap) {
            if (selectionnedLocation){                
                axios.get(`https://eu1.locationiq.com/v1/directions/driving/${selectionnedLocation.lon},${selectionnedLocation.lat};${activity.lng},${activity.lat}?key=${config.key}&steps=true&alternatives=true&geometries=polyline&overview=full&`)
                .then(response => {
                    if (response.data) {
                        setDrawJsonResponse(response.data);
                        setLocalisations([selectionnedLocation, activity]);
                    } else {
                        getMap();
                    }
                })
                .catch(error => {
                    setFlashMessageMap('Une erreur est survenue.');
                    console.error('Error fetching location', error);
                });
            } else {
                getMap();
            }
        }
    }, [showMap]);
    
    const getMap = () => {

        const lat = activity.lat;
        const lng = activity.lng;

        axios.get(`https://eu1.locationiq.com/v1/reverse?key=${config.key}&lat=${lat}&lon=${lng}&format=json&`)
        .then(response => {
            setJsonFormatActivity(response.data);
        })
        .catch(error => {
            setFlashMessageMap('Une erreur est survenue.');
            console.error('Error fetching location', error);
        });
    }

    return (
        <div key={index} className={styles.allContainer}>
            <div className={`${styles.card} ${activityStyles.container}`}>
                <div className={`${activityStyles.carousel} ${styles.carousel}`}>
                {limitedPics.length > 0 && (
                <div className={styles.carouselContainer}>
                    {limitedPics.length > 1 && (
                        <button className={`${styles.prev} ${styles.button}`} onClick={prevSlide} disabled={currentIndex === 0}>❮</button>
                    )}
                    <div className={styles.carouselImgWrapper}
                    style={{ transform: `translateX(-${currentIndex * 100}%)` }}>
                        {limitedPics.map((pic, index) => (
                            <img
                                key={index}
                                src={`/uploads/activity_pics/${pic}`}
                                alt={activity.display_name}
                                className={`${styles.img}`}
                            />
                        ))}
                    </div>
                    {limitedPics.length > 1 && (
                        <button className={`${styles.next} ${styles.button}`} onClick={nextSlide} disabled={currentIndex === activity.pics.length - 1}>❯</button>
                    )}
                </div>
                )}
                </div>
                <div className={`${activityStyles.content} ${styles.content}`}>
                    <h4 className={styles.activityTitle}>{activity.display_name}</h4>
                    <p className={styles.activityDescription}>
                        {truncateDescription(activity.description, 255)}
                    </p>                
                    <p className={styles.activityDetails}><span className={`${styles.icon} ${styles.type}`}></span>{activity.type}</p>
                    <p className={styles.activityDetails}><span className={`${styles.icon} ${styles.pin}`}></span>{activity.country}</p>
                    {activity.distance && (
                        <p className={styles.activityDetails}>
                            <span className={`${styles.icon} ${styles.country}`}></span>
                            {activity.distance >= 1 
                                ? `${(activity.distance).toFixed(1)} km`  
                                : `${(activity.distance * 1000).toFixed(0)} m` 
                            }
                        </p>
                    )}
                    <div className={`${styles.detailsLinksContainer}`}>
                        <small><button className={styles.mapButton} onClick={() => setShowMap(!showMap)}>
                            {showMap ? 'Cacher la carte' : 'Voir la carte'}
                        </button></small>
                        <small><Link to={`${paths.ACTIVITIES}/${activity.uid}`} className={`link ${styles.link}`}>Plus de détails...</Link></small>
                    </div>
                </div>
            </div>
            { showMap && (
                <div className={styles.map}>
                    { flashMessageMap && <div className={styles.flashMessage}>{flashMessageMap}</div> }
                    { drawJsonResponse && (<DrawMap drawJson={drawJsonResponse} localisations={localisations} />) }
                    { jsonFormatActivity && (<Map jsonLocation={jsonFormatActivity} setSelectionnedLocation={setSelectionnedLocationMap} zoom={8} />) }
                </div>
                ) }
        </div>
    )
}