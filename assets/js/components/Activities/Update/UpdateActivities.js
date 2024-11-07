import React, { useState, useEffect, useRef } from "react";
import activitiesStyles from '../Activities.module.css';
import formStyles from '../../../containers/Form/Form.module.css';
import styles from './UpdateActivities.module.css';
import axios from "axios";

export default function UpdateActivities() {
    const [user, setUser] = useState(null);
    const [activity, setActivity] = useState(null);
    const [loading, setLoading] = useState(true);
    const [flashMessage, setFlashMessage] = useState(null);
    const [errors, setErrors] = useState({});
    const [description, setDescription] = useState(""); 
    const [activityPics, setActivityPics] = useState([]); 
    const inputPicFile = useRef(null);

    useEffect(() => {
        const uid = window.location.pathname.split("/").pop();

        const profilePromise = axios.get('/api/profile')
            .then(response => setUser(response.data.user))
            .catch(error => console.error('Error fetching user profile:', error));

        const activityPromise = axios.get(`/api/activities/search/${uid}`)
            .then(response => {
                setActivity(response.data);
            })
            .catch(error => {
                console.error('Error fetching activity or location data', error);
                setFlashMessage({ error: 'Une erreur est survenue lors de l\'affichage de l\'activité ou de la carte' });
            });

        Promise.all([profilePromise, activityPromise])
            .finally(() => setLoading(false));
    }, []);

    useEffect(() => {
        if (!user || !activity) return;

        const userOpinion = activity.opinions.find(opinion => opinion.user.uid === user.uid) || [];

        setActivityPics(userOpinion.pics.map(pic => ({ name: pic })));
        setDescription(userOpinion.description);
    }, [user, activity]);

    const handleDescriptionChange = (e) => {
        setDescription(e.target.value);
    };

    const handleFileChange = (e) => {
        const newFiles = Array.from(e.target.files);
        setActivityPics((prevActivityPics) => [...prevActivityPics, ...newFiles]);
    };

    const deleteImage = (index) => {
        setActivityPics((prevActivityPics) => {
            const newActivityPics = [...prevActivityPics];
            newActivityPics.splice(index, 1);
            return newActivityPics;
        });
    };

    useEffect(() => {
        if (activityPics.length >= 6) {
            if (inputPicFile.current) {
                inputPicFile.current.disabled = true;
                setErrors({ ...errors, activity_pics: "Vous avec atteint le maximum de photos autorisées" });
            }
        } else {
            if (inputPicFile.current) {
                setErrors((prevErrors) => {
                    const { activity_pics, ...rest } = prevErrors;
                    return rest; 
                });
                inputPicFile.current.disabled = false;
            }
        }
    }, [activityPics])

    const handleSubmit = e => {
        e.preventDefault();

        setLoading(true);
        setFlashMessage(null);

        const formData = new FormData();
        formData.append('description', description);
        activityPics.forEach(pic => {
            if (pic instanceof File) {
                formData.append('activity_pics[]', pic);
            } else {
                formData.append('activity_pics[]', pic.name);
            }
        });

        axios.post(`/api/activities/update/${activity.uid}`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        })
        .then(response => {
            setFlashMessage({ type: 'success', message: 'Votre contribution a été mise à jour.' });
            setErrors({});
        })
        .catch(error => {
            if (error.response) {
                setFlashMessage({ type: 'error', message: 'Une erreur est survenue lors de la mise à jour.' });
                setErrors(error.response.data.errors || {});
            } else {
                setFlashMessage({ type: 'error', message: 'Erreur de réseau.' });
            }
        })
        .finally(() => {
            setLoading(false);
        });

    }

    return (
        <section className={`first-section ${activitiesStyles.section}`}>
            <h1 className={`typical-title ${activitiesStyles.title}`}>Modifier ma contribution</h1> 
            <div className={`${activitiesStyles.mapContainer}`}>
                { loading ? (
                    <div className={`${activitiesStyles.loaderContainer} loader-container`}>
                        <span className={`loader ${formStyles.loader} ${formStyles.loaderGreen}`}></span>
                        <span className={`loader-text ${formStyles.loaderTextGreen}`}>Chargement...</span>
                    </div>
                ) : 
                (
                <>
                    <h2 className={activitiesStyles.secondTitle}>{activity.display_name}</h2>
                    <form className={`${activitiesStyles.mapForm} ${styles.form}`} onSubmit={handleSubmit}>
                        {flashMessage && (
                            <div className={`flash flash-${flashMessage.type} ${formStyles.flashGreen}`}>
                                {flashMessage.message}
                            </div>
                        )}
                        <div>
                            <div className={`${activitiesStyles.input} input2_elementsContainer`}>
                                <label htmlFor="description">Description* :</label>
                                <div className={`input2_container`}>
                                    <textarea  
                                        id="description" 
                                        name="description"
                                        placeholder="Saisir une description"
                                        value={description}
                                        onChange={handleDescriptionChange}
                                    ></textarea>
                                </div>
                            </div>
                            {errors.description && <small className={`smallFormError ${formStyles.errorGreen}`}><div className={activitiesStyles.errorIcon}></div>{errors.description}</small>}
                        </div>
                        {activityPics.length > 0 && (
                            <div className={styles.userPicContainer}>
                                <p>Les photos que vous avez partagées :</p>
                                <div className={styles.userPicActivity}>
                                    {activityPics.map((pic, index) => (
                                        <div key={index} className={styles.picContainer}>
                                            <div 
                                                className={styles.deleteButton} 
                                                aria-label={`Supprimer image numéro ${index + 1}`}
                                                onClick={() => deleteImage(index)}
                                            >Supprimer</div>
                                            <img  
                                                src={Object.keys(pic).length === 1 ? `/uploads/activity_pics/${pic.name}` : URL.createObjectURL(pic)} 
                                                alt={`Photo de l'activité`} 
                                                className={styles.img} />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                        <div>
                            <div className={`${activitiesStyles.input} input2_elementsContainer`}>
                                <label htmlFor="activity_pics">Photos :</label>
                                <div className={`input2_container`}>
                                    <input 
                                        type="file" 
                                        id="activity_pics" 
                                        name="activity_pics" 
                                        accept="image/png, image/jpeg, image/jpg" 
                                        multiple
                                        onChange={handleFileChange}
                                        ref={inputPicFile}
                                    />
                                </div>
                                <small className={styles.indication}>Vous ne pouvez ajouter que 6 photos</small>
                                {activityPics.length > 0 && (
                                    <div className={styles.fileNamesContainer}>
                                        <p>Fichiers sélectionnés :</p>
                                        <ul className={styles.fileList}>
                                            {activityPics.map((file, index) => (
                                                <li key={index}>{file.name}</li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </div>
                            {errors.activity_pics && <small className={`smallFormError ${formStyles.errorGreen}`}><div className={activitiesStyles.errorIcon}></div>{errors.activity_pics}</small>}
                        </div>
                        <small className={`input2_required ${formStyles.requiredGreen}`}>* Requis</small>
                        <input className={`form-button ${activitiesStyles.button}`} type="submit" value="Ajouter" />            
                    </form>
                </>
                )}
            </div>
        </section>
    );
}
