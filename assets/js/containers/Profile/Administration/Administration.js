import React, { useState, useEffect } from "react";
import axios from "axios";
import List from "./List/List";
import styles from '../Profile.module.css';
import navigationStyles from "../ProfileNavigation/ProfileNavigation.module.css"; 
import formStyles from '../../Form/Form.module.css';

export default function Administration() {
    const [loading, setLoading] = useState(false);
    const [isOpen, setIsOpen] = useState({
        roadtrips: true,
        activities: false,
        users: false,
    });

    const [roadtrips, setRoadtrips] = useState([]);
    const [activities, setActivities] = useState([]);
    const [users, setUsers] = useState([]);

    const handleOpenAdministration = (container) => {
        setIsOpen({
            roadtrips: container === "roadtrips",
            activities: container === "activities",
            users: container === "users",
        });
    };

    useEffect(() => {
        setLoading(true);
        axios
            .get("/api/administration")
            .then((response) => {
                const { roadtrips, activities, users } = response.data;
                setRoadtrips(roadtrips || []); 
                setActivities(activities || []);
                setUsers(users || []);
            })
            .catch((error) => {
                console.error("Error fetching administration data:", error);
            })
            .finally(() => { setLoading(false); });
    }, []);

    return (
        <div className={styles.container}>
            <ul className={styles.navigation}>
                <li>
                    <button
                        className={`${navigationStyles.profileLink} ${
                            isOpen.roadtrips && navigationStyles.active
                        }`}
                        onClick={() => handleOpenAdministration("roadtrips")}
                    >
                        Roadtrips
                    </button>
                </li>
                <li>
                    <button
                        className={`${navigationStyles.profileLink} ${
                            isOpen.activities && navigationStyles.active
                        }`}
                        onClick={() => handleOpenAdministration("activities")}
                    >
                        Activités
                    </button>
                </li>
                <li>
                    <button
                        className={`${navigationStyles.profileLink} ${
                            isOpen.users && navigationStyles.active
                        }`}
                        onClick={() => handleOpenAdministration("users")}
                    >
                        Utilisateurs
                    </button>
                </li>
            </ul>
            <div className={styles.listContainer}>
                {loading ? (
                    <div className={`${styles.loaderContainer} loader-container`}>
                        <span className={`loader ${formStyles.loader} ${formStyles.loaderGreen}`}></span>
                        <span className={`loader-text ${formStyles.loaderTextGreen}`}>Chargement...</span>
                    </div>
                ) : (
                    <>
                        {isOpen.roadtrips && <List type="roadtrips" data={roadtrips} setData={setRoadtrips}/>}
                        {isOpen.activities && <List type="activities" data={activities} setData={setActivities}/>}
                        {isOpen.users && <List type="users" data={users} setData={setUsers}/>}
                    </>
                )}

            </div>
        </div>
    );
}
