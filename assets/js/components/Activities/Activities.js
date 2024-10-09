import React, { useEffect, useState, useRef, useNavigate } from "react";
import styles from "./Activities.module.css";
import formStyles from "../../containers/Form/Form.module.css";
import axios from 'axios';
import Map from "../../containers/Map/Map";
import config from "../../config/locationIQ";
import { Link } from "react-router-dom";
import paths from "../../config/paths";

export default function Activities() {
    // const [flashMessage, setFlashMessage] = useState(null);
    const [loading, setLoading] = useState(false);
    // const [errors, setErrors] = useState({});
    // const [query, setQuery] = useState('');
    // const [suggestions, setSuggestions] = useState([]);
    // const debounceTimeout = useRef(null);
    // const [locationQuery, setLocationQuery] = useState('');
    // const [JSONLocation, setJSONLocation] = useState({});
    // const [selectionnedLocation, setSelectionnedLocation] = useState(null);

    // const navigate = useNavigate();

    // const handleInputChange = (event) => {
    //     const value = event.target.value;
    //     setQuery(value);

    //     if (debounceTimeout.current) {
    //         clearTimeout(debounceTimeout.current);
    //     }

    //     debounceTimeout.current = setTimeout(async () => {
    //         if (value.length > 1) {
    //             try {
    //                 const response = await axios.get(`/api/tags/autocomplete?q=${value}`);
    //                 setSuggestions(response.data);
    //             } catch (error) {
    //                 console.error('Error fetching autocomplete suggestions', error);
    //             }
    //         } else {
    //             setSuggestions([]);
    //         }
    //     }, 300); 
    // };

    // const handleSuggestionClick = (suggestion) => {
    //     setQuery(suggestion.name);
    //     setSuggestions([]); 
    // };

    // useEffect(() => {
    //     if (debounceTimeout.current) {
    //         clearTimeout(debounceTimeout.current);
    //     }
    // }, []);

    // const handleSearchLocation = (event) => {
    //     const value = event.target.value;
    //     setLocationQuery(value);
    // };

    // useEffect(() => {
    //     if (debounceTimeout.current) {
    //         clearTimeout(debounceTimeout.current);
    //     }

        
    //     debounceTimeout.current = setTimeout(async () => {
    //         if (locationQuery.length > 1) {
    //             try {
    //                 const response = await axios.get(`https://us1.locationiq.com/v1/search?key=${config.key}&q=${locationQuery}&format=json&`);
    //                 setJSONLocation(response.data);
    //             } catch (error) {
    //                 console.error('Error fetching autocomplete suggestions', error);
    //             }
    //         } else {
    //             setSuggestions([]);
    //         }
    //     }, 150); 
    // }, [locationQuery]);

    // const handleSubmit = e => {
    //     e.preventDefault();

    //     if (!selectionnedLocation) {
    //         setFlashMessage({ type: 'error', message: 'Please select a location on the map.' });
    //         return;
    //     }

    //     navigate('/activities/create', { state: { address: selectionnedLocation } }); 
    // }

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
                    <Link to={paths.CREATE_ACTIVITY}>Créer une activité</Link>
                    )
                }
            </div>
        </section>
    )
}