import React, { useEffect, useRef, useState } from "react";
import styles from './Day.module.css';
import createRoadtripStyles from '../../components/Roadtrips/Create/CreateRoadtrip.module.css';
import formStyles from '../Form/Form.module.css';
import Place from "../Place/Place";
import Map from "../Map/Map";
import config from "../../config/locationIQ";
import axios from "axios";

export default function Day({day, index, setDays, days}) {
    const [isOpen, setIsOpen] = useState(true);
    const [isOpenAdd, setIsOpenAdd] = useState({
        state : false,
        type: {
            place: false,
            activity: false
        }
    });  
    const [errors, setErrors] = useState({});
    const [newQueryLocation, setNewQueryLocation] = useState({});
    const refDayButton = useRef(null);  
    const refStage = useRef(null);
    const refAddContainer = useRef(null);
    const refAddPlaceContainer = useRef(null);
    const refAddActivityContainer = useRef(null);
    const refInputPlace = useRef(null);
    const refPlacesContainer = useRef(null);

    // -- Handle open --
    useEffect(() => {
        if (isOpen) {
            refDayButton.current?.classList.add(createRoadtripStyles.open);
            refStage.current?.classList.add(styles.open);
        } else {
            refDayButton.current?.classList.remove(createRoadtripStyles.open);
            refStage.current?.classList.remove(styles.open);
            setIsOpenAdd({ state: false, type: { place: false, activity: false } });
        }
    }, [isOpen]);

    useEffect(() => {
        if (isOpenAdd.state) {
            console.log('merde');
            refPlacesContainer.current?.classList.remove(styles.open);
            if (isOpenAdd.type.place || isOpenAdd.type.activity) {
                refAddContainer.current?.classList.add(styles.open);
            }

            if (isOpenAdd.type.place) {
                refAddPlaceContainer.current?.classList.add(styles.open);
                refAddActivityContainer.current?.classList.remove(styles.activity);
            } else if (isOpenAdd.type.activity) {
                refAddPlaceContainer.current?.classList.remove(styles.open);
                refAddActivityContainer.current?.classList.add(styles.open);
            }
        } else {
            refAddContainer.current?.classList.remove(styles.open);
            refPlacesContainer.current?.classList.add(styles.open);
        }
    }, [isOpenAdd.state, isOpenAdd.type]);

    // -- Search Place -- 
    const handleSearchPlace = () => {
        const query = refInputPlace.current.value;
        console.log(query);

        if (query.length < 3) {
            setErrors({...errors, name_place: 'Vous devez donner plus d\'indications...'})
            return;
        }  

        axios.get(`https://eu1.locationiq.com/v1/search?key=${config.key}&q=${query}&format=json&`)
        .then(response => {
            if (response.data) {
                setNewQueryLocation(response.data);
                console.log(response.data);
            } else {
                setErrors({...errors, name_place : 'Adresse non trouvée' })
            }
        })
        .catch(error => {
            console.error('Error fetching result', error);
            setErrors({...errors, name_place: 'Une erreur est survenue lors de la recherche de l\adresse'})
        })
    }
    
    const handleAddNewLocationToDay = () => {
        setDays(prevDays => {
            const updatedDays = [...prevDays];
            updatedDays[index] = [...day, newQueryLocation];
            return updatedDays;
        });
        setIsOpenAdd({state: false, type: {place: false, activity: false}});
    };

    return (
        <div className={styles.container}>
            <div className={`${createRoadtripStyles.stageButtonsContainer}`}>
                <div
                    aria-label={`Jour ${index+1}`}
                    onClick={() => setIsOpen(!isOpen)}
                    role="button"
                    className={`${createRoadtripStyles.button} ${createRoadtripStyles.openButton}`}
                    ref={refDayButton}>
                    <span className={createRoadtripStyles.openIcon}>❯</span>
                    <p>Jour {index+1} :</p>
                </div>
                <div 
                    aria-label="Boutton rajouter un lieu" 
                    role="button"
                    className={createRoadtripStyles.button}
                    onClick={() => setIsOpenAdd({...isOpenAdd, state: true, type: {place: true, activity: false}})}>Rajouter un lieu</div>
                <div 
                    aria-label="Boutton rajouter une activité" 
                    role="button"
                    className={createRoadtripStyles.button}
                    onClick={() => setIsOpenAdd({...isOpenAdd, state: true, type: {place: false, activity: true}})}>Rajouter une activité</div>
                <div 
                    aria-label="Boutton supprimer la journée"
                    role="button"
                    className={createRoadtripStyles.button}
                >Supprimer la journée</div>
            </div>
            <div className={`${styles.stageContainer}`} ref={refStage}>
                <div className={`${styles.placesContainer} ${styles.open}`} ref={refPlacesContainer}>
                    {day.length > 0 ? (
                        <ul className={styles.placesList}>
                            {day.map((place, index) => (
                                <li key={index}><Place place={place} index={index} /></li>
                            ))}
                        </ul>
                    ) : (
                        <div>Cette journée est vide...</div>
                    )}
                </div>
                <div className={styles.addContainer} ref={refAddContainer}>
                    <div className={`${styles.addPlaceContainer} ${styles.open}`} ref={refAddPlaceContainer}>
                        <div className={styles.searchContainer}>
                            <h2>Rajouter un lieu :</h2>
                            <div className={`input2_elementsContainer ${styles.input}`}>
                                <label htmlFor="name_place">Nom :</label>
                                <div className={`input2_container ${styles.inputContainer}`}>
                                    <input
                                        type="text"
                                        id="name_place"
                                        name="name_place"
                                        placeholder="Nom du lieu"
                                        ref={refInputPlace}
                                        >
                                    </input>
                                    <div role="button" onClick={handleSearchPlace} className={`${styles.searchButton}`}>Chercher</div>
                                </div>
                            </div>
                            {errors.name_place && <small className={`smallFormError ${formStyles.errorGreen}`}><div className={roadtripsStyles.errorIcon}></div>{errors.name_place}</small>}
                            {Object.keys(newQueryLocation).length > 0 && (
                                <div 
                                    className={styles.addButton}
                                    onClick={handleAddNewLocationToDay}                             
                                    role="button"
                                >Ajouter
                                </div>
                            )}
                        </div>
                        {/* Map */}
                        {Object.keys(newQueryLocation).length > 0 && (
                            day.length > 0 ? (
                                <div className={styles.littleMap}>
                                    {/* <DrawMap drawJson={} localisations={localisations} /> */}
                                </div>
                            ) : (
                                <div className={styles.littleMap}>
                                    <Map jsonLocation={newQueryLocation} setSelectionnedLocation={setNewQueryLocation} zoom={5} />
                                </div>
                            )
                        )}
                    </div>
                    <div className={styles.activityContainer} ref={refAddActivityContainer}>

                    </div>
                </div>
            </div>
        </div>
    )
}