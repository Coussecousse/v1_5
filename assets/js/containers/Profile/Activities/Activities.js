import React, { useState } from "react";
import styles from '../Profile.module.css'
import navigationStyles from '../ProfileNavigation/ProfileNavigation.module.css';
import CardActivity from "../../Activity/Card/CardActivity";

export default function Activities({ user, setCurrentUser, userLogin }) {
    const [isOpen, setIsOpen] = useState({
        created: true,
        favorites: false
    });

    const handleOpenActivities = (container) => {
        setIsOpen({
            created: container === 0,
            favorites: container === 1
        });
    };

    return (
        <div className={styles.container}>
            {/* Navigation Tabs */}
            <ul className={styles.navigation}>
                <li>
                    <button
                        className={`${navigationStyles.profileLink} ${isOpen.created && navigationStyles.active}`}
                        onClick={() => handleOpenActivities(0)}
                    >
                        Activités créées
                    </button>
                </li>
                <li>
                    <button
                        className={`${navigationStyles.profileLink} ${isOpen.favorites && navigationStyles.active}`}
                        onClick={() => handleOpenActivities(1)}
                    >
                        Activités favorites
                    </button>
                </li>
            </ul>

            {/* Activity Cards */}
            <ul className={styles.listContainer}>
                {isOpen.created && (
                    user.activities.length > 0 ? (
                        user.activities.map((activity, index) => (
                            <li key={index}>
                                <CardActivity
                                    key={index}
                                    activity={activity}
                                    index={index}
                                    currentUser={userLogin ? userLogin : user}
                                    setCurrentUser={setCurrentUser}
                                />
                            </li>
                        ))
                    ) : (
                        <p>Pas d'activités créées.</p>
                    )
                )}

                {isOpen.favorites && (
                    user.favorites.activities.length > 0 ? (
                        user.favorites.activities.map((activity, index) => (
                            <li key={index}>
                                <CardActivity
                                    key={index}
                                    activity={activity}
                                    index={index}
                                    currentUser={userLogin ? userLogin : user}
                                    setCurrentUser={setCurrentUser}
                                />
                            </li>
                        ))
                    ) : (
                        <p>Pas d'activités favorites.</p>
                    )
                )}
            </ul>
        </div>
    );
}
