import React, { useState, useEffect, useRef } from "react";
import styles from "./CreateRoadtrip.module.css";
import roadtripsStyles from '../Roadtrips.module.css';
import formStyles from '../../../containers/Form/Form.module.css';
import config from "../../../config/locationIQ";
import { Link } from "react-router-dom";
import axios from "axios";


export default function CreateRoadtrip() {
    const [loading, setLoading] = useState(false);
    const [countrySuggestions, setCountrySuggestions] = useState({});
    const [countryQuery, setCountryQuery] = useState('');
    const [activityType, setActivityType] = useState([]);
    const [errors, setErrors] = useState({});
    const [elementOpen, setElementOpen] = useState({
        stage: true,
        add: false,
        activity: false,
        place: false,
    })
    const debounceTimeout = useRef(null);
    const refStage = useRef(null);
    const refStageButton = useRef(null);
    const refStageList = useRef(null);
    const refPopUpWindow = useRef(null);  
    const refPopUpPlace = useRef(null);
    const refPopUpActivity = useRef(null);  
    const refInformations = useRef(null);
    const refInformationsButton = useRef(null);
    
    // -- Open button -- 
    const handleClickStage = (element) => {
        if (element === 'stage') {
            setElementOpen({...elementOpen, stage: !elementOpen.stage})
        }
    }

    useEffect(() => {
        console.log('useEffect');
        console.log(elementOpen);
    
        // Stage toggle logic
        if (refStageButton.current && refStage.current) {
            if (elementOpen.stage) {
                refStageButton.current.classList.add(styles.open);
                refStage.current.classList.add(styles.open);
            } else {
                refStageButton.current.classList.remove(styles.open);
                refStage.current.classList.remove(styles.open);
            }
        }
    
        // Pop-up logic
        if (refPopUpWindow.current) {
            if (elementOpen.add) {
                refPopUpWindow.current.classList.add(styles.open);
    
                if (elementOpen.activity && refPopUpActivity.current) {
                    refPopUpActivity.current.classList.add(styles.open);
                    refPopUpPlace.current?.classList.remove(styles.open);
                } else if (elementOpen.place && refPopUpPlace.current) {
                    refPopUpPlace.current.classList.add(styles.open);
                    refPopUpActivity.current?.classList.remove(styles.open);
                }
            } else {
                refPopUpWindow.current.classList.remove(styles.open);
            }
        }
    }, [elementOpen]);
    
    // -- Country --
    const handleCountryChange = (e) => {
        const value = e.target.value;
        setCountryQuery(value);

        if (debounceTimeout.current) clearTimeout(debounceTimeout.current);

        debounceTimeout.current = setTimeout(async () => {
            if (value.length > 2) {
                try {
                    const response = await axios.get(`https://eu1.locationiq.com/v1/autocomplete?q=${value}&tag=place%3Acountry&key=${config.key}`)
                    setCountrySuggestions(response.data)
                } catch (error) {
                    console.error('Error fetching autocomplete suggestions', error);
                }
            } else {
                setCountrySuggestions({})
            }
        }, 300)
    };
    const handleCountrySuggestionClick = (suggestion) => {
        setCountryQuery(suggestion.display_place);
        setCountrySuggestions({});
    }
    
    return (
        <section className={`first-section`}>
            <h1 className={`typical-title`}>Créer un roadtrip</h1>
            <div className={`${roadtripsStyles.roadtripsContainer} ${styles.container}`}>
                {loading ? (
                    <div className={`${roadtripsStyles.loaderContainer} loader-container`}>
                        <span className={`loader ${formStyles.loader} ${formStyles.loaderGreen}`}></span>
                        <span className={`loader-text ${formStyles.loaderTextGreen}`}>Chargement...</span>
                    </div>
                ) : (
                    <>
                        {/* Faire un tuto? */}
                        <div className={styles.map}>
                            {/* Map */}
                        </div>
                        <form className={styles.form}>
                            <div className={styles.standartInformations}>
                                <div>
                                    <div className={`${styles.input} input2_elementsContainer`}>
                                        <label htmlFor="title">Titre :</label>
                                        <div  className={`input2_container`}>
                                            <input
                                                type="text"
                                                id="title"
                                                name="title"
                                                placeholder="Titre">
                                            </input>
                                        </div>
                                    </div>
                                    {errors.title && <small className={`smallFormError ${formStyles.errorGreen}`}><div className={activitiesStyle.errorIcon}></div>{errors.address}</small>}
                                </div>
                                <div>
                                    <div className={`${styles.input} input2_elementsContainer`}>
                                        <label htmlFor="country">Pays :</label>
                                        <div className={`input2_container`}>
                                            <input
                                                type="text"
                                                id="country"
                                                name="country"
                                                placeholder="Pays"
                                                onChange={handleCountryChange}
                                                value={countryQuery}>
                                            </input>
                                        </div>
                                        {countrySuggestions.length > 0 && (
                                            <ul className={formStyles.suggestionsList}>
                                                {countrySuggestions.map((country, index) => (
                                                    <li key={index} onClick={() => handleCountrySuggestionClick(country)}>{country.display_place}</li>
                                                ))}
                                            </ul>
                                        )}
                                    </div>
                                    {errors.type && <small className={`smallFormError ${formStyles.errorGreen}`}><div className={activitiesStyle.errorIcon}></div>{errors.type}</small>}
                                </div>
                            </div>
                                <div className={styles.stageContainer}>
                                    <div className={styles.stageButtonsContainer}>
                                        <div
                                            className={`${styles.button} ${styles.openButton}`}
                                            onClick={() => handleClickStage('stage')}
                                            aria-label="Voir les étapes"
                                            ref={refStageButton}>
                                            <span className={styles.openIcon}>❯</span>
                                            <p>Etapes :</p>
                                        </div>
                                        <div className={styles.button} aria-label="Rajouter une étape">Rajouter une étape</div>
                                    </div>
                                    {/* Lieux dans l'étape */}
                                    <div className={`${styles.stageHiddenContainer}`} ref={refStage}>
                                        <div className={`${styles.stageButtonsContainer}`}>
                                            <div aria-label="Rajouter un lieu" 
                                                className={styles.button} 
                                                onClick={() => setElementOpen({...elementOpen, activity: false, place: true, add: true})}>Rajouter un lieu</div>
                                            <div aria-label="Rajouter une activité" 
                                                className={styles.button} 
                                                onClick={() => setElementOpen({...elementOpen, activity: true, place: false, add: true})}>Rajouter une activité</div>
                                        </div>
                                        <div className={styles.stageList} ref={refStageList}></div>
                                        <div className={styles.popUpContainer} ref={refPopUpWindow}>
                                            <div>
                                                <div className={`${styles.addPlace} ${styles.stageFormContainer}`} ref={refPopUpPlace}>
                                                    <div>
                                                        <div className={`input2_elementsContainer ${styles.input}`}>
                                                            <label htmlFor="name_place">Nom :</label>
                                                            <div className={`input2_container`}>
                                                                <input
                                                                    type="text"
                                                                    id="name_place"
                                                                    name="name_place"
                                                                    placeholder="Nom du lieu"
                                                                    >
                                                                </input>
                                                            </div>
                                                        </div>
                                                        {errors.name_place && <small className={`smallFormError ${formStyles.errorGreen}`}><div className={activitiesStyle.errorIcon}></div>{errors.name_place}</small>}
                                                    </div>
                                                    {/* Map */}
                                                    <button>Ajouter</button>
                                                </div>
                                            </div>
                                            <div className={`${styles.addActivity} ${styles.stageFormContainer}`} ref={refPopUpActivity}>
                                                <div>
                                                    <div>
                                                        <div className={`input2_elementsContainer ${styles.input}`}>
                                                            <label htmlFor="name_activity">Nom :</label>
                                                            <div className={`input2_container`}>
                                                                <input
                                                                    type="text"
                                                                    id="name_activity"
                                                                    name="name_activity"
                                                                    placeholder="Nom de l'activité"
                                                                    >
                                                                </input>
                                                            </div>
                                                        </div>
                                                        {errors.name_activity && <small className={`smallFormError ${formStyles.errorGreen}`}><div className={activitiesStyle.errorIcon}></div>{errors.name_activity}</small>}
                                                    </div>
                                                    {/* Map */}
                                                </div>
                                                <div>
                                                    <div>
                                                        <div>
                                                            <div className={`input2_elementsContainer ${styles.input}`}>
                                                                <label htmlFor="type_activity">Type :</label>
                                                                <div className={`input2_container`}>
                                                                    <input
                                                                        type="text"
                                                                        id="type_activity"
                                                                        name="type_activity"
                                                                        placeholder="Type d'activité">
                                                                    </input>
                                                                </div>
                                                            </div>
                                                            {errors.type_activity && <small className={`smallFormError ${formStyles.errorGreen}`}><div className={activitiesStyle.errorIcon}></div>{errors.type_activity}</small>}
                                                        </div>
                                                        {activityType.length > 0 && (
                                                            <ul className={formStyles.suggestionsList}>
                                                                {activityType.map((suggestion) => (
                                                                    <li key={suggestion.id} onClick={() => handleSuggestionClick(suggestion)}>
                                                                        {suggestion.name}
                                                                    </li>
                                                                ))}
                                                            </ul>
                                                        )}
                                                    </div>
                                                    <div>
                                                        {/* Add a div to display community activity */}
                                                        {/* Map with all suggestions including the ones from community */}
                                                    </div>
                                                </div>
                                            </div>
                                    </div>
                                </div>
                            </div>
                        </form>
                    </>
                )}
            </div>
        </section>
    )
}
