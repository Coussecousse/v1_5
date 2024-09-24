import React, { useState, useEffect } from 'react';
import styles from './Profile.module.css'
import paths from '../../config/paths';
import { Link } from 'react-router-dom';
import neutralPic from '../../../images/ProfilePic/Neutral/neutral.png'
import ProfileNavigation from '../../containers/Profile/ProfileNavigation/ProfileNavigation';
import axios from 'axios';

export default function Profile() {

    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [userPic, setUserPic] = useState(null);

    useEffect(() => {
        axios.get('/api/profile')
            .then(response => {
                setUser(response.data.user);
                const userPic = response.data.user.profile_pic;
                if (userPic) {
                    setUserPic(`/uploads/profile_pics/${userPic}`);
                } else {
                    setUserPic(neutralPic);
                }
                setLoading(false);
            })
            .catch(error => {
                console.error('Error fetching user profile:', error);
                setLoading(false);
            });
    }, []);

    return (
        <section className={`first-section ${styles.section}`}>
            <h1 className={`typical-title ${styles.title}`}>Profil</h1>
            <div className={styles.container}>
                <ProfileNavigation />
                {loading ? (                            
                    <div className={`${styles.loaderContainer} loader-container`}>
                        <span className={`loader ${styles.loader}`}></span>
                        <span className={`loader-text ${styles.loaderText}`}>Chargement...</span>
                    </div>)
                : (
                    <div className={`${styles.informationsContainer}`}>
                        <div 
                            className={`${styles.profilePick}`} 
                            style={{ backgroundImage: `url(${userPic})` }}>
                        </div>
                        <span className={`${styles.spanDiviser}`}></span>
                        <div className={`${styles.textContainer}`}>
                            <p><span>Nom d'utilisateur :</span> {user.username}</p>
                        </div>
                        <span className={`${styles.spanDiviser}`}></span>
                        <div className={`${styles.textContainer}`}>
                            <p><span>Email :</span> {user.email}</p>
                        </div>
                        <span className={`${styles.spanDiviser}`}></span>
                        <div className={`${styles.passwordTextContainer}`}>
                            <p><span>Mot de passe : </span></p>
                            <Link to={paths.RESET_PASSWORD} className={`${styles.passwordLink} link`}>    
                                <div className={styles.icon}></div>
                                Changer son mot de passe</Link>
                        </div>
                        <span className={`${styles.spanDiviser}`}></span>
                        <Link to={paths.PROFILE_CHANGE_INFORMATIONS} className={`small-button ${styles.button
                        }`}>Modifier les informations</Link>
                    </div>
                )}
            </div>
        </section>
    )
}