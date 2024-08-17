import React from "react";
import styles from './Footer.module.css';
import logo  from '../../../images/logo/logo.svg';

export default function Footer() {
    return (
        <div className={`typical-section ${styles.section}`}>
            <img src={logo} alt="RoadtripClub logo" className={styles.logo}></img>
            <nav>
                <ul className={styles.navigation}>
                    <li><a>Accueil</a></li>
                    <li><a>Où voyager</a></li>
                    <li><a>Communauté</a></li>
                    <li><a>Connexion</a></li>
                    <li><a>Inscription</a></li>
                    <li><a>Cookies</a></li>
                    <li><a>Contact</a></li>
                </ul>
            </nav>
        </div>
    )

}