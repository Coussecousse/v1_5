import React, { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import paths from '../../config/paths';
import styles from './Navigation.module.css';

export default function Navigation({ hamburgerState, isAuthenticated }) {

    useEffect(() => {
        const navigation = document.querySelector(`.${styles.navigationContainer}`);
        const links = document.querySelectorAll(`.nav__link`);

        if (hamburgerState) {
            navigation.classList.add(styles.open);

            setTimeout(() => {
                links.forEach((element) => {
                    element.classList.add(styles.active);
                });
            }, 200);
        } else {
            navigation.classList.remove(styles.open);

            links.forEach((element) => {
                element.classList.remove(styles.active);
            });
        }

    }, [hamburgerState]);

    return (
        <nav className={styles.navigationContainer}>
            <ul className={styles.navigationList}>
                <li className={`${styles.fromLeft} nav__link`}><NavLink to={paths.HOME}>Accueil</NavLink></li>
                <li className={`${styles.fromRight} nav__link`}><NavLink to={paths.DESTINATIONS}>Destinations</NavLink></li>
                <li className={`${styles.fromLeft} nav__link`}><NavLink to={paths.COMMUNITY}>Communauté</NavLink></li>
                {isAuthenticated ? (
                    <>
                        <li className={`${styles.fromRight} nav__link`}><NavLink to={paths.PROFILE}>Profil</NavLink></li>
                        <li className={`${styles.fromLeft} nav__link`}><NavLink to={paths.LOGOUT}>Déconnexion</NavLink></li>
                    </>
                ) : (
                    <>
                        <li className={`${styles.fromRight} nav__link`}><NavLink to={paths.SIGNUP}>Inscription</NavLink></li>
                        <li className={`${styles.fromLeft} nav__link`}><NavLink to={paths.SIGNIN}>Connexion</NavLink></li>
                    </>
                )}
            </ul>
        </nav>
    );
}
