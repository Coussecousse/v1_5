import React, { useState, useEffect } from "react";
import styles from './Place.module.css';

export default function Place({place, indexPlace, indexDay, setDays}) {{}
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

    return (
        <div className={styles.placeContainer}>
            <h3>{indexPlace + 1}. {place.informations.display_name}</h3>
            <small role="button" onClick={handleNote} aria-label="Bouton créer une note">
                {note ? (isNoteOpen ? 
                    'Fermer la note' : 'Voir la note')
                    : 'Créer une note'}</small>
            <small role="button" aria-label="Boutton supprimer le lieu">Supprimer le lieu</small>
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