import React from "react";
import styles from './CardRoadtrip.module.css';
import RoadtripDrawMap from "../../Map/RoadtripDraw/RoadtripDrawMap";
import { Link } from "react-router-dom";
import paths from "../../../config/paths";

export default function CardRoadtrip({roadtrip, index}) {

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
                <div>
                    <h2 className={styles.title}>{roadtrip.title}</h2>
                    <div className={styles.smallInformations}>
                        <p><span className={styles.spanInformations}><span className={styles.worldIcon}></span>Pays :</span>{roadtrip.country}</p>
                        <p><span className={styles.spanInformations}><span className={styles.moneyIcon}></span>Budget :</span>{displayBudget()}</p>
                    </div>
                </div>
                <p className={styles.description}>{truncateDescription(roadtrip.description, 255)}</p>
                <small>
                    <Link className={`link ${styles.link}`} to={paths.DETAILS_ROADTRIP.replace(':uid', roadtrip.uid)}>Plus de détails...</Link>
                </small>
            </div>
        </div>
    )
}