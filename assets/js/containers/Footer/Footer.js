import React from "react";
import styles from './Footer.module.css';
import logo  from '../../../images/logo/logo.svg';
import paths from "../../config/paths";
import { Link } from "react-router-dom";

export default function Footer({ isAuthenticated }) {
    return (
        <div className={`typical-section ${styles.section}`}>
            <img src={logo} alt="RoadtripClub logo" className={styles.logo}></img>
            <nav>
                <ul className={styles.navigation}>
                    {!isAuthenticated ? (
                        <>
                            <li><Link to={paths.HOME}>Accueil</Link></li>
                            <li>
                                <Link to={paths.DESTINATIONS}>Où voyager</Link>
                            </li>
                            <li>
                                <Link to={paths.COMMUNITY}>Communauté</Link>
                            </li>
                            <li>
                                <Link to={paths.SIGNUP}>Inscription</Link>
                            </li>
                            <li>
                                <Link to={paths.SIGNIN}>Connexion</Link>
                            </li>
                        </>
                    ) : (
                        <>
                        <li>
                            <Link to={paths.ACTIVITIES}>Activités</Link>
                        </li>
                        <li>
                            <Link to={paths.PROFILE}>Profil</Link>
                        </li>
                        <li>
                            <Link to={paths.LOGOUT}>Deconnexion</Link>    
                        </li>
                        </>
                    )}
                    {/* <li><Link to={paths.CONTACT}>Contact</Link></li> */}
                    <li>
                        <Link to={paths.RULES}>Règles du site</Link>
                    </li>
                </ul>
            </nav>
            <small className={styles.accessibility}>Accessibilité : Site non conforme</small>
            <small className={styles.accessibility}>RoadtripClub s'engage à respecter votre vie privée et n'utilise donc que les cookies nécessaires au bon fonctionnement du site.</small>
        </div>
    )

}