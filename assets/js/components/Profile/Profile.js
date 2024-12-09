import React, { useState, useEffect } from 'react';
import styles from './Profile.module.css';
import formStyles from '../../containers/Form/Form.module.css';
import axios from 'axios';
import ProfileNavigation from '../../containers/Profile/ProfileNavigation/ProfileNavigation';
import Parameters from '../../containers/Profile/Parameters/Parameters';
import Roadtrips from '../../containers/Profile/Roadtrips/Roadtrips';
import Activities from '../../containers/Profile/Activities/Activities';
import Administration from '../../containers/Profile/Administration/Administration';

export default function Profile() {
    const [user, setUser] = useState(null);
    const [userLogin, setUserLogin] = useState(null);
    const [loading, setLoading] = useState(true);
    const [userPic, setUserPic] = useState(null);
    const [isOpen, setIsOpen] = useState({
        parameters: true,
        roadtrips: false,
        activities: false,
        administration: false
    });

    // Fetch user data on component mount
    useEffect(() => {
        // Get the uid in the url if there's one
        const uid = window.location.pathname.split("/").pop();

        const url = uid && uid !== 'profile' ? `/api/profile/search/${uid}` : '/api/profile';        
        const userPromise = axios.get(url)
            .then(response => {
                setUser(response.data.user);
                const userPic = response.data.user.profile_pic;
                if (userPic) {
                    setUserPic(userPic);
                }
            })
            .catch(error => {
                console.error('Error fetching user profile:', error);
            });

        const currentUserPromise = uid ? 
            axios.get('/api/profile')
            .then(response => {
                setUserLogin(response.data.user)
            })
            .catch(error => {
                console.error('Error fetching user profile:', error);
            }) : null;

        Promise.all([userPromise, currentUserPromise].filter(Boolean))
        .finally(() => setLoading(false));
    }, []);

    // Handle section switching
    const handleContainersProfile = (container) => {
        setIsOpen({
            parameters: container === 0,
            roadtrips: container === 1,
            activities: container === 2,
            administration: container === 3
        });
    };

    return (
        <section className={`first-section ${styles.section}`}>
            <h1 className={`typical-title ${styles.title}`}>Profil</h1>
            <div className={styles.container}>
                {loading ? (
                    <div className={`${styles.loaderContainer} loader-container`}>
                        <span className={`loader ${formStyles.loader} ${formStyles.loaderGreen}`}></span>
                        <span className={`loader-text ${formStyles.loaderTextGreen}`}>Chargement...</span>
                    </div>
                ) : (
                    <>
                        {/* Pass handleContainersProfile to ProfileNavigation */}
                        <ProfileNavigation handleContainersProfile={handleContainersProfile} isOpen={isOpen} user={user} userLogin={userLogin} />
                
                        {isOpen.parameters && <Parameters userPic={userPic} user={user} userLogin={userLogin}/>}
                        {isOpen.roadtrips && <Roadtrips user={user} setCurrentUser={userLogin ? setUserLogin : setUser} userLogin={userLogin}/>}
                        {isOpen.activities && <Activities user={user} setCurrentUser={userLogin ? setUserLogin : setUser} userLogin={userLogin}/>}
                        {isOpen.administration && <Administration />}
                    </>
                )}
            </div>
        </section>
    );
}
