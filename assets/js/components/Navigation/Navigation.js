import React from "react";
import styles from './Navigation.module.css';
import { NavLink } from "react-router-dom";

export default function Navigation() {
    return (
        <nav>
            <ul className={styles.navigationList}>
                <li><NavLink to="/">Accueil</NavLink></li>
                <li><NavLink to="/destinations">Destinations</NavLink></li>
                <li><NavLink to="/community">Communauté</NavLink></li>
                <li><NavLink to="/sign-up">Inscription</NavLink></li>
                <li><NavLink to="/sign-in">Connexion</NavLink></li>
            </ul>
        </nav>
    )
}