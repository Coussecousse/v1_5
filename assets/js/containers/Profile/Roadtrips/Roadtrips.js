import React, { useState } from "react";
import styles from '../Profile.module.css';
import navigationStyles from '../ProfileNavigation/ProfileNavigation.module.css';
import CardRoadtrip from "../../Roadtrip/Card/CardRoadtrip";

export default function Roadtrips({ user, setCurrentUser, userLogin }) {
    const [isOpen, setIsOpen] = useState({
        created: true,
        favorites: false
    });

    const handleOpenRoadtrips = (container) => {
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
                        onClick={() => handleOpenRoadtrips(0)}
                    >
                        Roadtrips créés
                    </button>
                </li>
                <li>
                    <button
                        className={`${navigationStyles.profileLink} ${isOpen.favorites && navigationStyles.active}`}
                        onClick={() => handleOpenRoadtrips(1)}
                    >
                        Roadtrips favoris
                    </button>
                </li>
            </ul>

            {/* Roadtrip Cards */}
            <ul className={styles.listContainer}>
                {isOpen.created && (
                    user.roadtrips.length > 0 ? (
                        user.roadtrips.map((roadtrip, index) => (
                            <li key={index}>
                                <CardRoadtrip
                                    key={index}
                                    roadtrip={roadtrip}
                                    index={index}
                                    currentUser={userLogin ? userLogin : user}
                                    setCurrentUser={setCurrentUser}
                                />
                            </li>
                        ))
                    ) : (
                        <p>Pas de roadtrips créés.</p>
                    )
                )}

                {isOpen.favorites && (
                    user.favorites.roadtrips.length > 0 ? (
                        user.favorites.roadtrips.map((roadtrip, index) => (
                            <li key={index}>
                                <CardRoadtrip
                                    key={index}
                                    roadtrip={roadtrip}
                                    index={index}
                                    currentUser={userLogin ? userLogin : user}
                                    setCurrentUser={setCurrentUser}
                                />
                            </li>
                        ))
                    ) : (
                        <p>Pas de roadtrips favoris.</p>
                    )
                )}
            </ul>
        </div>
    );
}
