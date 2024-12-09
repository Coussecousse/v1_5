import React from "react";
import paths from "../../../config/paths";
import styles from './Parameters.module.css'
import profileStyles from '../../../components/Profile/Profile.module.css'
import { Link } from "react-router-dom";

export default function Parameters({userPic, user}) {
    return (
        <div className={`${styles.informationsContainer}`}>
            {userPic ? 
            (
                <picture className={styles.profilePick}>
                    <source 
                        srcSet={`/uploads/profile_pics/extraLarge/${userPic}`} 
                        media="(min-width: 1200px)" 
                    />
                    <source 
                        srcSet={`/uploads/profile_pics/large/${userPic}`} 
                        media="(min-width: 990px)" 
                    />
                    <source 
                        srcSet={`/uploads/profile_pics/medium/${userPic}`} 
                        media="(min-width: 768px)" 
                    />
                    <img 
                        src={`/uploads/profile_pics/small/${userPic}`} 
                        alt="Image de profil" 
                    />
                </picture>
            ) : 
            (
                <div className={styles.profilPic} 
                    style={{ backgroundImage: `url(${neutralPic})` }}
                ></div>
            )}
            <span className={`${profileStyles.spanDiviser}`}></span>
            <div className={`${styles.textContainer}`}>
                <p><span>Nom d'utilisateur :</span> {user.username}</p>
            </div>
            <span className={`${profileStyles.spanDiviser}`}></span>
            <div className={`${styles.textContainer}`}>
                <p><span>Email :</span> {user.email}</p>
            </div>
            <span className={`${profileStyles.spanDiviser}`}></span>
            <div className={`${styles.passwordTextContainer}`}>
                <p><span>Mot de passe : </span></p>
                <Link to={paths.RESET_PASSWORD} className={`${styles.passwordLink} link`}>    
                    <div className={styles.icon}></div>
                    Changer son mot de passe</Link>
            </div>
            <span className={`${profileStyles.spanDiviser}`}></span>
            <Link to={paths.PROFILE_CHANGE_INFORMATIONS} className={`small-button ${profileStyles.button
            }`}>Modifier les informations</Link>
        </div>
    )
}