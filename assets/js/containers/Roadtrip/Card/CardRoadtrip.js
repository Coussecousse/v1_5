import React, { useEffect, useState } from "react";
import styles from './CardRoadtrip.module.css';
import RoadtripDrawMap from "../../Map/RoadtripDraw/RoadtripDrawMap";
import { Link } from "react-router-dom";
import paths from "../../../config/paths";
import axios from "axios";

export default function CardRoadtrip({roadtrip, index, currentUser, setCurrentUser}) {
    // -- Budget -- 
    const displayBudget = () => {
        switch(roadtrip.budget) {
            case 1 || '1':
                return "€";
            case 2 || '2':
                return "€€";
            case 3 || '3':
                return "€€€";
            default:
                return "€";
        }
    }

    // -- Description --
    const truncateDescription = (description, maxLength) => {
        if (!roadtrip.description) return;
        return description.length > maxLength
            ? description.substring(0, maxLength) + "..."
            : description;
    };
    
    // -- Favorites --
    const handleFavorite = () => {
        axios.post(`/api/roadtrip/favorite/${roadtrip.uid}`)
            .then(response => {
                const updatedUser = response.data.user;
                setCurrentUser(updatedUser);
            })
            .catch(error => {
                console.error('Error adding favorite:', error);
            });
    }

    return (
        <div key={index} className={styles.container}>
            <div className={styles.map}>
                <RoadtripDrawMap 
                    country={roadtrip.country}
                    roads={roadtrip.roads}
                    firstPlace={null} 
                />
            </div>
            <div className={styles.informations}>
                <div className={styles.topContainer}>
                    <div className={styles.titleContainer}>
                        <h3 className={styles.title}>{roadtrip.title}</h3>
                        <div className={styles.smallInformations}>
                            <p><span className={styles.spanInformations}><span className={styles.worldIcon}></span>Pays :</span>{roadtrip.country}</p>
                            <p><span className={styles.spanInformations}><span className={styles.moneyIcon}></span>Budget :</span>{displayBudget()}</p>
                        </div>
                    </div>
                    {currentUser.uid !== roadtrip.user.uid && (
                        currentUser.favorites.roadtrips.find(favorite => favorite.uid === roadtrip.uid) ? (
                            <button aria-label="retirer le favoris" onClick={handleFavorite} className={styles.fullHeart}></button>
                        ) : (
                            <button aria-label="Ajouter au favoris" onClick={handleFavorite} className={styles.emptyHeart}></button>
                        )
                    )}
                </div>
                <p className={styles.description}>{truncateDescription(roadtrip.description, 255)}</p>
                <small>
                    <Link className={`link ${styles.link}`} to={paths.DETAILS_ROADTRIP.replace(':uid', roadtrip.uid)}>Plus de détails...</Link>
                </small>
            </div>
        </div>
    )
}