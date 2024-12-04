import React, { useState, useEffect } from "react";
import createRoadtripStyles from '../../components/Roadtrips/Create/CreateRoadtrip.module.css';
import styles from './Place.module.css';
import config from "../../config/locationIQ";
import axios from "axios";

export default function Place({place, indexPlace, indexDay, setDays, setRoads, roads, days}) {
    const [note, setNote] = useState('');
    const [isNoteOpen, setIsNoteOpen] = useState(false);

    const handleNote = () => {
        setIsNoteOpen(!isNoteOpen);
    }

    useEffect(() => {
        if (note) {
            setDays(prevDays => {
                const newDays = [...prevDays];
                newDays[indexDay][indexPlace].note = note;
                return newDays;
            })
        }
    }, [note])

    const getPreviousPlace = (dayIndex, placeIndex, daysArray) => {
        if (placeIndex === 0 && dayIndex > 0) {
            // Return the last place of the previous day
            return daysArray[dayIndex - 1][daysArray[dayIndex - 1].length - 1];
        }
        if (placeIndex > 0) {
            // Return the previous place in the same day
            return daysArray[dayIndex][placeIndex - 1];
        }
        return null;
    };
    
    const getNextPlace = (dayIndex, placeIndex, daysArray) => {
        if (placeIndex < daysArray[dayIndex].length - 1) {
            // Return the next place in the same day
            return daysArray[dayIndex][placeIndex + 1];
        }
        if (dayIndex < daysArray.length - 1) {
            // Return the first place of the next day
            return daysArray[dayIndex + 1][0];
        }
        return null;
    };
    
    
    const calculateRoad = async (place1, place2) => {
        try {
            const response = await axios.get(
                `https://eu1.locationiq.com/v1/directions/driving/${place1.lng},${place1.lat};${place2.lng},${place2.lat}?key=${config.key}&steps=true&alternatives=true&geometries=polyline&overview=full`
            );
            return response.data;
        } catch (error) {
            console.error('Error calculating road:', error);
            return null;
        }
    };

    const handleDeleteCity = async () => {
        // -- Functions --
        const insertRoad = (dayIndex, roadIndex, newRoad) => {
            if (updatedRoads[dayIndex]) {
                updatedRoads[dayIndex].splice(roadIndex, 0, newRoad);
            } else {
                updatedRoads[dayIndex] = [newRoad];
            }
        };
        
        const removeRoads = (dayIndex, startIndex, count) => {
            if (updatedRoads[dayIndex]) {
                updatedRoads[dayIndex].splice(startIndex, count);
            }
        };
    

        const previousPlace = getPreviousPlace(indexDay, indexPlace, days);
        const nextPlace = getNextPlace(indexDay, indexPlace, days);
    
        // Remove the current place from `days`
        setDays(prevDays => {
            const updatedDays = [...prevDays];
            updatedDays[indexDay].splice(indexPlace, 1); // Remove the place
            return updatedDays.filter(day => day.length > 0); // Remove empty days
        });
    
        let updatedRoads = [...roads];
    
        if (!previousPlace && !nextPlace) {
            // Case 1: Single place in the roadtrip
            updatedRoads = [];
        } else if (!previousPlace) {
            // Case 2: First place of the roadtrip
            if (days.length > 0 && days[0].length < 1) {
                // Remove the first road of the next day
                removeRoads(indexDay + 1, 0, 1); 
                updatedRoads[indexDay] = [];
            } else {
                // Remove the first road of the day
                removeRoads(indexDay, 0, 1); 
            }
        } else if (!nextPlace) {
            // Case 3: Last place of the roadtrip
            removeRoads(indexDay, indexPlace, 1);
        } else {
            // Case 4: Middle place in the roadtrip
            const firstPlace = previousPlace.informations;
            const secondPlace = nextPlace.informations;
    
            // Remove A-B and B-C roads
            if (indexDay === 0 && indexPlace === days[indexDay].length) {
                removeRoads(indexDay, indexPlace - 1, 1);
                removeRoads(indexDay + 1, 0, 1);
            } else if (indexDay === 0) {
                removeRoads(indexDay, indexPlace - 1, 2);
            } else if (indexPlace === days[indexDay].length) {
                removeRoads(indexDay, indexPlace, 1);
                removeRoads(indexDay + 1, 0, 1);
            } else {
                removeRoads(indexDay, indexPlace, 2);
            }
    
            // Calculate the new road between A and C
            const newRoad = await calculateRoad(firstPlace, secondPlace);
    
            // Insert the recalculated road
            if ((indexDay === 0 && indexPlace === days[0].length) || indexPlace === days[indexDay].length) {
                insertRoad(indexDay + 1, 0, newRoad);
            } else {
                insertRoad(indexDay, indexPlace - 1, newRoad);
            }
        }
    
        // Clean up empty road arrays
        updatedRoads = updatedRoads.filter((dayRoads, index) => dayRoads?.length > 0 || (index === 0 && days[0].length > 0));
    
        // Update the state with the new roads
        setRoads(updatedRoads);
    };
    

    return (
        <div className={styles.placeContainer}>
            <h3>{indexPlace + 1}. {place.informations.display_name}</h3>
            <div className={styles.buttonsContainer}>
                <small className={createRoadtripStyles.button} role="button" onClick={handleNote} aria-label="Bouton créer une note">
                    {note ? (isNoteOpen ?
                        'Fermer la note' : 'Voir la note')
                        : 'Créer une note'}</small>
                <small 
                    className={createRoadtripStyles.button} 
                    role="button" 
                    aria-label="Boutton supprimer la ville"
                    onClick={handleDeleteCity}>
                        Supprimer la ville
                </small>
            </div>
            {isNoteOpen && 
                <textarea
                    value={note}
                    onChange={e => setNote(e.target.value)}
                    placeholder="Ajouter une note"
                    className={styles.note}
                ></textarea>
            }
        </div>
    )
}