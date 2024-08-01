import React from "react";
import styles from "./Main.module.css";

export default function Main() {
    return (
        <section className={styles.section}>
            <div className={styles.backgroundImage}></div>
            <div className={styles.content}>
                <h1 className={styles.title}>Préparez votre voyage<br/><span className={styles.secondTitle}>simplement</span><span className={styles.andTitle}> et </span><span className={styles.secondTitle}>rapidement</span></h1>
                <div className={styles.scroll}>
                    <div className={styles.compass}></div>
                    <span>scroll</span>
                </div>
            </div>
        </section>
    )
}