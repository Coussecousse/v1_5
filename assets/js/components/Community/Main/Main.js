import React from "react";
import styles from './Main.module.css'; 

export default function Main() {
    return (
        <section className={`${styles.section} first-section`}>
            <div className={styles.backgroundImage}></div>
            <div className={styles.contentContainer}>
                <div className={styles.img}></div>
                <div className={styles.textContainer}>
                    <h1 className={styles.title}>Une communauté soudée</h1>
                    <p className={styles.paragraph}>Partage tes voyages et tes découvertes à travers le monde !</p>
                </div>
            </div>
        </section>
    )
}