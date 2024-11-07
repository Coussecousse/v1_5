import React, { useEffect, useState, useRef} from "react";
import { Link } from "react-router-dom";
import styles from "./Roadtrips.module.css";
import formStyles from '../../containers/Form/Form.module.css'
import paths from "../../config/paths";
import axios from "axios";

export default function Roadtrips() {
    const [query, setQuery] = useState("");
    const [countries, setCountries] = useState([]);
    const [countrySuggestions, setCountrySuggestions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const [roadtrips, setRoadtrips] = useState([]);
    const [currentRoadtrips, setCurrentRoadtrips] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const roadtripsPerPage = 10; 
    const debounceTimeout = useRef(null);
    // check if usefull
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

        // debounceTimeout.current = setTimeout(async () => {
        //     if (value.length > 1) {
        //         try {
        //             const response = await axios.get(`/api/tags/autocomplete?q=${value}`);
        //             setSuggestions(response.data);
        //         } catch (error) {
        //             console.error('Error fetching autocomplete suggestions', error);
        //         }
        //     } else {
        //         setSuggestions([]);
        //     }
        // }, 300);
    }

    const handleCountrySelection = (suggestion) => {
        setQuery(suggestion.name);
        setCountrySuggestions([]); 
    };

    return (
        <section className={`first-section ${styles.section}`}>
            <h1 className={`typical-title ${styles.title}`}>Roadtrips</h1>
            <div className={styles.container}>
                <div className={`${styles.roadtripsContainer}`}>
                    <h2>Chercher un roadtrip dans la communauté</h2>
                    <div>
                        <p>Ou vous préférez peut être...</p>
                        <Link to={paths.CREATE_ROADTRIP} className={`${styles.createLink} link`}>Créer un roadtrip</Link>
                    </div>
                </div>
                <form className={styles.searchRoadtrip} ref={formRef}>
                    <div className={styles.formPrincipal}>
                        <div className={styles.countyInputContainer}>
                            <label htmlFor="country">Pays disponibles</label>
                            <div>
                                <input
                                    type="text"
                                    value={query}
                                    onChange={handleCountryChange}
                                    id="country"
                                    name="country">
                                </input>
                                {countries.length > 0 && (
                                    <ul className={formStyles.countriesList}>
                                        {countries.map((country, index) => (
                                            <li key={index} onClick={() => handleCountrySelection(country)}>{country}</li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                        </div>
                        <div className={styles.filter}>
                            <label htmlFor="filter">Filtres</label>
                            <select name="filter" id="filter">
                                <option value="all">Tous</option>
                                <option value="mostRecent">Les plus récents</option>
                                <option value="mostPopular">Les plus populaires</option>
                            </select>
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
                        <input className={`${styles.submit}`} type="submit" value="Chercher" />
                    </div>
                    <div className={styles.options}>
                        <fieldset>
                            <legend>Prix :</legend>
                            <div>
                                <input type="radio" id="price_1" name="price" value="price_1" />
                                <label>€</label>
                            </div>
                            <div>
                                <input type="radio" id="price_2" name="price" value="price_2" />
                                <label>€€</label>
                            </div>
                            <div>
                                <input type="radio" id="price_3" name="price" value="price_3" />
                                <label>€€€</label>
                            </div>
                        </fieldset>
                        <fieldset>
                            <legend>Durée :</legend>
                            <div>
                                <input type="radio" id="duration_1" name="duration" value="duration_1" />
                                <label>1 à 7 jours</label>
                            </div>
                            <div>
                                <input type="radio" id="duration_2" name="duration" value="duration_2" />
                                <label>8 à 15 jours</label>
                            </div>
                            <div>
                                <input type="radio" id="duration_3" name="duration" value="duration_3" />
                                <label>15 jours et plus</label>
                            </div>
                        </fieldset>
                    </div>
                </form>
                {loading ? (
                    <div className={`${styles.loaderContainer} loader-container`}>
                        <span className={`loader ${formStyles.loader} ${formStyles.loaderGreen}`}></span>
                        <span className={`loader-text ${formStyles.loaderTextGreen}`}>Chargement...</span>
                    </div>
                ) : (
                    <div className={styles.roadtrips}>
                        {currentRoadtrips.length > 0 ? (
                            currentRoadtrips.map((roadtrip, index) => (
                                <div key={index}>Roadtrip</div>
                            ))
                        ) : (
                            <p>Aucun roadtrip trouvé</p>
                        )}
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
        </section>
    )
}