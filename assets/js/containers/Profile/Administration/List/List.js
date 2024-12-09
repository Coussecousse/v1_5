import React, { useState } from "react";
import { Link } from "react-router-dom";
import styles from './List.module.css';
import formStyles from '../../../Form/Form.module.css';
import axios from "axios";

export default function List({ data, type, setData }) {
    const [flashMessage, setFlashMessage] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleLink = (d) => {
        switch (type) {
            case "roadtrips":
                return `/roadtrips/${d.uid}`;
            case "activities":
                return `/activities/${d.uid}`;
            case "users":
                return `/users/${d.uid}`;
            default:
                return "#";
        }
    };

    // Handle Reset
    const handleReset = async (uid, index) => {
        setLoading(true);
        try {
            await axios.get(`/api/administration/reset/${type}/${uid}`);
            let message;
            switch (type) {
                case 'roadtrips':
                    message = `Le roadtrip ${uid} a été réinitialisé.`;
                    break;
                case 'activities':
                    message = `L'activité ${uid} a été réinitialisée.`;
                    break;
                case 'users':
                    message = `L'utilisateur ${uid} a été réinitialisé.`;
                    break;
                default:
                    message = `L'élément ${uid} a été réinitialisé.`;
                    break;
            }
            setFlashMessage({ type: 'success', message });

            // Update the report data
            setData((prevData) => {
                const newData = [...prevData];
                newData[index].report = 0;
                return newData;
            });

        } catch (error) {
            console.error(error);
            let message;
            switch (type) {
                case 'roadtrips':
                    message = `Échec de la réinitialisation du roadtrip ${uid}.`;
                    break;
                case 'activities':
                    message = `Échec de la réinitialisation de l'activité ${uid}.`;
                    break;
                case 'users':
                    message = `Échec de la réinitialisation de l'utilisateur ${uid}.`;
                    break;
                default:
                    message = `Échec de la réinitialisation de l'élément ${uid}.`;
                    break;
            }
            setFlashMessage({ type: 'error', message });
        } finally {
            setLoading(false);
        }
    };

    // Handle Delete
    const handleDelete = async (uid) => {
        setLoading(true);
        try {
            await axios.get(`/api/administration/delete/${type}/${uid}`);
            let message;
            switch (type) {
                case 'roadtrips':
                    message = `Le roadtrip ${uid} a été supprimé.`;
                    break;
                case 'activities':
                    message = `L'activité ${uid} a été supprimée.`;
                    break;
                case 'users':
                    message = `L'utilisateur ${uid} a été supprimé.`;
                    break;
                default:
                    message = `L'élément ${uid} a été supprimé.`;
                    break;
            }
            setFlashMessage({ type: 'success', message });

            // Delete the element from the list
            setData((prevData) => {
                const newData = prevData.filter((d) => d.uid !== uid);
                return newData;
            });
        } catch (error) {
            console.error(error);
            let message;
            switch (type) {
                case 'roadtrips':
                    message = `Échec de la suppression du roadtrip ${uid}.`;
                    break;
                case 'activities':
                    message = `Échec de la suppression de l'activité ${uid}.`;
                    break;
                case 'users':
                    message = `Échec de la suppression de l'utilisateur ${uid}.`;
                    break;
                default:
                    message = `Échec de la suppression de l'élément ${uid}.`;
                    break;
            }
            setFlashMessage({ type: 'error', message });
        } finally {
            setLoading(false);
        }
    };


    return (
        <div>
            {loading ? (
                <div className={`${styles.loaderContainer} loader-container`}>
                    <span className={`loader ${formStyles.loader} ${formStyles.loaderGreen}`}></span>
                    <span className={`loader-text ${formStyles.loaderTextGreen}`}>Chargement...</span>
                </div>
            ) : flashMessage ? (
                <div className={`flash flash-${flashMessage.type} ${formStyles.flashGreen}`}>
                    {flashMessage.message}
                </div>
            ) : null}

            <ul className={styles.listContainer}>
                {data.map((d, index) => (
                    <li key={index} className={styles.li}>
                        <Link to={handleLink(d)} className={styles.link} target="_blank">
                            {type === 'users' ? d.username : d.title}
                        </Link>
                        <div className={styles.buttonsContainer}>
                            <span>Signalement: {d.report}</span>
                            <small>
                                <button
                                    className={styles.button}
                                    onClick={() => handleReset(d.uid, index)}
                                    disabled={loading}
                                >
                                    Réinitialiser
                                </button>
                            </small>
                            <small>
                                <button
                                    className={styles.button}
                                    onClick={() => handleDelete(d.uid, index)}
                                    disabled={loading}
                                >
                                    Supprimer
                                </button>
                            </small>
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
}
