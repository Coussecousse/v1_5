import React from 'react';
import styles from './Profile.module.css'
import paths from '../../config/paths';
import { Link } from 'react-router-dom';
import ProfileNavigation from '../../containers/Profile/ProfileNavigation/ProfileNavigation';

export default function Profile() {
    return (
        <section className={`first-section ${styles.section}`}>
            <h1 className={`typical-title ${styles.title}`}>Profil</h1>
            <div className={styles.container}>
                <ProfileNavigation />
                <div className={`${styles.informationsContainer}`}>
                    <div className={`${styles.profilePick}`}></div>
                    <span className={`${styles.spanDiviser}`}></span>
                    <div className={`${styles.textContainer}`}>
                        <p><span>Nom d'utilisateur :</span> Test</p>
                    </div>
                    <span className={`${styles.spanDiviser}`}></span>
                    <div className={`${styles.textContainer}`}>
                        <p><span>Email :</span> test@hotmail.com</p>
                    </div>
                    <span className={`${styles.spanDiviser}`}></span>
                    <div className={`${styles.passwordTextContainer}`}>
                        <p><span>Mot de passe : </span></p>
                        <Link to={paths.RESET_PASSWORD} className={`${styles.passwordLink} link`}>    
                            <div className={styles.icon}></div>
                            Changer son mot de passe</Link>
                    </div>
                    <span className={`${styles.spanDiviser}`}></span>
                    <Link to={paths.PROFILE_CHANGE_INFORMATIONS} className={`small-button ${styles.button}`}>Modifier les informations</Link>
                </div>
            </div>
        </section>
    )
}