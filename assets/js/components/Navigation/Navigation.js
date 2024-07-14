import React, { useEffect, useState } from "react";
import styles from './Navigation.module.css';
import { NavLink } from "react-router-dom";
import HamburgerButton from "./HamburgerButton/HamburgerButton";

export default function Navigation() {

    const [isHamburgerOpen, setIsHamburgerOpen] = useState(false);

    const hamburgerClickHandler = () => {
        setIsHamburgerOpen(!isHamburgerOpen);
    }

    useEffect(() => {
        if (isHamburgerOpen) {
            document.getElementById('hamburger').classList.add(styles.open);
        } else {
            document.getElementById('hamburger').classList.remove(styles.open);
        }
    }, [isHamburgerOpen])
    return (
        <>
            <HamburgerButton hamburgerClickHandler={hamburgerClickHandler} styles={styles} />
            <nav className={styles.navigationContainer}>
                <ul className={styles.navigationList}>
                    <li><NavLink to="/">Accueil</NavLink></li>
                    <li><NavLink to="/destinations">Destinations</NavLink></li>
                    <li><NavLink to="/community">Communauté</NavLink></li>
                    <li><NavLink to="/sign-up">Inscription</NavLink></li>
                    <li><NavLink to="/sign-in">Connexion</NavLink></li>
                </ul>
            </nav>
        </>
    )
}