import React from 'react';
import styles from './ProfileNavigation.module.css';

export default function ProfileNavigation({ handleContainersProfile, isOpen, user, userLogin=null }) {
    return (
        <ul className={styles.navigation}>
            <li>
                <button onClick={() => handleContainersProfile(0)} className={`${styles.profileLink} ${isOpen.parameters && styles.active}`}>
                    {!userLogin ? 'Paramètres' : 'Accueil' }
                </button>
            </li>
            <li>
                <button onClick={() => handleContainersProfile(1)} className={`${styles.profileLink} ${isOpen.roadtrips && styles.active}`}>
                    {!userLogin ? 'Mes roadtrips' : 'Ses roadtrips'}
                </button>
            </li>
            <li>
                <button onClick={() => handleContainersProfile(2)} className={`${styles.profileLink} ${isOpen.activities && styles.active}`}>
                    {!userLogin ? 'Mes activités' : 'Ses activités'}
                </button>
            </li>
            {user && user.role.includes('ROLE_ADMIN') && (
                <li>
                <button onClick={() => handleContainersProfile(3)} className={`${styles.profileLink} ${isOpen.activities && styles.active}`}>
                    Administration
                </button>
            </li>
            )}
        </ul>
    );
}
