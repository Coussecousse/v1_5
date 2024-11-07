import React from "react";
import styles from "./Third.module.css";

export default function Third() {
    return (
        <section className={`typical-section ${styles.section}`}>
            <div>
                <h2 className={styles.title}>Un large choix de roadtrips...</h2>
                {/* TODO carousel type two */}
            </div>
            <div>
                <h2 className={styles.title}>...et d'activités pour tous les goûts!</h2>
                {/* TODO carousel type two */}
            </div>

        </section>
    )
}