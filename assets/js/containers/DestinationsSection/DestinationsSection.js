import React from "react";
import styles from './DestinationsSection.module.css';

export default function DestinationsSection({data, index}) {
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