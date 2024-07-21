import React, { useEffect, useState } from 'react';
import styles from './Header.module.css';
import Navigation from '../Navigation/Navigation';
import HamburgerButton from "./HamburgerButton/HamburgerButton";

export default function Header() {

    const [isHamburgerOpen, setIsHamburgerOpen] = useState(false);

    const hamburgerClickHandler = () => {
        setIsHamburgerOpen(!isHamburgerOpen);
    }

    useEffect(() => {
        const hamburger = document.getElementById('hamburger');
        
        if (isHamburgerOpen) {
            hamburger.classList.add(styles.open);
            hamburger.removeEventListener('click', hamburgerClickHandler);
        } else {
            hamburger.classList.remove(styles.open);
        }
    }, [isHamburgerOpen])
    return (
        <header className={styles.header}>
            <div className={styles.navigationContainer}>
                <a href="" className={styles.title}>
                    RoadtripClub
                </a>
                <HamburgerButton hamburgerClickHandler={hamburgerClickHandler} styles={styles} />
            </div>
            <Navigation hamburgerState={isHamburgerOpen}/>
        </header>
    );
}

