import React, { useEffect, useState, useRef, useNavigate } from "react";
import { Link } from "react-router-dom";
import styles from "./Activities.module.css";
import formStyles from "../../containers/Form/Form.module.css";
import axios from 'axios';
import Map from "../../containers/Map/Map";
import config from "../../config/locationIQ";
import paths from "../../config/paths";

export default function Activities() {
    const [loading, setLoading] = useState(false);
    const [query, setQuery] = useState('');
    const [suggestions, setSuggestions] = useState([]);
    const debounceTimeout = useRef(null);
    const [errors, setErrors] = useState({});
    const [JSONLocation, setJSONLocation] = useState(null);
    const [selectionnedLocation, setSelectionnedLocation] = useState(null);
    const [localisationInput, setLocalisationInput] = useState('');
    const [activities, setActivities] = useState([]);   
    const formRef = useRef();

    const handleTypeChange = (event) => {
        const value = event.target.value;
        setQuery(value);

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
    };

    const handleSubmit = (event) => {
        event.preventDefault();

        const localisation = localisationInput; 

        if (!localisation) {
            setErrors(['Veuillez indiquer une adresse']);
            return;
        }
        console.log(selectionnedLocation);
        if (!selectionnedLocation) {
            axios.get(`https://us1.locationiq.com/v1/search?key=${config.key}&q=${localisation}&format=json&`)
            .then(response => {
                if (response.data) {
                    setJSONLocation(response.data);
                    console.log(response.data);
                    if (!selectionnedLocation) {
                        setErrors({ address: 'Veuillez sélectionner une adresse sur la carte et cherchez à nouveau.' });
                    }

                    // test
                    setSelectionnedLocation(response.data[1]);

                } else {
                    setErrors({ address: 'Adresse non trouvée' });
                }
            })
            .catch(error => {
                console.error('Error fetching results', error);
                setErrors({ address: 'Une erreur est survenue lors de la recherche de l\'adresse' });
            })
        } else {

            const form = event.target;
            const formData = new FormData(form);

            formData.append('lat', selectionnedLocation.lat);
            formData.append('lng', selectionnedLocation.lon);
            form.append('type', query);

            setLoading(true);
            
            axios.get('/api/activities/search', formData)
            .then(response => {
                setLoading(false);
                // Todo display activities
                setActivities(response.data);
                console.log(response.data);
            })
            .catch(error => {
                setLoading(false);
                setErrors(error.response.data.errors || {})
                console.error('Error fetching activities', error);
            });
        }
    }

    useEffect(() => {
        if (selectionnedLocation) {

            const params = new URLSearchParams({
                lat: selectionnedLocation.lat,
                lng: selectionnedLocation.lon,
                type: query,
            }).toString();
            
            setLoading(true);
            console.log(params);
            axios.get(`/api/activities/search?${params}`)
            .then(response => {
                setLoading(false);
                // Todo display activities
                setActivities(response.data);
                console.log(response.data);
            })
            .catch(error => {
                setLoading(false);
                setErrors(error.response.data.errors || {})
                console.error('Error fetching activities', error);
            });
        }
    }, [selectionnedLocation]);

    return (
        <section className={`first-section ${styles.section}`}>
            <h1 className={`typical-title ${styles.title}`}>Activités</h1>
            <div className={styles.container}>
                {loading ? (
                    <div className={`${styles.loaderContainer} loader-container`}>
                        <span className={`loader ${formStyles.loader} ${styles.loader}`}></span>
                        <span className={`loader-text ${formStyles.loaderText}`}>Chargement...</span>
                    </div>
                ) : (
                    <>
                        <div className={`${styles.actvitiesContainer}`}>
                            <Link to={paths.CREATE_ACTIVITY}>Créer une activité</Link>
                            <h2 className={styles.secondTitle}>Chercher une activité dans la communauté</h2>
                            <form className={styles.searchFormContainer} onSubmit={handleSubmit} ref={formRef} >
                                <div className={styles.formFieldsContainer}>
                                    <div className={styles.searchInputContainer}>
                                        <label>Localisation :</label>
                                        <input type="text" 
                                            placeholder="Localisation" 
                                            id="localisation" 
                                            name="localisation"
                                            value={localisationInput} 
                                            onChange={(e) => setLocalisationInput(e.target.value)}></input>
                                    </div>
                                    <div className={styles.autocompleteContainer}>
                                        <label htmlFor="map_type">Type* :</label>
                                        <div className={``}>
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
                                {errors.length > 0 && (
                                    <div className={formStyles.errorContainer}>
                                        {errors.map((error, index) => (
                                            <small key={index} className={formStyles.error}>{error}</small>
                                        ))}
                                    </div>
                                )}
                            </form>
                        </div>
                        {(JSONLocation && !selectionnedLocation) && (
                            <div className={styles.searchMapContainer}>
                                <Map JSONLocation={JSONLocation} 
                                setSelectionnedLocation={setSelectionnedLocation} />
                            </div>
                        )}
                    </>
                    )
                }
            </div>
        </section>
    )
}