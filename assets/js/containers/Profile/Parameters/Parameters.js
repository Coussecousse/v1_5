import React, { useState } from "react";
import paths from "../../../config/paths";
import styles from './Parameters.module.css';
import profileStyles from '../../../components/Profile/Profile.module.css';
import formStyles from '../../Form/Form.module.css';
import { Link } from "react-router-dom";
import neutralPic from '../../../../images/ProfilePic/Neutral/neutral.png';
import axios from 'axios'; // Make sure axios is imported

export default function Parameters({ userPic, user, userLogin }) {
    const [flashMessage, setFlashMessage] = useState(null);
    const [loading, setLoading] = useState(false);

    // -- Report
    const handleReport = () => {
        setLoading(true);
        window.scrollTo(0, 0);

        axios.post(`/api/profile/report/${user.uid}`)
            .then(response => {
                setFlashMessage({ type: 'success', message: 'Utilisateur signalé' });
            })
            .catch(error => {
                console.error('Error reporting user:', error);
                setFlashMessage({ type: 'error', message: 'Erreur lors du signalement de l\'utilisateur' });
            })
            .finally(() => { setLoading(false); });
    };

    return (
        <div className={`${styles.informationsContainer}`}>
            {loading ? (
                <div className={`${styles.loaderContainer} loader-container`}>
                    <span className={`loader ${formStyles.loader} ${formStyles.loaderGreen}`}></span>
                    <span className={`loader-text ${formStyles.loaderTextGreen}`}>Chargement...</span>
                </div>
            ) : flashMessage ? (
                <div className={`flash flash-${flashMessage.type} ${formStyles.flashGreen}`}>
                    {flashMessage.message}
                </div>
            ) : null}

            {userPic ? (
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
            ) : (
                <div className={styles.profilPic} style={{ backgroundImage: `url(${neutralPic})` }}></div>
            )}
            <span className={`${profileStyles.spanDiviser}`}></span>
            <div className={`${styles.textContainer}`}>
                <p><span>Nom d'utilisateur :</span> {user.username}</p>
            </div>
            {!userLogin && (
                <>
                    <span className={`${profileStyles.spanDiviser}`}></span>
                    <div className={`${styles.textContainer}`}>
                        <p><span>Email :</span> {user.email}</p>
                    </div>
                    <span className={`${profileStyles.spanDiviser}`}></span>
                    <div className={`${styles.passwordTextContainer}`}>
                        <p><span>Mot de passe : </span></p>
                        <Link to={paths.RESET_PASSWORD} className={`${styles.passwordLink} link`}>
                            <div className={styles.icon}></div>
                            Changer son mot de passe
                        </Link>
                    </div>
                    <span className={`${profileStyles.spanDiviser}`}></span>
                    <Link to={paths.PROFILE_CHANGE_INFORMATIONS} className={`small-button ${profileStyles.button}`}>
                        Modifier les informations
                    </Link>
                </>
            )}
            {userLogin && (
                <button onClick={handleReport} className={`small-button ${profileStyles.button}`}>
                    Signaler cet utilisateur
                </button>
            )}
        </div>
    );
}
