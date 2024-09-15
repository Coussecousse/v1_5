import React from 'react';
import styles from './ProfileNavigation.module.css';
import paths from '../../../config/paths';
import { NavLink } from 'react-router-dom';

export default function ProfileNavigation() {
    return (
        <ul className={`${styles.navigation}`}>
            <li><NavLink to={paths.PROFILE} className={`profileLink`}>Paramètres</NavLink></li>
            <li><NavLink to={paths.PROFILE_ROADTRIPS} className={`profileLink`}>Mes roadtrips</NavLink></li>
            <li><NavLink to={paths.PROFILE_ACTIVITIES} className={`profileLink`}>Mes activités</NavLink></li>
        </ul>
    )
}