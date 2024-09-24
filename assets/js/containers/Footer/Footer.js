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
                            <Link to={paths.PROFILE}>Profil</Link>
                        </li>
                        <li>
                            <Link to={paths.LOGOUT}>Deconnexion</Link>    
                        </li>
                        </>
                    )}
                    <Link>Cookies</Link>
                    <Link>Contact</Link>
                </ul>
            </nav>
        </div>
    )

}