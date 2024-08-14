import React from "react";
import styles from './Join.module.css';

export default function Join() {
    return (
        <section className={`${styles.section} typical-section`}>
            <h2 className={styles.title}>Envie de nous rejoindre ?</h2>
            <button className={`button ${styles.button}`}>S'inscrire</button>
        </section>
    )
}