import React from "react";
import styles from './Third.module.css';
import CarouselContainerTypeOne from "../../../containers/CarouselContainerTypeOne/CarouselContainerTypeOne";
import { carouselData } from "../../../config/HomeCarousel";

export default function Third() {
    return (
        <section className={`typical-section ${styles.section}`}>
            <h2 className={styles.title}>Découvre les roadtrippeurs</h2>
            <p className={styles.texte}>Une communauté qui a le sens du partage</p>
            { carouselData.map((data, id) => {
                return <CarouselContainerTypeOne data={data} key={id} />
            })}
        </section>
    )
}