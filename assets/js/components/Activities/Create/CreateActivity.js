import React, { useState, useEffect, useRef } from 'react';
import activitiesStyle from '../Activities.module.css';
import profileStyles from '../../Profile/Profile.module.css';
import formStyles from '../../../containers/Form/Form.module.css';
import styles from './CreateActivity.module.css'
import Map from '../../../containers/Map/Map';
import config from '../../../config/locationIQ';
import axios from 'axios';

export default function CreateActivity() {
    const [errors, setErrors] = useState({});
    const [flashMessage, setFlashMessage] = useState(null);
    const [loading, setLoading] = useState(false);
    const [query, setQuery] = useState('')
    const [suggestions, setSuggestions] = useState([]);
    const debounceTimeout = useRef(null);
    const [JSONLocation, setJSONLocation] = useState({});
    const [selectionnedLocation, setSelectionnedLocation] = useState(null);

    const handleInputChange = (event) => {
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

    const handleInputChangeLngLat = (event) => {
        const lgnLatValue = (event.target.value).replace(/ /g,'');
        const lat = lgnLatValue.split(';')[0];
        const lgn = lgnLatValue.split(';')[1];

        if (debounceTimeout.current) {
            clearTimeout(debounceTimeout.current);
        }
        
        debounceTimeout.current = setTimeout(async () => {
            if (lgnLatValue.length > 1) {
                try {
                    const response = await axios.get(`https://us1.locationiq.com/v1/reverse?key=${config.key}&lat=${lat}&lon=${lgn}&format=json&`);
                    if (response.data) {
                        setJSONLocation(response.data);
                    } else {
                        setErrors({ lng_lat: 'Adresse non trouvée' });
                    }
                } catch (error) {
                    console.error('Error fetching autocomplete suggestions', error);
                    setErrors({ lng_lat: 'Une erreur est survenue lors de la recherche de l\'adresse' });
                }
            } else {
                setSuggestions([]);
            }
        }, 150); 
    }

    const handleSuggestionClick = (suggestion) => {
        setQuery(suggestion.name);
        setSuggestions([]); 
    };

    const handleSearchLocation = (event) => {
        const locationValue = event.target.value;
        if (debounceTimeout.current) {
            clearTimeout(debounceTimeout.current);
        }
        
        debounceTimeout.current = setTimeout(async () => {
            if (locationValue.length > 1) {
                try {
                    const response = await axios.get(`https://us1.locationiq.com/v1/search?key=${config.key}&q=${locationValue}&format=json&`);
                    if (response.data) {
                        setJSONLocation(response.data);
                    } else {
                        setErrors({ address: 'Adresse non trouvée' });
                    }
                } catch (error) {
                    console.error('Error fetching autocomplete suggestions', error);
                    setErrors({ address: 'Une erreur est survenue lors de la recherche de l\'adresse' });
                }
            } else {
                setSuggestions([]);
            }
        }, 150); 
    };

    const handleSubmit = e => {
        e.preventDefault();

        const form = e.target;
        const formData = new FormData();

        if (!selectionnedLocation) {
            setErrors({ address: 'Veuillez sélectionner une adresse', lng_lat: 'Veuillez sélectionner une adresse' });
            return;
        }
        formData.append('display_name', selectionnedLocation.display_name);
        formData.append('lat', selectionnedLocation.lat);
        formData.append('lng', selectionnedLocation.lon);
        formData.append('type', query);
        formData.append('description', form.description.value);
        for (let i = 0; i < form.activity_pics.files.length; i++) {
            formData.append('activity_pics[]', form.activity_pics.files[i]);
        }

        setLoading(true);
        setFlashMessage(null);

        axios.post('/api/activities/create', formData, {
            header: {
                'Content-Type': 'multipart/form-data',
            }
        })
        .then(response => {
            setFlashMessage({ type: 'success', message: 'L\'activité a été créée.' });
            console.log(response);
            setErrors({});
        })  
        .catch(error => {
            if (error.response.status === 409) {
                setFlashMessage({ type: 'error', message: "L'activité existe déjà" });
            } else {
                setFlashMessage({ type: 'error', message: 'Une erreur est survenue.' });
            }
            setErrors(error.response.data.errors || {});
        })
        .finally(() => {
            setLoading(false);
        });

    }
    return (
        <section className={`first-section ${activitiesStyle.section}`}>
            <h1 className={`typical-title ${activitiesStyle.title}`}>Créer une activité</h1>
            <div className={styles.container}>
                <div className={activitiesStyle.mapContainer}>
                    <h2 className={activitiesStyle.secondTitle}>Partagez une nouvelle activité avec les Roadtrippeurs !</h2>
                {loading ? (
                    <div className={`${activitiesStyle.loaderContainer} loader-container`}>
                        <span className={`loader ${formStyles.loader} ${formStyles.loaderGreen}`}></span>
                        <span className={`loader-text ${profileStyles.loaderText}`}>Chargement...</span>
                    </div>
                ) : (
                        <form className={activitiesStyle.mapForm} onSubmit={handleSubmit}>
                            {flashMessage && (
                                <div className={`flash flash-${flashMessage.type} ${formStyles.flashGreen}`}>
                                    {flashMessage.message}
                                </div>
                            )}
                            <div>
                                <div className={`${activitiesStyle.input} input2_elementsContainer`}>
                                    <label htmlFor="map_address">Adresse :</label>
                                    <div className={`input2_container`}>
                                        <input 
                                        type="text" 
                                        id="address" 
                                        name="address" 
                                        placeholder="Chercher une adresse"
                                        onChange={handleSearchLocation}/>
                                    </div>
                                </div>
                                {errors.address && <small className={`smallFormError ${formStyles.errorGreen}`}>{errors.address}</small>}
                            </div>
                            <div className={activitiesStyle.map}>
                                <p>Sélectionner une adresse* :</p>
                                <Map jsonLocation={JSONLocation} 
                                    setSelectionnedLocation={setSelectionnedLocation} />
                                <div className={activitiesStyle.lgnLat}>
                                    <p>Si vous ne trouvez pas votre adresse...</p>
                                    <div className={`${activitiesStyle.input} input2_elementsContainer`}>
                                        <label htmlFor="lng_lat">Longitude et latitude :</label>
                                        <div className={`input2_container`}>
                                            <input 
                                            type="text" 
                                            id="lng_lat" 
                                            name="lng_lat" 
                                            placeholder= "Latitude; Longitude"
                                            onChange={handleInputChangeLngLat}/>
                                        </div>
                                        <small className={activitiesStyle.smallExemple}>Exemple : 48.858370; 2.294481</small>
                                    </div>
                                    {errors.lng_lat && <small className={`smallFormError ${formStyles.errorGreen}`}>{errors.lng_lat}</small>}
                                </div>
                            </div>
                            <div>
                                <div className={`${activitiesStyle.input} input2_elementsContainer`}>
                                    <label htmlFor="map_type">Type* :</label>
                                    <div className={`input2_container`}>
                                        <input
                                            type="text"
                                            value={query}
                                            onChange={handleInputChange}
                                            placeholder="Indiquer le type"
                                            id="map_type"
                                            name="type"
                                        />
                                        {suggestions.length > 0 && (
                                            <ul className={activitiesStyle.suggestionsList}>
                                                {suggestions.map((suggestion) => (
                                                    <li key={suggestion.id} onClick={() => handleSuggestionClick(suggestion)}>
                                                        {suggestion.name}
                                                    </li>
                                                ))}
                                            </ul>
                                        )}
                                    </div>
                                </div>
                                {errors.type && <small className={`smallFormError ${formStyles.errorGreen}`}>{errors.type}</small>}
                            </div>
                            <div>
                                <div className={`${activitiesStyle.input} input2_elementsContainer`}>
                                    <label htmlFor="activity_pics">Photos :</label>
                                    <div className={`input2_container`}>
                                        <input 
                                        type="file" 
                                        id="activity_pics" 
                                        name="activity_pics" 
                                        accept="image/png, image/jpeg, image/jpg" 
                                        multiple="multiple" />
                                    </div>
                                </div>
                                {errors.activity_pics && <small className={`smallFormError ${formStyles.errorGreen}`}>{errors.activity_pics}</small>}
                            </div>
                            <div>
                                <div className={`${activitiesStyle.input} input2_elementsContainer`}>
                                    <label htmlFor="description">Description* :</label>
                                    <div className={`input2_container`}>
                                        <textarea  
                                        id="description" 
                                        name="description"
                                        placeholder="Saisir une description"></textarea>
                                    </div>
                                </div>
                                {errors.description && <small className={`smallFormError ${formStyles.errorGreen}`}>{errors.description}</small>}
                            </div>
                            <small className={`input2_required ${formStyles.requiredGreen}`}>* Requis</small>
                            <input className={`form-button ${activitiesStyle.button}`} type="submit" value="Créer" />            
                        </form>
                    )
                }
                </div>
            </div>
        </section>
    )
}