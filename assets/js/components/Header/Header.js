import React from 'react';
import styles from './Header.module.css';
import Navigation from '../Navigation/Navigation';

export default function Header() {
    return (
        <header className={styles.header}>
            <a href="" className={styles.title}>
                RoadtripClub
            </a>
            <Navigation />
        </header>
    );
}

