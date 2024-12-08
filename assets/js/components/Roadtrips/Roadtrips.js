import React, { useEffect, useState, useRef} from "react";
import { Link } from "react-router-dom";
import styles from "./Roadtrips.module.css";
import formStyles from '../../containers/Form/Form.module.css'
import paths from "../../config/paths";
import axios from "axios";
import CardRoadtrip from "../../containers/Roadtrip/Card/CardRoadtrip"

export default function Roadtrips() {
    const [currentUser, setCurrentUser] = useState(null);
    const [query, setQuery] = useState("");
    const [countrySuggestions, setCountrySuggestions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [errors, setErrors] = useState({});
    const [roadtrips, setRoadtrips] = useState([]);
    const [currentRoadtrips, setCurrentRoadtrips] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [flashMessage, setFlashMessage] = useState(null);
    const roadtripsPerPage = 10; 
    const debounceTimeout = useRef(null);
    const [selectedPrice, setSelectedPrice] = useState('price_1');
    const [selectedDuration, setSelectedDuration] = useState('duration_1');

    const formRef = useRef();

    // -- Pagination --
    useEffect(() => {
        const startIndex = (currentPage - 1) * roadtripsPerPage;
        const endIndex = startIndex + roadtripsPerPage;
        setCurrentRoadtrips(roadtrips.slice(startIndex, endIndex));
    }, [roadtrips, currentPage]);

    const totalPages = Math.ceil(roadtrips.length / roadtripsPerPage);

    const handlePageClick = (page) => setCurrentPage(page);
    const handlePrevPage = () => currentPage > 1 && setCurrentPage(currentPage - 1);
    const handleNextPage = () => currentPage < totalPages && setCurrentPage(currentPage + 1);

    // -- Country selection --
    const handleCountryChange = (event) => {
        const value = event.target.value;
        setQuery(value); 

        if (debounceTimeout.current) {
            clearTimeout(debounceTimeout.current);
        }

        debounceTimeout.current = setTimeout(async () => {
            if (value.length > 1) {
                try {
                    const response = await axios.get(`/api/country/autocomplete?q=${value}`);
                    setCountrySuggestions(response.data);
                } catch (error) {
                    console.error('Error fetching autocomplete suggestions', error);
                }
            } else {
                setCountrySuggestions([]);
            }
        }, 300);
    }

    const handleCountrySelection = (suggestion) => {
        setQuery(suggestion.name);
        setCountrySuggestions([]); 
    };

    useEffect(() => {
        // Check if we return from a delete action
        const urlParams = new URLSearchParams(window.location.search);
        const deleted = urlParams.get('deleted');
        if (deleted) {
            setFlashMessage({ type: 'success', message: 'Le roadtrip a bien été supprimé.'});
        }

        const roadtripPromise = axios.get('/api/roadtrip')
            .then(response => {
                setRoadtrips(response.data);
                setFlashMessage(prevFlash => {
                    if (deleted) return prevFlash;
                    else return null;
                });
            })
            .catch(error => {
                console.error('Error fetching roadtrips', error);
                setFlashMessage({ type: 'error', message: 'Une erreur est survenue lors de la récupération des roadtrips.'});
            })

        const profilePromise = axios.get('/api/profile')
            .then(response => {
                setCurrentUser(response.data.user);
            })
            .catch(error => {
                console.error('Error fetching user profile:', error);
                flashMessage({ error: 'Une erreur est survenue lors de la recherche de profil' });
            })

        Promise.all([roadtripPromise, profilePromise])
        .finally(() => {
            setLoading(false);
        })
    }, []);


    const handleSubmit = e => {
        e.preventDefault();

        setLoading(true);

        const form = new FormData(formRef.current);
        form.append('price', selectedPrice);
        form.append('duration', selectedDuration);
        
        axios.get('/api/roadtrip/search?' + new URLSearchParams(form))
            .then(response => {
                setRoadtrips(response.data);
                setErrors({});
            })
            .catch(error => {
                console.error('Error fetching roadtrips', error);
                setErrors({ form: 'Une erreur est survenue lors de la recherche des roadtrips.'});
            })
            .finally(() => { 
                setLoading(false);
            });
        
    }

    // Handle price and duration filters
    const handlePriceChange = (e) => {
        setSelectedPrice(e.target.value);
    };
    
    const handleDurationChange = (e) => {
        setSelectedDuration(e.target.value);
    };

    return (
        <section className={`first-section ${styles.section}`}>
            <h1 className={`typical-title ${styles.title}`}>Roadtrips</h1>
            <div className={styles.container}>
                <div className={`${styles.roadtripsContainer}`}>
                    <h2 className={styles.secondTitle}>Chercher un roadtrip</h2>
                    <div className={styles.linkContainer}>
                        <p>Ou vous préférez peut être...</p>
                        <Link to={paths.CREATE_ROADTRIP} className={`${styles.createLink} link`}>Créer un roadtrip</Link>
                    </div>
                    {flashMessage && ( 
                        <div className={`flash flash-${flashMessage.type} ${formStyles.flashGreen}`}>
                            {flashMessage.message}
                        </div>
                    )}
                    <form className={styles.searchRoadtrip} ref={formRef} onSubmit={handleSubmit}>
                        <div className={styles.formPrincipal}>
                            <div className={styles.countryInputContainer}>
                                <label htmlFor="country">Pays disponibles :</label>
                                <div className={styles.countryInput}>
                                    <input
                                        type="text"
                                        value={query}
                                        onChange={handleCountryChange}
                                        id="country"
                                        name="country">
                                    </input>
                                    {countrySuggestions.length > 0 && (
                                        <ul className={styles.countriesList}>
                                            {countrySuggestions.map((country, index) => (
                                                <li key={index} onClick={() => handleCountrySelection(country)}>{country.name}</li>
                                            ))}
                                        </ul>
                                    )}
                                </div>
                            </div>
                            <div className={styles.filter}>
                                <label htmlFor="filter">Filtres :</label>
                                <select name="filter" id="filter">
                                    <option value="all">Tous</option>
                                    <option value="mostRecent">Les plus récents</option>
                                    <option value="mostOlder">Les plus vieux</option>
                                </select>
                            </div>
                            <input className={`${styles.submit}`} type="submit" value="Chercher" />
                        </div>
                        {errors.form && (
                            <div className={formStyles.errorsContainer}>
                                {Object.keys(errors).map((key) => (
                                    <small key={key} className={`${formStyles.errorGreen} ${styles.error}`}>
                                        <div className={styles.errorIcon}></div>{errors[key]}
                                    </small>
                                ))}
                            </div>
                        )}
                        <div className={styles.options}>
                            <fieldset>
                                <legend className={styles.legend}>Budget :</legend>
                                <ul className={styles.optionsList}>
                                    <li>
                                        <input
                                        type="radio"
                                        id="price_1"
                                        name="price"
                                        value="price_1"
                                        checked={selectedPrice === 'price_1'}
                                        onChange={handlePriceChange}
                                        />
                                        <label htmlFor="price_1">Tout</label>
                                    </li>
                                    <li>
                                        <input
                                        type="radio"
                                        id="price_2"
                                        name="price"
                                        value="price_2"
                                        checked={selectedPrice === 'price_2'}
                                        onChange={handlePriceChange}
                                        />
                                        <label htmlFor="price_2">€</label>
                                    </li>
                                    <li>
                                        <input
                                        type="radio"
                                        id="price_3"
                                        name="price"
                                        value="price_3"
                                        checked={selectedPrice === 'price_3'}
                                        onChange={handlePriceChange}
                                        />
                                        <label htmlFor="price_3">€ €</label>
                                    </li>
                                    <li>
                                        <input
                                        type="radio"
                                        id="price_4"
                                        name="price"
                                        value="price_4"
                                        checked={selectedPrice === 'price_4'}
                                        onChange={handlePriceChange}
                                        />
                                        <label htmlFor="price_4">€ € €</label>
                                    </li>
                                </ul>
                            </fieldset>

                            <fieldset>
                                <legend className={styles.legend}>Durée :</legend>
                                <ul className={styles.optionsList}>
                                    <li>
                                        <input
                                        type="radio"
                                        id="duration_1"
                                        name="duration"
                                        value="duration_1"
                                        checked={selectedDuration === 'duration_1'}
                                        onChange={handleDurationChange}
                                        />
                                        <label htmlFor="duration_1">Tout</label>
                                    </li>
                                    <li>
                                        <input
                                        type="radio"
                                        id="duration_2"
                                        name="duration"
                                        value="duration_2"
                                        checked={selectedDuration === 'duration_2'}
                                        onChange={handleDurationChange}
                                        />
                                        <label htmlFor="duration_2">1 à 7 jours</label>
                                    </li>
                                    <li>
                                        <input
                                        type="radio"
                                        id="duration_3"
                                        name="duration"
                                        value="duration_3"
                                        checked={selectedDuration === 'duration_3'}
                                        onChange={handleDurationChange}
                                        />
                                        <label htmlFor="duration_3">8 à 15 jours</label>
                                    </li>
                                    <li>
                                        <input
                                        type="radio"
                                        id="duration_4"
                                        name="duration"
                                        value="duration_4"
                                        checked={selectedDuration === 'duration_4'}
                                        onChange={handleDurationChange}
                                        />
                                        <label htmlFor="duration_4">15 jours et plus</label>
                                    </li>
                                </ul>
                            </fieldset>
                        </div>
                    </form>
                    {loading ? (
                        <div className={`${styles.loaderContainer} loader-container`}>
                            <span className={`loader ${formStyles.loader} ${formStyles.loaderGreen}`}></span>
                            <span className={`loader-text ${formStyles.loaderTextGreen}`}>Chargement...</span>
                        </div>
                    ) : (
                        <>
                            <div className={styles.roadtrips}>
                                {currentRoadtrips.length > 0 ? (
                                    currentRoadtrips.map((roadtrip, index) => (
                                        <CardRoadtrip key={index} roadtrip={roadtrip} currentUser={currentUser} setCurrentUser={setCurrentUser}/>
                                    ))
                                ) : (
                                    <p>Aucun roadtrip trouvé</p>
                                )} 
                            </div>
                        </>
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
    )
}