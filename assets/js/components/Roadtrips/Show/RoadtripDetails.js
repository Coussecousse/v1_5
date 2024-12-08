import React, { useState, useEffect } from "react";
import roadtripsStyles from '..//Roadtrips.module.css';
import styles from './RoadtripDetails.module.css';  
import formStyles from '../../../containers/Form/Form.module.css'
import RoadtripDrawMap from "../../../containers/Map/RoadtripDraw/RoadtripDrawMap";
import neutralPic from '../../../../images/ProfilePic/Neutral/neutral.png';
import axios from "axios";
import { Link } from "react-router-dom";
import paths from "../../../config/paths";
import { useNavigate } from "react-router-dom";

export default function RoadtripDetails() {
    const [roadtrip, setRoadtrip] = useState(null);
    const [loading, setLoading] = useState(true);
    const [userPic, setUserPic] = useState(null);
    const [flashMessage, setFlashMessage] = useState(null);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [currentUser, setCurrentUser] = useState(null);
    const navigate = useNavigate();

    // -- Carousel functions --
    const nextSlide = () => {
        setCurrentIndex((prevIndex) => 
            prevIndex < roadtrip.pics.length - 1 ? prevIndex + 1 : prevIndex
        );
    };
    
    const prevSlide = () => {
        setCurrentIndex((prevIndex) => 
            prevIndex > 0 ? prevIndex - 1 : prevIndex
        );
    };

    useEffect(() => {
        const uid = window.location.pathname.split("/").pop();

        const profilePromise = axios.get('/api/profile')
            .then(response => {
                setCurrentUser(response.data.user);
            })
            .catch(error => {
                console.error('Error fetching user profile:', error);
                flashMessage({ error: 'Une erreur est survenue lors de la recherche de profil' });
        });

        const roadtripPromise = axios.get(`/api/roadtrip/search/${uid}`)
            .then(response => {
                setRoadtrip(response.data);

                // Set userPic if it exists, otherwise keep null
                if (response.data.user && response.data.user.profile_pic) {
                    setUserPic(response.data.user.profile_pic);
                }
            })
            .catch(error => {
                console.error('Error fetching roadtrip data', error);
                setFlashMessage({ error: 'Une erreur est survenue lors de l\'affichage du roadtrip' });
            })
            
        Promise.all([profilePromise, roadtripPromise])	
            .finally(() => {
                setLoading(false);
            });
        
    }, []);

    // -- Budget --
    const displayBudget = () => {
        switch(roadtrip.budget) {
            case 1:
                return "€";
            case 2:
                return "€€";
            case 3:
                return "€€€";
            default:
                return "€";
        }
    }

    // -- Report -- 
    const handleReport = () => {
        setLoading(true);

        axios.post('/api/roadtrip/report', { roadtripId: roadtrip.uid })
            .then(response => {
                setFlashMessage({ type: 'success', message: 'Roadtrip signalé' });
            })
            .catch(error => {
                console.error('Error reporting roadtrip:', error);
                setFlashMessage({ type: 'error', message: 'Erreur lors du signalement du roadtrip' });
            })
            .finally(() => {setLoading(false)});
    }

    // -- Add to favorite --
    const handleAddFavorite = () => {
        setLoading(true);

        axios.post('/api/roadtrip/favorite', { roadtripId: roadtrip.uid })
            .then(response => {
                setFlashMessage({ type: 'success', message: 'Roadtrip ajouté à vos favoris' });
            })
            .catch(error => {
                console.error('Error adding roadtrip to favorite:', error);
                setFlashMessage({ type: 'error', message: 'Erreur lors de l\'ajout du roadtrip à vos favoris' });
            })
            .finally(() => {setLoading(false)});
    }

    // -- Delete roadtrip --
    const handleDeleteRoadtrip = () => {
        setLoading(true);
        window.scrollTo(0,0);
    
        if (window.confirm('Voulez-vous vraiment supprimer ce roadtrip ?')) {
            axios.delete(`/api/roadtrip/${roadtrip.uid}`)
                .then(response => {
                    setFlashMessage({ type: 'success', message: 'Roadtrip supprimé' });
                    setTimeout(() => {
                        navigate(`${paths.ROADTRIPS}?deleted=1`);
                    }, 2000);
                })
                .catch(error => {
                    console.error('Error deleting roadtrip:', error);
                    setFlashMessage({ type: 'error', message: 'Erreur lors de la suppression du roadtrip' });
                })
                .finally(() => { setLoading(false); });
        } else {
            setLoading(false);
        }
    };

    return (
        <section className={`first-section ${styles.section}`}>
            <h1 className={`typical-title ${styles.title}`}>Détails du roadtrip</h1>
            <div className={styles.container}>
                {loading ? (
                    <div className={`${formStyles.loaderContainer} loader-container`}>
                        <span className={`loader ${formStyles.loader} ${formStyles.loaderGreen}`}></span>
                        <span className={`loader-text ${formStyles.loaderTextGreen}`}>Chargement...</span>
                    </div>
                ) : (
                    <>  
                        {flashMessage && flashMessage.type === 'error' ? (
                            <div className={`flash flash-${flashMessage.type} ${formStyles.flashGreen}`}>
                                {flashMessage.message}
                            </div>
                        ) : (
                            <>
                                {flashMessage && (
                                    <div className={`flash flash-${flashMessage.type} ${formStyles.flashGreen}`}>
                                        {flashMessage.message}
                                    </div>
                                )}
                                <div className={styles.titleContainer}>
                                    <h2 className={styles.secondTitle}>{roadtrip.title}</h2>
                                    <div className={styles.smallInformations}>
                                        <p>
                                            <span className={styles.spanInformations}>
                                                <span className={styles.worldIcon}></span>Pays :
                                            </span>
                                            {roadtrip.country}
                                        </p>
                                        <p>
                                            <span className={styles.spanInformations}>
                                                <span className={styles.moneyIcon}></span>Budget :
                                            </span>
                                            {displayBudget()}
                                        </p>
                                    </div>
                                </div>
                                <div className={styles.map}>
                                    <RoadtripDrawMap
                                        country={roadtrip.country}
                                        roads={roadtrip.roads}
                                        firstPlace={null}
                                    />
                                </div>
                                <div className={styles.informations}>
                                    {userPic ? (
                                        <picture className={styles.profilePic}>
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
                                                alt="Image de roadtrip"
                                            />
                                        </picture>
                                    ) : (
                                        <div
                                            className={styles.profilPic}
                                            style={{ backgroundImage: `url(${neutralPic})` }}
                                        ></div>
                                    )}
                                    {roadtrip.description && (<p className={styles.description}>{roadtrip.description}</p>)}
                                </div>
                                {(roadtrip.pics && roadtrip.pics.length > 0) && (
                                    <div className={styles.carouselContainer}>
                                        <button className={`${styles.prev} ${styles.button}`} onClick={prevSlide} disabled={currentIndex === 0} aria-label="Precedent">❮</button>
                                        <div className={styles.carouselWrapper} style={{ transform: `translateX(-${currentIndex * 100}%)` }}>
                                            {roadtrip.pics.map((pic, index) => (
                                                <picture className={styles.img} key={index}>
                                                    <source
                                                        srcSet={`/uploads/roadtrip_pics/extraLarge/${pic}`}
                                                        media="(min-width: 1200px)"
                                                    />
                                                    <source
                                                        srcSet={`/uploads/roadtrip_pics/large/${pic}`}
                                                        media="(min-width: 990px)"
                                                    />
                                                    <source
                                                        srcSet={`/uploads/roadtrip_pics/medium/${pic}`}
                                                        media="(min-width: 768px)"
                                                    />
                                                    <img
                                                        src={`/uploads/roadtrip_pics/small/${pic}`}
                                                        alt="Image du roadtrip"
                                                    />
                                                </picture>
                                            ))}
                                        </div>
                                        <button className={`${styles.next} ${styles.button}`} onClick={nextSlide} disabled={currentIndex === roadtrip.pics.length - 1} aria-label="Suivant">❯</button>
                                    </div>
                                )}
                                {roadtrip.user.uid == currentUser.uid ? 
                                    (
                                        <div className={styles.buttonsContainer}>
                                            <Link to={paths.UPDATE_ROADTRIP.replace(':uid', roadtrip.uid)} className={styles.contribButton}>Modifier votre roadtrip</Link>
                                            <button onClick={handleDeleteRoadtrip} className={styles.contribButton} >Supprimer ce roadtrip</button>
                                        </div>
                                    ): (
                                        <div className={styles.buttonsContainer}>
                                            <button onClick={handleReport}>Signaler ce roadtrip</button>
                                            <button onClick={handleAddFavorite}>Ajouter à vos favoris</button>
                                        </div>
                                    )}
                            </>
                        )}
                    </>
                )}
            </div>
        </section>
    );
}
