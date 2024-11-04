import React, { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import styles from "./Activities.module.css";
import formStyles from "../../containers/Form/Form.module.css";
import axios from 'axios';
import Map from "../../containers/Map/Map";
import config from "../../config/locationIQ";
import paths from "../../config/paths";
import CardActivity from "../../containers/Activity/Card/CardActivity";

export default function Activities() {
    const [loading, setLoading] = useState(true);
    const [query, setQuery] = useState('');
    const [suggestions, setSuggestions] = useState([]);
    const debounceTimeout = useRef(null);
    const [errors, setErrors] = useState({});
    const [JSONLocation, setJSONLocation] = useState(null);
    const [selectionnedLocation, setSelectionnedLocation] = useState(null);
    const [localisationInput, setLocalisationInput] = useState('');
    const [choseLocalisation, setChoseLocalisation] = useState(false);
    const [activities, setActivities] = useState([]);   
    const formRef = useRef();

    // -- Pagination --
    const [currentPage, setCurrentPage] = useState(1);
    const activitiesPerPage = 10; 
    const [currentActivities, setCurrentActivities] = useState([]);

    // Fetch activities when component mount
    useEffect(() => {
        axios.get('/api/activities')
        .then(response => {
            setActivities(response.data);
            setLoading(false);
        })
        .catch(error => {
            console.error('Error fetching activities', error);
            setLoading(false);
        });
    }, []);

    // Update currentActivities based on currentPage and activities array
    useEffect(() => {
        const startIndex = (currentPage - 1) * activitiesPerPage;
        const endIndex = startIndex + activitiesPerPage;
        setCurrentActivities(activities.slice(startIndex, endIndex));
    }, [activities, currentPage]);

    const totalPages = Math.ceil(activities.length / activitiesPerPage);

    const handlePageClick = (page) => setCurrentPage(page);
    const handlePrevPage = () => currentPage > 1 && setCurrentPage(currentPage - 1);
    const handleNextPage = () => currentPage < totalPages && setCurrentPage(currentPage + 1);


    // -- Type --
    const handleTypeChange = (event) => {
        const value = event.target.value;
        setQuery(value);
        setErrors({ ...errors, type: null }); 

        if (debounceTimeout.current) {
            clearTimeout(debounceTimeout.current);
        }

        debounceTimeout.current = setTimeout(async () => {
            if (value.length > 1) {
                try {
                    const response = await axios.get(`/api/tags/autocomplete?q=${value}`);
                    setSuggestions(response.data);
                } catch (error) {
                    console.error('Error fetching autocomplete suggestions', error);
                }
            } else {
                setSuggestions([]);
            }
        }, 300); 
    };

    const handleSuggestionClick = (suggestion) => {
        setQuery(suggestion.name);
        setSuggestions([]); 
        setErrors({ ...errors, type: null }); 
    };


    // -- Form Submit --
    const handleSubmit = (event) => {
        event.preventDefault();

        
        const localisation = localisationInput; 
        if (!localisation && !event.target.type.value) {
            setErrors({other: 'Veuillez renseigner une localisation ou un type d\'activité'});
            return;
        }

        if (!selectionnedLocation && localisation) {
            axios.get(`https://eu1.locationiq.com/v1/search?key=${config.key}&q=${localisation}&format=json&`)
            .then(response => {
                if (response.data) {
                    setJSONLocation(response.data);

                    if (!selectionnedLocation) {
                        setErrors({ ...errors, address: 'Veuillez sélectionner une adresse sur la carte si celle proposée n\'est pas la bonne.' });
                        setChoseLocalisation(true);
                    }
                } else {
                    setErrors({ ...errors, address: 'Adresse non trouvée' });
                }
            })
            .catch(error => {
                console.error('Error fetching results', error);
                setErrors({ ...errors, address: 'Une erreur est survenue lors de la recherche de l\'adresse' });
            })
        } else {
            const params = new URLSearchParams();
            params.append('lat', selectionnedLocation ? selectionnedLocation.lat : '0');
            params.append('lng', selectionnedLocation ? selectionnedLocation.lon : '0');
            params.append('type', query || event.target.type.value);
    
            setLoading(true);
            
            axios.get(`/api/activities/search?${params.toString()}`)
            .then(response => {
                setLoading(false);
                setActivities(response.data.activities);
                setErrors(response.data.errors)
            })
            .catch(error => {
                setLoading(false);
                if (error.response.status === 404) {
                    setActivities([]);
                } else {
                    setErrors({ other: 'Erreur lors de la recherche.' });
                    console.error('Error fetching activities', error);
                }
            });
        }
    }

    // -- Selection Location --
    useEffect(() => {
        if (selectionnedLocation) {
            const params = new URLSearchParams({
                lat: selectionnedLocation.lat,
                lng: selectionnedLocation.lon,
                type: query ? query : formRef.current.type.value,
            }).toString();
            
            setLoading(true);
            axios.get(`/api/activities/search?${params}`)
            .then(response => {
                setLoading(false);
                setActivities(response.data.activities);
                if (response.data.errors) {
                    setErrors(response.data.errors);
                }
            })
            .catch(error => {
                setLoading(false);
                if (error.response.status === 404) {
                    setActivities([]);
                } else {
                    setErrors({ other: 'Erreur lors de la recherche.' });
                    console.error('Error fetching activities', error);
                }
            });
        }
    }, [selectionnedLocation]);


    // -- Search all activities --
    useEffect(() => {
        axios.get('/api/activities')
        .then(response => {
            setActivities(response.data);
            setLoading(false);
        })
        .catch(error => {
            console.error('Error fetching activities', error);
            setLoading(false);
        });
    }, []);

    return (
        <section className={`first-section ${styles.section}`}>
            <h1 className={`typical-title ${styles.title}`}>Activités</h1>
            <div className={styles.container}>
                <div className={`${styles.actvitiesContainer}`}>
                    <div className={styles.textTitleContainer}>
                        <h2 className={styles.secondTitle}>Chercher une activité dans la communauté</h2>
                        <div>
                            <p>Ou vous préférez peut être...</p>
                            <Link to={paths.CREATE_ACTIVITY} className={`${styles.createLink} link`}>Créer une activité</Link>
                        </div>
                    </div>
                    <form className={styles.searchFormContainer} onSubmit={handleSubmit} ref={formRef} >
                        <div className={styles.formFieldsContainer}>
                            <div className={styles.searchInputContainer}>
                                <label>Localisation :</label>
                                <input
                                    type="text"
                                    placeholder="Localisation"
                                    id="localisation"
                                    name="localisation"
                                    value={localisationInput}
                                    onChange={(e) => {
                                        setLocalisationInput(e.target.value);
                                    }}
                                />
                            </div>
                            <div className={styles.autocompleteContainer}>
                                <label htmlFor="map_type">Type :</label>
                                <div>
                                    <input
                                        type="text"
                                        value={query}
                                        onChange={handleTypeChange}
                                        placeholder="Type"
                                        id="type"
                                        name="type"
                                    />
                                    {suggestions.length > 0 && (
                                        <ul className={formStyles.suggestionsList}>
                                            {suggestions.map((suggestion) => (
                                                <li key={suggestion.id} onClick={() => handleSuggestionClick(suggestion)}>
                                                    {suggestion.name}
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                </div>
                            </div>
                            <input className={`${styles.submit}`} type="submit" value="Chercher" />
                        </div>
                        {errors && (
                            <div className={formStyles.errorsContainer}>
                                 {Object.keys(errors).map((key) => (
                                    <small key={key} className={`${formStyles.errorGreen} ${styles.error}`}>
                                        <div className={styles.errorIcon}></div>{errors[key]}
                                    </small>
                                ))}
                            </div>
                        )}
                    </form>
                    {(JSONLocation && choseLocalisation) && (
                        <div className={styles.containerAnimation}>
                            <div className={`${styles.searchMapContainer} ${styles.show}`}>
                                <Map
                                    jsonLocation={JSONLocation}
                                    setSelectionnedLocation={setSelectionnedLocation}
                                    zoom={5}
                                />
                            </div>
                        </div>    
                    )}
                {loading ? (
                    <div className={`${styles.loaderContainer} loader-container`}>
                        <span className={`loader ${formStyles.loader} ${formStyles.loaderGreen}`}></span>
                        <span className={`loader-text ${formStyles.loaderTextGreen}`}>Chargement...</span>
                    </div>
                ) : (
                    <div className={styles.activitiesContainer}>
                        {currentActivities.length > 0 ? (
                            <>
                                {!selectionnedLocation && <h3>Toutes les activités :</h3>}
                                {selectionnedLocation && <h3>Recherche :</h3>}
                                {currentActivities.map((activity, index) => (
                                    <CardActivity key={index} activity={activity} selectionnedLocation={selectionnedLocation} />
                                ))}
                            </>
                        ) : (
                            <p>Aucune activité trouvée</p> )
                        }
                    </div>
                )}
                    <div className={styles.pagination}>
                        <button onClick={handlePrevPage} disabled={currentPage === 1} aria-label="Precedent">❮</button>
                        {Array.from({ length: totalPages }, (_, index) => (
                            <button key={index + 1} onClick={() => handlePageClick(index + 1)} className={currentPage === index + 1 ? styles.active : ''}>
                                {index + 1}
                            </button>
                        ))}
                        <button onClick={handleNextPage} disabled={currentPage === totalPages} aria-label="Suivant">❯</button>
                    </div>
                </div>
            </div>
        </section>
    );
}
