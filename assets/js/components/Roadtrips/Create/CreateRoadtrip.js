import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import styles from "./CreateRoadtrip.module.css";
import roadtripsStyles from '../Roadtrips.module.css';
import formStyles from '../../../containers/Form/Form.module.css';
import config from "../../../config/locationIQ";
import RoadtripDrawMap from "../../../containers/Map/RoadtripDraw/RoadtripDrawMap";
import axios from "axios";
import Day from "../../../containers/Day/Day";

export default function CreateRoadtrip() {
    const [loading, setLoading] = useState(false);
    const [flashMessage, setFlashMessage] = useState(null);
    const [countrySuggestions, setCountrySuggestions] = useState({});
    const [countryMap, setCountryMap] = useState({});
    const [countryQuery, setCountryQuery] = useState('');
    const [roads, setRoads] = useState([]);
    const [errors, setErrors] = useState({});
    const [firstPlace, setFirstPlace] = useState(null);
    const [pics, setPics] = useState([]);
    const [elementOpen, setElementOpen] = useState({
        days: true,
        informations: false
    });
    const [days, setDays] = useState([]);
    const [description, setDescription] = useState('');
    const [title, setTitle] = useState('');
    const [budget, setBudget] = useState(1);
    const debounceTimeout = useRef(null);
    const refDays = useRef(null);
    const refDaysButton = useRef(null);
    const inputPicFile = useRef(null);

    useEffect(() => {
        if (days.length > 0 && days[0].length > 0) {
            setFirstPlace(days[0][0].informations);
        } else {
            setFirstPlace(null)
        }
    },[days])

    // -- Open button -- 
    const handleClickStage = (element) => {
        if (element === 'stage') {
            setElementOpen({...elementOpen, days: !elementOpen.days})
        }
    }

    useEffect(() => {    
        // Stage toggle logic
        if (refDaysButton.current && refDays.current) {
            if (elementOpen.days) {
                refDaysButton.current?.classList.add(styles.open);
                refDays.current?.classList.add(styles.open);
            } else {
                refDaysButton.current?.classList.remove(styles.open);
                refDays.current.classList?.remove(styles.open);
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
                    setCountrySuggestions(response.data);
                } catch (error) {
                    console.error('Error fetching autocomplete suggestions', error);
                }
            } else {
                setCountrySuggestions({})
            }
        }, 300)
    };

    // -- Country suggestions --
    const handleCountrySuggestionClick = (country) => {
        setCountryQuery(country.display_place);
        setCountryMap(country);
        setCountrySuggestions({});
    }

    // -- Pics --
    const handleFileChange = e => {
        const newFiles = Array.from(e.target.files);
        setPics((prevPics) => [...prevPics, ...newFiles]);
    }

    useEffect(() => {
        if (pics.length > 6) {
            inputPicFile.current.disabled = true;    
            setErrors(prevErrors => ({...prevErrors, pics: 'Vous ne pouvez pas ajouter plus de 6 photos.'}));
        } else {
            inputPicFile.current.disabled = false;
            setErrors(prevErrors => ({...prevErrors, pics: ''}));
        }
    }, [pics])



    // -- Submit --
    const handleSubmit = async e => {
        e.preventDefault();

        setLoading(true);
        setFlashMessage(null);   

        const formData = new FormData();
        formData.append('title', title);
        formData.append('country', countryQuery);
        formData.append('description', description);
        formData.append('days', JSON.stringify(days));
        formData.append('roads', JSON.stringify(roads));
        formData.append('budget', budget);

        // Add files
        for (let i = 0; i < e.target.pics.files.length; i++) {
            formData.append('pics[]', e.target.pics.files[i]);
        }
    
        try {
            const response = await axios.post('/api/roadtrip/create', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            if (response.status === 201) {
                setFlashMessage({ type: "success", message: "Votre roadtrip a bien été créé !" });
                setCountryQuery('');
                setCountryMap({});
                setRoads([]);
                setDays([]);
                setDescription('');
                setTitle('');
                setBudget(1);
                setPics([]);
            } else {
                setErrors(response.data.errors);
                setFlashMessage({ type: "error", message: "Une erreur est survenue lors de la création de votre roadtrip." });
            }
        } catch (error) {
            console.error(error);
            setFlashMessage({type: 'error', message: 'Une erreur est survenue lors de la création de votre roadtrip.'});
        } finally {
            setLoading(false);
        }
    }

    return (
        <section className="first-section">
            <h1 className="typical-title">Créer un roadtrip</h1>
            <div className={`${roadtripsStyles.roadtripsContainer} ${styles.container}`}>
                {loading ? (
                    <div className={`${roadtripsStyles.loaderContainer} loader-container`}>
                        <span className={`loader ${formStyles.loader} ${formStyles.loaderGreen}`}></span>
                        <span className={`loader-text ${formStyles.loaderTextGreen}`}>Chargement...</span>
                    </div>
                ) : (
                    <>  
                        {flashMessage && (
                                <div className={`flash flash-${flashMessage.type} ${formStyles.flashGreen}`}>
                                    {flashMessage.message}
                                </div>
                        )}
                        {/* Map section */}
                        <div className={styles.map}>
                            <RoadtripDrawMap
                                country={countryMap}
                                roads={roads}
                                firstPlace={firstPlace}
                            />
                        </div>
                        <form className={styles.form} onSubmit={handleSubmit}>
                            {/* Standard Information */}
                            <div className={styles.standartInformations}>
                                {/* Title Input */}
                                <div className={`${styles.input} input2_elementsContainer`}>
                                    <label htmlFor="title">Titre* :</label>
                                    <div className="input2_container">
                                        <input
                                            type="text"
                                            id="title"
                                            name="title"
                                            placeholder="Titre"
                                            value={title}
                                            onChange={(e) => setTitle(e.target.value)}
                                        />
                                    </div>
                                </div>
                                {errors.title && (
                                    <small className={`smallFormError ${formStyles.errorGreen}`}>
                                        <div className={roadtripsStyles.errorIcon}></div>
                                        {errors.title}
                                    </small>
                                )}
                                {/* Country Input */}
                                <div className={`${styles.input} input2_elementsContainer`}>
                                    <label htmlFor="country">Pays* :</label>
                                    <div className="input2_container">
                                        <input
                                            type="text"
                                            id="country"
                                            name="country"
                                            placeholder="Pays"
                                            onChange={handleCountryChange}
                                            value={countryQuery}
                                        />
                                    </div>
                                    {countrySuggestions.length > 0 && (
                                        <ul className={formStyles.suggestionsList}>
                                            {countrySuggestions.map((country, index) => (
                                                <li key={index} onClick={() => handleCountrySuggestionClick(country)}>
                                                    {country.display_place}
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                </div>
                                {errors.country && (
                                    <small className={`smallFormError ${formStyles.errorGreen}`}>
                                        <div className={roadtripsStyles.errorIcon}></div>
                                        {errors.country}
                                    </small>
                                )}
                            </div>
                            {/* Stage Container */}
                            <div className={styles.stageContainer}>
                                <div className={styles.stageButtonsContainer}>
                                    {/* Stage Toggle Button */}
                                    <div
                                        className={`${styles.button} ${styles.openButton}`}
                                        onClick={() => handleClickStage('stage')}
                                        role="button"
                                        aria-pressed="false"
                                        aria-label="Voir les jours"
                                        ref={refDaysButton}
                                        tabIndex={0}
                                    >
                                        <span className={styles.openIcon}>❯</span>
                                        <p>Jours :</p>
                                    </div>
                                    <div
                                        className={styles.button}
                                        role="button"
                                        aria-label="Rajouter un jour"
                                        tabIndex={0}
                                        onClick={() => setDays(prevDays => [...prevDays, []])}
                                    >
                                        Rajouter un jour
                                    </div>
                                </div>
                                {/* Days List */}
                                <div ref={refDays} className={styles.daysContainer}>
                                    {
                                        days.length > 0 ? (
                                            <ul className={styles.daysContainer}>
                                                {days.map((day, index) => (
                                                        <li key={index}>
                                                            <Day day={day} index={index} setDays={setDays} days={days} setRoads={setRoads} roads={roads} />
                                                        </li>
                                                ))}
                                            </ul>
                                        ) : (<p>Vous n'avez pas encore ajouté de jours.</p>)
                                    }
                                </div>
                            </div>
                            {/* Description Input */}
                            <div className={`${styles.input} input2_elementsContainer`}>
                                <label htmlFor="description">Description :</label>
                                <div className="input2_container">
                                    <textarea
                                        id="description"
                                        name="description"
                                        placeholder="Description de votre roadrip"
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                    /> 
                                </div>
                            </div>
                            {errors.description && (
                                <small className={`smallFormError ${formStyles.errorGreen}`}>
                                    <div className={roadtripsStyles.errorIcon}></div>
                                    {errors.description}
                                </small>
                            )}
                            <div className={styles.picsBudget}>
                                <div className={`${styles.input} input2_elementsContainer`}>
                                    <label htmlFor="pics">Photos :</label>
                                    <div className={`input2_container`}>
                                        <input
                                        type="file"
                                        id="pics"
                                        name="pics"
                                        accept="image/png, image/jpeg, image/jpg"
                                        onChange={handleFileChange}
                                        multiple="multiple"
                                        ref={inputPicFile}/>
                                    </div>
                                    <small className={styles.picsInformation}>Vous ne pouvez partager que 6 photos maximum.</small>
                                </div>
                                {errors.pics && <small className={`smallFormError ${formStyles.errorGreen}`}><div className={styles.errorIcon}></div>{errors.pics}</small>}
                                <div className={`${styles.input} input2_elementsContainer`}>
                                    <label htmlFor="budget">Budget :</label>
                                    <div className={`input2_container`}>
                                        <select id="budget" name="budget" value={budget} onChange={(e) => setBudget(e.target.value)}>
                                            <option value="1">€</option>
                                            <option value="2">€€</option>
                                            <option value="3">€€€</option>
                                        </select>
                                    </div>
                                </div>
                                {errors.bidget && <small className={`smallFormError ${formStyles.errorGreen}`}><div className={styles.errorIcon}></div>{errors.bidget}</small>}
                            </div>
                            <input className={`form-button ${styles.submitButton}`} type="submit" value="Enregistrer le roadtrip" />            
                        </form>
                    </>
                )}
            </div>
        </section>

    )
}
