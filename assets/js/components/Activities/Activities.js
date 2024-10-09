import React, { useEffect, useState, useRef, useNavigate } from "react";
import styles from "./Activities.module.css";
import formStyles from "../../containers/Form/Form.module.css";
import axios from 'axios';
import Map from "../../containers/Map/Map";
import config from "../../config/locationIQ";
import { Link } from "react-router-dom";
import paths from "../../config/paths";

export default function Activities() {
    const [loading, setLoading] = useState(false);
    const [query, setQuery] = useState('');
    const [suggestions, setSuggestions] = useState([]);
    const debounceTimeout = useRef(null);
    const [errors, setErrors] = useState({});

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
    
    return (
        <section className={`first-section ${styles.section}`}>
            <h1 className={`typical-title ${styles.title}`}>Activités</h1>
            <div className={styles.container}>
                {loading ? (
                    <div className={`${styles.loaderContainer} loader-container`}>
                        <span className={`loader ${formStyles.loader} ${styles.loader}`}></span>
                        <span className={`loader-text ${profileStyles.loaderText}`}>Chargement...</span>
                    </div>
                ) : (
                    <div className={`${styles.actvitiesContainer}`}>
                        <Link to={paths.CREATE_ACTIVITY}>Créer une activité</Link>
                        <h2 className={styles.secondTitle}>Chercher une activité dans la communauté</h2>
                        <form className={styles.searchFormContainer}>
                            <div className={styles.formFieldsContainer}>
                                <div className={styles.searchInputContainer}>
                                    <label>Localisation :</label>
                                    <input type="text" placeholder="Localisation" id="localisation" name="localisation"></input>
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
                    )
                }
            </div>
        </section>
    )
}