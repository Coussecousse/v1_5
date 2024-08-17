import React from "react";
import styles from "./Second.module.css";
import freedom from "../../../../images/Community/freedom.svg";
import exploration from "../../../../images/Community/exploration.svg";
import sharing from "../../../../images/Community/sharing.svg";

export default function Second() {
    return (
        <section className={`typical-section ${styles.section}`}>
            <div className={styles.container}>
                <div className={styles.textContainer}>
                  <img className={styles.img} src={freedom} alt="Camping-car"></img>
                  <p>Liberté</p>
                </div>
                <div className={styles.textContainer}>
                  <img className={styles.img} src={exploration} alt="Compass"></img>
                  <p>Exploration</p>
                </div>
                <div className={styles.textContainer}>
                  <img className={styles.img} src={sharing} alt="Hands holding the earth"></img>
                  <p>Partage</p>
                </div>
            </div>
        </section>
    )
}