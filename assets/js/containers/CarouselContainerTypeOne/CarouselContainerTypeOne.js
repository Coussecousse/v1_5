import React from "react";
import styles from './CarouselContainerTypeOne.module.css';
import Carousel from "./Carousel/Carousel";


export default function CarouselContainerTypeOne({data}) {
    console.log(data.position);
    const position = !data.position ? styles.carouselRight : styles.carouselLeft;

    return (
        <div className={`${position} ${styles.carouselContainer}`}>
            <h3 className={styles.title}>{data.title}</h3>
            <Carousel data={data} styles={styles}/>
        </div>
    )
}