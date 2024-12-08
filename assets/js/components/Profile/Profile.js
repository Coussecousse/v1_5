import React, { useState, useEffect } from 'react';
import styles from './Profile.module.css'
import formStyles from '../../containers/Form/Form.module.css';
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
                    setUserPic(userPic);
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
                        <span className={`loader ${formStyles.loader} ${formStyles.loaderGreen}`}></span>
                        <span className={`loader-text ${formStyles.loaderTextGreen}`}>Chargement...</span>
                    </div>)
                : (
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