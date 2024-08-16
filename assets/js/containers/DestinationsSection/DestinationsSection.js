import React, { useEffect } from "react";
import styles from './DestinationsSection.module.css';

export default function DestinationsSection({data, index, currentCountry}) {

    useEffect(() => {
        const activeSection = document.querySelector(`.${styles.section}.${styles.active}`);
        if (activeSection) {
            activeSection.style.display = 'none';
            activeSection.classList.remove(styles.active);
        }

        const newActiveSection = document.querySelector(`.${styles.section}[data-section="${currentCountry}"]`);
        newActiveSection.style.display = 'flex';
        
        setTimeout(() => {
            newActiveSection.classList.add(styles.active);
        }, 200);
    }, [currentCountry]);

    return (
        <div className={styles.section} data-section={index}>
            <div className={styles.textContainer}>
                <h2 className={styles.title}>{data.title}</h2>
                <p className={styles.paragraph}>{data.text}</p>
            </div>
            <div className={styles.imgContainer}>
                <div
                    className={styles.img}
                    style={{
                        backgroundImage : `url(${data.pic})`                }}>
                </div>
                <div className={styles.point}></div>
            </div>
        </div>
    )
}