import React, { useEffect, useRef, useState } from "react";
import styles from './Day.module.css';
import createRoadtripStyles from '../../components/Roadtrips/Create/CreateRoadtrip.module.css';
import formStyles from '../Form/Form.module.css';
import Place from "../Place/Place";
import Map from "../Map/Map";
import config from "../../config/locationIQ";
import axios from "axios";
import DrawMap from "../Map/DrawMap/DrawMap";

export default function Day({ day, index, setDays, setRoads, days, roads }) {
    const [isOpen, setIsOpen] = useState(true);
    const [isOpenAdd, setIsOpenAdd] = useState(false);
    const [errors, setErrors] = useState({});
    const [newQueryLocation, setNewQueryLocation] = useState({});
    const [jsonDraw, setJsonDraw] = useState({});
    const [localisations, setLocalisations] = useState([]);
    const [currentSearchDraw, setCurrentSearchDraw] = useState({});
    const refDayButton = useRef(null);
    const refStage = useRef(null);
    const refAddContainer = useRef(null);
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
            setIsOpenAdd(false);
        }
    }, [isOpen]);
    useEffect(() => {
        if (isOpenAdd) {
            refPlacesContainer.current?.classList.remove(styles.open);
            refAddContainer.current?.classList.add(styles.open);
        } else {
            refAddContainer.current?.classList.remove(styles.open);
            refPlacesContainer.current?.classList.add(styles.open);

            setNewQueryLocation({});
            refInputPlace.current.value = '';
            setErrors({});
            setJsonDraw({});
        }
    }, [isOpenAdd]);

    // -- Search Place --
    const handleSearchPlace = () => {
        const query = refInputPlace.current.value;

        if (query.length < 3) {
            setErrors({name_place: 'Vous devez donner plus d\'indications...' });
            return;
        }

        axios.get(`https://eu1.locationiq.com/v1/search?key=${config.key}&q=${query}&format=json`)
            .then(response => {
                if (response.data) {
                    setNewQueryLocation(response.data);
                } else {
                    setErrors({name_place: 'Adresse non trouvée' });
                }
            })
            .catch(error => {
                console.error('Error fetching result', error);
                setErrors({name_place: 'Une erreur est survenue lors de la recherche de l\'adresse' });
            });
    };

    useEffect(() => {
        if (Object.keys(newQueryLocation).length > 0 && (day.length > 0 || index > 0)) {
            setCurrentSearchDraw(prev => (prev !== newQueryLocation[0] ? newQueryLocation[0] : prev));
        }
    }, [day, newQueryLocation]);

    // -- Draw Road --
    useEffect(() => {
        if (Object.keys(currentSearchDraw).length < 1) return;
        let firstPlace;
        if (day.length === 0 && index > 0) {
            firstPlace = days[index - 1][days[index - 1].length - 1].informations;
        } else {
            firstPlace = day[day.length - 1].informations;
        }
        const secondPlace = currentSearchDraw;

        axios.get(`https://eu1.locationiq.com/v1/directions/driving/${firstPlace.lng},${firstPlace.lat};${secondPlace.lon},${secondPlace.lat}?key=${config.key}&steps=true&alternatives=true&geometries=polyline&overview=full`)
            .then(response => {
                if (response.data) {
                    setJsonDraw(response.data);
                    setLocalisations([firstPlace, secondPlace]);
                } else {
                    setErrors({name_place: 'Une erreur est survenue lors du calcul de l\'itinéraire' });
                }
            })
            .catch(error => {
                console.error('Error fetching result', error);
                setErrors({name_place: 'Une erreur est survenue lors du calcul de l\'itinéraire' });
            });
    }, [currentSearchDraw]);

    const handleAddNewLocationToDay = () => {
        const { display_name, lat, lon } = 
            Object.keys(currentSearchDraw).length > 0 ?
            currentSearchDraw : newQueryLocation;
        const locationData = { display_name, lat, lng: lon };

        setNewQueryLocation({});
        refInputPlace.current.value = '';

        setDays(prevDays => {
            const updatedDays = [...prevDays];
            updatedDays[index] = [...day, {informations: locationData}]            
            return updatedDays;
        });

        if (Object.keys(jsonDraw).length > 0) {
            if (days[index + 1]) {
                // If there is a next day, calculate the road between the last place of the current day and the first place of the next day
                const firstPlace = locationData;
                const secondPlace = days[index + 1][0].informations;
                
                axios.get(`https://eu1.locationiq.com/v1/directions/driving/${firstPlace.lng},${firstPlace.lat};${secondPlace.lng},${secondPlace.lat}?key=${config.key}&steps=true&alternatives=true&geometries=polyline&overview=full`)
                .then(response => {
                    if (response.data) {
                        // I need to change only the first one
                        const newRoad = response.data;
                        setRoads(prevRoads => {
                            const updatedRoads = [...prevRoads];
                            if (!updatedRoads[index]) {
                                updatedRoads[index] = [];
                            }
                            updatedRoads[index] = [...updatedRoads[index], jsonDraw];

                            // Change the first road of the next day
                            updatedRoads[index + 1].splice(0, 1, newRoad);
                            return updatedRoads;
                        })
                    } else {
                        setErrors({ name_place: 'Une erreur est survenue lors du calcul de l\'itinéraire'});
                    }
                })
                .catch(error => {
                    console.error('Error fetching result', error);
                    setErrors({name_place: 'Une erreur est survenue lors du calcul de l\'itinéraire'});
                });
            } else {
                // Only add the road to the current day
                setRoads(prevRoads => {
                    const updatedRoads = [...prevRoads];
                    if (!updatedRoads[index]) {
                        updatedRoads[index] = [];
                    }
                    updatedRoads[index] = [...updatedRoads[index], jsonDraw];
                    return updatedRoads;
                });
            }
        }

        setJsonDraw({});
        setLocalisations([]);
        setIsOpenAdd(false);
    };

    // -- Delete Day --
    const handleDeleteDay = () => {
        let newRoad = null; // Placeholder for the recalculated road, if needed
        let prevLastPlace, nextFirstPlace;
    
        // Determine the places to recalculate the road if needed
        if (index > 0 && days[index + 1]) {
            prevLastPlace = days[index - 1][days[index - 1].length - 1].informations;
            nextFirstPlace = days[index + 1][0].informations;
        }
    
        const calculateNewRoad = async () => {
            if (prevLastPlace && nextFirstPlace) {
                try {
                    const response = await axios.get(
                        `https://eu1.locationiq.com/v1/directions/driving/${prevLastPlace.lng},${prevLastPlace.lat};${nextFirstPlace.lng},${nextFirstPlace.lat}?key=${config.key}&steps=true&alternatives=true&geometries=polyline&overview=full`
                    );
                    if (response.data) {
                        newRoad = response.data; // Save the new road data
                    }
                } catch (error) {
                    console.error('Error recalculating road:', error);
                    setErrors({name_place: 'Une erreur est survenue lors du recalcul de l\'itinéraire'});
                }
            }
        };
    
        calculateNewRoad().then(() => {
            // Perform all updates in one `setRoads`
            setRoads(prevRoads => {
                const updatedRoads = [...prevRoads];
    
                // Remove the first road of the next day
                if (updatedRoads[index + 1] && updatedRoads[index + 1].length > 0) {
                    updatedRoads[index + 1].splice(0, 1);
                }
    
                // Remove the roads for the deleted day
                updatedRoads.splice(index, 1);
    
                // If a new road was calculated, insert it at the start of the next day's roads
                if (newRoad && updatedRoads[index]) {
                    updatedRoads[index].unshift(newRoad);
                }
    
                return updatedRoads;
            });
        });

        // Remove the day and the first road of the next day (if any)
        setDays(prevDays => {
            const updatedDays = [...prevDays];
            updatedDays.splice(index, 1);
            return updatedDays;
        });
    };
    
    

    return (
        <div className={styles.container}>
            <div className={createRoadtripStyles.stageButtonsContainer}>
                <div
                    aria-label={`Jour ${index + 1}`}
                    onClick={() => setIsOpen(!isOpen)}
                    role="button"
                    className={`${createRoadtripStyles.button} ${createRoadtripStyles.openButton} ${styles.dayButton}`}
                    ref={refDayButton}>
                    <span className={createRoadtripStyles.openIcon}>❯</span>
                    <p>Jour {index + 1} :</p>
                </div>
                <div
                    aria-label={ isOpenAdd ? "Bouton annuler l'action" : "Bouton rajouter une ville"}
                    role="button"
                    className={createRoadtripStyles.button}
                    onClick={() => setIsOpenAdd(!isOpenAdd)}>
                    { isOpenAdd ? "Annuler l'action" : "Rajouter une ville"}
                </div>
                <div
                    aria-label="Bouton supprimer la journée"
                    role="button"
                    className={createRoadtripStyles.button}
                    onClick={handleDeleteDay}>
                    Supprimer la journée
                </div>
            </div>
            <div className={styles.stageContainer} ref={refStage}>
                <div className={`${styles.placesContainer} ${styles.open}`} ref={refPlacesContainer}>
                    {day.length > 0 ? (
                        <ul className={styles.placesList}>
                            {day.map((place, i) => (
                                <li key={i}><Place place={place} indexPlace={i} indexDay={index} setDays={setDays} setRoads={setRoads} roads={roads} days={days} /></li>
                            ))}
                        </ul>
                    ) : (
                        <div>Cette journée est vide...</div>
                    )}
                </div>
                <div className={styles.addContainer} ref={refAddContainer}>
                    <div className={`${styles.addPlaceContainer} ${styles.addForm}`}>
                        <div className={styles.searchContainer}>
                            <h2>Ajouter un lieu :</h2>
                            <div className={`input2_elementsContainer ${styles.input}`}>
                                <label htmlFor="name_place">Nom :</label>
                                <div className={`input2_container ${styles.inputContainer}`}>
                                    <input
                                        type="text"
                                        id="name_place"
                                        name="name_place"
                                        placeholder="Nom du lieu"
                                        ref={refInputPlace}>
                                    </input>
                                    <div role="button" onClick={handleSearchPlace} className={styles.searchButton}>Chercher</div>
                                </div>
                            </div>
                            {day.length > 0 && <small>Les calculs d'itinéraires ne se feront que sur des distances allant jusqu'à 10,000 km en voiture.</small>}
                            {errors.name_place && <small className={`smallFormError ${formStyles.errorGreen}`}><div className={createRoadtripStyles.errorIcon}></div>{errors.name_place}</small>}
                            {(Object.keys(currentSearchDraw).length > 0 && newQueryLocation.length > 0) && (
                                <ul className={styles.locationList}>
                                    {newQueryLocation.map((newQuery, index) => (
                                        <li
                                            role="button"
                                            key={index}
                                            aria-label="Choisir cette adresse"
                                            onClick={() => setCurrentSearchDraw(newQuery)}
                                            className={newQuery.place_id === currentSearchDraw.place_id ? styles.activeJsonDrawLocation : ''}>
                                            {newQuery.display_name}
                                        </li>
                                    ))}
                                </ul>
                            )}
                            {Object.keys(newQueryLocation).length > 0 && (
                                <div
                                    className={styles.addButton}
                                    onClick={handleAddNewLocationToDay}
                                    role="button">
                                    Ajouter
                                </div>
                            )}
                        </div>
                        <div className={styles.littleMap}>
                            {Object.keys(newQueryLocation).length > 0 &&
                                (day.length > 0 || index > 0 ? (
                                    Object.keys(jsonDraw).length > 0 && localisations.length > 0 && (
                                        <DrawMap
                                            drawJson={jsonDraw}
                                            localisations={localisations}
                                            zoom={6}
                                        />
                                    )
                                ) : (
                                    <Map
                                        jsonLocation={newQueryLocation}
                                        setSelectionnedLocation={setNewQueryLocation}
                                        zoom={5}
                                    />
                                ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
