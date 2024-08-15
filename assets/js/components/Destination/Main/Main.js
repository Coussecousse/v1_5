import React from "react";
import styles from "./Main.module.css"

export default function Main() {
    return (
        <section className={`first-section ${styles.section}`}>
            <div className={styles.background}></div>
            <div className={styles.strip}></div>
            <h1>Test</h1>

        </section>
    )
}